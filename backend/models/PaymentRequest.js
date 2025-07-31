import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['class', 'bus'],
      message: 'Payment type must be either class or bus'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be greater than 0']
  },
  razorpayOrderId: {
    type: String,
    required: [true, 'Razorpay order ID is required']
  },
  razorpayPaymentId: {
    type: String,
    default: null // Will be updated after successful payment
  },
  screenshotUrl: {
    type: String,
    required: [true, 'Screenshot upload is required']
  },
  description: {
    type: String,
    required: [true, 'Payment description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Admin who approved/rejected
    default: null
  },
  processedByName: {
    type: String,
    default: null
  },
  adminRemarks: {
    type: String,
    trim: true,
    maxlength: [300, 'Admin remarks cannot exceed 300 characters'],
    default: ''
  },
  class: {
    type: String,
    required: [true, 'Student class is required']
  },
  medium: {
    type: String,
    required: [true, 'Student medium is required']
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
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
paymentRequestSchema.index({ studentId: 1 });
paymentRequestSchema.index({ parentMobile: 1 });
paymentRequestSchema.index({ status: 1 });
paymentRequestSchema.index({ type: 1 });
paymentRequestSchema.index({ class: 1, medium: 1 });
paymentRequestSchema.index({ requestedAt: -1 });
paymentRequestSchema.index({ academicYear: 1 });

// Static method to get payment request statistics
paymentRequestSchema.statics.getStats = async function(filters = {}) {
  return await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        totalAmount: { $sum: '$amount' },
        approvedAmount: { 
          $sum: { 
            $cond: [
              { $eq: ['$status', 'approved'] }, 
              '$amount', 
              0
            ] 
          } 
        },
        classFeeRequests: { $sum: { $cond: [{ $eq: ['$type', 'class'] }, 1, 0] } },
        busFeeRequests: { $sum: { $cond: [{ $eq: ['$type', 'bus'] }, 1, 0] } }
      }
    }
  ]);
};

// Instance method to get payment request details
paymentRequestSchema.methods.getRequestDetails = function() {
  return {
    _id: this._id,
    studentId: this.studentId,
    studentName: this.studentName,
    parentMobile: this.parentMobile,
    type: this.type,
    amount: this.amount,
    screenshotUrl: this.screenshotUrl,
    description: this.description,
    status: this.status,
    requestedAt: this.requestedAt,
    processedAt: this.processedAt,
    processedByName: this.processedByName,
    adminRemarks: this.adminRemarks,
    class: this.class,
    medium: this.medium,
    academicYear: this.academicYear
  };
};

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

export default PaymentRequest; 