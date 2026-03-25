const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addAdmin() {
  try {
    console.log('🔧 Adding admin user to database...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const admin = await prisma.employee.create({
      data: {
        employeeId: 'ADMIN001',
        firstName: 'Admin',
        lastName: 'User',
        officeEmail: 'admin@timesheet.com',
        designation: 'System Administrator',
        role: 'admin',
        status: 'active',
        password: hashedPassword,
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@timesheet.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 Employee ID:', admin.employeeId);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin();
