
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    console.log('Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to database');

    console.log('Checking Notification table...');
    const notifications = await prisma.notification.findMany({ take: 1 });
    console.log('✅ Notification table exists');

    console.log('Checking RolePermission table...');
    const rolePermissions = await prisma.rolePermission.findMany({ take: 1 });
    console.log('✅ RolePermission table exists');

    console.log('Checking UserPermission table...');
    const userPermissions = await prisma.userPermission.findMany({ take: 1 });
    console.log('✅ UserPermission table exists');

    console.log('Checking EmailTemplate table...');
    const templates = await prisma.emailTemplate.findMany({ take: 1 });
    console.log('✅ EmailTemplate table exists');

  } catch (err) {
    console.error('❌ DB CHECK FAILED:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
