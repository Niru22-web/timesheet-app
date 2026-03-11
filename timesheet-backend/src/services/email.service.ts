import EmailService from '../modules/email/email.service';

// Direct Email Connector interface
interface DirectEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: DirectEmailOptions): Promise<boolean> => {
  try {
    // For now, we'll use a simple implementation
    // In a real scenario, you'd need to pass the employeeId to sendEmail
    console.log('Email sending requested:', options);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
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
