import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ExcelService } from '../../utils/ExcelService';
import { startOfMonth, endOfMonth } from 'date-fns';

export const getAllReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found"
      });
    }

    // Helper for safe query string extraction
    const getQueryParam = (param: any): string => {
      if (Array.isArray(param)) return String(param[0] || '').trim();
      return String(param || '').trim();
    };

    const q = getQueryParam(req.query.q);
    const status = getQueryParam(req.query.status);
    const employeeId = getQueryParam(req.query.employeeId);
    const category = getQueryParam(req.query.category);
    const startDate = getQueryParam(req.query.startDate);
    const endDate = getQueryParam(req.query.endDate);
    const minAmount = getQueryParam(req.query.minAmount);
    const maxAmount = getQueryParam(req.query.maxAmount);

    // Log incoming request parameters and user info for debugging
    console.log("API Request:", {
      user: { id: user.id, role: user.role },
      query: req.query
    });

    const where: any = {};
    
    // Role-based visibility logic
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      // Apply employeeId filter only if it is not empty or undefined
      if (employeeId && employeeId.trim() !== '') {
        where.employeeId = employeeId;
      }
    } else {
      // For non-admin users: restricted to their own data
      where.employeeId = user.id;
      
      // Maintain client/project-based filtering for non-admin users
      const assignedProjects = await prisma.projectUser.findMany({
        where: { employeeId: user.id },
        select: { projectId: true }
      });
      
      if (assignedProjects.length === 0) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No projects assigned to you'
        });
      }
      
      const projectIds = assignedProjects.map(p => p.projectId);
      const projectsWithClients = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { clientId: true }
      });
      
      const assignedClientIds = [...new Set(projectsWithClients.map(p => p.clientId).filter(Boolean) as string[])];
      
      if (assignedClientIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No clients assigned to you'
        });
      }
      
      where.clientId = { in: assignedClientIds };
    }

    // Status Filter
    if (status && status !== 'All Status' && status.trim() !== '') {
      where.status = status.toLowerCase();
    }

    // Category Filter
    if (category && category !== 'All Categories' && category.trim() !== '') {
      where.category = category;
    }
    
    // Date Filtering (Critical Fix)
    // Apply date filter only if both startDate and endDate are provided and not empty
    if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.date = {
          gte: start,
          lte: end
        };
      } else {
        console.warn('Invalid date parameters provided:', { startDate, endDate });
      }
    }

    // Amount Filtering
    if (minAmount || maxAmount) {
      const amountFilter: any = {};
      
      if (minAmount && minAmount.trim() !== '') {
        const min = parseFloat(minAmount);
        if (!isNaN(min)) amountFilter.gte = min;
      }
      
      if (maxAmount && maxAmount.trim() !== '') {
        const max = parseFloat(maxAmount);
        if (!isNaN(max)) amountFilter.lte = max;
      }
      
      if (Object.keys(amountFilter).length > 0) {
        where.amount = amountFilter;
      }
    }

    // Global Search (Search Filter)
    if (q && q.trim() !== "") {
      const search = q.trim();
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

    return res.json({
      success: true,
      data: claims,
      count: claims.length,
      message: 'Reimbursement claims retrieved successfully'
    });
  } catch (error: any) {
    const errorUser = (req as any).user;
    console.error("🔥 API ERROR [getAllReimbursements]:", {
      message: error.message,
      stack: error.stack,
      userId: errorUser?.id,
      query: req.query
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

export const getReimbursementKPIs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found"
      });
    }

    // Helper for safe query string extraction
    const getQueryParam = (param: any): string => {
      if (Array.isArray(param)) return String(param[0] || '').trim();
      return String(param || '').trim();
    };

    const month = getQueryParam(req.query.month);
    const year = getQueryParam(req.query.year);
    const employeeId = getQueryParam(req.query.employeeId);

    // Log incoming request parameters and user info for debugging
    console.log("API Request [getReimbursementKPIs]:", {
      user: { id: user.id, role: user.role },
      query: req.query
    });

    let startDate: Date;
    let endDate: Date;

    if (month !== '' && year !== '') {
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      
      if (!isNaN(yearInt) && !isNaN(monthInt)) {
        startDate = new Date(yearInt, monthInt - 1, 1);
        endDate = endOfMonth(startDate);
      } else {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(startDate);
      }
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

    // Role filtering for KPIs
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      if (employeeId && employeeId.trim() !== '') {
        where.employeeId = employeeId;
      }
    } else {
      // Non-admin: restrict to own data and assigned clients
      where.employeeId = user.id;
      
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
        } else {
          return res.json({
            success: true,
            data: { totalSubmitted: 0, approvedCount: 0, rejectedCount: 0, approvalRate: 0, rejectedVsApproved: 0 }
          });
        }
      } else {
        return res.json({
          success: true,
          data: { totalSubmitted: 0, approvedCount: 0, rejectedCount: 0, approvalRate: 0, rejectedVsApproved: 0 }
        });
      }
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
    console.error("🔥 API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

export const createReimbursement = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }

    const { category, amount, description, date, clientId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ success: false, error: "Invalid amount provided" });
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
        clientId: clientId || null
      }
    });
    
    res.status(201).json({
      success: true,
      data: newClaim,
      message: 'Reimbursement claim submitted successfully'
    });
  } catch (error: any) {
    const errorUser = (req as any).user;
    console.error("🔥 API ERROR [createReimbursement]:", {
      message: error.message,
      stack: error.stack,
      userId: errorUser?.id
    });
    return res.status(500).json({ 
      success: false,
      message: error.message || "Failed to submit claim" 
    });
  }
};

export const updateReimbursementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

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
    const errorUser = (req as any).user;
    console.error("🔥 API ERROR [updateReimbursementStatus]:", {
      message: error.message,
      stack: error.stack,
      userId: errorUser?.id
    });
    return res.status(500).json({ 
      success: false,
      message: error.message || "Failed to update claim status" 
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
    const errorUser = (req as any).user;
    console.error("🔥 API ERROR [bulkUploadReimbursements]:", {
      message: error.message,
      stack: error.stack,
      userId: errorUser?.id
    });
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export const exportReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not found"
      });
    }

    // Helper for safe query string extraction
    const getQueryParam = (param: any): string => {
      if (Array.isArray(param)) return String(param[0] || '').trim();
      return String(param || '').trim();
    };

    const status = getQueryParam(req.query.status);
    const employeeId = getQueryParam(req.query.employeeId);
    const category = getQueryParam(req.query.category);
    const startDate = getQueryParam(req.query.startDate);
    const endDate = getQueryParam(req.query.endDate);
    const minAmount = getQueryParam(req.query.minAmount);
    const maxAmount = getQueryParam(req.query.maxAmount);
    const q = getQueryParam(req.query.q);

    // Log incoming request parameters and user info for debugging
    console.log("API Request [exportReimbursements]:", {
      user: { id: user.id, role: user.role },
      query: req.query
    });

    const where: any = {};
    
    // Role-based visibility logic (Matching getAllReimbursements)
    const isAdmin = ['Admin', 'Partner', 'Owner'].includes(user.role);
    
    if (isAdmin) {
      if (employeeId && employeeId.trim() !== '') {
        where.employeeId = employeeId;
      }
    } else {
      where.employeeId = user.id;
      
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
        } else {
          return ExcelService.exportToExcel(res, [], 'reimbursements');
        }
      } else {
        return ExcelService.exportToExcel(res, [], 'reimbursements');
      }
    }

    // Filters
    if (status && status !== 'All Status' && status.trim() !== '') {
      where.status = status.toLowerCase();
    }
    
    if (category && category !== 'All Categories' && category.trim() !== '') {
      where.category = category;
    }
    
    // Date Filtering (Critical Fix)
    if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        where.date = { gte: start, lte: end };
      }
    }

    // Amount Filtering
    if (minAmount || maxAmount) {
      const amountFilter: any = {};
      if (minAmount && minAmount.trim() !== '') {
        const min = parseFloat(minAmount);
        if (!isNaN(min)) amountFilter.gte = min;
      }
      if (maxAmount && maxAmount.trim() !== '') {
        const max = parseFloat(maxAmount);
        if (!isNaN(max)) amountFilter.lte = max;
      }
      if (Object.keys(amountFilter).length > 0) {
        where.amount = amountFilter;
      }
    }
    
    // Global Search
    if (q && q.trim() !== "") {
      const search = q.trim();
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
            firstName: true,
            lastName: true
          }
        }
      },
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
    console.error("🔥 API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};
