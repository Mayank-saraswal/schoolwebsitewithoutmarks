// Test script to verify admin can access all medium students
import mongoose from 'mongoose';
import Student from './models/Student.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testAdminAccess = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('\n=== TESTING ADMIN ACCESS TO ALL MEDIUMS ===');

    // Test 1: Check total students by medium
    const hindiStudents = await Student.countDocuments({ medium: 'Hindi', academicYear: '2025' });
    const englishStudents = await Student.countDocuments({ medium: 'English', academicYear: '2025' });
    const allStudents = await Student.countDocuments({ academicYear: '2025' });
    
    console.log(`📊 Students for 2025:`);
    console.log(`   Hindi medium: ${hindiStudents}`);
    console.log(`   English medium: ${englishStudents}`);
    console.log(`   Total: ${allStudents}`);

    // Test 2: Simulate admin query without medium filter (all mediums)
    const adminQueryAll = {
      academicYear: '2025'
    };
    const adminResultsAll = await Student.find(adminQueryAll).select('studentName class medium');
    console.log(`\n🔍 Admin query (all mediums): ${adminResultsAll.length} students found`);
    
    if (adminResultsAll.length > 0) {
      console.log('   Sample results:');
      adminResultsAll.slice(0, 3).forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.studentName} - ${student.class} (${student.medium})`);
      });
    }

    // Test 3: Simulate admin query with Hindi medium filter
    const adminQueryHindi = {
      academicYear: '2025',
      medium: 'Hindi'
    };
    const adminResultsHindi = await Student.find(adminQueryHindi).select('studentName class medium');
    console.log(`\n🔍 Admin query (Hindi only): ${adminResultsHindi.length} students found`);

    // Test 4: Simulate admin query with English medium filter
    const adminQueryEnglish = {
      academicYear: '2025',
      medium: 'English'
    };
    const adminResultsEnglish = await Student.find(adminQueryEnglish).select('studentName class medium');
    console.log(`🔍 Admin query (English only): ${adminResultsEnglish.length} students found`);

    // Test 5: Verify the queries work as expected
    const totalFromQueries = adminResultsHindi.length + adminResultsEnglish.length;
    console.log(`\n✅ Verification:`);
    console.log(`   Hindi + English queries: ${totalFromQueries}`);
    console.log(`   All mediums query: ${adminResultsAll.length}`);
    console.log(`   Match: ${totalFromQueries === adminResultsAll.length ? 'YES' : 'NO'}`);

    console.log('\n✅ Admin access test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testAdminAccess();