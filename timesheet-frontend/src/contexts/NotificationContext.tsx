import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import API from '../api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  relatedId?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  filter: string;
  isLoading: boolean;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

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
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      const newUnreadCountAfterRemoval = removedNotification && !removedNotification.isRead 
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: newUnreadCountAfterRemoval,
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
  setFilter: (filter: string) => void;
  fetchNotifications: () => void;
  playNotificationSound: () => void;
  removeNotification: (id: string) => void;
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
  const { isAuthenticated, loading: authLoading } = useAuth();

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

  const setFilter = (filter: string) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const removeNotification = async (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    try {
      await API.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const fetchNotifications = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.get('/notifications');
      if (response.data.success) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data.data });
      }
    } catch (error: any) {
      console.warn('⚠️ Could not fetch notifications (Server may be down):', error.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch notifications on mount - only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Setup Socket.io for Real-Time Updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to Backend Socket Server
    // Note: Assuming API base URL is structured as http://host:port/api. We just want http://host:port
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : window.location.origin.replace(':5173', ':5000');
    
    const socket: Socket = io(socketUrl, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Notification Socket');
      
      // We retrieve user ID from token or auth context. Since we use `useAuth`, let's get it:
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          socket.emit('join_user_room', userObj.id);
        } catch (e) {}
      }
    });

    socket.on('new_notification', (notification) => {
      // Add live notification state
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      playNotificationSound();
      toast.info(notification.title || 'New Notification', {
        label: 'View',
        onClick: () => {
          if (notification.actionUrl) window.location.href = notification.actionUrl;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const value: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    setFilter,
    fetchNotifications,
    playNotificationSound,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
