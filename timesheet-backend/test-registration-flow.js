// Comprehensive test for employee registration email flow
const axios = require('axios');

async function testRegistrationEmailFlow() {
  const API_BASE_URL = 'http://localhost:5000';
  
  // You need to get a real JWT token by logging in as admin
  const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️ Please update JWT_TOKEN with a real admin token');
    console.log('1. Login as admin and get the token from browser localStorage');
    console.log('2. Update the JWT_TOKEN variable in this script');
    return;
  }

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    console.log('🧪 Testing Employee Registration Email Flow...\n');

    // 1. Check email status
    console.log('1. Checking email configuration...');
    const emailStatus = await api.get('/api/email/status');
    console.log('Email status:', emailStatus.data);

    // 2. Create test employee
    console.log('\n2. Creating test employee...');
    const testEmployee = {
      firstName: 'Test',
      lastName: 'Employee',
      officeEmail: 'test.employee@company.com', // Use a real email for testing
      role: 'Employee',
      designation: 'Test Developer',
      department: 'IT',
      status: 'active'
    };

    const createResponse = await api.post('/api/employees', testEmployee);
    
    console.log('✅ Employee created successfully!');
    console.log('📊 Response details:');
    console.log(`   - Employee ID: ${createResponse.data.data?.employeeId}`);
    console.log(`   - Email Status: ${createResponse.data.emailStatus}`);
    console.log(`   - Message: ${createResponse.data.message}`);

    // 3. Check email logs
    console.log('\n3. Checking email logs...');
    // This would require creating an endpoint to fetch email logs
    console.log('📝 Check the email_logs table in the database for email status');
    console.log('   Query: SELECT * FROM email_logs WHERE category = "registration" ORDER BY sent_at DESC;');

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check the email inbox for registration email');
    console.log('2. Verify email content includes registration link');
    console.log('3. Test the registration link works');
    console.log('4. Check database for email logs and registration tokens');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Manual testing guide
console.log(`
📋 COMPLETE TESTING GUIDE FOR EMPLOYEE REGISTRATION EMAIL

✅ PREREQUISITES CHECKED:
   - Backend server running on port 5000
   - Frontend server running on port 5173  
   - Outlook email account connected (Niranjan Mulam)
   - Registration email template exists
   - Database schema updated with email_logs table

🧪 TESTING OPTIONS:

1. AUTOMATED API TEST:
   - Update JWT_TOKEN in test-registration-flow.js
   - Run: node test-registration-flow.js
   - Creates test employee via API

2. MANUAL UI TEST (RECOMMENDED):
   a) Login as admin user
   b) Go to Employees page
   c) Click "Add Employee" button
   d) Fill in form with REAL email address:
      - First Name: Test
      - Last Name: Employee
      - Email: your-real-email@example.com
      - Role: Employee
      - Designation: Test Developer  
      - Department: IT
   e) Click "Add Employee"
   f) Check for success message with email status
   g) Check email inbox for registration email

📧 EXPECTED EMAIL CONTENT:
   - Subject: "Welcome to [Company Name]"
   - Welcome message with employee name
   - Registration link with secure token
   - Company information
   - Login instructions

🔍 VERIFICATION CHECKPOINTS:
   ✅ Backend console shows email sending logs
   ✅ Frontend shows appropriate success message
   ✅ Email received in inbox
   ✅ Registration link works and leads to setup page
   ✅ Database has email_logs entry with "sent" status
   ✅ Database has registration_tokens entry

🐛 TROUBLESHOOTING:
   - No email: Check Outlook connection in Email Configuration
   - Error message: Check backend console for detailed error
   - Wrong template: Check email_templates table
   - Token invalid: Check registration_tokens table

📊 DATABASE QUERIES:
-- Check recent email logs
SELECT * FROM email_logs 
WHERE category = 'registration' 
ORDER BY sent_at DESC LIMIT 5;

-- Check registration tokens
SELECT * FROM registration_tokens 
ORDER BY created_at DESC LIMIT 5;

-- Check email connections
SELECT * FROM "EmailConnection" 
WHERE provider = 'outlook' AND isActive = true;
`);

if (require.main === module) {
  if (process.argv.includes('--guide')) {
    console.log('Showing testing guide...');
  } else {
    testRegistrationEmailFlow();
  }
}

module.exports = { testRegistrationEmailFlow };
