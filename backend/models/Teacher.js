import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    validate: {
      validator: function(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  classTeacherOf: {
    type: String,
    required: [true, 'Class assignment is required'],
    enum: {
      values: [
                'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
        'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
        'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
        'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce',
        'Subject Teacher', 'Sports Teacher', 'Music Teacher'
      ],
      message: 'Please select a valid class or subject'
    }
  },
  medium: {
    type: String,
    required: [true, 'Medium of instruction is required'],
    enum: {
      values: ['English', 'Hindi'],
      message: 'Medium must be either English or Hindi'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Please provide complete address (minimum 10 characters)'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  qualification: {
    type: String,
    required: [true, 'Highest qualification is required'],
    enum: {
      values: [
        'B.Ed', 'M.Ed', 'B.A', 'M.A', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com',
        'BCA', 'MCA', 'Ph.D', 'Diploma', 'Other'
      ],
      message: 'Please select a valid qualification'
    }
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  teacherId: {
    type: String,
    unique: true,
    default: function() {
      // Generate teacher ID: EXT + Year + 4-digit random number
      const year = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      return `EXT${year}${randomNum}`;
    }
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: String,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive data from JSON output
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
teacherSchema.index({ mobile: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ isApproved: 1 });
teacherSchema.index({ medium: 1 });
teacherSchema.index({ classTeacherOf: 1 });
teacherSchema.index({ createdAt: -1 });

// Pre-save middleware to handle approval/rejection logic
teacherSchema.pre('save', function(next) {
  // If being approved for the first time
  if (this.isModified('isApproved') && this.isApproved && !this.approvedAt) {
    this.approvedAt = new Date();
    this.isRejected = false;
    this.rejectedAt = null;
    this.rejectionReason = null;
  }
  
  // If being rejected for the first time
  if (this.isModified('isRejected') && this.isRejected && !this.rejectedAt) {
    this.rejectedAt = new Date();
    this.isApproved = false;
    this.approvedAt = null;
  }
  
  next();
});

// Static method to get teacher statistics
teacherSchema.statics.getStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $and: [{ $eq: ['$isApproved', false] }, { $eq: ['$isRejected', false] }] }, 1, 0] } },
        approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
        rejected: { $sum: { $cond: ['$isRejected', 1, 0] } },
        english: { $sum: { $cond: [{ $eq: ['$medium', 'English'] }, 1, 0] } },
        hindi: { $sum: { $cond: [{ $eq: ['$medium', 'Hindi'] }, 1, 0] } }
      }
    }
  ]);
};

// Instance method to get teacher profile data
teacherSchema.methods.getProfileData = function() {
  return {
    teacherId: this.teacherId,
    fullName: this.fullName,
    mobile: this.mobile,
    email: this.email,
    classTeacherOf: this.classTeacherOf,
    medium: this.medium,
    qualification: this.qualification,
    isApproved: this.isApproved,
    isActive: this.isActive,
    approvedAt: this.approvedAt,
    lastLogin: this.lastLogin
  };
};

// Instance method to check if teacher can login
teacherSchema.methods.canLogin = function() {
  return this.isApproved && !this.isRejected && this.isActive;
};

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher; 