import express from 'express';
import { getAllBusRoutes, getBusRouteFee } from '../controllers/configController.js';
import { verifyTeacherToken, verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to verify either admin or teacher authentication
const verifyAnyAuth = (req, res, next) => {
  // Check if admin token exists in cookies
  const adminToken = req.cookies?.adminToken;
  // Check if teacher token exists in headers
  const teacherToken = req.headers?.authorization?.split(' ')[1] || localStorage?.getItem?.('teacherToken');
  
  if (adminToken) {
    // If admin token exists, verify admin
    verifyAdminToken(req, res, next);
  } else if (teacherToken) {
    // If teacher token exists, verify teacher
    verifyTeacherToken(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Authentication required / प्रमाणीकरण आवश्यक है'
    });
  }
};

// GET /api/bus/routes - Get all bus routes (accessible by both admin and teachers)
router.get('/routes', verifyAnyAuth, getAllBusRoutes);

// GET /api/bus/fee/:routeName - Get fee for specific bus route
router.get('/fee/:routeName', verifyAnyAuth, getBusRouteFee);

export default router; 