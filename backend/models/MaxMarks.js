import mongoose from 'mongoose';

const maxMarksSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamType',
    required: [true, 'Exam ID is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: {
      values: [
        'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
        'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
        'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
        'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
      ],
      message: 'Please select a valid class'
    }
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    enum: {
      values: ['English', 'Hindi'],
      message: 'Medium must be either English or Hindi'
    }
  },
  subjects: [{
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1'],
      max: [1000, 'Maximum marks cannot exceed 1000']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Created by teacher ID is required']
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: function() { return this.createdBy; }
  },
  // Keep legacy fields for backward compatibility
  examType: {
    type: String,
    trim: true
  },
  subjectMaxMarks: [{
    subject: {
      type: String,
      trim: true
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    maxMarks: {
      type: Number,
      min: [1, 'Maximum marks must be at least 1'],
      max: [1000, 'Maximum marks cannot exceed 1000']
    },
    isTheory: {
      type: Boolean,
      default: true
    },
    isPractical: {
      type: Boolean,
      default: false
    },
    passingMarks: {
      type: Number,
      default: function() {
        return Math.ceil(this.maxMarks * 0.35); // 35% passing marks
      }
    }
  }],
  defaultMaxMarks: {
    type: Number,
    default: 100,
    min: [1, 'Default max marks must be at least 1'],
    max: [1000, 'Default max marks cannot exceed 1000']
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
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

// Compound index to ensure unique examId-class-medium combination
maxMarksSchema.index({ examId: 1, class: 1, medium: 1 }, { unique: true });

// Legacy index for backward compatibility
maxMarksSchema.index({ class: 1, medium: 1, examType: 1, academicYear: 1 });

// Other indexes for performance
maxMarksSchema.index({ class: 1, examId: 1 });
maxMarksSchema.index({ academicYear: 1 });
maxMarksSchema.index({ isActive: 1 });
maxMarksSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate passing marks
maxMarksSchema.pre('save', function(next) {
  // Update passing marks for each subject (35% of max marks)
  this.subjectMaxMarks.forEach(subject => {
    subject.passingMarks = Math.ceil(subject.maxMarks * 0.35);
  });
  
  next();
});

// Static method to get max marks for a specific class, medium, and exam type
maxMarksSchema.statics.getMaxMarksForExam = async function(className, medium, examType, academicYear = null) {
  const query = {
    class: className,
    medium: medium,
    examType: examType,
    isActive: true
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  } else {
    query.academicYear = new Date().getFullYear().toString();
  }
  
  const result = await this.findOne(query);
  return result || null;
};

// Static method to get default max marks for a class and exam type
maxMarksSchema.statics.getDefaultMaxMarks = async function(className, medium, examType, academicYear = null) {
  const config = await this.getMaxMarksForExam(className, medium, examType, academicYear);
  return config ? config.defaultMaxMarks : 100; // Default to 100 if not configured
};

// Static method to get subject-wise max marks
maxMarksSchema.statics.getSubjectMaxMarks = async function(className, medium, examType, academicYear = null) {
  const config = await this.getMaxMarksForExam(className, medium, examType, academicYear);
  
  if (config && config.subjectMaxMarks.length > 0) {
    return config.subjectMaxMarks;
  }
  
  // Return default structure if not configured
  return [];
};

// Static method to get all exam types configured for a class
maxMarksSchema.statics.getConfiguredExamTypes = async function(className, medium, academicYear = null) {
  const query = {
    class: className,
    medium: medium,
    isActive: true
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  } else {
    query.academicYear = new Date().getFullYear().toString();
  }
  
  return await this.find(query).select('examType defaultMaxMarks').sort({ examType: 1 });
};

// Instance method to get max marks for a specific subject
maxMarksSchema.methods.getSubjectMaxMarks = function(subjectName) {
  const subject = this.subjectMaxMarks.find(s => 
    s.subject.toLowerCase() === subjectName.toLowerCase() ||
    s.subjectCode.toLowerCase() === subjectName.toLowerCase()
  );
  
  return subject ? subject.maxMarks : this.defaultMaxMarks;
};

// Instance method to get passing marks for a specific subject
maxMarksSchema.methods.getSubjectPassingMarks = function(subjectName) {
  const subject = this.subjectMaxMarks.find(s => 
    s.subject.toLowerCase() === subjectName.toLowerCase() ||
    s.subjectCode.toLowerCase() === subjectName.toLowerCase()
  );
  
  return subject ? subject.passingMarks : Math.ceil(this.defaultMaxMarks * 0.35);
};

// Instance method to validate if marks are within limits
maxMarksSchema.methods.validateMarks = function(subjectName, obtainedMarks) {
  const maxMarks = this.getSubjectMaxMarks(subjectName);
  return obtainedMarks >= 0 && obtainedMarks <= maxMarks;
};

// Instance method to get exam configuration summary
maxMarksSchema.methods.getExamConfig = function() {
  return {
    _id: this._id,
    class: this.class,
    medium: this.medium,
    examType: this.examType,
    defaultMaxMarks: this.defaultMaxMarks,
    subjectMaxMarks: this.subjectMaxMarks,
    academicYear: this.academicYear,
    isActive: this.isActive,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const MaxMarks = mongoose.model('MaxMarks', maxMarksSchema);

export default MaxMarks; 