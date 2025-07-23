import express from 'express';
import { 
  adminLogin, 
  verifyAdminToken as verifyTokenController, 
  adminLogout,
  getTeacherRequests,
  approveTeacher,
  rejectTeacher
} from '../controllers/adminAuthController.js';
import { getAdminAdmissions, getAdmissionStats, getDebugAdmissions } from '../controllers/admissionController.js';
import { getAdminStudents } from '../controllers/studentController.js';
import { 
  getAdminStats,
  getAuditLogs,
  getAuditStats 
} from '../controllers/adminStatsController.js';
import {
  addStudent,
  getStudents,
  createExamConfig,
  getExamConfigs,
  getSubjectsForClass,
  updateExamConfig,
  deleteExamConfig
} from '../controllers/adminController.js';
import { 
  setClassFee,
  setBusRouteFee,
  getClassFees,
  getBusRouteFees,
  getFeeForClass,
  getFeeForBusRoute,
  createBusRoute,
  updateBusRoute,
  deleteBusRoute,
  forceDeleteBusRoute,
  getAllBusRoutes,
  getBusRouteFee,
  testBusRouteCreation
} from '../controllers/configController.js';
import { verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== AUTH ROUTES =====
// POST /api/admin/login - Admin login
router.post('/login', adminLogin);

// GET /api/admin/verify - Verify admin token
router.get('/verify', verifyAdminToken, verifyTokenController);

// POST /api/admin/logout - Admin logout
router.post('/logout', verifyAdminToken, adminLogout);

// ===== PROTECTED ADMIN ROUTES =====
// GET /api/admin/admissions - Get filtered admissions for dashboard
router.get('/admissions', verifyAdminToken, getAdminAdmissions);

// GET /api/admin/admissions/debug - Get all admissions (debug)
router.get('/admissions/debug', verifyAdminToken, getDebugAdmissions);

// GET /api/admin/students - Get filtered students for dashboard
router.get('/students', verifyAdminToken, getAdminStudents);

// Teacher routes removed - functionality moved to admin-only management

// ===== STUDENT MANAGEMENT ROUTES =====
// GET /api/admin/next-sr-number - Get next available SR number
router.get('/next-sr-number', verifyAdminToken, async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const currentYear = new Date().getFullYear();
    
    // Find the highest SR number for current year
    const lastStudent = await Student.findOne({
      srNumber: { $regex: `^SR${currentYear}` }
    }).sort({ srNumber: -1 });
    
    let nextNumber = 1;
    if (lastStudent) {
      const lastNumber = parseInt(lastStudent.srNumber.replace(`SR${currentYear}`, ''));
      nextNumber = lastNumber + 1;
    }
    
    const nextSRNumber = `SR${currentYear}${nextNumber.toString().padStart(3, '0')}`;
    
    res.json({
      success: true,
      data: { nextSRNumber }
    });
  } catch (error) {
    console.error('Error generating SR number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SR number'
    });
  }
});

// GET /api/admin/bus-routes - Get all active bus routes
router.get('/bus-routes', verifyAdminToken, async (req, res) => {
  try {
    const BusRoute = (await import('../models/BusRoute.js')).default;
    const routes = await BusRoute.find({ isActive: true }).sort({ routeName: 1 });
    
    res.json({
      success: true,
      data: routes.map(route => ({
        _id: route._id,
        routeName: route.routeName,
        routeCode: route.routeCode,
        fee: route.feeAmount,
        availableSeats: route.maxStudents - (route.currentStudents || 0),
        maxStudents: route.maxStudents,
        currentStudents: route.currentStudents || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching bus routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus routes'
    });
  }
});

// GET /api/admin/student-form-config - Get form configuration for student creation
router.get('/student-form-config', verifyAdminToken, async (req, res) => {
  try {
    const { class: className, medium } = req.query;
    
    if (!className || !medium) {
      return res.status(400).json({
        success: false,
        message: 'Class and medium are required'
      });
    }
    
    const ClassFee = (await import('../models/ClassFee.js')).default;
    const Subject = (await import('../models/Subject.js')).default;
    
    const academicYear = new Date().getFullYear().toString();
    
    // Get fee structure
    let classFee = 0;
    try {
      const feeStructure = await ClassFee.getFeeStructureForClass(className, medium, academicYear);
      classFee = feeStructure ? feeStructure.totalFee : 0;
    } catch (error) {
      console.log('Fee structure not found for:', className, medium);
    }
    
    // Get subjects
    let subjects = [];
    try {
      const subjectDoc = await Subject.findOne({ class: className, medium });
      subjects = subjectDoc ? subjectDoc.subjects : [];
    } catch (error) {
      console.log('Subjects not found for:', className, medium);
    }
    
    res.json({
      success: true,
      data: {
        subjects,
        classFee,
        class: className,
        medium,
        academicYear
      }
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form configuration'
    });
  }
});

// POST /api/admin/add-student - Add new student (moved to adminController)
router.post('/add-student', verifyAdminToken, addStudent);

// GET /api/admin/students-list - Get students list (moved to adminController)
router.get('/students-list', verifyAdminToken, getStudents);

// ===== EXAM CONFIGURATION ROUTES =====
// POST /api/admin/exam-setup - Create exam configuration
router.post('/exam-setup', verifyAdminToken, createExamConfig);

// GET /api/admin/exam-configs - Get exam configurations
router.get('/exam-configs', verifyAdminToken, getExamConfigs);

// GET /api/admin/subjects - Get subjects for class and medium
router.get('/subjects', verifyAdminToken, getSubjectsForClass);

// PUT /api/admin/exam-setup/:id - Update exam configuration
router.put('/exam-setup/:id', verifyAdminToken, updateExamConfig);

// DELETE /api/admin/exam-setup/:id - Delete exam configuration
router.delete('/exam-setup/:id', verifyAdminToken, deleteExamConfig);

// GET /api/admin/dashboard-stats - Get comprehensive dashboard statistics
router.get('/dashboard-stats', verifyAdminToken, getAdminStats);

// GET /api/admin/audit-logs - Get audit logs with filtering
router.get('/audit-logs', verifyAdminToken, getAuditLogs);

// GET /api/admin/audit-stats - Get audit log statistics
router.get('/audit-stats', verifyAdminToken, getAuditStats);

// GET /api/admin/stats - Get admission statistics (legacy)
router.get('/stats', verifyAdminToken, getAdmissionStats);

// ===== TEACHER MANAGEMENT ROUTES =====
// GET /api/admin/teacher-requests - Get all teacher requests
router.get('/teacher-requests', verifyAdminToken, getTeacherRequests);

// PATCH /api/admin/approve-teacher/:id - Approve teacher request
router.patch('/approve-teacher/:id', verifyAdminToken, approveTeacher);

// PATCH /api/admin/reject-teacher/:id - Reject teacher request
router.patch('/reject-teacher/:id', verifyAdminToken, rejectTeacher);


// ===== FEE MANAGEMENT ROUTES =====
// POST /api/admin/set-class-fee - Set/Update class fee
router.post('/set-class-fee', verifyAdminToken, setClassFee);

// POST /api/admin/set-bus-fee - Set/Update bus route fee
router.post('/set-bus-fee', verifyAdminToken, setBusRouteFee);

// GET /api/admin/class-fees - Get all class fees
router.get('/class-fees', verifyAdminToken, getClassFees);

// GET /api/admin/bus-fees - Get all bus route fees
router.get('/bus-fees', verifyAdminToken, getBusRouteFees);

// GET /api/admin/fee/class/:class/:medium/:academicYear? - Get fee for specific class
router.get('/fee/class/:class/:medium/:academicYear?', verifyAdminToken, getFeeForClass);

// GET /api/admin/fee/bus/:routeIdentifier - Get fee for specific bus route
router.get('/fee/bus/:routeIdentifier', verifyAdminToken, getFeeForBusRoute);

// ===== BUS ROUTE MANAGEMENT ROUTES =====
// POST /api/admin/create-bus-route - Create new bus route
router.post('/create-bus-route', verifyAdminToken, createBusRoute);

// PUT /api/admin/update-bus-route/:id - Update bus route
router.put('/update-bus-route/:id', verifyAdminToken, updateBusRoute);

// DELETE /api/admin/delete-bus-route/:id - Delete bus route
router.delete('/delete-bus-route/:id', verifyAdminToken, deleteBusRoute);

// DELETE /api/admin/force-delete-bus-route/:id - Force delete bus route (reassign students)
router.delete('/force-delete-bus-route/:id', verifyAdminToken, forceDeleteBusRoute);

// GET /api/admin/test-bus-route - Test bus route creation (debug)
router.get('/test-bus-route', testBusRouteCreation);

// POST /api/admin/test-create-bus-route - Test create bus route without auth (debug)
router.post('/test-create-bus-route', createBusRoute);

// Debug endpoints without authentication
router.get('/debug/fees', async (req, res) => {
  try {
    const ClassFee = (await import('../models/ClassFee.js')).default;
    const fees = await ClassFee.find({}).sort({ class: 1, medium: 1 });
    res.json({
      success: true,
      count: fees.length,
      data: fees.map(f => ({
        class: f.class,
        medium: f.medium,
        totalFee: f.totalFee,
        academicYear: f.academicYear
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/debug/routes', async (req, res) => {
  try {
    const BusRoute = (await import('../models/BusRoute.js')).default;
    const routes = await BusRoute.find({}).sort({ routeName: 1 });
    res.json({
      success: true,
      count: routes.length,
      data: routes.map(r => ({
        routeName: r.routeName,
        routeCode: r.routeCode,
        feeAmount: r.feeAmount,
        isActive: r.isActive,
        academicYear: r.academicYear
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add missing Class 12 Science fee
router.post('/debug/add-class12-fee', async (req, res) => {
  try {
    const ClassFee = (await import('../models/ClassFee.js')).default;
    
    const feeData = {
      class: 'Class 12 Science',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 6500,
        tuitionFee: 12000,
        examFee: 2500,
        bookFee: 3500,
        uniformFee: 2500,
        activityFee: 1500,
        developmentFee: 3000,
        otherFee: 1500
      },
      paymentSchedule: 'Annual',
      academicYear: '2025'
    };

    const classFee = new ClassFee(feeData);
    await classFee.save();

    res.json({
      success: true,
      message: 'Class 12 Science (Hindi) fee added successfully',
      data: classFee.getFeeBreakdown()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add sample bus route
router.post('/debug/add-bus-route', async (req, res) => {
  try {
    const BusRoute = (await import('../models/BusRoute.js')).default;
    
    const routeData = {
      routeName: 'Mansarovar Route',
      routeCode: 'R001',
      feeAmount: 8000,
      stops: [],
      driverInfo: {
        driverName: 'Ramesh Kumar',
        driverMobile: '9876543210',
        driverLicense: 'RJ14201800001',
        experienceYears: 10
      },
      busInfo: {
        busNumber: 'RJ14CA1234',
        busModel: 'Tata Bus',
        capacity: 40
      },
      isActive: true,
      academicYear: '2025',
      maxStudents: 32,
      currentStudents: 0
    };

    const busRoute = new BusRoute(routeData);
    await busRoute.save();

    res.json({
      success: true,
      message: 'Bus route added successfully',
      data: busRoute.getRouteSummary()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Debug version of getStudentFormConfig without authentication
router.get('/debug/student-form/:class', async (req, res) => {
  try {
    const { class: className } = req.params;
    const { medium } = req.query;
    
    const selectedMedium = medium || 'Hindi';
    const academicYear = new Date().getFullYear().toString();

    console.log(`Debug: Fetching config for ${className}, Medium: ${selectedMedium}, Year: ${academicYear}`);

    // Import models
    const ClassFee = (await import('../models/ClassFee.js')).default;
    const BusRoute = (await import('../models/BusRoute.js')).default;
    let feeStructure = null;
    let busRoutes = [];
    let busRouteOptions = [];
    let allRoutes = [];

    // Get fee structure
    try {
      feeStructure = await ClassFee.getFeeStructureForClass(className, selectedMedium, academicYear);
      console.log(`Debug: Fee structure found:`, !!feeStructure);
      if (feeStructure) {
        console.log(`Debug: Total fee: ₹${feeStructure.totalFee}`);
      }
    } catch (error) {
      console.error('Debug: Error fetching fee structure:', error);
    }

    // Get bus routes
    try {
      allRoutes = await BusRoute.find({ academicYear }).sort({ routeName: 1 });
      console.log(`Debug: Found ${allRoutes.length} total bus routes`);
      
      busRoutes = allRoutes.filter(route => route.isActive);
      console.log(`Debug: Found ${busRoutes.length} active bus routes`);

      busRouteOptions = busRoutes.map(route => ({
        value: route.routeName,
        label: `${route.routeName} (₹${route.feeAmount}) - Available`,
        code: route.routeCode,
        fee: route.feeAmount,
        availableSeats: route.maxStudents - (route.currentStudents || 0)
      }));
    } catch (error) {
      console.error('Debug: Error fetching bus routes:', error);
    }

    const classFeeAmount = feeStructure ? feeStructure.totalFee : 0;

    const responseData = {
      class: className,
      medium: selectedMedium,
      academicYear,
      classFee: classFeeAmount,
      feeBreakdown: feeStructure ? feeStructure.getFeeBreakdown() : null,
      busRoutes: busRouteOptions,
      configComplete: classFeeAmount > 0 || busRouteOptions.length > 0,
      debug: {
        feeFound: !!feeStructure,
        totalFee: classFeeAmount,
        busRoutesCount: busRoutes.length,
        allRoutesCount: allRoutes.length
      }
    };

    console.log('Debug response:', JSON.stringify(responseData, null, 2));

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Debug student form config error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Activate all bus routes
router.post('/debug/activate-routes', async (req, res) => {
  try {
    const BusRoute = (await import('../models/BusRoute.js')).default;
    
    const result = await BusRoute.updateMany(
      { isActive: false },
      { $set: { isActive: true } }
    );

    res.json({
      success: true,
      message: `Activated ${result.modifiedCount} bus routes`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all database data (for fresh start)
router.post('/debug/clear-all-data', async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const ClassFee = (await import('../models/ClassFee.js')).default;
    const BusRoute = (await import('../models/BusRoute.js')).default;
    const Teacher = (await import('../models/Teacher.js')).default;
    const Admission = (await import('../models/Admission.js')).default;
    const PaymentRequest = (await import('../models/PaymentRequest.js')).default;
    const Announcement = (await import('../models/Announcement.js')).default;
    const AuditLog = (await import('../models/AuditLog.js')).default;

    console.log('🗑️ Starting database cleanup...');

    // Delete all collections
    const studentsDeleted = await Student.deleteMany({});
    const classFeeDeleted = await ClassFee.deleteMany({});
    const busRouteDeleted = await BusRoute.deleteMany({});
    const teachersDeleted = await Teacher.deleteMany({});
    const admissionsDeleted = await Admission.deleteMany({});
    const paymentsDeleted = await PaymentRequest.deleteMany({});
    const announcementsDeleted = await Announcement.deleteMany({});
    const auditLogsDeleted = await AuditLog.deleteMany({});

    console.log('🗑️ Database cleanup completed!');

    res.json({
      success: true,
      message: 'All database data cleared successfully! / सभी डेटाबेस डेटा सफलतापूर्वक साफ़ किया गया!',
      deletedCounts: {
        students: studentsDeleted.deletedCount,
        classFees: classFeeDeleted.deletedCount,
        busRoutes: busRouteDeleted.deletedCount,
        teachers: teachersDeleted.deletedCount,
        admissions: admissionsDeleted.deletedCount,
        payments: paymentsDeleted.deletedCount,
        announcements: announcementsDeleted.deletedCount,
        auditLogs: auditLogsDeleted.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to clear database / डेटाबेस साफ़ करने में विफल'
    });
  }
});

// Create test teacher for debugging
router.post('/debug/create-test-teacher', async (req, res) => {
  try {
    const Teacher = (await import('../models/Teacher.js')).default;
    const bcryptjs = (await import('bcryptjs')).default;

    // Check if test teacher already exists
    const existingTeacher = await Teacher.findOne({ mobile: '9999999999' });
    if (existingTeacher) {
      return res.json({
        success: true,
        message: 'Test teacher already exists',
        data: {
          teacher: existingTeacher.getProfileData()
        }
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('123456', 12);

    // Create test teacher
    const teacherData = {
      fullName: 'Test Teacher',
      mobile: '9999999999',
      email: 'test.teacher@school.com',
      password: hashedPassword,
      classTeacherOf: 'Class 12 Science',
      medium: 'Hindi',
      address: 'Test Address, Test City',
      qualification: 'B.Ed',
      isApproved: true,
      isActive: true,
      approvedBy: 'Admin',
      approvedAt: new Date()
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();

    res.json({
      success: true,
      message: 'Test teacher created successfully!',
      data: {
        teacher: teacher.getProfileData(),
        loginCredentials: {
          mobile: '9999999999',
          password: '123456'
        }
      }
    });

  } catch (error) {
    console.error('Error creating test teacher:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to create test teacher'
    });
  }
});

export default router; 