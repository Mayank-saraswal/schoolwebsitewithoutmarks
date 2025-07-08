import express from 'express';
import {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  getAdmissionStats
} from '../controllers/admissionController.js';

const router = express.Router();

// POST /api/admissions - Create new admission
router.post('/', createAdmission);

// GET /api/admissions - Get all admissions (admin)
router.get('/', getAllAdmissions);

// GET /api/admissions/stats - Get admission statistics
router.get('/stats', getAdmissionStats);

// GET /api/admissions/:id - Get admission by ID
router.get('/:id', getAdmissionById);

export default router; 