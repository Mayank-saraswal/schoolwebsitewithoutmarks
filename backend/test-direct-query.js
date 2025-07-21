// Test direct MongoDB queries vs Mongoose queries
import mongoose from 'mongoose';
import Student from './models/Student.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testDirectQuery = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('\n=== TESTING DIRECT VS MONGOOSE QUERIES ===');

    // Test 1: Direct MongoDB collection query
    const directQuery1 = await Student.collection.find({ academicYear: '2025' }).toArray();
    console.log('1. Direct MongoDB query (academicYear: "2025"):', directQuery1.length);

    // Test 2: Direct MongoDB collection query with medium
    const directQuery2 = await Student.collection.find({ medium: 'Hindi', academicYear: '2025' }).toArray();
    console.log('2. Direct MongoDB query (medium: Hindi, academicYear: "2025"):', directQuery2.length);

    // Test 3: Mongoose query
    const mongooseQuery1 = await Student.find({ academicYear: '2025' });
    console.log('3. Mongoose query (academicYear: "2025"):', mongooseQuery1.length);

    // Test 4: Mongoose query with medium
    const mongooseQuery2 = await Student.find({ medium: 'Hindi', academicYear: '2025' });
    console.log('4. Mongoose query (medium: Hindi, academicYear: "2025"):', mongooseQuery2.length);

    // Test 5: Check if there's a schema issue
    console.log('\n=== CHECKING SCHEMA ===');
    const studentSchema = Student.schema;
    const academicYearPath = studentSchema.path('academicYear');
    console.log('Academic year schema type:', academicYearPath?.instance);
    console.log('Academic year schema options:', academicYearPath?.options);

    // Test 6: Raw find without any processing
    const rawFind = await Student.collection.find({}).toArray();
    console.log('\n=== RAW DOCUMENT STRUCTURE ===');
    if (rawFind.length > 0) {
      const doc = rawFind[0];
      console.log('Academic Year field:', doc.academicYear);
      console.log('Medium field:', doc.medium);
      console.log('All fields:', Object.keys(doc));
    }

    // Test 7: Try to find by exact field values from raw document
    if (rawFind.length > 0) {
      const doc = rawFind[0];
      const exactQuery = await Student.find({ 
        academicYear: doc.academicYear,
        medium: doc.medium 
      });
      console.log('\n7. Exact match with raw values:', exactQuery.length);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the test
testDirectQuery();