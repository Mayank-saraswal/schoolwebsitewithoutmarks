import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BusRoute from '../models/BusRoute.js';

// Load environment variables
dotenv.config();

const seedBusRoutes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Sample bus routes data
    const busRoutesData = [
      {
        routeName: 'Kundal Gaon',
        routeCode: 'R001',
        feeAmount: 600,
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
        maxStudents: 35,
        currentStudents: 0
      },
      {
        routeName: 'Mansarovar Route',
        routeCode: 'R002',
        feeAmount: 800,
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
          capacity: 45
        },
        isActive: true,
        academicYear: '2025',
        maxStudents: 40,
        currentStudents: 0
      },
      {
        routeName: 'Jagatpura Route',
        routeCode: 'R003',
        feeAmount: 750,
        stops: [],
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

    console.log('🔄 Creating bus routes...');
    
    // Clear existing routes
    await BusRoute.deleteMany({});
    console.log('🗑️ Cleared existing bus routes');

    // Create new routes
    let createdRoutes = 0;
    for (const routeData of busRoutesData) {
      try {
        const busRoute = new BusRoute(routeData);
        await busRoute.save();
        createdRoutes++;
        console.log(`✅ Created route: ${routeData.routeName} - ₹${routeData.feeAmount}`);
      } catch (error) {
        console.error(`❌ Error creating route ${routeData.routeName}:`, error.message);
      }
    }

    console.log(`\n🎉 Bus routes seeding completed successfully!`);
    console.log(`✅ Created ${createdRoutes} bus routes`);
    
    console.log('\n📋 Available Routes:');
    busRoutesData.forEach(route => {
      console.log(`   • ${route.routeName} (${route.routeCode}) - ₹${route.feeAmount}/month`);
    });

  } catch (error) {
    console.error('❌ Error seeding bus routes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding function
seedBusRoutes();