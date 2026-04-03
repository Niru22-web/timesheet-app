import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getTimelogs,
  createTimelog,
  updateTimelog,
  deleteTimelog,
  getAccessibleClients,
  getAccessibleProjects,
  getAccessibleJobs,
  exportTimelogsToExcel,
  importTimelogsFromExcel,
  downloadTimelogTemplate,
  uploadTimelogFile,
  getTimesheetReports,
  getMissingTimesheets,
  submitTimelog,
  getMyTimelogs,
  getTeamTimelogs,
  approveTimelogHandler,
  rejectTimelogHandler
} from './timelog.controller';
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

// Apply authentication to all timelog routes
router.use(authenticate);

// Add debugging middleware to see what's happening
router.use((req: any, res: any, next: any) => {
  console.log('🔍 TIMELOG ROUTE - Request received:', {
    method: req.method,
    url: req.url,
    path: req.path,
    user: req.user ? { id: req.user.id, email: req.user.email } : 'anonymous'
  });
  next();
});

// Timelog CRUD operations
router.get('/my', getMyTimelogs);
router.get('/team', getTeamTimelogs);
router.get('/', getTimelogs);
router.post('/', createTimelog);
router.put('/:id', updateTimelog);
router.delete('/:id', deleteTimelog);
router.patch('/:id/submit', submitTimelog);
router.put('/:id/approve', approveTimelogHandler);
router.put('/:id/reject', rejectTimelogHandler);

// Weekly Operations
router.get('/weekly', getWeeklyTimesheets);
router.get('/week-range', getWeekRange);
router.get('/weekly/submission-status', getWeeklySubmissionStatus);
router.get('/log-time/form-data', getLogTimeFormData);
router.post('/weekly', createWeeklyTimelog);
router.post('/weekly/submit', submitWeeklyTimesheet);
router.post('/weekly/approve', approveWeeklyTimesheet);

// Hierarchical data access
router.get('/accessible/clients', getAccessibleClients);
router.get('/accessible/projects', getAccessibleProjects);
router.get('/accessible/jobs', getAccessibleJobs);

// Excel operations
router.get('/export', exportTimelogsToExcel);
router.post('/import', uploadTimelogFile, importTimelogsFromExcel);
router.get('/template', downloadTimelogTemplate);

// Dashboard and Reports
router.get('/reports', getTimesheetReports);
router.get('/missing-timesheets', getMissingTimesheets);

export default router;