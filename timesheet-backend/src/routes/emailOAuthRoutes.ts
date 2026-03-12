import { Router } from 'express';
import { getOutlookOAuthAuth, handleMicrosoftCallback, getConnectionStatus } from '../modules/email/email.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/email/oauth/outlook - Initiates Microsoft OAuth login
router.get('/outlook', authenticate, getOutlookOAuthAuth);

// GET /api/email/oauth/outlook/callback - Handles OAuth callback (no auth required)
router.get('/outlook/callback', handleMicrosoftCallback);

// GET /api/email/status - Returns connection status
router.get('/status', authenticate, getConnectionStatus);

export default router;
