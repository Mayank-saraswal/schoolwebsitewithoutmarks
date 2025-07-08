import express from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getPublicAnnouncements,
  getDashboardAnnouncements,
  getAnnouncementById,
  deleteAnnouncement,
  getAnnouncementStats
} from '../controllers/announcementController.js';
import { verifyTeacherToken, verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== PUBLIC ANNOUNCEMENT ROUTES =====
// GET /api/announcements/public - Get public announcements for homepage
router.get('/public', getPublicAnnouncements);

// GET /api/announcements/dashboard - Get dashboard announcements for student/parent
router.get('/dashboard', getDashboardAnnouncements);

// GET /api/announcements/:id - Get single announcement by ID
router.get('/:id', getAnnouncementById);

// ===== ADMIN ANNOUNCEMENT ROUTES =====
// POST /api/announcements/create - Create new announcement (Admin only)
router.post('/create', verifyAdminToken, createAnnouncement);

// GET /api/announcements/admin/all - Get all announcements with filters (Admin only)
router.get('/admin/all', verifyAdminToken, getAllAnnouncements);

// GET /api/announcements/admin/stats - Get announcement statistics (Admin only)
router.get('/admin/stats', verifyAdminToken, getAnnouncementStats);

// DELETE /api/announcements/admin/:id - Delete announcement (Admin only)
router.delete('/admin/:id', verifyAdminToken, deleteAnnouncement);

export default router; 