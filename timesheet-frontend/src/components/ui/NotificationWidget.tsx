import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, CakeIcon, ClockIcon, UserPlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import API from '../../api';
import { useToast } from '../../contexts/ToastContext';

const NotificationWidget: React.FC = () => {
  const { state, markAsRead, fetchNotifications, removeNotification } = useNotifications();
  const toast = useToast();
  const [approving, setApproving] = useState<string | null>(null);

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

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'approval':
      case 'employee_approval':
        return <UserPlusIcon className="w-5 h-5 text-yellow-500" />;
      case 'system':
      case 'alert':
        return <InformationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'birthday':
        return <CakeIcon className="w-5 h-5 text-fuchsia-500" />;
      case 'timesheet':
      case 'leave':
        return <ClockIcon className="w-5 h-5 text-emerald-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task': return 'bg-blue-50';
      case 'approval':
      case 'employee_approval': return 'bg-yellow-50';
      case 'system':
      case 'alert': return 'bg-red-50';
      case 'birthday': return 'bg-fuchsia-50';
      case 'timesheet':
      case 'leave': return 'bg-emerald-50';
      default: return 'bg-secondary-50';
    }
  };

  // Only show the latest 5 unread, or total 5
  const recentNotifications = state.notifications.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/30">
        <h3 className="font-bold text-secondary-900 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-secondary-500" />
          Notifications
        </h3>
        {state.unreadCount > 0 && (
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {state.unreadCount} Unread
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {state.isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-secondary-500">
             <BellIcon className="w-8 h-8 opacity-20 mb-2" />
             <p className="text-sm font-medium">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-50">
            {recentNotifications.map((notif: any) => (
              <div 
                key={notif.id}
                onClick={() => {
                  if (notif.type !== 'employee_approval') {
                    if (!notif.isRead) markAsRead(notif.id);
                    if (notif.actionUrl) window.location.href = notif.actionUrl;
                  }
                }}
                className={`flex gap-3 p-4 transition-colors hover:bg-secondary-50 ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
              >
                <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${getBgColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm truncate pr-2 ${!notif.isRead ? 'font-bold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                      {notif.title || notif.type}
                    </p>
                    <span className="text-[10px] font-semibold text-secondary-400 whitespace-nowrap pt-0.5 flex-shrink-0">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${!notif.isRead ? 'text-secondary-700' : 'text-secondary-500'}`}>
                    {notif.message}
                  </p>
                  
                  {/* Approval buttons for employee approval notifications */}
                  {notif.type === 'employee_approval' && notif.relatedId && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveEmployee(notif.relatedId, notif.id);
                        }}
                        disabled={approving === notif.relatedId}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {approving === notif.relatedId ? (
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
                          removeNotification(notif.id);
                          markAsRead(notif.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {state.notifications.length > 5 && (
         <div className="p-3 border-t border-secondary-100 bg-secondary-50/50 text-center">
            <button className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors">
               View All Activity
            </button>
         </div>
      )}
    </div>
  );
};

export default NotificationWidget;
