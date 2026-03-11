import { Router } from 'express';
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
  getMissingTimesheets
} from './timelog.controller';

const router = Router();

// Timelog CRUD operations
router.get('/', getTimelogs);
router.post('/', createTimelog);
router.put('/:id', updateTimelog);
router.delete('/:id', deleteTimelog);

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