#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment files...\n');

// Backend .env content
const backendEnvContent = `# Database Configuration
MONGODB_URI=mongodb://root:example@localhost:27017/school-website?authSource=admin

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (Update with your SMTP details)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Razorpay Configuration (Update with your credentials)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Upload Configuration
MAX_FILE_SIZE=50mb
`;

// Root .env content
const rootEnvContent = `# MongoDB Configuration for Docker
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example
MONGO_INITDB_DATABASE=school-website

# MongoDB Connection String
MONGODB_URI=mongodb://root:example@localhost:27017/school-website?authSource=admin

# Backend Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Environment
NODE_ENV=development
`;

// Create backend .env file
try {
  const backendEnvPath = path.join('backend', '.env');
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');
} catch (error) {
  console.log('❌ Error creating backend/.env:', error.message);
}

// Create root .env file
try {
  fs.writeFileSync('.env', rootEnvContent);
  console.log('✅ Created root .env file');
} catch (error) {
  console.log('❌ Error creating root .env:', error.message);
}

// Create db_data directory for MongoDB volume
try {
  if (!fs.existsSync('db_data')) {
    fs.mkdirSync('db_data');
    console.log('✅ Created db_data directory for MongoDB volume');
  } else {
    console.log('✅ db_data directory already exists');
  }
} catch (error) {
  console.log('❌ Error creating db_data directory:', error.message);
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: docker-compose up -d');
console.log('2. Run: cd backend && npm run dev');
console.log('3. Run: cd frontend && npm start');
console.log('\n🔗 MongoDB will be available at: mongodb://root:example@localhost:27017');
console.log('🔗 Backend API will be available at: http://localhost:5000');
console.log('🔗 Frontend will be available at: http://localhost:3000'); 