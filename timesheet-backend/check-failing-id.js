const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 'a0bf7829-4c48-4bf6-a739-d23f5e64697b';
  const employee = await prisma.employee.findUnique({ where: { id } });
  console.log('Employee with ID a0bf... found:', !!employee);
  
  if (!employee) {
    const all = await prisma.employee.findMany({ take: 10 });
    console.log('All employees IDs:', all.map(e => e.id));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
