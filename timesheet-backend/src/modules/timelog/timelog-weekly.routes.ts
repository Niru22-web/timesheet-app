import { Router } from 'express';
import {
  getWeeklyTimesheets,
  createWeeklyTimelog,
  submitWeeklyTimesheet,
  approveWeeklyTimesheet,
  getWeeklySubmissionStatus,
  getWeekRange,
  getLogTimeFormData
} from './timelog-weekly.controller';

const router = Router();

// Weekly Timesheet View
router.get('/weekly', getWeeklyTimesheets);

// Week Range Utility
router.get('/week-range', getWeekRange);

// Weekly Submission Status
router.get('/weekly/submission-status', getWeeklySubmissionStatus);

// Log Time Form Data
router.get('/log-time/form-data', getLogTimeFormData);

// Create Timelog (Log Time)
router.post('/weekly', createWeeklyTimelog);

// Submit Weekly Timesheet
router.post('/weekly/submit', submitWeeklyTimesheet);

// Approve Weekly Timesheet (Manager/Admin only)
router.post('/weekly/approve', approveWeeklyTimesheet);

export default router;
