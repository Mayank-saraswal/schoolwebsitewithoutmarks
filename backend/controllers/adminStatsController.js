import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Announcement from '../models/Announcement.js';
import ExamType from '../models/ExamType.js';
import Admission from '../models/Admission.js';
import AuditLog from '../models/AuditLog.js';
import AuditLogger from '../utils/auditLogger.js';

// @desc    Get comprehensive admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
  try {
    const { medium, year } = req.query;

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

    // Base filter for year and medium
    const baseFilter = { medium, academicYear: yearNum };

    // Parallel aggregations for better performance
    const [
      studentStats,
      teacherStats,
      admissionStats,
      announcementStats,
      examStats,
      feeStats
    ] = await Promise.all([
      // Student Statistics
      Student.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            feePaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'paid'] }, 1, 0] } },
            feePartial: { $sum: { $cond: [{ $eq: ['$feeStatus', 'partial'] }, 1, 0] } },
            feeUnpaid: { $sum: { $cond: [{ $eq: ['$feeStatus', 'unpaid'] }, 1, 0] } },
            withBus: { $sum: { $cond: ['$hasBus', 1, 0] } },
            withoutBus: { $sum: { $cond: [{ $not: '$hasBus' }, 1, 0] } },
            totalClassFees: { $sum: '$classFee' },
            totalBusFees: { $sum: '$busFee' },
            paidClassFees: { 
              $sum: { 
                $cond: [
                  { $eq: ['$feeStatus', 'paid'] }, 
                  '$classFee', 
                  0
                ] 
              } 
            },
            paidBusFees: { 
              $sum: { 
                $cond: [
                  { $eq: ['$feeStatus', 'paid'] }, 
                  '$busFee', 
                  0
                ] 
              } 
            },
            pendingClassFees: { 
              $sum: { 
                $cond: [
                  { $ne: ['$feeStatus', 'paid'] }, 
                  '$classFee', 
                  0
                ] 
              } 
            },
            pendingBusFees: { 
              $sum: { 
                $cond: [
                  { $ne: ['$feeStatus', 'paid'] }, 
                  '$busFee', 
                  0
                ] 
              } 
            }
          }
        }
      ]),

      // Teacher Statistics
      Teacher.aggregate([
        { $match: { medium, academicYear: yearNum } },
        {
          $group: {
            _id: null,
            totalTeachers: { $sum: 1 },
            approvedTeachers: { 
              $sum: { 
                $cond: [
                  { $and: ['$isApproved', { $not: '$isRejected' }, '$isActive'] }, 
                  1, 
                  0
                ] 
              } 
            },
            pendingTeachers: { 
              $sum: { 
                $cond: [
                  { $and: [{ $not: '$isApproved' }, { $not: '$isRejected' }] }, 
                  1, 
                  0
                ] 
              } 
            },
            rejectedTeachers: { $sum: { $cond: ['$isRejected', 1, 0] } },
            inactiveTeachers: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } }
          }
        }
      ]),

      // Admission Statistics
      Admission.aggregate([
        { $match: { medium, year: yearNum } },
        {
          $group: {
            _id: null,
            totalAdmissions: { $sum: 1 },
            pendingAdmissions: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            underReviewAdmissions: { $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] } },
            approvedAdmissions: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejectedAdmissions: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),

      // Announcement Statistics
      Announcement.aggregate([
        { $match: { medium, year: yearNum, isActive: true } },
        {
          $group: {
            _id: null,
            totalAnnouncements: { $sum: 1 },
            publicAnnouncements: { $sum: { $cond: [{ $eq: ['$visibility', 'public'] }, 1, 0] } },
            dashboardAnnouncements: { $sum: { $cond: [{ $eq: ['$visibility', 'dashboard'] }, 1, 0] } },
            recentAnnouncements: {
              $sum: {
                $cond: [
                  { $gte: ['$postedOn', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Exam Type Statistics
      ExamType.aggregate([
        { $match: { medium, year: yearNum } },
        {
          $group: {
            _id: null,
            totalExamTypes: { $sum: 1 },
            upcomingExams: {
              $sum: {
                $cond: [
                  { $gte: ['$examDate', new Date()] },
                  1,
                  0
                ]
              }
            },
            examsByClass: {
              $push: {
                class: '$class',
                examType: '$examType'
              }
            }
          }
        }
      ]),

      // Fee Statistics (more detailed)
      Student.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$feeStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: { $add: ['$classFee', '$busFee'] } },
            classFeesTotal: { $sum: '$classFee' },
            busFeesTotal: { $sum: '$busFee' }
          }
        }
      ])
    ]);

    // Process results
    const studentData = studentStats[0] || {
      totalStudents: 0,
      feePaid: 0,
      feePartial: 0,
      feeUnpaid: 0,
      withBus: 0,
      withoutBus: 0,
      totalClassFees: 0,
      totalBusFees: 0,
      paidClassFees: 0,
      paidBusFees: 0,
      pendingClassFees: 0,
      pendingBusFees: 0
    };

    const teacherData = teacherStats[0] || {
      totalTeachers: 0,
      approvedTeachers: 0,
      pendingTeachers: 0,
      rejectedTeachers: 0,
      inactiveTeachers: 0
    };

    const admissionData = admissionStats[0] || {
      totalAdmissions: 0,
      pendingAdmissions: 0,
      underReviewAdmissions: 0,
      approvedAdmissions: 0,
      rejectedAdmissions: 0
    };

    const announcementData = announcementStats[0] || {
      totalAnnouncements: 0,
      publicAnnouncements: 0,
      dashboardAnnouncements: 0,
      recentAnnouncements: 0
    };

    const examData = examStats[0] || {
      totalExamTypes: 0,
      upcomingExams: 0,
      examsByClass: []
    };

    // Process fee data
    const feeBreakdown = feeStats.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        totalAmount: item.totalAmount,
        classFeesTotal: item.classFeesTotal,
        busFeesTotal: item.busFeesTotal
      };
      return acc;
    }, {});

    // Calculate summary metrics
    const totalRevenue = studentData.paidClassFees + studentData.paidBusFees;
    const pendingRevenue = studentData.pendingClassFees + studentData.pendingBusFees;
    const collectionRate = studentData.totalStudents > 0 
      ? Math.round((studentData.feePaid / studentData.totalStudents) * 100) 
      : 0;

    // Compile comprehensive stats
    const comprehensiveStats = {
      // Overview
      overview: {
        medium,
        year: yearNum,
        lastUpdated: new Date().toISOString()
      },

      // Student metrics
      students: {
        total: studentData.totalStudents,
        byFeeStatus: {
          paid: studentData.feePaid,
          partial: studentData.feePartial,
          unpaid: studentData.feeUnpaid
        },
        byBusService: {
          withBus: studentData.withBus,
          withoutBus: studentData.withoutBus
        },
        collectionRate: `${collectionRate}%`
      },

      // Teacher metrics
      teachers: {
        total: teacherData.totalTeachers,
        approved: teacherData.approvedTeachers,
        pending: teacherData.pendingTeachers,
        rejected: teacherData.rejectedTeachers,
        inactive: teacherData.inactiveTeachers
      },

      // Admission metrics
      admissions: {
        total: admissionData.totalAdmissions,
        pending: admissionData.pendingAdmissions,
        underReview: admissionData.underReviewAdmissions,
        approved: admissionData.approvedAdmissions,
        rejected: admissionData.rejectedAdmissions
      },

      // Financial metrics
      finance: {
        totalRevenue: totalRevenue,
        pendingRevenue: pendingRevenue,
        classFees: {
          collected: studentData.paidClassFees,
          pending: studentData.pendingClassFees,
          total: studentData.totalClassFees
        },
        busFees: {
          collected: studentData.paidBusFees,
          pending: studentData.pendingBusFees,
          total: studentData.totalBusFees
        },
        feeBreakdown
      },

      // Academic metrics
      academic: {
        announcements: {
          total: announcementData.totalAnnouncements,
          public: announcementData.publicAnnouncements,
          dashboard: announcementData.dashboardAnnouncements,
          recent: announcementData.recentAnnouncements
        },
        exams: {
          totalTypes: examData.totalExamTypes,
          upcoming: examData.upcomingExams
        }
      }
    };

    // Log the stats access
    await AuditLogger.logSystemAction(
      '📊 Dashboard Stats Accessed',
      { medium, year: yearNum, statsGenerated: true },
      req
    );

    res.status(200).json({
      success: true,
      message: 'आंकड़े सफलतापूर्वक प्राप्त हुए / Statistics retrieved successfully',
      data: comprehensiveStats
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    
    // Log the error
    await AuditLogger.logError(
      'Dashboard Stats Access',
      { medium: req.query?.medium, year: req.query?.year },
      'System',
      req,
      error
    );

    res.status(500).json({
      success: false,
      message: 'आंकड़े प्राप्त करने में त्रुटि / Error retrieving statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get audit logs with filtering
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      category,
      status,
      dateFrom,
      dateTo,
      medium,
      year,
      page = 1,
      limit = 50
    } = req.query;

    // Get filtered logs
    const result = await AuditLog.getFilteredLogs({
      action,
      category,
      status,
      dateFrom,
      dateTo,
      medium,
      year,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Format logs for frontend
    const formattedLogs = result.logs.map(log => ({
      id: log._id,
      action: log.action,
      category: log.category,
      status: log.status,
      severity: log.severity,
      timestamp: log.timestamp,
      formattedTime: new Date(log.timestamp).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      adminName: log.adminName,
      medium: log.medium,
      year: log.year,
      dataPreview: typeof log.data === 'object' 
        ? JSON.stringify(log.data).substring(0, 100) + '...'
        : String(log.data).substring(0, 100),
      fullData: log.data
    }));

    // Log the audit access
    await AuditLogger.logSystemAction(
      '🔍 Audit Logs Accessed',
      { 
        filters: { action, category, status, dateFrom, dateTo, medium, year },
        resultCount: formattedLogs.length 
      },
      req,
      { severity: 'low' }
    );

    res.status(200).json({
      success: true,
      message: 'ऑडिट लॉग सफलतापूर्वक प्राप्त हुए / Audit logs retrieved successfully',
      data: {
        logs: formattedLogs,
        pagination: result.pagination,
        filters: {
          action: action || 'all',
          category: category || 'all',
          status: status || 'all',
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          medium: medium || 'all',
          year: year || 'all'
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    
    // Log the error
    await AuditLogger.logError(
      'Audit Logs Access',
      { filters: req.query },
      'System',
      req,
      error
    );

    res.status(500).json({
      success: false,
      message: 'ऑडिट लॉग प्राप्त करने में त्रुटि / Error retrieving audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-stats
// @access  Private (Admin only)
export const getAuditStats = async (req, res) => {
  try {
    const { medium, year, days = 30 } = req.query;

    const stats = await AuditLog.getAuditStats({
      medium,
      year: year ? parseInt(year) : undefined,
      days: parseInt(days)
    });

    res.status(200).json({
      success: true,
      message: 'ऑडिट आंकड़े सफलतापूर्वक प्राप्त हुए / Audit statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'ऑडिट आंकड़े प्राप्त करने में त्रुटि / Error retrieving audit statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 