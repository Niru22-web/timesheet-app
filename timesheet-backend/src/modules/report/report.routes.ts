import express from 'express';
import { getReportSummary, getEmployeeSummary } from './report.controller';
import { authenticate, checkManagerRole } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/summary', checkManagerRole, getReportSummary);
router.get('/employee-summary', authenticate, getEmployeeSummary);

export default router;