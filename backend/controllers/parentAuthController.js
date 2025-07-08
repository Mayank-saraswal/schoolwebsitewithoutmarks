import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Marks from '../models/Marks.js';

// Parent login using mobile number and child's date of birth
export const parentLogin = async (req, res) => {
  try {
    const { mobile, dob } = req.body;

    // Validation
    if (!mobile || !dob) {
      return res.status(400).json({
        success: false,
        message: 'मोबाइल नंबर और जन्म तिथि दोनों आवश्यक हैं / Mobile number and date of birth are required'
      });
    }

    // Validate mobile format
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें / Please enter a valid 10-digit mobile number'
      });
    }

    // Parse date of birth (DD-MM-YYYY format)
    const dobParts = dob.split('-');
    if (dobParts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'कृपया DD-MM-YYYY प्रारूप में जन्म तिथि दर्ज करें / Please enter date of birth in DD-MM-YYYY format'
      });
    }

        const [day, month, year] = dobParts;
    
    // Find students with matching parent mobile and date of birth
    const allStudents = await Student.find({
      parentMobile: mobile,
      isActive: true
    });
    
    // Simple JavaScript date matching (most reliable approach)
    const students = allStudents.filter(student => {
      const studentDate = new Date(student.dateOfBirth);
      const studentDay = studentDate.getDate();
      const studentMonth = studentDate.getMonth() + 1; // getMonth() returns 0-11
      const studentYear = studentDate.getFullYear();
      
      const inputDay = parseInt(day);
      const inputMonth = parseInt(month);
      const inputYear = parseInt(year);
      
      return studentDay === inputDay && studentMonth === inputMonth && studentYear === inputYear;
    });

    if (students.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'दिए गए विवरण से कोई छात्र नहीं मिला / No student found with the provided details'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        parentMobile: mobile,
        studentIds: students.map(s => s._id),
        type: 'parent'
      },
      'saraswati-school-parent-secret',
      { expiresIn: '7d' }
    );

    // Format student list for response
    const studentList = students.map(student => ({
      _id: student._id,
      name: student.studentName,
      class: student.class,
      medium: student.medium,
      srNumber: student.srNumber,
      dateOfBirth: student.dateOfBirth,
      subjects: student.subjects
    }));

    res.status(200).json({
      success: true,
      message: 'सफलतापूर्वक लॉगिन हो गए / Successfully logged in',
      data: {
        token,
        studentList,
        parentMobile: mobile
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify parent token
export const verifyParentToken = async (req, res) => {
  try {
    const parent = req.parent;
    
    // Get updated student list
    const students = await Student.find({
      _id: { $in: parent.studentIds },
      isActive: true
    }).select('studentName class medium srNumber dateOfBirth subjects');

    const studentList = students.map(student => ({
      _id: student._id,
      name: student.studentName,
      class: student.class,
      medium: student.medium,
      srNumber: student.srNumber,
      dateOfBirth: student.dateOfBirth,
      subjects: student.subjects
    }));

    res.status(200).json({
      success: true,
      message: 'टोकन वैध है / Token is valid',
      data: {
        studentList,
        parentMobile: parent.parentMobile
      }
    });

  } catch (error) {
    console.error('Parent token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get student marks grouped by subject and exam type
export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = req.parent;

    // Verify parent has access to this student
    if (!parent.studentIds.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'इस छात्र की जानकारी तक पहुंच नहीं है / Access denied for this student'
      });
    }

    // Get student details
    const student = await Student.findById(studentId).select('studentName class medium subjects');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Get all marks for this student
    const marks = await Marks.find({
      studentId: studentId
    }).populate('maxMarksId', 'examType maxMarks').sort({ createdAt: 1 });

    // Group marks by subject
    const subjectMarks = {};

    marks.forEach(mark => {
      if (!subjectMarks[mark.subject]) {
        subjectMarks[mark.subject] = [];
      }

      subjectMarks[mark.subject].push({
        examType: mark.maxMarksId?.examType || 'Unknown',
        score: mark.marksObtained,
        maxMarks: mark.maxMarksId?.maxMarks || mark.maxMarks,
        percentage: mark.maxMarksId?.maxMarks 
          ? Math.round((mark.marksObtained / mark.maxMarksId.maxMarks) * 100)
          : Math.round((mark.marksObtained / mark.maxMarks) * 100),
        date: mark.createdAt,
        remarks: mark.remarks || ''
      });
    });

    // Convert to array format
    const formattedMarks = Object.keys(subjectMarks).map(subject => ({
      subject: subject,
      marks: subjectMarks[subject].sort((a, b) => new Date(a.date) - new Date(b.date))
    }));

    res.status(200).json({
      success: true,
      message: 'छात्र के अंक सफलतापूर्वक प्राप्त हुए / Student marks retrieved successfully',
      data: {
        student: {
          name: student.studentName,
          class: student.class,
          medium: student.medium,
          subjects: student.subjects
        },
        marks: formattedMarks,
        totalSubjects: formattedMarks.length
      }
    });

  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get student fee details
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = req.parent;

    // Verify parent has access to this student
    if (!parent.studentIds.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'इस छात्र की जानकारी तक पहुंच नहीं है / Access denied for this student'
      });
    }

    // Get student fee details
    const student = await Student.findById(studentId).select(
      'studentName class classFee busFee feePaidClass feePaidBus feeStatus hasBus'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Calculate fee details
    const classFeeBalance = Math.max(0, student.classFee - student.feePaidClass);
    const busFeeBalance = Math.max(0, student.busFee - student.feePaidBus);

    const feeDetails = {
      student: {
        name: student.studentName,
        class: student.class
      },
      classFee: {
        total: student.classFee,
        paid: student.feePaidClass,
        pending: classFeeBalance,
        status: classFeeBalance === 0 ? 'Paid' : student.feePaidClass > 0 ? 'Partial' : 'Unpaid'
      },
      busFee: {
        total: student.busFee,
        paid: student.feePaidBus,
        pending: busFeeBalance,
        status: busFeeBalance === 0 ? 'Paid' : student.feePaidBus > 0 ? 'Partial' : 'Unpaid',
        applicable: student.hasBus
      },
      overall: {
        totalFees: student.classFee + student.busFee,
        totalPaid: student.feePaidClass + student.feePaidBus,
        totalPending: classFeeBalance + busFeeBalance,
        status: student.feeStatus
      }
    };

    res.status(200).json({
      success: true,
      message: 'फीस विवरण सफलतापूर्वक प्राप्त हुआ / Fee details retrieved successfully',
      data: feeDetails
    });

  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get marksheet data for PDF generation
export const getMarksheetData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = req.parent;

    // Verify parent has access to this student
    if (!parent.studentIds.includes(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'इस छात्र की जानकारी तक पहुंच नहीं है / Access denied for this student'
      });
    }

    // Get student details
    const student = await Student.findById(studentId).select(
      'studentName fatherName motherName class medium srNumber dateOfBirth subjects'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Get all marks for this student with exam type details
    const marks = await Marks.find({
      studentId: studentId
    }).populate('maxMarksId', 'examType maxMarks year class medium').sort({ 
      subject: 1, 
      createdAt: 1 
    });

    // Group marks by subject and exam type
    const marksheetData = {};
    const examTypes = new Set();

    marks.forEach(mark => {
      const subject = mark.subject;
      const examType = mark.maxMarksId?.examType || 'Unknown';
      
      examTypes.add(examType);

      if (!marksheetData[subject]) {
        marksheetData[subject] = {};
      }

      marksheetData[subject][examType] = {
        score: mark.marksObtained,
        maxMarks: mark.maxMarksId?.maxMarks || mark.maxMarks,
        percentage: mark.maxMarksId?.maxMarks 
          ? Math.round((mark.marksObtained / mark.maxMarksId.maxMarks) * 100)
          : Math.round((mark.marksObtained / mark.maxMarks) * 100)
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalSubjects: Object.keys(marksheetData).length,
      examTypes: Array.from(examTypes).sort(),
      generatedAt: new Date(),
      academicYear: new Date().getFullYear()
    };

    res.status(200).json({
      success: true,
      message: 'मार्कशीट डेटा सफलतापूर्वक प्राप्त हुआ / Marksheet data retrieved successfully',
      data: {
        student: {
          name: student.studentName,
          fatherName: student.fatherName,
          motherName: student.motherName,
          class: student.class,
          medium: student.medium,
          srNumber: student.srNumber,
          dateOfBirth: student.dateOfBirth,
          subjects: student.subjects
        },
        marks: marksheetData,
        stats: overallStats
      }
    });

  } catch (error) {
    console.error('Get marksheet data error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Parent logout
export const parentLogout = async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'सफलतापूर्वक लॉगआउट हो गए / Successfully logged out'
    });
  } catch (error) {
    console.error('Parent logout error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि / Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 