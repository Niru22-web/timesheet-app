import { PrismaClient } from '@prisma/client';
import { generateJobId, generateCombinedId } from '../../utils/jobIdGenerator';

const prisma = new PrismaClient();

export class JobService {
  async getAllJobs() {
    try {
      const jobs = await prisma.job.findMany({
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
          },
          _count: {
            select: {
              timelogs: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async getJobById(id: string) {
    try {
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              client: true
            }
          },
          timelogs: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeId: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          }
        }
      });

      return job;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async createJob(jobData: any, userEmail?: string) {
    try {
      // Generate unique job ID
      const jobId = generateJobId();

      // Check if jobId already exists
      const existingJob = await prisma.job.findUnique({
        where: { jobId }
      });

      if (existingJob) {
        throw new Error('Job ID already exists');
      }

      // Validate project exists and get project with client
      const project = await prisma.project.findUnique({
        where: { id: jobData.projectId },
        include: {
          client: true
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Generate combined ID for reference (stored in memory for now)
      const combinedId = generateCombinedId(
        project.client.clientId,
        project.projectId,
        jobId
      );

      // Note: combinedId will be stored in a future migration
      console.log('Generated Combined ID:', combinedId);

      // Validate dates
      if (jobData.endDate && jobData.startDate) {
        if (new Date(jobData.endDate) < new Date(jobData.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }

      const job = await prisma.job.create({
        data: {
          jobId,
          combinedId,
          name: jobData.name,
          description: jobData.description || null,
          status: jobData.status || 'Active',
          startDate: jobData.startDate ? new Date(jobData.startDate) : null,
          endDate: jobData.endDate ? new Date(jobData.endDate) : null,
          billable: jobData.billable === true,
          projectId: jobData.projectId,
          createdBy: userEmail || null
        },
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

      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: any) {
    try {
      // Validate dates
      if (jobData.endDate && jobData.startDate) {
        if (new Date(jobData.endDate) < new Date(jobData.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }

      // Validate project exists if being updated
      if (jobData.projectId) {
        const project = await prisma.project.findUnique({
          where: { id: jobData.projectId },
          include: {
            client: true
          }
        });

        if (!project) {
          throw new Error('Project not found');
        }

      }

      const job = await prisma.job.update({
        where: { id },
        data: {
          name: jobData.name,
          description: jobData.description,
          status: jobData.status,
          startDate: jobData.startDate ? new Date(jobData.startDate) : undefined,
          endDate: jobData.endDate ? new Date(jobData.endDate) : null,
          billable: jobData.billable,
          projectId: jobData.projectId
        },
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

      return job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string) {
    try {
      // Check if job has associated timelogs
      const timelogCount = await prisma.timelog.count({
        where: { jobId: id }
      });

      if (timelogCount > 0) {
        throw new Error(`Cannot delete job with ${timelogCount} timelogs. Please delete associated timelogs first.`);
      }

      await prisma.job.delete({
        where: { id }
      });

      return { message: 'Job deleted successfully' };
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async getJobsByProject(projectId: string) {
    try {
      const jobs = await prisma.job.findMany({
        where: { projectId },
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
          },
          _count: {
            select: {
              timelogs: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error fetching jobs by project:', error);
      throw error;
    }
  }

  async getJobsByClient(clientId: string) {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          project: {
            clientId
          }
        },
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
          },
          _count: {
            select: {
              timelogs: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error fetching jobs by client:', error);
      throw error;
    }
  }

  async searchJobs(query: string, filters?: any) {
    try {
      let whereClause: any = {};

      // Text search
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { jobId: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { project: { name: { contains: query, mode: 'insensitive' } } },
          { project: { client: { name: { contains: query, mode: 'insensitive' } } } }
        ];
      }

      // Status filter
      if (filters?.status) {
        whereClause.status = filters.status;
      }

      // Billable filter
      if (filters?.billable !== undefined) {
        whereClause.billable = filters.billable;
      }

      // Client filter
      if (filters?.clientId) {
        whereClause.project = {
          clientId: filters.clientId
        };
      }

      // Project filter
      if (filters?.projectId) {
        whereClause.projectId = filters.projectId;
      }

      // Date range filter
      if (filters?.startDateFrom || filters?.startDateTo) {
        whereClause.startDate = {};
        if (filters.startDateFrom) {
          whereClause.startDate.gte = new Date(filters.startDateFrom);
        }
        if (filters.startDateTo) {
          whereClause.startDate.lte = new Date(filters.startDateTo);
        }
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
          },
          _count: {
            select: {
              timelogs: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }
}