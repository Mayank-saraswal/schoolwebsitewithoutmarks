import Student from '../models/Student.js';
import ExamConfig from '../models/ExamConfig.js';
import Subject from '../models/Subject.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';
import AuditLogger from '../utils/auditLogger.js';

// ===== STUDENT MANAGEMENT =====

// @desc    Add new student (moved from teacher controller)
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

    // Create student with proper fee structure
    const student = new Student({
      ...studentData,
      busRoute: busRouteName, // Store route name instead of ID
      classFee: {
        total: classFeeTotal,
        paid: 0,
        pending: classFeeTotal
      },
      busFee: {
        total: busFeeTotal,
        paid: 0,
        pending: busFeeTotal
      },
      totalFee: classFeeTotal + busFeeTotal,
      totalFeePaid: 0,
      feeStatus: 'Unpaid',
      createdBy: req.admin.adminId,
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

// @desc    Get students list (moved from teacher controller)
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

    // Validate required filters
    if (!medium || !year) {
      return res.status(400).json({
        success: false,
        message: 'Medium and year are required'
      });
    }

    // Build query
    const query = {
      medium: medium,
      academicYear: parseInt(year)
    };

    if (className && className !== 'all') {
      query.class = className;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { srNumber: { $regex: search, $options: 'i' } },
        { parentMobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('studentName fatherName srNumber class medium parentMobile totalFee createdAt academicYear');

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
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
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===== EXAM CONFIGURATION =====

// @desc    Create exam configuration
// @route   POST /api/admin/exam-setup
// @access  Private (Admin only)
export const createExamConfig = async (req, res) => {
  try {
    const { class: className, medium, academicYear, examName, subjects } = req.body;

    // Validate required fields
    if (!className || !medium || !academicYear || !examName || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: class, medium, academicYear, examName, subjects'
      });
    }

    // Validate subjects array
    if (subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one subject is required'
      });
    }

    // Validate each subject
    for (const subject of subjects) {
      if (!subject.subjectName || !subject.maxMarks || subject.maxMarks <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each subject must have a name and valid max marks'
        });
      }
    }

    // Check if exam config already exists
    const existingConfig = await ExamConfig.findOne({
      class: className,
      medium: medium,
      academicYear: academicYear,
      examName: examName
    });

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Exam configuration already exists for this class, medium, year, and exam'
      });
    }

    // Create new exam config
    const examConfig = new ExamConfig({
      class: className,
      medium: medium,
      academicYear: academicYear,
      examName: examName,
      subjects: subjects,
      createdBy: req.admin.adminId
    });

    await examConfig.save();

    // Log the action
    await AuditLogger.logAction(
      '📝 Exam Config Created',
      {
        class: className,
        medium: medium,
        examName: examName,
        subjectCount: subjects.length,
        totalMaxMarks: examConfig.totalMaxMarks
      },
      req,
      { severity: 'medium' }
    );

    res.status(201).json({
      success: true,
      message: 'Exam configuration created successfully',
      data: examConfig.getExamSummary()
    });

  } catch (error) {
    console.error('Create exam config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get exam configurations
// @route   GET /api/admin/exam-configs
// @access  Private (Admin only)
export const getExamConfigs = async (req, res) => {
  try {
    const { class: className, medium, academicYear } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (className && className !== 'all') {
      query.class = className;
    }
    
    if (medium && medium !== 'all') {
      query.medium = medium;
    }
    
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const examConfigs = await ExamConfig.find(query)
      .sort({ class: 1, medium: 1, examName: 1 })
      .select('class medium academicYear examName subjects totalMaxMarks createdAt');

    res.status(200).json({
      success: true,
      message: 'Exam configurations retrieved successfully',
      data: examConfigs.map(config => config.getExamSummary())
    });

  } catch (error) {
    console.error('Get exam configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve exam configurations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get subjects for a class and medium
// @route   GET /api/admin/subjects
// @access  Private (Admin only)
export const getSubjectsForClass = async (req, res) => {
  try {
    const { class: className, medium, academicYear } = req.query;

    if (!className || !medium) {
      return res.status(400).json({
        success: false,
        message: 'Class and medium are required'
      });
    }

    const year = academicYear || new Date().getFullYear().toString();
    const subjects = await Subject.getSubjectsForClass(className, medium, year);

    res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: {
        class: className,
        medium: medium,
        academicYear: year,
        subjects: subjects
      }
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update exam configuration
// @route   PUT /api/admin/exam-setup/:id
// @access  Private (Admin only)
export const updateExamConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid subjects array is required'
      });
    }

    // Validate each subject
    for (const subject of subjects) {
      if (!subject.subjectName || !subject.maxMarks || subject.maxMarks <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each subject must have a name and valid max marks'
        });
      }
    }

    const examConfig = await ExamConfig.findById(id);
    if (!examConfig) {
      return res.status(404).json({
        success: false,
        message: 'Exam configuration not found'
      });
    }

    examConfig.subjects = subjects;
    await examConfig.save();

    // Log the action
    await AuditLogger.logAction(
      '📝 Exam Config Updated',
      {
        class: examConfig.class,
        medium: examConfig.medium,
        examName: examConfig.examName,
        subjectCount: subjects.length,
        totalMaxMarks: examConfig.totalMaxMarks
      },
      req,
      { severity: 'medium' }
    );

    res.status(200).json({
      success: true,
      message: 'Exam configuration updated successfully',
      data: examConfig.getExamSummary()
    });

  } catch (error) {
    console.error('Update exam config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete exam configuration
// @route   DELETE /api/admin/exam-setup/:id
// @access  Private (Admin only)
export const deleteExamConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const examConfig = await ExamConfig.findById(id);
    if (!examConfig) {
      return res.status(404).json({
        success: false,
        message: 'Exam configuration not found'
      });
    }

    // Soft delete by setting isActive to false
    examConfig.isActive = false;
    await examConfig.save();

    // Log the action
    await AuditLogger.logAction(
      '🗑️ Exam Config Deleted',
      {
        class: examConfig.class,
        medium: examConfig.medium,
        examName: examConfig.examName
      },
      req,
      { severity: 'high' }
    );

    res.status(200).json({
      success: true,
      message: 'Exam configuration deleted successfully'
    });

  } catch (error) {
    console.error('Delete exam config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};