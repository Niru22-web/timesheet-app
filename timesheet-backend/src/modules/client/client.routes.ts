import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  bulkUploadClients,
  downloadClientTemplate,
  uploadClientFile
} from './client.controller';

const router = Router();

// Client CRUD operations
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// Bulk operations
router.post('/bulk-upload', uploadClientFile, bulkUploadClients);
router.get('/template/download', downloadClientTemplate);

export default router;