import express from 'express';
import {
  createPaymentOrder,
  uploadPaymentScreenshot,
  getParentPaymentRequests,
  getAllPaymentRequests,
  processPaymentRequest,
  getScreenshot,
  upload
} from '../controllers/paymentController.js';
import { verifyParentToken, verifyTeacherToken, verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PARENT PAYMENT ROUTES =====
// POST /api/payments/create-order - Create Razorpay payment order
router.post('/create-order', verifyParentToken, createPaymentOrder);

// POST /api/payments/upload-screenshot - Upload payment screenshot and create request
router.post('/upload-screenshot', upload.single('screenshot'), uploadPaymentScreenshot);

// GET /api/payments/parent/requests - Get payment requests for authenticated parent
router.get('/parent/requests', verifyParentToken, getParentPaymentRequests);

// ===== ADMIN PAYMENT ROUTES =====
// GET /api/payments/admin/requests - Get all payment requests (admin only)
router.get('/admin/requests', verifyAdminToken, getAllPaymentRequests);

// PUT /api/payments/admin/process/:requestId - Approve or reject payment request
router.put('/admin/process/:requestId', verifyAdminToken, processPaymentRequest);

// ===== FILE SERVING ROUTES =====
// GET /api/payments/screenshot/:filename - Serve screenshot files (admin only)
router.get('/screenshot/:filename', verifyAdminToken, getScreenshot);

export default router; 