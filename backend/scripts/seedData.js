import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from '../models/Subject.js';
import ClassFee from '../models/ClassFee.js';
import BusRoute from '../models/BusRoute.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedSubjects = async () => {
  console.log('Seeding subjects...');

  const subjectsData = [
    // English Medium
    {
      class: 'Nursery',
      medium: 'English',
      subjects: [
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'Rhymes', code: 'RHY', isOptional: false, maxMarks: 50 },
        { name: 'Activities', code: 'ACT', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'LKG',
      medium: 'English',
      subjects: [
        { name: 'English', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'Mathematics', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'Rhymes', code: 'RHY', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'UKG',
      medium: 'English',
      subjects: [
        { name: 'English', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'Mathematics', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'Hindi', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'General Knowledge', code: 'GK', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'Class 1',
      medium: 'English',
      subjects: [
        { name: 'English', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'Mathematics', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'Hindi', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'Environmental Studies', code: 'EVS', isOptional: false, maxMarks: 100 },
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'Computer', code: 'COM', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'Class 2',
      medium: 'English',
      subjects: [
        { name: 'English', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'Mathematics', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'Hindi', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'Environmental Studies', code: 'EVS', isOptional: false, maxMarks: 100 },
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'Computer', code: 'COM', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'Class 3',
      medium: 'English',
      subjects: [
        { name: 'English', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'Mathematics', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'Hindi', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'Science', code: 'SCI', isOptional: false, maxMarks: 100 },
        { name: 'Social Studies', code: 'SST', isOptional: false, maxMarks: 100 },
        { name: 'Computer', code: 'COM', isOptional: false, maxMarks: 50 },
        { name: 'Drawing', code: 'DRW', isOptional: false, maxMarks: 50 }
      ]
    },

    // Hindi Medium
    {
      class: 'Nursery',
      medium: 'Hindi',
      subjects: [
        { name: 'चित्रकला', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'कविता', code: 'RHY', isOptional: false, maxMarks: 50 },
        { name: 'गतिविधियां', code: 'ACT', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'LKG',
      medium: 'Hindi',
      subjects: [
        { name: 'हिंदी', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'गणित', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'चित्रकला', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'कविता', code: 'RHY', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'UKG',
      medium: 'Hindi',
      subjects: [
        { name: 'हिंदी', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'गणित', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'अंग्रेजी', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'चित्रकला', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'सामान्य ज्ञान', code: 'GK', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'Class 1',
      medium: 'Hindi',
      subjects: [
        { name: 'हिंदी', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'गणित', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'अंग्रेजी', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'पर्यावरण अध्ययन', code: 'EVS', isOptional: false, maxMarks: 100 },
        { name: 'चित्रकला', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'कंप्यूटर', code: 'COM', isOptional: false, maxMarks: 50 }
      ]
    },
    {
      class: 'Class 2',
      medium: 'Hindi',
      subjects: [
        { name: 'हिंदी', code: 'HIN', isOptional: false, maxMarks: 100 },
        { name: 'गणित', code: 'MAT', isOptional: false, maxMarks: 100 },
        { name: 'अंग्रेजी', code: 'ENG', isOptional: false, maxMarks: 100 },
        { name: 'पर्यावरण अध्ययन', code: 'EVS', isOptional: false, maxMarks: 100 },
        { name: 'चित्रकला', code: 'DRW', isOptional: false, maxMarks: 50 },
        { name: 'कंप्यूटर', code: 'COM', isOptional: false, maxMarks: 50 }
      ]
    }
  ];

  try {
    // Clear existing subjects
    await Subject.deleteMany({});
    
    // Insert new subjects
    for (const subjectData of subjectsData) {
      const subject = new Subject(subjectData);
      await subject.save();
      console.log(`Added subjects for ${subjectData.class} (${subjectData.medium})`);
    }
    
    console.log('Subjects seeded successfully!');
  } catch (error) {
    console.error('Error seeding subjects:', error);
  }
};

const seedClassFees = async () => {
  console.log('Seeding class fees...');

  const feesData = [
    // English Medium
    {
      class: 'Nursery',
      medium: 'English',
      feeStructure: {
        admissionFee: 2000,
        tuitionFee: 3000,
        examFee: 500,
        bookFee: 1000,
        uniformFee: 1500,
        activityFee: 500,
        developmentFee: 1000,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'LKG',
      medium: 'English',
      feeStructure: {
        admissionFee: 2500,
        tuitionFee: 3500,
        examFee: 600,
        bookFee: 1200,
        uniformFee: 1500,
        activityFee: 600,
        developmentFee: 1200,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'UKG',
      medium: 'English',
      feeStructure: {
        admissionFee: 3000,
        tuitionFee: 4000,
        examFee: 700,
        bookFee: 1400,
        uniformFee: 1600,
        activityFee: 700,
        developmentFee: 1400,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 1',
      medium: 'English',
      feeStructure: {
        admissionFee: 3500,
        tuitionFee: 5000,
        examFee: 800,
        bookFee: 1600,
        uniformFee: 1800,
        activityFee: 800,
        developmentFee: 1600,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 2',
      medium: 'English',
      feeStructure: {
        admissionFee: 3500,
        tuitionFee: 5200,
        examFee: 800,
        bookFee: 1700,
        uniformFee: 1800,
        activityFee: 800,
        developmentFee: 1700,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 3',
      medium: 'English',
      feeStructure: {
        admissionFee: 4000,
        tuitionFee: 5500,
        examFee: 900,
        bookFee: 1800,
        uniformFee: 2000,
        activityFee: 900,
        developmentFee: 1800,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },

    // Hindi Medium (slightly lower fees)
    {
      class: 'Nursery',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 1500,
        tuitionFee: 2500,
        examFee: 400,
        bookFee: 800,
        uniformFee: 1200,
        activityFee: 400,
        developmentFee: 800,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'LKG',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 2000,
        tuitionFee: 3000,
        examFee: 500,
        bookFee: 1000,
        uniformFee: 1200,
        activityFee: 500,
        developmentFee: 1000,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'UKG',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 2500,
        tuitionFee: 3500,
        examFee: 600,
        bookFee: 1200,
        uniformFee: 1400,
        activityFee: 600,
        developmentFee: 1200,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 1',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 3000,
        tuitionFee: 4000,
        examFee: 700,
        bookFee: 1400,
        uniformFee: 1500,
        activityFee: 700,
        developmentFee: 1400,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 2',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 3000,
        tuitionFee: 4200,
        examFee: 700,
        bookFee: 1500,
        uniformFee: 1500,
        activityFee: 700,
        developmentFee: 1500,
        otherFee: 0
      },
      paymentSchedule: 'Annual'
    },

    // Add Higher Classes for Hindi Medium
    {
      class: 'Class 10',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 5000,
        tuitionFee: 8000,
        examFee: 1500,
        bookFee: 2500,
        uniformFee: 2000,
        activityFee: 1000,
        developmentFee: 2000,
        otherFee: 500
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 11 Science',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 6000,
        tuitionFee: 10000,
        examFee: 2000,
        bookFee: 3000,
        uniformFee: 2500,
        activityFee: 1500,
        developmentFee: 2500,
        otherFee: 1000
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 12 Science',
      medium: 'Hindi',
      feeStructure: {
        admissionFee: 6500,
        tuitionFee: 12000,
        examFee: 2500,
        bookFee: 3500,
        uniformFee: 2500,
        activityFee: 1500,
        developmentFee: 3000,
        otherFee: 1500
      },
      paymentSchedule: 'Annual'
    },

    // Add English Medium Higher Classes too
    {
      class: 'Class 10',
      medium: 'English',
      feeStructure: {
        admissionFee: 6000,
        tuitionFee: 10000,
        examFee: 2000,
        bookFee: 3000,
        uniformFee: 2500,
        activityFee: 1500,
        developmentFee: 2500,
        otherFee: 1000
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 11 Science',
      medium: 'English',
      feeStructure: {
        admissionFee: 7000,
        tuitionFee: 12000,
        examFee: 2500,
        bookFee: 3500,
        uniformFee: 3000,
        activityFee: 2000,
        developmentFee: 3000,
        otherFee: 1500
      },
      paymentSchedule: 'Annual'
    },
    {
      class: 'Class 12 Science',
      medium: 'English',
      feeStructure: {
        admissionFee: 8000,
        tuitionFee: 15000,
        examFee: 3000,
        bookFee: 4000,
        uniformFee: 3000,
        activityFee: 2000,
        developmentFee: 3500,
        otherFee: 2000
      },
      paymentSchedule: 'Annual'
    }
  ];

  try {
    // Clear existing fees
    await ClassFee.deleteMany({});
    
    // Insert new fees
    for (const feeData of feesData) {
      const classFee = new ClassFee(feeData);
      await classFee.save();
      console.log(`Added fees for ${feeData.class} (${feeData.medium})`);
    }
    
    console.log('Class fees seeded successfully!');
  } catch (error) {
    console.error('Error seeding class fees:', error);
  }
};

const seedBusRoutes = async () => {
  console.log('Seeding bus routes...');

  const routesData = [
    {
      routeName: 'Mansarovar Route',
      routeCode: 'R001',
      feeAmount: 8000,
      stops: [],
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
      maxStudents: 32,
      currentStudents: 0
    },
    {
      routeName: 'Vaishali Nagar Route',
      routeCode: 'R002',
      feeAmount: 7500,
      stops: [],
      driverInfo: {
        driverName: 'Suresh Singh',
        driverMobile: '9876543211',
        driverLicense: 'RJ14201800002',
        experienceYears: 8
      },
      busInfo: {
        busNumber: 'RJ14CA5678',
        busModel: 'Ashok Leyland',
        capacity: 35
      },
      isActive: true,
      academicYear: '2025',
      maxStudents: 28,
      currentStudents: 0
    },
    {
      routeName: 'Malviya Nagar Route',
      routeCode: 'R003',
      feeAmount: 9000,
      stops: [],
      driverInfo: {
        driverName: 'Mohan Lal',
        driverMobile: '9876543212',
        driverLicense: 'RJ14201800003',
        experienceYears: 12
      },
      busInfo: {
        busNumber: 'RJ14CA9012',
        busModel: 'Mahindra Bus',
        capacity: 45
      },
      isActive: true,
      academicYear: '2025',
      maxStudents: 36,
      currentStudents: 0
    }
  ];

  try {
    // Clear existing routes
    await BusRoute.deleteMany({});
    
    // Insert new routes
    for (const routeData of routesData) {
      const busRoute = new BusRoute(routeData);
      await busRoute.save();
      console.log(`Added bus route: ${routeData.routeName}`);
    }
    
    console.log('Bus routes seeded successfully!');
  } catch (error) {
    console.error('Error seeding bus routes:', error);
  }
};

const seedDatabase = async () => {
  await connectDB();
  
  console.log('🌱 Starting database seeding...\n');
  
  await seedSubjects();
  console.log('');
  
  await seedClassFees();
  console.log('');
  
  await seedBusRoutes();
  console.log('');
  
  console.log('✅ Database seeding completed successfully!');
  process.exit(0);
};

// Run the seeding script
seedDatabase().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
}); 