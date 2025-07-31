import mongoose from 'mongoose';

const paymentRecordSchema = new mongoose.Schema({
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
    required: [true, 'Parent mobile is required'],
    validate: {
      validator: function(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['class', 'bus', 'both', 'other'],
      message: 'Payment type must be class, bus, both, or other'
    }
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash', 'cheque', 'online', 'card', 'upi', 'bank_transfer'],
      message: 'Invalid payment method'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'cancelled'],
      message: 'Invalid payment status'
    },
    default: 'completed'
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  transactionId: {
    type: String,
    trim: true,
    default: null
  },
  receiptNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values
  },
  note: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  recordedBy: {
    type: String,
    required: [true, 'Recorded by admin is required'],
    default: 'admin@saraswatischool'
  },
  recordedByName: {
    type: String,
    required: [true, 'Recorded by admin name is required'],
    default: 'Administrator'
  },
  academicYear: {
    type: String,
    default: function() {
      return new Date().getFullYear().toString();
    }
  },
  // For online payments
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  // For cheque payments
  chequeNumber: {
    type: String,
    default: null
  },
  chequeDate: {
    type: Date,
    default: null
  },
  bankName: {
    type: String,
    default: null
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
paymentRecordSchema.index({ studentId: 1 });
paymentRecordSchema.index({ parentMobile: 1 });
paymentRecordSchema.index({ paymentDate: -1 });
paymentRecordSchema.index({ status: 1 });
paymentRecordSchema.index({ type: 1 });
paymentRecordSchema.index({ method: 1 });
paymentRecordSchema.index({ academicYear: 1 });
paymentRecordSchema.index({ recordedBy: 1 });
paymentRecordSchema.index({ receiptNumber: 1 });

// Pre-save middleware to generate receipt number
paymentRecordSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    try {
      // Generate receipt number: RCP + Year + Month + Sequential Number
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Find the last receipt number for this month
      const lastReceipt = await this.constructor.findOne({
        receiptNumber: { $regex: `^RCP${year}${month}` }
      }).sort({ receiptNumber: -1 });
      
      let sequentialNumber = 1;
      if (lastReceipt && lastReceipt.receiptNumber) {
        const lastNumber = parseInt(lastReceipt.receiptNumber.slice(-4));
        sequentialNumber = lastNumber + 1;
      }
      
      this.receiptNumber = `RCP${year}${month}${sequentialNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating receipt number:', error);
      // Continue without receipt number if generation fails
    }
  }
  next();
});

// Instance method to get payment summary
paymentRecordSchema.methods.getPaymentSummary = function() {
  return {
    _id: this._id,
    studentName: this.studentName,
    amount: this.amount,
    type: this.type,
    method: this.method,
    status: this.status,
    paymentDate: this.paymentDate,
    receiptNumber: this.receiptNumber,
    note: this.note,
    recordedBy: this.recordedByName,
    createdAt: this.createdAt
  };
};

// Static method to get payment statistics
paymentRecordSchema.statics.getPaymentStats = async function(filters = {}) {
  return await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        completedAmount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
        pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        cashPayments: { $sum: { $cond: [{ $eq: ['$method', 'cash'] }, 1, 0] } },
        cashAmount: { $sum: { $cond: [{ $eq: ['$method', 'cash'] }, '$amount', 0] } },
        onlinePayments: { $sum: { $cond: [{ $eq: ['$method', 'online'] }, 1, 0] } },
        onlineAmount: { $sum: { $cond: [{ $eq: ['$method', 'online'] }, '$amount', 0] } },
        chequePayments: { $sum: { $cond: [{ $eq: ['$method', 'cheque'] }, 1, 0] } },
        chequeAmount: { $sum: { $cond: [{ $eq: ['$method', 'cheque'] }, '$amount', 0] } }
      }
    }
  ]);
};

// Static method to get monthly payment trends
paymentRecordSchema.statics.getMonthlyTrends = async function(year) {
  return await this.aggregate([
    {
      $match: {
        paymentDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year) + 1}-01-01`)
        },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $month: '$paymentDate' },
        totalAmount: { $sum: '$amount' },
        totalPayments: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

export default PaymentRecord;