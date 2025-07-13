import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all models
import Student from './backend/models/Student.js';
import Teacher from './backend/models/Teacher.js';
import Admission from './backend/models/Admission.js';
import Marks from './backend/models/Marks.js';
import Subject from './backend/models/Subject.js';
import ClassFee from './backend/models/ClassFee.js';
import BusRoute from './backend/models/BusRoute.js';
import PaymentRequest from './backend/models/PaymentRequest.js';
import Announcement from './backend/models/Announcement.js';
import AuditLog from './backend/models/AuditLog.js';
import MarksAuditLog from './backend/models/MarksAuditLog.js';
import ExamType from './backend/models/ExamType.js';
import MaxMarks from './backend/models/MaxMarks.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const resetDatabase = async () => {
  try {
    console.log('🗑️ Starting database reset...\n');

    // Clear all collections
    const results = await Promise.all([
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Admission.deleteMany({}),
      Marks.deleteMany({}),
      Subject.deleteMany({}),
      ClassFee.deleteMany({}),
      BusRoute.deleteMany({}),
      PaymentRequest.deleteMany({}),
      Announcement.deleteMany({}),
      AuditLog.deleteMany({}),
      MarksAuditLog.deleteMany({}),
      ExamType.deleteMany({}),
      MaxMarks.deleteMany({})
    ]);

    console.log('✅ Database reset completed successfully!\n');
    console.log('📊 Deleted records:');
    console.log(`   Students: ${results[0].deletedCount}`);
    console.log(`   Teachers: ${results[1].deletedCount}`);
    console.log(`   Admissions: ${results[2].deletedCount}`);
    console.log(`   Marks: ${results[3].deletedCount}`);
    console.log(`   Subjects: ${results[4].deletedCount}`);
    console.log(`   Class Fees: ${results[5].deletedCount}`);
    console.log(`   Bus Routes: ${results[6].deletedCount}`);
    console.log(`   Payment Requests: ${results[7].deletedCount}`);
    console.log(`   Announcements: ${results[8].deletedCount}`);
    console.log(`   Audit Logs: ${results[9].deletedCount}`);
    console.log(`   Marks Audit Logs: ${results[10].deletedCount}`);
    console.log(`   Exam Types: ${results[11].deletedCount}`);
    console.log(`   Max Marks: ${results[12].deletedCount}`);

    console.log('\n🎉 All database data has been cleared!');
    console.log('💡 You can now start fresh with your school management system.');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the reset
connectDB().then(resetDatabase); 