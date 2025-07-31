import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
    default: 'success'
  },
  adminId: {
    type: String,
    default: 'admin@saraswatischool'
  },
  adminName: {
    type: String,
    default: 'Administrator'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  medium: {
    type: String,
    enum: ['Hindi', 'English'],
    required: false
  },
  year: {
    type: Number,
    required: false,
    min: 2020,
    max: 2030
  },
  category: {
    type: String,
    enum: ['Student', 'Admission', 'Fee', 'Announcement', 'System'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ category: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ medium: 1, year: 1 });
auditLogSchema.index({ adminId: 1 });

// Static method to create audit log
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const {
      action,
      data,
      status = 'success',
      adminId = 'admin@excellenceschool',
      adminName = 'Administrator',
      ipAddress = 'Unknown',
      userAgent = 'Unknown',
      medium,
      year,
      category,
      severity = 'medium'
    } = actionData;

    const auditLog = new this({
      action,
      data,
      status,
      adminId,
      adminName,
      ipAddress,
      userAgent,
      medium,
      year,
      category,
      severity,
      timestamp: new Date()
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent breaking main operations
    return null;
  }
};

// Static method to get logs with filters
auditLogSchema.statics.getFilteredLogs = async function(filters = {}) {
  const {
    action,
    category,
    status,
    dateFrom,
    dateTo,
    medium,
    year,
    page = 1,
    limit = 50
  } = filters;

  // Build query
  const query = {};
  
  if (action) {
    query.action = new RegExp(action, 'i');
  }
  
  if (category) {
    query.category = category;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (medium) {
    query.medium = medium;
  }
  
  if (year) {
    query.year = parseInt(year);
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.timestamp = {};
    if (dateFrom) {
      query.timestamp.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.timestamp.$lte = new Date(dateTo);
    }
  }

  // Execute query with pagination
  const logs = await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    logs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
      limit: parseInt(limit)
    }
  };
};

// Static method to get audit statistics
auditLogSchema.statics.getAuditStats = async function(filters = {}) {
  const { medium, year, days = 30 } = filters;
  
  // Build match query
  const matchQuery = {
    timestamp: {
      $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }
  };
  
  if (medium) matchQuery.medium = medium;
  if (year) matchQuery.year = parseInt(year);

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        },
        bySeverity: {
          $push: {
            severity: '$severity',
            count: 1
          }
        }
      }
    }
  ]);

  // Get category breakdown
  const categoryStats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    summary: stats[0] || {
      total: 0,
      successful: 0,
      failed: 0
    },
    byCategory: categoryStats,
    timeRange: `Last ${days} days`
  };
};

// Instance method to get formatted data
auditLogSchema.methods.getFormattedData = function() {
  return {
    id: this._id,
    action: this.action,
    data: this.data,
    timestamp: this.timestamp,
    status: this.status,
    adminId: this.adminId,
    adminName: this.adminName,
    category: this.category,
    severity: this.severity,
    medium: this.medium,
    year: this.year,
    formattedTime: this.timestamp.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    dataPreview: typeof this.data === 'object' 
      ? JSON.stringify(this.data).substring(0, 100) + '...'
      : String(this.data).substring(0, 100)
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog; 