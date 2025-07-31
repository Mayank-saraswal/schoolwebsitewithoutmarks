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

// Admin-only authentication - no teacher functionality needed

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