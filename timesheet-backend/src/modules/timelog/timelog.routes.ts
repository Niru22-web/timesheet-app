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

const router = Router();

// Timelog CRUD operations
router.get('/my', authenticate, getMyTimelogs);
router.get('/team', authenticate, getTeamTimelogs);
router.get('/', authenticate, getTimelogs);
router.post('/', authenticate, createTimelog);
router.put('/:id', authenticate, updateTimelog);
router.delete('/:id', authenticate, deleteTimelog);
router.patch('/:id/submit', authenticate, submitTimelog);
router.put('/:id/approve', authenticate, approveTimelogHandler);
router.put('/:id/reject', authenticate, rejectTimelogHandler);

// Hierarchical data access
router.get('/accessible/clients', authenticate, getAccessibleClients);
router.get('/accessible/projects', authenticate, getAccessibleProjects);
router.get('/accessible/jobs', authenticate, getAccessibleJobs);

// Excel operations
router.get('/export', authenticate, exportTimelogsToExcel);
router.post('/import', authenticate, uploadTimelogFile, importTimelogsFromExcel);
router.get('/template', authenticate, downloadTimelogTemplate);

// Dashboard and Reports
router.get('/reports', authenticate, getTimesheetReports);
router.get('/missing-timesheets', authenticate, getMissingTimesheets);

export default router;