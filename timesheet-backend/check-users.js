const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking database users...');
    
    const users = await prisma.employee.findMany({
      select: {
        firstName: true,
        lastName: true,
        employeeId: true,
        officeEmail: true,
        role: true,
        designation: true,
        status: true,
        password: true
      }
    });
    console.log(`📊 Total users in database: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 Current users:');
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.employeeId})`);
        console.log(`  📧 Email: ${user.officeEmail}`);
        console.log(`  👔 Role: ${user.role}`);
        console.log(`  📋 Designation: ${user.designation}`);
        console.log(`  ✅ Status: ${user.status}`);
        console.log(`  🔑 Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
