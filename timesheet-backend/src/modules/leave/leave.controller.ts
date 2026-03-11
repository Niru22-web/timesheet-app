import { prisma } from '../../config/prisma';

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

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leaves' });
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

    res.json(newLeave);
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
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

    // If leave is approved, update leave balance
    if (status === 'approved') {
      await updateLeaveBalance(updatedLeave.employeeId, updatedLeave.totalDays);
    }

    res.json(updatedLeave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: 'Failed to update leave status' });
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

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
};

// Get leave balance for current user
export const getLeaveBalance = async (req: any, res: any) => {
  try {
    const user = req.user;

    let leaveBalance = await prisma.leaveBalance.findUnique({
      where: { employeeId: user.id }
    });

    // If no balance exists, create one with default values
    if (!leaveBalance) {
      leaveBalance = await prisma.leaveBalance.create({
        data: {
          employeeId: user.id,
          openingBalance: 12, // Default 12 days per year
          leavesEarned: 0,
          leavesTaken: 0,
          closingBalance: 12
        }
      });
    }

    res.json(leaveBalance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};

// Update leave balance when leave is approved
const updateLeaveBalance = async (employeeId: string, daysTaken: number) => {
  try {
    const balance = await prisma.leaveBalance.findUnique({
      where: { employeeId }
    });

    if (!balance) {
      // Create balance record if it doesn't exist
      await prisma.leaveBalance.create({
        data: {
          employeeId,
          openingBalance: 12,
          leavesEarned: 0,
          leavesTaken: daysTaken,
          closingBalance: 12 - daysTaken
        }
      });
    } else {
      // Update existing balance
      await prisma.leaveBalance.update({
        where: { employeeId },
        data: {
          leavesTaken: balance.leavesTaken + daysTaken,
          closingBalance: balance.closingBalance - daysTaken,
          lastUpdated: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error updating leave balance:', error);
  }
};

// Initialize leave balance for all employees (utility function)
export const initializeLeaveBalances = async () => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        leaveBalance: null
      }
    });

    for (const employee of employees) {
      await prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          openingBalance: 12,
          leavesEarned: 0,
          leavesTaken: 0,
          closingBalance: 12
        }
      });
    }

    console.log(`Initialized leave balances for ${employees.length} employees`);
  } catch (error) {
    console.error('Error initializing leave balances:', error);
  }
};
