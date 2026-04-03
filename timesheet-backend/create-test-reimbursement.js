const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestReimbursement() {
  try {
    // Get the test user and client
    const user = await prisma.employee.findUnique({
      where: { officeEmail: 'project.user@company.com' }
    });
    
    const client = await prisma.client.findUnique({
      where: { clientId: 'CLI001' }
    });
    
    if (!user || !client) {
      console.error('❌ Test user or client not found');
      return;
    }
    
    // Create a test reimbursement
    const reimbursement = await prisma.reimbursement.create({
      data: {
        claimId: 'CLM001',
        category: 'Travel',
        amount: 150.00,
        description: 'Test travel expense',
        date: new Date(),
        employeeId: user.id,
        clientId: client.id
      }
    });
    
    console.log('✅ Test reimbursement created:');
    console.log('  - Claim ID:', reimbursement.claimId);
    console.log('  - Amount:', reimbursement.amount);
    console.log('  - Client:', client.name);
    
  } catch (error) {
    console.error('❌ Error creating test reimbursement:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReimbursement();
