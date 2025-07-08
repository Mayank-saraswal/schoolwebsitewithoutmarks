import express from 'express';
import { 
  parentLogin, 
  verifyParentToken as verifyTokenController, 
  parentLogout,
  getStudentMarks,
  getStudentFees,
  getMarksheetData
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

// GET /api/parent/marks/:studentId - Get student marks
router.get('/marks/:studentId', verifyParentToken, getStudentMarks);

// GET /api/parent/fees/:studentId - Get student fee details
router.get('/fees/:studentId', verifyParentToken, getStudentFees);

// GET /api/parent/marksheet/:studentId - Get marksheet data for PDF
router.get('/marksheet/:studentId', verifyParentToken, getMarksheetData);

export default router; 