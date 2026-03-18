const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestEmployeeWithReportingManager() {
  try {
    console.log('🔧 Creating test employee with reporting manager...');
    
    // Get existing managers and partners
    const partners = await prisma.employee.findMany({
      where: { role: 'Partner' },
      select: { id: true, firstName: true, lastName: true }
    });
    
    const managers = await prisma.employee.findMany({
      where: { role: 'Manager' },
      select: { id: true, firstName: true, lastName: true, reportingPartner: true }
    });
    
    console.log('🤝 Available Partners:');
    partners.forEach(p => console.log(`  ${p.firstName} ${p.lastName} (${p.id})`));
    
    console.log('👨‍💼 Available Managers:');
    managers.forEach(m => console.log(`  ${m.firstName} ${m.lastName} (${m.id}) - reports to: ${m.reportingPartner}`));
    
    // Create a test employee that reports to Jane Smith
    const janeSmith = managers.find(m => m.firstName === 'Jane');
    if (!janeSmith) {
      console.log('❌ Jane Smith not found');
      return;
    }
    
    // Check if test employee already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { employeeId: 'TEST001' }
    });
    
    if (existingEmployee) {
      console.log('📝 Updating existing test employee...');
      
      const updated = await prisma.employee.update({
        where: { id: existingEmployee.id },
        data: {
          reportingPartner: janeSmith.reportingPartner,
          reportingManager: janeSmith.id
        }
      });
      
      console.log('✅ Updated test employee:');
      console.log({
        id: updated.id,
        employeeId: updated.employeeId,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        reportingPartner: updated.reportingPartner,
        reportingManager: updated.reportingManager
      });
      
    } else {
      console.log('👤 Creating new test employee...');
      
      // Create a profile first
      const profile = await prisma.employeeProfile.create({
        data: {
          officeEmail: 'test.employee@company.com',
          personalEmail: 'test.personal@gmail.com',
          phone: '+1234567890',
          dob: new Date('1990-01-01'), // Required field
          doj: new Date('2024-01-01')  // Required field
        }
      });
      
      const newEmployee = await prisma.employee.create({
        data: {
          employeeId: 'TEST001',
          firstName: 'Test',
          lastName: 'Employee',
          role: 'Employee',
          designation: 'Test Associate',
          department: 'Testing',
          status: 'active',
          reportingPartner: janeSmith.reportingPartner,
          reportingManager: janeSmith.id,
          profileId: profile.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Created test employee:');
      console.log({
        id: newEmployee.id,
        employeeId: newEmployee.employeeId,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        role: newEmployee.role,
        reportingPartner: newEmployee.reportingPartner,
        reportingManager: newEmployee.reportingManager
      });
    }
    
    // Test the API response structure
    const testEmployee = await prisma.employee.findFirst({
      where: { employeeId: 'TEST001' },
      include: { profile: true }
    });
    
    if (testEmployee) {
      console.log('\n🔗 API Response Test:');
      const apiResponse = {
        success: true,
        data: {
          id: testEmployee.id,
          employeeId: testEmployee.employeeId,
          firstName: testEmployee.firstName,
          lastName: testEmployee.lastName,
          officeEmail: testEmployee.profile?.officeEmail || '',
          role: testEmployee.role,
          reportingPartner: testEmployee.reportingPartner,
          reportingManager: testEmployee.reportingManager
        }
      };
      
      console.log(JSON.stringify(apiResponse, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEmployeeWithReportingManager();
