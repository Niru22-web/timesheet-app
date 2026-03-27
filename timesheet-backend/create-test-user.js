const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Generate employee ID
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeId: 'desc' }
    });
    
    let newEmployeeId = 'EMP001';
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      const newNumber = lastNumber + 1;
      newEmployeeId = `EMP${newNumber.toString().padStart(3, '0')}`;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const employee = await prisma.employee.create({
      data: {
        employeeId: newEmployeeId,
        firstName: 'Test',
        lastName: 'User',
        officeEmail: 'test.user@company.com',
        designation: 'Test Designer',
        role: 'Employee',
        department: 'Operations',
        status: 'pending',
        password: hashedPassword,
      },
    });
    
    console.log('✅ Test user created successfully:');
    console.log(`  - Name: Test User`);
    console.log(`  - Email: test.user@company.com`);
    console.log(`  - Password: password123`);
    console.log(`  - Status: pending`);
    console.log(`  - Employee ID: ${newEmployeeId}`);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
