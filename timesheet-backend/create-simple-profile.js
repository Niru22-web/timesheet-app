const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSimpleProfile() {
  try {
    console.log('🔧 Creating simple profile for Sarah Williams...\n');
    
    // Get Sarah Williams
    const sarah = await prisma.employee.findUnique({
      where: { employeeId: 'EMP005' }
    });
    
    if (!sarah) {
      console.log('❌ Sarah Williams not found');
      return;
    }
    
    // Check if profile already exists
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { employeeId: sarah.id }
    });
    
    if (existingProfile) {
      console.log('✅ Profile already exists');
      console.log('Profile data:', existingProfile);
      return;
    }
    
    console.log('👤 Creating minimal profile for Sarah...');
    
    // Create minimal profile for Sarah
    const newProfile = await prisma.employeeProfile.create({
      data: {
        employeeId: sarah.id,
        dob: new Date('1992-05-15'),
        doj: new Date('2024-01-15')
      }
    });
    
    console.log('✅ Profile created successfully');
    console.log('Profile ID:', newProfile.id);
    
    // Test the complete API response now
    const completeEmployee = await prisma.employee.findUnique({
      where: { id: sarah.id },
      include: { profile: true }
    });
    
    // Get reporting details
    let reportingPartnerDetails = null;
    let reportingManagerDetails = null;

    if (completeEmployee.reportingPartner) {
      reportingPartnerDetails = await prisma.employee.findUnique({
        where: { id: completeEmployee.reportingPartner },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          officeEmail: true,
          role: true
        }
      });
    }

    if (completeEmployee.reportingManager) {
      reportingManagerDetails = await prisma.employee.findUnique({
        where: { id: completeEmployee.reportingManager },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          officeEmail: true,
          role: true
        }
      });
    }

    console.log('\n🔗 Fixed API Response:');
    const apiResponse = {
      id: completeEmployee.id,
      employeeId: completeEmployee.employeeId,
      firstName: completeEmployee.firstName,
      lastName: completeEmployee.lastName,
      officeEmail: completeEmployee.officeEmail || '',
      reportingPartner: completeEmployee.reportingPartner,
      reportingManager: completeEmployee.reportingManager,
      reportingPartnerDetails,
      reportingManagerDetails
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n🎯 Expected Frontend Behavior:');
    console.log('✅ View popup should show: "Jane Smith" as Reporting Manager');
    console.log('✅ Edit form should pre-select: "Jane Smith" in dropdown');
    console.log('✅ officeEmail should show: "sarah.williams@company.com"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleProfile();
