const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createActiveAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.employee.create({
      data: {
        employeeId: 'ADMIN001',
        firstName: 'Admin',
        lastName: 'User',
        officeEmail: 'admin.user@company.com',
        designation: 'System Administrator',
        role: 'Admin',
        status: 'active',
        password: hashedPassword,
      }
    });
    
    console.log('✅ Admin user created:', user.officeEmail);
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createActiveAdmin();
