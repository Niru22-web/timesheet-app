const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const employees = [
  // Admin Level Employees
  {
    firstName: 'Robert',
    lastName: 'Anderson',
    officeEmail: 'robert.anderson@company.com',
    designation: 'Chief Executive Officer',
    role: 'admin',
    status: 'active',
    password: 'admin123'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Taylor',
    officeEmail: 'jennifer.taylor@company.com',
    designation: 'Chief Technology Officer',
    role: 'admin',
    status: 'active',
    password: 'admin123'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    officeEmail: 'michael.chen@company.com',
    designation: 'Chief Financial Officer',
    role: 'admin',
    status: 'active',
    password: 'admin123'
  },
  {
    firstName: 'Lisa',
    lastName: 'Wilson',
    officeEmail: 'lisa.wilson@company.com',
    designation: 'Human Resources Manager',
    role: 'admin',
    status: 'active',
    password: 'admin123'
  },
  {
    firstName: 'David',
    lastName: 'Martinez',
    officeEmail: 'david.martinez@company.com',
    designation: 'IT Director',
    role: 'admin',
    status: 'active',
    password: 'admin123'
  },
  
  // Manager Level Employees
  {
    firstName: 'Jane',
    lastName: 'Smith',
    officeEmail: 'jane.smith@company.com',
    designation: 'Senior Project Manager',
    role: 'manager',
    status: 'active',
    password: 'manager123'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    officeEmail: 'mike.johnson@company.com',
    designation: 'Development Team Lead',
    role: 'manager',
    status: 'active',
    password: 'manager123'
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    officeEmail: 'sarah.williams@company.com',
    designation: 'Design Team Lead',
    role: 'manager',
    status: 'active',
    password: 'manager123'
  },
  {
    firstName: 'James',
    lastName: 'Brown',
    officeEmail: 'james.brown@company.com',
    designation: 'Quality Assurance Manager',
    role: 'manager',
    status: 'active',
    password: 'manager123'
  },
  {
    firstName: 'Amanda',
    lastName: 'Davis',
    officeEmail: 'amanda.davis@company.com',
    designation: 'Product Manager',
    role: 'manager',
    status: 'active',
    password: 'manager123'
  },
  
  // Regular Employees
  {
    firstName: 'John',
    lastName: 'Doe',
    officeEmail: 'john.doe@company.com',
    designation: 'Senior Full Stack Developer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Emily',
    lastName: 'Garcia',
    officeEmail: 'emily.garcia@company.com',
    designation: 'Frontend Developer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Christopher',
    lastName: 'Lee',
    officeEmail: 'chris.lee@company.com',
    designation: 'Backend Developer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Sophia',
    lastName: 'Miller',
    officeEmail: 'sophia.miller@company.com',
    designation: 'UI/UX Designer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Daniel',
    lastName: 'Wilson',
    officeEmail: 'daniel.wilson@company.com',
    designation: 'DevOps Engineer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Olivia',
    lastName: 'Anderson',
    officeEmail: 'olivia.anderson@company.com',
    designation: 'QA Engineer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'William',
    lastName: 'Taylor',
    officeEmail: 'william.taylor@company.com',
    designation: 'Business Analyst',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Isabella',
    lastName: 'Thomas',
    officeEmail: 'isabella.thomas@company.com',
    designation: 'Technical Writer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Ethan',
    lastName: 'Jackson',
    officeEmail: 'ethan.jackson@company.com',
    designation: 'Junior Developer',
    role: 'user',
    status: 'active',
    password: 'user123'
  },
  {
    firstName: 'Mia',
    lastName: 'White',
    officeEmail: 'mia.white@company.com',
    designation: 'Intern Developer',
    role: 'user',
    status: 'active',
    password: 'user123'
  }
];

const employeeProfiles = [
  {
    dob: new Date('1990-05-15'),
    doj: new Date('2020-01-15'),
    education: 'B.Tech Computer Science',
    maritalStatus: 'Single',
    gender: 'Male',
    permanentAddress: '123 Main St, City, State 12345',
    currentAddress: '456 Oak Ave, City, State 12345',
    pan: 'ABCDE1234F',
    aadhaar: '123456789012'
  },
  {
    dob: new Date('1988-08-22'),
    doj: new Date('2019-03-10'),
    education: 'MBA',
    maritalStatus: 'Married',
    gender: 'Female',
    permanentAddress: '789 Elm St, City, State 67890',
    currentAddress: '321 Pine Rd, City, State 67890',
    pan: 'FGHIJ5678K',
    aadhaar: '345678901234'
  },
  {
    dob: new Date('1985-12-10'),
    doj: new Date('2018-06-01'),
    education: 'M.Tech Software Engineering',
    maritalStatus: 'Married',
    gender: 'Male',
    permanentAddress: '456 Maple Dr, City, State 11111',
    currentAddress: '789 Cedar Ln, City, State 11111',
    pan: 'KLMNO9012P',
    aadhaar: '567890123456'
  },
  {
    dob: new Date('1992-03-25'),
    doj: new Date('2021-02-15'),
    education: 'B.Des Graphic Design',
    maritalStatus: 'Single',
    gender: 'Female',
    permanentAddress: '321 Birch Blvd, City, State 22222',
    currentAddress: '654 Spruce Way, City, State 22222',
    pan: 'PQRST3456U',
    aadhaar: '789012345678'
  },
  {
    dob: new Date('1987-07-18'),
    doj: new Date('2019-09-20'),
    education: 'B.Sc Computer Science',
    maritalStatus: 'Single',
    gender: 'Male',
    permanentAddress: '987 Redwood Sq, City, State 33333',
    currentAddress: '147 Fir Ct, City, State 33333',
    pan: 'UVWXY7890Z',
    aadhaar: '890123456789'
  },
  {
    dob: new Date('1993-11-30'),
    doj: new Date('2020-07-01'),
    education: 'B.Tech Information Technology',
    maritalStatus: 'Single',
    gender: 'Female',
    permanentAddress: '258 Oak Terr, City, State 44444',
    currentAddress: '369 Pine Pl, City, State 44444',
    pan: 'ZABCD1234E',
    aadhaar: '901234567890'
  },
  {
    dob: new Date('1986-04-12'),
    doj: new Date('2018-11-15'),
    education: 'B.Com',
    maritalStatus: 'Married',
    gender: 'Male',
    permanentAddress: '741 Elm Dr, City, State 55555',
    currentAddress: '852 Maple Ave, City, State 55555',
    pan: 'EFGHI5678J',
    aadhaar: '012345678901'
  },
  {
    dob: new Date('1984-09-08'),
    doj: new Date('2017-05-10'),
    education: 'MA HR',
    maritalStatus: 'Married',
    gender: 'Female',
    permanentAddress: '963 Cedar St, City, State 66666',
    currentAddress: '147 Birch Rd, City, State 66666',
    pan: 'JKLMN9012O',
    aadhaar: '234567890123'
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

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.timelog.deleteMany();
    await prisma.projectUser.deleteMany();
    await prisma.job.deleteMany();
    await prisma.project.deleteMany();
    await prisma.employeeProfile.deleteMany();
    await prisma.employee.deleteMany();
    console.log('✅ Existing data cleaned');

    // Create employees
    console.log('👥 Creating employees...');
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const profile = employeeProfiles[i % employeeProfiles.length]; // Use modulo to cycle through available profiles
      
      const employeeId = await generateEmployeeId();
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      
      const employee = await prisma.employee.create({
        data: {
          employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          officeEmail: emp.officeEmail,
          designation: emp.designation,
          role: emp.role,
          status: emp.status,
          password: hashedPassword,
        }
      });
      
      // Create employee profile if available
      if (profile) {
        await prisma.employeeProfile.create({
          data: {
            employeeId: employee.id,
            dob: profile.dob,
            doj: profile.doj,
            education: profile.education,
            maritalStatus: profile.maritalStatus,
            gender: profile.gender,
            permanentAddress: profile.permanentAddress,
            currentAddress: profile.currentAddress,
            pan: profile.pan,
            aadhaar: profile.aadhaar,
          }
        });
      }
      
      console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName} (${employeeId})`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Created ${employees.length} employees`);
    console.log(`- Created ${employeeProfiles.length} employee profiles`);
    console.log('\n🔑 Login credentials:');
    employees.forEach(emp => {
      console.log(`- ${emp.officeEmail}: ${emp.password}`);
    });
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
