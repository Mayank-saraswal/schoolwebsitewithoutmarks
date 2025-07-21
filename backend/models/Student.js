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
    trim: true,
    uppercase: true,
    validate: {
      validator: function(srNumber) {
        // SR Number format: SR2024001, SR2024002, etc.
        return /^SR\d{7}$/.test(srNumber);
      },
      message: 'SR Number must be in format SR2024001'
    }
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
        // Jan Aadhar number: typically 10-15 characters (alphanumeric)
        return /^[A-Z0-9]{10,15}$/.test(janAadhar);
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
    paid: {
      type: Number,
      default: 0,
      min: [0, 'Class fee paid cannot be negative']
    },
    pending: {
      type: Number,
      default: function() {
        return this.classFee.total - this.classFee.paid;
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
    default: function() {
      return (this.classFee ? this.classFee.total : 0) + (this.busFee ? this.busFee.total : 0);
    }
  },
  totalFeePaid: {
    type: Number,
    default: function() {
      return (this.classFee ? this.classFee.paid : 0) + (this.busFee ? this.busFee.paid : 0);
    }
  },
  feeStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid'],
    default: function() {
      const totalDue = (this.classFee ? this.classFee.total : 0) + (this.busFee ? this.busFee.total : 0);
      const totalPaid = (this.classFee ? this.classFee.paid : 0) + (this.busFee ? this.busFee.paid : 0);
      
      if (totalPaid >= totalDue) return 'Paid';
      if (totalPaid > 0) return 'Partial';
      return 'Unpaid';
    }
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Created by teacher is required']
  },
  createdByName: {
    type: String,
    required: [true, 'Teacher name is required']
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
  // Calculate pending amounts
  if (this.classFee) {
    this.classFee.pending = Math.max(0, this.classFee.total - this.classFee.paid);
  }
  
  if (this.busFee) {
    this.busFee.pending = Math.max(0, this.busFee.total - this.busFee.paid);
  }
  
  // Calculate total fees
  this.totalFee = (this.classFee ? this.classFee.total : 0) + (this.busFee ? this.busFee.total : 0);
  this.totalFeePaid = (this.classFee ? this.classFee.paid : 0) + (this.busFee ? this.busFee.paid : 0);
  
  // Update fee status
  if (this.totalFeePaid >= this.totalFee) {
    this.feeStatus = 'Paid';
  } else if (this.totalFeePaid > 0) {
    this.feeStatus = 'Partial';
  } else {
    this.feeStatus = 'Unpaid';
  }
  
  next();
});

// Static method to generate next SR number
studentSchema.statics.generateSRNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `SR${currentYear}`;
  
  // Find the latest SR number for current year
  const latestStudent = await this.findOne({
    srNumber: { $regex: `^${prefix}` }
  }).sort({ srNumber: -1 });
  
  let nextNumber = 1;
  if (latestStudent) {
    const lastNumber = parseInt(latestStudent.srNumber.substring(6));
    nextNumber = lastNumber + 1;
  }
  
  // Pad with zeros to make it 3 digits
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
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
    createdByName: this.createdByName,
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