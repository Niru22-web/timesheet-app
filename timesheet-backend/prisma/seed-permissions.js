const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultModules = [
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

const getDefaultPermissions = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return defaultModules.map(module => ({
        moduleName: module,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true
      }));
    
    case 'manager':
    case 'partner':
    case 'owner':
      return defaultModules.map(module => {
        if (['admin_panel', 'email_configuration', 'email_templates'].includes(module)) {
          return {
            moduleName: module,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false
          };
        }
        return {
          moduleName: module,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: module === 'reports' // Only allow delete for reports
        };
      });
    
    case 'user':
    case 'employee':
      return defaultModules.map(module => {
        switch (module) {
          case 'dashboard':
          case 'timesheet':
          case 'reimbursement':
          case 'leave_management':
            return {
              moduleName: module,
              canView: true,
              canCreate: true,
              canEdit: true,
              canDelete: false
            };
          default:
            return {
              moduleName: module,
              canView: false,
              canCreate: false,
              canEdit: false,
              canDelete: false
            };
        }
      });
    
    default:
      return defaultModules.map(module => ({
        moduleName: module,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false
      }));
  }
};

async function seedPermissions() {
  try {
    console.log('🌱 Seeding user permissions...');

    // Get all users
    const users = await prisma.employee.findMany({
      where: {
        status: 'approved' // Only seed for approved users
      }
    });

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Processing user: ${user.firstName} ${user.lastName} (${user.role})`);

      // Get default permissions based on role
      const permissions = getDefaultPermissions(user.role);

      // Upsert permissions for each module
      for (const permission of permissions) {
        await prisma.userPermission.upsert({
          where: {
            userId_moduleName: {
              userId: user.id,
              moduleName: permission.moduleName
            }
          },
          update: {
            canView: permission.canView,
            canCreate: permission.canCreate,
            canEdit: permission.canEdit,
            canDelete: permission.canDelete
          },
          create: {
            userId: user.id,
            moduleName: permission.moduleName,
            canView: permission.canView,
            canCreate: permission.canCreate,
            canEdit: permission.canEdit,
            canDelete: permission.canDelete
          }
        });
      }

      console.log(`✅ Permissions set for ${user.firstName} ${user.lastName}`);
    }

    console.log('✅ Permission seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedPermissions()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedPermissions };
