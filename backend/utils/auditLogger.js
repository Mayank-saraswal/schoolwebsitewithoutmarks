import AuditLog from '../models/AuditLog.js';

// Audit logging utility
class AuditLogger {
  
  // Helper to extract request information
  static getRequestInfo(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
      adminId: req.admin?.adminId || req.teacher?.id || 'admin@saraswatischool',
      adminName: req.admin?.name || req.teacher?.fullName || 'Administrator'
    };
  }

  // Generic audit log function
  static async log(action, data, category, req, options = {}) {
    try {
      const requestInfo = this.getRequestInfo(req);
      
      const auditData = {
        action,
        data: this.sanitizeData(data),
        category,
        status: options.status || 'success',
        severity: options.severity || 'medium',
        medium: options.medium || req.query?.medium || req.body?.medium,
        year: options.year || req.query?.year || req.body?.year,
        ...requestInfo
      };

      await AuditLog.logAction(auditData);
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to prevent breaking main operations
    }
  }

  // Sanitize sensitive data before logging
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'private'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Limit data size
    const dataStr = JSON.stringify(sanitized);
    if (dataStr.length > 5000) {
      return {
        ...sanitized,
        _truncated: true,
        _originalLength: dataStr.length
      };
    }

    return sanitized;
  }

  // Student-related audit logs
  static async logStudentAction(action, data, req, options = {}) {
    await this.log(action, data, 'Student', req, options);
  }

  // Teacher-related audit logs
  static async logTeacherAction(action, data, req, options = {}) {
    await this.log(action, data, 'Teacher', req, options);
  }

  // Admission-related audit logs
  static async logAdmissionAction(action, data, req, options = {}) {
    await this.log(action, data, 'Admission', req, options);
  }

  // Fee-related audit logs
  static async logFeeAction(action, data, req, options = {}) {
    await this.log(action, data, 'Fee', req, { severity: 'high', ...options });
  }

  // Announcement-related audit logs
  static async logAnnouncementAction(action, data, req, options = {}) {
    await this.log(action, data, 'Announcement', req, options);
  }

  // Exam-related audit logs
  static async logExamAction(action, data, req, options = {}) {
    await this.log(action, data, 'ExamType', req, options);
  }

  // System-related audit logs
  static async logSystemAction(action, data, req, options = {}) {
    await this.log(action, data, 'System', req, { severity: 'critical', ...options });
  }

  // Success logging with standard messages
  static async logSuccess(action, data, category, req, options = {}) {
    await this.log(`✅ ${action}`, data, category, req, { status: 'success', ...options });
  }

  // Error logging with standard messages
  static async logError(action, data, category, req, error, options = {}) {
    const errorData = {
      ...data,
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
    
    await this.log(`❌ ${action}`, errorData, category, req, { 
      status: 'failed', 
      severity: 'high',
      ...options 
    });
  }

  // Pre-defined common audit actions
  static async logLogin(req, success = true) {
    const action = success ? '✅ Admin Login Successful' : '❌ Admin Login Failed';
    const data = {
      adminId: req.body?.adminId,
      timestamp: new Date(),
      success
    };
    
    await this.log(action, data, 'System', req, { 
      status: success ? 'success' : 'failed',
      severity: success ? 'medium' : 'high'
    });
  }

  static async logLogout(req) {
    await this.log('🚪 Admin Logout', { timestamp: new Date() }, 'System', req, {
      severity: 'low'
    });
  }

  static async logDataExport(req, dataType, recordCount) {
    await this.log(`📊 Data Export - ${dataType}`, {
      dataType,
      recordCount,
      medium: req.query?.medium,
      year: req.query?.year,
      timestamp: new Date()
    }, 'System', req, { severity: 'medium' });
  }

  static async logBulkOperation(req, operation, affectedCount, category) {
    await this.log(`🔄 Bulk ${operation}`, {
      operation,
      affectedCount,
      timestamp: new Date()
    }, category, req, { severity: 'high' });
  }

  // Middleware for automatic logging
  static middleware(action, category, options = {}) {
    return async (req, res, next) => {
      // Store original send function
      const originalSend = res.send;
      
      // Override send to capture response
      res.send = function(body) {
        // Log the action
        const status = res.statusCode >= 400 ? 'failed' : 'success';
        const severity = res.statusCode >= 500 ? 'critical' : 
                        res.statusCode >= 400 ? 'high' : 'medium';
        
        AuditLogger.log(action, {
          requestBody: req.body,
          requestQuery: req.query,
          responseStatus: res.statusCode,
          timestamp: new Date()
        }, category, req, { status, severity, ...options }).catch(console.error);
        
        // Call original send
        originalSend.call(this, body);
      };
      
      next();
    };
  }
}

export default AuditLogger; 