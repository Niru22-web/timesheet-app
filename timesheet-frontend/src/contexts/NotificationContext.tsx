import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import API from '../api';
import { useToast } from './ToastContext';

export interface Notification {
  id: string;
  message: string;
  type: 'Task' | 'Approval' | 'Alert';
  isRead: boolean;
  createdAt: string;
  userId?: string;
  relatedId?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  filter: 'all' | 'Task' | 'Approval' | 'Alert';
  isLoading: boolean;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SET_FILTER'; payload: 'all' | 'Task' | 'Approval' | 'Alert' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  filter: 'all',
  isLoading: false,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      const newUnreadCount = newNotifications.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    case 'SET_NOTIFICATIONS':
      const fetchedUnreadCount = action.payload.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount: fetchedUnreadCount,
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
};

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: 'all' | 'Task' | 'Approval' | 'Alert') => void;
  fetchNotifications: () => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const toast = useToast();

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: try with different sound or silent fail
        console.log('Could not play notification sound');
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    playNotificationSound();
    
    // Show toast based on notification type
    switch (notification.type) {
      case 'Task':
        toast.info(notification.message, {
          label: 'View Task',
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        });
        break;
      case 'Approval':
        toast.warning(notification.message, {
          label: 'Review',
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        });
        break;
      case 'Alert':
        toast.error(notification.message, {
          label: 'View Details',
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }
        });
        break;
      default:
        toast.info(notification.message);
    }
  };

  const markAsRead = async (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    try {
      await API.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    try {
      await API.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const setFilter = (filter: 'all' | 'Task' | 'Approval' | 'Alert') => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const fetchNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.get('/notifications');
      if (response.data.success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch notifications on mount - only if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
    } else {
      console.log('📋 No token found, skipping notification fetch');
    }
  }, []);

  // Setup polling for real-time updates (fallback if no socket.io) - only if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('📋 No token found, skipping notification polling');
      return;
    }
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    setFilter,
    fetchNotifications,
    playNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
