import { Router } from 'express';
import { getOutlookOAuthAuth, handleMicrosoftCallback, getConnectionStatus } from '../modules/email/email.controller';

const router = Router();

// GET /api/email/oauth/outlook - Initiates Microsoft OAuth login
router.get('/outlook', getOutlookOAuthAuth);

// GET /api/email/oauth/outlook/callback - Handles OAuth callback
router.get('/outlook/callback', handleMicrosoftCallback);

// GET /api/admin/oauth/status - Returns connection status (moved here for organization)
router.get('/admin/oauth/status', getConnectionStatus);

export default router;
