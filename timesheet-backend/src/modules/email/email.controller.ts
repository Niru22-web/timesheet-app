import { Request, Response } from 'express';
import { EmailService } from './email.service';
import { prisma } from '../../config/prisma';

const emailService = new EmailService();

// Get OAuth authorization URL
export const getOAuthAuthUrl = async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;
    
    if (!provider || typeof provider !== 'string') {
      return res.status(200).json({ 
        success: false, 
        message: 'Provider is required' 
      });
    }

    const authData = await emailService.getOAuthAuthUrl(provider);
    return res.status(200).json({
      success: true,
      url: authData.url,
      state: authData.state
    });
  } catch (error: any) {
    console.error('Error getting OAuth auth URL:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to generate OAuth authorization URL',
      error: error.message 
    });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { provider, code, state, error } = req.query;
    
    if (error) {
      return res.status(200).json({ 
        success: false, 
        message: 'OAuth authorization failed',
        error: error 
      });
    }

    if (!provider || !code || typeof provider !== 'string' || typeof code !== 'string') {
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid OAuth callback parameters' 
      });
    }

    const oauthConnection = await emailService.handleOAuthCallback(provider, code, state as string);
    await emailService.saveOAuthConnection(oauthConnection);
    
    return res.status(200).json({
      success: true,
      message: 'OAuth connection successful',
      connection: {
        provider: oauthConnection.provider,
        email: oauthConnection.email,
        isActive: oauthConnection.isActive
      }
    });
  } catch (error: any) {
    console.error('Error handling OAuth callback:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to handle OAuth callback',
      error: error.message 
    });
  }
};

// Disconnect OAuth
export const disconnectOAuth = async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    
    if (!provider || typeof provider !== 'string') {
      return res.status(200).json({ 
        success: false, 
        message: 'Provider is required' 
      });
    }

    await emailService.disconnectOAuth(provider);
    
    return res.status(200).json({
      success: true,
      message: 'OAuth connection disconnected successfully'
    });
  } catch (error: any) {
    console.error('Error disconnecting OAuth:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to disconnect OAuth',
      error: error.message 
    });
  }
};

// Get OAuth connection status
export const getOAuthStatus = async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;
    
    if (!provider || typeof provider !== 'string') {
      return res.status(200).json({ 
        success: false, 
        message: 'Provider is required' 
      });
    }

    const connection = await emailService.getOAuthConnection(provider);
    
    return res.status(200).json({
      success: true,
      connected: !!connection,
      connection: connection ? {
        provider: connection.provider,
        email: connection.email,
        isActive: connection.isActive,
        expiresAt: connection.expiresAt
      } : null
    });
  } catch (error: any) {
    console.error('Error getting OAuth status:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to get OAuth status',
      error: error.message 
    });
  }
};
export const getProviderConfigurations = async (req: Request, res: Response) => {
  try {
    const providers = ['gmail', 'outlook', 'zoho', 'custom'];
    const configurations = providers.map(provider => {
      const config = emailService.getProviderConfig(provider);
      return {
        id: provider,
        name: config.displayName,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        encryptionType: config.encryptionType,
        authNote: config.authNote
      };
    });
    
    return res.status(200).json(configurations);
  } catch (error: any) {
    console.error('Error fetching provider configurations:', error);
    return res.status(200).json([]);
  }
};

// Get email configuration
export const getEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const config = await emailService.getEmailConfiguration();
    return res.status(200).json(config);
  } catch (error: any) {
    console.error('Error fetching email configuration:', error);
    return res.status(200).json({});
  }
};

// Save email configuration
export const saveEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid configuration data provided' 
      });
    }
    
    const savedConfig = await emailService.saveEmailConfiguration(config);
    return res.status(200).json(savedConfig);
  } catch (error: any) {
    console.error('Error saving email configuration:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to save email configuration',
      error: error.message 
    });
  }
};

// Test email configuration
export const testEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    // Basic input validation
    if (!config || typeof config !== 'object') {
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid configuration data provided',
        details: { type: 'validation_error' }
      });
    }

    const result = await emailService.testEmailConfiguration(config);
    
    // Always return HTTP 200 with structured response
    return res.status(200).json({
      success: result.success,
      message: result.message,
      details: result.details
    });
    
  } catch (error: any) {
    // Catch-all for any unexpected controller errors
    console.error('Controller error in testEmailConfiguration:', error);
    
    // Always return HTTP 200 with controlled error response
    return res.status(200).json({ 
      success: false, 
      message: 'An error occurred while testing email configuration',
      details: {
        error: error.message || 'Unknown controller error',
        type: 'controller_error'
      }
    });
  }
};

// Get email templates
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await emailService.getEmailTemplates();
    return res.status(200).json(templates);
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return res.status(200).json([]);
  }
};

// Update email template
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateData = req.body;
    
    if (!id || !templateData) {
      return res.status(200).json({ 
        success: false, 
        message: 'Invalid template data provided' 
      });
    }
    
    const updatedTemplate = await emailService.updateEmailTemplate(id, templateData);
    return res.status(200).json(updatedTemplate);
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to update email template',
      error: error.message 
    });
  }
};

// Send email using template
export const sendEmailFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateName, to, variables } = req.body;
    
    if (!templateName || !to) {
      return res.status(200).json({ 
        success: false, 
        message: 'Template name and recipient email are required' 
      });
    }
    
    const result = await emailService.sendEmailFromTemplate(templateName, to, variables);
    
    return res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error: any) {
    console.error('Error sending email from template:', error);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
};
