import { Router } from 'express';
import {
  getOAuthAuthUrl,
  handleOAuthCallback,
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

// OAuth routes (Admin only)
router.get('/oauth/auth-url', checkAdminRole, getOAuthAuthUrl);
router.post('/oauth/callback', checkAdminRole, handleOAuthCallback);
router.post('/oauth/disconnect', checkAdminRole, disconnectOAuth);
router.get('/oauth/status', checkAdminRole, getOAuthStatus);

// Email Configuration routes (Admin only)
router.get('/email-configuration', checkAdminRole, getEmailConfiguration);
router.post('/email-configuration', checkAdminRole, saveEmailConfiguration);
router.post('/test-email-configuration', checkAdminRole, testEmailConfiguration);
router.get('/provider-configurations', checkAdminRole, getProviderConfigurations);

// Email Templates routes (Admin only)
router.get('/email-templates', checkAdminRole, getEmailTemplates);
router.put('/email-templates/:id', checkAdminRole, updateEmailTemplate);

// Send email route (can be used by other services)
router.post('/send-email', sendEmailFromTemplate);

export default router;
