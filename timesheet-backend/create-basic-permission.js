const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBasicPermission() {
  try {
    const users = await prisma.employee.findMany({ take: 1 });
    if (users.length > 0) {
      const user = users[0];
      console.log('Creating permission for:', user.firstName, user.lastName);
      
      // Try with just the basic fields we know exist
      const permission = await prisma.userPermission.create({
        data: {
          userId: user.id,
          dashboard: true,
          timesheet: true,
          projects: true,
          reports: true
        }
      });
      
      console.log('✅ Permission created:', permission.id);
      console.log('Fields created:', Object.keys(permission));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createBasicPermission();
