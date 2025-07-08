import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema({
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
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: {
      values: ['1st Test', '2nd Test', 'Half-Yearly', '3rd Test', 'Yearly', 'Pre-Board', 'Final'],
      message: 'Please select a valid exam type'
    }
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  marks: [{
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true
    },
    obtained: {
      type: Number,
      required: [true, 'Obtained marks is required'],
      min: [0, 'Obtained marks cannot be negative']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1']
    },
    percentage: {
      type: Number,
      default: function() {
        return this.maxMarks > 0 ? Math.round((this.obtained / this.maxMarks) * 100) : 0;
      }
    },
    grade: {
      type: String,
      default: function() {
        const percentage = this.maxMarks > 0 ? (this.obtained / this.maxMarks) * 100 : 0;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        if (percentage >= 35) return 'D';
        return 'F';
      }
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      default: function() {
        const percentage = this.maxMarks > 0 ? (this.obtained / this.maxMarks) * 100 : 0;
        return percentage >= 35 ? 'Pass' : 'Fail';
      }
    }
  }],
  totalObtained: {
    type: Number,
    default: function() {
      return this.marks.reduce((total, mark) => total + mark.obtained, 0);
    }
  },
  totalMaxMarks: {
    type: Number,
    default: function() {
      return this.marks.reduce((total, mark) => total + mark.maxMarks, 0);
    }
  },
  overallPercentage: {
    type: Number,
    default: function() {
      const total = this.totalMaxMarks || 0;
      return total > 0 ? Math.round((this.totalObtained / total) * 100) : 0;
    }
  },
  overallGrade: {
    type: String,
    default: function() {
      const percentage = this.overallPercentage || 0;
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C+';
      if (percentage >= 40) return 'C';
      if (percentage >= 35) return 'D';
      return 'F';
    }
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Compartment'],
    default: function() {
      const failedSubjects = this.marks.filter(mark => mark.status === 'Fail').length;
      if (failedSubjects === 0) return 'Pass';
      if (failedSubjects <= 2) return 'Compartment';
      return 'Fail';
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Uploaded by teacher is required']
  },
  uploadedByName: {
    type: String,
    required: [true, 'Teacher name is required']
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  lastUpdatedByName: {
    type: String
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true // Parents can see by default
  },
  publishedAt: {
    type: Date,
    default: Date.now
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

// Compound index to prevent duplicate entries for same student and exam
marksSchema.index({ studentId: 1, examType: 1, academicYear: 1 }, { unique: true });

// Other indexes for performance
marksSchema.index({ class: 1, examType: 1 });
marksSchema.index({ uploadedBy: 1 });
marksSchema.index({ academicYear: 1 });
marksSchema.index({ 'marks.subject': 1 });
marksSchema.index({ isPublished: 1 });

// Pre-save middleware to calculate totals and grades
marksSchema.pre('save', function(next) {
  // Calculate individual subject percentages and grades
  this.marks.forEach(mark => {
    mark.percentage = mark.maxMarks > 0 ? Math.round((mark.obtained / mark.maxMarks) * 100) : 0;
    
    const percentage = mark.percentage;
    if (percentage >= 90) mark.grade = 'A+';
    else if (percentage >= 80) mark.grade = 'A';
    else if (percentage >= 70) mark.grade = 'B+';
    else if (percentage >= 60) mark.grade = 'B';
    else if (percentage >= 50) mark.grade = 'C+';
    else if (percentage >= 40) mark.grade = 'C';
    else if (percentage >= 35) mark.grade = 'D';
    else mark.grade = 'F';
    
    mark.status = percentage >= 35 ? 'Pass' : 'Fail';
  });
  
  // Calculate totals
  this.totalObtained = this.marks.reduce((total, mark) => total + mark.obtained, 0);
  this.totalMaxMarks = this.marks.reduce((total, mark) => total + mark.maxMarks, 0);
  this.overallPercentage = this.totalMaxMarks > 0 ? Math.round((this.totalObtained / this.totalMaxMarks) * 100) : 0;
  
  // Calculate overall grade
  const percentage = this.overallPercentage;
  if (percentage >= 90) this.overallGrade = 'A+';
  else if (percentage >= 80) this.overallGrade = 'A';
  else if (percentage >= 70) this.overallGrade = 'B+';
  else if (percentage >= 60) this.overallGrade = 'B';
  else if (percentage >= 50) this.overallGrade = 'C+';
  else if (percentage >= 40) this.overallGrade = 'C';
  else if (percentage >= 35) this.overallGrade = 'D';
  else this.overallGrade = 'F';
  
  // Calculate result
  const failedSubjects = this.marks.filter(mark => mark.status === 'Fail').length;
  if (failedSubjects === 0) this.result = 'Pass';
  else if (failedSubjects <= 2) this.result = 'Compartment';
  else this.result = 'Fail';
  
  next();
});

// Static method to get marks statistics
marksSchema.statics.getStats = async function(filters = {}) {
  return await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        averagePercentage: { $avg: '$overallPercentage' },
        passCount: { $sum: { $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0] } },
        failCount: { $sum: { $cond: [{ $eq: ['$result', 'Fail'] }, 1, 0] } },
        compartmentCount: { $sum: { $cond: [{ $eq: ['$result', 'Compartment'] }, 1, 0] } },
        highestPercentage: { $max: '$overallPercentage' },
        lowestPercentage: { $min: '$overallPercentage' }
      }
    }
  ]);
};

// Static method to get class-wise performance
marksSchema.statics.getClassPerformance = async function(className, examType, academicYear = null) {
  const query = { class: className, examType };
  if (academicYear) query.academicYear = academicYear;
  
  return await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$class',
        totalStudents: { $sum: 1 },
        averagePercentage: { $avg: '$overallPercentage' },
        passCount: { $sum: { $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0] } },
        failCount: { $sum: { $cond: [{ $eq: ['$result', 'Fail'] }, 1, 0] } },
        topPerformers: {
          $push: {
            $cond: [
              { $gte: ['$overallPercentage', 80] },
              { name: '$studentName', percentage: '$overallPercentage', srNumber: '$srNumber' },
              null
            ]
          }
        }
      }
    }
  ]);
};

// Instance method to get formatted result
marksSchema.methods.getFormattedResult = function() {
  return {
    _id: this._id,
    studentName: this.studentName,
    srNumber: this.srNumber,
    class: this.class,
    medium: this.medium,
    examType: this.examType,
    academicYear: this.academicYear,
    marks: this.marks,
    totalObtained: this.totalObtained,
    totalMaxMarks: this.totalMaxMarks,
    overallPercentage: this.overallPercentage,
    overallGrade: this.overallGrade,
    result: this.result,
    uploadedByName: this.uploadedByName,
    publishedAt: this.publishedAt,
    remarks: this.remarks,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Instance method to check if student passed
marksSchema.methods.isPassed = function() {
  return this.result === 'Pass';
};

// Instance method to get failed subjects
marksSchema.methods.getFailedSubjects = function() {
  return this.marks.filter(mark => mark.status === 'Fail');
};

const Marks = mongoose.model('Marks', marksSchema);

export default Marks; 