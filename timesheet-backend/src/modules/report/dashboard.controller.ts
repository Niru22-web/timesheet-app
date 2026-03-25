import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } from "date-fns";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = user.role.toLowerCase();
    const userId = user.id;

    let stats: any = {};
    let whereClause: any = {};

    // Base conditions for different roles
    if (role === 'admin' || role === 'owner') {
      // Admin sees everything
      stats.totalEmployees = await prisma.employee.count();
      stats.totalClients = await prisma.client.count();
      stats.totalProjects = await prisma.project.count();
      stats.totalTasks = await prisma.job.count();
    } else if (role === 'partner') {
      // Partner sees their team and projects
      stats.totalEmployees = await prisma.employee.count({
        where: { reportingPartner: userId }
      });
      stats.totalClients = await prisma.client.count({
        where: { partnerId: userId }
      });
      stats.totalProjects = await prisma.project.count({
        where: { 
          OR: [
            { createdBy: userId },
            { client: { partnerId: userId } }
          ]
        }
      });
      stats.totalTasks = await prisma.job.count({
        where: { project: { client: { partnerId: userId } } }
      });
    } else if (role === 'manager') {
      // Manager sees their team and projects
      stats.totalEmployees = await prisma.employee.count({
        where: { reportingManager: userId }
      });
      stats.totalClients = await prisma.client.count({
        where: { projects: { some: { users: { some: { employeeId: userId } } } } }
      });
      stats.totalProjects = await prisma.project.count({
        where: { users: { some: { employeeId: userId } } }
      });
      stats.totalTasks = await prisma.job.count({
        where: { project: { users: { some: { employeeId: userId } } } }
      });
    } else {
      // Employee sees their own stats
      stats.totalProjects = await prisma.project.count({
        where: { users: { some: { employeeId: userId } } }
      });
      stats.totalTasks = await prisma.job.count({
        where: { project: { users: { some: { employeeId: userId } } } }
      });
      // For employee, maybe show completed tasks vs total?
      const completedTasks = await prisma.job.count({
        where: { 
          project: { users: { some: { employeeId: userId } } },
          status: 'Completed'
        }
      });
      stats.completedTasks = completedTasks;
    }

    // Role-based distribution for chart
    let roleDistribution: any[] = [];
    if (role !== 'employee') {
      let teamWhere: any = {};
      if (role === 'partner') teamWhere.reportingPartner = userId;
      if (role === 'manager') teamWhere.reportingManager = userId;

      const employees = await prisma.employee.findMany({
        where: teamWhere,
        select: { role: true }
      });

      const counts = employees.reduce((acc: any, emp) => {
        const r = emp.role || 'Other';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {});

      roleDistribution = Object.keys(counts).map(name => ({
        name,
        value: counts[name]
      }));
    }

    // Activity / Notifications
    const activities = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        stats,
        roleDistribution,
        activities,
        welcomeMessage: `Welcome back, ${user.name || 'User'}`
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
