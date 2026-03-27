import { prisma } from '../config/prisma';
import { getIO } from './socket.service';

interface TriggerNotificationProps {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  actionUrl?: string;
}

export const triggerNotification = async ({
  userId,
  title,
  message,
  type,
  relatedId,
  actionUrl
}: TriggerNotificationProps) => {
  try {
    // 1. Create in DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId,
        actionUrl
      }
    });

    // 2. Emit Realtime Event
    const io = getIO();
    if (io) {
      // Broadcast to the user's specific room
      io.to(userId).emit('new_notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error(`❌ Failed to trigger notification for User ${userId}`, error);
    return null;
  }
};

// HELPER TRIGGERS

export const notifyAdmins = async (title: string, message: string, type: string, actionUrl?: string, relatedId?: string) => {
  // Get all admin-level users
  const admins = await prisma.employee.findMany({ 
    where: { 
      role: {
        in: ['Admin', 'Manager', 'Partner', 'Owner', 'admin', 'manager', 'partner', 'owner']
      }
    } 
  });
  
  for (const admin of admins) {
    await triggerNotification({
      userId: admin.id,
      title,
      message,
      type,
      relatedId,
      actionUrl
    });
  }
};

export const notifyReportingManager = async (employeeId: string, title: string, message: string, type: string, actionUrl?: string) => {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.reportingManager) return;

  const manager = await prisma.employee.findFirst({ 
    where: { 
      employeeId: employee.reportingManager // match the reporting manager badge string (e.g. EMP002)
    } 
  });
  
  if (manager) {
    await triggerNotification({
      userId: manager.id,
      title,
      message,
      type,
      actionUrl
    });
  }
};
