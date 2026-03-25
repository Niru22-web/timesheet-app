const { PrismaClient } = require('@prisma/client');
const EmailService = require('./src/modules/email/email.service').default;
const { sendPasswordResetEmail } = require('./src/services/email.service');

const prisma = new PrismaClient();

async function testEmailConfiguration() {
  console.log('🔍 Testing Email Configuration...\n');

  try {
    // 1. Check environment variables
    console.log('📋 Environment Variables:');
    console.log('✅ OUTLOOK_CLIENT_ID:', process.env.OUTLOOK_CLIENT_ID ? 'Set' : 'Missing');
    console.log('✅ OUTLOOK_CLIENT_SECRET:', process.env.OUTLOOK_CLIENT_SECRET ? 'Set' : 'Missing');
    console.log('✅ MICROSOFT_REDIRECT_URI:', process.env.MICROSOFT_REDIRECT_URI || 'Not set');
    console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
    console.log('');

    // 2. Check email connections in database
    console.log('📊 Email Connections in Database:');
    const connections = await prisma.emailConnection.findMany({
      where: { isActive: true },
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

    if (connections.length === 0) {
      console.log('❌ No active email connections found');
      console.log('💡 Please connect an email account in the Email Configuration page');
    } else {
      connections.forEach(conn => {
        console.log(`✅ ${conn.provider.toUpperCase()}: ${conn.email}`);
        console.log(`   Employee: ${conn.employee.firstName} ${conn.employee.lastName}`);
        console.log(`   Token expires: ${conn.tokenExpiry}`);
        console.log(`   Has refresh token: ${conn.refreshToken ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // 3. Test email sending
    console.log('📧 Testing Email Sending...');
    
    const testEmail = 'test@example.com'; // Replace with your test email
    const testResetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=test-token`;
    
    try {
      const emailSent = await sendPasswordResetEmail(testEmail, testResetLink);
      
      if (emailSent) {
        console.log('✅ Test email sent successfully!');
      } else {
        console.log('❌ Test email failed to send');
        console.log('💡 Check the logs above for specific error details');
      }
    } catch (emailError) {
      console.error('❌ Email sending failed with error:', emailError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailConfiguration();
