import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.employee.findFirst({ where: { role: 'Admin' } });
  if (admin) {
    console.log('Admin ID:', admin.id);
  } else {
    console.log('No Admin found');
  }
}
main().finally(() => prisma.$disconnect());
