import { Router } from 'express';
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  approveEmployeeFromNotification
} from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Notification CRUD operations
router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.delete('/:id', deleteNotification);
router.get('/unread-count', getUnreadCount);

// Approval actions from notifications
router.post('/approve-employee', approveEmployeeFromNotification);

export default router;
