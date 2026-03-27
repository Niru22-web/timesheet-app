const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function setAdminPassword() {
  try {
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
    });
    
    if (user) {
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.employee.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Admin password updated successfully!');
      console.log(`  - Email: ${user.officeEmail}`);
      console.log(`  - New Password: ${newPassword}`);
      console.log('You can now login with these credentials.');
    } else {
      console.log('❌ Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
