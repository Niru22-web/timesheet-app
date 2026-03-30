import { prisma } from '../../config/prisma';
import * as crypto from 'crypto';
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

// Google OAuth2
const getGoogleAuthConfig = () => ({
  clientId: process.env.GMAIL_CLIENT_ID || '',
  clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/email/callback/google'
});

// Microsoft/Outlook OAuth2
const getMicrosoftAuthConfig = () => {
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID || '';
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.OUTLOOK_CLIENT_SECRET || '';
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/email/oauth/outlook/callback';
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  
  // Validation check
  if (clientId === 'your-outlook-client-id' || !clientId) {
    console.error('❌ CRITICAL: Outlook Client ID is missing or using placeholder');
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    tenantId,
    scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read openid profile email offline_access'
  };
};

class EmailService {
  // Google OAuth2
  getGoogleAuthUrl(): string {
    const config = getGoogleAuthConfig();
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
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
    const config = getMicrosoftAuthConfig();
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_mode: 'query',
      prompt: 'select_account'
    });

    if (state) {
      params.append('state', state);
    }

    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    console.log("🔗 Constructed Outlook OAuth URL:", url);
    return url;
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code: string, employeeId: string) {
    try {
      const config = getGoogleAuthConfig();
      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri
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
      const config = getMicrosoftAuthConfig();
      const tokenData = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
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
    await prisma.emailConnection.updateMany({
      where: {
        employeeId: data.employeeId,
        provider: data.provider
      },
      data: {
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: data.tokenExpiry,
        isActive: true,
        updatedAt: new Date()
      }
    });

    // If no records were updated, create a new one
    const existing = await prisma.emailConnection.findFirst({
      where: {
        employeeId: data.employeeId,
        provider: data.provider
      }
    });

    if (!existing) {
      await prisma.emailConnection.create({
        data: {
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
      const config = getGoogleAuthConfig();
      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret
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
      console.log('🔄 Microsoft OAuth: Refreshing access token for:', connection.email);
      
      if (!connection.refreshToken) {
        console.error('❌ No refresh token available for:', connection.email);
        throw new Error('No refresh token available. Please reconnect the email account.');
      }
      
      const config = getMicrosoftAuthConfig();
      const tokenData = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default'
      });

      console.log('📤 Sending refresh token request to Microsoft...');
      const tokenResponse = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        tokenData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const { access_token, expires_in, error, error_description } = tokenResponse.data;
      
      if (error) {
        console.error('❌ Microsoft token refresh failed:', error, error_description);
        throw new Error(`Token refresh failed: ${error} - ${error_description}`);
      }

      console.log('✅ Microsoft OAuth: Token refreshed successfully');
      console.log('🕐 New token expires in:', expires_in, 'seconds');

      // Update tokens in database
      await prisma.emailConnection.updateMany({
        where: {
          employeeId: connection.employeeId,
          provider: 'outlook'
        },
        data: {
          accessToken: access_token,
          tokenExpiry: new Date(Date.now() + expires_in * 1000),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Token updated in database');
      return access_token;
    } catch (error) {
      console.error('❌ Failed to refresh Microsoft token:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        console.error('❌ Refresh token error details:', {
          status: status,
          data: errorData
        });
        
        if (status === 400 && errorData?.error === 'invalid_grant') {
          console.error('❌ Refresh token expired or invalid');
          throw new Error('Refresh token expired. Please reconnect the email account.');
        }
      }
      throw new Error('Outlook connection expired. Please reconnect email account.');
    }
  }

  private async getOutlookConnection(employeeId: string) {
    try {
      const connector = await prisma.emailConnection.findFirst({
        where: {
          employeeId: employeeId,
          provider: 'outlook',
          accessToken: { not: '' }
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
      `Content-Type: ${options.html ? 'text/html' : 'text/plain'}; charset=utf-8`,
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

    console.log("📧 Sending Outlook email to:", Array.isArray(options.to) ? options.to.join(', ') : options.to);
    console.log("🔐 Using access token (first 20 chars):", connection.accessToken.substring(0, 20) + "...");

    try {
      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        emailData,
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('✅ Outlook email sent successfully. Response status:', response.status);
      return {
        success: true,
        messageId: response.headers['X-Message-Id'] || 'sent',
        provider: 'outlook'
      };
    } catch (error: any) {
      console.error('❌ Outlook email sending failed:');
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        console.error('❌ Graph API Error Details:', {
          status: status,
          statusText: error.response?.statusText,
          data: errorData,
          headers: error.response?.headers
        });
        
        if (status === 401) {
          console.error('❌ Authentication failed - token may be expired');
          throw new Error("Outlook authentication failed. Please reconnect the email account.");
        } else if (status === 403) {
          console.error('❌ Permission denied - check Mail.Send permission');
          throw new Error("Outlook permission denied. Please check app permissions.");
        } else if (status === 400) {
          console.error('❌ Bad request - check email format');
          throw new Error("Invalid email format or request data.");
        } else {
          console.error('❌ Unknown Microsoft Graph error:', status);
          throw new Error(`Microsoft Graph error: ${status} - ${errorData?.error?.message || 'Unknown error'}`);
        }
      }
      
      throw error;
    }
  }

  // Disconnect email account
  async disconnectEmail(employeeId: string, provider: string) {
    console.log(`Disconnect request for user: ${employeeId}, provider: ${provider}`);
    
    // Delete the email connection record completely
    const result = await prisma.emailConnection.deleteMany({
      where: {
        employeeId,
        provider
      }
    });

    console.log(`Deleted ${result.count} email connections for ${provider}`);
    return { success: true, deleted: result.count };
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
      console.log('🔍 Checking email configuration...');
      
      // Check if any email provider is configured (look for any active connection)
      const outlookConnection = await prisma.emailConnection.findFirst({
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
      
      const gmailConnection = await prisma.emailConnection.findFirst({
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
      
      console.log('📊 Email connections found:', {
        outlook: !!outlookConnection,
        gmail: !!gmailConnection,
        outlookEmail: outlookConnection?.employee?.officeEmail,
        gmailEmail: gmailConnection?.employee?.officeEmail
      });
      
      return {
        configured: !!(outlookConnection || gmailConnection),
        outlookConnected: !!outlookConnection,
        gmailConnected: !!gmailConnection,
        outlookConnection,
        gmailConnection
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
    const emailLogId = await this.createEmailLog({
      recipient: data.to,
      subject: `Welcome to ${data.companyName}`,
      category: 'registration',
      provider: 'outlook',
      employeeId: data.employeeId
    });

    try {
      console.log('📧 Sending registration email to:', data.to);
      
      // Get registration template from database (only active ones)
      const template = await prisma.emailTemplate.findFirst({
        where: {
          category: 'Registration',
          status: 'active'
        }
      });

      if (!template) {
        console.warn('⚠️ No registration template found, using fallback');
        await this.sendFallbackRegistrationEmail(data);
        await this.updateEmailLog(emailLogId, 'sent', null);
        return;
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
      await this.sendSystemEmail({
        to: data.to,
        subject: subject,
        content: body,
        isHtml: false
      });

      console.log('✅ Registration email sent successfully to:', data.to);
      await this.updateEmailLog(emailLogId, 'sent', null);
    } catch (error) {
      console.error('❌ Failed to send registration email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.updateEmailLog(emailLogId, 'failed', errorMessage);
      throw error;
    }
  }

  // Create email log entry
  private async createEmailLog(data: {
    recipient: string;
    subject: string;
    category: string;
    provider: string;
    employeeId?: string;
  }): Promise<string> {
    try {
      const emailLog = await prisma.emailLog.create({
        data: {
          recipient: data.recipient,
          subject: data.subject,
          category: data.category,
          provider: data.provider,
          employeeId: data.employeeId,
          status: 'pending'
        }
      });
      return emailLog.id;
    } catch (error) {
      console.error('Failed to create email log:', error);
      // Return a dummy ID if logging fails
      return 'dummy-log-id';
    }
  }

  // Update email log status
  private async updateEmailLog(id: string, status: string, errorMessage: string | null): Promise<void> {
    try {
      await prisma.emailLog.update({
        where: { id },
        data: {
          status,
          errorMessage,
          sentAt: status === 'sent' ? new Date() : undefined
        }
      });
    } catch (error) {
      console.error('Failed to update email log:', error);
      // Don't throw error here to avoid breaking the main flow
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
    const body = `Hi ${data.employeeName},

Welcome to ${data.companyName}. Your account has been created successfully.

You can complete your registration using the link below:
${data.registrationLink}

Account Details:
Email: ${data.to}
Employee ID: ${data.employeeId}
Department: ${data.department}
Designation: ${data.designation}

If you have any questions, feel free to reply to this email.

Best regards,
${data.companyName} Team`;

    await this.sendSystemEmail({
      to: data.to,
      subject: subject,
      content: body,
      isHtml: false
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
  private async sendSystemEmail(data: { to: string; subject: string; content: string; isHtml?: boolean }) {
    try {
      console.log('📧 Attempting to send email to:', data.to);
      
      const payload = {
        to: data.to,
        subject: data.subject,
        html: data.isHtml !== false ? data.content : undefined,
        text: data.isHtml === false ? data.content : data.content.replace(/<[^>]*>?/gm, '')
      };

      // Try to use Outlook first - look for any active Outlook connection
      const outlookConnection = await prisma.emailConnection.findFirst({
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
      
      if (outlookConnection) {
        console.log('🔗 Using Outlook connection from:', outlookConnection.employee.officeEmail);
        
        // Check if token needs refresh
        if (new Date() > outlookConnection.tokenExpiry) {
          console.log('🔄 Access token expired, refreshing...');
          outlookConnection.accessToken = await this.refreshMicrosoftToken(outlookConnection);
        }

        return this.sendOutlookEmail(outlookConnection, payload);
      }

      // Try Gmail - look for any active Gmail connection
      const gmailConnection = await prisma.emailConnection.findFirst({
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
      
      if (gmailConnection) {
        console.log('🔗 Using Gmail connection from:', gmailConnection.employee.officeEmail);
        
        // Check if Gmail token needs refresh
        if (new Date() > gmailConnection.tokenExpiry) {
           console.log('🔄 Access token expired, refreshing...');
           gmailConnection.accessToken = await this.refreshGoogleToken(gmailConnection);
        }

        return this.sendGmailEmail(gmailConnection, payload);
      }

      throw new Error('No email provider configured. Please connect an email account in the Email Configuration page.');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default new EmailService();
