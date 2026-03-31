import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  bulkUploadClients,
  downloadClientTemplate,
  uploadClientFile,
  toggleClientStatus,
  exportClients
} from './client.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { allowRoles } from '../../middleware/role.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Client CRUD operations
router.get('/', getAllClients);
router.get('/export', exportClients);
router.get('/:id', getClientById);
router.post('/', allowRoles('Admin', 'Partner'), createClient);
router.put('/:id', allowRoles('Admin', 'Partner'), updateClient);
router.delete('/:id', allowRoles('Admin'), deleteClient);
router.patch('/:id/toggle-status', allowRoles('Admin', 'Partner'), toggleClientStatus);

// Bulk operations (Admin only)
router.post('/bulk-upload', allowRoles('Admin'), uploadClientFile, bulkUploadClients);
router.get('/template/download', allowRoles('Admin'), downloadClientTemplate);

export default router;