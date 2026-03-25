const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔍 Checking and fixing database...\n');

    // Check Employee table
    const employees = await prisma.$queryRaw`SELECT id, "employeeId", "firstName", "lastName" FROM "Employee" LIMIT 3`;
    console.log('Sample employees:');
    employees.forEach(e => {
      console.log(`  ID: ${e.id}, Employee ID: ${e.employeeId}, Name: ${e.firstName} ${e.lastName}`);
    });

    // Check for orphaned user_permissions
    const orphanedPermissions = await prisma.$queryRaw`
      SELECT up.* FROM user_permissions up 
      LEFT JOIN "Employee" e ON up."userId" = e.id 
      WHERE e.id IS NULL
    `;
    
    if (orphanedPermissions.length > 0) {
      console.log('\n⚠️ Found orphaned user_permissions records:');
      orphanedPermissions.forEach(p => {
        console.log(`  User ID: ${p.userId} (no matching employee)`);
      });
      
      // Delete orphaned records
      console.log('\n🗑️ Deleting orphaned records...');
      await prisma.$queryRaw`DELETE FROM user_permissions WHERE "userId" NOT IN (SELECT id FROM "Employee")`;
      console.log('✅ Orphaned records deleted');
    } else {
      console.log('\n✅ No orphaned user_permissions records found');
    }

    console.log('\n🎉 Database check completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
