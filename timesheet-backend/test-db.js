const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Count employees
    const employeeCount = await prisma.employee.count();
    console.log(`📊 Employee count: ${employeeCount}`);
    
    // Get first few employees
    const employees = await prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('👥 Sample employees:');
    employees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${emp.role}`);
    });
    
    if (employeeCount === 0) {
      console.log('⚠️  No data found! Database is empty.');
      console.log('💡 Run: npm run db:seed to populate sample data');
    } else {
      console.log('✅ Database contains data');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
