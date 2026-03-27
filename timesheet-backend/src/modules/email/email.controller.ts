import { Request, Response } from 'express';
import EmailService from './email.service';
import { sendEmail } from '../../services/email.service';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/prisma';
import axios from 'axios';

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

    console.log('Microsoft OAuth callback received');
    console.log('Code parameter:', code ? 'Present' : 'Missing');
    console.log('State parameter (userId):', state);

    if (!code) {
      console.error('No authorization code received from Microsoft OAuth');
      return res.status(400).json({ 
        message: 'Authorization code missing' 
      });
    }

    if (!state) {
      console.error('No state parameter received - cannot identify user');
      return res.status(400).json({ 
        message: 'State parameter missing - cannot identify user' 
      });
    }

    const employeeId = state as string;
    console.log('Processing OAuth for employeeId:', employeeId);

    // Exchange code for access token using form-encoded data
    console.log('Exchanging authorization code for access token...');
    
    const tokenData = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID!,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
      code: code as string,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/email/oauth/outlook/callback',
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/.default offline_access'
    });

    console.log('Sending token request to Microsoft...');
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      tokenData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Token response received:', {
      hasAccessToken: !!tokenResponse.data.access_token,
      hasRefreshToken: !!tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const email = userResponse.data.mail || userResponse.data.userPrincipalName;
    console.log('Microsoft OAuth connection successful for email:', email);

    // Store tokens in database for the user
    await emailService.storeEmailConnection({
      employeeId: employeeId,
      provider: 'outlook',
      email: email,
      accessToken: access_token,
      refreshToken: refresh_token || '',
      tokenExpiry: new Date(Date.now() + (expires_in * 1000))
    });

    console.log('Tokens stored successfully for employeeId:', employeeId);

    // Redirect to frontend email configuration page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/email-configuration?outlook=connected`);
  } catch (error) {
    console.error('Microsoft callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/email-configuration?success=false&provider=outlook&error=Failed to connect Outlook`);
  }
};

// Get email connection status
export const getConnectionStatus = async (req: Request, res: Response) => {
  try {
    console.log('Getting connection status for user:', (req as any).user?.employeeId);
    const user = (req as any).user;
    
    if (!user || !user.employeeId) {
      console.error('No user or user.employeeId found in request');
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
      outlookConnected: false,
      gmailConnected: false,
      providers: {}
    };

    if (gmailConnection) {
      response.providers.gmail = {
        connected: true,
        email: gmailConnection.email,
        provider: 'gmail'
      };
      response.connected = true;
      response.gmailConnected = true;
    }

    if (outlookConnection) {
      response.providers.outlook = {
        connected: true,
        email: outlookConnection.email,
        provider: 'outlook'
      };
      response.connected = true;
      response.outlookConnected = true;
    }

    console.log('Final connection status:', {
      connected: response.connected,
      outlookConnected: response.outlookConnected,
      gmailConnected: response.gmailConnected
    });

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

    const result = await sendEmail({
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
    const user = (req as any).user;
    
    if (!user || !user.id) {
      console.error('No authenticated user found for OAuth');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Use employeeId as state to identify the user after OAuth callback
    const state = user.employeeId;
    console.log('Using employeeId as state:', state);
    
    const authUrl = emailService.getMicrosoftAuthUrl(state);
    
    console.log('Outlook OAuth URL generated successfully for user:', user.id);
    res.json({
      success: true,
      url: authUrl,
      state: state
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
    console.log('🔍 Fetching email templates from database...');
    
    // Fetch templates from database (only active ones)
    const templates = await prisma.emailTemplate.findMany({
      where: {
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 Templates found in database:', templates.length);

    // If no templates exist, create default ones
    if (templates.length === 0) {
      console.log('📝 No templates found, creating default templates...');
      
      const defaultTemplates = [
        {
          name: 'Employee Registration',
          category: 'Registration',
          subject: 'Your account has been created',
          body: `Hi {{employee_name}},

Welcome to the Timesheet System. Your account has been created successfully.

You can log in to your account using the link below:
{{login_url}}

Account Details:
Email: {{employee_email}}
Company: {{company_name}}

If you have any questions, feel free to reply to this email.

Best regards,
{{company_name}} Team`,
          variables: ['employee_name', 'company_name', 'employee_email', 'login_url']
        },
        {
          name: 'Leave Approval',
          category: 'Leave',
          subject: 'Update on your leave request',
          body: `Hi {{employee_name}},

Your leave request has been {{status}}.

Leave Details:
Type: {{leave_type}}
Period: {{start_date}} to {{end_date}}
Total Days: {{total_days}}
Reason: {{reason}}

If you have any questions, feel free to reply to this email.

Best regards,
Timesheet System Team`,
          variables: ['manager_name', 'employee_name', 'status', 'leave_type', 'start_date', 'end_date', 'total_days', 'reason']
        },
        {
          name: 'Timesheet Reminder',
          category: 'Timesheet',
          subject: 'Reminder: Timesheet submission due',
          body: `Hi {{employee_name}},

This is a friendly reminder to submit your timesheet for {{date}}.

Current Status:
Hours Logged: {{hours_logged}}
Pending Entries: {{pending_entries}}

Please ensure your timesheet is submitted by the deadline: {{deadline}}

You can log in here: {{login_url}}

Best regards,
{{company_name}} Team`,
          variables: ['employee_name', 'date', 'hours_logged', 'pending_entries', 'deadline', 'login_url', 'company_name']
        },
        {
          name: 'Password Reset',
          category: 'Security',
          subject: 'Password Reset Request',
          body: `Hi {{employee_name}},

We received a request to reset your password for your {{company_name}} account.

You can reset your password using the link below:
{{reset_url}}

If you did not request this, please ignore this email.

Best regards,
{{company_name}} Team`,
          variables: ['employee_name', 'company_name', 'reset_url', 'expiry_hours']
        }
      ];

      // Insert default templates using a loop (safer than createMany for autogenerating IDs)
      console.log('📝 Inserting default templates...');
      for (const template of defaultTemplates) {
        try {
          await prisma.emailTemplate.create({
            data: template
          });
        } catch (createErr) {
          console.error(`❌ Failed to create template ${template.name}:`, createErr);
        }
      }

      console.log('✅ Default templates initialization completed');

      // Fetch the newly created templates
      const newTemplates = await prisma.emailTemplate.findMany({
        where: {
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({
        success: true,
        templates: newTemplates,
        message: 'Default templates created'
      });
    }

    res.json({
      success: true,
      templates: templates
    });
  } catch (error) {
    console.error('❌ Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get pending employee approvals
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    console.log('Fetching pending approvals for admin');
    
    const pendingEmployees = await prisma.employee.findMany({
      where: {
        status: {
          in: ['pending_approval', 'pending']
        }
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        designation: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${pendingEmployees.length} pending approvals`);
    res.json(pendingEmployees);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ 
      message: 'Failed to fetch pending approvals',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, subject, body, status } = req.body;
    
    console.log('🔄 Updating email template:', id);
    console.log('📝 Update data:', { name, category, subject, status });
    
    // Validate required fields
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Subject and body are required'
      });
    }
    
    // Update the template in database
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: name || undefined,
        category: category || undefined,
        subject,
        body,
        status: status || 'active',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Template updated successfully:', updatedTemplate.name);
    
    res.json({
      success: true,
      template: updatedTemplate,
      message: 'Email template updated successfully'
    });
  } catch (error) {
    console.error('❌ Update email template error:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update email template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const sendEmailFromTemplate = async (req: Request, res: Response) => {
  return await sendTestEmail(req, res);
};

// Email health check endpoint
export const checkEmailHealth = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Email health check requested');
    
    const health = {
      smtp: {
        configured: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
        host: process.env.SMTP_HOST || 'not configured',
        port: process.env.SMTP_PORT || '587',
        secure: process.env.SMTP_SECURE || 'false'
      },
      oauth: {
        google: {
          configured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
          clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing'
        },
        outlook: {
          configured: !!process.env.OUTLOOK_CLIENT_ID && !!process.env.OUTLOOK_CLIENT_SECRET,
          clientId: process.env.OUTLOOK_CLIENT_ID ? 'configured' : 'missing'
        }
      },
      connections: {
        outlook: 0,
        gmail: 0
      },
      frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    };

    // Check active connections
    try {
      const connections = await emailService.getAllEmailConnections();
      health.connections.outlook = connections.filter(c => c.provider === 'outlook').length;
      health.connections.gmail = connections.filter(c => c.provider === 'gmail').length;
      console.log('📊 Active connections:', health.connections);
    } catch (dbError: any) {
      console.warn('⚠️ Could not check connections:', dbError.message);
    }

    const recommendations = [];
    
    if (!health.smtp.configured && health.connections.outlook === 0) {
      recommendations.push("Configure SMTP or OAuth to enable email sending");
    }
    
    if (!health.oauth.google.configured && !health.oauth.outlook.configured) {
      recommendations.push("Set up OAuth credentials for Gmail or Outlook");
    }
    
    if (health.oauth.outlook.configured && health.connections.outlook === 0) {
      recommendations.push("Connect an Outlook account in Email Configuration");
    }
    
    if (health.oauth.google.configured && health.connections.gmail === 0) {
      recommendations.push("Connect a Gmail account in Email Configuration");
    }

    console.log('✅ Email health check completed');
    console.log('📋 Recommendations:', recommendations);

    res.json({
      success: true,
      health,
      recommendations,
      status: (health.connections.outlook > 0 || health.smtp.configured) ? 'operational' : 'not_configured'
    });
  } catch (error) {
    console.error('❌ Email health check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
  }
};
