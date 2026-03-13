const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check user_permissions table
    const permissions = await prisma.$queryRaw`SELECT * FROM user_permissions LIMIT 5`;
    console.log('Current user_permissions:');
    permissions.forEach(p => {
      console.log(`  ID: ${p.id}, User ID: ${p.userId}, Dashboard: ${p.dashboard}`);
    });

    // Check employees table
    const employees = await prisma.$queryRaw`SELECT id, employeeId, firstName, lastName FROM employee LIMIT 3`;
    console.log('\nSample employees:');
    employees.forEach(e => {
      console.log(`  ID: ${e.id}, Employee ID: ${e.employeeId}, Name: ${e.firstName} ${e.lastName}`);
    });

    // Check if there are any orphaned records
    const orphanedPermissions = await prisma.$queryRaw`
      SELECT up.* FROM user_permissions up 
      LEFT JOIN employee e ON up.userId = e.id 
      WHERE e.id IS NULL
    `;
    
    if (orphanedPermissions.length > 0) {
      console.log('\n⚠️ Found orphaned user_permissions records:');
      orphanedPermissions.forEach(p => {
        console.log(`  User ID: ${p.userId} (no matching employee)`);
      });
      
      // Delete orphaned records
      console.log('\n🗑️ Deleting orphaned records...');
      await prisma.$queryRaw`DELETE FROM user_permissions WHERE userId NOT IN (SELECT id FROM employee)`;
      console.log('✅ Orphaned records deleted');
    } else {
      console.log('\n✅ No orphaned user_permissions records found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
