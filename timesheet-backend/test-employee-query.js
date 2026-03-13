const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmployeeQuery() {
  try {
    console.log('🔍 Testing employee query...');
    
    const employees = await prisma.employee.findMany({
      include: {
        profile: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ Query successful, found', employees.length, 'employees');
    console.log('First employee:', employees[0] ? {
      id: employees[0].id,
      employeeId: employees[0].employeeId,
      name: `${employees[0].firstName} ${employees[0].lastName}`,
      email: employees[0].officeEmail
    } : 'No employees found');
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testEmployeeQuery();
