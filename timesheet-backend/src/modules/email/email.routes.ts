import { Router } from 'express';
import {
  getAuthUrls,
  handleGoogleCallback,
  handleMicrosoftCallback,
  getConnectionStatus,
  disconnectEmail,
  sendTestEmail,
  getAllConnections,
  getGoogleOAuthAuth,
  getOutlookOAuthAuth,
  handleOAuthCallback,
  getOAuthAuthUrl,
  disconnectOAuth,
  getOAuthStatus,
  getProviderConfigurations,
  getEmailConfiguration,
  saveEmailConfiguration,
  testEmailConfiguration,
  getEmailTemplates,
  updateEmailTemplate,
  sendEmailFromTemplate
} from './email.controller';

const router = Router();

// Middleware to check if user is admin
const checkAdminRole = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    const userRole = (decoded.role as string).toLowerCase();
    if (userRole === 'admin') {
      req.user = decoded;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Admin role required." });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Email service is running',
    timestamp: new Date().toISOString()
  });
});

// OAuth routes (Public access for email connection)
router.get('/oauth/google', getGoogleOAuthAuth);
router.get('/oauth/outlook', getOutlookOAuthAuth);
router.post('/oauth/callback', handleOAuthCallback);

// Admin-only OAuth routes
router.get('/admin/oauth/auth-url', checkAdminRole, getAuthUrls);
router.post('/admin/oauth/callback', checkAdminRole, handleGoogleCallback);
router.post('/admin/oauth/disconnect', checkAdminRole, disconnectEmail);
router.get('/admin/oauth/status', checkAdminRole, getConnectionStatus);

// Email Configuration routes (Admin only)
router.get('/email-configuration', checkAdminRole, getConnectionStatus);
router.post('/email-configuration', checkAdminRole, sendTestEmail);
router.post('/test-email-configuration', checkAdminRole, sendTestEmail);
router.get('/provider-configurations', checkAdminRole, getAllConnections);

// Email Templates routes (Admin only)
router.get('/email-templates', checkAdminRole, getAllConnections);
router.put('/email-templates/:id', checkAdminRole, sendTestEmail);

// Send email route (can be used by other services)
router.post('/send-email', sendTestEmail);

export default router;
