const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createNiranjanAdmin() {
  try {
    console.log('🔧 Creating Niranjan as admin user...');

    // First, let's check if Niranjan already exists
    const existingNiranjan = await prisma.employee.findFirst({
      where: {
        firstName: 'Niranjan'
      }
    });

    if (existingNiranjan) {
      console.log('👤 Found existing Niranjan user:');
      console.log(`   ID: ${existingNiranjan.employeeId}`);
      console.log(`   Email: ${existingNiranjan.officeEmail}`);
      console.log(`   Current Role: ${existingNiranjan.role}`);
      
      // Update existing Niranjan to admin
      const updatedNiranjan = await prisma.employee.update({
        where: {
          id: existingNiranjan.id
        },
        data: {
          role: 'admin',
          status: 'active'
        }
      });
      
      console.log('✅ Updated Niranjan to admin role!');
      console.log(`   New Role: ${updatedNiranjan.role}`);
      console.log(`   Status: ${updatedNiranjan.status}`);
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
          password: hashedPassword,
          reportingManager: null,
          reportingPartner: null
        }
      });
      
      console.log('✅ Created new Niranjan admin user!');
      console.log(`   ID: ${newNiranjan.employeeId}`);
      console.log(`   Email: ${newNiranjan.officeEmail}`);
      console.log(`   Role: ${newNiranjan.role}`);
      console.log(`   Password: admin123 (temporary)`);
    }

    // Create employee profile
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        employeeId: existingNiranjan?.id || 'EMP001'
      }
    });

    if (!profile) {
      await prisma.employeeProfile.create({
        data: {
          employeeId: existingNiranjan?.id || 'EMP001',
          employeePhotoUrl: null,
          personalEmail: 'niranjan.personal@gmail.com',
          phoneNumber: '+91-9876543210',
          address: '123, Main Street, Bangalore, India',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'Male',
          bloodGroup: 'O+',
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '+91-9876543211',
          panNumber: 'ABCDE1234F',
          aadhaarNumber: '123456789012',
          bankAccountNumber: '1234567890',
          bankIfscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          dateOfJoining: new Date('2023-01-01'),
          employmentType: 'Permanent',
          workLocation: 'Bangalore',
          skills: 'JavaScript, Node.js, React, PostgreSQL',
          education: 'B.E. Computer Science',
          previousExperience: '5 years',
          salary: '1200000',
          performanceRating: 'Excellent',
          notes: 'System Administrator with full access'
        }
      });
      
      console.log('✅ Created employee profile for Niranjan!');
    }

    // Verify the admin user
    const adminUser = await prisma.employee.findFirst({
      where: {
        firstName: 'Niranjan',
        role: 'admin'
      },
      include: {
        profile: true
      }
    });

    if (adminUser) {
      console.log('\n🎉 Niranjan Admin Setup Complete!');
      console.log('📋 Login Details:');
      console.log(`   Employee ID: ${adminUser.employeeId}`);
      console.log(`   Email: ${adminUser.officeEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log('\n🔐 Login with these credentials in the frontend!');
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
