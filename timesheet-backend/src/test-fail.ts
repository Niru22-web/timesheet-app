import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueries() {
  try {
    console.log('Testing EmailTemplate findMany...');
    const templates = await prisma.emailTemplate.findMany();
    console.log('Templates found:', templates.length);

    console.log('Testing LeaveBalance findFirst...');
    const balance = await prisma.leaveBalance.findFirst();
    console.log('Balance found:', balance);

    // Test the failing findUnique
    console.log('Testing failing findUnique for LeaveBalance...');
    try {
      const failingBalance = await (prisma.leaveBalance as any).findUnique({
        where: {
          employeeId: 'EMP001',
          year: 2026
        }
      });
      console.log('Failing balance result:', failingBalance);
    } catch (e: any) {
      console.log('Caught expected error in findUnique:', e.message);
    }

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQueries();
