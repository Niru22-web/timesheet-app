const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmployeeAPIResponse() {
  try {
    console.log('🔍 Testing employee API response structure...');
    
    // Get a sample employee (preferably one with a reporting manager)
    const employees = await prisma.employee.findMany({
      where: {
        reportingManager: { not: null }
      },
      take: 1,
      include: {
        profile: true
      }
    });
    
    if (employees.length === 0) {
      console.log('❌ No employees with reporting managers found');
      
      // Show all employees for debugging
      const allEmployees = await prisma.employee.findMany({
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
          reportingPartner: true,
          reportingManager: true
        }
      });
      
      console.log('📋 All employees:');
      allEmployees.forEach(emp => {
        console.log(`  ${emp.firstName} ${emp.lastName} (${emp.role}) - Partner: ${emp.reportingPartner}, Manager: ${emp.reportingManager}`);
      });
      
      return;
    }
    
    const employee = employees[0];
    
    console.log('✅ Found sample employee:');
    console.log('📋 Employee data structure:');
    console.log({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      reportingPartner: employee.reportingPartner,
      reportingManager: employee.reportingManager,
      officeEmail: employee.profile?.officeEmail || 'N/A'
    });
    
    // Test what the API would return
    console.log('\n🔗 API Response Structure (what frontend expects):');
    const apiResponse = {
      success: true,
      data: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: `${employee.firstName} ${employee.lastName}`,
        officeEmail: employee.profile?.officeEmail || '',
        role: employee.role,
        reportingPartner: employee.reportingPartner,
        reportingManager: employee.reportingManager,
        // Other fields...
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // Verify field names match frontend expectations
    console.log('\n✅ Field Verification:');
    console.log(`  - reportingPartner: ${employee.reportingPartner ? '✅' : '❌'}`);
    console.log(`  - reportingManager: ${employee.reportingManager ? '✅' : '❌'}`);
    console.log(`  - officeEmail: ${employee.profile?.officeEmail ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmployeeAPIResponse();
