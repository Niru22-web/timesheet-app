const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const adminEmail = 'lisa.wilson@company.com';
    console.log('🔍 Checking admin user:', adminEmail);
    
    const user = await prisma.employee.findUnique({
      where: { officeEmail: adminEmail }
    });
    
    if (user) {
      console.log('✅ Admin user found:', {
        id: user.id,
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.officeEmail,
        role: user.role,
        status: user.status
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
