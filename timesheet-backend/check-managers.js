const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkManagers() {
  try {
    console.log('🔍 Checking for managers in database...');
    
    // Check all employees
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        reportingPartner: true
      },
      orderBy: { firstName: 'asc' }
    });
    
    console.log(`📋 Total employees: ${allEmployees.length}`);
    
    // Group by role
    const partners = allEmployees.filter(emp => emp.role === 'Partner');
    const managers = allEmployees.filter(emp => emp.role === 'Manager');
    const employees = allEmployees.filter(emp => emp.role === 'Employee');
    
    console.log(`🤝 Partners: ${partners.length}`);
    partners.forEach(p => console.log(`  - ${p.firstName} ${p.lastName} (${p.id})`));
    
    console.log(`👨‍💼 Managers: ${managers.length}`);
    managers.forEach(m => console.log(`  - ${m.firstName} ${m.lastName} (${m.id}), reports to: ${m.reportingPartner}`));
    
    console.log(`👤 Employees: ${employees.length}`);
    
    // Check specific partner-manager relationships
    console.log('\n🔗 Partner-Manager Relationships:');
    managers.forEach(manager => {
      const partner = partners.find(p => p.id === manager.reportingPartner);
      console.log(`  ${manager.firstName} ${manager.lastName} reports to: ${partner ? partner.firstName + ' ' + partner.lastName : 'Unknown Partner'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkManagers();
