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
  try {
    console.log('📧 Attempting to send email to:', options.to);
    console.log('📋 Email subject:', options.subject);
    
    // First try OAuth method (Outlook/Google)
    const connections = await EmailService.getAllEmailConnections();
    console.log('📋 Available email connections:', connections.length);
    
    const outlookConnection = connections.find(conn => conn.provider === 'outlook' && conn.accessToken);
    
    if (outlookConnection) {
      console.log('✅ Using Outlook OAuth connection from:', outlookConnection.email);
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
          html: options.html
        });
        
        console.log('✅ Email sent successfully via Outlook OAuth to:', options.to);
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
      console.log('✅ Email sent successfully via SMTP to:', options.to);
      return true;
    }
    
    // If neither OAuth nor SMTP is available
    console.error('❌ No email service configured. Please set up either OAuth or SMTP.');
    console.log('📋 Email content (not sent - no email service configured):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    return false;
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.error('Email service error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Log the email content for debugging
    console.log('📋 Email content (not sent due to error):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    
    throw error; // Re-throw to let the caller handle it
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<boolean> => {
  const subject = 'Password Reset Request - Timesheet System';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .reset-button:hover {
          opacity: 0.9;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
      </div>
      
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password for your Timesheet System account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="reset-button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
          ${resetLink}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong>
          <ul>
            <li>This link will expire in <strong>15 minutes</strong></li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>
        
        <p>If you have any issues, please contact your system administrator.</p>
      </div>
      
      <div class="footer">
        <p>This is an automated message from the Timesheet System.</p>
        <p>© 2026 Timesheet System. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset Request

Hello,

We received a request to reset your password for your Timesheet System account.

Click this link to reset your password:
${resetLink}

Important:
- This link will expire in 15 minutes
- If you didn't request this password reset, please ignore this email
- Never share this link with anyone

If you have any issues, please contact your system administrator.

This is an automated message from the Timesheet System.
© 2026 Timesheet System. All rights reserved.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};
