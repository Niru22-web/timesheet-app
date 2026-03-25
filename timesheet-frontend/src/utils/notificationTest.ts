import { useNotifications } from '../contexts/NotificationContext';
import { useToast } from '../contexts/ToastContext';

export const createTestNotifications = () => {
  const { addNotification } = useNotifications();
  const toast = useToast();

  const createTaskNotification = () => {
    addNotification({
      message: 'New task assigned: Complete project documentation',
      type: 'Task',
      userId: 'current-user-id', // This would come from auth context
      actionUrl: '/tasks/123'
    });
  };

  const createApprovalNotification = () => {
    addNotification({
      message: 'Timesheet approval pending for John Doe',
      type: 'Approval',
      userId: 'current-user-id',
      actionUrl: '/timesheet/approvals'
    });
  };

  const createAlertNotification = () => {
    addNotification({
      message: 'System maintenance scheduled for tonight',
      type: 'Alert',
      userId: 'current-user-id'
    });
  };

  const testToastNotifications = () => {
    toast.success('Task completed successfully!');
    toast.warning('Deadline approaching in 2 days');
    toast.error('Failed to save changes');
    toast.info('New update available');
  };

  return {
    createTaskNotification,
    createApprovalNotification,
    createAlertNotification,
    testToastNotifications
  };
};
