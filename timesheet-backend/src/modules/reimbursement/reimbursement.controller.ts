import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ExcelService } from '../../utils/ExcelService';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Validates if a string is a valid UUID to prevent PostgreSQL query errors.
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getAllReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
       return res.status(401).json({ success: false, message: "Unauthorized: User context missing" });
    }

    const { q, status, employeeId, category, startDate, endDate, minAmount, maxAmount } = req.query;

    const where: any = {};
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    // Visibility logic
    if (isAdmin) {
      const targetEmpId = String(employeeId || '').trim();
      if (targetEmpId !== '' && isValidUUID(targetEmpId)) {
        where.employeeId = targetEmpId;
      }
    } else {
      where.employeeId = user.id;
      
      // Optional: Filter by assigned clients if relevant for non-admin
      const assignedProjects = await prisma.projectUser.findMany({
        where: { employeeId: user.id },
        select: { projectId: true }
      });
      
      if (assignedProjects.length > 0) {
        const projectIds = assignedProjects.map(p => p.projectId);
        const projectsWithClients = await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { clientId: true }
        });
        const assignedClientIds = [...new Set(projectsWithClients.map(p => p.clientId).filter(Boolean) as string[])];
        if (assignedClientIds.length > 0) {
          where.clientId = { in: assignedClientIds };
        }
      }
    }

    // Status Filter
    if (status && status !== 'All Status' && String(status).trim() !== '') {
      where.status = String(status).toLowerCase();
    }

    // Category Filter
    if (category && category !== 'All Categories' && String(category).trim() !== '') {
      where.category = String(category);
    }
    
    // Date Filtering
    if (startDate && endDate && String(startDate).trim() !== '' && String(endDate).trim() !== '') {
      const start = new Date(String(startDate));
      const end = new Date(String(endDate));
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.date = { gte: start, lte: end };
      }
    }

    // Amount Filtering
    if (minAmount || maxAmount) {
      const amountFilter: any = {};
      const min = parseFloat(String(minAmount || ''));
      const max = parseFloat(String(maxAmount || ''));
      if (!isNaN(min)) amountFilter.gte = min;
      if (!isNaN(max)) amountFilter.lte = max;
      if (Object.keys(amountFilter).length > 0) where.amount = amountFilter;
    }

    // Global Search
    if (q && String(q).trim() !== "") {
      const search = String(q).trim();
      where.OR = [
        { claimId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const claims = await prisma.reimbursement.findMany({
      where,
      include: { 
        employee: { select: { id: true, firstName: true, lastName: true, officeEmail: true } },
        client: { select: { id: true, clientId: true, name: true, alias: true } }
      },
      orderBy: { date: 'desc' }
    });

    return res.json({
      success: true,
      data: claims,
      count: claims.length,
      message: 'Reimbursement claims retrieved successfully'
    });
  } catch (error: any) {
    console.error("🔥 [getAllReimbursements] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching reimbursements",
      error: error.message
    });
  }
};

export const getReimbursementKPIs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { month, year, employeeId } = req.query;

    let startDate: Date;
    let endDate: Date;

    const m = parseInt(String(month || ''));
    const y = parseInt(String(year || ''));

    if (!isNaN(m) && !isNaN(y)) {
      startDate = new Date(y, m - 1, 1);
      endDate = endOfMonth(startDate);
    } else {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(startDate);
    }

    const where: any = { date: { gte: startDate, lte: endDate } };
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      if (employeeId && String(employeeId).trim() !== '' && isValidUUID(String(employeeId))) {
        where.employeeId = String(employeeId);
      }
    } else {
      where.employeeId = user.id;
    }

    const [totalSubmitted, approvedResult, rejectedResult] = await Promise.all([
      prisma.reimbursement.count({ where }),
      prisma.reimbursement.count({ where: { ...where, status: 'approved' } }),
      prisma.reimbursement.count({ where: { ...where, status: 'rejected' } })
    ]);

    const approvalRate = totalSubmitted > 0 ? (approvedResult / totalSubmitted) * 100 : 0;
    const rejectedVsApproved = approvedResult > 0 ? (rejectedResult / approvedResult) : 0;

    return res.json({
      success: true,
      data: {
        totalSubmitted,
        approvedCount: approvedResult,
        rejectedCount: rejectedResult,
        approvalRate: parseFloat(approvalRate.toFixed(1)),
        rejectedVsApproved: parseFloat(rejectedVsApproved.toFixed(2))
      }
    });
  } catch (error: any) {
    console.error("🔥 [getReimbursementKPIs] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error fetching KPIs" });
  }
};

export const createReimbursement = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { category, amount, description, date, clientId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return res.status(400).json({ success: false, message: "Invalid amount" });

    // Validate clientId if provided
    let validClientId = null;
    if (clientId && clientId.trim() !== '' && isValidUUID(clientId.trim())) {
      validClientId = clientId.trim();
    }

    const count = await prisma.reimbursement.count();
    const claimId = `CLM-${String(count + 1).padStart(3, '0')}`;

    const newClaim = await prisma.reimbursement.create({
      data: {
        claimId,
        category: category || 'Other',
        amount: parsedAmount,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        employeeId: user.id,
        clientId: validClientId
      }
    });
    
    return res.status(201).json({ success: true, data: newClaim, message: 'Reimbursement submitted' });
  } catch (error: any) {
    console.error("🔥 [createReimbursement] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error creating claim" });
  }
};

export const updateReimbursementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    if (!status) return res.status(400).json({ success: false, message: "Status required" });

    const updatedClaim = await prisma.reimbursement.update({
      where: { id },
      data: { status: status.trim().toLowerCase() }
    });

    return res.json({ success: true, data: updatedClaim, message: `Status updated to ${status}` });
  } catch (error: any) {
    console.error("🔥 [updateReimbursementStatus] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export const bulkUploadReimbursements = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const jsonData = ExcelService.parseExcel(req.file.buffer);
    const user = (req as any).user;
    const results = [];
    const errors = [];

    for (let row of jsonData) {
      try {
        const { category, amount, description, date, employeeEmail } = row;
        let employeeId = user.id;
        
        if (employeeEmail && employeeEmail.trim() !== '') {
          const emp = await prisma.employee.findUnique({ where: { officeEmail: employeeEmail.trim() } });
          if (emp) employeeId = emp.id;
        }

        const count = await prisma.reimbursement.count();
        const claimId = `CLM-${String(count + 1).padStart(3, '0')}`;

        const claim = await prisma.reimbursement.create({
          data: {
            claimId,
            category: category || 'Other',
            amount: parseFloat(amount) || 0,
            description: description || '',
            date: date ? new Date(date) : new Date(),
            employeeId
          }
        });
        results.push(claim);
      } catch (err: any) {
        errors.push({ row, error: err.message });
      }
    }

    return res.json({ success: true, data: { successCount: results.length, errors }, message: 'Bulk upload complete' });
  } catch (error: any) {
    console.error("🔥 [bulkUploadReimbursements] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error in bulk upload" });
  }
};

export const exportReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, employeeId, category, startDate, endDate, minAmount, maxAmount, q } = req.query;

    const where: any = {};
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      if (employeeId && String(employeeId).trim() !== '' && isValidUUID(String(employeeId))) {
        where.employeeId = String(employeeId);
      }
    } else {
      where.employeeId = user.id;
    }

    // Apply same filters as getAllReimbursements
    if (status && status !== 'All Status') where.status = String(status).toLowerCase();
    if (category && category !== 'All Categories') where.category = String(category);
    if (startDate && endDate) {
      const start = new Date(String(startDate));
      const end = new Date(String(endDate));
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) where.date = { gte: start, lte: end };
    }
    if (q && String(q).trim() !== '') {
       where.OR = [
          { claimId: { contains: String(q), mode: 'insensitive' } },
          { description: { contains: String(q), mode: 'insensitive' } }
       ];
    }

    const claims = await prisma.reimbursement.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });

    const exportData = claims.map(c => ({
      'Claim ID': c.claimId,
      'Employee': `${c.employee.firstName} ${c.employee.lastName}`,
      'Category': c.category,
      'Amount': c.amount,
      'Date': c.date.toISOString().split('T')[0],
      'Status': c.status,
      'Description': c.description
    }));

    return ExcelService.exportToExcel(res, exportData, 'reimbursements');
  } catch (error: any) {
    console.error("🔥 [exportReimbursements] Error:", error.message);
    return res.status(500).json({ success: false, message: "Error exporting data" });
  }
};
