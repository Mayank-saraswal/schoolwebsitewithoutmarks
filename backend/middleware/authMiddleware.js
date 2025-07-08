import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'पहुंच अस्वीकृत। कोई टोकन प्रदान नहीं किया गया। / Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'saraswatiSchoolAdminSecret2025';
    const decoded = jwt.verify(token, jwtSecret);

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'अमान्य टोकन प्रकार / Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    req.admin = {
      adminId: decoded.adminId,
      role: decoded.role || 'admin',
      name: decoded.name,
      type: decoded.type
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'टोकन समाप्त हो गया। कृपया दोबारा लॉगिन करें / Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'अमान्य टोकन। कृपया दोबारा लॉगिन करें / Invalid token. Please login again.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to verify JWT token for teacher routes
export const verifyTeacherToken = (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.teacherToken) {
      token = req.cookies.teacherToken;
    } else if (req.cookies && req.cookies.adminToken) {
      // Allow admin tokens for admin-only routes like announcements
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'पहुंच अस्वीकृत। कोई टोकन प्रदान नहीं किया गया। / Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'saraswatiSchoolAdminSecret2025';
    const decoded = jwt.verify(token, jwtSecret);

    // Handle both teacher and admin tokens
    if (decoded.type === 'admin') {
      req.teacher = {
        id: decoded.adminId,
        _id: decoded.adminId,
        name: decoded.name,
        role: decoded.role || 'admin',
        type: decoded.type
      };
    } else if (decoded.type === 'teacher') {
      // Ensure we have a valid teacher ID
      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid teacher token: missing ID / अमान्य शिक्षक टोकन: आईडी गुम',
          code: 'INVALID_TOKEN'
        });
      }

      req.teacher = {
        id: decoded.id,
        _id: decoded.id,
        teacherId: decoded.teacherId,
        fullName: decoded.fullName,
        mobile: decoded.mobile,
        classTeacherOf: decoded.classTeacherOf,
        medium: decoded.medium,
        type: decoded.type
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'अमान्य टोकन प्रकार / Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'टोकन समाप्त हो गया। कृपया दोबारा लॉगिन करें / Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'अमान्य टोकन। कृपया दोबारा लॉगिन करें / Invalid token. Please login again.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to verify JWT token for parent routes
export const verifyParentToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'पहुंच अस्वीकृत। कृपया लॉगिन करें / Access denied. Please login.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = 'saraswati-school-parent-secret';
    const decoded = jwt.verify(token, jwtSecret);

    // Verify this is a parent token
    if (decoded.type !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'पहुंच अस्वीकृत। केवल अभिभावक का एक्सेस आवश्यक / Access denied. Parent access required.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    req.parent = {
      parentMobile: decoded.parentMobile,
      studentIds: decoded.studentIds.map(id => id.toString()),
      type: decoded.type
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'टोकन की अवधि समाप्त हो गई। कृपया दोबारा लॉगिन करें / Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'अमान्य टोकन। कृपया दोबारा लॉगिन करें / Invalid token. Please login again.',
      code: 'INVALID_TOKEN'
    });
  }
}; 