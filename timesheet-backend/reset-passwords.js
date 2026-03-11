const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    console.log('🔑 Resetting passwords for testing...\n');

    // Reset Admin password
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.employee.update({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
      data: { password: adminPassword }
    });
    console.log('✅ Admin password reset to: admin123');

    // Reset Partner password  
    const partnerPassword = await bcrypt.hash('partner123', 10);
    await prisma.employee.update({
      where: { officeEmail: 'netrawati.indulkar@asaind.co.in' },
      data: { password: partnerPassword }
    });
    console.log('✅ Partner password reset to: partner123');

    // Reset Employee password
    const employeePassword = await bcrypt.hash('employee123', 10);
    await prisma.employee.update({
      where: { officeEmail: 'lisa.wilson@company.com' },
      data: { password: employeePassword }
    });
    console.log('✅ Employee password reset to: employee123');

    console.log('\n🎉 All passwords have been reset!');
    console.log('\n📋 Login Credentials:');
    console.log('👨‍💼 Admin: niranjan.mulam@asaind.co.in / admin123');
    console.log('🤝 Partner: netrawati.indulkar@asaind.co.in / partner123');
    console.log('👩‍💼 Employee: lisa.wilson@company.com / employee123');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    await prisma.$disconnect();
  }
}

resetPasswords();
