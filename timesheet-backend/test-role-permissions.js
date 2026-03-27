const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRolePermissions() {
  try {
    console.log('🔍 Testing RolePermission table...');
    
    // Test RolePermission table
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        take: 1
      });
      console.log('✅ RolePermission table accessible, count:', rolePermissions.length);
    } catch (error) {
      console.error('❌ RolePermission table error:', error.message);
      console.error('This might be the issue - RolePermission table might not exist in database');
    }

    console.log('🔍 Testing getCurrentUserPermissions logic...');
    
    // Test the specific query that's failing
    try {
      const userId = '088b6a32-3cab-44d0-b99a-bf0d83be9944'; // Sample user ID
      const userRole = 'Admin';
      
      console.log('Looking up permissions for userId:', userId, 'with role:', userRole);

      // Get user-specific permissions first
      const userPermission = await prisma.userPermission.findUnique({
        where: { userId },
        select: {
          dashboardView: true,
          dashboardCreate: true,
          dashboardEdit: true,
          dashboardDelete: true,
          timesheetView: true,
          timesheetCreate: true,
          timesheetEdit: true,
          timesheetDelete: true,
          projectsView: true,
          projectsCreate: true,
          projectsEdit: true,
          projectsDelete: true,
          reportsView: true,
          reportsCreate: true,
          reportsEdit: true,
          reportsDelete: true,
          employeesView: true,
          employeesCreate: true,
          employeesEdit: true,
          employeesDelete: true,
          employees: true,
          adminPanelView: true,
          adminPanelCreate: true,
          adminPanelEdit: true,
          adminPanelDelete: true,
          emailTemplatesView: true,
          emailTemplatesCreate: true,
          emailTemplatesEdit: true,
          emailTemplatesDelete: true,
          clientsView: true,
          clientsCreate: true,
          clientsEdit: true,
          clientsDelete: true,
          jobsView: true,
          jobsCreate: true,
          jobsEdit: true,
          jobsDelete: true
        }
      });

      console.log('User permission found:', !!userPermission);

      // Get role-based permissions as fallback - THIS MIGHT BE THE ISSUE
      const rolePermission = await prisma.rolePermission.findUnique({
        where: { role: userRole },
        select: {
          dashboardView: true,
          dashboardCreate: true,
          dashboardEdit: true,
          dashboardDelete: true,
          timesheetView: true,
          timesheetCreate: true,
          timesheetEdit: true,
          timesheetDelete: true,
          projectsView: true,
          projectsCreate: true,
          projectsEdit: true,
          projectsDelete: true,
          reportsView: true,
          reportsCreate: true,
          reportsEdit: true,
          reportsDelete: true,
          employeesView: true,
          employeesCreate: true,
          employeesEdit: true,
          employeesDelete: true,
          employees: true,
          adminPanelView: true,
          adminPanelCreate: true,
          adminPanelEdit: true,
          adminPanelDelete: true,
          emailTemplatesView: true,
          emailTemplatesCreate: true,
          emailTemplatesEdit: true,
          emailTemplatesDelete: true,
          clientsView: true,
          clientsCreate: true,
          clientsEdit: true,
          clientsDelete: true,
          jobsView: true,
          jobsCreate: true,
          jobsEdit: true,
          jobsDelete: true
        }
      });

      console.log('Role permission found:', !!rolePermission);

    } catch (error) {
      console.error('❌ Permission query error:', error.message);
      console.error('Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRolePermissions();
