const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestRegularUser() {
  try {
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    const user = await prisma.employee.create({
      data: {
        employeeId: 'USR001',
        firstName: 'Regular',
        lastName: 'User',
        officeEmail: 'regular.user@company.com',
        designation: 'Developer',
        role: 'user',
        status: 'active',
        password: hashedPassword,
      }
    });
    
    console.log('✅ Regular user created:', user.officeEmail);
    console.log('🔑 Password: user123');
    
  } catch (error) {
    console.error('❌ Error creating regular user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRegularUser();
