import mongoose from 'mongoose';

const examTypeSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    enum: ['Hindi', 'English'],
    trim: true
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    trim: true
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be greater than 0']
  },
  year: {
    type: Number,
    required: [true, 'Academic year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
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

// Compound index to ensure unique exam type per class/medium/year combination
examTypeSchema.index({ 
  class: 1, 
  medium: 1, 
  examType: 1, 
  year: 1 
}, { unique: true });

// Update the updatedAt field before saving
examTypeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get exam types by filters
examTypeSchema.statics.getByFilters = function(filters) {
  return this.find(filters).sort({ examType: 1 });
};

// Instance method to check if exam type already exists
examTypeSchema.methods.isDuplicate = async function() {
  const existing = await this.constructor.findOne({
    class: this.class,
    medium: this.medium,
    examType: this.examType,
    year: this.year,
    _id: { $ne: this._id }
  });
  return !!existing;
};

const ExamType = mongoose.model('ExamType', examTypeSchema);

export default ExamType; 