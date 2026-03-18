const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActualAPIResponse() {
  try {
    console.log('🔍 Testing Actual API Response Structure...\n');
    
    // Simulate the exact getEmployeeById controller logic
    const employeeId = '5a3b2dfe-fb91-4fac-ac97-9d53a47048fa'; // Sarah Williams
    
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        profile: true
      }
    });

    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    // Get reporting partner and manager details (exact same logic as controller)
    let reportingPartnerDetails = null;
    let reportingManagerDetails = null;

    if (employee.reportingPartner) {
      reportingPartnerDetails = await prisma.employee.findUnique({
        where: { id: employee.reportingPartner },
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

    if (employee.reportingManager) {
      reportingManagerDetails = await prisma.employee.findUnique({
        where: { id: employee.reportingManager },
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

    // Construct full employee response (exact same as controller)
    const fullEmployeeDetails = {
      // Basic Employee Details
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      officeEmail: employee.profile?.officeEmail || '', // Note: This might be the issue!
      designation: employee.designation,
      role: employee.role,
      department: employee.department,
      status: employee.status,
      reportingPartner: employee.reportingPartner,
      reportingManager: employee.reportingManager,
      createdAt: employee.createdAt,
      
      // Profile Details
      profile: employee.profile ? {
        dob: employee.profile.dob,
        doj: employee.profile.doj,
        education: employee.profile.education,
        maritalStatus: employee.profile.maritalStatus,
        gender: employee.profile.gender,
        permanentAddress: employee.profile.permanentAddress,
        currentAddress: employee.profile.currentAddress,
        pan: employee.profile.pan,
        aadhaar: employee.profile.aadhaar,
        panFileUrl: employee.profile.panFileUrl,
        aadhaarFileUrl: employee.profile.aadhaarFileUrl,
        currentPinCode: employee.profile.currentPinCode,
        guardianAddress: employee.profile.guardianAddress,
        guardianName: employee.profile.guardianName,
        guardianNumber: employee.profile.guardianNumber,
        personalEmail: employee.profile.personalEmail,
        personalMobile: employee.profile.personalMobile,
        employeePhotoUrl: employee.profile.employeePhotoUrl,
        accountHolderName: employee.profile.accountHolderName,
        bankAccountNumber: employee.profile.bankAccountNumber,
        bankName: employee.profile.bankName,
        branchName: employee.profile.branchName,
        ifscCode: employee.profile.ifscCode,
        bankStatementFileUrl: employee.profile.bankStatementFileUrl,
        emergencyContactName: employee.profile.emergencyContactName,
        emergencyContactPhone: employee.profile.emergencyContactPhone,
        emergencyContactRelation: employee.profile.emergencyContactRelation
      } : null,
      
      // Reporting details
      reportingPartnerDetails,
      reportingManagerDetails
    };

    console.log('🔗 Actual API Response Structure:');
    console.log(JSON.stringify(fullEmployeeDetails, null, 2));
    
    // Check what frontend expects
    console.log('\n🎯 Frontend Interface Requirements:');
    console.log('✅ reportingPartnerDetails:', !!reportingPartnerDetails);
    console.log('✅ reportingManagerDetails:', !!reportingManagerDetails);
    console.log('✅ officeEmail from profile:', employee.profile?.officeEmail);
    console.log('⚠️ officeEmail field issue:', !employee.profile?.officeEmail);
    
    // Verify the exact fields frontend is checking
    console.log('\n🔍 Field-by-Field Analysis:');
    console.log('reportingPartner:', fullEmployeeDetails.reportingPartner);
    console.log('reportingManager:', fullEmployeeDetails.reportingManager);
    console.log('reportingPartnerDetails.id:', reportingPartnerDetails?.id);
    console.log('reportingManagerDetails.id:', reportingManagerDetails?.id);
    console.log('reportingManagerDetails.firstName:', reportingManagerDetails?.firstName);
    console.log('reportingManagerDetails.lastName:', reportingManagerDetails?.lastName);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActualAPIResponse();
