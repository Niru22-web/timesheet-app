const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignReportingManagerToExistingUser() {
  try {
    console.log('🔧 Assigning reporting manager to existing user...');
    
    // Get existing managers and partners
    const partners = await prisma.employee.findMany({
      where: { role: 'Partner' },
      select: { id: true, firstName: true, lastName: true }
    });
    
    const managers = await prisma.employee.findMany({
      where: { role: 'Manager' },
      select: { id: true, firstName: true, lastName: true, reportingPartner: true }
    });
    
    // Get a regular user to update
    const regularUser = await prisma.employee.findFirst({
      where: { 
        role: { in: ['user', 'User', 'Employee'] },
        reportingManager: null
      },
      select: { id: true, employeeId: true, firstName: true, lastName: true, role: true }
    });
    
    if (!regularUser) {
      console.log('❌ No regular users found to update');
      return;
    }
    
    console.log('👤 Found user to update:', regularUser);
    
    // Assign Jane Smith as the reporting manager
    const janeSmith = managers.find(m => m.firstName === 'Jane');
    if (!janeSmith) {
      console.log('❌ Jane Smith not found');
      return;
    }
    
    console.log('👨‍💼 Assigning manager:', janeSmith);
    console.log('🤝 Partner context:', partners.find(p => p.id === janeSmith.reportingPartner));
    
    // Update the user with reporting structure
    const updatedUser = await prisma.employee.update({
      where: { id: regularUser.id },
      data: {
        reportingPartner: janeSmith.reportingPartner,
        reportingManager: janeSmith.id
      }
    });
    
    console.log('✅ Updated user:');
    console.log({
      id: updatedUser.id,
      employeeId: updatedUser.employeeId,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      reportingPartner: updatedUser.reportingPartner,
      reportingManager: updatedUser.reportingManager
    });
    
    // Test the API response structure
    console.log('\n🔗 API Response Test:');
    const apiResponse = {
      success: true,
      data: {
        id: updatedUser.id,
        employeeId: updatedUser.employeeId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        officeEmail: 'test@example.com', // Would come from profile
        role: updatedUser.role,
        reportingPartner: updatedUser.reportingPartner,
        reportingManager: updatedUser.reportingManager
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n🎯 Expected Frontend Behavior:');
    console.log('1. When editing this user, the dropdown should show:');
    console.log(`   - Partner: ${partners.find(p => p.id === janeSmith.reportingPartner)?.firstName + ' ' + partners.find(p => p.id === janeSmith.reportingPartner)?.lastName}`);
    console.log(`   - Manager: ${janeSmith.firstName} ${janeSmith.lastName}`);
    console.log(`2. Manager dropdown should pre-select: ${janeSmith.firstName} ${janeSmith.lastName}`);
    console.log(`3. Manager ID should match: ${janeSmith.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignReportingManagerToExistingUser();
