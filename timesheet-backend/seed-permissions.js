const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPermissions() {
  try {
    console.log('🌱 Seeding permissions data...');

    // Create role permissions for admin
    const adminRolePermissions = await prisma.rolePermission.upsert({
      where: { role: 'Admin' },
      update: {},
      create: {
        role: 'Admin',
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

    console.log('✅ Admin role permissions created:', adminRolePermissions.role);

    // Create role permissions for manager
    const managerRolePermissions = await prisma.rolePermission.upsert({
      where: { role: 'Manager' },
      update: {},
      create: {
        role: 'Manager',
        dashboardView: true,
        dashboardCreate: false,
        dashboardEdit: false,
        dashboardDelete: false,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: false,
        projectsView: true,
        projectsCreate: false,
        projectsEdit: false,
        projectsDelete: false,
        reportsView: true,
        reportsCreate: false,
        reportsEdit: false,
        reportsDelete: false,
        employeesView: true,
        employeesCreate: true,
        employeesEdit: true,
        employeesDelete: false,
        employees: true,
        adminPanelView: false,
        adminPanelCreate: false,
        adminPanelEdit: false,
        adminPanelDelete: false,
        emailTemplatesView: false,
        emailTemplatesCreate: false,
        emailTemplatesEdit: false,
        emailTemplatesDelete: false,
        clientsView: true,
        clientsCreate: false,
        clientsEdit: false,
        clientsDelete: false,
        jobsView: true,
        jobsCreate: false,
        jobsEdit: false,
        jobsDelete: false
      }
    });

    console.log('✅ Manager role permissions created:', managerRolePermissions.role);

    // Create role permissions for employee
    const employeeRolePermissions = await prisma.rolePermission.upsert({
      where: { role: 'Employee' },
      update: {},
      create: {
        role: 'Employee',
        dashboardView: true,
        dashboardCreate: false,
        dashboardEdit: false,
        dashboardDelete: false,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: false,
        projectsView: true,
        projectsCreate: false,
        projectsEdit: false,
        projectsDelete: false,
        reportsView: false,
        reportsCreate: false,
        reportsEdit: false,
        reportsDelete: false,
        employeesView: false,
        employeesCreate: false,
        employeesEdit: false,
        employeesDelete: false,
        employees: false,
        adminPanelView: false,
        adminPanelCreate: false,
        adminPanelEdit: false,
        adminPanelDelete: false,
        emailTemplatesView: false,
        emailTemplatesCreate: false,
        emailTemplatesEdit: false,
        emailTemplatesDelete: false,
        clientsView: false,
        clientsCreate: false,
        clientsEdit: false,
        clientsDelete: false,
        jobsView: false,
        jobsCreate: false,
        jobsEdit: false,
        jobsDelete: false
      }
    });

    console.log('✅ Employee role permissions created:', employeeRolePermissions.role);

    // Create user permissions for the admin user
    const adminUserId = '088b6a32-3cab-44d0-b99a-bf0d83be9944';
    
    const userPermissions = await prisma.userPermission.upsert({
      where: { userId: adminUserId },
      update: {},
      create: {
        userId: adminUserId,
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

    console.log('✅ User permissions created for admin user');

    console.log('🎉 Permissions seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();
