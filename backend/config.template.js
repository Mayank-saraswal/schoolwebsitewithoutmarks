// Configuration Template for Backend
// Copy this content to backend/.env file

/*
# Database Configuration
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
*/

export default {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/school-website?authSource=admin',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'your-app-password',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'your-razorpay-key-id',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50mb'
}; 