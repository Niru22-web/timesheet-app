const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({ take: 5 });
  console.log('Employees found:', employees.map(e => ({ id: e.id, email: e.officeEmail, name: e.firstName + ' ' + e.lastName })));
  const profiles = await prisma.employeeProfile.findMany({ take: 5 });
  console.log('Profiles found:', profiles.map(p => ({ id: p.id, employeeId: p.employeeId })));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
