import EmailService from '../modules/email/email.service';
import nodemailer from 'nodemailer';

// Direct Email Connector interface
interface DirectEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create SMTP transporter if SMTP credentials are available
const createSMTPTransporter = () => {
  console.log('🔍 Checking SMTP configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✅ Set' : '❌ Missing');
  console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
  
  if (SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    console.log('📧 Creating SMTP transporter with:', {
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      user: SMTP_CONFIG.auth.user
    });
    return nodemailer.createTransport(SMTP_CONFIG);
  } else {
    console.log('❌ SMTP credentials not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
  }
  return null;
};

export const sendEmail = async (options: DirectEmailOptions): Promise<boolean> => {
  const startTime = Date.now();
  
  try {
    console.log('📧 === EMAIL SENDING START ===');
    console.log('📋 To:', options.to);
    console.log('📋 Subject:', options.subject);
    console.log('📋 HTML length:', options.html?.length || 0);
    console.log('📋 Text length:', options.text?.length || 0);
    
    // Check available services
    const connections = await EmailService.getAllEmailConnections();
    console.log('📋 Available OAuth connections:', connections.length);
    
    const outlookConnection = connections.find(conn => conn.provider === 'outlook' && conn.accessToken);
    
    if (outlookConnection) {
      console.log('🔐 Using Outlook OAuth connection from:', outlookConnection.email);
      console.log('🔐 Token expires at:', outlookConnection.tokenExpiry);
      
      try {
        // Check if token needs refresh before sending
        const now = new Date();
        const tokenExpiry = new Date(outlookConnection.tokenExpiry);
        const isTokenExpired = now > tokenExpiry;
        
        if (isTokenExpired) {
          console.log('🔄 Access token expired, refreshing before sending email...');
          try {
            const newToken = await EmailService.refreshAccessToken(outlookConnection);
            console.log('✅ Token refreshed successfully');
            outlookConnection.accessToken = newToken;
          } catch (refreshError) {
            console.error('❌ Failed to refresh token:', refreshError);
            throw new Error('Outlook token refresh failed. Please reconnect the email account.');
          }
        }
        
        // Send email using the EmailService's internal method
        await EmailService['sendSystemEmail']({
          to: options.to,
          subject: options.subject,
          content: options.html || options.text || '',
          isHtml: !!options.html
        });
        
        const endTime = Date.now();
        console.log('✅ Email sent successfully via OAuth to:', options.to);
        console.log('⏱️ Time taken:', endTime - startTime, 'ms');
        
        return true;
        
      } catch (oauthError) {
        console.error('❌ Outlook OAuth failed:', oauthError);
        console.error('❌ OAuth error details:', oauthError instanceof Error ? oauthError.message : 'Unknown error');
        
        // Don't fall back to SMTP for OAuth-specific errors
        if (oauthError instanceof Error && 
            (oauthError.message.includes('authentication') || 
             oauthError.message.includes('permission') ||
             oauthError.message.includes('token'))) {
          throw oauthError;
        }
        
        console.log('⚠️ OAuth failed, trying SMTP fallback...');
      }
    } else {
      console.log('⚠️ No active Outlook connection found, checking SMTP fallback');
    }
    
    // Fallback to SMTP if OAuth fails or no connection
    const smtpTransporter = createSMTPTransporter();
    if (smtpTransporter) {
      console.log('📧 Sending email via SMTP to:', options.to);
      
      const mailOptions = {
        from: `"Timesheet System" <${SMTP_CONFIG.auth.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };
      
      await smtpTransporter.sendMail(mailOptions);
      
      const endTime = Date.now();
      console.log('✅ Email sent successfully via SMTP to:', options.to);
      console.log('⏱️ Time taken:', endTime - startTime, 'ms');
      
      return true;
    }
    
    // If neither OAuth nor SMTP is available
    console.error('❌ No email service configured. Please set up either OAuth or SMTP.');
    console.log('📋 Email content (not sent - no email service configured):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    const endTime = Date.now();
    console.log('⏱️ Time taken:', endTime - startTime, 'ms');
    
    return false;
    
  } catch (error: any) {
    const endTime = Date.now();
    console.log('❌ === EMAIL SENDING FAILED ===');
    console.log('⏱️ Time taken:', endTime - startTime, 'ms');
    console.log('❌ Error:', error.message);
    console.log('❌ Stack:', error.stack);
    
    // Log email content for debugging
    console.log('📋 Email content (not sent due to error):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<boolean> => {
  const subject = 'Password Reset Request - Timesheet System';
  
  const html = `
Hi,

We received a request to reset your password for your Timesheet System account.

You can reset your password using the link below:
${resetLink}

If you did not request this, please ignore this email.

Best regards,
Timesheet System Team
  `;

  const text = `
Hi,

We received a request to reset your password for your Timesheet System account.

You can reset your password using the link below:
${resetLink}

If you did not request this, please ignore this email.

Best regards,
Timesheet System Team
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};
