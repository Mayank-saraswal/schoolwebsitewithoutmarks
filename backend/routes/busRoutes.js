import express from 'express';
import { getAllBusRoutes, getBusRouteFee } from '../controllers/configController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/bus/routes - Get all bus routes (admin only)
router.get('/routes', verifyAdminToken, getAllBusRoutes);

// GET /api/bus/fee/:routeName - Get fee for specific bus route (admin only)
router.get('/fee/:routeName', verifyAdminToken, getBusRouteFee);

export default router; 