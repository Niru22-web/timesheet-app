// Simple database seeding script for Windows
// Run this script to populate the database with sample data

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

const employees = [
  {
    firstName: 'Niranjan',
    lastName: 'Mulam',
    officeEmail: 'niranjan.mulam@asaind.co.in',
    designation: 'Software Developer',
    department: 'IT',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    officeEmail: 'john.doe@company.com',
    designation: 'Senior Developer',
    department: 'IT',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    officeEmail: 'jane.smith@company.com',
    designation: 'Project Manager',
    department: 'IT',
    role: 'manager',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    officeEmail: 'mike.johnson@company.com',
    designation: 'Team Lead',
    department: 'IT',
    role: 'manager',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    officeEmail: 'sarah.williams@company.com',
    designation: 'UI/UX Designer',
    department: 'Design',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    officeEmail: 'david.brown@company.com',
    designation: 'DevOps Engineer',
    department: 'IT',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    officeEmail: 'emily.davis@company.com',
    designation: 'QA Engineer',
    department: 'IT',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Robert',
    lastName: 'Miller',
    officeEmail: 'robert.miller@company.com',
    designation: 'Business Analyst',
    department: 'Business',
    role: 'user',
    status: 'active',
    password: 'password123'
  },
  {
    firstName: 'Lisa',
    lastName: 'Wilson',
    officeEmail: 'lisa.wilson@company.com',
    designation: 'HR Manager',
    department: 'HR',
    role: 'admin',
    status: 'active',
    password: 'password123'
  }
];

async function generateEmployeeId() {
  const lastEmployee = await prisma.employee.findFirst({
    orderBy: { employeeId: 'desc' }
  });
  
  if (!lastEmployee) {
    return 'EMP001';
  }
  
  const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
  const newNumber = lastNumber + 1;
  return `EMP${newNumber.toString().padStart(3, '0')}`;
}

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('📊 Database URL:', process.env.DATABASE_URL);

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check existing data
    const existingCount = await prisma.employee.count();
    console.log(`📊 Existing employees: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  Database already contains data. Cleaning...');
      await prisma.timelog.deleteMany();
      await prisma.projectUser.deleteMany();
      await prisma.job.deleteMany();
      await prisma.project.deleteMany();
      await prisma.employeeProfile.deleteMany();
      await prisma.employee.deleteMany();
      console.log('✅ Existing data cleaned');
    }

    // Create employees
    console.log('👥 Creating employees...');
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      
      const employeeId = await generateEmployeeId();
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      
      const employee = await prisma.employee.create({
        data: {
          employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          officeEmail: emp.officeEmail,
          designation: emp.designation,
          department: emp.department,
          role: emp.role,
          status: emp.status,
          password: hashedPassword,
        }
      });
      
      console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName} (${employeeId})`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Created ${employees.length} employees`);
    console.log('\n🔑 Login credentials:');
    employees.forEach(emp => {
      console.log(`- ${emp.officeEmail}: ${emp.password}`);
    });
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
