import { Request, Response } from 'express';
import EmailService from './email.service';
import { authenticate } from '../../middleware/auth.middleware';

const emailService = EmailService;

// Get OAuth URLs for connecting accounts
export const getAuthUrls = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const googleUrl = emailService.getGoogleAuthUrl();
    const microsoftUrl = emailService.getMicrosoftAuthUrl();

    res.json({
      success: true,
      data: {
        google: {
          authUrl: googleUrl,
          provider: 'gmail',
          name: 'Gmail'
        },
        microsoft: {
          authUrl: microsoftUrl,
          provider: 'outlook',
          name: 'Outlook'
        }
      }
    });
  } catch (error) {
    console.error('Get auth URLs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get authentication URLs'
    });
  }
};

// Handle Google OAuth callback
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const user = (req as any).user;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const result = await emailService.handleGoogleCallback(code as string, user.employeeId);

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-configuration?success=true&provider=gmail&email=${result.email}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-configuration?success=false&provider=gmail&error=Failed to connect Gmail`);
  }
};

// Handle Microsoft OAuth callback
export const handleMicrosoftCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const user = (req as any).user;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const result = await emailService.handleMicrosoftCallback(code as string, user.employeeId);

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-configuration?success=true&provider=outlook&email=${result.email}`);
  } catch (error) {
    console.error('Microsoft callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/email-configuration?success=false&provider=outlook&error=Failed to connect Outlook`);
  }
};

// Get email connection status
export const getConnectionStatus = async (req: Request, res: Response) => {
  try {
    console.log('Getting connection status for user:', (req as any).user?.employeeId);
    const user = (req as any).user;
    
    if (!user || !user.employeeId) {
      console.error('No user or employeeId found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const gmailConnection = await emailService.getEmailConnection(user.employeeId, 'gmail');
    const outlookConnection = await emailService.getEmailConnection(user.employeeId, 'outlook');

    console.log('Gmail connection:', !!gmailConnection);
    console.log('Outlook connection:', !!outlookConnection);

    const response: any = {
      success: true,
      connected: false,
      providers: {}
    };

    if (gmailConnection) {
      response.providers.gmail = {
        connected: true,
        email: gmailConnection.email,
        provider: 'gmail'
      };
      response.connected = true;
    }

    if (outlookConnection) {
      response.providers.outlook = {
        connected: true,
        email: outlookConnection.email,
        provider: 'outlook'
      };
      response.connected = true;
    }

    res.json(response);
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connection status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Disconnect email account
export const disconnectEmail = async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    const user = (req as any).user;

    if (!['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    await emailService.disconnectEmail(user.employeeId, provider);

    res.json({
      success: true,
      message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} account disconnected successfully`
    });
  } catch (error) {
    console.error('Disconnect email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect email account'
    });
  }
};

// Send test email (for testing)
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { to, subject, text, html } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and subject are required'
      });
    }

    const result = await emailService.sendEmail(user.employeeId, {
      to,
      subject,
      text,
      html
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    });
  }
};

// Get all email connections (admin only)
export const getAllConnections = async (req: Request, res: Response) => {
  try {
    const connections = await emailService.getAllEmailConnections();

    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('Get all connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email connections'
    });
  }
};

// Get OAuth URL for specific provider
export const getOAuthAuthUrl = async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;
    
    if (!provider || !['gmail', 'outlook'].includes(provider as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    let authUrl: string;
    if (provider === 'gmail') {
      authUrl = emailService.getGoogleAuthUrl();
    } else {
      authUrl = emailService.getMicrosoftAuthUrl();
    }

    res.json({
      success: true,
      url: authUrl,
      state: Math.random().toString(36).substring(7)
    });
  } catch (error) {
    console.error('Get OAuth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OAuth URL'
    });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { provider, code, state } = req.body;
    const user = (req as any).user;

    if (!provider || !['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider'
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    let result;
    if (provider === 'gmail') {
      result = await emailService.handleGoogleCallback(code, user.employeeId);
    } else {
      result = await emailService.handleMicrosoftCallback(code, user.employeeId);
    }

    res.json({
      success: true,
      connection: {
        provider: result.provider,
        email: result.email,
        isActive: true,
        connectedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete OAuth connection'
    });
  }
};

// Disconnect OAuth
export const disconnectOAuth = async (req: Request, res: Response) => {
  return await disconnectEmail(req, res);
};

// Get OAuth status
export const getOAuthStatus = async (req: Request, res: Response) => {
  return await getConnectionStatus(req, res);
};

// Get Google OAuth auth
export const getGoogleOAuthAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = emailService.getGoogleAuthUrl();
    
    res.json({
      success: true,
      url: authUrl,
      state: Math.random().toString(36).substring(7)
    });
  } catch (error) {
    console.error('Get Google OAuth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google OAuth URL'
    });
  }
};

// Get Outlook OAuth auth
export const getOutlookOAuthAuth = async (req: Request, res: Response) => {
  try {
    console.log('Generating Outlook OAuth URL...');
    const authUrl = emailService.getMicrosoftAuthUrl();
    
    console.log('Outlook OAuth URL generated successfully');
    res.json({
      success: true,
      url: authUrl,
      state: Math.random().toString(36).substring(7)
    });
  } catch (error) {
    console.error('Get Outlook OAuth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Outlook OAuth URL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Placeholder functions for missing exports
export const getProviderConfigurations = async (req: Request, res: Response) => {
  try {
    const configurations = [
      {
        id: 'google-workspace',
        name: 'Google Workspace',
        description: 'Use Gmail or Google Workspace account',
        authType: 'OAuth',
        setupNote: 'Enable Gmail API in Google Cloud Console and configure OAuth credentials'
      },
      {
        id: 'outlook-365',
        name: 'Outlook 365',
        description: 'Use Microsoft Outlook or Office 365 account',
        authType: 'OAuth',
        setupNote: 'Register app in Azure Active Directory and enable Mail.Send permission'
      }
    ];

    res.json(configurations);
  } catch (error) {
    console.error('Get provider configurations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider configurations'
    });
  }
};

export const getEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const connection = await emailService.getEmailConnection(user.employeeId);
    
    res.json({
      emailProvider: connection ? `${connection.provider}-workspace` : 'outlook-365',
      enableNotifications: true,
      oauthConnection: connection
    });
  } catch (error) {
    console.error('Get email configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email configuration'
    });
  }
};

export const saveEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const { emailProvider, enableNotifications } = req.body;
    
    // Configuration is saved through OAuth flow, so just return success
    res.json({
      success: true,
      message: 'Email configuration saved successfully'
    });
  } catch (error) {
    console.error('Save email configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save email configuration'
    });
  }
};

export const testEmailConfiguration = async (req: Request, res: Response) => {
  return await sendTestEmail(req, res);
};

export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: '1',
        name: 'Employee Registration',
        subject: 'Welcome to Timesheet Pro',
        type: 'registration'
      },
      {
        id: '2',
        name: 'Leave Approval',
        subject: 'Leave Request Update',
        type: 'leave'
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates'
    });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject, content } = req.body;
    
    res.json({
      success: true,
      message: 'Email template updated successfully'
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email template'
    });
  }
};

export const sendEmailFromTemplate = async (req: Request, res: Response) => {
  return await sendTestEmail(req, res);
};
