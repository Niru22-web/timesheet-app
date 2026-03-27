import { prisma } from "../../database/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface DashboardUser {
  id: string;
  role: string;
  email: string;
}

export const getDashboardSummary = async (
  user: DashboardUser,
  fromDate?: string,
  toDate?: string,
  employeeIds?: string[],
  projectIds?: string[],
  status?: string
) => {
  const whereClause: any = {};
  
  // Date filtering
  if (fromDate || toDate) {
    whereClause.date = {};
    if (fromDate) whereClause.date.gte = new Date(fromDate);
    if (toDate) whereClause.date.lte = new Date(toDate);
  }

  // Role-based data filtering
  const isAdmin = ['Admin', 'Owner', 'Partner'].some(role => 
    user.role.toLowerCase().includes(role.toLowerCase())
  );
  const isManager = user.role.toLowerCase().includes('manager');

  if (!isAdmin && !isManager) {
    // Regular user - only see their own data
    whereClause.employeeId = user.id;
  } else if (isManager && !isAdmin) {
    // Manager - see their team data (using reportingManager field)
    const teamMembers = await prisma.employee.findMany({
      where: { reportingManager: user.id },
      select: { id: true }
    });
    whereClause.employeeId = {
      in: [user.id, ...teamMembers.map(m => m.id)]
    };
  }

  // Additional filters
  if (employeeIds?.length) {
    whereClause.employeeId = { in: employeeIds };
  }
  
  if (status) {
    whereClause.submissionStatus = status;
  }

  // Project filtering through job relationship
  let jobWhere: any = {};
  if (projectIds?.length) {
    jobWhere.projectId = { in: projectIds };
  }

  const [
    totalHoursResult,
    totalEmployeesResult,
    totalProjectsResult,
    pendingTimesheetsResult,
    employeeHoursData,
    projectHoursData
  ] = await Promise.all([
    // Total hours logged
    prisma.timelog.aggregate({
      where: {
        ...whereClause,
        job: jobWhere
      },
      _sum: { hours: true }
    }),

    // Total employees (based on role)
    isAdmin 
      ? prisma.employee.count({ where: { status: 'active' } })
      : isManager 
        ? prisma.employee.count({ 
            where: { 
              OR: [
                { id: user.id },
                { reportingManager: user.id }
              ]
            }
          })
        : prisma.employee.count({ where: { id: user.id } }),

    // Total projects
    isAdmin 
      ? prisma.project.count({ where: { status: 'Started' } })
      : prisma.projectUser.groupBy({
          by: ['projectId'],
          where: { employeeId: user.id }
        }).then(result => result.length),

    // Pending timesheets
    prisma.timelog.count({
      where: {
        ...whereClause,
        submissionStatus: 'pending',
        job: jobWhere
      }
    }),

    // Employee hours breakdown
    prisma.timelog.groupBy({
      by: ['employeeId'],
      where: {
        ...whereClause,
        job: jobWhere
      },
      _sum: { hours: true }
    }),

    // Project hours breakdown
    prisma.timelog.findMany({
      where: {
        ...whereClause,
        job: jobWhere
      },
      include: {
        job: {
          include: {
            project: true
          }
        }
      }
    })
  ]);

  // Get employee details for names
  const employeeIds_list = employeeHoursData.map(e => e.employeeId);
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds_list } },
    select: { id: true, firstName: true, lastName: true }
  });

  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = `${emp.firstName} ${emp.lastName || ''}`.trim();
    return acc;
  }, {} as Record<string, string>);

  // Process project hours
  const projectHoursMap = projectHoursData.reduce((acc, log) => {
    const projectName = log.job.project.name;
    acc[projectName] = (acc[projectName] || 0) + log.hours;
    return acc;
  }, {} as Record<string, number>);

  // Process employee hours
  const employeeHoursMap = employeeHoursData.reduce((acc, emp) => {
    const name = employeeMap[emp.employeeId] || 'Unknown';
    acc[name] = emp._sum.hours || 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalHours: totalHoursResult._sum.hours || 0,
    totalEmployees: totalEmployeesResult,
    totalProjects: totalProjectsResult,
    pendingTimesheets: pendingTimesheetsResult,
    employeeHours: employeeHoursMap,
    projectHours: projectHoursMap,
    // Additional KPIs
    averageHoursPerEmployee: totalEmployeesResult > 0 ? (totalHoursResult._sum.hours || 0) / totalEmployeesResult : 0,
    utilizationRate: totalEmployeesResult > 0 ? ((totalHoursResult._sum.hours || 0) / (totalEmployeesResult * 40)) * 100 : 0
  };
};

export const getEmployeeHours = async (
  user: DashboardUser,
  fromDate?: string,
  toDate?: string,
  employeeIds?: string[],
  projectIds?: string[],
  status?: string
) => {
  const whereClause: any = {};
  
  if (fromDate || toDate) {
    whereClause.date = {};
    if (fromDate) whereClause.date.gte = new Date(fromDate);
    if (toDate) whereClause.date.lte = new Date(toDate);
  }

  // Apply role-based filtering (same logic as above)
  const isAdmin = ['Admin', 'Owner', 'Partner'].some(role => 
    user.role.toLowerCase().includes(role.toLowerCase())
  );
  const isManager = user.role.toLowerCase().includes('manager');

  if (!isAdmin && !isManager) {
    whereClause.employeeId = user.id;
  } else if (isManager && !isAdmin) {
    const teamMembers = await prisma.employee.findMany({
      where: { reportingManager: user.id },
      select: { id: true }
    });
    whereClause.employeeId = {
      in: [user.id, ...teamMembers.map(m => m.id)]
    };
  }

  if (employeeIds?.length) {
    whereClause.employeeId = { in: employeeIds };
  }
  
  if (status) {
    whereClause.submissionStatus = status;
  }

  let jobWhere: any = {};
  if (projectIds?.length) {
    jobWhere.projectId = { in: projectIds };
  }

  const employeeHours = await prisma.timelog.findMany({
    where: {
      ...whereClause,
      job: jobWhere
    },
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, officeEmail: true }
      },
      job: {
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { date: 'desc' }
  });

  // Group by employee
  const groupedData = employeeHours.reduce((acc, log) => {
    const empKey = log.employee.id;
    if (!acc[empKey]) {
      acc[empKey] = {
        employeeId: log.employee.id,
        employeeName: `${log.employee.firstName} ${log.employee.lastName || ''}`.trim(),
        email: log.employee?.officeEmail || '',
        totalHours: 0,
        projects: {} as Record<string, number>,
        dailyHours: [] as any[]
      };
    }
    
    acc[empKey].totalHours += log.hours;
    
    const projectName = log.job.project.name;
    acc[empKey].projects[projectName] = (acc[empKey].projects[projectName] || 0) + log.hours;
    
    acc[empKey].dailyHours.push({
      date: log.date,
      hours: log.hours,
      project: projectName,
      status: log.submissionStatus
    });

    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedData);
};

export const getProjectDistribution = async (
  user: DashboardUser,
  fromDate?: string,
  toDate?: string,
  employeeIds?: string[],
  projectIds?: string[],
  status?: string
) => {
  const whereClause: any = {};
  
  if (fromDate || toDate) {
    whereClause.date = {};
    if (fromDate) whereClause.date.gte = new Date(fromDate);
    if (toDate) whereClause.date.lte = new Date(toDate);
  }

  // Apply role-based filtering
  const isAdmin = ['Admin', 'Owner', 'Partner'].some(role => 
    user.role.toLowerCase().includes(role.toLowerCase())
  );
  const isManager = user.role.toLowerCase().includes('manager');

  if (!isAdmin && !isManager) {
    whereClause.employeeId = user.id;
  } else if (isManager && !isAdmin) {
    const teamMembers = await prisma.employee.findMany({
      where: { reportingManager: user.id },
      select: { id: true }
    });
    whereClause.employeeId = {
      in: [user.id, ...teamMembers.map(m => m.id)]
    };
  }

  if (employeeIds?.length) {
    whereClause.employeeId = { in: employeeIds };
  }
  
  if (status) {
    whereClause.submissionStatus = status;
  }

  let jobWhere: any = {};
  if (projectIds?.length) {
    jobWhere.projectId = { in: projectIds };
  }

  const projectData = await prisma.timelog.findMany({
    where: {
      ...whereClause,
      job: jobWhere
    },
    include: {
      job: {
        include: {
          project: {
            include: {
              client: {
                select: { id: true, name: true }
              }
            }
          }
        }
      },
      employee: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  });

  // Process data for charts
  const projectDistribution = projectData.reduce((acc, log) => {
    const project = log.job.project;
    const clientName = project.client.name;
    
    if (!acc[project.id]) {
      acc[project.id] = {
        projectId: project.id,
        projectName: project.name,
        clientName,
        totalHours: 0,
        employees: new Set(),
        dailyBreakdown: [] as any[]
      };
    }
    
    acc[project.id].totalHours += log.hours;
    acc[project.id].employees.add(log.employee.id);
    
    acc[project.id].dailyBreakdown.push({
      date: log.date,
      hours: log.hours,
      employee: `${log.employee.firstName} ${log.employee.lastName || ''}`.trim()
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert Sets to counts and format for frontend
  return Object.values(projectDistribution).map((project: any) => ({
    ...project,
    employeeCount: project.employees.size,
    employees: undefined // Remove the Set object
  }));
};

export const getHoursTrend = async (
  user: DashboardUser,
  fromDate?: string,
  toDate?: string,
  employeeIds?: string[],
  projectIds?: string[],
  status?: string,
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
) => {
  const whereClause: any = {};
  
  if (fromDate || toDate) {
    whereClause.date = {};
    if (fromDate) whereClause.date.gte = new Date(fromDate);
    if (toDate) whereClause.date.lte = new Date(toDate);
  }

  // Apply role-based filtering
  const isAdmin = ['Admin', 'Owner', 'Partner'].some(role => 
    user.role.toLowerCase().includes(role.toLowerCase())
  );
  const isManager = user.role.toLowerCase().includes('manager');

  if (!isAdmin && !isManager) {
    whereClause.employeeId = user.id;
  } else if (isManager && !isAdmin) {
    const teamMembers = await prisma.employee.findMany({
      where: { reportingManager: user.id },
      select: { id: true }
    });
    whereClause.employeeId = {
      in: [user.id, ...teamMembers.map(m => m.id)]
    };
  }

  if (employeeIds?.length) {
    whereClause.employeeId = { in: employeeIds };
  }
  
  if (status) {
    whereClause.submissionStatus = status;
  }

  let jobWhere: any = {};
  if (projectIds?.length) {
    jobWhere.projectId = { in: projectIds };
  }

  const timelogs = await prisma.timelog.findMany({
    where: {
      ...whereClause,
      job: jobWhere
    },
    select: {
      date: true,
      hours: true,
      employee: {
        select: { id: true, firstName: true, lastName: true }
      },
      job: {
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  // Group by granularity
  const trendData = timelogs.reduce((acc, log) => {
    let dateKey: string;
    const date = new Date(log.date);
    
    switch (granularity) {
      case 'weekly':
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        dateKey = format(weekStart, 'yyyy-MM-dd');
        break;
      case 'monthly':
        const monthStart = startOfMonth(date);
        dateKey = format(monthStart, 'yyyy-MM');
        break;
      default: // daily
        dateKey = format(date, 'yyyy-MM-dd');
    }

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        totalHours: 0,
        employeeCount: new Set(),
        projects: new Set(),
        breakdown: [] as any[]
      };
    }

    acc[dateKey].totalHours += log.hours;
    acc[dateKey].employeeCount.add(log.employee.id);
    acc[dateKey].projects.add(log.job.project.id);
    
    acc[dateKey].breakdown.push({
      hours: log.hours,
      employee: `${log.employee.firstName} ${log.employee.lastName || ''}`.trim(),
      project: log.job.project.name
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and format
  return Object.values(trendData).map((item: any) => ({
    date: item.date,
    totalHours: item.totalHours,
    employeeCount: item.employeeCount.size,
    projectCount: item.projects.size,
    breakdown: item.breakdown
  }));
};
