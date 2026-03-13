const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    console.log('🔍 Checking permissions for niranjan.mulam@asaind.co.in...');
    
    // Get the user first
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
      select: { id: true, firstName: true, lastName: true, role: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`   User ID: ${user.id}`);

    // Check user permissions
    const permission = await prisma.userPermission.findUnique({
      where: { userId: user.id }
    });

    if (permission) {
      console.log('\n📋 Current Permissions:');
      console.log(`   Dashboard: ${permission.dashboard}`);
      console.log(`   Timesheet: ${permission.timesheet}`);
      console.log(`   Projects: ${permission.projects}`);
      console.log(`   Reports: ${permission.reports}`);
      console.log(`   Admin Panel: ${permission.adminPanel}`);
      console.log(`   Email Templates: ${permission.emailTemplates}`);
    } else {
      console.log('\n⚠️ No permission record found for this user');
      console.log('   This means they get default permissions based on their role');
      
      // Create default permissions for admin
      console.log('\n🔧 Creating default admin permissions...');
      const defaultPermissions = await prisma.userPermission.create({
        data: {
          userId: user.id,
          dashboard: true,
          timesheet: true,
          projects: true,
          reports: true,
          adminPanel: true,
          emailTemplates: true
        }
      });
      
      console.log('✅ Default admin permissions created:');
      console.log(`   Dashboard: ${defaultPermissions.dashboard}`);
      console.log(`   Timesheet: ${defaultPermissions.timesheet}`);
      console.log(`   Projects: ${defaultPermissions.projects}`);
      console.log(`   Reports: ${defaultPermissions.reports}`);
      console.log(`   Admin Panel: ${defaultPermissions.adminPanel}`);
      console.log(`   Email Templates: ${defaultPermissions.emailTemplates}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();
