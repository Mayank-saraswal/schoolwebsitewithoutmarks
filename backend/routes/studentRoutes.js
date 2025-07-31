import express from 'express';
import { 
  createStudent,
  getMyStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getNextSRNumber,
  testCreateStudent
} from '../controllers/studentController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== DEBUG ROUTES (No Authentication) =====
// Debug endpoint to test student creation
router.post('/debug/create', async (req, res) => {
  try {
    console.log('🐛 Debug: Student creation request body:', JSON.stringify(req.body, null, 2));
    
    // Mock admin for debugging
    req.admin = {
      adminId: 'admin@saraswatischool',
      name: 'Debug Admin',
      role: 'admin',
      type: 'admin'
    };
    
    // Call the original createStudent function
    const { createStudent } = await import('../controllers/studentController.js');
    await createStudent(req, res);
    
  } catch (error) {
    console.error('🐛 Debug: Student creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint with predefined sample data
router.post('/debug/test-create', testCreateStudent);

// ===== ALL ROUTES REQUIRE ADMIN AUTHENTICATION =====

// POST /api/students/create - Create new student
router.post('/create', verifyAdminToken, createStudent);

// GET /api/students/my-students - Get students created by admin
router.get('/my-students', verifyAdminToken, getMyStudents);

// GET /api/students/next-sr-number - Get next available SR number
router.get('/next-sr-number', verifyAdminToken, getNextSRNumber);

// GET /api/students/:id - Get specific student by ID
router.get('/:id', verifyAdminToken, getStudentById);

// PUT /api/students/:id - Update student information
router.put('/:id', verifyAdminToken, updateStudent);

// DELETE /api/students/:id - Delete student
router.delete('/:id', verifyAdminToken, deleteStudent);

export default router; 