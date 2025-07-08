import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import Teacher from '../models/Teacher.js';

// @desc    Register new teacher
// @route   POST /api/teachers/register
// @access  Public
export const registerTeacher = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      classTeacherOf,
      medium,
      address,
      email,
      password,
      confirmPassword,
      qualification
    } = req.body;

    // Validate required fields
    if (!fullName || !mobile || !classTeacherOf || !medium || !address || !email || !password || !confirmPassword || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        fields: {
          fullName: !fullName ? 'Full name is required' : null,
          mobile: !mobile ? 'Mobile number is required' : null,
          classTeacherOf: !classTeacherOf ? 'Class assignment is required' : null,
          medium: !medium ? 'Medium is required' : null,
          address: !address ? 'Address is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          confirmPassword: !confirmPassword ? 'Confirm password is required' : null,
          qualification: !qualification ? 'Qualification is required' : null
        }
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        field: 'confirmPassword'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
        field: 'password'
      });
    }

    // Additional validations
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number',
        field: 'mobile'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        field: 'email'
      });
    }

    // Check for existing teacher with same mobile or email
    const existingTeacher = await Teacher.findOne({
      $or: [{ mobile }, { email }]
    });

    if (existingTeacher) {
      const field = existingTeacher.mobile === mobile ? 'mobile' : 'email';
      return res.status(400).json({
        success: false,
        message: `A teacher with this ${field} already exists`,
        field
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new teacher
    const newTeacher = new Teacher({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      classTeacherOf,
      medium,
      address: address.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      qualification,
      isApproved: false, // Default to pending approval
      isRejected: false
    });

    // Save to database
    const savedTeacher = await newTeacher.save();

    // Success response (don't include password)
    res.status(200).json({
      success: true,
      message: 'Teacher registration submitted successfully! Approval pending within 24 hours.',
      data: {
        teacherId: savedTeacher.teacherId,
        fullName: savedTeacher.fullName,
        mobile: savedTeacher.mobile,
        email: savedTeacher.email,
        classTeacherOf: savedTeacher.classTeacherOf,
        medium: savedTeacher.medium,
        qualification: savedTeacher.qualification,
        status: 'Pending Approval',
        submittedAt: savedTeacher.createdAt
      },
      nextSteps: [
        'Your application has been submitted to the administration',
        'You will receive approval confirmation within 24 hours',
        'Please check your email for updates',
        'After approval, you can login using your mobile number and password'
      ]
    });

  } catch (error) {
    console.error('Teacher registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A teacher with this ${field} already exists`,
        field
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to submit teacher registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Teacher login
// @route   POST /api/teachers/login
// @access  Public
export const loginTeacher = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and password are required',
        fields: {
          mobile: !mobile ? 'Mobile number is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Find teacher by mobile
    const teacher = await Teacher.findOne({ mobile }).select('+password');

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if teacher is rejected
    if (teacher.isRejected) {
      return res.status(403).json({
        success: false,
        message: 'Your application has been rejected. Please contact administration for more details.',
        code: 'APPLICATION_REJECTED'
      });
    }

    // Check if teacher is approved
    if (!teacher.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your application is pending approval. Please wait for administration confirmation.',
        code: 'PENDING_APPROVAL'
      });
    }

    // Check if teacher is active
    if (!teacher.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administration.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, teacher.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    teacher.lastLogin = new Date();
    await teacher.save();

    // Generate JWT token with consistent secret and format
    const jwtSecret = process.env.JWT_SECRET || 'saraswatiSchoolAdminSecret2025';
    const token = jwt.sign(
      {
        id: teacher._id,
        teacherId: teacher.teacherId,
        fullName: teacher.fullName,
        mobile: teacher.mobile,
        classTeacherOf: teacher.classTeacherOf,
        medium: teacher.medium,
        type: 'teacher',
        role: 'teacher'
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Set cookie with same options as admin
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('teacherToken', token, cookieOptions);

    // Success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        teacher: teacher.getProfileData(),
        tokenType: 'Bearer',
        expiresIn: '7d'
      }
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get teacher profile (protected route)
// @route   GET /api/teachers/profile
// @access  Private (Teacher only)
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher.getProfileData()
    });

  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Verify teacher token (for frontend auth checks)
// @route   GET /api/teachers/verify
// @access  Private (Teacher only)
export const verifyTeacherToken = async (req, res) => {
  try {
    // Token is already verified by middleware, teacher info is in req.teacher
    const teacher = await Teacher.findById(req.teacher.id);

    if (!teacher || !teacher.canLogin()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        teacher: teacher.getProfileData(),
        isAuthenticated: true
      }
    });
  } catch (error) {
    console.error('Teacher token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all teachers for admin dashboard with year/medium filtering
// @route   GET /api/admin/teachers
// @access  Private (Admin only)
export const getAdminTeachers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      medium,
      year,
      status,
      classTeacherOf,
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
    if (status && status !== 'all') {
      if (status === 'approved') {
        query.isApproved = true;
        query.isRejected = false;
        query.isActive = true;
      } else if (status === 'pending') {
        query.isApproved = false;
        query.isRejected = false;
      } else if (status === 'rejected') {
        query.isRejected = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    if (classTeacherOf && classTeacherOf !== 'all') {
      query.classTeacherOf = classTeacherOf;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('fullName email mobile teacherId classTeacherOf medium qualification isApproved isRejected isActive createdAt lastLogin academicYear');

    const total = await Teacher.countDocuments(query);

    // Get statistics for filtered teachers
    const stats = await Teacher.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $and: ['$isApproved', { $not: '$isRejected' }, '$isActive'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $and: [{ $not: '$isApproved' }, { $not: '$isRejected' }] }, 1, 0] } },
          rejected: { $sum: { $cond: ['$isRejected', 1, 0] } },
          inactive: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'शिक्षक सफलतापूर्वक प्राप्त हुए / Teachers retrieved successfully',
      data: teachers,
      stats: stats[0] || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        inactive: 0
      },
      filters: {
        medium,
        year: yearNum,
        status: status || 'all',
        classTeacherOf: classTeacherOf || 'all',
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
    console.error('Get admin teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'शिक्षक प्राप्त करने में त्रुटि / Error retrieving teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Teacher logout
// @route   POST /api/teachers/logout
// @access  Private (Teacher only)
export const logoutTeacher = async (req, res) => {
  try {
    // Clear the teacher token cookie
    res.cookie('teacherToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0) // Set to past date to delete cookie
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful / लॉगआउट सफल'
    });

  } catch (error) {
    console.error('Teacher logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed / लॉगआउट विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 