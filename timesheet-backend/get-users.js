const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.employee.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        designation: true
      }
    });
    
    console.log('🔑 Active User Credentials:');
    users.forEach(user => {
      console.log('👤', user.firstName, user.lastName);
      console.log('   Employee ID:', user.employeeId);
      console.log('   Email:', user.officeEmail);
      console.log('   Role:', user.role);
      console.log('   Designation:', user.designation);
      console.log('---');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

getUsers();
