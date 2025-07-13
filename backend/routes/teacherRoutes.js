import express from 'express';
  import { 
    registerTeacher,
    loginTeacher,
    logoutTeacher,
    getTeacherProfile, 
    verifyTeacherToken as verifyTokenController
  } from '../controllers/teacherController.js';
  import { verifyTeacherToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
// POST /api/teachers/register - Teacher registration
router.post('/register', registerTeacher);

// POST /api/teachers/login - Teacher login
router.post('/login', loginTeacher);

// ===== PROTECTED ROUTES (Require Teacher Auth) =====
// GET /api/teachers/profile - Get teacher profile
router.get('/profile', verifyTeacherToken, getTeacherProfile);

// GET /api/teachers/verify - Verify teacher token (for frontend auth checks)
router.get('/verify', verifyTeacherToken, verifyTokenController);

// POST /api/teachers/logout - Teacher logout
router.post('/logout', logoutTeacher);

export default router; 