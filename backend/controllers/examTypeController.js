import ExamType from '../models/ExamType.js';
import mongoose from 'mongoose';

// Add or update exam type
export const addExamType = async (req, res) => {
  try {
    const { class: className, medium, examType, maxMarks, year } = req.body;

    // Validation
    if (!className || !medium || !examType || !maxMarks || !year) {
      return res.status(400).json({
        success: false,
        message: 'सभी fields आवश्यक हैं / All fields are required'
      });
    }

    // Validate medium
    if (!['Hindi', 'English'].includes(medium)) {
      return res.status(400).json({
        success: false,
        message: 'Medium must be Hindi or English'
      });
    }

    // Validate maxMarks
    if (maxMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Maximum marks must be greater than 0'
      });
    }

    // Check if exam type already exists for this class/medium/year
    const existingExamType = await ExamType.findOne({
      class: className,
      medium,
      examType,
      year
    });

    if (existingExamType) {
      return res.status(409).json({
        success: false,
        message: `Exam type "${examType}" already exists for ${className} ${medium} ${year}`
      });
    }

    // Create new exam type
    const newExamType = new ExamType({
      class: className,
      medium,
      examType,
      maxMarks,
      year
    });

    await newExamType.save();

    res.status(201).json({
      success: true,
      message: 'Exam type added successfully',
      data: newExamType
    });

  } catch (error) {
    console.error('Error adding exam type:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This exam type already exists for the specified class, medium, and year'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get exam types with filters
export const getExamTypes = async (req, res) => {
  try {
    const { class: className, medium, year } = req.query;

    // Build filter object
    const filters = {};
    if (className) filters.class = className;
    if (medium) filters.medium = medium;
    if (year) filters.year = parseInt(year);

    const examTypes = await ExamType.getByFilters(filters);

    res.status(200).json({
      success: true,
      message: 'Exam types retrieved successfully',
      data: examTypes,
      count: examTypes.length
    });

  } catch (error) {
    console.error('Error getting exam types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update exam type
export const updateExamType = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: className, medium, examType, maxMarks, year } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type ID'
      });
    }

    // Validation
    if (!className || !medium || !examType || !maxMarks || !year) {
      return res.status(400).json({
        success: false,
        message: 'सभी fields आवश्यक हैं / All fields are required'
      });
    }

    // Validate medium
    if (!['Hindi', 'English'].includes(medium)) {
      return res.status(400).json({
        success: false,
        message: 'Medium must be Hindi or English'
      });
    }

    // Validate maxMarks
    if (maxMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Maximum marks must be greater than 0'
      });
    }

    // Check if exam type exists
    const existingExamType = await ExamType.findById(id);
    if (!existingExamType) {
      return res.status(404).json({
        success: false,
        message: 'Exam type not found'
      });
    }

    // Check for duplicates (excluding current record)
    const duplicateCheck = await ExamType.findOne({
      class: className,
      medium,
      examType,
      year,
      _id: { $ne: id }
    });

    if (duplicateCheck) {
      return res.status(409).json({
        success: false,
        message: `Exam type "${examType}" already exists for ${className} ${medium} ${year}`
      });
    }

    // Update exam type
    const updatedExamType = await ExamType.findByIdAndUpdate(
      id,
      {
        class: className,
        medium,
        examType,
        maxMarks,
        year,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Exam type updated successfully',
      data: updatedExamType
    });

  } catch (error) {
    console.error('Error updating exam type:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This exam type already exists for the specified class, medium, and year'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete exam type
export const deleteExamType = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type ID'
      });
    }

    // Check if exam type exists
    const examType = await ExamType.findById(id);
    if (!examType) {
      return res.status(404).json({
        success: false,
        message: 'Exam type not found'
      });
    }

    // Delete exam type
    await ExamType.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Exam type deleted successfully',
      data: examType
    });

  } catch (error) {
    console.error('Error deleting exam type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all classes and years for dropdown options
export const getExamTypeOptions = async (req, res) => {
  try {
    // Get unique classes
    const classes = await ExamType.distinct('class');
    
    // Get unique years
    const years = await ExamType.distinct('year');
    
    // Predefined mediums
    const mediums = ['Hindi', 'English'];

    res.status(200).json({
      success: true,
      message: 'Exam type options retrieved successfully',
      data: {
        classes: classes.sort(),
        mediums,
        years: years.sort((a, b) => b - a) // Latest year first
      }
    });

  } catch (error) {
    console.error('Error getting exam type options:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get exam type by ID
export const getExamTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type ID'
      });
    }

    const examType = await ExamType.findById(id);
    
    if (!examType) {
      return res.status(404).json({
        success: false,
        message: 'Exam type not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam type retrieved successfully',
      data: examType
    });

  } catch (error) {
    console.error('Error getting exam type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 