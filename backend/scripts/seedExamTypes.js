import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ExamType from '../models/ExamType.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-portal');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const examTypesData = [
  // Class 6th - Hindi
  { class: '6th', medium: 'Hindi', examType: '1st Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'Hindi', examType: '2nd Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'Hindi', examType: 'Half Yearly', maxMarks: 50, year: 2025 },
  { class: '6th', medium: 'Hindi', examType: '3rd Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'Hindi', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 6th - English
  { class: '6th', medium: 'English', examType: '1st Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'English', examType: '2nd Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'English', examType: 'Half Yearly', maxMarks: 50, year: 2025 },
  { class: '6th', medium: 'English', examType: '3rd Test', maxMarks: 10, year: 2025 },
  { class: '6th', medium: 'English', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 7th - Hindi
  { class: '7th', medium: 'Hindi', examType: '1st Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'Hindi', examType: '2nd Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'Hindi', examType: 'Half Yearly', maxMarks: 50, year: 2025 },
  { class: '7th', medium: 'Hindi', examType: '3rd Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'Hindi', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 7th - English
  { class: '7th', medium: 'English', examType: '1st Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'English', examType: '2nd Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'English', examType: 'Half Yearly', maxMarks: 50, year: 2025 },
  { class: '7th', medium: 'English', examType: '3rd Test', maxMarks: 10, year: 2025 },
  { class: '7th', medium: 'English', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 8th - Hindi
  { class: '8th', medium: 'Hindi', examType: 'Weekly Test', maxMarks: 5, year: 2025 },
  { class: '8th', medium: 'Hindi', examType: 'Monthly Test', maxMarks: 25, year: 2025 },
  { class: '8th', medium: 'Hindi', examType: 'Quarterly Exam', maxMarks: 50, year: 2025 },
  { class: '8th', medium: 'Hindi', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '8th', medium: 'Hindi', examType: 'Annual Exam', maxMarks: 100, year: 2025 },

  // Class 8th - English
  { class: '8th', medium: 'English', examType: 'Weekly Test', maxMarks: 5, year: 2025 },
  { class: '8th', medium: 'English', examType: 'Monthly Test', maxMarks: 25, year: 2025 },
  { class: '8th', medium: 'English', examType: 'Quarterly Exam', maxMarks: 50, year: 2025 },
  { class: '8th', medium: 'English', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '8th', medium: 'English', examType: 'Annual Exam', maxMarks: 100, year: 2025 },

  // Class 9th - Hindi
  { class: '9th', medium: 'Hindi', examType: 'Unit Test 1', maxMarks: 20, year: 2025 },
  { class: '9th', medium: 'Hindi', examType: 'Unit Test 2', maxMarks: 20, year: 2025 },
  { class: '9th', medium: 'Hindi', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '9th', medium: 'Hindi', examType: 'Pre-Board', maxMarks: 80, year: 2025 },
  { class: '9th', medium: 'Hindi', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 9th - English
  { class: '9th', medium: 'English', examType: 'Unit Test 1', maxMarks: 20, year: 2025 },
  { class: '9th', medium: 'English', examType: 'Unit Test 2', maxMarks: 20, year: 2025 },
  { class: '9th', medium: 'English', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '9th', medium: 'English', examType: 'Pre-Board', maxMarks: 80, year: 2025 },
  { class: '9th', medium: 'English', examType: 'Annual Exam', maxMarks: 80, year: 2025 },

  // Class 10th - Hindi
  { class: '10th', medium: 'Hindi', examType: 'Unit Test 1', maxMarks: 20, year: 2025 },
  { class: '10th', medium: 'Hindi', examType: 'Unit Test 2', maxMarks: 20, year: 2025 },
  { class: '10th', medium: 'Hindi', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'Hindi', examType: 'Pre-Board 1', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'Hindi', examType: 'Pre-Board 2', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'Hindi', examType: 'Board Exam', maxMarks: 80, year: 2025 },

  // Class 10th - English
  { class: '10th', medium: 'English', examType: 'Unit Test 1', maxMarks: 20, year: 2025 },
  { class: '10th', medium: 'English', examType: 'Unit Test 2', maxMarks: 20, year: 2025 },
  { class: '10th', medium: 'English', examType: 'Half Yearly', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'English', examType: 'Pre-Board 1', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'English', examType: 'Pre-Board 2', maxMarks: 80, year: 2025 },
  { class: '10th', medium: 'English', examType: 'Board Exam', maxMarks: 80, year: 2025 }
];

const seedExamTypes = async () => {
  try {
    console.log('🌱 Starting exam types seeding...');

    // Clear existing exam types
    await ExamType.deleteMany({});
    console.log('🗑️  Cleared existing exam types');

    // Insert new exam types
    const createdExamTypes = await ExamType.insertMany(examTypesData);
    console.log(`✅ Created ${createdExamTypes.length} exam types`);

    // Display summary
    const summary = {};
    createdExamTypes.forEach(examType => {
      const key = `${examType.class} ${examType.medium}`;
      if (!summary[key]) {
        summary[key] = 0;
      }
      summary[key]++;
    });

    console.log('\n📊 Summary by Class & Medium:');
    Object.entries(summary).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} exam types`);
    });

    console.log('\n🎉 Exam types seeding completed successfully!');
    console.log('\n📝 Sample data includes:');
    console.log('   • Classes: 6th, 7th, 8th, 9th, 10th');
    console.log('   • Mediums: Hindi, English');
    console.log('   • Academic Year: 2025');
    console.log('   • Various exam types with different max marks');

  } catch (error) {
    console.error('❌ Error seeding exam types:', error);
    
    if (error.code === 11000) {
      console.error('💡 Duplicate entry detected. This might be due to unique constraint violations.');
    }
    
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedExamTypes();
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Start your backend server: npm run dev');
    console.log('   2. Login as admin: admin@saraswatischool / Saraswati@2024');
    console.log('   3. Navigate to Exam Configuration in admin dashboard');
    console.log('   4. Test the exam type management features');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { seedExamTypes, examTypesData }; 