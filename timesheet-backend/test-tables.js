const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTables() {
  try {
    console.log('🔍 Testing UserPermission table...');
    
    // Test UserPermission table
    try {
      const userPermissions = await prisma.userPermission.findMany({
        take: 1
      });
      console.log('✅ UserPermission table accessible, count:', userPermissions.length);
    } catch (error) {
      console.error('❌ UserPermission table error:', error.message);
    }

    console.log('🔍 Testing Notification table...');
    
    // Test Notification table
    try {
      const notifications = await prisma.notification.findMany({
        take: 1
      });
      console.log('✅ Notification table accessible, count:', notifications.length);
    } catch (error) {
      console.error('❌ Notification table error:', error.message);
    }

    console.log('🔍 Testing Employee table...');
    
    // Test Employee table
    try {
      const employees = await prisma.employee.findMany({
        take: 1,
        select: {
          id: true,
          firstName: true,
          role: true
        }
      });
      console.log('✅ Employee table accessible, count:', employees.length);
      if (employees.length > 0) {
        console.log('Sample employee:', employees[0]);
      }
    } catch (error) {
      console.error('❌ Employee table error:', error.message);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTables();
