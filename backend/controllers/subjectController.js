import Subject from '../models/Subject.js';

// @desc    Create or update subjects for a class
// @route   POST /api/admin/subjects
// @access  Private (Admin only)
export const upsertSubjects = async (req, res) => {
  try {
    const { className, medium, year, subjects } = req.body;

    // Validate required fields
    if (!className || !medium || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'कक्षा, माध्यम और विषय सूची आवश्यक है / Class, medium and subjects list are required'
      });
    }

    // Validate and clean subjects
    const validatedSubjects = subjects
      .map(subject => subject.trim())
      .filter(subject => subject.length > 0);

    if (validatedSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'कम से कम एक वैध विषय आवश्यक है / At least one valid subject is required'
      });
    }

    // Use current year if not provided
    const academicYear = year || new Date().getFullYear();

    console.log('Creating/updating subjects with data:', {
      className,
      medium,
      year: academicYear,
      subjects: validatedSubjects
    });

    // Find and update or create new
    const updated = await Subject.findOneAndUpdate(
      { className, medium, year: academicYear },
      { $set: { subjects: validatedSubjects } },
      { new: true, upsert: true }
    );

    console.log('Subject document saved:', updated._id);

    res.status(200).json({
      success: true,
      message: `${className} (${medium}) के विषय सफलतापूर्वक अपडेट किए गए / Subjects for ${className} (${medium}) updated successfully`,
      data: {
        _id: updated._id,
        className: updated.className,
        medium: updated.medium,
        year: updated.year,
        subjects: updated.subjects,
        totalSubjects: updated.subjects.length
      }
    });

  } catch (error) {
    console.error('Error upserting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'विषय सेव करने में त्रुटि / Error saving subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get subjects for a specific class and medium
// @route   GET /api/subjects
// @access  Private (Teacher only)
export const getSubjects = async (req, res) => {
  try {
    const { className, medium, year } = req.query;

    if (!className || !medium) {
      return res.status(400).json({
        success: false,
        message: 'कक्षा और माध्यम आवश्यक है / Class and medium are required'
      });
    }

    // Use current year if not provided
    const academicYear = year || new Date().getFullYear();

    const doc = await Subject.findOne({ 
      className, 
      medium, 
      year: academicYear 
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'No subjects configured for this class and medium'
      });
    }

    res.status(200).json({
      success: true,
      data: doc.subjects,
      meta: {
        className: doc.className,
        medium: doc.medium,
        year: doc.year,
        totalSubjects: doc.subjects.length
      }
    });

  } catch (error) {
    console.error('Error getting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'विषय प्राप्त करने में त्रुटि / Error retrieving subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all subjects for admin management
// @route   GET /api/admin/subjects
// @access  Private (Admin only)
export const getAdminSubjects = async (req, res) => {
  try {
    const { className, medium, year } = req.query;

    // Build query
    const query = {};
    if (className) query.className = className;
    if (medium) query.medium = medium;
    if (year) query.year = parseInt(year);
    else query.year = new Date().getFullYear();

    const subjects = await Subject.find(query).sort({ 
      medium: 1, 
      className: 1,
      year: -1 
    });

    res.status(200).json({
      success: true,
      message: 'विषय सफलतापूर्वक प्राप्त हुए / Subjects retrieved successfully',
      data: subjects.map(doc => ({
        _id: doc._id,
        className: doc.className,
        medium: doc.medium,
        year: doc.year,
        subjects: doc.subjects,
        totalSubjects: doc.subjects.length,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      total: subjects.length,
      filters: {
        className: className || 'all',
        medium: medium || 'all',
        year: query.year
      }
    });

  } catch (error) {
    console.error('Error getting admin subjects:', error);
    res.status(500).json({
      success: false,
      message: 'विषय प्राप्त करने में त्रुटि / Error retrieving subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete subjects for a class
// @route   DELETE /api/admin/subjects/:id
// @access  Private (Admin only)
export const deleteSubjects = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'विषय नहीं मिले / Subjects not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'विषय सफलतापूर्वक हटाए गए / Subjects deleted successfully',
      data: {
        _id: deleted._id,
        className: deleted.className,
        medium: deleted.medium,
        year: deleted.year
      }
    });

  } catch (error) {
    console.error('Error deleting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'विषय हटाने में त्रुटि / Error deleting subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 