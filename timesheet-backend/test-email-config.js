// Quick test to verify email configuration and registration flow
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmailConfiguration() {
  try {
    console.log('🔍 Testing Email Configuration...\n');

    // 1. Check for active email connections
    console.log('1. Checking email connections...');
    const outlookConnections = await prisma.emailConnection.findMany({
      where: {
        provider: 'outlook',
        isActive: true
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    const gmailConnections = await prisma.emailConnection.findMany({
      where: {
        provider: 'gmail',
        isActive: true
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    console.log('📊 Email Connections Found:');
    console.log(`   Outlook: ${outlookConnections.length} active connection(s)`);
    outlookConnections.forEach(conn => {
      console.log(`     - ${conn.employee.firstName} ${conn.employee.lastName} (${conn.employee.officeEmail})`);
    });
    
    console.log(`   Gmail: ${gmailConnections.length} active connection(s)`);
    gmailConnections.forEach(conn => {
      console.log(`     - ${conn.employee.firstName} ${conn.employee.lastName} (${conn.employee.officeEmail})`);
    });

    // 2. Check email templates
    console.log('\n2. Checking email templates...');
    const registrationTemplates = await prisma.emailTemplate.findMany({
      where: {
        category: 'Registration',
        status: 'active'
      }
    });

    console.log(`📝 Registration Templates: ${registrationTemplates.length} found`);
    registrationTemplates.forEach(template => {
      console.log(`   - ${template.name}: "${template.subject}"`);
    });

    // 3. Check recent email logs
    console.log('\n3. Checking recent email logs...');
    const recentEmailLogs = await prisma.emailLog.findMany({
      where: {
        category: 'registration'
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 5
    });

    console.log(`📋 Recent Email Logs: ${recentEmailLogs.length} found`);
    recentEmailLogs.forEach(log => {
      console.log(`   - ${log.recipient} | Status: ${log.status} | ${log.sentAt.toISOString()}`);
      if (log.errorMessage) {
        console.log(`     Error: ${log.errorMessage}`);
      }
    });

    // 4. Summary
    console.log('\n✅ Email Configuration Summary:');
    const hasEmailProvider = outlookConnections.length > 0 || gmailConnections.length > 0;
    const hasTemplate = registrationTemplates.length > 0;
    
    console.log(`   Email Provider Configured: ${hasEmailProvider ? '✅ Yes' : '❌ No'}`);
    console.log(`   Registration Template: ${hasTemplate ? '✅ Yes' : '❌ No'}`);
    
    if (hasEmailProvider && hasTemplate) {
      console.log('\n🎉 Email system is properly configured!');
      console.log('   Registration emails should be sent when new employees are created.');
    } else {
      console.log('\n⚠️ Email system needs configuration:');
      if (!hasEmailProvider) {
        console.log('   - Connect an email account in Email Configuration page');
      }
      if (!hasTemplate) {
        console.log('   - Create a Registration email template');
      }
    }

  } catch (error) {
    console.error('❌ Error testing email configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test instructions
console.log(`
📋 How to Test Employee Registration Email:

1. Prerequisites:
   ✅ Backend server running (npm run dev)
   ✅ Admin user logged into frontend
   ✅ Email account connected in Email Configuration

2. Quick Test:
   Run this script to check configuration: node test-email-config.js

3. Full Test:
   a) Go to Employees page in frontend
   b) Click "Add Employee" 
   c) Fill in employee details with REAL email address
   d) Click "Add Employee" button
   e) Check the email inbox for registration email
   f) Check backend console for email sending logs

4. Debugging:
   - Check browser Network tab for API response
   - Check backend console for detailed logs
   - Check email_logs table in database
   - Verify email_connections table has active records

5. Expected Flow:
   Employee Created → Token Generated → Email Sent → Log Updated → Success Response
`);

if (require.main === module) {
  testEmailConfiguration();
}

module.exports = { testEmailConfiguration };
