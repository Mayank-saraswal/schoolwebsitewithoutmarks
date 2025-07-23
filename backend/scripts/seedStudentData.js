import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from '../models/Subject.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';

// Load environment variables
dotenv.config();

const seedStudentData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create default subjects
    console.log('🔄 Creating default subjects...');
    const createdSubjects = await Subject.createDefaultSubjects();
    console.log(`✅ Created ${createdSubjects.length} subject configurations`);

    // Create sample class fees
    console.log('🔄 Creating sample class fees...');
    const classFees = [
      {
        class: 'Class 1',
        medium: 'Hindi',
        feeStructure: {
          admissionFee: 2000,
          tuitionFee: 8000,
          examFee: 1000,
          bookFee: 1500,
          uniformFee: 1500,
          activityFee: 1000,
          developmentFee: 2000,
          otherFee: 1000
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      },
      {
        class: 'Class 1',
        medium: 'English',
        feeStructure: {
          admissionFee: 2500,
          tuitionFee: 10000,
          examFee: 1200,
          bookFee: 2000,
          uniformFee: 1800,
          activityFee: 1200,
          developmentFee: 2500,
          otherFee: 1200
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      },
      {
        class: 'Class 5',
        medium: 'Hindi',
        feeStructure: {
          admissionFee: 3000,
          tuitionFee: 12000,
          examFee: 1500,
          bookFee: 2000,
          uniformFee: 2000,
          activityFee: 1500,
          developmentFee: 3000,
          otherFee: 1500
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      },
      {
        class: 'Class 5',
        medium: 'English',
        feeStructure: {
          admissionFee: 3500,
          tuitionFee: 15000,
          examFee: 1800,
          bookFee: 2500,
          uniformFee: 2200,
          activityFee: 1800,
          developmentFee: 3500,
          otherFee: 1800
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      },
      {
        class: 'Class 10',
        medium: 'Hindi',
        feeStructure: {
          admissionFee: 5000,
          tuitionFee: 18000,
          examFee: 2500,
          bookFee: 3000,
          uniformFee: 2500,
          activityFee: 2000,
          developmentFee: 4000,
          otherFee: 2000
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      },
      {
        class: 'Class 10',
        medium: 'English',
        feeStructure: {
          admissionFee: 6000,
          tuitionFee: 22000,
          examFee: 3000,
          bookFee: 3500,
          uniformFee: 3000,
          activityFee: 2500,
          developmentFee: 5000,
          otherFee: 2500
        },
        paymentSchedule: 'Annual',
        academicYear: '2025'
      }
    ];

    let createdFees = 0;
    for (const feeData of classFees) {
      const existing = await ClassFee.findOne({
        class: feeData.class,
        medium: feeData.medium,
        academicYear: feeData.academicYear
      });

      if (!existing) {
        const classFee = new ClassFee(feeData);
        await classFee.save();
        createdFees++;
      }
    }
    console.log(`✅ Created ${createdFees} class fee configurations`);

    // Create sample bus routes
    console.log('🔄 Creating sample bus routes...');
    const busRoutes = [
      {
        routeName: 'Mansarovar Route',
        routeCode: 'R001',
        feeAmount: 8000,
        stops: ['Mansarovar', 'Malviya Nagar', 'Vaishali Nagar'],
        driverInfo: {
          driverName: 'Ramesh Kumar',
          driverMobile: '9876543210',
          driverLicense: 'RJ14201800001',
          experienceYears: 10
        },
        busInfo: {
          busNumber: 'RJ14CA1234',
          busModel: 'Tata Bus',
          capacity: 40
        },
        isActive: true,
        academicYear: '2025',
        maxStudents: 35,
        currentStudents: 0
      },
      {
        routeName: 'Jagatpura Route',
        routeCode: 'R002',
        feeAmount: 7500,
        stops: ['Jagatpura', 'Pratap Nagar', 'Sanganer'],
        driverInfo: {
          driverName: 'Suresh Singh',
          driverMobile: '9876543211',
          driverLicense: 'RJ14201800002',
          experienceYears: 8
        },
        busInfo: {
          busNumber: 'RJ14CA5678',
          busModel: 'Ashok Leyland',
          capacity: 45
        },
        isActive: true,
        academicYear: '2025',
        maxStudents: 40,
        currentStudents: 0
      },
      {
        routeName: 'Tonk Road Route',
        routeCode: 'R003',
        feeAmount: 9000,
        stops: ['Tonk Road', 'Sitapura', 'Transport Nagar'],
        driverInfo: {
          driverName: 'Mahesh Sharma',
          driverMobile: '9876543212',
          driverLicense: 'RJ14201800003',
          experienceYears: 12
        },
        busInfo: {
          busNumber: 'RJ14CA9012',
          busModel: 'Tata Bus',
          capacity: 38
        },
        isActive: true,
        academicYear: '2025',
        maxStudents: 32,
        currentStudents: 0
      }
    ];

    let createdRoutes = 0;
    for (const routeData of busRoutes) {
      const existing = await BusRoute.findOne({
        routeCode: routeData.routeCode,
        academicYear: routeData.academicYear
      });

      if (!existing) {
        const busRoute = new BusRoute(routeData);
        await busRoute.save();
        createdRoutes++;
      }
    }
    console.log(`✅ Created ${createdRoutes} bus route configurations`);

    console.log('\n🎉 Student data seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Login to admin dashboard');
    console.log('2. Go to Student Management tab');
    console.log('3. Click "Add Student" to create new students');
    console.log('4. Select class and medium to see auto-populated fees and subjects');

  } catch (error) {
    console.error('❌ Error seeding student data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding function
seedStudentData();