import nodemailer from 'nodemailer';
import { prisma } from '../../config/prisma';
import crypto from 'crypto';

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
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  encryptionType: 'TLS' | 'SSL';
  oauthConnection?: OAuthConnection;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class EmailService {
  private algorithm = 'aes-256-cbc';
  private secretKey = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-in-production';

  // OAuth connection methods
  async getOAuthAuthUrl(provider: string): Promise<{ url: string; state: string }> {
    // Validate required environment variables
    this.validateOAuthEnvironment(provider);
    
    const state = crypto.randomBytes(32).toString('hex');
    
    // Get the current domain for redirect URI
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/email/oauth/callback`;
    
    switch (provider) {
      case 'gmail':
        const gmailClientId = process.env.GMAIL_CLIENT_ID;
        if (!gmailClientId) {
          throw new Error('Gmail Client ID is not configured in environment variables');
        }
        
        return {
          url: `https://accounts.google.com/oauth/authorize?` +
            `client_id=${gmailClientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=https://www.googleapis.com/auth/gmail.send&` +
            `response_type=code&` +
            `state=${state}&` +
            `access_type=offline&` +
            `prompt=consent`,
          state
        };
      
      case 'outlook':
        const outlookClientId = process.env.OUTLOOK_CLIENT_ID;
        if (!outlookClientId) {
          throw new Error('Microsoft Outlook Client ID is not configured in environment variables');
        }
        
        return {
          url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${outlookClientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=https://graph.microsoft.com/Mail.Send offline_access&` +
            `response_type=code&` +
            `state=${state}&` +
            `response_mode=query`,
          state
        };
      
      case 'zoho':
        const zohoClientId = process.env.ZOHO_CLIENT_ID;
        if (!zohoClientId) {
          throw new Error('Zoho Client ID is not configured in environment variables');
        }
        
        return {
          url: `https://accounts.zoho.com/oauth/v2/auth?` +
            `client_id=${zohoClientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=ZohoMail.accounts.CREATE,ZohoMail.accounts.READ&` +
            `response_type=code&` +
            `state=${state}&` +
            `access_type=offline`,
          state
        };
      
      default:
        throw new Error('Unsupported OAuth provider');
    }
  }

  private validateOAuthEnvironment(provider: string): void {
    const requiredVars = {
      gmail: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET'],
      outlook: ['OUTLOOK_CLIENT_ID', 'OUTLOOK_CLIENT_SECRET'],
      zoho: ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET']
    };

    const providerVars = requiredVars[provider as keyof typeof requiredVars];
    if (!providerVars) {
      return;
    }

    const missingVars = providerVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables for ${provider}: ${missingVars.join(', ')}`);
    }
  }

  async handleOAuthCallback(provider: string, code: string, state: string): Promise<OAuthConnection> {
    let tokenResponse: any;
    
    switch (provider) {
      case 'gmail':
        tokenResponse = await this.exchangeGmailCode(code);
        break;
      case 'outlook':
        tokenResponse = await this.exchangeOutlookCode(code);
        break;
      case 'zoho':
        tokenResponse = await this.exchangeZohoCode(code);
        break;
      default:
        throw new Error('Unsupported OAuth provider');
    }

    // Get user email info
    const email = await this.getUserEmail(provider, tokenResponse.access_token);

    return {
      provider,
      email,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: tokenResponse.expires_at ? new Date(Date.now() + tokenResponse.expires_at * 1000).toISOString() : undefined,
      isActive: true
    };
  }

  private async exchangeGmailCode(code: string): Promise<any> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/email/oauth/callback`;
    const gmailClientId = process.env.GMAIL_CLIENT_ID;
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: gmailClientId || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Gmail authorization code');
    }

    return response.json();
  }

  private async exchangeOutlookCode(code: string): Promise<any> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/email/oauth/callback`;
    const outlookClientId = process.env.OUTLOOK_CLIENT_ID;
    
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: outlookClientId || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Outlook authorization code');
    }

    return response.json();
  }

  private async exchangeZohoCode(code: string): Promise<any> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUri = `${baseUrl}/email/oauth/callback`;
    const zohoClientId = process.env.ZOHO_CLIENT_ID;
    
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: zohoClientId || '',
        client_secret: process.env.ZOHO_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Zoho authorization code');
    }

    return response.json();
  }

  private async getUserEmail(provider: string, accessToken: string): Promise<string> {
    switch (provider) {
      case 'gmail':
        const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (gmailResponse.ok) {
          const gmailData = await gmailResponse.json();
          return gmailData.emailAddress;
        }
        break;

      case 'outlook':
        const outlookResponse = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (outlookResponse.ok) {
          const outlookData = await outlookResponse.json();
          return outlookData.mail || outlookData.userPrincipalName;
        }
        break;

      case 'zoho':
        const zohoResponse = await fetch('https://mail.zoho.com/api/accounts', {
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
          },
        });
        if (zohoResponse.ok) {
          const zohoData = await zohoResponse.json();
          return zohoData.data?.[0]?.emailAddress || '';
        }
        break;
    }

    throw new Error('Failed to retrieve user email');
  }

  async saveOAuthConnection(oauthConnection: OAuthConnection): Promise<OAuthConnection> {
    try {
      // In production, save to database
      // For now, store in memory (in production, use encrypted storage)
      const config = await this.getEmailConfiguration();
      config.oauthConnection = oauthConnection;
      // Ensure all required fields are present
      const fullConfig: EmailConfig = {
        emailProvider: config.emailProvider || 'gmail',
        senderName: config.senderName || '',
        senderEmail: config.senderEmail || '',
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort || '587',
        smtpUsername: config.smtpUsername || '',
        smtpPassword: config.smtpPassword || '',
        encryptionType: config.encryptionType || 'TLS',
        oauthConnection: oauthConnection
      };
      await this.saveEmailConfiguration(fullConfig);
      
      return oauthConnection;
    } catch (error: any) {
      console.error('Error saving OAuth connection:', error);
      throw error;
    }
  }

  async disconnectOAuth(provider: string): Promise<void> {
    try {
      const config = await this.getEmailConfiguration();
      if (config.oauthConnection && config.oauthConnection.provider === provider) {
        const fullConfig: EmailConfig = {
          emailProvider: config.emailProvider || 'gmail',
          senderName: config.senderName || '',
          senderEmail: config.senderEmail || '',
          smtpHost: config.smtpHost || '',
          smtpPort: config.smtpPort || '587',
          smtpUsername: config.smtpUsername || '',
          smtpPassword: config.smtpPassword || '',
          encryptionType: config.encryptionType || 'TLS',
          oauthConnection: undefined
        };
        await this.saveEmailConfiguration(fullConfig);
      }
    } catch (error: any) {
      console.error('Error disconnecting OAuth:', error);
      throw error;
    }
  }

  async getOAuthConnection(provider: string): Promise<OAuthConnection | null> {
    try {
      const config = await this.getEmailConfiguration();
      if (config.oauthConnection && config.oauthConnection.provider === provider && config.oauthConnection.isActive) {
        // Check if token is expired and refresh if needed
        if (config.oauthConnection.expiresAt && new Date(config.oauthConnection.expiresAt) < new Date()) {
          if (config.oauthConnection.refreshToken) {
            const refreshedConnection = await this.refreshOAuthToken(config.oauthConnection);
            await this.saveOAuthConnection(refreshedConnection);
            return refreshedConnection;
          } else {
            // Token expired and no refresh token
            const fullConfig: EmailConfig = {
              emailProvider: config.emailProvider || 'gmail',
              senderName: config.senderName || '',
              senderEmail: config.senderEmail || '',
              smtpHost: config.smtpHost || '',
              smtpPort: config.smtpPort || '587',
              smtpUsername: config.smtpUsername || '',
              smtpPassword: config.smtpPassword || '',
              encryptionType: config.encryptionType || 'TLS',
              oauthConnection: { ...config.oauthConnection, isActive: false }
            };
            await this.saveEmailConfiguration(fullConfig);
            return null;
          }
        }
        return config.oauthConnection;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting OAuth connection:', error);
      return null;
    }
  }

  private async refreshOAuthToken(connection: OAuthConnection): Promise<OAuthConnection> {
    try {
      let tokenResponse: any;
      
      switch (connection.provider) {
        case 'gmail':
          tokenResponse = await this.refreshGmailToken(connection.refreshToken!);
          break;
        case 'outlook':
          tokenResponse = await this.refreshOutlookToken(connection.refreshToken!);
          break;
        case 'zoho':
          tokenResponse = await this.refreshZohoToken(connection.refreshToken!);
          break;
        default:
          throw new Error('Unsupported OAuth provider');
      }

      return {
        ...connection,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || connection.refreshToken,
        expiresAt: tokenResponse.expires_at ? new Date(Date.now() + tokenResponse.expires_at * 1000).toISOString() : undefined,
      };
    } catch (error: any) {
      console.error('Error refreshing OAuth token:', error);
      connection.isActive = false;
      return connection;
    }
  }

  private async refreshGmailToken(refreshToken: string): Promise<any> {
    const gmailClientId = process.env.GMAIL_CLIENT_ID;
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: gmailClientId || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Gmail token');
    }

    return response.json();
  }

  private async refreshOutlookToken(refreshToken: string): Promise<any> {
    const outlookClientId = process.env.OUTLOOK_CLIENT_ID;
    
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: outlookClientId || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Outlook token');
    }

    return response.json();
  }

  private async refreshZohoToken(refreshToken: string): Promise<any> {
    const zohoClientId = process.env.ZOHO_CLIENT_ID;
    
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: zohoClientId || '',
        client_secret: process.env.ZOHO_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Zoho token');
    }

    return response.json();
  }
  public getProviderConfig(provider: string) {
    const configs = {
      gmail: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        encryptionType: 'TLS' as const,
        displayName: 'Gmail',
        authNote: 'Use App Password if 2FA is enabled'
      },
      outlook: {
        smtpHost: 'smtp.office365.com',
        smtpPort: '587',
        encryptionType: 'TLS' as const,
        displayName: 'Outlook / Microsoft 365',
        authNote: 'Ensure SMTP Auth is enabled in Microsoft 365'
      },
      zoho: {
        smtpHost: 'smtp.zoho.com',
        smtpPort: '587',
        encryptionType: 'TLS' as const,
        displayName: 'Zoho Mail',
        authNote: 'Enable SMTP access in Zoho Mail settings'
      },
      custom: {
        smtpHost: '',
        smtpPort: '587',
        encryptionType: 'TLS' as const,
        displayName: 'Custom SMTP',
        authNote: 'Enter your SMTP provider details'
      }
    };
    return configs[provider as keyof typeof configs] || configs.custom;
  }

  // Encryption methods
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Email Configuration methods
  async getEmailConfiguration(): Promise<Partial<EmailConfig>> {
    try {
      // For now, store in environment variables or a simple file
      // In production, you might want to store this in a secure database table
      const config: Partial<EmailConfig> = {
        emailProvider: process.env.EMAIL_PROVIDER || '',
        senderName: process.env.EMAIL_SENDER_NAME || '',
        senderEmail: process.env.EMAIL_SENDER_EMAIL || '',
        smtpHost: process.env.EMAIL_SMTP_HOST || '',
        smtpPort: process.env.EMAIL_SMTP_PORT || '',
        smtpUsername: process.env.EMAIL_SMTP_USERNAME || '',
        // Note: We don't return the password for security reasons
        encryptionType: (process.env.EMAIL_ENCRYPTION_TYPE as 'TLS' | 'SSL') || 'TLS'
      };

      // Check if configuration exists
      if (config.smtpHost && config.smtpUsername) {
        return config;
      }

      return {};
    } catch (error) {
      console.error('Error fetching email configuration:', error);
      return {};
    }
  }

  async saveEmailConfiguration(config: EmailConfig): Promise<EmailConfig> {
    try {
      // Encrypt sensitive data
      const encryptedPassword = this.encrypt(config.smtpPassword);

      // In a real implementation, you would save this to a database
      // For now, we'll simulate saving by updating environment variables
      // Note: This is just for demonstration - in production, use a secure database
      
      // Store in memory or temporary storage
      // In production, you would update a database table like:
      // await prisma.emailConfiguration.upsert({
      //   where: { id: 'default' },
      //   update: { 
      //     provider: config.emailProvider,
      //     senderName: config.senderName,
      //     senderEmail: config.senderEmail,
      //     smtpHost: config.smtpHost,
      //     smtpPort: config.smtpPort,
      //     smtpUsername: config.smtpUsername,
      //     encryptedPassword,
      //     encryptionType: config.encryptionType
      //   },
      //   create: { /* ... */ }
      // });

      // For demo purposes, return the config without password
      const { smtpPassword, ...safeConfig } = config;
      return safeConfig as EmailConfig;
    } catch (error) {
      console.error('Error saving email configuration:', error);
      throw error;
    }
  }

  async testEmailConfiguration(config: EmailConfig): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Validate required fields
      const validationErrors = this.validateEmailConfig(config);
      if (validationErrors.length > 0) {
        return { 
          success: false, 
          message: 'Configuration validation failed', 
          details: { errors: validationErrors }
        };
      }

      // Get provider-specific configuration
      const providerConfig = this.getProviderConfig(config.emailProvider);
      
      // Create transporter with enhanced options
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort),
        secure: config.encryptionType === 'SSL',
        auth: {
          user: config.smtpUsername,
          pass: config.smtpPassword
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates for testing
          minVersion: 'TLSv1'
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 10000,  // 10 seconds
        socketTimeout: 30000     // 30 seconds
      });

      // Test connection with comprehensive error handling
      try {
        await transporter.verify();
      } catch (verifyError: any) {
        // Handle verification errors specifically
        return this.handleSMTPError(verifyError, config.emailProvider);
      }

      // Send test email with error handling
      try {
        const testEmail = {
          from: `"${config.senderName}" <${config.senderEmail}>`,
          to: config.smtpUsername, // Send to the configured email for testing
          subject: 'Test Email - Timesheet System Connection Successful',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; text-align: center;">✅ Email Configuration Successful!</h2>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <p style="color: #333; font-size: 16px;">Your SMTP configuration is working correctly.</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <h3 style="color: #28a745; margin-top: 0;">Connection Details:</h3>
                  <ul style="color: #666; line-height: 1.6;">
                    <li><strong>Provider:</strong> ${providerConfig.displayName}</li>
                    <li><strong>Host:</strong> ${config.smtpHost}</li>
                    <li><strong>Port:</strong> ${config.smtpPort}</li>
                    <li><strong>Encryption:</strong> ${config.encryptionType}</li>
                    <li><strong>From:</strong> ${config.senderName} &lt;${config.senderEmail}&gt;</li>
                  </ul>
                </div>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border: 1px solid #c3e6cb;">
                  <p style="color: #155724; margin: 0; font-size: 14px;">
                    <strong>✓ Authentication Successful</strong><br>
                    Your email system is now ready to send automated notifications.
                  </p>
                </div>
              </div>
            </div>
          `
        };

        await transporter.sendMail(testEmail);
        
        return { 
          success: true, 
          message: 'Test email sent successfully! Connection verified.',
          details: { 
            provider: providerConfig.displayName,
            host: config.smtpHost,
            port: config.smtpPort,
            encryption: config.encryptionType
          }
        };
      } catch (sendError: any) {
        // Handle email sending errors specifically
        return this.handleSMTPError(sendError, config.emailProvider);
      }
    } catch (error: any) {
      // Catch-all for any unexpected errors
      console.error('Unexpected error in testEmailConfiguration:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred during email testing',
        details: {
          error: error.message || 'Unknown error',
          type: 'unexpected_error'
        }
      };
    }
  }

  private handleSMTPError(error: any, provider: string): { success: boolean; message: string; details?: any } {
    console.error('SMTP Error:', error);
    
    const providerConfig = this.getProviderConfig(provider);
    let errorMessage = 'Failed to connect to SMTP server';
    let guidanceMessage = '';

    // Analyze specific error codes and provide guidance
    if (error.code === 'EAUTH' || error.code === '535') {
      errorMessage = 'SMTP authentication failed';
      
      if (provider === 'gmail') {
        guidanceMessage = 'Gmail requires an App Password when 2-Factor Authentication is enabled. Go to your Google Account settings > Security > App Passwords to generate one.';
      } else if (provider === 'outlook') {
        guidanceMessage = 'For Microsoft 365, ensure SMTP authentication is enabled in the mailbox settings. Contact your Microsoft 365 administrator if needed.';
      } else if (provider === 'zoho') {
        guidanceMessage = 'For Zoho Mail, enable SMTP access in Mail Settings > SMTP or use an Application Password if you have 2FA enabled.';
      }
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout or network error';
      guidanceMessage = 'Check your internet connection and verify the SMTP host and port are correct. Some networks may block SMTP traffic.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Socket connection failed';
      guidanceMessage = 'The SMTP server may be down or the port may be incorrect. Verify the provider settings.';
    } else if (error.code === 'EHOST') {
      errorMessage = 'Host not found';
      guidanceMessage = 'The SMTP host address is incorrect. Please verify the hostname.';
    } else if (error.message && error.message.includes('self-signed certificate')) {
      errorMessage = 'SSL/TLS certificate error';
      guidanceMessage = 'The server is using a self-signed certificate. This is allowed for testing but may indicate security issues.';
    } else if (error.code === '530' || error.message.includes('530')) {
      errorMessage = 'SMTP authentication disabled';
      guidanceMessage = 'SMTP authentication is disabled for this mailbox. Please enable SMTP authentication in your email provider settings.';
    } else if (error.code === '535' || error.message.includes('535')) {
      errorMessage = 'Invalid username or password';
      guidanceMessage = 'The username or password is incorrect. Please verify your SMTP credentials.';
    } else if (error.code === '550' || error.message.includes('550')) {
      errorMessage = 'Mailbox unavailable';
      guidanceMessage = 'The mailbox is not available or the sender address is not authorized.';
    }

    return { 
      success: false, 
      message: errorMessage,
      details: {
        error: error.message,
        code: error.code,
        provider: providerConfig.displayName,
        guidance: guidanceMessage,
        authNote: providerConfig.authNote,
        type: 'smtp_error'
      }
    };
  }

  private validateEmailConfig(config: EmailConfig): string[] {
    const errors: string[] = [];
    
    if (!config.smtpHost) errors.push('SMTP Host is required');
    if (!config.smtpPort) errors.push('SMTP Port is required');
    if (!config.smtpUsername) errors.push('SMTP Username is required');
    if (!config.smtpPassword) errors.push('SMTP Password is required');
    if (!config.senderEmail) errors.push('Sender Email is required');
    if (!config.senderName) errors.push('Sender Name is required');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.senderEmail && !emailRegex.test(config.senderEmail)) {
      errors.push('Invalid Sender Email format');
    }
    if (config.smtpUsername && !emailRegex.test(config.smtpUsername)) {
      errors.push('Invalid SMTP Username format');
    }
    
    // Validate port
    const port = parseInt(config.smtpPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('SMTP Port must be between 1 and 65535');
    }
    
    return errors;
  }

  // Email Templates methods
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      // Default templates - in production, these would come from database
      const defaultTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Employee Registration',
          subject: 'Welcome to {{CompanyName}} - Complete Your Registration',
          body: `<p>Dear {{EmployeeName}},</p>
<p>Welcome to {{CompanyName}}! We're excited to have you join our team.</p>
<p>Please click the link below to complete your registration and set up your account:</p>
<p><a href="{{RegistrationLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Registration</a></p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>{{CompanyName}} Team</p>`,
          category: 'Registration',
          variables: ['EmployeeName', 'CompanyName', 'RegistrationLink'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Leave Approval',
          subject: 'Your Leave Request Has Been Approved',
          body: `<p>Dear {{EmployeeName}},</p>
<p>Your leave request from {{StartDate}} to {{EndDate}} has been approved.</p>
<p><strong>Leave Details:</strong></p>
<ul>
  <li>Type: {{LeaveType}}</li>
  <li>Duration: {{NumberOfDays}} days</li>
  <li>Approver: {{ApproverName}}</li>
</ul>
<p>Please ensure all your work is handed over before your leave.</p>
<p>Best regards,<br>HR Team</p>`,
          category: 'Leave',
          variables: ['EmployeeName', 'StartDate', 'EndDate', 'LeaveType', 'NumberOfDays', 'ApproverName'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Leave Rejection',
          subject: 'Your Leave Request Has Been Rejected',
          body: `<p>Dear {{EmployeeName}},</p>
<p>Your leave request from {{StartDate}} to {{EndDate}} has been rejected.</p>
<p><strong>Reason:</strong> {{RejectionReason}}</p>
<p>If you have any questions or would like to discuss this further, please contact HR.</p>
<p>Best regards,<br>HR Team</p>`,
          category: 'Leave',
          variables: ['EmployeeName', 'StartDate', 'EndDate', 'RejectionReason'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Timesheet Reminder',
          subject: 'Reminder: Submit Your Timesheet for {{WeekPeriod}}',
          body: `<p>Dear {{EmployeeName}},</p>
<p>This is a friendly reminder to submit your timesheet for the period {{WeekPeriod}}.</p>
<p>Please log in to your dashboard and submit your timesheet by the deadline: {{Deadline}}.</p>
<p><a href="{{DashboardLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
<p>If you have already submitted your timesheet, please disregard this email.</p>
<p>Best regards,<br>Management Team</p>`,
          category: 'Timesheet',
          variables: ['EmployeeName', 'WeekPeriod', 'Deadline', 'DashboardLink'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Reimbursement Status',
          subject: 'Your Reimbursement Request Has Been {{Status}}',
          body: `<p>Dear {{EmployeeName}},</p>
<p>Your reimbursement request for {{Amount}} ({{Description}}) has been {{Status}}.</p>
<p><strong>Request Details:</strong></p>
<ul>
  <li>Amount: {{Amount}}</li>
  <li>Description: {{Description}}</li>
  <li>Submitted: {{SubmissionDate}}</li>
  {{#if ApprovedAmount}}
  <li>Approved Amount: {{ApprovedAmount}}</li>
  {{/if}}
</ul>
<p>{{#if StatusMessage}}<strong>Note:</strong> {{StatusMessage}}{{/if}}</p>
<p>Best regards,<br>Finance Team</p>`,
          category: 'Reimbursement',
          variables: ['EmployeeName', 'Amount', 'Description', 'Status', 'SubmissionDate', 'ApprovedAmount', 'StatusMessage'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Password Reset',
          subject: 'Reset Your Password - {{CompanyName}}',
          body: `<p>Dear {{EmployeeName}},</p>
<p>We received a request to reset your password for your {{CompanyName}} account.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ResetLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
<p>This link will expire in 1 hour for security reasons.</p>
<p>If you didn't request this password reset, please ignore this email.</p>
<p>Best regards,<br>{{CompanyName}} IT Team</p>`,
          category: 'Security',
          variables: ['EmployeeName', 'CompanyName', 'ResetLink'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return defaultTemplates;
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  }

  async updateEmailTemplate(id: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      // In production, this would update the database
      // For now, we'll simulate the update
      const templates = await this.getEmailTemplates();
      const templateIndex = templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }

      const updatedTemplate = {
        ...templates[templateIndex],
        ...templateData,
        updatedAt: new Date().toISOString()
      };

      // In production, you would save to database:
      // await prisma.emailTemplate.update({
      //   where: { id },
      //   data: updatedTemplate
      // });

      return updatedTemplate;
    } catch (error: any) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  async sendEmailFromTemplate(templateName: string, to: string, variables: Record<string, any>): Promise<{ success: boolean; message: string }> {
    try {
      // Get email configuration
      const config = await this.getEmailConfiguration();
      if (!config.smtpHost || !config.smtpUsername) {
        return { success: false, message: 'Email not configured' };
      }

      // Get template
      const templates = await this.getEmailTemplates();
      const template = templates.find(t => t.name === templateName && t.isActive);
      
      if (!template) {
        return { success: false, message: 'Template not found or inactive' };
      }

      // Replace variables in template
      let subject = template.subject;
      let body = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort || '587'),
        secure: config.encryptionType === 'SSL',
        auth: {
          user: config.smtpUsername,
          pass: process.env.EMAIL_SMTP_PASSWORD || '' // In production, decrypt stored password
        }
      });

      // Send email
      const mailOptions = {
        from: `"${config.senderName}" <${config.senderEmail}>`,
        to,
        subject,
        html: body
      };

      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully!' };
    } catch (error: any) {
      console.error('Error sending email from template:', error);
      return { success: false, message: error.message || 'Failed to send email' };
    }
  }

  // Helper method to send emails for specific events
  async sendEmployeeRegistrationEmail(employeeEmail: string, employeeName: string, registrationLink: string, companyName: string) {
    return this.sendEmailFromTemplate('Employee Registration', employeeEmail, {
      EmployeeName: employeeName,
      RegistrationLink: registrationLink,
      CompanyName: companyName
    });
  }

  async sendLeaveApprovalEmail(employeeEmail: string, employeeName: string, startDate: string, endDate: string, leaveType: string, numberOfDays: string, approverName: string) {
    return this.sendEmailFromTemplate('Leave Approval', employeeEmail, {
      EmployeeName: employeeName,
      StartDate: startDate,
      EndDate: endDate,
      LeaveType: leaveType,
      NumberOfDays: numberOfDays,
      ApproverName: approverName
    });
  }

  async sendLeaveRejectionEmail(employeeEmail: string, employeeName: string, startDate: string, endDate: string, rejectionReason: string) {
    return this.sendEmailFromTemplate('Leave Rejection', employeeEmail, {
      EmployeeName: employeeName,
      StartDate: startDate,
      EndDate: endDate,
      RejectionReason: rejectionReason
    });
  }

  async sendTimesheetReminderEmail(employeeEmail: string, employeeName: string, weekPeriod: string, deadline: string, dashboardLink: string) {
    return this.sendEmailFromTemplate('Timesheet Reminder', employeeEmail, {
      EmployeeName: employeeName,
      WeekPeriod: weekPeriod,
      Deadline: deadline,
      DashboardLink: dashboardLink
    });
  }

  async sendReimbursementStatusEmail(employeeEmail: string, employeeName: string, amount: string, description: string, status: string, submissionDate: string, approvedAmount?: string, statusMessage?: string) {
    return this.sendEmailFromTemplate('Reimbursement Status', employeeEmail, {
      EmployeeName: employeeName,
      Amount: amount,
      Description: description,
      Status: status,
      SubmissionDate: submissionDate,
      ApprovedAmount: approvedAmount || '',
      StatusMessage: statusMessage || ''
    });
  }

  async sendPasswordResetEmail(employeeEmail: string, employeeName: string, resetLink: string, companyName: string) {
    return this.sendEmailFromTemplate('Password Reset', employeeEmail, {
      EmployeeName: employeeName,
      ResetLink: resetLink,
      CompanyName: companyName
    });
  }
}
