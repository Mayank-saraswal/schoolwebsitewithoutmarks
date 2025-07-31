import Razorpay from 'razorpay';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Student from '../models/Student.js';
import PaymentRequest from '../models/PaymentRequest.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXX',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXX'
});

// Check if Razorpay credentials are configured
const isRazorpayConfigured = () => {
  return process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key-id' &&
    process.env.RAZORPAY_KEY_SECRET !== 'your-razorpay-key-secret';
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/screenshots';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fee-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (PNG, JPG, JPEG)'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Create Razorpay order for payment
export const createPaymentOrder = async (req, res) => {
  try {
    const { studentId, type, amount } = req.body;
    const parent = req.parent;

    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'भुगतान सेवा कॉन्फ़िगर नहीं है। कृपया व्यवस्थापक से संपर्क करें / Payment service not configured. Please contact administrator'
      });
    }

    // Validation
    if (!studentId || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'छात्र ID, भुगतान प्रकार और राशि आवश्यक है / Student ID, payment type, and amount are required'
      });
    }

    // Verify parent has access to this student
    if (!parent.studentIds.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'इस छात्र की जानकारी तक पहुंच नहीं है / Access denied for this student'
      });
    }

    // Validate payment type
    if (!['class', 'bus'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'भुगतान प्रकार केवल class या bus हो सकता है / Payment type must be either class or bus'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Validate amount against pending fees
    const classFeeBalance = Math.max(0, (student.classFee?.total || 0) - (student.classFee?.paid || 0));
    const busFeeBalance = Math.max(0, (student.busFee?.total || 0) - (student.busFee?.paid || 0));

    let maxAmount = 0;
    if (type === 'class') {
      maxAmount = classFeeBalance;
    } else if (type === 'bus') {
      maxAmount = busFeeBalance;
    }

    if (amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `भुगतान राशि ${maxAmount} से अधिक नहीं हो सकती / Payment amount cannot exceed ₹${maxAmount}`
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'भुगतान राशि 0 से अधिक होनी चाहिए / Payment amount must be greater than 0'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Convert to paisa
      currency: 'INR',
      receipt: `fee_${studentId}_${type}_${Date.now()}`,
      notes: {
        studentId: studentId,
        studentName: student.studentName,
        type: type,
        parentMobile: parent.parentMobile,
        class: student.class,
        medium: student.medium
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    res.status(200).json({
      success: true,
      message: 'भुगतान आदेश सफलतापूर्वक बनाया गया / Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXX',
        studentName: student.studentName,
        type: type,
        description: `${student.studentName} - ${type === 'class' ? 'Class Fee' : 'Bus Fee'}`
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'भुगतान आदेश बनाने में त्रुटि / Error creating payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload payment screenshot and create payment request
export const uploadPaymentScreenshot = async (req, res) => {
  try {
    const {
      studentId,
      parentMobile,
      type,
      amount,
      description,
      razorpayOrderId,
      razorpayPaymentId
    } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'कृपया भुगतान का स्क्रीनशॉट अपलोड करें / Please upload payment screenshot'
      });
    }

    // Validation
    if (!studentId || !parentMobile || !type || !amount || !description || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'सभी फील्ड आवश्यक हैं / All fields are required'
      });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Verify parent mobile matches
    if (student.parentMobile !== parentMobile) {
      return res.status(403).json({
        success: false,
        message: 'अभिभावक का मोबाइल नंबर मेल नहीं खाता / Parent mobile number does not match'
      });
    }

    // Create payment request
    const paymentRequest = new PaymentRequest({
      studentId: studentId,
      studentName: student.studentName,
      parentMobile: parentMobile,
      type: type,
      amount: parseFloat(amount),
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || null,
      screenshotUrl: req.file.path,
      description: description,
      class: student.class,
      medium: student.medium,
      status: 'pending'
    });

    await paymentRequest.save();

    res.status(201).json({
      success: true,
      message: 'भुगतान अनुरोध सफलतापूर्वक जमा किया गया। 24 घंटे में सत्यापन होगा। यदि अपडेट नहीं हुआ तो संपर्क करें: 9414790807 / Payment request submitted successfully. Verification within 24 hours. If not updated, contact: 9414790807',
      data: {
        requestId: paymentRequest._id,
        status: paymentRequest.status,
        amount: paymentRequest.amount,
        type: paymentRequest.type
      }
    });

  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload payment screenshot error:', error);
    res.status(500).json({
      success: false,
      message: 'भुगतान स्क्रीनशॉट अपलोड करने में त्रुटि / Error uploading payment screenshot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get payment requests for a parent
export const getParentPaymentRequests = async (req, res) => {
  try {
    const parent = req.parent;

    // Get all payment requests for parent's students
    const paymentRequests = await PaymentRequest.find({
      studentId: { $in: parent.studentIds }
    }).sort({ requestedAt: -1 });

    const formattedRequests = paymentRequests.map(request => ({
      _id: request._id,
      studentName: request.studentName,
      type: request.type,
      amount: request.amount,
      status: request.status,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      adminRemarks: request.adminRemarks,
      class: request.class,
      medium: request.medium
    }));

    res.status(200).json({
      success: true,
      message: 'भुगतान अनुरोध सफलतापूर्वक प्राप्त हुए / Payment requests retrieved successfully',
      data: {
        requests: formattedRequests,
        totalRequests: formattedRequests.length
      }
    });

  } catch (error) {
    console.error('Get parent payment requests error:', error);
    res.status(500).json({
      success: false,
      message: 'भुगतान अनुरोध प्राप्त करने में त्रुटि / Error retrieving payment requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Get all payment requests (for admin dashboard)
export const getAllPaymentRequests = async (req, res) => {
  try {
    const { status, type, class: studentClass, medium, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (studentClass) filter.class = studentClass;
    if (medium) filter.medium = medium;

    // Get paginated payment requests
    const paymentRequests = await PaymentRequest.find(filter)
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('studentId', 'studentName class medium parentMobile');

    const totalRequests = await PaymentRequest.countDocuments(filter);

    // Get statistics
    const stats = await PaymentRequest.getStats(filter);

    res.status(200).json({
      success: true,
      message: 'भुगतान अनुरोध सफलतापूर्वक प्राप्त हुए / Payment requests retrieved successfully',
      data: {
        requests: paymentRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests: totalRequests,
          limit: parseInt(limit)
        },
        statistics: stats[0] || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalAmount: 0,
          approvedAmount: 0,
          classFeeRequests: 0,
          busFeeRequests: 0
        }
      }
    });

  } catch (error) {
    console.error('Get all payment requests error:', error);
    res.status(500).json({
      success: false,
      message: 'भुगतान अनुरोध प्राप्त करने में त्रुटि / Error retrieving payment requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Approve or reject payment request
export const processPaymentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, remarks } = req.body;
    const admin = req.admin; // Admin is authenticated

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'कार्य केवल approve या reject हो सकता है / Action must be either approve or reject'
      });
    }

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId);
    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'भुगतान अनुरोध नहीं मिला / Payment request not found'
      });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'यह अनुरोध पहले से ही प्रोसेस किया गया है / This request has already been processed'
      });
    }

    // Update payment request status
    paymentRequest.status = action === 'approve' ? 'approved' : 'rejected';
    paymentRequest.processedAt = new Date();
    paymentRequest.processedBy = admin._id;
    paymentRequest.processedByName = admin.name;
    paymentRequest.adminRemarks = remarks || '';

    if (action === 'approve') {
      // Update student fee records
      const student = await Student.findById(paymentRequest.studentId);
      if (student) {
        if (paymentRequest.type === 'class') {
          student.classFee.paid = (student.classFee.paid || 0) + paymentRequest.amount;
        } else if (paymentRequest.type === 'bus') {
          student.busFee.paid = (student.busFee.paid || 0) + paymentRequest.amount;
        }
        await student.save(); // This will trigger the pre-save middleware to update fee status
      }
    }

    await paymentRequest.save();

    res.status(200).json({
      success: true,
      message: action === 'approve'
        ? 'भुगतान अनुरोध स्वीकृत किया गया / Payment request approved'
        : 'भुगतान अनुरोध अस्वीकार किया गया / Payment request rejected',
      data: {
        requestId: paymentRequest._id,
        status: paymentRequest.status,
        processedAt: paymentRequest.processedAt,
        processedBy: paymentRequest.processedByName
      }
    });

  } catch (error) {
    console.error('Process payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'भुगतान अनुरोध प्रोसेस करने में त्रुटि / Error processing payment request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Serve uploaded screenshot files
export const getScreenshot = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/screenshots', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'फाइल नहीं मिली / File not found'
      });
    }

    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Get screenshot error:', error);
    res.status(500).json({
      success: false,
      message: 'फाइल प्राप्त करने में त्रुटि / Error retrieving file'
    });
  }
}; 