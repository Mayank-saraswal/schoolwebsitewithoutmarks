import mongoose from 'mongoose';
import Student from '../models/Student.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';
import Teacher from '../models/Teacher.js';

// @desc    Create new student
// @route   POST /api/students/create
// @access  Private (Teacher only)
export const createStudent = async (req, res) => {
  try {
    console.log('🎓 Creating student with data:', JSON.stringify(req.body, null, 2));
    
    const {
      studentName,
      fatherName,
      motherName,
      srNumber,
      address,
      postalCode,
      parentMobile,
      aadharNumber,
      janAadharNumber,
      dateOfBirth,
      class: studentClass,
      medium,
      hasBus,
      busRoute,
      notes
    } = req.body;

    // Get teacher info from JWT
    const teacherId = req.teacher.id || req.teacher._id;
    
    console.log('🔍 Teacher ID from token:', teacherId);
    console.log('🔍 Teacher object:', req.teacher);
    
    if (!teacherId) {
      console.error('❌ Teacher ID not found in token');
      return res.status(400).json({
        success: false,
        message: 'Authentication failed: Teacher ID not found in token / प्रमाणीकरण विफल: टोकन में शिक्षक आईडी नहीं मिली'
      });
    }

    // For debug teacher (mock), skip database lookup
    let teacher;
    if (teacherId === '000000000000000000000001') {
      console.log('🐛 Using debug teacher');
      teacher = {
        _id: teacherId,
        fullName: 'Debug Teacher',
        medium: 'Hindi',
        classTeacherOf: 'Class 12 Science',
        isActive: true,
        isApproved: true
      };
    } else {
      // Validate ObjectId format for real teachers
      if (!teacherId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('❌ Invalid teacher ID format:', teacherId);
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID format / अमान्य शिक्षक आईडी प्रारूप'
        });
      }

      teacher = await Teacher.findById(teacherId);
      console.log('🔍 Teacher found in database:', !!teacher);

      if (!teacher) {
        console.error('❌ Teacher record not found for ID:', teacherId);
        return res.status(404).json({
          success: false,
          message: 'Teacher record not found. Please contact administrator / शिक्षक रिकॉर्ड नहीं मिला। कृपया प्रशासक से संपर्क करें'
        });
      }

      // Verify teacher is active and approved
      if (!teacher.isActive || !teacher.isApproved) {
        console.error('❌ Teacher not active or approved:', {
          isActive: teacher.isActive,
          isApproved: teacher.isApproved
        });
        return res.status(403).json({
          success: false,
          message: 'Teacher account is not active or not approved / शिक्षक खाता सक्रिय नहीं है या अनुमोदित नहीं है'
        });
      }
    }

    // Validate required fields
    const requiredFieldsError = {};
    if (!studentName) requiredFieldsError.studentName = 'Student name is required';
    if (!fatherName) requiredFieldsError.fatherName = 'Father name is required';
    if (!motherName) requiredFieldsError.motherName = 'Mother name is required';
    if (!srNumber) requiredFieldsError.srNumber = 'SR Number is required';
    if (!address) requiredFieldsError.address = 'Address is required';
    if (!postalCode) requiredFieldsError.postalCode = 'Postal code is required';
    if (!parentMobile) requiredFieldsError.parentMobile = 'Parent mobile is required';
    if (!aadharNumber) requiredFieldsError.aadharNumber = 'Aadhar number is required';
    if (!janAadharNumber) requiredFieldsError.janAadharNumber = 'Jan Aadhar number is required';
    if (!dateOfBirth) requiredFieldsError.dateOfBirth = 'Date of birth is required';
    if (!studentClass) requiredFieldsError.class = 'Class is required';
    if (!medium) requiredFieldsError.medium = 'Medium is required';

    if (Object.keys(requiredFieldsError).length > 0) {
      console.error('❌ Required fields missing:', requiredFieldsError);
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided / सभी आवश्यक फ़ील्ड प्रदान करना होगा',
        fields: requiredFieldsError
      });
    }

    console.log('✅ All required fields provided');

    // Teachers can now add students for any class
    // (Removed class restriction to allow flexibility)

    // Check if SR Number already exists
    const existingStudent = await Student.findOne({ srNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this SR Number already exists',
        field: 'srNumber'
      });
    }

    // Check if Aadhar Number already exists
    const existingAadhar = await Student.findOne({ aadharNumber });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Aadhar number already exists',
        field: 'aadharNumber'
      });
    }

    // Check if Jan Aadhar Number already exists
    const existingJanAadhar = await Student.findOne({ janAadharNumber });
    if (existingJanAadhar) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Jan Aadhar number already exists',
        field: 'janAadharNumber'
      });
    }

    // Validate bus route if bus is selected
    let busRouteFee = 0;
    let selectedBusRoute = null;
    if (hasBus) {
      if (!busRoute) {
        return res.status(400).json({
          success: false,
          message: 'Bus route is required when bus option is selected',
          field: 'busRoute'
        });
      }

      selectedBusRoute = await BusRoute.getRouteByIdentifier(busRoute);
      if (!selectedBusRoute) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bus route selected',
          field: 'busRoute'
        });
      }

      if (!selectedBusRoute.hasCapacity()) {
        return res.status(400).json({
          success: false,
          message: `Bus route ${selectedBusRoute.routeName} is full. Available seats: 0`,
          field: 'busRoute'
        });
      }

      busRouteFee = selectedBusRoute.feeAmount;
    }

    // Get class fee
    let classFee = 0;

    try {
      classFee = await ClassFee.getFeeForClass(studentClass, medium);
      if (classFee === 0) {
        // Allow creation with 0 fee - admin can set fees later
        console.warn(`No fee structure found for ${studentClass} (${medium} Medium)`);
      }
    } catch (error) {
      console.warn('Error fetching class fee:', error);
    }

    // Create student object
    const studentData = {
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      srNumber: srNumber.trim().toUpperCase(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      parentMobile: parentMobile.trim(),
      aadharNumber: aadharNumber.trim(),
      janAadharNumber: janAadharNumber.trim().toUpperCase(),
      dateOfBirth: new Date(dateOfBirth),
      class: studentClass,
      medium: medium,
      hasBus: hasBus || false,
      busRoute: hasBus ? selectedBusRoute.routeName : null,
      classFee: {
        total: classFee || 0,
        paid: 0,
        pending: classFee || 0
      },
      busFee: {
        total: busRouteFee || 0,
        paid: 0,
        pending: busRouteFee || 0
      },
      createdBy: teacherId === '000000000000000000000001' ? new mongoose.Types.ObjectId('000000000000000000000001') : new mongoose.Types.ObjectId(teacherId),
      createdByName: teacher.fullName,
      notes: notes || '',
      subjects: Array.isArray(req.body.subjects) ? req.body.subjects : []
    };

    // Create and save student
    const newStudent = new Student(studentData);
    const savedStudent = await newStudent.save();

    // Update bus route capacity if bus is selected
    if (hasBus && selectedBusRoute) {
      selectedBusRoute.addStudent();
      await selectedBusRoute.save();
    }

    // Success response
    res.status(201).json({
      success: true,
      message: `Student ${savedStudent.studentName} created successfully!`,
      data: {
        student: savedStudent.getProfileData(),
        feeBreakdown: {
          classFee: savedStudent.classFee,
          busFee: savedStudent.busFee,
          totalFee: savedStudent.totalFee,
          feeStatus: savedStudent.feeStatus
        },
        busInfo: hasBus ? {
          routeName: selectedBusRoute.routeName,
          routeCode: selectedBusRoute.routeCode,
          driverName: selectedBusRoute.driverInfo.driverName,
          driverMobile: selectedBusRoute.driverInfo.driverMobile
        } : null
      }
    });

  } catch (error) {
    console.error('Create student error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`,
        field
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.error('❌ Validation Error Details:', error.errors);
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
        console.error(`❌ Field '${key}' error:`, error.errors[key].message);
      });

      console.error('❌ Student data that failed validation:', JSON.stringify(studentData, null, 2));

      return res.status(400).json({
        success: false,
        message: 'Validation failed / सत्यापन विफल',
        errors: validationErrors,
        debug: process.env.NODE_ENV === 'development' ? {
          sentData: studentData,
          validationDetails: error.errors
        } : undefined
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to create student. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Test student creation with sample data
// @route   POST /api/students/debug/test-create
// @access  Public (For debugging)
export const testCreateStudent = async (req, res) => {
  try {
    console.log('🧪 Testing student creation with sample data');
    
    const testStudentData = {
      studentName: 'Test Student राम',
      fatherName: 'Test Father रमेश',
      motherName: 'Test Mother सीता',
      srNumber: 'SR2024999',
      address: 'Test Address, Test City, Test State - 123456',
      postalCode: '123456',
      parentMobile: '9876543210',
      aadharNumber: '123456789012',
      janAadharNumber: 'JAN1234567890',
      dateOfBirth: new Date('2010-01-01'),
      class: 'Class 10',
      medium: 'Hindi',
      hasBus: false,
      busRoute: null,
      classFee: {
        total: 5000,
        paid: 0,
        pending: 5000
      },
      busFee: {
        total: 0,
        paid: 0,
        pending: 0
      },
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001'),
      createdByName: 'Test Teacher',
      notes: 'Test student for debugging'
    };

    console.log('🧪 Test student data:', JSON.stringify(testStudentData, null, 2));

    // Create and save student
    const newStudent = new Student(testStudentData);
    const savedStudent = await newStudent.save();

    console.log('✅ Test student created successfully');

    res.status(201).json({
      success: true,
      message: 'Test student created successfully',
      data: savedStudent.getProfileData()
    });

  } catch (error) {
    console.error('❌ Test student creation error:', error);

    if (error.name === 'ValidationError') {
      console.error('❌ Validation errors:', error.errors);
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Test validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Test student creation failed',
      error: error.message
    });
  }
};

// @desc    Get students created by teacher
// @route   GET /api/students/my-students
// @access  Private (Teacher only)
export const getMyStudents = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const {
      page = 1,
      limit = 20,
      class: filterClass,
      feeStatus,
      hasBus,
      search,
      academicYear
    } = req.query;

  // Build query - include teacher's medium from JWT
  const query = { 
    createdBy: teacherId,
    medium: req.teacher.medium // Filter by teacher's medium
  };

  // Apply filters
  if (filterClass && filterClass !== 'all') {
    query.class = filterClass;
  }

    if (feeStatus && feeStatus !== 'all') {
      query.feeStatus = feeStatus;
    }

    if (hasBus !== undefined) {
      query.hasBus = hasBus === 'true';
    }

    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { motherName: { $regex: search, $options: 'i' } },
        { srNumber: { $regex: search, $options: 'i' } },
        { parentMobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    // Get statistics for teacher's students
    const stats = await Student.getStats({ createdBy: teacherId });

    res.status(200).json({
      success: true,
      data: students.map(student => student.getProfileData()),
      stats: stats[0] || {
        total: 0,
        active: 0,
        feePaid: 0,
        feePartial: 0,
        feeUnpaid: 0,
        withBus: 0,
        withoutBus: 0
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
    console.error('Get my students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Teacher only)
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id;

    const student = await Student.findOne({
      _id: id,
      createdBy: teacherId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to view this student'
      });
    }

    // Get bus route details if student has bus
    let busDetails = null;
    if (student.hasBus && student.busRoute) {
      const busRoute = await BusRoute.getRouteByIdentifier(student.busRoute);
      if (busRoute) {
        busDetails = busRoute.getRouteSummary();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        student: student.getProfileData(),
        pendingFees: student.getPendingFees(),
        busDetails: busDetails
      }
    });

  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Teacher only)
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id || req.teacher._id;
    const {
      studentName,
      fatherName,
      motherName,
      address,
      postalCode,
      parentMobile,
      aadharNumber,
      janAadharNumber,
      dateOfBirth,
      hasBus,
      busRoute,
      notes
    } = req.body;

    // Validate ObjectId format
    if (!teacherId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format / अमान्य शिक्षक आईडी प्रारूप'
      });
    }

    // Find student
    const student = await Student.findOne({
      _id: id,
      createdBy: teacherId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to update this student / छात्र नहीं मिला या आपको इस छात्र को अपडेट करने की अनुमति नहीं है'
      });
    }

    // Validate required fields
    const requiredFieldsError = {};
    if (!studentName) requiredFieldsError.studentName = 'Student name is required';
    if (!fatherName) requiredFieldsError.fatherName = 'Father name is required';
    if (!motherName) requiredFieldsError.motherName = 'Mother name is required';
    if (!address) requiredFieldsError.address = 'Address is required';
    if (!postalCode) requiredFieldsError.postalCode = 'Postal code is required';
    if (!parentMobile) requiredFieldsError.parentMobile = 'Parent mobile is required';
    if (!aadharNumber) requiredFieldsError.aadharNumber = 'Aadhar number is required';
    if (!janAadharNumber) requiredFieldsError.janAadharNumber = 'Jan Aadhar number is required';
    if (!dateOfBirth) requiredFieldsError.dateOfBirth = 'Date of birth is required';

    // Stream is now included in class name, no separate validation needed

    if (Object.keys(requiredFieldsError).length > 0) {
          return res.status(400).json({
            success: false,
        message: 'All required fields must be provided / सभी आवश्यक फ़ील्ड प्रदान करना होगा',
        fields: requiredFieldsError
          });
        }

    // Check if Aadhar Number already exists (excluding current student)
    if (aadharNumber !== student.aadharNumber) {
      const existingAadhar = await Student.findOne({ 
        aadharNumber: aadharNumber.trim(),
        _id: { $ne: id }
      });
      if (existingAadhar) {
          return res.status(400).json({
            success: false,
          message: 'A student with this Aadhar number already exists / इस आधार नंबर वाला छात्र पहले से मौजूद है',
          field: 'aadharNumber'
          });
        }
    }

    // Check if Jan Aadhar Number already exists (excluding current student)
    if (janAadharNumber !== student.janAadharNumber) {
      const existingJanAadhar = await Student.findOne({ 
        janAadharNumber: janAadharNumber.trim().toUpperCase(),
        _id: { $ne: id }
      });
      if (existingJanAadhar) {
        return res.status(400).json({
          success: false,
          message: 'A student with this Jan Aadhar number already exists / इस जन आधार नंबर वाला छात्र पहले से मौजूद है',
          field: 'janAadharNumber'
        });
        }
    }

    // Prepare update data
    const updateData = {
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      parentMobile: parentMobile.trim(),
      aadharNumber: aadharNumber.trim(),
      janAadharNumber: janAadharNumber.trim().toUpperCase(),
      dateOfBirth: new Date(dateOfBirth),
      hasBus: hasBus || false,
      busRoute: hasBus ? busRoute : null,
      notes: notes || ''
    };

    // Stream is now included in class name, no separate field needed

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Student ${updatedStudent.studentName} updated successfully! / छात्र ${updatedStudent.studentName} सफलतापूर्वक अपडेट किया गया!`,
      data: {
        student: updatedStudent.getProfileData()
      }
    });

  } catch (error) {
    console.error('Update student error:', error);

    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed / सत्यापन विफल',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldNames = {
        aadharNumber: 'Aadhar number / आधार नंबर',
        janAadharNumber: 'Jan Aadhar number / जन आधार नंबर',
        parentMobile: 'Parent mobile / अभिभावक मोबाइल'
      };
      
      return res.status(400).json({
        success: false,
        message: `${fieldNames[field] || field} already exists / पहले से मौजूद है`,
        field
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during student update / छात्र अपडेट के दौरान सर्वर त्रुटि'
    });
  }
};

// @desc    Get next available SR Number
// @route   GET /api/students/next-sr-number
// @access  Private (Teacher only)
export const getNextSRNumber = async (req, res) => {
  try {
    const nextSRNumber = await Student.generateSRNumber();
    
    res.status(200).json({
      success: true,
      data: {
        nextSRNumber
      }
    });

  } catch (error) {
    console.error('Get next SR number error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SR number',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all students for admin dashboard with year/medium filtering
// @route   GET /api/admin/students
// @access  Private (Admin only)
export const getAdminStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      medium,
      year,
      class: classFilter,
      feeStatus,
      hasBus,
      search
    } = req.query;

    // Validate required filters
    if (!medium || !year) {
      return res.status(400).json({
        success: false,
        message: 'माध्यम और वर्ष आवश्यक हैं / Medium and year are required'
      });
    }

    // Validate year
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({
        success: false,
        message: 'अमान्य वर्ष (2020-2030) / Invalid year (2020-2030)'
      });
    }

    // Validate medium
    if (!['Hindi', 'English'].includes(medium)) {
      return res.status(400).json({
        success: false,
        message: 'अमान्य माध्यम / Invalid medium'
      });
    }

    // Build query with required filters
    const query = {
      medium: medium,
      academicYear: yearNum
    };

    // Additional filters
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }

    if (feeStatus && feeStatus !== 'all') {
      query.feeStatus = feeStatus;
    }

    if (hasBus !== undefined) {
      query.hasBus = hasBus === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { motherName: { $regex: search, $options: 'i' } },
        { srNumber: { $regex: search, $options: 'i' } },
        { parentMobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'fullName')
      .select('studentName fatherName motherName srNumber class medium parentMobile feeStatus hasBus busRoute createdAt createdByName academicYear');

    const total = await Student.countDocuments(query);

    // Get statistics for filtered students
    const stats = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          feePaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'paid'] }, 1, 0] } },
          feePartial: { $sum: { $cond: [{ $eq: ['$feeStatus', 'partial'] }, 1, 0] } },
          feeUnpaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'unpaid'] }, 1, 0] } },
          withBus: { $sum: { $cond: ['$hasBus', 1, 0] } },
          withoutBus: { $sum: { $cond: [{ $not: '$hasBus' }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'छात्र सफलतापूर्वक प्राप्त हुए / Students retrieved successfully',
      data: students,
      stats: stats[0] || {
        total: 0,
        feePaid: 0,
        feePartial: 0,
        feeUnpaid: 0,
        withBus: 0,
        withoutBus: 0
      },
      filters: {
        medium,
        year: yearNum,
        class: classFilter || 'all',
        feeStatus: feeStatus || 'all',
        hasBus: hasBus || 'all',
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
    console.error('Get admin students error:', error);
    res.status(500).json({
      success: false,
      message: 'छात्र प्राप्त करने में त्रुटि / Error retrieving students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Teacher only - can only delete own students)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.teacher.id;

    // Find student and verify ownership
    const student = await Student.findOne({
      _id: id,
      createdBy: teacherId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला या आपको इसे हटाने की अनुमति नहीं है / Student not found or you do not have permission to delete this student'
      });
    }

    // Store student info for audit log
    const studentInfo = {
      name: student.studentName,
      srNumber: student.srNumber,
      class: student.class,
      medium: student.medium,
      fatherName: student.fatherName,
      motherName: student.motherName
    };

    // Delete the student
    await Student.findByIdAndDelete(id);

    // Log the deletion (if audit logging is implemented)
    console.log(`Student deleted by teacher ${req.teacher.fullName}:`, studentInfo);

    res.status(200).json({
      success: true,
      message: `छात्र "${studentInfo.name}" सफलतापूर्वक हटा दिया गया / Student "${studentInfo.name}" deleted successfully`,
      data: {
        deletedStudent: studentInfo
      }
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'छात्र हटाने में त्रुटि / Failed to delete student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 