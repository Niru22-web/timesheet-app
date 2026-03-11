import nodemailer from 'nodemailer';
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
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/email/callback/outlook',
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
  getMicrosoftAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: MICROSOFT_OAUTH_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
      scope: MICROSOFT_OAUTH_CONFIG.scope,
      response_mode: 'query',
      prompt: 'consent'
    });

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
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        client_secret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        code,
        redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      // Store tokens in database
      await this.storeEmailConnection({
        employeeId,
        provider: 'outlook',
        email: userResponse.data.mail || userResponse.data.userPrincipalName,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: new Date(Date.now() + (expires_in * 1000))
      });

      return {
        success: true,
        email: userResponse.data.mail || userResponse.data.userPrincipalName,
        provider: 'outlook'
      };
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      throw new Error('Failed to connect Outlook account');
    }
  }

  // Store email connection in database
  private async storeEmailConnection(data: {
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
      create: data
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
      const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        client_secret: MICROSOFT_OAUTH_CONFIG.clientSecret,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token'
      });

      const { access_token, expires_in } = response.data;

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
      console.error('Failed to refresh Microsoft token:', error);
      throw new Error('Failed to refresh Outlook access token');
    }
  }

  // Send email using connected account
  async sendEmail(employeeId: string, options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    const connection = await this.getEmailConnection(employeeId);
    
    if (!connection) {
      throw new Error('No email account connected');
    }

    // Check if token needs refresh
    if (new Date() > connection.tokenExpiry) {
      await this.refreshAccessToken(connection);
      // Refresh connection data
      const refreshedConnection = await this.getEmailConnection(employeeId, connection.provider);
      connection.accessToken = refreshedConnection?.accessToken;
    }

    if (connection.provider === 'gmail') {
      return this.sendGmailEmail(connection, options);
    } else if (connection.provider === 'outlook') {
      return this.sendOutlookEmail(connection, options);
    }

    throw new Error('Unsupported email provider');
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
          ? options.to.map(email => ({ emailAddress: { address: email } }))
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
}

export default new EmailService();
