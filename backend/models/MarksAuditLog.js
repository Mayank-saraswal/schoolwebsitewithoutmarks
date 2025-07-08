import mongoose from 'mongoose';

const marksAuditLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  srNumber: {
    type: String,
    required: [true, 'SR Number is required'],
    trim: true,
    uppercase: true
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: {
      values: ['1st Test', '2nd Test', 'Half-Yearly', '3rd Test', 'Yearly', 'Pre-Board', 'Final'],
      message: 'Please select a valid exam type'
    }
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: {
      values: ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH'],
      message: 'Invalid action type'
    }
  },
  changes: {
    type: String,
    enum: ['FULL_RECORD', 'SUBJECT_MARKS', 'REMARKS', 'PUBLICATION_STATUS'],
    default: 'FULL_RECORD'
  },
  subjectChanges: [{
    subject: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    previousMarks: {
      obtained: { type: Number },
      maxMarks: { type: Number },
      percentage: { type: Number },
      grade: { type: String }
    },
    newMarks: {
      obtained: { type: Number },
      maxMarks: { type: Number },
      percentage: { type: Number },
      grade: { type: String }
    },
    changeReason: {
      type: String,
      maxlength: [200, 'Change reason cannot exceed 200 characters'],
      default: ''
    }
  }],
  previousData: {
    totalObtained: { type: Number },
    totalMaxMarks: { type: Number },
    overallPercentage: { type: Number },
    overallGrade: { type: String },
    result: { type: String },
    remarks: { type: String },
    isPublished: { type: Boolean }
  },
  newData: {
    totalObtained: { type: Number },
    totalMaxMarks: { type: Number },
    overallPercentage: { type: Number },
    overallGrade: { type: String },
    result: { type: String },
    remarks: { type: String },
    isPublished: { type: Boolean }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'updatedByModel',
    required: [true, 'Updated by is required']
  },
  updatedByModel: {
    type: String,
    required: [true, 'Updated by model is required'],
    enum: ['Teacher', 'Admin']
  },
  updatedByName: {
    type: String,
    required: [true, 'Updated by name is required']
  },
  updatedByRole: {
    type: String,
    required: [true, 'Updated by role is required'],
    enum: ['Teacher', 'Admin']
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  changeReason: {
    type: String,
    maxlength: [500, 'Change reason cannot exceed 500 characters'],
    default: ''
  },
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance and queries
marksAuditLogSchema.index({ studentId: 1, examType: 1 });
marksAuditLogSchema.index({ updatedBy: 1, updatedByModel: 1 });
marksAuditLogSchema.index({ createdAt: -1 });
marksAuditLogSchema.index({ class: 1, examType: 1 });
marksAuditLogSchema.index({ action: 1 });
marksAuditLogSchema.index({ academicYear: 1 });

// Static method to log marks changes
marksAuditLogSchema.statics.logMarksChange = async function(options) {
  const {
    studentId,
    studentName,
    srNumber,
    className,
    examType,
    action,
    changes = 'FULL_RECORD',
    subjectChanges = [],
    previousData = {},
    newData = {},
    updatedBy,
    updatedByModel,
    updatedByName,
    updatedByRole,
    changeReason = '',
    ipAddress = '',
    userAgent = '',
    isSystemGenerated = false,
    academicYear = new Date().getFullYear().toString()
  } = options;

  try {
    const auditLog = new this({
      studentId,
      studentName,
      srNumber,
      class: className,
      examType,
      action,
      changes,
      subjectChanges,
      previousData,
      newData,
      updatedBy,
      updatedByModel,
      updatedByName,
      updatedByRole,
      changeReason,
      ipAddress,
      userAgent,
      isSystemGenerated,
      academicYear
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error logging marks change:', error);
    throw error;
  }
};

// Static method to get audit history for a student
marksAuditLogSchema.statics.getStudentAuditHistory = async function(studentId, examType = null, limit = 50) {
  const query = { studentId };
  if (examType) {
    query.examType = examType;
  }

  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('updatedBy', 'fullName email')
    .select('-userAgent -ipAddress');
};

// Static method to get audit history by teacher
marksAuditLogSchema.statics.getTeacherAuditHistory = async function(teacherId, limit = 100) {
  return await this.find({
    updatedBy: teacherId,
    updatedByModel: 'Teacher'
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('studentId', 'studentName srNumber class')
    .select('-userAgent -ipAddress');
};

// Static method to get recent changes for admin dashboard
marksAuditLogSchema.statics.getRecentChanges = async function(limit = 20, className = null) {
  const query = {};
  if (className) {
    query.class = className;
  }

  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('updatedBy', 'fullName email')
    .select('-userAgent -ipAddress');
};

// Static method to get audit statistics
marksAuditLogSchema.statics.getAuditStats = async function(startDate = null, endDate = null) {
  const query = {};
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalChanges: { $sum: 1 },
        createActions: { $sum: { $cond: [{ $eq: ['$action', 'CREATE'] }, 1, 0] } },
        updateActions: { $sum: { $cond: [{ $eq: ['$action', 'UPDATE'] }, 1, 0] } },
        deleteActions: { $sum: { $cond: [{ $eq: ['$action', 'DELETE'] }, 1, 0] } },
        teacherChanges: { $sum: { $cond: [{ $eq: ['$updatedByRole', 'Teacher'] }, 1, 0] } },
        adminChanges: { $sum: { $cond: [{ $eq: ['$updatedByRole', 'Admin'] }, 1, 0] } },
        systemChanges: { $sum: { $cond: ['$isSystemGenerated', 1, 0] } }
      }
    }
  ]);
};

// Instance method to get formatted audit entry
marksAuditLogSchema.methods.getFormattedEntry = function() {
  return {
    _id: this._id,
    studentName: this.studentName,
    srNumber: this.srNumber,
    class: this.class,
    examType: this.examType,
    action: this.action,
    changes: this.changes,
    subjectChanges: this.subjectChanges,
    updatedByName: this.updatedByName,
    updatedByRole: this.updatedByRole,
    changeReason: this.changeReason,
    timestamp: this.createdAt,
    isSystemGenerated: this.isSystemGenerated
  };
};

// Instance method to get change summary
marksAuditLogSchema.methods.getChangeSummary = function() {
  let summary = `${this.action} by ${this.updatedByName} (${this.updatedByRole})`;
  
  if (this.subjectChanges.length > 0) {
    const changedSubjects = this.subjectChanges.map(change => change.subject).join(', ');
    summary += ` - Subjects: ${changedSubjects}`;
  }
  
  if (this.changeReason) {
    summary += ` - Reason: ${this.changeReason}`;
  }
  
  return summary;
};

const MarksAuditLog = mongoose.model('MarksAuditLog', marksAuditLogSchema);

export default MarksAuditLog; 