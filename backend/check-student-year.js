// Check what academic year format the student has
import mongoose from 'mongoose';
import Student from './models/Student.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkStudentYear = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the existing student
    const student = await Student.findOne({});
    
    if (student) {
      console.log('\n=== EXISTING STUDENT DATA ===');
      console.log('Name:', student.studentName);
      console.log('Academic Year:', student.academicYear, '(Type:', typeof student.academicYear, ')');
      console.log('Medium:', student.medium);
      
      // Test queries with different year formats
      console.log('\n=== TESTING YEAR QUERIES ===');
      
      const queries = [
        { academicYear: student.academicYear },
        { academicYear: '2025' },
        { academicYear: 2025 },
        { medium: 'Hindi' },
        { medium: 'Hindi', academicYear: student.academicYear }
      ];

      for (let i = 0; i < queries.length; i++) {
        const result = await Student.find(queries[i]);
        console.log(`Query ${i + 1}:`, JSON.stringify(queries[i]), '→', result.length, 'results');
      }
    } else {
      console.log('No student found');
    }

  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the check
checkStudentYear();