import { PrismaClient } from '@prisma/client';
import { generateCombinedId } from '../../utils/jobIdGenerator';

const prisma = new PrismaClient();

export class TimelogService {
  async getTimelogsByUser(employeeId: string, filters?: any) {
    try {
      let whereClause: any = { employeeId };

      // Apply filters
      if (filters) {
        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
          whereClause.date = {};
          if (filters.dateFrom) {
            whereClause.date.gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            whereClause.date.lte = new Date(filters.dateTo);
          }
        }

        // Client filter
        if (filters.clientId) {
          whereClause.job = {
            project: {
              clientId: filters.clientId
            }
          };
        }

        // Project filter
        if (filters.projectId) {
          whereClause.job = {
            projectId: filters.projectId
          };
        }

        // Job filter
        if (filters.jobId) {
          whereClause.jobId = filters.jobId;
        }
      }

      const timelogs = await prisma.timelog.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              reportingManager: true,
              reportingPartner: true
            }
          },
          reportingManager: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          reportingPartner: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          job: {
            include: {
              project: {
                include: {
                  client: {
                    select: {
                      id: true,
                      clientId: true,
                      name: true,
                      alias: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Add combined ID to each timelog
      return timelogs.map(timelog => ({
        ...timelog,
        combinedId: generateCombinedId(
          timelog.job.project.client.clientId,
          timelog.job.project.projectId || '',
          timelog.job.jobId
        )
      }));
    } catch (error) {
      console.error('Error fetching timelogs by user:', error);
      throw error;
    }
  }

  async getTimelogsForManager(managerEmail: string, filters?: any) {
    try {
      // Get employees reporting to this manager
      const reportingEmployees = await prisma.employee.findMany({
        where: {
          OR: [
            { reportingManager: managerEmail },
            { reportingPartner: managerEmail }
          ]
        },
        select: { id: true }
      });

      const employeeIds = reportingEmployees.map(emp => emp.id);

      let whereClause: any = {
        employeeId: {
          in: employeeIds
        }
      };

      // Apply filters
      if (filters) {
        // Employee filter
        if (filters.employeeId) {
          whereClause.employeeId = filters.employeeId;
        }

        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
          whereClause.date = {};
          if (filters.dateFrom) {
            whereClause.date.gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            whereClause.date.lte = new Date(filters.dateTo);
          }
        }

        // Client filter
        if (filters.clientId) {
          whereClause.job = {
            project: {
              clientId: filters.clientId
            }
          };
        }

        // Project filter
        if (filters.projectId) {
          whereClause.job = {
            projectId: filters.projectId
          };
        }

        // Job filter
        if (filters.jobId) {
          whereClause.jobId = filters.jobId;
        }
      }

      const timelogs = await prisma.timelog.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              reportingManager: true,
              reportingPartner: true
            }
          },
          reportingManager: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          reportingPartner: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          job: {
            include: {
              project: {
                include: {
                  client: {
                    select: {
                      id: true,
                      clientId: true,
                      name: true,
                      alias: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Add combined ID to each timelog
      return timelogs.map(timelog => ({
        ...timelog,
        combinedId: generateCombinedId(
          timelog.job.project.client.clientId,
          timelog.job.project.projectId || '',
          timelog.job.jobId
        )
      }));
    } catch (error) {
      console.error('Error fetching timelogs for manager:', error);
      throw error;
    }
  }

  async getAllTimelogs(filters?: any) {
    try {
      let whereClause: any = {};

      // Apply filters
      if (filters) {
        // Employee filter
        if (filters.employeeId) {
          whereClause.employeeId = filters.employeeId;
        }

        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
          whereClause.date = {};
          if (filters.dateFrom) {
            whereClause.date.gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            whereClause.date.lte = new Date(filters.dateTo);
          }
        }

        // Client filter
        if (filters.clientId) {
          whereClause.job = {
            project: {
              clientId: filters.clientId
            }
          };
        }

        // Project filter
        if (filters.projectId) {
          whereClause.job = {
            projectId: filters.projectId
          };
        }

        // Job filter
        if (filters.jobId) {
          whereClause.jobId = filters.jobId;
        }
      }

      const timelogs = await prisma.timelog.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              reportingManager: true,
              reportingPartner: true
            }
          },
          reportingManager: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          reportingPartner: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          job: {
            include: {
              project: {
                include: {
                  client: {
                    select: {
                      id: true,
                      clientId: true,
                      name: true,
                      alias: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Add combined ID to each timelog
      return timelogs.map(timelog => ({
        ...timelog,
        combinedId: generateCombinedId(
          timelog.job.project.client.clientId,
          timelog.job.project.projectId || '',
          timelog.job.jobId
        )
      }));
    } catch (error) {
      console.error('Error fetching all timelogs:', error);
      throw error;
    }
  }

  async createTimelog(timelogData: any, employeeId: string) {
    try {
      // Get employee information with reporting hierarchy
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          reportingManager: true,
          reportingPartner: true
        }
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get reporting manager and partner IDs
      let reportingManagerId = null;
      let reportingPartnerId = null;

      if (employee.reportingManager) {
        const manager = await prisma.employee.findUnique({
          where: { officeEmail: employee.reportingManager },
          select: { id: true }
        });
        reportingManagerId = manager?.id || null;
      }

      if (employee.reportingPartner) {
        const partner = await prisma.employee.findUnique({
          where: { officeEmail: employee.reportingPartner },
          select: { id: true }
        });
        reportingPartnerId = partner?.id || null;
      }

      // Validate job exists and user has access
      const job = await prisma.job.findUnique({
        where: { id: timelogData.jobId },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Validate hours
      if (typeof timelogData.hours !== 'number' || timelogData.hours <= 0 || timelogData.hours > 24) {
        throw new Error('Hours must be a positive number between 0 and 24');
      }

      // Validate date
      const workDate = new Date(timelogData.date);
      if (isNaN(workDate.getTime())) {
        throw new Error('Invalid date format');
      }

      // Check if date is not in future
      if (workDate > new Date()) {
        throw new Error('Cannot log time for future dates');
      }

      const timelog = await prisma.timelog.create({
        data: {
          hours: timelogData.hours,
          description: timelogData.description,
          date: workDate,
          employeeId,
          jobId: timelogData.jobId,
          reportingManagerId,
          reportingPartnerId
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              reportingManager: true,
              reportingPartner: true
            }
          },
          reportingManager: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          reportingPartner: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          job: {
            include: {
              project: {
                include: {
                  client: {
                    select: {
                      id: true,
                      clientId: true,
                      name: true,
                      alias: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Add combined ID
      const combinedId = generateCombinedId(
        timelog.job.project.client.clientId,
        timelog.job.project.projectId || '',
        timelog.job.jobId
      );

      return {
        ...timelog,
        combinedId
      };
    } catch (error) {
      console.error('Error creating timelog:', error);
      throw error;
    }
  }

  async updateTimelog(id: string, timelogData: any, employeeId: string, userRole: string) {
    try {
      // Check if timelog exists and user has permission
      const existingTimelog = await prisma.timelog.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              officeEmail: true
            }
          }
        }
      });

      if (!existingTimelog) {
        throw new Error('Timelog not found');
      }

      // Check permissions (only owner or admin/manager can update)
      if (existingTimelog.employeeId !== employeeId && 
          !['Admin', 'Manager', 'Partner', 'Owner'].includes(userRole)) {
        throw new Error('You can only update your own timelogs');
      }

      // Validate job exists if being updated
      if (timelogData.jobId) {
        const job = await prisma.job.findUnique({
          where: { id: timelogData.jobId }
        });

        if (!job) {
          throw new Error('Job not found');
        }
      }

      // Validate hours if provided
      if (timelogData.hours !== undefined) {
        if (typeof timelogData.hours !== 'number' || timelogData.hours <= 0 || timelogData.hours > 24) {
          throw new Error('Hours must be a positive number between 0 and 24');
        }
      }

      // Validate date if provided
      if (timelogData.date !== undefined) {
        const workDate = new Date(timelogData.date);
        if (isNaN(workDate.getTime())) {
          throw new Error('Invalid date format');
        }

        if (workDate > new Date()) {
          throw new Error('Cannot log time for future dates');
        }

        timelogData.date = workDate;
      }

      const timelog = await prisma.timelog.update({
        where: { id },
        data: timelogData,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              reportingManager: true,
              reportingPartner: true
            }
          },
          reportingManager: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          reportingPartner: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              officeEmail: true
            }
          },
          job: {
            include: {
              project: {
                include: {
                  client: {
                    select: {
                      id: true,
                      clientId: true,
                      name: true,
                      alias: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Add combined ID
      const combinedId = generateCombinedId(
        timelog.job.project.client.clientId,
        timelog.job.project.projectId || '',
        timelog.job.jobId
      );

      return {
        ...timelog,
        combinedId
      };
    } catch (error) {
      console.error('Error updating timelog:', error);
      throw error;
    }
  }

  async deleteTimelog(id: string, employeeId: string, userRole: string) {
    try {
      // Check if timelog exists and user has permission
      const existingTimelog = await prisma.timelog.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              officeEmail: true
            }
          }
        }
      });

      if (!existingTimelog) {
        throw new Error('Timelog not found');
      }

      // Check permissions (only owner or admin/manager can delete)
      if (existingTimelog.employeeId !== employeeId && 
          !['Admin', 'Manager', 'Partner', 'Owner'].includes(userRole)) {
        throw new Error('You can only delete your own timelogs');
      }

      await prisma.timelog.delete({
        where: { id }
      });

      return { message: 'Timelog deleted successfully' };
    } catch (error) {
      console.error('Error deleting timelog:', error);
      throw error;
    }
  }

  async getAccessibleClients(employeeId: string) {
    try {
      // Get all jobs assigned to the employee through project assignments
      const jobs = await prisma.job.findMany({
        where: {
          project: {
            users: {
              some: {
                employeeId
              }
            }
          }
        },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      });

      // Extract unique clients
      const clients = new Map();
      jobs.forEach(job => {
        const client = job.project.client;
        if (!clients.has(client.id)) {
          clients.set(client.id, {
            id: client.id,
            clientId: client.clientId,
            name: client.name,
            alias: client.alias
          });
        }
      });

      return Array.from(clients.values());
    } catch (error) {
      console.error('Error fetching accessible clients:', error);
      throw error;
    }
  }

  async getAccessibleProjects(employeeId: string, clientId?: string) {
    try {
      let whereClause: any = {
        users: {
          some: {
            employeeId
          }
        }
      };

      if (clientId) {
        whereClause.clientId = clientId;
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              clientId: true,
              name: true,
              alias: true
            }
          }
        }
      });

      return projects;
    } catch (error) {
      console.error('Error fetching accessible projects:', error);
      throw error;
    }
  }

  async getAccessibleJobs(employeeId: string, projectId?: string) {
    try {
      let whereClause: any = {};

      if (projectId) {
        whereClause.projectId = projectId;
      } else {
        // Get jobs from all projects assigned to employee
        const assignedProjects = await prisma.project.findMany({
          where: {
            users: {
              some: {
                employeeId
              }
            }
          },
          select: { id: true }
        });

        whereClause.projectId = {
          in: assignedProjects.map(p => p.id)
        };
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          project: {
            include: {
              client: {
                select: {
                  id: true,
                  clientId: true,
                  name: true,
                  alias: true
                }
              }
            }
          }
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error fetching accessible jobs:', error);
      throw error;
    }
  }

  async bulkCreateTimelogs(timelogs: any[], employeeId: string) {
    try {
      const results: {
        success: any[];
        errors: Array<{
          row: any;
          error: string;
          data: any;
        }>;
      } = {
        success: [],
        errors: []
      };

      for (const timelogData of timelogs) {
        try {
          const timelog = await this.createTimelog(timelogData, employeeId);
          results.success.push(timelog);
        } catch (error: any) {
          results.errors.push({
            row: timelogData.row || 'Unknown',
            error: error.message,
            data: timelogData
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk timelog creation:', error);
      throw error;
    }
  }

  async getTimesheetReports(userEmail: string, userRole: string, filters?: any) {
    try {
      let timelogs;

      // Role-based data access
      if (['Admin', 'Partner', 'Owner'].includes(userRole)) {
        timelogs = await this.getAllTimelogs(filters);
      } else if (['Manager'].includes(userRole)) {
        timelogs = await this.getTimelogsForManager(userEmail, filters);
      } else {
        // Regular users can only see their own timelogs
        const employee = await prisma.employee.findUnique({
          where: { officeEmail: userEmail },
          select: { id: true }
        });
        if (employee) {
          timelogs = await this.getTimelogsByUser(employee.id, filters);
        } else {
          timelogs = [];
        }
      }

      // Calculate reports
      const totalHours = timelogs.reduce((sum, log) => sum + log.hours, 0);
      
      // Client-wise hours
      const clientHours = new Map();
      timelogs.forEach(log => {
        const clientName = log.job.project.client.name;
        clientHours.set(clientName, (clientHours.get(clientName) || 0) + log.hours);
      });

      // Project-wise hours
      const projectHours = new Map();
      timelogs.forEach(log => {
        const projectName = log.job.project.name;
        projectHours.set(projectName, (projectHours.get(projectName) || 0) + log.hours);
      });

      // Job-wise hours
      const jobHours = new Map();
      timelogs.forEach(log => {
        const jobName = log.job.name;
        jobHours.set(jobName, (jobHours.get(jobName) || 0) + log.hours);
      });

      return {
        totalHours,
        totalEntries: timelogs.length,
        clientHours: Array.from(clientHours.entries()).map(([name, hours]) => ({ name, hours })),
        projectHours: Array.from(projectHours.entries()).map(([name, hours]) => ({ name, hours })),
        jobHours: Array.from(jobHours.entries()).map(([name, hours]) => ({ name, hours })),
        timelogs
      };
    } catch (error) {
      console.error('Error generating timesheet reports:', error);
      throw error;
    }
  }

  async getMissingTimesheets(userEmail: string, userRole: string, dateFrom: string, dateTo: string) {
    try {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      // Get all employees based on role
      let employees;
      if (['Admin', 'Partner', 'Owner'].includes(userRole)) {
        employees = await prisma.employee.findMany({
          where: { status: 'active' },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            reportingManager: true,
            reportingPartner: true
          }
        });
      } else if (['Manager'].includes(userRole)) {
        employees = await prisma.employee.findMany({
          where: {
            status: 'active',
            OR: [
              { reportingManager: userEmail },
              { reportingPartner: userEmail },
              { officeEmail: userEmail }
            ]
          },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            reportingManager: true,
            reportingPartner: true
          }
        });
      } else {
        // Regular users can only see their own missing timesheets
        employees = await prisma.employee.findMany({
          where: { 
            status: 'active',
            officeEmail: userEmail 
          },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            reportingManager: true,
            reportingPartner: true
          }
        });
      }

      // Get timelogs for the date range
      const timelogs = await prisma.timelog.findMany({
        where: {
          date: {
            gte: fromDate,
            lte: toDate
          },
          employeeId: {
            in: employees.map(emp => emp.id)
          }
        },
        select: {
          employeeId: true,
          date: true,
          hours: true
        }
      });

      // Group timelogs by employee and date
      const timelogMap = new Map();
      timelogs.forEach(log => {
        const key = `${log.employeeId}-${log.date.toISOString().split('T')[0]}`;
        timelogMap.set(key, log);
      });

      // Generate missing timesheet entries
      const missingEntries = [];
      const currentDate = new Date(fromDate);

      while (currentDate <= toDate) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          employees.forEach(employee => {
            const key = `${employee.id}-${dateStr}`;
            const timelog = timelogMap.get(key);
            
            if (!timelog || timelog.hours === 0) {
              missingEntries.push({
                employee,
                date: dateStr,
                hasEntry: !!timelog,
                totalHours: timelog?.hours || 0
              });
            }
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return missingEntries;
    } catch (error) {
      console.error('Error fetching missing timesheets:', error);
      throw error;
    }
  }
}
