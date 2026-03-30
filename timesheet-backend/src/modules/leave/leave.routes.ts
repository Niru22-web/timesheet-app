import { Router } from 'express';
import { 
  getLeaves, 
  createLeave, 
  updateLeaveStatus, 
  deleteLeave, 
  getLeaveBalance,
  adjustLeave
} from './leave.controller';

const router = Router();

// Middleware to authenticate any user
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/leaves - Get leave records (role-based filtering)
router.get('/', getLeaves);

// POST /api/leaves - Create new leave request
router.post('/', createLeave);

// PUT /api/leaves/:id - Update leave status (approve/reject)
router.put('/:id', updateLeaveStatus);

// DELETE /api/leaves/:id - Cancel leave request
router.delete('/:id', deleteLeave);

// GET /api/leaves/balance - Get leave balance for current user
router.get('/balance', getLeaveBalance);

// POST /api/leaves/adjust - Adjust leave balance manually
router.post('/adjust', adjustLeave);

export default router;
