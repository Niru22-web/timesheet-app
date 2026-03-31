import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ExcelService } from '../../utils/ExcelService';

export const getAllReimbursements = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, employeeId, category, startDate, endDate, minAmount, maxAmount, q } = req.query;

    const where: any = {};
    
    // Role-based visibility
    if (['Manager', 'Admin', 'Partner', 'Owner'].includes(user.role)) {
      if (employeeId) where.employeeId = employeeId;
    } else {
      where.employeeId = user.id;
    }

    // Filters
    if (status && status !== 'All Status') where.status = (status as string).toLowerCase();
    if (category && category !== 'All Categories') where.category = category as string;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount as string);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
    }

    // Global Search
    if (q) {
      where.OR = [
        { claimId: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { category: { contains: q as string, mode: 'insensitive' } },
        { employee: { firstName: { contains: q as string, mode: 'insensitive' } } },
        { employee: { lastName: { contains: q as string, mode: 'insensitive' } } },
      ];
    }

    const claims = await prisma.reimbursement.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: claims,
      message: 'Reimbursement claims retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to fetch claims" 
    });
  }
};

export const createReimbursement = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { category, amount, description, date } = req.body;

    const count = await prisma.reimbursement.count();
    const claimId = `CLM-${String(count + 1).padStart(3, '0')}`;

    const newClaim = await prisma.reimbursement.create({
      data: {
        claimId,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        employeeId: user.id
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
    const { status, category, startDate, endDate, minAmount, maxAmount, q } = req.query;

    const where: any = {};
    if (!['Manager', 'Admin', 'Partner', 'Owner'].includes(user.role)) {
      where.employeeId = user.id;
    }

    // Apply same filters as list
    if (status && status !== 'All Status') where.status = (status as string).toLowerCase();
    if (category && category !== 'All Categories') where.category = category as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount as string);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
    }
    if (q) {
      where.OR = [
        { claimId: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { employee: { firstName: { contains: q as string, mode: 'insensitive' } } },
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
