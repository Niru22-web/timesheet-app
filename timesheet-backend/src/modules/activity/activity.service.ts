import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const logActivity = async (data: {
  type: string;
  title: string;
  description: string;
  userId?: string;
  relatedId?: string;
}) => {
  try {
    return await prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        userId: data.userId,
        relatedId: data.relatedId,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking main workflow
  }
};

export const getRecentActivities = async (limit: number = 10) => {
  try {
    return await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

export const getMyActivities = async (userId: string, limit: number = 10) => {
  try {
    return await prisma.activity.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};
