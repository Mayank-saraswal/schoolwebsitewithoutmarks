import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';
import AuditLogger from '../utils/auditLogger.js';

// ===== STUDENT MANAGEMENT =====

// @desc    Add new student
// @route   POST /api/admin/add-student
// @access  Private (Admin only)
export const addStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Validate required fields
    const requiredFields = ['studentName', 'fatherName', 'motherName', 'address', 'parentMobile', 'dateOfBirth', 'class', 'medium'];
    for (const field of requiredFields) {
      if (!studentData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(studentData.parentMobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number format'
      });
    }

    // Check if SR number already exists
    if (studentData.srNumber) {
      const existingStudent = await Student.findOne({ srNumber: studentData.srNumber });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'SR Number already exists'
        });
      }
    }

    // If bus is required, validate and update bus route
    if (studentData.hasBus && studentData.busRoute) {
      const busRoute = await BusRoute.findById(studentData.busRoute);
      if (!busRoute) {
        return res.status(400).json({
          success: false,
          message: 'Selected bus route not found'
        });
      }

      if (busRoute.currentStudents >= busRoute.maxStudents) {
        return res.status(400).json({
          success: false,
          message: 'Bus route is full'
        });
      }

      // Update bus route student count
      await BusRoute.findByIdAndUpdate(studentData.busRoute, {
        $inc: { currentStudents: 1 }
      });
    }

    // Get class fee information
    let classFeeTotal = 0;
    let busFeeTotal = 0;

    try {
      // Get class fee
      const ClassFee = (await import('../models/ClassFee.js')).default;
      const feeStructure = await ClassFee.getFeeStructureForClass(
        studentData.class,
        studentData.medium,
        new Date().getFullYear().toString()
      );

      if (feeStructure) {
        classFeeTotal = feeStructure.totalFee || 0;
      }

      // Get bus fee if bus is required
      if (studentData.hasBus && studentData.busRoute) {
        const busRoute = await BusRoute.findById(studentData.busRoute);
        if (busRoute) {
          busFeeTotal = busRoute.feeAmount || 0;
        }
      }
    } catch (error) {
      console.log('Warning: Could not fetch fee information:', error.message);
    }

    // Get bus route name if bus is required
    let busRouteName = null;
    if (studentData.hasBus && studentData.busRoute) {
      const busRoute = await BusRoute.findById(studentData.busRoute);
      if (busRoute) {
        busRouteName = busRoute.routeName;
      }
    }

    // Handle discount
    const discount = parseFloat(studentData.classFeeDiscount) || 0;
    const discountedClassFee = Math.max(0, classFeeTotal - discount);

    // Create student with proper fee structure including discount
    const student = new Student({
      ...studentData,
      busRoute: busRouteName, // Store route name instead of ID
      classFee: {
        total: classFeeTotal,
        discount: discount,
        discountedTotal: discountedClassFee,
        paid: 0,
        pending: discountedClassFee
      },
      busFee: {
        total: busFeeTotal,
        paid: 0,
        pending: busFeeTotal
      },
      totalFee: discountedClassFee + busFeeTotal,
      totalFeePaid: 0,
      feeStatus: 'Unpaid',
      createdBy: req.admin.adminId,
      createdByName: req.admin.name || 'Administrator',
      createdAt: new Date()
    });

    await student.save();

    // Log the action
    await AuditLogger.logStudentAction(
      '✅ Student Created',
      {
        studentName: student.studentName,
        srNumber: student.srNumber,
        class: student.class,
        medium: student.medium,
        totalFee: student.totalFee
      },
      req,
      { severity: 'medium' }
    );

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: {
        _id: student._id,
        srNumber: student.srNumber,
        studentName: student.studentName,
        class: student.class,
        medium: student.medium,
        totalFee: student.totalFee
      }
    });

  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student',
      error: error.message
    });
  }
};

// @desc    Get students list
// @route   GET /api/admin/students
// @access  Private (Admin only)
export const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      medium,
      year,
      class: className,
      search
    } = req.query;

    console.log(`👨‍💼 Admin getStudents called with params:`, { medium, year, className, search, page, limit });

    // Build query - make filtering more flexible
    const query = {};

    // Add medium filter if provided
    if (medium && medium !== 'all') {
      query.medium = medium;
    }

    // Add year filter if provided - handle both string and number formats
    if (year && year !== 'all') {
      query.$or = [
        { academicYear: parseInt(year) },
        { academicYear: year.toString() }
      ];
    }

    if (className && className !== 'all') {
      query.class = className;
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

    console.log(`👨‍💼 MongoDB query:`, JSON.stringify(query, null, 2));

    // Get total count first
    const total = await Student.countDocuments(query);
    console.log(`👨‍💼 Total students matching query: ${total}`);

    // If no students found, let's check what students exist in the database
    if (total === 0) {
      const allStudents = await Student.find({}).select('medium academicYear class').limit(10);
      console.log(`👨‍💼 Sample students in database:`, allStudents);
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('studentName fatherName srNumber class medium parentMobile totalFee createdAt academicYear hasBus busRoute feeStatus');

    console.log(`👨‍💼 Admin found ${students.length} students out of ${total} total for ${medium} medium, year ${year}`);

    // Calculate statistics
    const stats = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          feePaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Paid'] }, 1, 0] } },
          feePartial: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Partial'] }, 1, 0] } },
          feeUnpaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'Unpaid'] }, 1, 0] } },
          withBus: { $sum: { $cond: ['$hasBus', 1, 0] } },
          withoutBus: { $sum: { $cond: ['$hasBus', 0, 1] } }
        }
      }
    ]);

    const statsData = stats[0] || {
      total: 0,
      feePaid: 0,
      feePartial: 0,
      feeUnpaid: 0,
      withBus: 0,
      withoutBus: 0
    };

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: students,
      stats: statsData,
      filters: {
        medium: medium || 'all',
        year: year || 'all',
        class: className || 'all',
        search: search || ''
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
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===== EXAM CONFIGURATION =====







