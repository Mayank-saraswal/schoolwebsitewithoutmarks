import express from 'express';
import { 
  parentLogin, 
  verifyParentToken as verifyTokenController, 
  parentLogout,
  getStudentFees
} from '../controllers/parentAuthController.js';
import { verifyParentToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC PARENT ROUTES =====
// POST /api/parent/login - Parent login with mobile + child's DOB
router.post('/login', parentLogin);



// ===== PROTECTED PARENT ROUTES =====
// GET /api/parent/verify - Verify parent token
router.get('/verify', verifyParentToken, verifyTokenController);

// POST /api/parent/logout - Parent logout
router.post('/logout', verifyParentToken, parentLogout);

// GET /api/parent/fees/:studentId - Get student fee details
router.get('/fees/:studentId', verifyParentToken, getStudentFees);

export default router; 