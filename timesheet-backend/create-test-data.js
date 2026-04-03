const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Create a test client
    const client = await prisma.client.create({
      data: {
        clientId: 'CLI001',
        name: 'Test Client Corporation',
        alias: 'TCC',
        gstStatus: 'Registered',
        pan: 'ABCDE1234F',
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Create a test project
    const project = await prisma.project.create({
      data: {
        projectId: 'PRJ001',
        name: 'Test Project',
        status: 'Active',
        startDate: new Date(),
        billable: true,
        clientId: client.id,
        createdBy: 'admin.user@company.com'
      }
    });
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.employee.create({
      data: {
        employeeId: 'USR002',
        firstName: 'Project',
        lastName: 'User',
        officeEmail: 'project.user@company.com',
        designation: 'Developer',
        role: 'user',
        status: 'active',
        password: hashedPassword,
      }
    });
    
    // Assign user to project
    await prisma.projectUser.create({
      data: {
        projectId: project.id,
        employeeId: user.id
      }
    });
    
    console.log('✅ Test data created:');
    console.log('  - Client:', client.name);
    console.log('  - Project:', project.name);
    console.log('  - User:', user.officeEmail);
    console.log('🔑 User password: user123');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
