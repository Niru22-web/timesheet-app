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
  exportProjects,
  bulkUploadProjects,
  downloadProjectTemplate,
  uploadProjectFiles,
  uploadProjectExcel
} from './project.controller';
import { allowRoles } from '../../middleware/role.middleware';

const router = Router();

// Project CRUD operations
router.get('/', getAllProjects);
router.get('/search', searchProjects); 
router.get('/export', exportProjects);
router.get('/template/download', downloadProjectTemplate);
router.get('/:id', getProjectById);

router.post('/bulk-upload', allowRoles('Admin', 'Partner'), uploadProjectExcel, bulkUploadProjects);
router.post('/', allowRoles('Admin', 'Partner'), uploadProjectFiles, createProject);
router.put('/:id', allowRoles('Admin', 'Partner'), updateProject);
router.delete('/:id', allowRoles('Admin', 'Partner'), deleteProject);

// Attachment operations
router.get('/:projectId/attachments', getProjectAttachments);
router.post('/:projectId/attachments', allowRoles('Admin', 'Partner'), uploadProjectFiles, addProjectAttachment);
router.delete('/attachments/:attachmentId', allowRoles('Admin', 'Partner'), deleteProjectAttachment);

export default router;