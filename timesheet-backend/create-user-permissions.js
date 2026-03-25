const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUserPermissions() {
  try {
    console.log('🔧 Creating user permissions...');
    
    // Get all employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true
      }
    });
    
    console.log(`Found ${employees.length} employees to create permissions for:`);
    
    for (const employee of employees) {
      console.log(`\n👤 Processing: ${employee.firstName} ${employee.lastName} (${employee.role})`);
      
      // Check if permissions already exist
      const existingPermission = await prisma.userPermission.findUnique({
        where: { userId: employee.id }
      });
      
      if (existingPermission) {
        console.log(`  ⚠️  Permissions already exist, skipping...`);
        continue;
      }
      
      // Determine permissions based on role
      const roleLower = employee.role.toLowerCase();
      let permissions = {
        dashboard: true,
        timesheet: true,
        projects: true,
        reports: true,
        adminPanel: false,
        emailTemplates: false
      };
      
      // Admin gets all permissions
      if (roleLower === 'admin') {
        permissions = {
          dashboard: true,
          timesheet: true,
          projects: true,
          reports: true,
          adminPanel: true,
          emailTemplates: true
        };
        console.log(`  👑 Admin permissions assigned`);
      }
      // Manager gets most permissions except admin panel and email templates
      else if (roleLower === 'manager') {
        permissions = {
          dashboard: true,
          timesheet: true,
          projects: true,
          reports: true,
          adminPanel: false,
          emailTemplates: false
        };
        console.log(`  📋 Manager permissions assigned`);
      }
      // Partner gets similar permissions to manager
      else if (roleLower === 'partner') {
        permissions = {
          dashboard: true,
          timesheet: true,
          projects: true,
          reports: true,
          adminPanel: false,
          emailTemplates: false
        };
        console.log(`  🤝 Partner permissions assigned`);
      }
      // Regular user gets basic permissions
      else {
        permissions = {
          dashboard: true,
          timesheet: true,
          projects: false,
          reports: false,
          adminPanel: false,
          emailTemplates: false
        };
        console.log(`  👤 User permissions assigned`);
      }
      
      // Create the permission record
      const createdPermission = await prisma.userPermission.create({
        data: {
          userId: employee.id,
          ...permissions
        }
      });
      
      console.log(`  ✅ Permissions created successfully`);
      console.log(`     Dashboard: ${createdPermission.dashboard}`);
      console.log(`     Timesheet: ${createdPermission.timesheet}`);
      console.log(`     Projects: ${createdPermission.projects}`);
      console.log(`     Reports: ${createdPermission.reports}`);
      console.log(`     Admin Panel: ${createdPermission.adminPanel}`);
      console.log(`     Email Templates: ${createdPermission.emailTemplates}`);
    }
    
    console.log('\n🎉 All user permissions created successfully!');
    
    // Summary
    const totalPermissions = await prisma.userPermission.count();
    console.log(`\n📊 Summary: ${totalPermissions} user permission records created`);
    
    // Show admin users specifically
    const adminPermissions = await prisma.userPermission.findMany({
      where: { adminPanel: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            officeEmail: true,
            role: true
          }
        }
      }
    });
    
    console.log(`\n👑 Admin users (${adminPermissions.length}):`);
    adminPermissions.forEach(perm => {
      console.log(`  - ${perm.user.firstName} ${perm.user.lastName} (${perm.user.role}) - ${perm.user.officeEmail}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating permissions:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createUserPermissions();
