import express from 'express';
import { 
  getClassFee,
  getBusFee,
  getBusRoutes,
  getStudentFormConfig,
  getAllBusRoutes,
  getBusRouteFee
} from '../controllers/configController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== ALL ROUTES REQUIRE ADMIN AUTHENTICATION =====

// GET /api/config/fees/:class - Get class fee for a specific class
router.get('/fees/:class', verifyAdminToken, getClassFee);

// GET /api/config/bus-fee/:route - Get fee for a specific bus route
router.get('/bus-fee/:route', verifyAdminToken, getBusFee);

// GET /api/config/bus-routes - Get all active bus routes
router.get('/bus-routes', verifyAdminToken, getBusRoutes);

// GET /api/config/student-form/:class - Get complete configuration for student creation form
router.get('/student-form/:class', verifyAdminToken, getStudentFormConfig);

// ===== GENERAL BUS ROUTES ENDPOINTS (ADMIN ONLY) =====

// @desc    Get all bus routes (for admin fee management form)
// @route   GET /api/bus/routes
// @access  Private (Admin only)
router.get('/bus/routes', verifyAdminToken, getAllBusRoutes);

// @desc    Get fee for specific bus route
// @route   GET /api/bus/fee/:routeName
// @access  Private (Admin only)
router.get('/bus/fee/:routeName', verifyAdminToken, getBusRouteFee);

export default router; 