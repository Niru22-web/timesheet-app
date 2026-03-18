const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setPassword() {
  try {
    const email = 'niranjan.mulam@asaind.co.in';
    const newPassword = 'admin123';
    
    console.log('🔧 Setting password for user:', email);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    const updatedUser = await prisma.employee.update({
      where: { officeEmail: email },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password updated successfully for:', updatedUser.firstName, updatedUser.lastName);
    console.log('🔑 New password:', newPassword);
    console.log('📧 Email:', updatedUser.officeEmail);
    
  } catch (error) {
    console.error('❌ Error setting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
