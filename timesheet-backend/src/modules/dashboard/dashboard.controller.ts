import { Request, Response } from "express";
import { getDashboardSummary, getEmployeeHours, getProjectDistribution, getHoursTrend } from "./dashboard.service";
import { getRecentActivities as getDbActivities, getMyActivities as getMyDbActivities } from "../activity/activity.service";
import { authenticate } from "../../middleware/auth.middleware";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const getDashboardSummaryData = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, employeeIds, projectIds, status } = req.query;
    const user = (req as any).user;

    const data = await getDashboardSummary(
      user,
      fromDate as string,
      toDate as string,
      employeeIds as string[],
      projectIds as string[],
      status as string
    );

    res.json({
      success: true,
      data,
      message: 'Dashboard summary retrieved successfully'
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve dashboard summary" 
    });
  }
};

export const getEmployeeHoursData = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, employeeIds, projectIds, status } = req.query;
    const user = (req as any).user;

    const data = await getEmployeeHours(
      user,
      fromDate as string,
      toDate as string,
      employeeIds as string[],
      projectIds as string[],
      status as string
    );

    res.json({
      success: true,
      data,
      message: 'Employee hours data retrieved successfully'
    });
  } catch (error) {
    console.error("Employee hours error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve employee hours data" 
    });
  }
};

export const getProjectDistributionData = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, employeeIds, projectIds, status } = req.query;
    const user = (req as any).user;

    const data = await getProjectDistribution(
      user,
      fromDate as string,
      toDate as string,
      employeeIds as string[],
      projectIds as string[],
      status as string
    );

    res.json({
      success: true,
      data,
      message: 'Project distribution data retrieved successfully'
    });
  } catch (error) {
    console.error("Project distribution error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve project distribution data" 
    });
  }
};

export const getHoursTrendData = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, employeeIds, projectIds, status, granularity = 'daily' } = req.query;
    const user = (req as any).user;

    const data = await getHoursTrend(
      user,
      fromDate as string,
      toDate as string,
      employeeIds as string[],
      projectIds as string[],
      status as string,
      granularity as 'daily' | 'weekly' | 'monthly'
    );

    res.json({
      success: true,
      data,
      message: 'Hours trend data retrieved successfully'
    });
  } catch (error) {
    console.error("Hours trend error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve hours trend data" 
    });
  }
};

export const exportDashboardData = async (req: Request, res: Response) => {
  try {
    const { format = 'excel', fromDate, toDate, employeeIds, projectIds, status } = req.query;
    const user = (req as any).user;

    // This would integrate with a library like exceljs or pdfkit
    // For now, return the raw data that can be processed client-side
    const summaryData = await getDashboardSummary(
      user,
      fromDate as string,
      toDate as string,
      employeeIds as string[],
      projectIds as string[],
      status as string
    );

    res.json({
      success: true,
      data: summaryData,
      format,
      message: 'Export data retrieved successfully'
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to export data" 
    });
  }
};

// Role-specific dashboard endpoints
export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalProjects,
      totalClients,
      totalEmployees,
      totalTasks,
      pendingApprovals,
      activeJobs
    ] = await Promise.all([
      prisma.project.count(),
      prisma.client.count(),
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.job.count(),
      prisma.employee.count({ where: { status: 'pending' } }),
      prisma.job.count({ where: { status: 'Started' } })
    ]);

    const stats = {
      totalProjects,
      totalClients,
      totalEmployees,
      totalTasks,
      pendingApprovals,
      activeJobs
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

export const getManagerStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const managerId = req.user?.id;

    const [
      assignedProjects,
      teamMembers,
      teamTasks,
      activeJobs
    ] = await Promise.all([
      prisma.projectUser.count({ where: { employeeId: managerId } }),
      prisma.employee.count({ where: { reportingManager: managerId } }),
      prisma.timelog.count({ 
        where: { 
          reportingManagerId: managerId,
          submissionStatus: 'submitted'
        }
      }),
      prisma.job.count({ 
        where: { 
          status: 'Started'
        }
      })
    ]);

    const stats = {
      totalProjects: assignedProjects,
      totalEmployees: teamMembers,
      totalTasks: teamTasks,
      activeJobs
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manager statistics'
    });
  }
};

export const getPartnerStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partnerId = req.user?.id;

    const [
      myProjects,
      myClients,
      teamTasks,
      teamMembers
    ] = await Promise.all([
      prisma.projectUser.count({ where: { employeeId: partnerId } }),
      prisma.client.count({ where: { createdBy: partnerId } }),
      prisma.timelog.count({ 
        where: { 
          reportingPartnerId: partnerId,
          submissionStatus: 'submitted'
        }
      }),
      prisma.employee.count({ where: { reportingPartner: partnerId } })
    ]);

    const stats = {
      myProjects,
      myClients,
      teamTasks,
      teamMembers
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner statistics'
    });
  }
};

export const getEmployeeStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;

    const [
      myProjects,
      myTasks,
      completedTasks,
      hoursLogged
    ] = await Promise.all([
      // Count distinct projects employee is assigned to
      prisma.projectUser.findMany({
        where: { employeeId },
        select: { projectId: true },
        distinct: ['projectId']
      }).then(projects => projects.length),
      
      prisma.timelog.count({ 
        where: { 
          employeeId,
          submissionStatus: 'submitted'
        }
      }),
      
      prisma.timelog.count({ 
        where: { 
          employeeId,
          approvedAt: { not: null }
        }
      }),
      
      // Calculate total hours from timelog entries
      prisma.timelog.aggregate({
        where: { employeeId },
        _sum: { hours: true }
      }).then((result: any) => result._sum.hours || 0)
    ]);

    const stats = {
      myProjects,
      totalTasks: myTasks,
      completedTasks,
      hoursLogged
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee statistics'
    });
  }
};

export const getRecentActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await getDbActivities(limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};

export const getMyRecentActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await getMyDbActivities(user.id, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching my recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};
