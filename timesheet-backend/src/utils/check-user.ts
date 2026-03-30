import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(email: string) {
  console.log(`🔍 Checking database for user: ${email}`);
  
  try {
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (user) {
      console.log('✅ User Found!');
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Name: ${user.firstName} ${user.lastName}`);
      console.log(`  - Status: ${user.status}`);
      console.log(`  - Password Set: ${!!user.password}`);
      console.log(`  - Role: ${user.role}`);
    } else {
      console.log('❌ User NOT Found in database.');
      
      // List all users to see if there's a typo
      const allUsers = await prisma.employee.findMany({
        take: 5,
        select: { officeEmail: true }
      });
      console.log('\n📋 Sample of existing users:');
      allUsers.forEach(u => console.log(`  - ${u.officeEmail}`));
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const emailToCheck = process.argv[2];
if (!emailToCheck) {
  console.log('Usage: npx ts-node src/utils/check-user.ts <email>');
} else {
  checkUser(emailToCheck);
}
