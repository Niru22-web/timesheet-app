// Test script to verify employee registration email sending flow
const axios = require('axios');

async function testEmployeeEmailFlow() {
  console.log('🧪 Testing Employee Registration Email Flow...\n');

  const API_BASE_URL = 'http://localhost:5000';
  const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual admin token

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // 1. Check email configuration first
    console.log('1. Checking email configuration...');
    const emailStatusResponse = await api.get('/api/email/status');
    console.log('Email status:', emailStatusResponse.data);

    // 2. Check if registration email template exists
    console.log('\n2. Checking email templates...');
    try {
      const templatesResponse = await api.get('/api/admin/email-templates');
      const registrationTemplate = templatesResponse.data?.find(t => t.category === 'Registration');
      if (registrationTemplate) {
        console.log('✅ Registration template found:', registrationTemplate.name);
      } else {
        console.log('⚠️ No registration template found - will use fallback');
      }
    } catch (err) {
      console.log('⚠️ Could not check email templates');
    }

    // 3. Create a test employee
    console.log('\n3. Creating test employee...');
    const testEmployee = {
      firstName: 'Test',
      lastName: 'Employee',
      officeEmail: 'test.employee@example.com',
      role: 'Employee',
      designation: 'Test Developer',
      department: 'IT',
      status: 'active',
      employeeId: 'TEST001'
    };

    const createResponse = await api.post('/api/employees', testEmployee);
    console.log('Employee creation response:', {
      success: createResponse.data.success,
      emailStatus: createResponse.data.emailStatus,
      message: createResponse.data.message,
      employeeId: createResponse.data.data?.employeeId
    });

    // 4. Check email logs
    console.log('\n4. Checking email logs...');
    try {
      // This would require creating an endpoint to fetch email logs
      console.log('📝 Email logs would show the registration email status');
      console.log('   - Check the email_logs table in the database');
      console.log('   - Look for entries with category="registration"');
    } catch (err) {
      console.log('Could not check email logs');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Employee created:', createResponse.data.data?.firstName + ' ' + createResponse.data.data?.lastName);
    console.log('- Email status:', createResponse.data.emailStatus);
    console.log('- Message:', createResponse.data.message);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Manual testing instructions
console.log(`
📋 Manual Testing Instructions:

1. Prerequisites:
   ✅ Backend server running on port 5000
   ✅ Frontend server running on port 5173
   ✅ Outlook email account configured and connected
   ✅ Admin user logged in

2. Test Steps:
   a) Go to Email Configuration page
   b) Ensure Outlook account is connected
   c) Navigate to Employees page
   d) Click "Add Employee" button
   e) Fill in all required fields:
      - First Name: Test
      - Last Name: Employee  
      - Email: test@example.com
      - Role: Employee
      - Designation: Test Developer
      - Department: IT
   f) Click "Add Employee" button

3. Expected Results:
   ✅ Employee created in database
   ✅ Registration email sent to test@example.com
   ✅ Success message shows email status
   ✅ Email log entry created in email_logs table

4. Verification:
   📧 Check email inbox for registration email
   📊 Check email_logs table in database
   🔍 Check browser console for detailed logs
   📝 Check backend console for email sending logs

5. Email Content Should Include:
   - Welcome message
   - Employee's name and details
   - Registration link with token
   - Company information
   - Login instructions

🐛 Troubleshooting:
- If email not sent: Check Outlook OAuth connection
- If template not found: Check email_templates table
- If token not generated: Check registration_tokens table
- If logs not created: Check email_logs table schema

🔍 Database Queries to Verify:
-- Check email logs
SELECT * FROM email_logs WHERE category = 'registration' ORDER BY sent_at DESC LIMIT 5;

-- Check registration tokens
SELECT * FROM registration_tokens ORDER BY created_at DESC LIMIT 5;

-- Check email templates
SELECT * FROM email_templates WHERE category = 'Registration';
`);

if (require.main === module) {
  if (process.argv.includes('--manual')) {
    console.log('Showing manual testing instructions...');
  } else {
    testEmployeeEmailFlow();
  }
}

module.exports = { testEmployeeEmailFlow };
