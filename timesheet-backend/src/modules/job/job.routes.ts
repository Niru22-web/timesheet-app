import { Router } from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByProject,
  getJobsByClient,
  searchJobs
} from './job.controller';

const router = Router();

// Job CRUD operations
router.get('/', getAllJobs);
router.get('/search', searchJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

// Job relationships
router.get('/project/:projectId', getJobsByProject);
router.get('/client/:clientId', getJobsByClient);

export default router;