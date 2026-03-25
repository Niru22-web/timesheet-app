const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createNiranjanAdmin() {
  try {
    console.log('🔧 Creating Niranjan as admin user in PostgreSQL...');

    // Check if Niranjan already exists
    const existingNiranjan = await prisma.employee.findFirst({
      where: {
        employeeId: 'EMP001'
      }
    });

    if (existingNiranjan) {
      console.log('👤 Found existing Niranjan user, updating to admin...');
      
      // Update existing Niranjan to admin
      const updatedNiranjan = await prisma.employee.update({
        where: {
          id: existingNiranjan.id
        },
        data: {
          role: 'admin',
          status: 'active',
          password: await bcrypt.hash('admin123', 10)
        }
      });
      
      console.log('✅ Updated Niranjan to admin role!');
      console.log(`   Employee ID: ${updatedNiranjan.employeeId}`);
      console.log(`   Email: ${updatedNiranjan.officeEmail}`);
      console.log(`   Role: ${updatedNiranjan.role}`);
      console.log(`   Status: ${updatedNiranjan.status}`);
      console.log(`   Password: admin123 (updated)`);
    } else {
      // Create new Niranjan admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newNiranjan = await prisma.employee.create({
        data: {
          employeeId: 'EMP001',
          firstName: 'Niranjan',
          lastName: 'Mulam',
          officeEmail: 'niranjan.mulam@asaind.co.in',
          designation: 'System Administrator',
          department: 'IT',
          role: 'admin',
          status: 'active',
          password: hashedPassword
        }
      });
      
      console.log('✅ Created new Niranjan admin user!');
      console.log(`   Employee ID: ${newNiranjan.employeeId}`);
      console.log(`   Email: ${newNiranjan.officeEmail}`);
      console.log(`   Role: ${newNiranjan.role}`);
      console.log(`   Password: admin123`);
    }

    // Verify admin user
    const adminUser = await prisma.employee.findFirst({
      where: {
        employeeId: 'EMP001',
        role: 'admin'
      }
    });

    if (adminUser) {
      console.log('\n🎉 Niranjan Admin Setup Complete!');
      console.log('📋 PostgreSQL Login Details:');
      console.log(`   Employee ID: ${adminUser.employeeId}`);
      console.log(`   Email: ${adminUser.officeEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log('\n🔐 Login with these credentials in frontend!');
    } else {
      console.log('❌ Failed to create/admin Niranjan user');
    }

  } catch (error) {
    console.error('❌ Error creating Niranjan admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNiranjanAdmin();
