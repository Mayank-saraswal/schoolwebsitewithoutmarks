import Student from '../models/Student.js';
import PaymentRecord from '../models/PaymentRecord.js';
import AuditLogger from '../utils/auditLogger.js';

// @desc    Get students with fee details for admin
// @route   GET /api/admin/students/fees
// @access  Private (Admin only)
export const getStudentsWithFees = async (req, res) => {
  try {
    const {
      medium,
      year,
      class: classFilter,
      feeStatus,
      hasBus,
      search,
      page = 1,
      limit = 50
    } = req.query;

    console.log('👨‍💼 Admin getStudentsWithFees called with:', { medium, year, classFilter, feeStatus, hasBus, search });

    // Build query
    const query = {};

    // Add medium filter if provided
    if (medium && medium !== 'all') {
      query.medium = medium;
    }

    // Add year filter if provided
    if (year && year !== 'all') {
      query.$or = [
        { academicYear: parseInt(year) },
        { academicYear: year.toString() }
      ];
    }

    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }

    if (feeStatus && feeStatus !== 'all') {
      query.feeStatus = feeStatus;
    }

    if (hasBus !== undefined && hasBus !== 'all') {
      query.hasBus = hasBus === 'true';
    }

    // Search functionality
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { studentName: { $regex: search, $options: 'i' } },
          { fatherName: { $regex: search, $options: 'i' } },
          { srNumber: { $regex: search, $options: 'i' } },
          { parentMobile: { $regex: search, $options: 'i' } }
        ]
      });
    }

    console.log('👨‍💼 MongoDB query:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('studentName fatherName srNumber class medium parentMobile classFee busFee totalFee totalFeePaid feeStatus hasBus busRoute createdAt academicYear');

    const total = await Student.countDocuments(query);

    console.log(`👨‍💼 Found ${students.length} students out of ${total} total for fee management`);

    res.status(200).json({
      success: true,
      message: 'Students with fee details retrieved successfully',
      data: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get students with fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving students with fee details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update student fee details
// @route   PUT /api/admin/students/:id/fees
// @access  Private (Admin only)
export const updateStudentFees = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      classFeeTotal,
      classFeeDiscount,
      classFeePaid,
      busFeeTotal,
      busFeePaid,
      paymentNote
    } = req.body;

    console.log('👨‍💼 Updating fees for student:', id, req.body);

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found / छात्र नहीं मिला'
      });
    }

    // Store original values for audit log
    const originalFees = {
      classFee: { ...student.classFee },
      busFee: { ...student.busFee },
      totalFee: student.totalFee,
      totalFeePaid: student.totalFeePaid,
      feeStatus: student.feeStatus
    };

    // Update fee structure
    const updatedClassFee = {
      total: parseFloat(classFeeTotal) || 0,
      discount: parseFloat(classFeeDiscount) || 0,
      paid: parseFloat(classFeePaid) || 0
    };

    const updatedBusFee = {
      total: parseFloat(busFeeTotal) || 0,
      paid: parseFloat(busFeePaid) || 0
    };

    // Calculate discounted total and pending amounts
    updatedClassFee.discountedTotal = Math.max(0, updatedClassFee.total - updatedClassFee.discount);
    updatedClassFee.pending = Math.max(0, updatedClassFee.discountedTotal - updatedClassFee.paid);
    updatedBusFee.pending = Math.max(0, updatedBusFee.total - updatedBusFee.paid);

    // Update student record
    student.classFee = updatedClassFee;
    student.busFee = updatedBusFee;

    // The pre-save middleware will calculate totalFee, totalFeePaid, and feeStatus
    await student.save();

    // Log the fee update
    await AuditLogger.logStudentAction(
      '💰 Fee Details Updated',
      {
        studentName: student.studentName,
        srNumber: student.srNumber,
        originalFees: originalFees,
        updatedFees: {
          classFee: student.classFee,
          busFee: student.busFee,
          totalFee: student.totalFee,
          totalFeePaid: student.totalFeePaid,
          feeStatus: student.feeStatus
        },
        note: paymentNote || 'Fee details updated by admin'
      },
      req,
      { severity: 'medium' }
    );

    res.status(200).json({
      success: true,
      message: 'Fee details updated successfully / फीस विवरण सफलतापूर्वक अपडेट किया गया',
      data: {
        student: student.getProfileData(),
        feeBreakdown: {
          classFee: student.classFee,
          busFee: student.busFee,
          totalFee: student.totalFee,
          totalFeePaid: student.totalFeePaid,
          feeStatus: student.feeStatus
        }
      }
    });

  } catch (error) {
    console.error('Update student fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fee details / फीस विवरण अपडेट करने में विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Record offline payment for student
// @route   POST /api/admin/students/:id/payment
// @access  Private (Admin only)
export const recordOfflinePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      type, // 'class', 'bus', or 'both'
      method, // 'cash', 'cheque', 'online', 'card'
      paymentDate,
      note
    } = req.body;

    console.log('👨‍💼 Recording offline payment for student:', id, req.body);

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required / वैध भुगतान राशि आवश्यक है'
      });
    }

    if (!['class', 'bus', 'both'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type / अमान्य भुगतान प्रकार'
      });
    }

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found / छात्र नहीं मिला'
      });
    }

    const paymentAmount = parseFloat(amount);
    let remainingAmount = paymentAmount;

    // Store original values for audit log
    const originalFees = {
      classFee: { ...student.classFee },
      busFee: { ...student.busFee },
      totalFee: student.totalFee,
      totalFeePaid: student.totalFeePaid,
      feeStatus: student.feeStatus
    };

    // Apply payment based on type
    if (type === 'class' || type === 'both') {
      const classFeeBalance = Math.max(0, (student.classFee.discountedTotal || student.classFee.total) - student.classFee.paid);
      const classPayment = Math.min(remainingAmount, classFeeBalance);
      
      if (classPayment > 0) {
        student.classFee.paid = (student.classFee.paid || 0) + classPayment;
        remainingAmount -= classPayment;
      }
    }

    if ((type === 'bus' || type === 'both') && remainingAmount > 0 && student.hasBus) {
      const busFeeBalance = Math.max(0, student.busFee.total - student.busFee.paid);
      const busPayment = Math.min(remainingAmount, busFeeBalance);
      
      if (busPayment > 0) {
        student.busFee.paid = (student.busFee.paid || 0) + busPayment;
        remainingAmount -= busPayment;
      }
    }

    // If there's still remaining amount and type is 'both', apply to whichever has balance
    if (remainingAmount > 0 && type === 'both') {
      const classFeeBalance = Math.max(0, (student.classFee.discountedTotal || student.classFee.total) - student.classFee.paid);
      const busFeeBalance = student.hasBus ? Math.max(0, student.busFee.total - student.busFee.paid) : 0;
      
      if (classFeeBalance > 0) {
        const additionalClassPayment = Math.min(remainingAmount, classFeeBalance);
        student.classFee.paid += additionalClassPayment;
        remainingAmount -= additionalClassPayment;
      } else if (busFeeBalance > 0) {
        const additionalBusPayment = Math.min(remainingAmount, busFeeBalance);
        student.busFee.paid += additionalBusPayment;
        remainingAmount -= additionalBusPayment;
      }
    }

    // The pre-save middleware will recalculate pending amounts, totals, and status
    await student.save();

    // Create payment record
    const paymentRecord = new PaymentRecord({
      studentId: student._id,
      studentName: student.studentName,
      parentMobile: student.parentMobile,
      amount: paymentAmount,
      type: type,
      method: method,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: 'completed',
      note: note || `Offline payment recorded by admin`,
      recordedBy: req.admin.adminId,
      recordedByName: req.admin.name || 'Administrator'
    });

    await paymentRecord.save();

    // Log the payment
    await AuditLogger.logStudentAction(
      '💳 Offline Payment Recorded',
      {
        studentName: student.studentName,
        srNumber: student.srNumber,
        paymentAmount: paymentAmount,
        paymentType: type,
        paymentMethod: method,
        originalFees: originalFees,
        updatedFees: {
          classFee: student.classFee,
          busFee: student.busFee,
          totalFee: student.totalFee,
          totalFeePaid: student.totalFeePaid,
          feeStatus: student.feeStatus
        },
        note: note || 'Offline payment recorded'
      },
      req,
      { severity: 'medium' }
    );

    res.status(200).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString()} recorded successfully / ₹${paymentAmount.toLocaleString()} का भुगतान सफलतापूर्वक दर्ज किया गया`,
      data: {
        student: student.getProfileData(),
        paymentRecord: paymentRecord,
        feeBreakdown: {
          classFee: student.classFee,
          busFee: student.busFee,
          totalFee: student.totalFee,
          totalFeePaid: student.totalFeePaid,
          feeStatus: student.feeStatus
        },
        excessAmount: remainingAmount > 0 ? remainingAmount : 0
      }
    });

  } catch (error) {
    console.error('Record offline payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment / भुगतान दर्ज करने में विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get payment history for a student
// @route   GET /api/admin/students/:id/payments
// @access  Private (Admin only)
export const getStudentPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found / छात्र नहीं मिला'
      });
    }

    // Get payment history
    const payments = await PaymentRecord.find({ studentId: id })
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PaymentRecord.countDocuments({ studentId: id });

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        student: {
          _id: student._id,
          studentName: student.studentName,
          srNumber: student.srNumber,
          class: student.class
        },
        payments: payments,
        currentFeeStatus: {
          classFee: student.classFee,
          busFee: student.busFee,
          totalFee: student.totalFee,
          totalFeePaid: student.totalFeePaid,
          feeStatus: student.feeStatus
        }
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get student payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history / भुगतान इतिहास प्राप्त करने में विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get fee statistics for admin dashboard
// @route   GET /api/admin/fees/stats
// @access  Private (Admin only)
export const getFeeStatistics = async (req, res) => {
  try {
    const { medium, year } = req.query;

    // Build query
    const query = {};
    if (medium && medium !== 'all') {
      query.medium = medium;
    }
    if (year && year !== 'all') {
      query.$or = [
        { academicYear: parseInt(year) },
        { academicYear: year.toString() }
      ];
    }

    // Get comprehensive fee statistics
    const stats = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          
          // Fee Status Distribution
          feePaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Paid'] }, 1, 0] } },
          feePartial: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Partial'] }, 1, 0] } },
          feeUnpaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Unpaid'] }, 1, 0] } },
          
          // Financial Totals
          totalClassFees: { $sum: '$classFee.total' },
          totalClassDiscounts: { $sum: '$classFee.discount' },
          totalClassFeesAfterDiscount: { $sum: '$classFee.discountedTotal' },
          totalClassFeesPaid: { $sum: '$classFee.paid' },
          totalClassFeesPending: { $sum: '$classFee.pending' },
          
          totalBusFees: { $sum: '$busFee.total' },
          totalBusFeesPaid: { $sum: '$busFee.paid' },
          totalBusFeesPending: { $sum: '$busFee.pending' },
          
          totalFees: { $sum: '$totalFee' },
          totalFeesPaid: { $sum: '$totalFeePaid' },
          
          // Bus Statistics
          studentsWithBus: { $sum: { $cond: ['$hasBus', 1, 0] } },
          studentsWithoutBus: { $sum: { $cond: ['$hasBus', 0, 1] } },
          
          // Discount Statistics
          studentsWithDiscount: { $sum: { $cond: [{ $gt: ['$classFee.discount', 0] }, 1, 0] } },
          averageDiscount: { $avg: '$classFee.discount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalStudents: 0,
      feePaid: 0,
      feePartial: 0,
      feeUnpaid: 0,
      totalClassFees: 0,
      totalClassDiscounts: 0,
      totalClassFeesAfterDiscount: 0,
      totalClassFeesPaid: 0,
      totalClassFeesPending: 0,
      totalBusFees: 0,
      totalBusFeesPaid: 0,
      totalBusFeesPending: 0,
      totalFees: 0,
      totalFeesPaid: 0,
      studentsWithBus: 0,
      studentsWithoutBus: 0,
      studentsWithDiscount: 0,
      averageDiscount: 0
    };

    // Calculate additional metrics
    result.totalFeesPending = result.totalFees - result.totalFeesPaid;
    result.collectionPercentage = result.totalFees > 0 ? ((result.totalFeesPaid / result.totalFees) * 100).toFixed(2) : 0;
    result.discountPercentage = result.totalClassFees > 0 ? ((result.totalClassDiscounts / result.totalClassFees) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: 'Fee statistics retrieved successfully',
      data: result,
      filters: {
        medium: medium || 'all',
        year: year || 'all'
      }
    });

  } catch (error) {
    console.error('Get fee statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fee statistics / फीस आंकड़े प्राप्त करने में विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};