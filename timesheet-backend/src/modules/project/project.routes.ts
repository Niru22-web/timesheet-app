import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  getProjectAttachments,
  addProjectAttachment,
  deleteProjectAttachment,
  uploadProjectFiles,
  uploadProjectFile
} from './project.controller';

const router = Router();

// Project CRUD operations
router.get('/', getAllProjects);
router.get('/search', searchProjects);
router.get('/:id', getProjectById);
router.post('/', uploadProjectFiles, createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project attachments
router.get('/:projectId/attachments', getProjectAttachments);
router.post('/:projectId/attachments', uploadProjectFile, addProjectAttachment);
router.delete('/attachments/:attachmentId', deleteProjectAttachment);

export default router;