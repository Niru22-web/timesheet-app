const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserExists() {
  try {
    const userId = '9d8fa7a7-0a8b-4e19-84f9-3127748ddaf3';
    console.log('🔍 Checking if user exists:', userId);
    
    const user = await prisma.employee.findUnique({
      where: { id: userId }
    });
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        employeeId: user.employeeId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.officeEmail,
        role: user.role
      });
    } else {
      console.log('❌ User not found');
      
      // Check all users
      const allUsers = await prisma.employee.findMany({
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          officeEmail: true,
          role: true
        }
      });
      
      console.log('📋 All users in database:', allUsers.length);
      allUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUserExists();
