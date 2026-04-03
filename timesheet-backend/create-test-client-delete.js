const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestClientForDeletion() {
  try {
    // Create a test client with no projects
    const testClient = await prisma.client.create({
      data: {
        clientId: 'TESTDEL001',
        name: 'Test Client For Deletion',
        alias: 'DEL',
        gstStatus: 'Unregistered',
        pan: 'TESTP1234F',
        createdBy: 'admin.user@company.com'
      }
    });
    
    console.log('✅ Test client created for deletion:');
    console.log('  - ID:', testClient.id);
    console.log('  - Client ID:', testClient.clientId);
    console.log('  - Name:', testClient.name);
    console.log('🗑️ This client has no projects and should be deletable');
    
  } catch (error) {
    console.error('❌ Error creating test client:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClientForDeletion();
