// Test script to verify the User Access Control system
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPermissionSystem() {
  try {
    console.log('🧪 Testing User Access Control System...\n');

    // Test 1: Check if UserPermission table exists and has the right structure
    console.log('1. Testing database schema...');
    try {
      const permissions = await prisma.userPermission.findMany();
      console.log(`✅ UserPermission table exists. Current records: ${permissions.length}`);
    } catch (error) {
      console.log('❌ UserPermission table error:', error.message);
    }

    // Test 2: Check if we can create a test permission
    console.log('\n2. Testing permission creation...');
    const testUsers = await prisma.employee.findMany({ take: 1 });
    
    if (testUsers.length > 0) {
      const testUser = testUsers[0];
      console.log(`Found test user: ${testUser.firstName} ${testUser.lastName}`);
      
      const testPermission = await prisma.userPermission.upsert({
        where: {
          userId_moduleName: {
            userId: testUser.id,
            moduleName: 'test_module'
          }
        },
        update: {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false
        },
        create: {
          userId: testUser.id,
          moduleName: 'test_module',
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false
        }
      });
      
      console.log('✅ Permission creation test passed:', testPermission);
      
      // Clean up test permission
      await prisma.userPermission.delete({
        where: { id: testPermission.id }
      });
      console.log('✅ Test permission cleaned up');
    } else {
      console.log('⚠️  No users found in database. Please create a test user first.');
    }

    // Test 3: Show available modules
    console.log('\n3. Available modules for permissions:');
    const modules = [
      'dashboard',
      'timesheet',
      'employees',
      'projects',
      'jobs',
      'clients',
      'reports',
      'email_templates',
      'email_configuration',
      'admin_panel',
      'reimbursement',
      'leave_management'
    ];
    modules.forEach(module => console.log(`   - ${module}`));

    console.log('\n✅ User Access Control System test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server');
    console.log('2. Start the frontend application');
    console.log('3. Login as an admin user');
    console.log('4. Navigate to /admin/user-access');
    console.log('5. Configure permissions for users');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testPermissionSystem();
}

module.exports = { testPermissionSystem };
