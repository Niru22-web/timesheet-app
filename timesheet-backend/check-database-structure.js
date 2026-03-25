const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check if UserPermission table exists and has data
    console.log('\n📋 Checking UserPermission table...');
    try {
      const userPermissions = await prisma.userPermission.findMany();
      console.log(`✅ UserPermission table exists with ${userPermissions.length} records`);
      
      if (userPermissions.length > 0) {
        console.log('Sample UserPermission record:');
        console.log(JSON.stringify(userPermissions[0], null, 2));
      }
    } catch (error) {
      console.error('❌ UserPermission table error:', error.message);
    }
    
    // Check Niranjan's user and role
    console.log('\n👤 Checking Niranjan user...');
    try {
      const niranjan = await prisma.employee.findUnique({
        where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
        include: {
          userPermission: true
        }
      });
      
      if (niranjan) {
        console.log('✅ Niranjan found:');
        console.log(`  ID: ${niranjan.id}`);
        console.log(`  Name: ${niranjan.firstName} ${niranjan.lastName}`);
        console.log(`  Email: ${niranjan.officeEmail}`);
        console.log(`  Role: ${niranjan.role}`);
        console.log(`  Status: ${niranjan.status}`);
        console.log(`  Has UserPermission: ${niranjan.userPermission ? 'Yes' : 'No'}`);
        
        if (niranjan.userPermission) {
          console.log('  Permissions:', JSON.stringify(niranjan.userPermission, null, 2));
        }
      } else {
        console.log('❌ Niranjan not found in database');
      }
    } catch (error) {
      console.error('❌ Error checking Niranjan:', error.message);
    }
    
    // Check all employees and their permissions
    console.log('\n👥 Checking all employees and permissions...');
    try {
      const employees = await prisma.employee.findMany({
        include: {
          userPermission: true
        }
      });
      
      console.log(`Found ${employees.length} employees:`);
      employees.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName} (${emp.role}) - ${emp.officeEmail}`);
        console.log(`    Has permissions: ${emp.userPermission ? 'Yes' : 'No'}`);
        if (emp.userPermission) {
          console.log(`    Admin Panel: ${emp.userPermission.adminPanel}`);
        }
      });
    } catch (error) {
      console.error('❌ Error checking employees:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStructure();
