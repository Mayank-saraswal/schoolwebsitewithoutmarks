import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuditLogger from '../utils/auditLogger.js';

// Preset admin credentials (from environment variables for security)
const ADMIN_CREDENTIALS = {
  adminId: process.env.ADMIN_EMAIL || 'mayanksaraswal@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'HelloAdmin', // This will be hashed
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

// Admin-only authentication - no teacher functionality needed

// Utility function to generate new admin credentials (for setup)
export const generateAdminCredentials = async () => {
  const adminId = 'mayanksaraswal@gmail.com';
  const password = 'HelloAdmin';
  const hashedPassword = await hashPassword(password);
  
  return {
    adminId,
    password,
    hashedPassword,
    name: 'Saraswati School Admin',
    role: 'admin'
  };
}; 