import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { notifyReportingManager, triggerNotification } from '../../services/notification.service';

/**
 * Validates if a string is a valid UUID to prevent PostgreSQL query errors.
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Utility to calculate dynamically accrued balance from transactions
const calculateLeaveBalance = async (employeeId: string, currentYear: number) => {
  if (!employeeId || !isValidUUID(employeeId)) {
    throw new Error('Invalid employee ID provided for balance calculation');
  }

  console.log(`Calculating leave balance: Employee ${employeeId}, Year ${currentYear}`);
  
  // Find all transactions for this employee and year
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
      try {
        await prisma.leaveTransaction.create({
          data: {
            employeeId,
            type: 'accrual',
            amount: 16 / 12,
            reason: 'Monthly Accrual',
            year: currentYear
          }
        });
      } catch (err) {
        console.error(`Failed to create accrual transaction: ${err}`);
      }
    }
  }

  // Reketch and calculate final totals
  const finalTransactions = await prisma.leaveTransaction.findMany({
    where: { employeeId, year: currentYear }
  });

  finalTransactions.forEach((t: any) => {
     if (t.type === 'accrual') accrued += t.amount || 0;
     else if (t.type === 'used') used += t.amount || 0;
     else if (t.type === 'adjustment') adjustment += t.amount || 0;
  });

  // Calculate Leave Discipline KPI: ((16 - used) / 16) * 100
  // Max allowed per year = 16
  const kpiScore = Math.max(0, ((16 - used) / 16) * 100);

  return {
    accrued: parseFloat(accrued.toFixed(2)),
    used: parseFloat(used.toFixed(2)),
    adjustment: parseFloat(adjustment.toFixed(2)),
    available: parseFloat((accrued - used + adjustment).toFixed(2)),
    kpiScore: parseFloat(kpiScore.toFixed(1))
  };
};

// Get leave records based on user role
export const getLeaves = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
       return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const { type, status, dateFrom, dateTo, employeeId } = req.query;

    const where: any = {};
    const isAdminOrPartner = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    // Employee filter logic
    if (isAdminOrPartner) {
      if (employeeId && String(employeeId).trim() !== '' && isValidUUID(String(employeeId))) {
        where.employeeId = String(employeeId);
      }
    } else if (user.role === 'Manager') {
      const targetId = String(employeeId || '').trim();
      if (targetId !== '' && isValidUUID(targetId)) {
        where.employeeId = targetId;
        // Optional: verify if manager is assigned to this employee
      } else {
        const teamEmployees = await prisma.employee.findMany({
          where: {
            OR: [
              { reportingManager: user.officeEmail || user.email },
              { reportingPartner: user.officeEmail || user.email }
            ]
          },
          select: { id: true }
        });
        where.employeeId = {
          in: [...teamEmployees.map(emp => emp.id), user.id]
        };
      }
    } else {
      where.employeeId = user.id;
    }

    // Status Filter
    if (status && status !== 'All Status' && String(status).trim() !== '') {
      where.status = String(status).toLowerCase();
    }

    // Type Filter
    if (type && type !== 'All Types' && String(type).trim() !== '') {
      where.type = String(type);
    }
    
    // Date Filtering
    if (dateFrom && dateTo && String(dateFrom).trim() !== '' && String(dateTo).trim() !== '') {
      const start = new Date(String(dateFrom));
      const end = new Date(String(dateTo));
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.fromDate = { gte: start };
        where.toDate = { lte: end };
      }
    } else if (dateFrom && String(dateFrom).trim() !== '') {
      const start = new Date(String(dateFrom));
      if (!isNaN(start.getTime())) where.fromDate = { gte: start };
    } else if (dateTo && String(dateTo).trim() !== '') {
      const end = new Date(String(dateTo));
      if (!isNaN(end.getTime())) where.toDate = { lte: end };
    }

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

    return res.json({
      success: true,
      data: leaves,
      message: 'Leaves retrieved successfully'
    });
  } catch (error: any) {
    console.error("🔥 [getLeaves] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching leaves",
      error: error.message
    });
  }
};

// Create new leave request
export const createLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
       return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { type, reason, duration, fromDate, toDate, totalDays } = req.body;
    if (!type || !fromDate || !toDate || totalDays === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate unique leave ID
    const count = await prisma.leave.count();
    const leaveId = `LV-${String(count + 1).padStart(3, '0')}`;

    // Validate against available balance
    const currentYear = new Date().getFullYear();
    const balance = await calculateLeaveBalance(user.id, currentYear);
    const parsedTotalDays = parseFloat(totalDays);
    
    if (parsedTotalDays > balance.available) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient leave balance. Available: ${balance.available} Days` 
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
        reason: reason || '',
        duration: duration || 'full_day',
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        totalDays: parsedTotalDays,
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
          amount: parsedTotalDays,
          reason: `Auto approved leave: ${leaveId}`,
          year: currentYear
        }
      });
    } else {
      const employeeName = `${newLeave.employee.firstName} ${newLeave.employee.lastName || ''}`.trim();
      await notifyReportingManager(
        user.id,
        'Leave Application 🏖️',
        `${employeeName} applied for leave: ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`,
        'leave',
        `/approvals/leaves`
      );
    }

    return res.status(201).json({
      success: true,
      data: newLeave,
      message: 'Leave request submitted successfully'
    });
  } catch (error: any) {
    console.error("🔥 [createLeave] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating leave",
      error: error.message
    });
  }
};

// Update leave status (approve/reject)
export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const existingLeave = await prisma.leave.findUnique({ where: { id } });
    if (!existingLeave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (!['Admin', 'Manager', 'Partner', 'Owner'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    let newStatus = status;
    let isFinalApproval = false;

    if (['Admin', 'Partner', 'Owner'].includes(user.role)) {
      if (status === 'approved') {
        newStatus = 'partner_approved';
        isFinalApproval = true;
      }
    } else if (user.role === 'Manager') {
      if (status === 'approved') newStatus = 'manager_approved';
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: newStatus,
        approvedBy: user.id,
        approvedDate: isFinalApproval ? new Date() : null
      },
      include: { employee: true }
    });

    if (isFinalApproval) {
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
      title: `Leave ${String(newStatus).replace('_', ' ').toUpperCase()}`,
      message: `Your leave for ${updatedLeave.totalDays} days has been ${String(newStatus).replace('_', ' ')}.`,
      type: 'leave',
      actionUrl: '/leave-management'
    });

    return res.json({ success: true, data: updatedLeave, message: 'Status updated' });
  } catch (error: any) {
    console.error("🔥 [updateLeaveStatus] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error updating status" });
  }
};

// Cancel/delete leave request
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid ID format' });

    const leave = await prisma.leave.findUnique({ where: { id } });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (leave.employeeId !== user.id && !['Admin', 'Partner', 'Owner'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    }

    await prisma.leave.delete({ where: { id } });
    return res.json({ success: true, message: 'Leave cancelled' });
  } catch (error: any) {
    console.error("🔥 [deleteLeave] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error deleting leave" });
  }
};

// Get leave balance for current user or targeted user
export const getLeaveBalance = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) return res.status(401).json({ success: false, message: "Unauthorized" });

    const employeeIdFromQuery = String(req.query.employeeId || '').trim();
    let targetEmployeeId = user.id;

    const isAdmin = ['Admin', 'Partner', 'Owner', 'Manager'].includes(user.role);
    if (isAdmin && employeeIdFromQuery !== '' && isValidUUID(employeeIdFromQuery)) {
      targetEmployeeId = employeeIdFromQuery;
    }

    const currentYear = new Date().getFullYear();
    const balance = await calculateLeaveBalance(targetEmployeeId, currentYear);

    return res.json({
      success: true,
      data: balance,
      message: 'Leave balance retrieved successfully'
    });
  } catch (error: any) {
    console.error("🔥 [getLeaveBalance] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching balance",
      error: error.message
    });
  }
};

// Admin/Manager adjustment of leave balance
export const adjustLeave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId, amount, reason } = req.body;

    if (!['Admin', 'Partner', 'Manager', 'Owner'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (!employeeId || !isValidUUID(employeeId) || amount === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Invalid data provided' });
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

    return res.json({ success: true, message: 'Adjustment recorded' });
  } catch (error: any) {
    console.error("🔥 [adjustLeave] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error adjusting balance" });
  }
};


