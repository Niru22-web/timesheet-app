const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/timesheet'
    }
  }
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and employees...');
    
    // Check all employees
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true
      }
    });
    
    console.log(`\n📊 Found ${allEmployees.length} employees in database:`);
    allEmployees.forEach(emp => {
      console.log(`  ID: ${emp.id}`);
      console.log(`  EmployeeId: ${emp.employeeId}`);
      console.log(`  Name: ${emp.firstName} ${emp.lastName}`);
      console.log(`  Email: ${emp.officeEmail}`);
      console.log(`  Role: ${emp.role}`);
      console.log(`  Status: ${emp.status}`);
      console.log('---');
    });
    
    // Check all profiles
    const allProfiles = await prisma.employeeProfile.findMany({
      select: {
        employeeId: true,
        employeePhotoUrl: true
      }
    });
    
    console.log(`\n📸 Found ${allProfiles.length} employee profiles:`);
    allProfiles.forEach(profile => {
      console.log(`  EmployeeId: ${profile.employeeId}`);
      console.log(`  Photo URL: ${profile.employeePhotoUrl}`);
      console.log('---');
    });
    
    // Test a specific lookup
    if (allEmployees.length > 0) {
      const firstEmployee = allEmployees[0];
      console.log(`\n🧪 Testing lookup for employee: ${firstEmployee.firstName} ${firstEmployee.lastName} (ID: ${firstEmployee.id})`);
      
      const foundEmployee = await prisma.employee.findUnique({
        where: { id: firstEmployee.id }
      });
      
      if (foundEmployee) {
        console.log('✅ Employee lookup successful!');
      } else {
        console.log('❌ Employee lookup failed!');
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
