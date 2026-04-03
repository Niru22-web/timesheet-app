import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ExcelService } from '../../utils/ExcelService';
import { startOfMonth, endOfMonth } from 'date-fns';

export const getAllReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, employeeId, category, startDate, endDate, minAmount, maxAmount, q } = req.query;

    // Log incoming query parameters for debugging as requested
    console.log('Fetching reimbursements [REQUEST]:', { 
      user: { id: user?.id, role: user?.role },
      params: { status, employeeId, category, startDate, endDate, q, minAmount, maxAmount } 
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }

    const where: any = {};
    
    // Role-based visibility with client-based restriction
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      // Only include employeeId in the filter if it is not empty/undefined
      if (employeeId && (employeeId as string).trim() !== '') {
        where.employeeId = employeeId as string;
      }
    } else {
      // For non-admin users: apply user-level and client-based restrictions
      where.employeeId = user.id;
      
      // Get assigned clients via project mapping
      const assignedProjects = await prisma.projectUser.findMany({
        where: { employeeId: user.id },
        select: { projectId: true }
      });
      
      if (assignedProjects.length === 0) {
        // User has no assigned projects/clients - return empty array
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No projects assigned to you'
        });
      }
      
      const projectIds = assignedProjects.map(p => p.projectId);
      
      // Get unique client IDs from assigned projects
      const projectsWithClients = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { clientId: true }
      });
      
      const assignedClientIds = [...new Set(projectsWithClients.map(p => p.clientId).filter(Boolean))];
      
      if (assignedClientIds.length === 0) {
        // User has projects but no clients assigned
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No clients assigned to you'
        });
      }
      
      // Apply client filter
      where.clientId = { in: assignedClientIds };
    }

    // Filters
    if (status && status !== 'All Status') where.status = (status as string).toLowerCase();
    if (category && category !== 'All Categories') where.category = category as string;
    
    // Date filtering: Only apply if BOTH startDate and endDate are provided and valid
    if (startDate && endDate && (startDate as string).trim() !== '' && (endDate as string).trim() !== '') {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.date = {
          gte: start,
          lte: end
        };
      } else {
        console.warn('Invalid date parameters provided:', { startDate, endDate });
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount && (minAmount as string).trim() !== '') {
        const min = parseFloat(minAmount as string);
        if (!isNaN(min)) where.amount.gte = min;
      }
      if (maxAmount && (maxAmount as string).trim() !== '') {
        const max = parseFloat(maxAmount as string);
        if (!isNaN(max)) where.amount.lte = max;
      }
      if (Object.keys(where.amount).length === 0) delete where.amount;
    }

    // Global Search
    if (q && (q as string).trim() !== "") {
      const search = (q as string).trim();
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
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        },
        client: {
          select: {
            id: true,
            clientId: true,
            name: true,
            alias: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: claims,
      count: claims.length,
      message: 'Reimbursement claims retrieved successfully'
    });
  } catch (error: any) {
    console.error('Reimbursement API Error [getAll]:', {
      user: (req as any).user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: "Something went wrong while fetching reimbursements",
      message: error.message 
    });
  }
};

export const getReimbursementKPIs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { month, year, employeeId } = req.query;

    let startDate: Date;
    let endDate: Date;

    if (month && year) {
      startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      endDate = endOfMonth(startDate);
    } else {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(startDate);
    }

    const where: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    // Role filtering for KPIs with client-based restriction
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    if (!isAdmin) {
      where.employeeId = user.id;
      
      // Get assigned clients via project mapping for non-admin users
      const assignedProjects = await prisma.projectUser.findMany({
        where: { employeeId: user.id },
        select: { projectId: true }
      });
      
      if (assignedProjects.length > 0) {
        const projectIds = assignedProjects.map(p => p.projectId);
        
        // Get unique client IDs from assigned projects
        const projectsWithClients = await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { clientId: true }
        });
        
        const assignedClientIds = [...new Set(projectsWithClients.map(p => p.clientId).filter(Boolean))];
        
        if (assignedClientIds.length > 0) {
          // Apply client filter
          where.clientId = { in: assignedClientIds };
        } else {
          // User has projects but no clients assigned - return zero KPIs
          return res.json({
            success: true,
            data: {
              totalSubmitted: 0,
              approvedCount: 0,
              rejectedCount: 0,
              approvalRate: 0,
              rejectedVsApproved: 0
            }
          });
        }
      } else {
        // User has no assigned projects - return zero KPIs
        return res.json({
          success: true,
          data: {
            totalSubmitted: 0,
            approvedCount: 0,
            rejectedCount: 0,
            approvalRate: 0,
            rejectedVsApproved: 0
          }
        });
      }
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    const [totalSubmitted, approvedResult, rejectedResult] = await Promise.all([
      prisma.reimbursement.count({ where }),
      prisma.reimbursement.count({ where: { ...where, status: 'approved' } }),
      prisma.reimbursement.count({ where: { ...where, status: 'rejected' } })
    ]);

    const approvalRate = totalSubmitted > 0 ? (approvedResult / totalSubmitted) * 100 : 0;
    const rejectedVsApproved = approvedResult > 0 ? (rejectedResult / approvedResult) : 0;

    res.json({
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
    console.error('Reimbursement API Error [getKPIs]:', {
      user: (req as any).user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      error: "Something went wrong while fetching KPIs",
      message: error.message 
    });
  }
};

export const createReimbursement = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { category, amount, description, date, clientId } = req.body;

    const count = await prisma.reimbursement.count();
    const claimId = `CLM-${String(count + 1).padStart(3, '0')}`;

    const newClaim = await prisma.reimbursement.create({
      data: {
        claimId,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        employeeId: user.id,
        clientId: clientId || null
      }
    });
    res.status(201).json({
      success: true,
      data: newClaim,
      message: 'Reimbursement claim submitted successfully'
    });
  } catch (error: any) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to submit claim" 
    });
  }
};

export const updateReimbursementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedClaim = await prisma.reimbursement.update({
      where: { id },
      data: { status: status.toLowerCase() }
    });

    res.json({
      success: true,
      data: updatedClaim,
      message: `Reimbursement claim ${status} successfully`
    });
  } catch (error: any) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to update claim status" 
    });
  }
};

export const bulkUploadReimbursements = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jsonData = ExcelService.parseExcel(req.file.buffer);
    const user = (req as any).user;

    const results = [];
    const errors = [];

    for (let row of jsonData) {
      try {
        const { category, amount, description, date, employeeEmail } = row;
        
        let employeeId = user.id;
        if (employeeEmail) {
          const emp = await prisma.employee.findUnique({ where: { officeEmail: employeeEmail } });
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

    res.json({
      success: true,
      data: { successCount: results.length, errors },
      message: 'Bulk upload completed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const exportReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, employeeId, category, startDate, endDate, minAmount, maxAmount, q } = req.query;

    console.log('Exporting reimbursements [REQUEST]:', { 
      user: { id: user?.id, role: user?.role },
      params: { status, employeeId, category, startDate, endDate, q, minAmount, maxAmount } 
    });

    const where: any = {};
    
    // Role-based visibility with client-based restriction for export
    const isAdmin = ['Manager', 'Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      if (employeeId && (employeeId as string).trim() !== '') {
        where.employeeId = employeeId as string;
      }
    } else {
      where.employeeId = user.id;
      
      // Get assigned clients via project mapping for non-admin users
      const assignedProjects = await prisma.projectUser.findMany({
        where: { employeeId: user.id },
        select: { projectId: true }
      });
      
      if (assignedProjects.length > 0) {
        const projectIds = assignedProjects.map(p => p.projectId);
        
        // Get unique client IDs from assigned projects
        const projectsWithClients = await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { clientId: true }
        });
        
        const assignedClientIds = [...new Set(projectsWithClients.map(p => p.clientId).filter(Boolean))];
        
        if (assignedClientIds.length > 0) {
          // Apply client filter
          where.clientId = { in: assignedClientIds };
        } else {
          // User has projects but no clients assigned - return empty export
          return ExcelService.exportToExcel(res, [], 'reimbursements');
        }
      } else {
        // User has no assigned projects - return empty export
        return ExcelService.exportToExcel(res, [], 'reimbursements');
      }
    }

    // Apply same filters as list
    if (status && status !== 'All Status') where.status = (status as string).toLowerCase();
    if (category && category !== 'All Categories') where.category = category as string;
    
    // Date filtering: Only apply if BOTH startDate and endDate are provided and valid
    if (startDate && endDate && (startDate as string).trim() !== '' && (endDate as string).trim() !== '') {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.date = { gte: start, lte: end };
      }
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount && (minAmount as string).trim() !== '') {
        const min = parseFloat(minAmount as string);
        if (!isNaN(min)) where.amount.gte = min;
      }
      if (maxAmount && (maxAmount as string).trim() !== '') {
        const max = parseFloat(maxAmount as string);
        if (!isNaN(max)) where.amount.lte = max;
      }
      if (Object.keys(where.amount).length === 0) delete where.amount;
    }
    
    if (q && (q as string).trim() !== "") {
      const search = (q as string).trim();
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

    ExcelService.exportToExcel(res, exportData, 'reimbursements');
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
