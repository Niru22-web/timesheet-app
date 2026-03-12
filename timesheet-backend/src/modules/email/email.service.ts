import { prisma } from '../../config/prisma';
import crypto from 'crypto';
import { google } from 'googleapis';
import axios from 'axios';

interface OAuthConnection {
  provider: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  isActive: boolean;
}

interface EmailConfig {
  emailProvider: string;
  enableNotifications: boolean;
  oauthConnection?: OAuthConnection;
}

// OAuth2 Configuration
const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID || '',
  clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/email/callback/google'
};

const MICROSOFT_OAUTH_CONFIG = {
  clientId: process.env.OUTLOOK_CLIENT_ID || '',
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/email/oauth/outlook/callback',
  scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read offline_access'
};

class EmailService {
  // Google OAuth2
  getGoogleAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_OAUTH_CONFIG.clientId,
      GOOGLE_OAUTH_CONFIG.clientSecret,
      GOOGLE_OAUTH_CONFIG.redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Microsoft OAuth2
  getMicrosoftAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: MICROSOFT_OAUTH_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
      scope: MICROSOFT_OAUTH_CONFIG.scope,
      response_mode: 'query',
      prompt: 'consent'
    });

    if (state) {
      params.append('state', state);
    }

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code: string, employeeId: string) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_OAUTH_CONFIG.clientId,
        GOOGLE_OAUTH_CONFIG.clientSecret,
        GOOGLE_OAUTH_CONFIG.redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code);
      
      // Get user info
      const oauth2 = google.oauth2('v2');
      const userInfo = await oauth2.userinfo.get({ auth: oauth2Client });
      
      // Store tokens in database
      await this.storeEmailConnection({
        employeeId,
        provider: 'gmail',
        email: userInfo.data.email!,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        tokenExpiry: new Date(Date.now() + (tokens.expiry_date || 3600000))
      });

      return {
        success: true,
        email: userInfo.data.email,
        provider: 'gmail'
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw new Error('Failed to connect Gmail account');
    }
  }

  // Handle Microsoft OAuth callback
  async handleMicrosoftCallback(code: string, employeeId: string) {
    try {
      console.log('🔐 Microsoft OAuth: Starting token exchange for employee:', employeeId);
      
      // Exchange code for tokens using form-encoded data
      const tokenData = new URLSearchParams({
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        client_secret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        code,
        redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/.default offline_access'
      });

      console.log('📤 Microsoft OAuth: Sending token request...');
      const tokenResponse = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        tokenData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('📥 Microsoft OAuth: Token response received:', {
        hasAccessToken: !!tokenResponse.data.access_token,
        hasRefreshToken: !!tokenResponse.data.refresh_token,
        expiresIn: tokenResponse.data.expires_in
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get user info
      console.log('👤 Microsoft OAuth: Fetching user profile...');
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const email = userResponse.data.mail || userResponse.data.userPrincipalName;
      console.log('✅ Microsoft OAuth: Got user email:', email);

      // Store tokens in database
      console.log('💾 Microsoft OAuth: Storing tokens in database...');
      await this.storeEmailConnection({
        employeeId,
        provider: 'outlook',
        email: email,
        accessToken: access_token,
        refreshToken: refresh_token || '',
        tokenExpiry: new Date(Date.now() + (expires_in * 1000))
      });

      console.log('✅ Microsoft OAuth: Connection completed successfully for:', email);

      return {
        success: true,
        email: email,
        provider: 'outlook'
      };
    } catch (error) {
      console.error('❌ Microsoft OAuth callback error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw new Error('Failed to connect Outlook account');
    }
  }

  // Store email connection in database
  async storeEmailConnection(data: {
    employeeId: string;
    provider: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: Date;
  }) {
    await prisma.emailConnection.upsert({
      where: {
        employeeId_provider: {
          employeeId: data.employeeId,
          provider: data.provider
        }
      },
      update: {
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: data.tokenExpiry,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        employeeId: data.employeeId,
        provider: data.provider,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: data.tokenExpiry,
        isActive: true
      }
    });
  }

  // Get email connection for employee
  async getEmailConnection(employeeId: string, provider?: string) {
    const where = provider 
      ? { employeeId, provider, isActive: true }
      : { employeeId, isActive: true };

    const connection = await prisma.emailConnection.findFirst({
      where,
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

    return connection;
  }

  // Refresh access token if needed
  async refreshAccessToken(connection: any) {
    if (connection.provider === 'gmail') {
      return this.refreshGoogleToken(connection);
    } else if (connection.provider === 'outlook') {
      return this.refreshMicrosoftToken(connection);
    }
  }

  private async refreshGoogleToken(connection: any) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_OAUTH_CONFIG.clientId,
        GOOGLE_OAUTH_CONFIG.clientSecret
      );

      oauth2Client.setCredentials({
        refresh_token: connection.refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update tokens in database
      await prisma.emailConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: credentials.access_token!,
          tokenExpiry: new Date(Date.now() + (credentials.expiry_date || 3600000)),
          updatedAt: new Date()
        }
      });

      return credentials.access_token!;
    } catch (error) {
      console.error('Failed to refresh Google token:', error);
      throw new Error('Failed to refresh Gmail access token');
    }
  }

  private async refreshMicrosoftToken(connection: any) {
    try {
      console.log('🔄 Microsoft OAuth: Refreshing access token...');
      
      const tokenData = new URLSearchParams({
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        client_secret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default offline_access'
      });

      const response = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        tokenData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, expires_in } = response.data;
      console.log('✅ Microsoft OAuth: Token refreshed successfully');

      // Update tokens in database
      await prisma.emailConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: access_token,
          tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
          updatedAt: new Date()
        }
      });

      return access_token;
    } catch (error) {
      console.error('❌ Failed to refresh Microsoft token:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Refresh token error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      throw new Error('Failed to refresh Outlook access token');
    }
  }

  // Send email using connected Outlook account
  async sendEmail(employeeId: string, options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    // Get Outlook connection from database
    const connection = await this.getOutlookConnection(employeeId);
    
    if (!connection) {
      throw new Error('Outlook not connected. Please connect your Outlook account first.');
    }

    // Check if token needs refresh
    if (new Date() > connection.tokenExpiry) {
      console.log('🔄 Access token expired, refreshing...');
      await this.refreshAccessToken(connection);
      // Get refreshed connection
      const refreshedConnection = await this.getOutlookConnection(employeeId);
      if (!refreshedConnection) {
        throw new Error('Failed to refresh Outlook connection');
      }
      connection.accessToken = refreshedConnection.accessToken;
    }

    // Send email via Microsoft Graph API
    return this.sendOutlookEmail(connection, options);
  }

  // Get only Outlook connection from database
  private async getOutlookConnection(employeeId: string) {
    try {
      const connector = await prisma.emailConnection.findFirst({
        where: {
          employeeId: employeeId,
          provider: 'outlook',
          accessToken: { not: null }
        }
      });

      if (!connector) {
        console.log('❌ No Outlook connection found for employee:', employeeId);
        return null;
      }

      console.log('✅ Found Outlook connection for:', connector.email);
      return {
        employeeId: connector.employeeId,
        provider: connector.provider,
        email: connector.email,
        accessToken: connector.accessToken,
        refreshToken: connector.refreshToken,
        tokenExpiry: connector.tokenExpiry
      };
    } catch (error) {
      console.error('❌ Error fetching Outlook connection:', error);
      return null;
    }
  }

  private async sendGmailEmail(connection: any, options: any) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: connection.accessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const emailContent = [
      `To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html || options.text
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return {
      success: true,
      messageId: result.data.id,
      provider: 'gmail'
    };
  }

  private async sendOutlookEmail(connection: any, options: any) {
    const emailData = {
      message: {
        subject: options.subject,
        body: {
          contentType: options.html ? 'html' : 'text',
          content: options.html || options.text
        },
        toRecipients: Array.isArray(options.to) 
          ? options.to.map((email: string) => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: options.to } }]
      }
    };

    const response = await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      emailData,
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.headers['X-Message-Id'] || 'sent',
      provider: 'outlook'
    };
  }

  // Disconnect email account
  async disconnectEmail(employeeId: string, provider: string) {
    await prisma.emailConnection.updateMany({
      where: {
        employeeId,
        provider
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return { success: true };
  }

  // Get all email connections for admin
  async getAllEmailConnections() {
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

    return connections;
  }

  // Check email service configuration
  async checkEmailConfiguration() {
    try {
      // Check if any email provider is configured
      const outlookConnection = await this.getEmailConnection('admin', 'outlook'); // Check admin's connection
      const gmailConnection = await this.getEmailConnection('admin', 'gmail');
      
      return {
        configured: !!(outlookConnection || gmailConnection),
        outlookConnected: !!outlookConnection,
        gmailConnected: !!gmailConnection
      };
    } catch (error) {
      console.error('Error checking email configuration:', error);
      return { configured: false };
    }
  }

  // Send registration email using template
  async sendRegistrationEmail(data: {
    to: string;
    employeeName: string;
    employeeId: string;
    department: string;
    designation: string;
    registrationLink: string;
    companyName: string;
  }) {
    try {
      console.log('📧 Sending registration email using template...');
      
      // Get registration template from database (only active ones)
      const template = await prisma.emailTemplate.findFirst({
        where: {
          category: 'Registration',
          status: 'active'
        }
      });

      if (!template) {
        console.warn('⚠️ No registration template found, using fallback');
        return this.sendFallbackRegistrationEmail(data);
      }

      // Replace template variables
      const subject = this.replaceTemplateVariables(template.subject, {
        employee_name: data.employeeName,
        company_name: data.companyName,
        employee_email: data.to,
        employee_id: data.employeeId,
        department: data.department,
        designation: data.designation,
        login_url: data.registrationLink
      });

      const body = this.replaceTemplateVariables(template.body, {
        employee_name: data.employeeName,
        company_name: data.companyName,
        employee_email: data.to,
        employee_id: data.employeeId,
        department: data.department,
        designation: data.designation,
        login_url: data.registrationLink
      });

      // Send email using configured provider
      await this.sendEmail({
        to: data.to,
        subject: subject,
        html: body
      });

      console.log('✅ Registration email sent successfully');
    } catch (error) {
      console.error('❌ Failed to send registration email:', error);
      throw error;
    }
  }

  // Fallback registration email if template not found
  private async sendFallbackRegistrationEmail(data: {
    to: string;
    employeeName: string;
    employeeId: string;
    department: string;
    designation: string;
    registrationLink: string;
    companyName: string;
  }) {
    const subject = `Welcome to ${data.companyName}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to ${data.companyName}</h2>
        <p>Dear ${data.employeeName},</p>
        <p>Your account has been created successfully. Please complete your registration by clicking the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.registrationLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Complete Registration
          </a>
        </div>
        <p><strong>Important:</strong> This registration link will expire in 24 hours.</p>
        <p>Your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${data.to}</li>
          <li><strong>Employee ID:</strong> ${data.employeeId}</li>
          <li><strong>Department:</strong> ${data.department}</li>
          <li><strong>Designation:</strong> ${data.designation}</li>
        </ul>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>${data.companyName} Team</p>
      </div>
    `;

    await this.sendEmail({
      to: data.to,
      subject: subject,
      html: body
    });
  }

  // Replace template variables
  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  // Send email using configured provider
  private async sendEmail(data: { to: string; subject: string; html: string }) {
    try {
      // Try to use Outlook first
      const outlookConnection = await this.getEmailConnection('admin', 'outlook');
      if (outlookConnection) {
        return this.sendOutlookEmail(data, outlookConnection);
      }

      // Try Gmail
      const gmailConnection = await this.getEmailConnection('admin', 'gmail');
      if (gmailConnection) {
        return this.sendGmailEmail(data, gmailConnection);
      }

      throw new Error('No email provider configured');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default new EmailService();
