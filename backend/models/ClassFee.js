import mongoose from 'mongoose';

const classFeeSchema = new mongoose.Schema({
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
  feeStructure: {
    admissionFee: {
      type: Number,
      required: [true, 'Admission fee is required'],
      min: [0, 'Admission fee cannot be negative'],
      default: 0
    },
    tuitionFee: {
      type: Number,
      required: [true, 'Tuition fee is required'],
      min: [0, 'Tuition fee cannot be negative']
    },
    examFee: {
      type: Number,
      default: 0,
      min: [0, 'Exam fee cannot be negative']
    },
    bookFee: {
      type: Number,
      default: 0,
      min: [0, 'Book fee cannot be negative']
    },
    uniformFee: {
      type: Number,
      default: 0,
      min: [0, 'Uniform fee cannot be negative']
    },
    activityFee: {
      type: Number,
      default: 0,
      min: [0, 'Activity fee cannot be negative']
    },
    developmentFee: {
      type: Number,
      default: 0,
      min: [0, 'Development fee cannot be negative']
    },
    otherFee: {
      type: Number,
      default: 0,
      min: [0, 'Other fee cannot be negative']
    }
  },
  totalFee: {
    type: Number,
    default: function() {
      const fees = this.feeStructure;
      return fees.admissionFee + fees.tuitionFee + fees.examFee + 
             fees.bookFee + fees.uniformFee + fees.activityFee + 
             fees.developmentFee + fees.otherFee;
    }
  },
  paymentSchedule: {
    type: String,
    enum: ['Annual', 'Quarterly', 'Monthly'],
    default: 'Annual'
  },
  installments: [{
    name: {
      type: String,
      required: true // e.g., "1st Quarter", "April", etc.
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Installment amount cannot be negative']
    },
    dueDate: {
      type: String,
      required: true // e.g., "15th of each month"
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  lastUpdatedBy: {
    type: String,
    default: 'Admin'
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

// Compound index to ensure unique class-medium-year combination
classFeeSchema.index({ class: 1, medium: 1, academicYear: 1 }, { unique: true });

// Regular indexes for performance
classFeeSchema.index({ class: 1 });
classFeeSchema.index({ medium: 1 });
classFeeSchema.index({ isActive: 1 });
classFeeSchema.index({ academicYear: 1 });

// Pre-save middleware to calculate total fee
classFeeSchema.pre('save', function(next) {
  const fees = this.feeStructure;
  this.totalFee = fees.admissionFee + fees.tuitionFee + fees.examFee + 
                  fees.bookFee + fees.uniformFee + fees.activityFee + 
                  fees.developmentFee + fees.otherFee;
  next();
});

// Static method to get fee for a specific class and medium
classFeeSchema.statics.getFeeForClass = async function(className, medium, academicYear = null) {
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
  
  const result = await this.findOne(query);
  return result ? result.totalFee : 0;
};

// Static method to get complete fee structure for a class
classFeeSchema.statics.getFeeStructureForClass = async function(className, medium, academicYear = null) {
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
  
  return await this.findOne(query);
};

// Static method to get all fees by medium
classFeeSchema.statics.getFeesByMedium = async function(medium, academicYear = null) {
  const query = {
    medium: medium,
    isActive: true
  };
  
  if (academicYear) {
    query.academicYear = academicYear;
  } else {
    query.academicYear = new Date().getFullYear().toString();
  }
  
  return await this.find(query).sort({ class: 1 });
};

// Instance method to get fee breakdown
classFeeSchema.methods.getFeeBreakdown = function() {
  return {
    class: this.class,
    medium: this.medium,
    totalFee: this.totalFee,
    breakdown: this.feeStructure,
    paymentSchedule: this.paymentSchedule,
    installments: this.installments,
    academicYear: this.academicYear
  };
};

const ClassFee = mongoose.model('ClassFee', classFeeSchema);

export default ClassFee; 