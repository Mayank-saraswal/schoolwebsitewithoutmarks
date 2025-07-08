import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Student full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date) {
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 3 && age <= 18;
      },
      message: 'Student age must be between 3-18 years'
    }
  },
  studentClass: {
    type: String,
    required: [true, 'Class selection is required'],
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
  parentName: {
    type: String,
    required: [true, 'Parent/Guardian name is required'],
    trim: true,
    minlength: [2, 'Parent name must be at least 2 characters long'],
    maxlength: [100, 'Parent name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(phone) {
        return /^[6-9]\d{9}$/.test(phone);
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Please provide complete address (minimum 10 characters)'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  medium: {
    type: String,
    required: [true, 'Medium of instruction is required'],
    enum: {
      values: ['English', 'Hindi'],
      message: 'Medium must be either English or Hindi'
    },
    default: 'Hindi'
  },
  applicationId: {
    type: String,
    unique: true,
    default: function() {
      // Generate application ID: EXS + Year + 6-digit random number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `EXS${year}${randomNum}`;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected'],
    default: 'pending'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  academicYear: {
    type: String,
    default: function() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Academic year starts from April (month 3, 0-indexed)
      if (currentMonth >= 3) {
        return `${currentYear}-${currentYear + 1}`;
      } else {
        return `${currentYear - 1}-${currentYear}`;
      }
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive data from JSON output
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
admissionSchema.index({ applicationId: 1 });
admissionSchema.index({ email: 1 });
admissionSchema.index({ phone: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ academicYear: 1 });
admissionSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure unique email and phone per academic year
admissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check for duplicate email in same academic year
    const emailExists = await this.constructor.findOne({
      email: this.email,
      academicYear: this.academicYear
    });
    
    if (emailExists) {
      const error = new Error('An application with this email already exists for this academic year');
      error.code = 'DUPLICATE_EMAIL';
      return next(error);
    }
    
    // Check for duplicate phone in same academic year
    const phoneExists = await this.constructor.findOne({
      phone: this.phone,
      academicYear: this.academicYear
    });
    
    if (phoneExists) {
      const error = new Error('An application with this phone number already exists for this academic year');
      error.code = 'DUPLICATE_PHONE';
      return next(error);
    }
  }
  
  next();
});

// Static method to get admission statistics
admissionSchema.statics.getStats = async function(academicYear) {
  return await this.aggregate([
    { $match: { academicYear: academicYear || { $exists: true } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to generate admission letter data
admissionSchema.methods.getAdmissionData = function() {
  return {
    applicationId: this.applicationId,
    studentName: this.fullName,
    parentName: this.parentName,
    class: this.studentClass,
    medium: this.medium,
    status: this.status,
    submissionDate: this.submissionDate,
    academicYear: this.academicYear
  };
};

const Admission = mongoose.model('Admission', admissionSchema);

export default Admission; 