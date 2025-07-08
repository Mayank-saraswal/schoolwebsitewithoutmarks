import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import compression from 'compression';
import helmet from 'helmet';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import configRoutes from './routes/configRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import busRoutes from './routes/busRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Performance optimizations
app.use(compression()); // Gzip compression
app.use(helmet()); // Security headers

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Connect to MongoDB with optimizations
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excellenceSchool')
.then(() => {
  console.log('🔗 Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('💡 Make sure MongoDB is running on your system');
  console.log('💡 You can start MongoDB by running: mongod');
  // Don't exit process for development, just log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher', teacherRoutes); // Add teacher prefix for set-max-marks endpoint
app.use('/api/parents', parentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api', subjectRoutes); // Add subject routes for /api/subjects and /api/admin/subjects
app.use('/api/bus', busRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 School Website API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📴 MongoDB connection closed.');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app; 