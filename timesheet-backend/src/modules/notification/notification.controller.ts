import { Response } from 'express';
import { prisma } from '../../config/prisma';

// Get notifications for a user
export const getNotifications = async (req: any, res: Response) => {
  try {
    // If no user in request, return empty notifications
    if (!req.user || !req.user.id) {
      console.log('❌ No user found in notification request');
      return res.json({
        success: true,
        data: [],
        message: 'Notifications retrieved successfully'
      });
    }
    
    const userId = req.user.id;
    console.log('🔍 Fetching notifications for userId:', userId);
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to latest 50 notifications
    });

    res.json({
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Create a new notification
export const createNotification = async (req: any, res: Response) => {
  try {
    const { message, type, userId, relatedId, actionUrl } = req.body;

    const notification = await prisma.notification.create({
      data: {
        message,
        type,
        userId,
        relatedId,
        actionUrl,
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: { 
        id, 
        userId // Ensure user can only mark their own notifications
      },
      data: { isRead: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.deleteMany({
      where: { 
        id, 
        userId // Ensure user can only delete their own notifications
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get unread count
export const getUnreadCount = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        isRead: false
      },
    });

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread count retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Approve employee from notification
export const approveEmployeeFromNotification = async (req: any, res: Response) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.id;

    console.log('🔔 Approving employee from notification:', { employeeId, userId });

    // Check if user has admin/manager role
    const currentUser = await prisma.employee.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!currentUser || !['admin', 'manager', 'partner', 'owner'].includes(currentUser.role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve employees'
      });
    }

    // Approve the employee
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { status: 'active' },
      include: {
        profile: true
      }
    });

    // Create notification for the approved employee
    await prisma.notification.create({
      data: {
        userId: employeeId,
        message: 'Your account has been approved! You can now login to the system.',
        type: 'approval',
        relatedId: employeeId,
        actionUrl: '/login'
      }
    });

    // Mark the original notification as read
    await prisma.notification.updateMany({
      where: {
        userId,
        type: 'employee_approval',
        relatedId: employeeId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Employee approved successfully',
      data: employee
    });
  } catch (error: any) {
    console.error('Error approving employee from notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve employee',
      error: error.message
    });
  }
};
