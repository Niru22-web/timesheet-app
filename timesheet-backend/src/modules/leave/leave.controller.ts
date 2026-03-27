import { prisma } from '../../config/prisma';
import { notifyReportingManager, triggerNotification } from '../../services/notification.service';

// Get leave records based on user role
export const getLeaves = async (req: any, res: any) => {
  try {
    const user = req.user;
    const { type, status, dateFrom, dateTo, employeeId } = req.query;

    const where: any = {};
    
    // Role-based filtering
    if (['Admin', 'Partner'].includes(user.role)) {
      // Admins and Partners can see all leaves
      if (employeeId) where.employeeId = employeeId;
    } else if (user.role === 'Manager') {
      // Managers can see team leaves
      if (employeeId) {
        where.employeeId = employeeId;
      } else {
        // Get employees reporting to this manager
        const teamEmployees = await prisma.employee.findMany({
          where: {
            OR: [
              { reportingManager: user.email },
              { reportingPartner: user.email }
            ]
          },
          select: { id: true }
        });
        where.employeeId = {
          in: [...teamEmployees.map(emp => emp.id), user.id]
        };
      }
    } else {
      // Employees can only see their own leaves
      where.employeeId = user.id;
    }

    // Apply filters
    if (type && type !== 'All Types') where.type = type;
    if (status && status !== 'All Status') where.status = status.toLowerCase();
    if (dateFrom) where.fromDate = { gte: new Date(dateFrom) };
    if (dateTo) where.toDate = { lte: new Date(dateTo) };

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      },
      orderBy: { appliedDate: 'desc' }
    });

    res.json({
      success: true,
      data: leaves,
      message: 'Leaves retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch leaves' 
    });
  }
};

// Create new leave request
export const createLeave = async (req: any, res: any) => {
  try {
    const user = req.user;
    const { type, reason, duration, fromDate, toDate, totalDays } = req.body;

    // Generate unique leave ID
    const count = await prisma.leave.count();
    const leaveId = `LV-${String(count + 1).padStart(3, '0')}`;

    const newLeave = await prisma.leave.create({
      data: {
        leaveId,
        type,
        reason,
        duration,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        totalDays: parseFloat(totalDays),
        employeeId: user.id
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    const employeeName = `${newLeave.employee.firstName} ${newLeave.employee.lastName || ''}`.trim();
    await notifyReportingManager(
      user.id,
      'Leave Application 🏖️',
      `${employeeName} applied for leave from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
      'leave',
      `/approvals/leaves`
    );

    res.status(201).json({
      success: true,
      data: newLeave,
      message: 'Leave request created successfully'
    });
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create leave request' 
    });
  }
};

// Update leave status (approve/reject)
export const updateLeaveStatus = async (req: any, res: any) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // Check if user has permission to approve/reject
    if (!['Admin', 'Manager', 'Partner'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: user.id,
        approvedDate: status === 'approved' ? new Date() : null
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    if (status === 'approved') {
      await updateLeaveBalance(updatedLeave.employeeId, updatedLeave.totalDays);
    }

    await triggerNotification({
      userId: updatedLeave.employeeId,
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your leave application for ${updatedLeave.totalDays} days has been ${status}.`,
      type: 'leave',
      actionUrl: '/leave-management'
    });

    res.json({
      success: true,
      data: updatedLeave,
      message: `Leave ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update leave status' 
    });
  }
};

// Cancel/delete leave request
export const deleteLeave = async (req: any, res: any) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Check if leave exists and user has permission
    const leave = await prisma.leave.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Users can only cancel their own pending requests
    // Admins can cancel any pending request
    if (leave.employeeId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending leave requests' });
    }

    await prisma.leave.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel leave request' 
    });
  }
};

// Get leave balance for current user
export const getLeaveBalance = async (req: any, res: any) => {
  try {
    const user = req.user;
    
    console.log('Leave balance request - User ID:', user.id);
    console.log('Leave balance request - Employee ID:', user.employeeId);

    const currentYear = new Date().getFullYear();
    
    let leaveBalance = await prisma.leaveBalance.findFirst({
      where: { 
        employeeId: user.employeeId,
        year: currentYear 
      }
    });

    console.log('Found leave balance:', leaveBalance);

    // If no balance exists, create one with default values
    if (!leaveBalance) {
      console.log('Creating new leave balance for employee:', user.employeeId, 'year:', currentYear);
      leaveBalance = await prisma.leaveBalance.create({
        data: {
          employeeId: user.employeeId,
          year: currentYear,
          totalLeaves: 21, // Default 21 days per year
          usedLeaves: 0,
          remainingLeaves: 21
        }
      });
      console.log('Created new leave balance:', leaveBalance);
    }

    // Transform to match frontend expectations
    const transformedBalance = {
      openingBalance: leaveBalance.totalLeaves,
      leavesEarned: 0,
      leavesTaken: leaveBalance.usedLeaves,
      closingBalance: leaveBalance.remainingLeaves
    };

    res.json({
      success: true,
      data: transformedBalance,
      message: 'Leave balance retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? { id: req.user.id, email: req.user.email } : 'No user'
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch leave balance',
      details: error.message 
    });
  }
};

// Update leave balance when leave is approved
const updateLeaveBalance = async (employeeId: string, daysTaken: number) => {
  try {
    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findFirst({
      where: { 
        employeeId,
        year: currentYear 
      }
    });

    if (!balance) {
      // Create balance record if it doesn't exist
      await prisma.leaveBalance.create({
        data: {
          employeeId,
          year: currentYear,
          totalLeaves: 21,
          usedLeaves: daysTaken,
          remainingLeaves: 21 - daysTaken
        }
      });
    } else {
      // Update existing balance by ID
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          usedLeaves: balance.usedLeaves + daysTaken,
          remainingLeaves: balance.remainingLeaves - daysTaken,
          updatedAt: new Date()
        }
      });
    }
  } catch (error: any) {
    console.error('Error updating leave balance:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      employeeId,
      daysTaken
    });
  }
};

// Initialize leave balance for all employees (utility function)
export const initializeLeaveBalances = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const employees = await prisma.employee.findMany({
      where: {
        leaveBalance: null
      }
    });

    for (const employee of employees) {
      await prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          year: currentYear,
          totalLeaves: 21,
          usedLeaves: 0,
          remainingLeaves: 21
        }
      });
    }

    console.log(`Initialized leave balances for ${employees.length} employees`);
  } catch (error: any) {
    console.error('Error initializing leave balances:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};
