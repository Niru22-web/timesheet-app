const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 Clearing all data...');
  await prisma.timelog.deleteMany();
  await prisma.projectUser.deleteMany();
  await prisma.job.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.employee.deleteMany();
  console.log('✅ All data cleared successfully!');
  await prisma.$disconnect();
}

clearData().catch(console.error);
