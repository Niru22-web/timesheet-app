import { PrismaClient } from '@prisma/client';
import { generateProjectId } from '../../utils/projectIdGenerator';

const prisma = new PrismaClient();

export class ProjectService {
  async getAllProjects() {
    try {
      const projects = await prisma.project.findMany({
        include: {
          client: {
            select: {
              id: true,
              clientId: true,
              name: true,
              alias: true
            }
          },
          _count: {
            select: {
              jobs: true,
              users: true,
              attachments: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(id: string) {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          client: true,
          jobs: {
            include: {
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
                }
              }
            }
          },
          users: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeId: true,
                  officeEmail: true,
                  designation: true
                }
              }
            }
          },
          attachments: true
        }
      });

      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(projectData: any, attachments?: any[], userEmail?: string) {
    try {
      // Generate unique project ID
      const projectId = generateProjectId();

      // Check if projectId already exists
      const existingProject = await prisma.project.findUnique({
        where: { projectId }
      });

      if (existingProject) {
        throw new Error('Project ID already exists');
      }

      // Validate dates
      if (projectData.endDate && new Date(projectData.endDate) < new Date(projectData.startDate)) {
        throw new Error('End date cannot be earlier than start date');
      }

      // Validate client exists
      const client = await prisma.client.findUnique({
        where: { id: projectData.clientId }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      const project = await prisma.project.create({
        data: {
          projectId,
          name: projectData.name,
          status: projectData.status || 'Active',
          startDate: new Date(projectData.startDate),
          endDate: projectData.endDate ? new Date(projectData.endDate) : null,
          billable: projectData.billable === true,
          contactPerson: projectData.contactPerson || null,
          createdBy: userEmail || null,
          clientId: projectData.clientId
        },
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

      // Handle attachments if provided
      if (attachments && attachments.length > 0) {
        const attachmentData = attachments.map(attachment => ({
          projectId: project.id,
          fileName: attachment.originalname,
          filePath: attachment.path,
          fileSize: attachment.size,
          mimeType: attachment.mimetype,
          uploadedBy: userEmail
        }));

        await prisma.projectAttachment.createMany({
          data: attachmentData
        });
      }

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: any) {
    try {
      // Validate dates
      if (projectData.endDate && projectData.startDate) {
        if (new Date(projectData.endDate) < new Date(projectData.startDate)) {
          throw new Error('End date cannot be earlier than start date');
        }
      }

      // Validate client exists if being updated
      if (projectData.clientId) {
        const client = await prisma.client.findUnique({
          where: { id: projectData.clientId }
        });

        if (!client) {
          throw new Error('Client not found');
        }
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          name: projectData.name,
          status: projectData.status,
          startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
          endDate: projectData.endDate ? new Date(projectData.endDate) : null,
          billable: projectData.billable,
          contactPerson: projectData.contactPerson,
          clientId: projectData.clientId
        },
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

      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      // Check if project has associated jobs or timelogs
      const jobCount = await prisma.job.count({
        where: { projectId: id }
      });

      const timelogCount = await prisma.timelog.count({
        where: {
          job: {
            projectId: id
          }
        }
      });

      if (jobCount > 0 || timelogCount > 0) {
        throw new Error(`Cannot delete project with ${jobCount} jobs and ${timelogCount} timelogs. Please delete associated records first.`);
      }

      // Delete attachments first
      await prisma.projectAttachment.deleteMany({
        where: { projectId: id }
      });

      // Delete project users
      await prisma.projectUser.deleteMany({
        where: { projectId: id }
      });

      // Delete the project
      await prisma.project.delete({
        where: { id }
      });

      return { message: 'Project deleted successfully' };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async getProjectAttachments(projectId: string) {
    try {
      const attachments = await prisma.projectAttachment.findMany({
        where: { projectId },
        orderBy: { uploadedAt: 'desc' }
      });

      return attachments;
    } catch (error) {
      console.error('Error fetching project attachments:', error);
      throw error;
    }
  }

  async addProjectAttachment(projectId: string, attachment: any, userEmail?: string) {
    try {
      const projectAttachment = await prisma.projectAttachment.create({
        data: {
          projectId,
          fileName: attachment.originalname,
          filePath: attachment.path,
          fileSize: attachment.size,
          mimeType: attachment.mimetype,
          uploadedBy: userEmail
        }
      });

      return projectAttachment;
    } catch (error) {
      console.error('Error adding project attachment:', error);
      throw error;
    }
  }

  async deleteProjectAttachment(attachmentId: string) {
    try {
      await prisma.projectAttachment.delete({
        where: { id: attachmentId }
      });

      return { message: 'Attachment deleted successfully' };
    } catch (error) {
      console.error('Error deleting project attachment:', error);
      throw error;
    }
  }

  async searchProjects(query: string, filters?: any) {
    try {
      let whereClause: any = {};

      // Text search
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { projectId: { contains: query, mode: 'insensitive' } },
          { client: { name: { contains: query, mode: 'insensitive' } } },
          { client: { alias: { contains: query, mode: 'insensitive' } } },
          { contactPerson: { contains: query, mode: 'insensitive' } }
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
        whereClause.clientId = filters.clientId;
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
          },
          _count: {
            select: {
              jobs: true,
              users: true,
              attachments: true
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return projects;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
}