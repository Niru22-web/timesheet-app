const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkTestUser() {
  try {
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'test.user@company.com' },
    });
    
    console.log('🔍 Test user lookup:');
    if (user) {
      console.log(`  - Found: ${user.firstName} ${user.lastName}`);
      console.log(`  - Status: ${user.status}`);
      console.log(`  - Has Password: ${!!user.password}`);
      console.log(`  - Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'None'}`);
      
      // Test password comparison
      const testPassword = 'password123';
      console.log(`  - Testing password: ${testPassword}`);
      
      if (user.password) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`  - Password valid: ${isValid}`);
      }
    } else {
      console.log('  - User not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUser();
