const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
    });
    
    console.log('🔍 Admin user lookup:');
    if (user) {
      console.log(`  - Found: ${user.firstName} ${user.lastName}`);
      console.log(`  - Status: ${user.status}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Has Password: ${!!user.password}`);
      console.log(`  - Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'None'}`);
      
      // Test password comparison
      const testPassword = 'password123';
      console.log(`  - Testing password: ${testPassword}`);
      
      if (user.password) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`  - Password valid: ${isValid}`);
        
        // Try other common passwords
        const otherPasswords = ['admin', 'password', '123456', 'niranjan', 'asa123'];
        for (const pwd of otherPasswords) {
          const valid = await bcrypt.compare(pwd, user.password);
          if (valid) {
            console.log(`  - ✅ Found correct password: ${pwd}`);
            break;
          }
        }
      }
    } else {
      console.log('  - Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
