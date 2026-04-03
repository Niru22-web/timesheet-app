import { Router } from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByProject,
  getJobsByClient,
  searchJobs,
  bulkUploadJobs,
  exportJobs,
  downloadJobTemplate,
  uploadJobExcel
} from './job.controller';
import { allowRoles } from '../../middleware/role.middleware';
import { authenticate } from '../../middleware/auth.middleware';


const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Job CRUD operations
router.get('/', getAllJobs);
router.get('/export', exportJobs);
router.get('/template/download', downloadJobTemplate);
router.get('/search', searchJobs);
router.get('/:id', getJobById);

router.post('/bulk-upload', allowRoles('Admin', 'Partner'), uploadJobExcel, bulkUploadJobs);
router.post('/', allowRoles('Admin', 'Partner'), createJob);
router.put('/:id', allowRoles('Admin', 'Partner'), updateJob);
router.delete('/:id', allowRoles('Admin', 'Partner'), deleteJob);

// Client/Project based retrieval
router.get('/project/:projectId', getJobsByProject);
router.get('/client/:clientId', getJobsByClient);

export default router;