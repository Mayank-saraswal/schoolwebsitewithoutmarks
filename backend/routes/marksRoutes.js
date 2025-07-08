import express from 'express';
import { 
  getTeacherExams,
  setMaxMarks,
  uploadMarks,
  updateMarks,
  getTeacherStudentsMarks,
  getStudentMarks,
  getSubjectsForClass,
  getExamsForClass,
  setMaxMarksForExam
} from '../controllers/marksController.js';
import { verifyTeacherToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== TEACHER ROUTES =====



// POST /api/teacher/set-max-marks - Set max marks for exam and subject list
router.post('/teacher/set-max-marks', verifyTeacherToken, setMaxMarksForExam);

// GET /api/marks/teacher-exams - Get exams for teacher's class and medium
router.get('/teacher-exams', verifyTeacherToken, getTeacherExams);

// GET /api/marks/subjects-for-class/:className - Get subjects for a specific class
router.get('/subjects-for-class/:className', verifyTeacherToken, getSubjectsForClass);

// GET /api/marks/exams-for-class/:className - Get exams for a specific class
router.get('/exams-for-class/:className', verifyTeacherToken, getExamsForClass);

// POST /api/marks/set-max-marks - Set max marks for subjects in an exam
router.post('/set-max-marks', verifyTeacherToken, setMaxMarks);

// POST /api/marks/upload - Upload marks for a student
router.post('/upload', verifyTeacherToken, uploadMarks);

// PUT /api/marks/update/:marksId - Update existing marks
router.put('/update/:marksId', verifyTeacherToken, updateMarks);

// GET /api/marks/teacher-students-marks - Get marks for teacher's students
router.get('/teacher-students-marks', verifyTeacherToken, getTeacherStudentsMarks);

// ===== PARENT ROUTES =====

// GET /api/marks/student/:studentId - Get marks for parent dashboard
router.get('/student/:studentId', getStudentMarks);

export default router; 