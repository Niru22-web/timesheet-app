import { Router } from 'express';
import emailConnectorController from './email-connector.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get OAuth URLs for connecting accounts
router.get('/auth/urls', emailConnectorController.getAuthUrls);

// OAuth callback endpoints
router.get('/callback/google', emailConnectorController.handleGoogleCallback);
router.get('/callback/outlook', emailConnectorController.handleMicrosoftCallback);

// Get connection status
router.get('/status', emailConnectorController.getConnectionStatus);

// Send test email
router.post('/send-test', emailConnectorController.sendTestEmail);

// Disconnect email account
router.delete('/disconnect/:provider', emailConnectorController.disconnectEmail);

// Get all connections (admin only)
router.get('/connections', emailConnectorController.getAllConnections);

export default router;
