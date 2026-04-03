import express from 'express';
import { 
  getAllReimbursements, 
  createReimbursement, 
  updateReimbursementStatus, 
  bulkUploadReimbursements, 
  exportReimbursements,
  getReimbursementKPIs
} from './reimbursement.controller';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auth check middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

router.get('/', authenticate, getAllReimbursements);
router.get('/kpis', authenticate, getReimbursementKPIs);
router.post('/', authenticate, createReimbursement);
router.patch('/:id/status', authenticate, updateReimbursementStatus);
router.post('/bulk-upload', authenticate, upload.single('file'), bulkUploadReimbursements);
router.get('/export', authenticate, exportReimbursements);

export default router;
