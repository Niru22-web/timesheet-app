const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setNiranjanPassword() {
  try {
    console.log('🔐 Setting password for Niranjan...');

    // Find Niranjan
    const niranjan = await prisma.employee.findFirst({
      where: {
        firstName: 'Niranjan',
        role: 'admin'
      }
    });

    if (niranjan) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Update the password
      const updated = await prisma.employee.update({
        where: {
          id: niranjan.id
        },
        data: {
          password: hashedPassword
        }
      });

      console.log('✅ Password set successfully!');
      console.log('📋 Login Credentials:');
      console.log(`   Employee ID: ${updated.employeeId}`);
      console.log(`   Email: ${updated.officeEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${updated.role}`);
    } else {
      console.log('❌ Niranjan admin user not found');
    }

  } catch (error) {
    console.error('❌ Error setting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setNiranjanPassword();
