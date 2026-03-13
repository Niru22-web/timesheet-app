const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Available tables:');
    tables.forEach(t => {
      console.log(`  - ${t.table_name}`);
    });

    // Check the employee table
    try {
      const employees = await prisma.$queryRaw`SELECT id, "employeeId", "firstName", "lastName" FROM employees LIMIT 3`;
      console.log('\nSample employees:');
      employees.forEach(e => {
        console.log(`  ID: ${e.id}, Employee ID: ${e.employeeId}, Name: ${e.firstName} ${e.lastName}`);
      });
    } catch (err) {
      console.log('\n❌ Error accessing employees table:', err.message);
    }

    // Check user_permissions table
    const permissions = await prisma.$queryRaw`SELECT * FROM user_permissions LIMIT 3`;
    console.log('\nCurrent user_permissions:');
    permissions.forEach(p => {
      console.log(`  ID: ${p.id}, User ID: ${p.userId}, Dashboard: ${p.dashboard}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
