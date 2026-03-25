const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSimplePermissions() {
  try {
    console.log('🌱 Seeding simple user permissions...');

    // Get all users
    const users = await prisma.employee.findMany({
      where: {
        status: 'approved'
      }
    });

    console.log(`Found ${users.length} approved users`);

    for (const user of users) {
      console.log(`Processing user: ${user.firstName} ${user.lastName} (${user.role})`);

      // Set default permissions based on role
      let permissionData = {};
      
      switch (user.role.toLowerCase()) {
        case 'admin':
          permissionData = {
            dashboard: true,
            timesheet: true,
            employees: true,
            projects: true,
            jobs: true,
            clients: true,
            reports: true,
            emailTemplates: true,
            emailConfiguration: true,
            adminPanel: true,
            reimbursement: true,
            leaveManagement: true
          };
          break;
        
        case 'manager':
        case 'partner':
        case 'owner':
          permissionData = {
            dashboard: true,
            timesheet: true,
            employees: true,
            projects: true,
            jobs: true,
            clients: true,
            reports: true,
            emailTemplates: false,
            emailConfiguration: false,
            adminPanel: false,
            reimbursement: true,
            leaveManagement: true
          };
          break;
        
        case 'user':
        case 'employee':
          permissionData = {
            dashboard: true,
            timesheet: true,
            employees: false,
            projects: false,
            jobs: false,
            clients: false,
            reports: false,
            emailTemplates: false,
            emailConfiguration: false,
            adminPanel: false,
            reimbursement: true,
            leaveManagement: true
          };
          break;
        
        default:
          permissionData = {
            dashboard: true,
            timesheet: true,
            employees: false,
            projects: false,
            jobs: false,
            clients: false,
            reports: false,
            emailTemplates: false,
            emailConfiguration: false,
            adminPanel: false,
            reimbursement: true,
            leaveManagement: true
          };
      }

      // Upsert permissions
      await prisma.userPermission.upsert({
        where: { userId: user.id },
        update: permissionData,
        create: {
          userId: user.id,
          ...permissionData
        }
      });

      console.log(`✅ Permissions set for ${user.firstName} ${user.lastName}`);
    }

    console.log('\n✅ Permission seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSimplePermissions()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedSimplePermissions };
