const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickTest() {
  try {
    const users = await prisma.employee.findMany({ take: 1 });
    if (users.length > 0) {
      const user = users[0];
      console.log('Found user:', user.firstName, user.lastName, '(', user.role, ')');
      
      // Create permission record
      const permission = await prisma.userPermission.upsert({
        where: { userId: user.id },
        update: { dashboard: true, timesheet: true, employees: true, projects: true, reports: true },
        create: { 
          userId: user.id, 
          dashboard: true, 
          timesheet: true, 
          employees: true, 
          projects: true, 
          reports: true 
        }
      });
      console.log('✅ Permission record created:', permission.id);
    } else {
      console.log('No users found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
