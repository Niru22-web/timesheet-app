const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createRestrictedTestReimbursement() {
  try {
    // Create a third client
    const client3 = await prisma.client.create({
      data: {
        clientId: 'CLI003',
        name: 'Restricted Client LLC',
        alias: 'RCL',
        gstStatus: 'Registered',
        pan: 'LMNOP9012P',
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Create a third project
    const project3 = await prisma.project.create({
      data: {
        projectId: 'PRJ003',
        name: 'Restricted Project',
        status: 'Active',
        startDate: new Date(),
        billable: true,
        clientId: client3.id,
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Create a new user for this project
    const hashedPassword = await bcrypt.hash('user123', 10);
    const restrictedUser = await prisma.employee.create({
      data: {
        employeeId: 'USR003',
        firstName: 'Restricted',
        lastName: 'User',
        officeEmail: 'restricted.user@company.com',
        designation: 'Designer',
        role: 'user',
        status: 'active',
        password: hashedPassword,
      }
    });
    
    // Assign restricted user to the restricted project only
    await prisma.projectUser.create({
      data: {
        projectId: project3.id,
        employeeId: restrictedUser.id
      }
    });
    
    // Create a reimbursement for the restricted client
    const restrictedReimbursement = await prisma.reimbursement.create({
      data: {
        claimId: 'CLM003',
        category: 'Software',
        amount: 299.99,
        description: 'Software license',
        date: new Date(),
        employeeId: restrictedUser.id,
        clientId: client3.id
      }
    });
    
    console.log('✅ Restricted test reimbursement created:');
    console.log('  - Claim ID:', restrictedReimbursement.claimId);
    console.log('  - Amount:', restrictedReimbursement.amount);
    console.log('  - Client:', client3.name);
    console.log('👤 Restricted user:', restrictedUser.officeEmail);
    console.log('🚫 Project user should NOT see this reimbursement');
    
  } catch (error) {
    console.error('❌ Error creating restricted test reimbursement:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createRestrictedTestReimbursement();
