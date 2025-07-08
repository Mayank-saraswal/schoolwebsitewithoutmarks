import express from 'express';
import { 
  upsertSubjects, 
  getSubjects, 
  getAdminSubjects, 
  deleteSubjects 
} from '../controllers/subjectController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';
import { verifyTeacherToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/admin/subjects', verifyAdminToken, upsertSubjects);
router.get('/admin/subjects', verifyAdminToken, getAdminSubjects);
router.delete('/admin/subjects/:id', verifyAdminToken, deleteSubjects);

// Teacher routes
router.get('/subjects', verifyTeacherToken, getSubjects);

export default router; 