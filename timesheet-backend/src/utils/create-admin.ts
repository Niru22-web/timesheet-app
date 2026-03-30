import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'niranjan.mulam@asaind.co.in';
  const password = 'admin123';
  const firstName = 'Niranjan';
  const lastName = 'Mulam';
  const role = 'admin';

  console.log(`🚀 Attempting to create admin user: ${email}`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the employee record
    const admin = await prisma.employee.create({
      data: {
        employeeId: 'EMP001',
        firstName,
        lastName,
        officeEmail: email,
        password: hashedPassword,
        role,
        status: 'active',
        designation: 'Administrator',
        department: 'Management'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`  - ID: ${admin.id}`);
    console.log(`  - Employee ID: ${admin.employeeId}`);
    
    // Optional: Create profile record if you want
    await prisma.employeeProfile.create({
      data: {
        employeeId: admin.id,
        dob: new Date('1990-01-01'),
        doj: new Date(),
        education: 'N/A',
        maritalStatus: 'N/A',
        gender: 'N/A'
      }
    });
    console.log('✅ Admin profile created successfully!');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️ A user with this email already exists.');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
