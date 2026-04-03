import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';

export const getReportSummary = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;
    const where: any = {};
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const [totalEmployees, activeProjects, timelogs, totalClients, totalReimbursements] = await Promise.all([
      prisma.employee.count(),
      prisma.project.count({ where: { status: 'Started' } }),
      prisma.timelog.findMany({
        where,
        include: {
          employee: true,
          job: { include: { project: { include: { client: true } } } }
        }
      }),
      prisma.client.count(),
      prisma.reimbursement.aggregate({
        _sum: { amount: true },
        where: { status: 'approved' }
      })
    ]);

    const reportData = {
      totalHours: timelogs.length > 0 ? timelogs.reduce((sum, log) => sum + (log.hours || 0), 0) : 0,
      totalEmployees,
      activeProjects,
      totalClients,
      totalDisbursed: totalReimbursements._sum.amount || 0,
      averageUtilization: totalEmployees > 0 && timelogs.length > 0 ? (timelogs.reduce((sum, log) => sum + (log.hours || 0), 0) / (totalEmployees * 40)) * 100 : 0,
      byEmployee: {} as any,
      byProject: {} as any,
      byJob: {} as any
    };

    timelogs.forEach((log: any) => {
      const empName = `${log.employee.firstName} ${log.employee.lastName || ''}`;
      const projName = log.job?.project?.name || 'Unknown Project';
      const jobName = log.job?.name || 'Unknown Job';

      reportData.byEmployee[empName] = (reportData.byEmployee[empName] || 0) + (log.hours || 0);
      reportData.byProject[projName] = (reportData.byProject[projName] || 0) + (log.hours || 0);
      reportData.byJob[jobName] = (reportData.byJob[jobName] || 0) + (log.hours || 0);
    });

    res.json({
      success: true,
      data: reportData,
      message: 'Report summary generated successfully'
    });
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate report summary" 
    });
  }
};

export const getEmployeeSummary = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fromDate, toDate } = req.query;
    const where: any = { employeeId: user.id };
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const [timelogs, projects, reimbursements] = await Promise.all([
      prisma.timelog.findMany({
        where,
        include: {
          job: { include: { project: { include: { client: true } } } }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.projectUser.findMany({
        where: { employeeId: user.id },
        include: { project: true }
      }),
      prisma.reimbursement.findMany({
        where: { employeeId: user.id }
      })
    ]);

    const totalHours = timelogs.length > 0 ? timelogs.reduce((sum, log) => sum + (log.hours || 0), 0) : 0;
    const approvedHours = timelogs.filter((log: any) => log.submissionStatus === 'approved').reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
    const pendingHours = timelogs.filter((log: any) => log.submissionStatus === 'pending').reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
    const approvedReimbursements = reimbursements.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);

    const reportData = {
      totalHours,
      approvedHours,
      pendingHours,
      activeProjects: projects.filter(pu => pu.project.status === 'Started').length,
      approvedReimbursements,
      pendingReimbursements: reimbursements.filter(r => r.status === 'pending').length,
      recentTimelogs: timelogs.slice(0, 10)
    };

    res.json({
      success: true,
      data: reportData,
      message: 'Employee summary generated successfully'
    });
  } catch (error) {
    console.error("Employee summary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate employee summary" 
    });
  }
};