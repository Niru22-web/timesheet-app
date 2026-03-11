const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    console.log('🔧 Updating admin user password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the existing admin user
    const updatedUser = await prisma.employee.update({
      where: { 
        officeEmail: 'niranjan.mulam@asaind.co.in' 
      },
      data: {
        password: hashedPassword,
      }
    });
    
    console.log('✅ Password updated successfully!');
    console.log('📧 Email: niranjan.mulam@asaind.co.in');
    console.log('🔑 New Password: admin123');
    console.log('🆔 Employee ID:', updatedUser.employeeId);
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
