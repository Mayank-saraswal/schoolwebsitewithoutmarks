import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MaxMarks from '../models/MaxMarks.js';
import Subject from '../models/Subject.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-portal');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample max marks configurations
const maxMarksConfigs = [
  // Nursery - English Medium
  {
    class: 'Nursery',
    medium: 'English',
    examType: '1st Test',
    defaultMaxMarks: 50,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 50, isTheory: true },
      { subject: 'Numeracy', subjectCode: 'NUM', maxMarks: 50, isTheory: true },
      { subject: 'Drawing', subjectCode: 'DRW', maxMarks: 50, isPractical: true },
      { subject: 'Rhymes', subjectCode: 'RHY', maxMarks: 50, isTheory: true }
    ]
  },
  {
    class: 'Nursery',
    medium: 'English',
    examType: 'Half-Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Numeracy', subjectCode: 'NUM', maxMarks: 100, isTheory: true },
      { subject: 'Drawing', subjectCode: 'DRW', maxMarks: 100, isPractical: true },
      { subject: 'Rhymes', subjectCode: 'RHY', maxMarks: 100, isTheory: true }
    ]
  },
  {
    class: 'Nursery',
    medium: 'English',
    examType: 'Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Numeracy', subjectCode: 'NUM', maxMarks: 100, isTheory: true },
      { subject: 'Drawing', subjectCode: 'DRW', maxMarks: 100, isPractical: true },
      { subject: 'Rhymes', subjectCode: 'RHY', maxMarks: 100, isTheory: true }
    ]
  },

  // Class 1 - English Medium
  {
    class: 'Class 1',
    medium: 'English',
    examType: '1st Test',
    defaultMaxMarks: 50,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 50, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 50, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 50, isTheory: true },
      { subject: 'EVS', subjectCode: 'EVS', maxMarks: 50, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 50, isPractical: true }
    ]
  },
  {
    class: 'Class 1',
    medium: 'English',
    examType: 'Half-Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'EVS', subjectCode: 'EVS', maxMarks: 100, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 100, isPractical: true }
    ]
  },
  {
    class: 'Class 1',
    medium: 'English',
    examType: 'Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'EVS', subjectCode: 'EVS', maxMarks: 100, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 100, isPractical: true }
    ]
  },

  // Class 5 - English Medium
  {
    class: 'Class 5',
    medium: 'English',
    examType: '1st Test',
    defaultMaxMarks: 50,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 50, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 50, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 50, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 50, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 50, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 50, isPractical: true },
      { subject: 'Art & Craft', subjectCode: 'ART', maxMarks: 50, isPractical: true }
    ]
  },
  {
    class: 'Class 5',
    medium: 'English',
    examType: 'Half-Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 100, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 100, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 100, isPractical: true },
      { subject: 'Art & Craft', subjectCode: 'ART', maxMarks: 100, isPractical: true }
    ]
  },
  {
    class: 'Class 5',
    medium: 'English',
    examType: 'Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 100, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 100, isTheory: true },
      { subject: 'Computer', subjectCode: 'COM', maxMarks: 100, isPractical: true },
      { subject: 'Art & Craft', subjectCode: 'ART', maxMarks: 100, isPractical: true }
    ]
  },

  // Class 10 - English Medium
  {
    class: 'Class 10',
    medium: 'English',
    examType: '1st Test',
    defaultMaxMarks: 80,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 80, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 80, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 80, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 80, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 80, isTheory: true },
      { subject: 'Computer Application', subjectCode: 'COM', maxMarks: 80, isPractical: true }
    ]
  },
  {
    class: 'Class 10',
    medium: 'English',
    examType: 'Half-Yearly',
    defaultMaxMarks: 80,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 80, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 80, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 80, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 80, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 80, isTheory: true },
      { subject: 'Computer Application', subjectCode: 'COM', maxMarks: 80, isPractical: true }
    ]
  },
  {
    class: 'Class 10',
    medium: 'English',
    examType: 'Pre-Board',
    defaultMaxMarks: 80,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 80, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 80, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 80, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 80, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 80, isTheory: true },
      { subject: 'Computer Application', subjectCode: 'COM', maxMarks: 80, isPractical: true }
    ]
  },
  {
    class: 'Class 10',
    medium: 'English',
    examType: 'Final',
    defaultMaxMarks: 80,
    subjectMaxMarks: [
      { subject: 'English', subjectCode: 'ENG', maxMarks: 80, isTheory: true },
      { subject: 'Hindi', subjectCode: 'HIN', maxMarks: 80, isTheory: true },
      { subject: 'Mathematics', subjectCode: 'MAT', maxMarks: 80, isTheory: true },
      { subject: 'Science', subjectCode: 'SCI', maxMarks: 80, isTheory: true },
      { subject: 'Social Science', subjectCode: 'SSC', maxMarks: 80, isTheory: true },
      { subject: 'Computer Application', subjectCode: 'COM', maxMarks: 80, isPractical: true }
    ]
  },

  // Hindi Medium versions for some classes
  {
    class: 'Class 1',
    medium: 'Hindi',
    examType: 'Half-Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'अंग्रेजी', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'हिंदी', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'गणित', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'पर्यावरण अध्ययन', subjectCode: 'EVS', maxMarks: 100, isTheory: true },
      { subject: 'कंप्यूटर', subjectCode: 'COM', maxMarks: 100, isPractical: true }
    ]
  },
  {
    class: 'Class 5',
    medium: 'Hindi',
    examType: 'Half-Yearly',
    defaultMaxMarks: 100,
    subjectMaxMarks: [
      { subject: 'अंग्रेजी', subjectCode: 'ENG', maxMarks: 100, isTheory: true },
      { subject: 'हिंदी', subjectCode: 'HIN', maxMarks: 100, isTheory: true },
      { subject: 'गणित', subjectCode: 'MAT', maxMarks: 100, isTheory: true },
      { subject: 'विज्ञान', subjectCode: 'SCI', maxMarks: 100, isTheory: true },
      { subject: 'सामाजिक विज्ञान', subjectCode: 'SSC', maxMarks: 100, isTheory: true },
      { subject: 'कंप्यूटर', subjectCode: 'COM', maxMarks: 100, isPractical: true }
    ]
  }
];

// Function to seed max marks configurations
const seedMaxMarks = async () => {
  try {
    console.log('🌱 Starting max marks configuration seeding...');

    // Clear existing max marks configurations
    await MaxMarks.deleteMany({});
    console.log('🗑️  Cleared existing max marks configurations');

    // Insert new configurations
    for (const config of maxMarksConfigs) {
      try {
        const maxMarks = new MaxMarks(config);
        await maxMarks.save();
        console.log(`✅ Created max marks config: ${config.class} (${config.medium}) - ${config.examType}`);
      } catch (error) {
        console.error(`❌ Failed to create config for ${config.class} - ${config.examType}:`, error.message);
      }
    }

    console.log('🎉 Max marks configuration seeding completed successfully!');
    
    // Display summary
    const totalConfigs = await MaxMarks.countDocuments();
    console.log(`📊 Total configurations created: ${totalConfigs}`);

    // Show sample configuration
    const sampleConfig = await MaxMarks.findOne({ class: 'Class 5', medium: 'English', examType: 'Half-Yearly' });
    if (sampleConfig) {
      console.log('\n📝 Sample Configuration:');
      console.log(`   Class: ${sampleConfig.class} (${sampleConfig.medium})`);
      console.log(`   Exam: ${sampleConfig.examType}`);
      console.log(`   Default Max Marks: ${sampleConfig.defaultMaxMarks}`);
      console.log(`   Subjects: ${sampleConfig.subjectMaxMarks.length}`);
      sampleConfig.subjectMaxMarks.forEach(subject => {
        console.log(`     - ${subject.subject}: ${subject.maxMarks} marks (${subject.isTheory ? 'Theory' : 'Practical'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error seeding max marks configurations:', error);
    throw error;
  }
};

// Main execution function
const runSeeder = async () => {
  try {
    await connectDB();
    await seedMaxMarks();
    
    console.log('\n🏁 Seeding process completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Teachers can now upload marks with proper max marks validation');
    console.log('2. Max marks will be auto-fetched based on class and exam type');
    console.log('3. Admin can modify these configurations as needed');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeder();
}

export { seedMaxMarks, maxMarksConfigs }; 