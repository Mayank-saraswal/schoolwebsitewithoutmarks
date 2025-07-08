import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuditLogger from '../utils/auditLogger.js';

// Preset admin credentials (from environment variables for security)
const ADMIN_CREDENTIALS = {
  adminId: process.env.ADMIN_EMAIL || 'admin@saraswatischool.com',
  password: process.env.ADMIN_PASSWORD || 'SaraswatiAdmin2025!', // This will be hashed
  name: 'Administrator',
  role: 'admin'
};

// Hash the password (run this once to get the hash)
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// In production, you would store this hashed password in database
// For now, we'll hash it on the fly for demonstration
let hashedAdminPassword = null;

// Initialize hashed password
const initializeAdminPassword = async () => {
  if (!hashedAdminPassword) {
    hashedAdminPassword = await hashPassword(ADMIN_CREDENTIALS.password);
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Validate input
    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        message: 'व्यवस्थापक आईडी और पासवर्ड आवश्यक हैं / Admin ID and password are required'
      });
    }

    // Initialize hashed password if not done
    await initializeAdminPassword();

    // Check admin ID
    if (adminId.toLowerCase() !== ADMIN_CREDENTIALS.adminId.toLowerCase()) {
      // Log failed login attempt
      await AuditLogger.logLogin(req, false);
      
      return res.status(401).json({
        success: false,
        message: 'गलत व्यवस्थापक आईडी या पासवर्ड / Invalid admin ID or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, hashedAdminPassword);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await AuditLogger.logLogin(req, false);
      
      return res.status(401).json({
        success: false,
        message: 'गलत व्यवस्थापक आईडी या पासवर्ड / Invalid admin ID or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: ADMIN_CREDENTIALS.adminId,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        type: 'admin'
      },
      process.env.JWT_SECRET || 'saraswatiSchoolAdminSecret2025',
      {
        expiresIn: '24h' // Token expires in 24 hours
      }
    );

    // Set token in HTTP-only cookie for security
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Log successful login
    await AuditLogger.logLogin(req, true);

    res.status(200).json({
      success: true,
      message: 'सफलतापूर्वक लॉगिन हुए / Successfully logged in',
      data: {
        admin: {
          adminId: ADMIN_CREDENTIALS.adminId,
          name: ADMIN_CREDENTIALS.name,
          role: ADMIN_CREDENTIALS.role
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'लॉगिन में त्रुटि / Login error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin logout
export const adminLogout = async (req, res) => {
  try {
    // Log logout before clearing token
    await AuditLogger.logLogout(req);
    
    // Clear the admin token cookie
    res.clearCookie('adminToken');

    res.status(200).json({
      success: true,
      message: 'सफलतापूर्वक लॉगआउट हुए / Successfully logged out'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'लॉगआउट में त्रुटि / Logout error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify admin token and get admin info
export const verifyAdminToken = async (req, res) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'कोई टोकन नहीं मिला / No token found'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'saraswatiSchoolAdminSecret2025');

    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'अमान्य टोकन प्रकार / Invalid token type'
      });
    }

    res.status(200).json({
      success: true,
      message: 'टोकन सत्यापित / Token verified',
      data: {
        admin: {
          adminId: decoded.adminId,
          name: decoded.name,
          role: decoded.role
        }
      }
    });

  } catch (error) {
    console.error('Admin token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'अमान्य टोकन / Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'टोकन समाप्त हो गया / Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'टोकन सत्यापन में त्रुटि / Token verification error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get admin credentials info (for development/testing)
export const getAdminCredentials = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      message: 'Not available in production'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Admin credentials (development only)',
    data: {
      adminId: ADMIN_CREDENTIALS.adminId,
      password: ADMIN_CREDENTIALS.password,
      note: 'Use these credentials to login as admin'
    }
  });
};

// Teacher Management Functions for Admin

// @desc    Get all teacher requests (pending, approved, rejected)
// @route   GET /api/admin/teacher-requests
// @access  Private (Admin only)
export const getTeacherRequests = async (req, res) => {
  try {
    const Teacher = (await import('../models/Teacher.js')).default;
    
    const {
      page = 1,
      limit = 20,
      status = 'all',
      medium,
      search
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by status
    if (status === 'pending') {
      query.isApproved = false;
      query.isRejected = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'rejected') {
      query.isRejected = true;
    }
    
    // Filter by medium
    if (medium && medium !== 'all') {
      query.medium = medium;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Teacher.countDocuments(query);

    // Get statistics
    const stats = await Teacher.getStats();

    res.status(200).json({
      success: true,
      data: teachers,
      stats: stats[0] || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        english: 0,
        hindi: 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get teacher requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Approve teacher request
// @route   PATCH /api/admin/approve-teacher/:id
// @access  Private (Admin only)
export const approveTeacher = async (req, res) => {
  try {
    const Teacher = (await import('../models/Teacher.js')).default;
    const { id } = req.params;

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (teacher.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already approved'
      });
    }

    // Approve teacher
    teacher.isApproved = true;
    teacher.isRejected = false;
    teacher.approvedBy = req.admin.adminId;
    teacher.approvedAt = new Date();
    teacher.rejectedAt = null;
    teacher.rejectionReason = null;

    await teacher.save();

    // Log teacher approval
    await AuditLogger.logTeacherAction(
      '✅ Teacher Approved',
      {
        teacherId: teacher.teacherId,
        teacherName: teacher.fullName,
        medium: teacher.medium,
        classTeacherOf: teacher.classTeacherOf,
        approvedAt: teacher.approvedAt
      },
      req,
      { severity: 'medium' }
    );

    res.status(200).json({
      success: true,
      message: `Teacher ${teacher.fullName} has been approved successfully`,
      data: teacher.getProfileData()
    });

  } catch (error) {
    console.error('Approve teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Reject teacher request
// @route   PATCH /api/admin/reject-teacher/:id
// @access  Private (Admin only)
export const rejectTeacher = async (req, res) => {
  try {
    const Teacher = (await import('../models/Teacher.js')).default;
    const { id } = req.params;
    const { reason } = req.body;

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (teacher.isRejected) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is already rejected'
      });
    }

    // Reject teacher
    teacher.isApproved = false;
    teacher.isRejected = true;
    teacher.rejectedBy = req.admin.adminId;
    teacher.rejectedAt = new Date();
    teacher.rejectionReason = reason || 'No reason provided';
    teacher.approvedAt = null;

    await teacher.save();

    // Log teacher rejection
    await AuditLogger.logTeacherAction(
      '❌ Teacher Rejected',
      {
        teacherId: teacher.teacherId,
        teacherName: teacher.fullName,
        medium: teacher.medium,
        classTeacherOf: teacher.classTeacherOf,
        rejectionReason: teacher.rejectionReason,
        rejectedAt: teacher.rejectedAt
      },
      req,
      { severity: 'medium' }
    );

    res.status(200).json({
      success: true,
      message: `Teacher ${teacher.fullName} has been rejected`,
      data: {
        teacherId: teacher.teacherId,
        fullName: teacher.fullName,
        rejectionReason: teacher.rejectionReason,
        rejectedAt: teacher.rejectedAt
      }
    });

  } catch (error) {
    console.error('Reject teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Utility function to generate new admin credentials (for setup)
export const generateAdminCredentials = async () => {
  const adminId = 'admin@saraswatischool.com';
  const password = 'SaraswatiAdmin2025!';
  const hashedPassword = await hashPassword(password);
  
  return {
    adminId,
    password,
    hashedPassword,
    name: 'Saraswati School Admin',
    role: 'admin'
  };
}; 