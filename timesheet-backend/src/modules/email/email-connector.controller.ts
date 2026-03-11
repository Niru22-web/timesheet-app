import { Request, Response } from 'express';
import emailService from './email.service';
import { authenticate } from '../../middleware/auth.middleware';

class EmailConnectorController {
  // Get OAuth URLs for connection
  getAuthUrls = async (req: Request, res: Response) => {
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
  handleGoogleCallback = async (req: Request, res: Response) => {
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
      res.redirect(`${process.env.FRONTEND_URL}/email-connector?success=true&provider=gmail&email=${result.email}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/email-connector?success=false&provider=gmail&error=Failed to connect Gmail`);
    }
  };

  // Handle Microsoft OAuth callback
  handleMicrosoftCallback = async (req: Request, res: Response) => {
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
      res.redirect(`${process.env.FRONTEND_URL}/email-connector?success=true&provider=outlook&email=${result.email}`);
    } catch (error) {
      console.error('Microsoft callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/email-connector?success=false&provider=outlook&error=Failed to connect Outlook`);
    }
  };

  // Get email connection status
  getConnectionStatus = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const gmailConnection = await emailService.getEmailConnection(user.employeeId, 'gmail');
      const outlookConnection = await emailService.getEmailConnection(user.employeeId, 'outlook');

      res.json({
        success: true,
        data: {
          gmail: gmailConnection ? {
            connected: true,
            email: gmailConnection.email,
            connectedAt: gmailConnection.createdAt,
            isActive: gmailConnection.isActive
          } : {
            connected: false
          },
          outlook: outlookConnection ? {
            connected: true,
            email: outlookConnection.email,
            connectedAt: outlookConnection.createdAt,
            isActive: outlookConnection.isActive
          } : {
            connected: false
          }
        }
      });
    } catch (error) {
      console.error('Get connection status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get connection status'
      });
    }
  };

  // Disconnect email account
  disconnectEmail = async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
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

  // Send email (for testing)
  sendTestEmail = async (req: Request, res: Response) => {
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
  getAllConnections = async (req: Request, res: Response) => {
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
}

export default new EmailConnectorController();
