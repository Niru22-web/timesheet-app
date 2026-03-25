import { PrismaClient } from '@prisma/client';
import { generateCombinedId } from '../../utils/jobIdGenerator';

const prisma = new PrismaClient();

export class TimelogWeeklyService {
  // Helper function to get week start date
  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Helper function to get week end date
  getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  }

  // Helper function to get week range
  getWeekRange(date: Date): { weekStart: Date; weekEnd: Date; weekLabel: string } {
    const weekStart = this.getWeekStart(date);
    const weekEnd = this.getWeekEnd(date);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
      });
    };
    
    const weekLabel = `${formatDate(weekStart)} – ${formatDate(weekEnd)}`;
    
    return { weekStart, weekEnd, weekLabel };
  }

  async getWeeklyTimesheets(employeeId: string, weekDate: string, filters?: any) {
    try {
      const targetDate = new Date(weekDate);
      const { weekStart, weekEnd } = this.getWeekRange(targetDate);

      let whereClause: any = {
        employeeId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      };

      // Apply filters
      if (filters) {
        // Client filter
        if (filters.clientId) {
          whereClause.clientId = filters.clientId;
        }

        // Project filter
        if (filters.projectId) {
          whereClause.projectId = filters.projectId;
        }

        // Job filter
        if (filters.jobId) {
          whereClause.jobId = filters.jobId;
        }

        // Work description filter
        if (filters.workDescription) {
          whereClause.description = {
            contains: filters.workDescription,
            mode: 'insensitive'
          };
        }

        // Billable status filter
        if (filters.billableStatus) {
          whereClause.billableStatus = filters.billableStatus;
        }

        // Submission status filter
        if (filters.submissionStatus) {
          whereClause.submissionStatus = filters.submissionStatus;
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
          date: 'asc'
        }
      });

      // Group by date
      const groupedByDate = new Map();
      timelogs.forEach(timelog => {
        const dateKey = timelog.date.toISOString().split('T')[0];
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, []);
        }
        groupedByDate.get(dateKey).push(timelog);
      });

      // Calculate totals
      const totalHours = timelogs.reduce((sum, log) => sum + log.hours, 0);
      const submittedHours = timelogs
        .filter(log => log.submissionStatus === 'submitted' || log.submissionStatus === 'approved')
        .reduce((sum, log) => sum + log.hours, 0);
      const notSubmittedHours = timelogs
        .filter(log => log.submissionStatus === 'not_submitted')
        .reduce((sum, log) => sum + log.hours, 0);

      // Calculate billable breakdown
      const billableHours = timelogs
        .filter(log => log.billableStatus === 'billable')
        .reduce((sum, log) => sum + log.hours, 0);
      const nonBillableHours = timelogs
        .filter(log => log.billableStatus === 'non-billable')
        .reduce((sum, log) => sum + log.hours, 0);

      return {
        weekRange: {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          weekLabel: this.getWeekRange(targetDate).weekLabel
        },
        timelogs: Object.fromEntries(groupedByDate),
        totals: {
          totalHours,
          submittedHours,
          notSubmittedHours,
          billableHours,
          nonBillableHours,
          totalEntries: timelogs.length
        },
        summary: {
          daysWorked: groupedByDate.size,
          averageHoursPerDay: groupedByDate.size > 0 ? totalHours / groupedByDate.size : 0
        }
      };
    } catch (error) {
      console.error('Error fetching weekly timesheets:', error);
      throw error;
    }
  }

  async getWeeklyTimesheetsForManager(managerEmail: string, weekDate: string, filters?: any) {
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

      const targetDate = new Date(weekDate);
      const { weekStart, weekEnd } = this.getWeekRange(targetDate);

      let whereClause: any = {
        employeeId: {
          in: employeeIds
        },
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      };

      // Apply filters
      if (filters) {
        if (filters.employeeId) {
          whereClause.employeeId = filters.employeeId;
        }
        if (filters.clientId) {
          whereClause.clientId = filters.clientId;
        }
        if (filters.projectId) {
          whereClause.projectId = filters.projectId;
        }
        if (filters.jobId) {
          whereClause.jobId = filters.jobId;
        }
        if (filters.workDescription) {
          whereClause.description = {
            contains: filters.workDescription,
            mode: 'insensitive'
          };
        }
        if (filters.billableStatus) {
          whereClause.billableStatus = filters.billableStatus;
        }
        if (filters.submissionStatus) {
          whereClause.submissionStatus = filters.submissionStatus;
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
        orderBy: [
          { employee: { firstName: 'asc' } },
          { date: 'asc' }
        ]
      });

      // Group by employee then by date
      const groupedByEmployee = new Map();
      timelogs.forEach(timelog => {
        const employeeKey = timelog.employee.id;
        if (!groupedByEmployee.has(employeeKey)) {
          groupedByEmployee.set(employeeKey, {
            employee: timelog.employee,
            timelogs: new Map(),
            totals: {
              totalHours: 0,
              submittedHours: 0,
              notSubmittedHours: 0,
              billableHours: 0,
              nonBillableHours: 0,
              totalEntries: 0
            }
          });
        }

        const employeeData = groupedByEmployee.get(employeeKey);
        const dateKey = timelog.date.toISOString().split('T')[0];
        
        if (!employeeData.timelogs.has(dateKey)) {
          employeeData.timelogs.set(dateKey, []);
        }
        employeeData.timelogs.get(dateKey).push(timelog);

        // Update totals
        employeeData.totals.totalHours += timelog.hours;
        employeeData.totals.totalEntries += 1;
        
        if (timelog.submissionStatus === 'submitted' || timelog.submissionStatus === 'approved') {
          employeeData.totals.submittedHours += timelog.hours;
        } else {
          employeeData.totals.notSubmittedHours += timelog.hours;
        }
        
        if (timelog.billableStatus === 'billable') {
          employeeData.totals.billableHours += timelog.hours;
        } else {
          employeeData.totals.nonBillableHours += timelog.hours;
        }
      });

      // Convert Maps to objects
      const result = Object.fromEntries(groupedByEmployee);
      Object.values(result).forEach((employeeData: any) => {
        employeeData.timelogs = Object.fromEntries(employeeData.timelogs);
        employeeData.summary = {
          daysWorked: Object.keys(employeeData.timelogs).length,
          averageHoursPerDay: Object.keys(employeeData.timelogs).length > 0 
            ? employeeData.totals.totalHours / Object.keys(employeeData.timelogs).length 
            : 0
        };
      });

      return {
        weekRange: {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          weekLabel: this.getWeekRange(targetDate).weekLabel
        },
        employees: result,
        totals: {
          totalEmployees: Object.keys(result).length,
          totalHours: Object.values(result).reduce((sum: number, emp: any) => sum + emp.totals.totalHours, 0),
          totalEntries: Object.values(result).reduce((sum: number, emp: any) => sum + emp.totals.totalEntries, 0)
        }
      };
    } catch (error) {
      console.error('Error fetching weekly timesheets for manager:', error);
      throw error;
    }
  }

  async createTimelogWithWorkflow(timelogData: any, employeeId: string) {
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

      // Validate job exists and get hierarchy information
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

      // Calculate week start
      const weekStart = this.getWeekStart(workDate);

      // Generate combined job code
      const combinedJobCode = generateCombinedId(
        job.project.client.clientId,
        job.project.projectId || '',
        job.jobId
      );

      const timelog = await prisma.timelog.create({
        data: {
          hours: timelogData.hours,
          description: timelogData.description,
          workItem: timelogData.workItem || null,
          date: workDate,
          billableStatus: timelogData.billableStatus || 'billable',
          submissionStatus: 'not_submitted',
          weekStart,
          employeeId,
          jobId: timelogData.jobId,
          clientId: job.project.client.id,
          projectId: job.project.id,
          combinedJobCode,
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

      return {
        ...timelog,
        combinedId: combinedJobCode
      };
    } catch (error) {
      console.error('Error creating timelog with workflow:', error);
      throw error;
    }
  }

  async submitWeeklyTimesheet(employeeId: string, weekDate: string) {
    try {
      const targetDate = new Date(weekDate);
      const { weekStart, weekEnd } = this.getWeekRange(targetDate);

      // Update all not_submitted timelogs for this week to submitted
      const result = await prisma.timelog.updateMany({
        where: {
          employeeId,
          weekStart,
          date: {
            gte: weekStart,
            lte: weekEnd
          },
          submissionStatus: 'not_submitted'
        },
        data: {
          submissionStatus: 'submitted',
          submittedAt: new Date()
        }
      });

      return {
        message: 'Weekly timesheet submitted successfully',
        entriesSubmitted: result.count,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error submitting weekly timesheet:', error);
      throw error;
    }
  }

  async approveWeeklyTimesheet(approverId: string, employeeId: string, weekDate: string) {
    try {
      const targetDate = new Date(weekDate);
      const { weekStart } = this.getWeekRange(targetDate);

      // Update all submitted timelogs for this week to approved
      const result = await prisma.timelog.updateMany({
        where: {
          employeeId,
          weekStart,
          submissionStatus: 'submitted'
        },
        data: {
          submissionStatus: 'approved',
          approvedBy: approverId,
          approvedAt: new Date()
        }
      });

      return {
        message: 'Weekly timesheet approved successfully',
        entriesApproved: result.count,
        weekStart: weekStart.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error approving weekly timesheet:', error);
      throw error;
    }
  }

  async getWeeklySubmissionStatus(employeeId: string, weekDate: string) {
    try {
      const targetDate = new Date(weekDate);
      const { weekStart, weekEnd } = this.getWeekRange(targetDate);

      const timelogs = await prisma.timelog.findMany({
        where: {
          employeeId,
          date: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        select: {
          submissionStatus: true,
          hours: true
        }
      });

      const totalHours = timelogs.reduce((sum, log) => sum + log.hours, 0);
      const submittedHours = timelogs
        .filter(log => log.submissionStatus === 'submitted' || log.submissionStatus === 'approved')
        .reduce((sum, log) => sum + log.hours, 0);
      const notSubmittedHours = timelogs
        .filter(log => log.submissionStatus === 'not_submitted')
        .reduce((sum, log) => sum + log.hours, 0);

      const hasSubmittedEntries = timelogs.some(log => 
        log.submissionStatus === 'submitted' || log.submissionStatus === 'approved'
      );
      const hasNotSubmittedEntries = timelogs.some(log => 
        log.submissionStatus === 'not_submitted'
      );

      return {
        totalHours,
        submittedHours,
        notSubmittedHours,
        totalEntries: timelogs.length,
        canSubmit: hasNotSubmittedEntries,
        isFullySubmitted: !hasNotSubmittedEntries && timelogs.length > 0,
        hasEntries: timelogs.length > 0,
        weekRange: {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          weekLabel: this.getWeekRange(targetDate).weekLabel
        }
      };
    } catch (error) {
      console.error('Error getting weekly submission status:', error);
      throw error;
    }
  }
}
