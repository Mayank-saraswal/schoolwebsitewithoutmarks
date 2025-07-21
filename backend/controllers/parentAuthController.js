import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

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
      dateOfBirth: student.dateOfBirth
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
    }).select('studentName class medium srNumber dateOfBirth');

    const studentList = students.map(student => ({
      _id: student._id,
      name: student.studentName,
      class: student.class,
      medium: student.medium,
      srNumber: student.srNumber,
      dateOfBirth: student.dateOfBirth
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
      'studentName class classFee busFee feeStatus hasBus'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'छात्र नहीं मिला / Student not found'
      });
    }

    // Safely extract fee data with fallbacks
    const classFeeTotal = Number(student.classFee?.total || 0);
    const classFeePaid = Number(student.classFee?.paid || 0);
    const busFeeTotal = Number(student.busFee?.total || 0);
    const busFeePaid = Number(student.busFee?.paid || 0);

    // Calculate fee details
    const classFeeBalance = Math.max(0, classFeeTotal - classFeePaid);
    const busFeeBalance = Math.max(0, busFeeTotal - busFeePaid);

    const feeDetails = {
      student: {
        name: student.studentName,
        class: student.class
      },
      classFee: {
        total: classFeeTotal,
        paid: classFeePaid,
        pending: classFeeBalance,
        status: classFeeBalance === 0 ? 'Paid' : classFeePaid > 0 ? 'Partial' : 'Unpaid'
      },
      busFee: {
        total: busFeeTotal,
        paid: busFeePaid,
        pending: busFeeBalance,
        status: busFeeBalance === 0 ? 'Paid' : busFeePaid > 0 ? 'Partial' : 'Unpaid',
        applicable: student.hasBus || false
      },
      overall: {
        totalFees: classFeeTotal + busFeeTotal,
        totalPaid: classFeePaid + busFeePaid,
        totalPending: classFeeBalance + busFeeBalance,
        status: student.feeStatus || 'Unpaid'
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