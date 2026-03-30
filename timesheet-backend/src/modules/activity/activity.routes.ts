import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getRecentActivitiesHandler, getMyActivitiesHandler } from './activity.controller';

const router = Router();

// Apply authentication to all activity routes
router.use(authenticate);

// Admin/Global activity endpoint
router.get('/recent', getRecentActivitiesHandler);

// User specific activity endpoint
router.get('/my', getMyActivitiesHandler);

export default router;
