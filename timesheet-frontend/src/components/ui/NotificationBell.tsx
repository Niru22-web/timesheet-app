import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import API from '../../api';
import { useToast } from '../../contexts/ToastContext';

const NotificationBell: React.FC = () => {
  const { state, markAsRead, markAllAsRead, setFilter, fetchNotifications, removeNotification } = useNotifications();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApproveEmployee = async (employeeId: string, notificationId: string) => {
    try {
      setApproving(employeeId);
      await API.post('/notifications/approve-employee', { employeeId });
      
      // Immediately remove the notification from UI
      removeNotification(notificationId);
      
      // Show success toast
      toast.success('Employee approved successfully');
      
      // Optional: Refresh notifications to ensure sync
      await fetchNotifications();
    } catch (error) {
      console.error('Error approving employee:', error);
      toast.error('Failed to approve employee');
    } finally {
      setApproving(null);
    }
  };

  const getFilteredNotifications = () => {
    if (state.filter === 'all') {
      return state.notifications;
    }
    return state.notifications.filter(n => n.type === state.filter);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approval':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'alert':
      case 'system':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'birthday':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'timesheet':
      case 'leave':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-xl transition-all duration-300"
        title="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {state.unreadCount > 0 && (
          <span className="absolute max-w-[2rem] truncate right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transform translate-x-1/2 -translate-y-1/2">
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <div 
        className={`absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-secondary-100 z-50 transform origin-top-right transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-secondary-100 bg-secondary-50/50 rounded-t-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pointer-events-auto">
            <h3 className="font-black text-secondary-900 tracking-tight">Activity Log</h3>
            {state.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-bold uppercase tracking-wider transition-colors"
              >
                Clear Unread
              </button>
            )}
          </div>
          
          {/* Quick Filter */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar pointer-events-auto">
             {['all', 'task', 'approval', 'system', 'birthday'].map(cat => (
               <button 
                  key={cat}
                  onClick={() => setFilter(cat as any)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors border ${state.filter === cat || (state.filter.toLowerCase() === cat) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-secondary-500 border-secondary-200 hover:bg-secondary-50 hover:text-secondary-800'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pointer-events-auto bg-white">
          {state.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-secondary-400 font-bold tracking-widest uppercase">Syncing alerts...</p>
            </div>
          ) : getFilteredNotifications().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                <BellIcon className="w-6 h-6 text-secondary-300" />
              </div>
              <p className="text-sm font-bold text-secondary-700">You're all caught up</p>
              <p className="text-xs text-secondary-500 mt-1">No new notifications in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-50">
              {getFilteredNotifications().slice(0, 15).map((notification: any) => (
                <div
                  key={notification.id}
                  onClick={() => notification.type !== 'employee_approval' ? handleNotificationClick(notification) : undefined}
                  className={`px-5 py-4 transition-all duration-200 group flex items-start space-x-4 ${!notification.isRead ? 'bg-primary-50/40 hover:bg-primary-50/80' : 'hover:bg-secondary-50'} ${notification.type === 'employee_approval' ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getTypeColor(notification.type)}`}>
                      {notification.type === 'employee_approval' && <UserPlusIcon className="w-3 h-3 mr-1" />}
                      {notification.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm tracking-tight leading-snug mb-0.5 ${!notification.isRead ? 'font-bold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                      {notification.title || notification.message}
                    </p>
                    {notification.title && (
                       <p className={`text-xs line-clamp-2 ${!notification.isRead ? 'text-secondary-600' : 'text-secondary-500'}`}>
                         {notification.message}
                       </p>
                    )}
                    
                    {/* Approval buttons for employee approval notifications */}
                    {notification.type === 'employee_approval' && notification.relatedId && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveEmployee(notification.relatedId, notification.id);
                          }}
                          disabled={approving === notification.relatedId}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {approving === notification.relatedId ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-3 h-3" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Immediately remove from UI and mark as read
                            removeNotification(notification.id);
                            markAsRead(notification.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors"
                        >
                          <XMarkIcon className="w-3 h-3" />
                          Dismiss
                        </button>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-secondary-400 mt-1 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                       {formatTimeAgo(notification.createdAt)}
                       {!notification.isRead && <span className="w-1.5 h-1.5 bg-primary-600 rounded-full inline-block" />}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Link */}
        {getFilteredNotifications().length > 0 && (
          <div className="px-5 py-3 border-t border-secondary-100 bg-secondary-50/30 rounded-b-2xl pointer-events-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs font-black text-secondary-500 hover:text-primary-600 uppercase tracking-widest transition-colors py-1"
            >
              View Dashboard Complete History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
