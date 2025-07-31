import Announcement from '../models/Announcement.js';

// Create new announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, description, year, medium, visibility } = req.body;
    const admin = req.admin; // Admin is authenticated

    // Validation
    if (!title || !description || !year || !medium || !visibility) {
      return res.status(400).json({
        success: false,
        message: 'सभी फील्ड आवश्यक हैं / All fields are required'
      });
    }

    // Validate title length
    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'शीर्षक 100 अक्षरों से अधिक नहीं हो सकता / Title cannot exceed 100 characters'
      });
    }

    // Validate description length
    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'विवरण 1000 अक्षरों से अधिक नहीं हो सकता / Description cannot exceed 1000 characters'
      });
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > 2030) {
      return res.status(400).json({
        success: false,
        message: 'वर्ष 2020 से 2030 के बीच होना चाहिए / Year must be between 2020 and 2030'
      });
    }

    // Validate medium
    if (!['Hindi', 'English'].includes(medium)) {
      return res.status(400).json({
        success: false,
        message: 'माध्यम केवल Hindi या English हो सकता है / Medium must be either Hindi or English'
      });
    }

    // Validate visibility
    if (!['public', 'dashboard'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: 'दृश्यता केवल public या dashboard हो सकती है / Visibility must be either public or dashboard'
      });
    }

    // Create announcement
    const announcement = new Announcement({
      title: title.trim(),
      description: description.trim(),
      year: parseInt(year),
      medium,
      visibility,
      createdBy: admin._id,
      createdByName: admin.name
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'घोषणा सफलतापूर्वक बनाई गई / Announcement created successfully',
      data: {
        announcement: announcement.getSummary()
      }
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'घोषणा बनाने में त्रुटि / Error creating announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get announcements with filtering (Admin)
export const getAllAnnouncements = async (req, res) => {
  try {
    const { year, medium, visibility, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filters = {};
    if (year) filters.year = parseInt(year);
    if (medium) filters.medium = medium;
    if (visibility) filters.visibility = visibility;

    // Get total count for pagination
    const totalQuery = { isActive: true };
    if (filters.year) totalQuery.year = filters.year;
    if (filters.medium) totalQuery.medium = filters.medium;
    if (filters.visibility) totalQuery.visibility = filters.visibility;

    const totalAnnouncements = await Announcement.countDocuments(totalQuery);

    // Get announcements with pagination
    const announcements = await Announcement.find(totalQuery)
      .sort({ postedOn: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title description year medium visibility postedOn createdByName isActive');

    // Get statistics
    const stats = await Announcement.getStats(filters);

    res.status(200).json({
      success: true,
      message: 'घोषणाएं सफलतापूर्वक प्राप्त हुईं / Announcements retrieved successfully',
      data: {
        announcements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAnnouncements / limit),
          totalAnnouncements,
          limit: parseInt(limit)
        },
        statistics: stats[0] || {
          total: 0,
          public: 0,
          dashboard: 0,
          thisMonth: 0,
          thisWeek: 0
        }
      }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'घोषणाएं प्राप्त करने में त्रुटि / Error retrieving announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get public announcements (for homepage)
export const getPublicAnnouncements = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const announcements = await Announcement.getPublicAnnouncements(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'सार्वजनिक घोषणाएं सफलतापूर्वक प्राप्त हुईं / Public announcements retrieved successfully',
      data: {
        announcements,
        count: announcements.length
      }
    });

  } catch (error) {
    console.error('Get public announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'सार्वजनिक घोषणाएं प्राप्त करने में त्रुटि / Error retrieving public announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get dashboard announcements for specific year and medium (for student/parent dashboards)
export const getDashboardAnnouncements = async (req, res) => {
  try {
    const { year, medium } = req.query;
    const { limit = 10 } = req.query;

    if (!year || !medium) {
      return res.status(400).json({
        success: false,
        message: 'वर्ष और माध्यम आवश्यक हैं / Year and medium are required'
      });
    }

    const announcements = await Announcement.getDashboardAnnouncements(
      parseInt(year), 
      medium, 
      parseInt(limit)
    );

    // Add isRecent flag to each announcement
    const announcementsWithFlags = announcements.map(announcement => ({
      ...announcement.toObject(),
      isRecent: announcement.isRecent()
    }));

    res.status(200).json({
      success: true,
      message: 'डैशबोर्ड घोषणाएं सफलतापूर्वक प्राप्त हुईं / Dashboard announcements retrieved successfully',
      data: {
        announcements: announcementsWithFlags,
        count: announcementsWithFlags.length,
        year: parseInt(year),
        medium
      }
    });

  } catch (error) {
    console.error('Get dashboard announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'डैशबोर्ड घोषणाएं प्राप्त करने में त्रुटि / Error retrieving dashboard announcements',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOne({
      _id: id,
      isActive: true
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'घोषणा नहीं मिली / Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'घोषणा सफलतापूर्वक प्राप्त हुई / Announcement retrieved successfully',
      data: {
        announcement: {
          ...announcement.toObject(),
          isRecent: announcement.isRecent()
        }
      }
    });

  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'घोषणा प्राप्त करने में त्रुटि / Error retrieving announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.admin; // Admin is authenticated

    const announcement = await Announcement.findOne({
      _id: id,
      isActive: true
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'घोषणा नहीं मिली / Announcement not found'
      });
    }

    // Soft delete (set isActive to false)
    announcement.isActive = false;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'घोषणा सफलतापूर्वक हटाई गई / Announcement deleted successfully',
      data: {
        deletedAnnouncementId: id,
        deletedBy: admin.name
      }
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'घोषणा हटाने में त्रुटि / Error deleting announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get announcement statistics (Admin)
export const getAnnouncementStats = async (req, res) => {
  try {
    const { year, medium } = req.query;

    const filters = {};
    if (year) filters.year = parseInt(year);
    if (medium) filters.medium = medium;

    const stats = await Announcement.getStats(filters);

    res.status(200).json({
      success: true,
      message: 'घोषणा आंकड़े सफलतापूर्वक प्राप्त हुए / Announcement statistics retrieved successfully',
      data: {
        statistics: stats[0] || {
          total: 0,
          public: 0,
          dashboard: 0,
          thisMonth: 0,
          thisWeek: 0
        },
        filters
      }
    });

  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'घोषणा आंकड़े प्राप्त करने में त्रुटि / Error retrieving announcement statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 