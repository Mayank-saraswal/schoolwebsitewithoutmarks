import mongoose from 'mongoose';

const examConfigSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    enum: [
      'Nursery', 'LKG', 'UKG', 
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
      'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
    ]
  },
  medium: {
    type: String,
    required: true,
    enum: ['Hindi', 'English']
  },
  academicYear: {
    type: String,
    required: true,
    default: () => new Date().getFullYear().toString()
  },
  examName: {
    type: String,
    required: true,
    enum: [
      'Unit Test 1', 'Unit Test 2', 'Unit Test 3',
      'Monthly Test', 'Weekly Test', 'Quarterly Exam',
      'Half Yearly', 'Pre-Board', 'Pre-Board 1', 'Pre-Board 2',
      'Annual Exam', 'Board Exam', '1st Test', '2nd Test', '3rd Test'
    ]
  },
  subjects: [{
    subjectName: {
      type: String,
      required: true
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    }
  }],
  totalMaxMarks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
examConfigSchema.index({ class: 1, medium: 1, academicYear: 1, examName: 1 }, { unique: true });

// Update the updatedAt field and calculate total marks before saving
examConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.totalMaxMarks = this.subjects.reduce((total, subject) => total + subject.maxMarks, 0);
  next();
});

// Static method to get exam config for a class, medium, and year
examConfigSchema.statics.getExamConfig = async function(className, medium, academicYear, examName) {
  const year = academicYear || new Date().getFullYear().toString();
  
  return await this.findOne({
    class: className,
    medium: medium,
    academicYear: year,
    examName: examName,
    isActive: true
  });
};

// Static method to get all exams for a class and medium
examConfigSchema.statics.getExamsForClass = async function(className, medium, academicYear = null) {
  const year = academicYear || new Date().getFullYear().toString();
  
  return await this.find({
    class: className,
    medium: medium,
    academicYear: year,
    isActive: true
  }).sort({ examName: 1 });
};

// Instance method to get exam summary
examConfigSchema.methods.getExamSummary = function() {
  return {
    _id: this._id,
    class: this.class,
    medium: this.medium,
    academicYear: this.academicYear,
    examName: this.examName,
    subjectCount: this.subjects.length,
    totalMaxMarks: this.totalMaxMarks,
    subjects: this.subjects,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

const ExamConfig = mongoose.model('ExamConfig', examConfigSchema);

export default ExamConfig;