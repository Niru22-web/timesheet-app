const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAnotherTestReimbursement() {
  try {
    // Create another test client
    const client2 = await prisma.client.create({
      data: {
        clientId: 'CLI002',
        name: 'Another Client Inc',
        alias: 'ACI',
        gstStatus: 'Unregistered',
        pan: 'FGHIJ5678K',
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Create another test project
    const project2 = await prisma.project.create({
      data: {
        projectId: 'PRJ002',
        name: 'Another Project',
        status: 'Active',
        startDate: new Date(),
        billable: true,
        clientId: client2.id,
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Get the existing project user
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'project.user@company.com' }
    });
    
    // Assign user to the second project as well
    await prisma.projectUser.create({
      data: {
        projectId: project2.id,
        employeeId: user.id
      }
    });
    
    // Create a reimbursement for the second client
    const reimbursement2 = await prisma.reimbursement.create({
      data: {
        claimId: 'CLM002',
        category: 'Food',
        amount: 75.50,
        description: 'Test food expense',
        date: new Date(),
        employeeId: user.id,
        clientId: client2.id
      }
    });
    
    console.log('✅ Second test reimbursement created:');
    console.log('  - Claim ID:', reimbursement2.claimId);
    console.log('  - Amount:', reimbursement2.amount);
    console.log('  - Client:', client2.name);
    console.log('👤 User now has access to both clients');
    
  } catch (error) {
    console.error('❌ Error creating second test reimbursement:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAnotherTestReimbursement();
