import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Student name must be at least 2 characters long'],
    maxlength: [100, 'Student name cannot exceed 100 characters']
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
    minlength: [2, 'Father name must be at least 2 characters long'],
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true,
    minlength: [2, 'Mother name must be at least 2 characters long'],
    maxlength: [100, 'Mother name cannot exceed 100 characters']
  },
  srNumber: {
    type: String,
    required: [true, 'SR Number is required'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Please provide complete address (minimum 10 characters)'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    validate: {
      validator: function(code) {
        return /^\d{6}$/.test(code);
      },
      message: 'Please enter a valid 6-digit postal code'
    }
  },
  parentMobile: {
    type: String,
    required: [true, 'Parent mobile number is required'],
    validate: {
      validator: function(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(aadhar) {
        // Aadhar number: 12 digits
        return /^\d{12}$/.test(aadhar);
      },
      message: 'Please enter a valid 12-digit Aadhar number'
    }
  },
  janAadharNumber: {
    type: String,
    required: [true, 'Jan Aadhar number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(janAadhar) {
        // Jan Aadhar number: typically 10-15 characters (alphanumeric, case insensitive)
        return /^[A-Za-z0-9]{10,15}$/.test(janAadhar);
      },
      message: 'Please enter a valid Jan Aadhar number (10-15 alphanumeric characters)'
    }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 3 && age <= 18;
      },
      message: 'Student age must be between 3 and 18 years'
    }
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
  hasBus: {
    type: Boolean,
    default: false
  },
  busRoute: {
    type: String,
    required: function() {
      return this.hasBus;
    },
    default: null
  },
  classFee: {
    total: {
      type: Number,
      required: [true, 'Class fee is required'],
      min: [0, 'Class fee cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Class fee discount cannot be negative']
    },
    discountedTotal: {
      type: Number,
      default: function() {
        return Math.max(0, (this.classFee.total || 0) - (this.classFee.discount || 0));
      }
    },
    paid: {
      type: Number,
      default: 0,
      min: [0, 'Class fee paid cannot be negative']
    },
    pending: {
      type: Number,
      default: function() {
        return Math.max(0, this.classFee.discountedTotal - this.classFee.paid);
      }
    }
  },
  busFee: {
    total: {
      type: Number,
      default: 0,
      min: [0, 'Bus fee cannot be negative']
    },
    paid: {
      type: Number,
      default: 0,
      min: [0, 'Bus fee paid cannot be negative']
    },
    pending: {
      type: Number,
      default: function() {
        return this.busFee.total - this.busFee.paid;
      }
    }
  },
  totalFee: {
    type: Number,
    default: 0
  },
  totalFeePaid: {
    type: Number,
    default: 0
  },
  feeStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid'],
    default: 'Unpaid'
  },
  rollNumber: {
    type: Number,
    default: null
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    },
    validate: {
      validator: function(year) {
        const yearNum = parseInt(year);
        return !isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2030;
      },
      message: 'Academic year must be between 2020 and 2030'
    }
  },
  createdBy: {
    type: String,
    required: [true, 'Created by admin is required'],
    default: 'admin@saraswatischool'
  },
  createdByName: {
    type: String,
    required: [true, 'Created by admin name is required'],
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

// Indexes for better query performance
studentSchema.index({ srNumber: 1 });
studentSchema.index({ class: 1, medium: 1 });
studentSchema.index({ createdBy: 1 });
studentSchema.index({ parentMobile: 1 });
studentSchema.index({ aadharNumber: 1 });
studentSchema.index({ janAadharNumber: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ feeStatus: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ postalCode: 1 });

// Pre-save middleware to calculate fees and status
studentSchema.pre('save', function(next) {
  // Ensure classFee and busFee objects exist
  if (!this.classFee) {
    this.classFee = { total: 0, discount: 0, discountedTotal: 0, paid: 0, pending: 0 };
  }
  
  if (!this.busFee) {
    this.busFee = { total: 0, paid: 0, pending: 0 };
  }
  
  // Calculate discounted class fee
  this.classFee.discountedTotal = Math.max(0, (this.classFee.total || 0) - (this.classFee.discount || 0));
  
  // Calculate pending amounts
  this.classFee.pending = Math.max(0, this.classFee.discountedTotal - (this.classFee.paid || 0));
  this.busFee.pending = Math.max(0, (this.busFee.total || 0) - (this.busFee.paid || 0));
  
  // Calculate total fees (using discounted class fee)
  this.totalFee = this.classFee.discountedTotal + (this.busFee.total || 0);
  this.totalFeePaid = (this.classFee.paid || 0) + (this.busFee.paid || 0);
  
  // Update fee status
  if (this.totalFeePaid >= this.totalFee && this.totalFee > 0) {
    this.feeStatus = 'Paid';
  } else if (this.totalFeePaid > 0) {
    this.feeStatus = 'Partial';
  } else {
    this.feeStatus = 'Unpaid';
  }
  
  next();
});

// Static method to generate next SR number (flexible format)
studentSchema.statics.generateSRNumber = async function() {
  const currentYear = new Date().getFullYear();
  
  // Count total students to generate a simple sequential number
  const totalStudents = await this.countDocuments({});
  const nextNumber = totalStudents + 1;
  
  // Generate a suggested format that users can modify as needed
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `SR${currentYear}${paddedNumber}`;
};

// Static method to get student statistics
studentSchema.statics.getStats = async function(filters = {}) {
  return await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        feePaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Paid'] }, 1, 0] } },
        feePartial: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Partial'] }, 1, 0] } },
        feeUnpaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Unpaid'] }, 1, 0] } },
        withBus: { $sum: { $cond: ['$hasBus', 1, 0] } },
        withoutBus: { $sum: { $cond: ['$hasBus', 0, 1] } },
        totalClassFees: { $sum: '$classFee.total' },
        totalBusFees: { $sum: '$busFee.total' },
        totalFeesCollected: { $sum: { $add: ['$classFee.paid', '$busFee.paid'] } }
      }
    }
  ]);
};

// Instance method to get student profile data
studentSchema.methods.getProfileData = function() {
  return {
    _id: this._id,
    studentName: this.studentName,
    fatherName: this.fatherName,
    motherName: this.motherName,
    srNumber: this.srNumber,
    class: this.class,
    medium: this.medium,
    rollNumber: this.rollNumber,
    parentMobile: this.parentMobile,
    aadharNumber: this.aadharNumber,
    janAadharNumber: this.janAadharNumber,
    dateOfBirth: this.dateOfBirth,
    address: this.address,
    postalCode: this.postalCode,
    hasBus: this.hasBus,
    busRoute: this.busRoute,
    classFee: this.classFee,
    busFee: this.busFee,
    totalFee: this.totalFee,
    totalFeePaid: this.totalFeePaid,
    feeStatus: this.feeStatus,
    isActive: this.isActive,
    academicYear: this.academicYear,
    admissionDate: this.admissionDate,
    createdBy: this.createdBy,
    notes: this.notes
  };
};

// Instance method to calculate pending fees
studentSchema.methods.getPendingFees = function() {
  const classFeeBalance = this.classFee ? this.classFee.pending : 0;
  const busFeeBalance = this.busFee ? this.busFee.pending : 0;
  const totalBalance = classFeeBalance + busFeeBalance;
  
  return {
    classFeeBalance,
    busFeeBalance,
    totalBalance,
    isFullyPaid: totalBalance === 0
  };
};

const Student = mongoose.model('Student', studentSchema);

export default Student; 