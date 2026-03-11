import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true,
        password: true
      }
    });
    
    console.log('User found:', user);
    
    const allUsers = await prisma.employee.findMany({
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true
      }
    });
    
    console.log('All users:', allUsers);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
