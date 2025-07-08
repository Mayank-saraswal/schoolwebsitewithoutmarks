import Marks from '../models/Marks.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import MaxMarks from '../models/MaxMarks.js';
import ExamType from '../models/ExamType.js';
import MarksAuditLog from '../models/MarksAuditLog.js';
import Teacher from '../models/Teacher.js';

// @desc    Get exams for teacher's class and medium
// @route   GET /api/marks/teacher-exams
// @access  Private (Teacher only)
export const getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const { academicYear } = req.query;
    const currentYear = academicYear || new Date().getFullYear().toString();

    // Get exam types for teacher's class and medium
    const examTypes = await ExamType.find({
      class: teacher.classTeacherOf,
      medium: teacher.medium,
      year: parseInt(currentYear)
    }).sort({ examType: 1 });

    // Get max marks configurations
    const maxMarksConfigs = await MaxMarks.find({
      class: teacher.classTeacherOf,
      medium: teacher.medium,
      academicYear: currentYear,
      isActive: true
    });

    // Get subjects for the class
    const subjects = await Subject.getSubjectsForClass(teacher.classTeacherOf, teacher.medium);

    // Get available classes for the teacher to select from
    const availableClasses = [
      'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
      'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
    ];

    res.status(200).json({
      success: true,
      data: {
        examTypes,
        maxMarksConfigs,
        subjects,
        availableClasses,
        teacherInfo: {
          class: teacher.classTeacherOf,
          medium: teacher.medium,
          academicYear: currentYear
        }
      }
    });

  } catch (error) {
    console.error('Get teacher exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Set max marks for subjects in an exam
// @route   POST /api/marks/set-max-marks
// @access  Private (Teacher only)
export const setMaxMarks = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const {
      examType,
      subjectMaxMarks,
      defaultMaxMarks = 100,
      academicYear,
      notes = ''
    } = req.body;

    if (!examType || !subjectMaxMarks || !Array.isArray(subjectMaxMarks)) {
      return res.status(400).json({
        success: false,
        message: 'Exam type and subject max marks array are required'
      });
    }

    const currentYear = academicYear || new Date().getFullYear().toString();

    // Check if max marks already exist
    let maxMarksConfig = await MaxMarks.findOne({
      class: teacher.classTeacherOf,
      medium: teacher.medium,
      examType,
      academicYear: currentYear
    });

    if (maxMarksConfig) {
      // Update existing configuration
      maxMarksConfig.subjectMaxMarks = subjectMaxMarks;
      maxMarksConfig.defaultMaxMarks = defaultMaxMarks;
      maxMarksConfig.notes = notes;
      maxMarksConfig.lastUpdatedBy = teacher.fullName;
      await maxMarksConfig.save();
    } else {
      // Create new configuration
      maxMarksConfig = new MaxMarks({
        class: teacher.classTeacherOf,
        medium: teacher.medium,
        examType,
        subjectMaxMarks,
        defaultMaxMarks,
        academicYear: currentYear,
        notes,
        createdBy: teacher.fullName,
        lastUpdatedBy: teacher.fullName
      });
      await maxMarksConfig.save();
    }

    res.status(200).json({
      success: true,
      message: 'Max marks configuration saved successfully',
      data: maxMarksConfig.getExamConfig()
    });

  } catch (error) {
    console.error('Set max marks error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Max marks configuration already exists for this exam type'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save max marks configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Upload marks for a student
// @route   POST /api/marks/upload
// @access  Private (Teacher only)
export const uploadMarks = async (req, res) => {
  try {
    const {
      studentId,
      examType,
      marks,
      remarks = ''
    } = req.body;

    const teacherId = req.teacher.id;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Validate required fields
    if (!studentId || !examType || !marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, exam type, and marks array are required'
      });
    }

    // Get and validate student
    const student = await Student.findOne({
      _id: studentId,
      createdBy: teacherId // Ensure teacher can only upload marks for their students
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have permission to upload marks for this student'
      });
    }

    // Check if marks already exist for this student and exam
    const existingMarks = await Marks.findOne({
      studentId,
      examType,
      academicYear: new Date().getFullYear().toString()
    });

    if (existingMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks for ${examType} already exist for this student. Use update endpoint to modify.`,
        existingMarks: existingMarks.getFormattedResult()
      });
    }

    // Get max marks configuration to validate marks
    const maxMarksConfig = await MaxMarks.getMaxMarksForExam(
      student.class,
      student.medium,
      examType
    );

    // Validate marks against max marks
    for (const mark of marks) {
      let maxAllowed = maxMarksConfig ? 
        maxMarksConfig.getSubjectMaxMarks(mark.subject) : 
        100; // Default if no config

      if (mark.obtained > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `Obtained marks for ${mark.subject} (${mark.obtained}) cannot exceed maximum marks (${maxAllowed})`
        });
      }
    }

    // Create marks record
    const marksData = {
      studentId: student._id,
      studentName: student.studentName,
      srNumber: student.srNumber,
      class: student.class,
      medium: student.medium,
      examType,
      marks: marks.map(mark => ({
        subject: mark.subject,
        subjectCode: mark.subjectCode || mark.subject.substring(0, 3).toUpperCase(),
        obtained: mark.obtained,
        maxMarks: mark.maxMarks || (maxMarksConfig ? maxMarksConfig.getSubjectMaxMarks(mark.subject) : 100)
      })),
      uploadedBy: teacherId,
      uploadedByName: teacher.fullName,
      remarks,
      academicYear: new Date().getFullYear().toString()
    };

    const newMarks = new Marks(marksData);
    await newMarks.save();

    // Log the action
    await MarksAuditLog.create({
      studentId: student._id,
      studentName: student.studentName,
      examType,
      action: 'CREATE',
      performedBy: teacherId,
      performedByName: teacher.fullName,
      details: `Marks uploaded for ${marks.length} subjects`
    });

    res.status(201).json({
      success: true,
      message: `Marks uploaded successfully for ${student.studentName}`,
      data: newMarks.getFormattedResult()
    });

  } catch (error) {
    console.error('Upload marks error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Marks for this student and exam type already exist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload marks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update marks for a student
// @route   PUT /api/marks/update/:marksId
// @access  Private (Teacher only)
export const updateMarks = async (req, res) => {
  try {
    const { marksId } = req.params;
    const { marks, remarks } = req.body;

    const teacherId = req.teacher.id;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Find existing marks
    const existingMarks = await Marks.findById(marksId);
    if (!existingMarks) {
      return res.status(404).json({
        success: false,
        message: 'Marks record not found'
      });
    }

    // Verify teacher has permission to update these marks
    const student = await Student.findOne({
      _id: existingMarks.studentId,
      createdBy: teacherId
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update marks for this student'
      });
    }

    // Update marks
    if (marks && Array.isArray(marks)) {
      existingMarks.marks = marks.map(mark => ({
        subject: mark.subject,
        subjectCode: mark.subjectCode || mark.subject.substring(0, 3).toUpperCase(),
        obtained: mark.obtained,
        maxMarks: mark.maxMarks
      }));
    }

    if (remarks !== undefined) {
      existingMarks.remarks = remarks;
    }

    existingMarks.lastUpdatedBy = teacherId;
    existingMarks.lastUpdatedByName = teacher.fullName;

    await existingMarks.save();

    // Log the action
    await MarksAuditLog.create({
      studentId: student._id,
      studentName: student.studentName,
      examType: existingMarks.examType,
      action: 'UPDATE',
      performedBy: teacherId,
      performedByName: teacher.fullName,
      details: `Marks updated for ${existingMarks.marks.length} subjects`
    });

    res.status(200).json({
      success: true,
      message: 'Marks updated successfully',
      data: existingMarks.getFormattedResult()
    });

  } catch (error) {
    console.error('Update marks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update marks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get marks for teacher's students
// @route   GET /api/marks/teacher-students-marks
// @access  Private (Teacher only)
export const getTeacherStudentsMarks = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const { examType, academicYear, studentId } = req.query;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get teacher's students
    const students = await Student.find({ createdBy: teacherId });
    const studentIds = students.map(s => s._id);

    // Build query
    const query = { studentId: { $in: studentIds } };
    
    if (examType) query.examType = examType;
    if (academicYear) query.academicYear = academicYear;
    if (studentId) query.studentId = studentId;

    const marks = await Marks.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'studentName srNumber class');

    res.status(200).json({
      success: true,
      data: marks.map(mark => mark.getFormattedResult())
    });

  } catch (error) {
    console.error('Get teacher students marks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get marks for parent dashboard
// @route   GET /api/marks/student/:studentId
// @access  Private (Parent only)
export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { examType, academicYear } = req.query;

    // Build query
    const query = { 
      studentId,
      isPublished: true // Only show published marks to parents
    };
    
    if (examType) query.examType = examType;
    if (academicYear) query.academicYear = academicYear;

    const marks = await Marks.find(query).sort({ createdAt: -1 });

    if (marks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No marks found for this student'
      });
    }

    // Get student info
    const student = await Student.findById(studentId);

    res.status(200).json({
      success: true,
      data: {
        student: student ? student.getProfileData() : null,
        marks: marks.map(mark => mark.getFormattedResult())
      }
    });

  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student marks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get marks uploaded by teacher
// @route   GET /api/marks/my-uploads
// @access  Private (Teacher only)
export const getMyUploads = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const {
      page = 1,
      limit = 20,
      examType,
      class: filterClass,
      search
    } = req.query;

    // Build query
    const query = { uploadedBy: teacherId };

    if (examType && examType !== 'all') {
      query.examType = examType;
    }

    if (filterClass && filterClass !== 'all') {
      query.class = filterClass;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { srNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const marks = await Marks.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Marks.countDocuments(query);

    // Get statistics
    const stats = await Marks.getStats({ uploadedBy: teacherId });

    res.status(200).json({
      success: true,
      data: marks.map(mark => mark.getFormattedResult()),
      stats: stats[0] || {},
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
    console.error('Get my uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch uploaded marks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get max marks configuration for exam
// @route   GET /api/marks/max-marks/:class/:examType
// @access  Private (Teacher only)
export const getMaxMarksConfig = async (req, res) => {
  try {
    const { class: className, examType } = req.params;
    const { medium } = req.query;

    const teacherMedium = medium || req.teacher.medium;

    if (!className || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Class and exam type are required'
      });
    }

    // Get max marks configuration
    const maxMarksConfig = await MaxMarks.getMaxMarksForExam(className, teacherMedium, examType);

    if (!maxMarksConfig) {
      return res.status(404).json({
        success: false,
        message: `No max marks configuration found for ${className} (${teacherMedium}) - ${examType}`,
        defaultMaxMarks: 100
      });
    }

    res.status(200).json({
      success: true,
      data: maxMarksConfig.getExamConfig()
    });

  } catch (error) {
    console.error('Get max marks config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch max marks configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get exam types for class
// @route   GET /api/marks/exam-types/:class
// @access  Private (Teacher only)
export const getExamTypes = async (req, res) => {
  try {
    const { class: className } = req.params;
    const { medium } = req.query;

    const teacherMedium = medium || req.teacher.medium;

    // Get configured exam types
    const configuredExams = await MaxMarks.getConfiguredExamTypes(className, teacherMedium);

    // Default exam types if none configured
    const defaultExamTypes = [
      '1st Test', '2nd Test', 'Half-Yearly', '3rd Test', 'Yearly', 'Pre-Board', 'Final'
    ];

    const examTypes = configuredExams.length > 0 
      ? configuredExams.map(exam => ({
          examType: exam.examType,
          defaultMaxMarks: exam.defaultMaxMarks
        }))
      : defaultExamTypes.map(type => ({
          examType: type,
          defaultMaxMarks: 100
        }));

    res.status(200).json({
      success: true,
      data: {
        class: className,
        medium: teacherMedium,
        examTypes,
        isConfigured: configuredExams.length > 0
      }
    });

  } catch (error) {
    console.error('Get exam types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam types',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 

// @desc    Get subjects for a specific class
// @route   GET /api/marks/subjects-for-class/:className
// @access  Private (Teacher only)
export const getSubjectsForClass = async (req, res) => {
  try {
    const { className } = req.params;
    const { medium } = req.query;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    // Use teacher's medium as default
    const teacherMedium = medium || req.teacher.medium;

    // Get subjects for the specified class and medium
    const subjects = await Subject.getSubjectsForClass(className, teacherMedium);

    res.status(200).json({
      success: true,
      data: {
        class: className,
        medium: teacherMedium,
        subjects: subjects,
        totalSubjects: subjects.length
      }
    });

  } catch (error) {
    console.error('Get subjects for class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects for class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get exams for a specific class
// @route   GET /api/marks/exams-for-class/:className
// @access  Private (Teacher only)
export const getExamsForClass = async (req, res) => {
  try {
    const { className } = req.params;
    const { medium } = req.query;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    // Use teacher's medium as default
    const teacherMedium = medium || req.teacher.medium;
    const { academicYear } = req.query;
    const currentYear = academicYear || new Date().getFullYear().toString();

    // Get exam types for the specified class and medium
    const examTypes = await ExamType.find({
      class: className,
      medium: teacherMedium,
      year: parseInt(currentYear)
    }).sort({ examType: 1 });

    // Get max marks configurations for the class
    const maxMarksConfigs = await MaxMarks.find({
      class: className,
      medium: teacherMedium,
      academicYear: currentYear,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        class: className,
        medium: teacherMedium,
        academicYear: currentYear,
        examTypes,
        maxMarksConfigs
      }
    });

  } catch (error) {
    console.error('Get exams for class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams for class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 



// @desc    Set max marks for exam and subject list
// @route   POST /api/teacher/set-max-marks
// @access  Private (Teacher only)
export const setMaxMarksForExam = async (req, res) => {
  try {
    const { examId, subjectList } = req.body;
    
    // Get teacher info
    const teacherId = req.teacher.id;
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Validate required fields
    if (!examId || !subjectList || !Array.isArray(subjectList)) {
      return res.status(400).json({
        success: false,
        message: 'examId and subjectList are required'
      });
    }

    // Validate subjectList structure
    for (const item of subjectList) {
      if (!item.subject || typeof item.maxMarks !== 'number' || item.maxMarks <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each subject must have a valid subject name and maxMarks > 0'
        });
      }
    }

    // Get exam details to validate
    const exam = await ExamType.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Ensure teacher can only set marks for their own class
    if (exam.class !== teacher.classTeacherOf || exam.medium !== teacher.medium) {
      return res.status(403).json({
        success: false,
        message: 'You can only set marks for your own class and medium'
      });
    }

    // Check if MaxMark entry already exists (upsert logic)
    const filter = {
      examId: examId,
      class: teacher.classTeacherOf,
      medium: teacher.medium
    };

    const maxMarkData = {
      examId: examId,
      class: teacher.classTeacherOf,
      medium: teacher.medium,
      subjects: subjectList,
      createdBy: teacherId,
      lastUpdatedBy: teacherId
    };

    // Upsert: update if exists, create if not
    const maxMarkConfig = await MaxMarks.findOneAndUpdate(
      filter,
      maxMarkData,
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Max marks saved successfully',
      data: {
        id: maxMarkConfig._id,
        examId: maxMarkConfig.examId,
        class: maxMarkConfig.class,
        medium: maxMarkConfig.medium,
        subjects: maxMarkConfig.subjects,
        totalSubjects: maxMarkConfig.subjects.length
      }
    });

  } catch (error) {
    console.error('Set max marks for exam error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Max marks configuration already exists for this exam'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save max marks configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 