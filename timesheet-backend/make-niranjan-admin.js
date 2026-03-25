// Script to make Niranjan the admin user
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function makeNiranjanAdmin() {
  try {
    console.log('🔧 Making Niranjan the admin user...');

    // Update Niranjan's role to admin
    const updatedNiranjan = await prisma.employee.update({
      where: { officeEmail: 'niranjan.mulam@asaind.co.in' },
      data: { role: 'admin' }
    });

    console.log('✅ Niranjan updated to admin:');
    console.log(`- Name: ${updatedNiranjan.firstName} ${updatedNiranjan.lastName}`);
    console.log(`- Email: ${updatedNiranjan.officeEmail}`);
    console.log(`- Employee ID: ${updatedNiranjan.employeeId}`);
    console.log(`- Role: ${updatedNiranjan.role}`);
    console.log(`- Designation: ${updatedNiranjan.designation}`);

    // Update Lisa Wilson back to user (optional)
    const updatedLisa = await prisma.employee.update({
      where: { officeEmail: 'lisa.wilson@company.com' },
      data: { role: 'user' }
    });

    console.log('\n✅ Lisa Wilson updated to user:');
    console.log(`- Name: ${updatedLisa.firstName} ${updatedLisa.lastName}`);
    console.log(`- Email: ${updatedLisa.officeEmail}`);
    console.log(`- Role: ${updatedLisa.role}`);

    // Show all admin users
    console.log('\n👑 Current Admin Users:');
    const adminUsers = await prisma.employee.findMany({
      where: { role: 'admin' },
      select: {
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        designation: true,
        status: true
      }
    });

    adminUsers.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (${admin.employeeId}) - ${admin.officeEmail}`);
    });

    console.log('\n🎉 Admin role update completed!');
    console.log('🔑 Niranjan can now login as admin with:');
    console.log('   Email: niranjan.mulam@asaind.co.in');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error updating admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeNiranjanAdmin();
