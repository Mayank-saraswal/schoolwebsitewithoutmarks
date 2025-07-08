import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  className: {
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
  year: {
    type: Number,
    required: [true, 'Year is required'],
    default: function() {
      return new Date().getFullYear();
    }
  },
  subjects: [String], // Array of subject names as strings
  createdAt: {
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

// Compound index to ensure unique class-medium-year combination
subjectSchema.index({ className: 1, medium: 1, year: 1 }, { unique: true });

// Regular indexes for performance
subjectSchema.index({ className: 1 });
subjectSchema.index({ medium: 1 });

// Static method to get subjects for a specific class and medium
subjectSchema.statics.getSubjectsForClass = async function(className, medium, year = null) {
  const query = {
    className: className,
    medium: medium
  };
  
  if (year) {
    query.year = year;
  }
  
  const result = await this.findOne(query);
  return result ? result.subjects : [];
};

// Static method to get all subjects by medium
subjectSchema.statics.getSubjectsByMedium = async function(medium, year = null) {
  const query = {
    medium: medium
  };
  
  if (year) {
    query.year = year;
  }
  
  return await this.find(query).sort({ className: 1 });
};

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject; 