const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProfileForSarah() {
  try {
    console.log('🔧 Creating profile for Sarah Williams...\n');
    
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
      console.log('✅ Profile already exists for Sarah Williams');
      console.log('Profile data:', existingProfile);
      return;
    }
    
    console.log('👤 Creating new profile for Sarah...');
    
    // Create profile for Sarah
    const newProfile = await prisma.employeeProfile.create({
      data: {
        officeEmail: 'sarah.williams@company.com',
        personalEmail: 'sarah.personal@gmail.com',
        phone: '+1234567890',
        dob: new Date('1992-05-15'),
        doj: new Date('2024-01-15'),
        education: 'Bachelor of Design',
        maritalStatus: 'Single',
        gender: 'Female',
        permanentAddress: '123 Main St, City, State 12345',
        currentAddress: '456 Oak Ave, Current City, State 67890',
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        guardianName: 'John Williams',
        guardianNumber: '+9876543210',
        guardianAddress: '789 Guardian St, Guardian City, State 11111',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+5555555555',
        emergencyContactRelation: 'Friend',
        employeeId: sarah.id
      }
    });
    
    console.log('✅ Profile created successfully');
    console.log('Profile ID:', newProfile.id);
    
    // Update employee with profile reference
    const updatedEmployee = await prisma.employee.update({
      where: { id: sarah.id },
      data: {
        profileId: newProfile.id
      }
    });
    
    console.log('✅ Employee updated with profile reference');
    
    // Test the complete API response now
    const completeEmployee = await prisma.employee.findUnique({
      where: { id: sarah.id },
      include: { profile: true }
    });
    
    // Get reporting details again
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
      officeEmail: completeEmployee.profile?.officeEmail || '',
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

createProfileForSarah();
