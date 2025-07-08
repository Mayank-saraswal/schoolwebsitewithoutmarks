import Admission from '../models/Admission.js';

// @desc    Create new admission application
// @route   POST /api/admissions
// @access  Public
export const createAdmission = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      studentClass,
      parentName,
      phone,
      email,
      address,
      medium
    } = req.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !studentClass || !parentName || !phone || !email || !address) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
        fields: {
          fullName: !fullName ? 'Student name is required' : null,
          dateOfBirth: !dateOfBirth ? 'Date of birth is required' : null,
          studentClass: !studentClass ? 'Class selection is required' : null,
          parentName: !parentName ? 'Parent name is required' : null,
          phone: !phone ? 'Mobile number is required' : null,
          email: !email ? 'Email address is required' : null,
          address: !address ? 'Address is required' : null
        }
      });
    }

    // Additional validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 3 || age > 18) {
      return res.status(400).json({
        success: false,
        message: 'Student age must be between 3-18 years'
      });
    }

    // Create new admission record
    const newAdmission = new Admission({
      fullName: fullName.trim(),
      dateOfBirth,
      studentClass,
      parentName: parentName.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      medium: medium || 'English'
    });

    // Save to database
    const savedAdmission = await newAdmission.save();

    // Success response
    res.status(200).json({
      success: true,
      message: 'Admission application submitted successfully! | आवेदन सफलतापूर्वक जमा हो गया।',
      data: {
        applicationId: savedAdmission.applicationId,
        studentName: savedAdmission.fullName,
        class: savedAdmission.studentClass,
        medium: savedAdmission.medium,
        status: savedAdmission.status,
        submissionDate: savedAdmission.submissionDate,
        academicYear: savedAdmission.academicYear
      },
      nextSteps: [
        'You will receive a confirmation email shortly',
        'Our admission team will contact you within 2-3 working days',
        'Please keep your Application ID safe: ' + savedAdmission.applicationId
      ]
    });

  } catch (error) {
    console.error('Admission creation error:', error);

    // Handle duplicate entry errors
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(400).json({
        success: false,
        message: 'An application with this email already exists for this academic year',
        error: 'DUPLICATE_EMAIL'
      });
    }

    if (error.code === 'DUPLICATE_PHONE') {
      return res.status(400).json({
        success: false,
        message: 'An application with this phone number already exists for this academic year',
        error: 'DUPLICATE_PHONE'
      });
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `An application with this ${field} already exists`,
        error: 'DUPLICATE_ENTRY'
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
      message: 'Failed to submit admission application. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all admissions (for admin)
// @route   GET /api/admissions
// @access  Private (Admin only)
export const getAllAdmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      academicYear,
      studentClass,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    if (studentClass) query.studentClass = studentClass;
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const admissions = await Admission.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Admission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: admissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admission records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get admissions for admin dashboard with medium and year filters
// @route   GET /api/admin/admissions
// @access  Private (Admin only)
export const getAdminAdmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      medium,
      year,
      status,
      studentClass,
      search
    } = req.query;

    console.log('Admin Admissions Query Params:', { medium, year, status, studentClass, search });

    // Build base query - NO REQUIRED FILTERS (so we can see all data)
    const query = {};
    
    // Add medium filter if provided
    if (medium && medium !== 'all') {
      if (!['Hindi', 'English'].includes(medium)) {
        return res.status(400).json({
          success: false,
          message: 'अमान्य माध्यम / Invalid medium'
        });
      }
      query.medium = medium;
    }

    // Add year filter if provided - Convert year to academicYear format
    if (year && year !== 'all') {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
        return res.status(400).json({
          success: false,
          message: 'अमान्य वर्ष (2020-2030) / Invalid year (2020-2030)'
        });
      }
      
      // Convert year to academicYear format (e.g., 2025 → "2025-2026")
      const academicYear = `${yearNum}-${yearNum + 1}`;
      query.academicYear = academicYear;
    }
    
    // Additional filters
    if (status && status !== 'all') query.status = status;
    if (studentClass && studentClass !== 'all') query.studentClass = studentClass;
    
    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Final Query:', query);

    // Execute query with pagination
    const admissions = await Admission.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('fullName studentClass parentName phone email medium createdAt status applicationId address dateOfBirth academicYear');

    const total = await Admission.countDocuments(query);

    console.log(`Found ${total} admissions matching query`);

    // Get summary statistics for current filters
    const stats = await Admission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      underReview: stats.find(s => s._id === 'under-review')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: admissions,
      stats: formattedStats,
      filters: {
        medium: medium || 'all',
        year: year || 'all',
        status: status || 'all',
        studentClass: studentClass || 'all',
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
    console.error('Get admin admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admission records for admin',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get ALL admissions (debug route)
// @route   GET /api/admin/admissions/debug
// @access  Private (Admin only)
export const getDebugAdmissions = async (req, res) => {
  try {
    // Get all admissions without filters
    const admissions = await Admission.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select('fullName studentClass medium academicYear status createdAt applicationId');

    const total = await Admission.countDocuments({});

    console.log(`DEBUG: Found ${total} total admissions in database`);
    console.log('DEBUG: Sample records:', admissions.slice(0, 3));

    res.status(200).json({
      success: true,
      message: `Found ${total} total admissions in database`,
      data: admissions,
      totalCount: total,
      sampleFields: admissions.length > 0 ? Object.keys(admissions[0].toObject()) : []
    });

  } catch (error) {
    console.error('Debug admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug admission records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get admission by ID
// @route   GET /api/admissions/:id
// @access  Private
export const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });

  } catch (error) {
    console.error('Get admission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admission record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get admission statistics
// @route   GET /api/admissions/stats
// @access  Private (Admin only)
export const getAdmissionStats = async (req, res) => {
  try {
    const { academicYear } = req.query;

    const stats = await Admission.getStats(academicYear);
    
    const totalApplications = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    const formattedStats = {
      total: totalApplications,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      underReview: stats.find(s => s._id === 'under-review')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
      academicYear: academicYear || 'All Years'
    });

  } catch (error) {
    console.error('Get admission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admission statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 