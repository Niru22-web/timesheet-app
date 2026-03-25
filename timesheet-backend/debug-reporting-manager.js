const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugReportingManagerData() {
  try {
    console.log('🔍 Debugging Reporting Manager Data Consistency...\n');
    
    // Get employee with reporting manager (Sarah Williams)
    const employee = await prisma.employee.findFirst({
      where: { 
        employeeId: 'EMP005' // Sarah Williams
      },
      include: {
        profile: true
      }
    });
    
    if (!employee) {
      console.log('❌ Employee EMP005 not found');
      
      // Find any employee with reporting manager
      const anyWithManager = await prisma.employee.findFirst({
        where: { 
          reportingManager: { not: null }
        },
        include: { profile: true }
      });
      
      if (anyWithManager) {
        console.log('✅ Found employee with reporting manager:', anyWithManager.employeeId);
        employee = anyWithManager;
      } else {
        console.log('❌ No employees with reporting managers found');
        return;
      }
    }
    
    console.log('📋 Employee Raw Data:');
    console.log({
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      reportingPartner: employee.reportingPartner,
      reportingManager: employee.reportingManager
    });
    
    // Get reporting manager details
    let reportingManagerDetails = null;
    if (employee.reportingManager) {
      reportingManagerDetails = await prisma.employee.findUnique({
        where: { id: employee.reportingManager },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
          officeEmail: true
        }
      });
    }
    
    console.log('\n👨‍💼 Reporting Manager Details:');
    console.log(reportingManagerDetails);
    
    // Get reporting partner details
    let reportingPartnerDetails = null;
    if (employee.reportingPartner) {
      reportingPartnerDetails = await prisma.employee.findUnique({
        where: { id: employee.reportingPartner },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
          officeEmail: true
        }
      });
    }
    
    console.log('\n🤝 Reporting Partner Details:');
    console.log(reportingPartnerDetails);
    
    // Simulate API response structure
    console.log('\n🔗 Simulated API Response:');
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
        // Enhanced fields for frontend
        reportingManagerId: employee.reportingManager,
        reportingManagerName: reportingManagerDetails ? 
          `${reportingManagerDetails.firstName} ${reportingManagerDetails.lastName}` : null,
        reportingPartnerId: employee.reportingPartner,
        reportingPartnerName: reportingPartnerDetails ? 
          `${reportingPartnerDetails.firstName} ${reportingPartnerDetails.lastName}` : null
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // Check for data consistency issues
    console.log('\n🔍 Data Consistency Check:');
    console.log(`✅ reportingPartner in DB: ${employee.reportingPartner ? 'YES' : 'NO'}`);
    console.log(`✅ reportingManager in DB: ${employee.reportingManager ? 'YES' : 'NO'}`);
    console.log(`✅ Manager details found: ${reportingManagerDetails ? 'YES' : 'NO'}`);
    console.log(`✅ Partner details found: ${reportingPartnerDetails ? 'YES' : 'NO'}`);
    
    if (employee.reportingManager && !reportingManagerDetails) {
      console.log('❌ ISSUE: Employee has reportingManagerId but manager not found in DB!');
    }
    
    if (employee.reportingPartner && !reportingPartnerDetails) {
      console.log('❌ ISSUE: Employee has reportingPartnerId but partner not found in DB!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReportingManagerData();
