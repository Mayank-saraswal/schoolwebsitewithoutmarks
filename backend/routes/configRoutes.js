import express from 'express';
import { 
  getClassFee,
  getBusFee,
  getBusRoutes,
  getStudentFormConfig,
  getAllBusRoutes,
  getBusRouteFee
} from '../controllers/configController.js';
import { verifyTeacherToken, verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== ALL ROUTES REQUIRE TEACHER AUTHENTICATION =====

// GET /api/config/fees/:class - Get class fee for a specific class
router.get('/fees/:class', verifyTeacherToken, getClassFee);

// GET /api/config/bus-fee/:route - Get fee for a specific bus route
router.get('/bus-fee/:route', verifyTeacherToken, getBusFee);

// GET /api/config/bus-routes - Get all active bus routes
router.get('/bus-routes', verifyTeacherToken, getBusRoutes);

// GET /api/config/student-form/:class - Get complete configuration for student creation form
router.get('/student-form/:class', verifyTeacherToken, getStudentFormConfig);

// ===== GENERAL BUS ROUTES ENDPOINTS (ACCESSIBLE BY ADMIN AND TEACHERS) =====

// @desc    Get all bus routes (for admin fee management form)
// @route   GET /api/bus/routes
// @access  Private (Admin or Teacher)
router.get('/bus/routes', (req, res, next) => {
  // Check if admin or teacher token exists
  const adminToken = req.cookies?.adminToken;
  const teacherToken = req.headers?.authorization?.split(' ')[1];
  
  if (adminToken) {
    verifyAdminToken(req, res, next);
  } else if (teacherToken) {
    verifyTeacherToken(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required / प्रमाणीकरण आवश्यक है'
    });
  }
}, getAllBusRoutes);

// @desc    Get fee for specific bus route
// @route   GET /api/bus/fee/:routeName
// @access  Private (Admin or Teacher)
router.get('/bus/fee/:routeName', (req, res, next) => {
  // Check if admin or teacher token exists
  const adminToken = req.cookies?.adminToken;
  const teacherToken = req.headers?.authorization?.split(' ')[1];
  
  if (adminToken) {
    verifyAdminToken(req, res, next);
  } else if (teacherToken) {
    verifyTeacherToken(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required / प्रमाणीकरण आवश्यक है'
    });
  }
}, getBusRouteFee);

export default router; 