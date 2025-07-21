// Debug the academic year issue
import mongoose from 'mongoose';
import Student from './models/Student.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const debugYearIssue = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get raw document
    const rawDoc = await Student.collection.findOne({});
    console.log('\n=== RAW DOCUMENT ===');
    console.log('Academic Year (raw):', rawDoc.academicYear, '(Type:', typeof rawDoc.academicYear, ')');
    
    // Get all distinct academic year values
    const allYears = await Student.collection.distinct('academicYear');
    console.log('All academic years:', allYears);
    
    // Try exact match with raw value
    const exactMatch = await Student.collection.find({ academicYear: rawDoc.academicYear }).toArray();
    console.log('Exact match with raw value:', exactMatch.length);
    
    // Update the student to have string academic year
    console.log('\n=== UPDATING ACADEMIC YEAR TO STRING ===');
    const updateResult = await Student.collection.updateOne(
      { _id: rawDoc._id },
      { $set: { academicYear: '2025' } }
    );
    console.log('Update result:', updateResult.modifiedCount, 'documents modified');
    
    // Test query after update
    const afterUpdate = await Student.find({ academicYear: '2025' });
    console.log('Query after update:', afterUpdate.length, 'results');
    
    if (afterUpdate.length > 0) {
      console.log('✅ Academic year fix successful!');
      console.log('Student:', afterUpdate[0].studentName, '- Year:', afterUpdate[0].academicYear);
    }

  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the debug
debugYearIssue();