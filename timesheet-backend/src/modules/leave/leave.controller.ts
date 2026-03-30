import { prisma } from '../../config/prisma';
import { notifyReportingManager, triggerNotification } from '../../services/notification.service';

// Utility to calculate dynamically accrued balance from transactions
const calculateLeaveBalance = async (employeeId: string, currentYear: number) => {
  const transactions = await prisma.leaveTransaction.findMany({
    where: { employeeId, year: currentYear }
  });

  let accrued = 0;
  let used = 0;
  let adjustment = 0;

  // Auto-accrue missing months up to current month based on 1.33 points/month (16 total/year)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const accruals = transactions.filter((t: any) => t.type === 'accrual');
  
  if (accruals.length < currentMonth) {
    const missingMonths = currentMonth - accruals.length;
    for (let i = 0; i < missingMonths; i++) {
      await prisma.leaveTransaction.create({
        data: {
          employeeId,
          type: 'accrual',
          amount: 16 / 12,
          reason: 'Monthly Accrual',
          year: currentYear
        }
      });
    }
  }

  // Reketch and calculate
  const finalTransactions = await prisma.leaveTransaction.findMany({
    where: { employeeId, year: currentYear }
  });

  finalTransactions.forEach((t: any) => {
     if (t.type === 'accrual') accrued += t.amount;
     else if (t.type === 'used') used += t.amount;
     else if (t.type === 'adjustment') adjustment += t.amount;
  });

  let kpiScore = 100;
  // Calculate Leave Discipline KPI: ((16 - used) / 16) * 100
  // Max allowed per year = 16
  kpiScore = Math.max(0, ((16 - used) / 16) * 100);

  return {
    accrued: parseFloat(accrued.toFixed(2)),
    used: parseFloat(used.toFixed(2)),
    adjustment: parseFloat(adjustment.toFixed(2)),
    available: parseFloat((accrued - used + adjustment).toFixed(2)),
    kpiScore: parseFloat(kpiScore.toFixed(1))
  };
};

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

    // Validate against available balance
    const currentYear = new Date().getFullYear();
    const balance = await calculateLeaveBalance(user.id, currentYear);
    
    if (parseFloat(totalDays) > balance.available) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot exceed available leave balance. Available: ${balance.available} Days` 
      });
    }

    let status = 'pending';
    if (['Partner', 'Admin', 'Owner'].includes(user.role)) {
      status = 'auto_approved';
    }

    const newLeave = await prisma.leave.create({
      data: {
        leaveId,
        type,
        reason,
        duration,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        totalDays: parseFloat(totalDays),
        employeeId: user.id,
        status
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

    if (status === 'auto_approved') {
      await prisma.leaveTransaction.create({
        data: {
          employeeId: user.id,
          type: 'used',
          amount: parseFloat(totalDays),
          reason: `Auto approved leave: ${leaveId}`,
          year: currentYear
        }
      });
    }

    const employeeName = `${newLeave.employee.firstName} ${newLeave.employee.lastName || ''}`.trim();
    if (status !== 'auto_approved') {
      await notifyReportingManager(
        user.id,
        'Leave Application 🏖️',
        `${employeeName} applied for leave from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
        'leave',
        `/approvals/leaves`
      );
    }

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

    const existingLeave = await prisma.leave.findUnique({ where: { id } });
    if (!existingLeave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Check if user has permission to approve/reject
    if (!['Admin', 'Manager', 'Partner', 'Owner'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let newStatus = status;
    let isFinalApproval = false;

    if (['Admin', 'Partner', 'Owner'].includes(user.role)) {
      if (status === 'approved') {
        newStatus = 'partner_approved';
        isFinalApproval = true;
      }
    } else if (user.role === 'Manager') {
      if (status === 'approved') {
        newStatus = 'manager_approved';
      }
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: newStatus,
        approvedBy: user.id,
        approvedDate: isFinalApproval ? new Date() : null
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

    if (isFinalApproval) {
      // Record user transaction for approved leaves
      await prisma.leaveTransaction.create({
        data: {
          employeeId: updatedLeave.employeeId,
          type: 'used',
          amount: updatedLeave.totalDays,
          reason: `Approved leave: ${updatedLeave.leaveId}`,
          year: new Date().getFullYear()
        }
      });
    }

    await triggerNotification({
      userId: updatedLeave.employeeId,
      title: `Leave ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: `Your leave application for ${updatedLeave.totalDays} days has been marked as ${newStatus.replace('_', ' ')}.`,
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
    
    // Fallback: If user.id isn't complete, we could fetch employee object
    let targetEmployeeId = user.id;

    const currentYear = new Date().getFullYear();
    const balance = await calculateLeaveBalance(targetEmployeeId, currentYear);

    res.json({
      success: true,
      data: balance,
      message: 'Leave balance retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch leave balance',
      details: error.message 
    });
  }
};

export const adjustLeave = async (req: any, res: any) => {
  try {
     const user = req.user;
     const { employeeId, amount, reason } = req.body;
     
     if (!['Admin', 'Partner', 'Manager'].includes(user.role)) {
       return res.status(403).json({ error: 'Insufficient permissions' });
     }

     if (!employeeId || amount === undefined || !reason) {
       return res.status(400).json({ error: 'Employee ID, amount, and reason are required' });
     }

     await prisma.leaveTransaction.create({
        data: {
           employeeId,
           type: 'adjustment',
           amount: parseFloat(amount),
           reason,
           year: new Date().getFullYear()
        }
     });

     res.json({
        success: true,
        message: 'Leave balance adjusted successfully'
     });
  } catch (error: any) {
    console.error('Error adjusting leave:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust leave balance' });
  }
};


