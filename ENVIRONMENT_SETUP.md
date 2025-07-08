# 🌟 Saraswati School Management System - Environment Setup Guide
*Saraswati School Website 2025 - Environment Configuration*

---

## 📋 Quick Setup Instructions

### Step 1: Create Environment File
```bash
# Navigate to the project root directory
cd School\ Website\ 2025

# Copy the example file to create your .env file
cp .env.example .env

# Or create manually
touch .env
```

### Step 2: Configure Environment Variables
Open the `.env` file and update the following variables:

```env
# ===================================
# Excellence School Management System
# Environment Configuration
# ===================================

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=YOUR_MONGODB_URI
# Example: mongodb://localhost:27017/excellence-school
# Example: mongodb+srv://username:password@cluster.mongodb.net/excellence-school

# JWT Configuration
JWT_SECRET=excellence-school-super-secure-jwt-secret-key-2025-hindi-english-medium
# Note: In production, use a cryptographically secure random string

# Razorpay Configuration (Payment Gateway)
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
# Get these from: https://dashboard.razorpay.com/app/keys

# Admin Configuration
ADMIN_EMAIL=admin@excellenceschool.com
ADMIN_PASSWORD=ExcellenceAdmin2025!

# Security Configuration
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=excellence-school-session-secret-2025

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
# Frontend URL for CORS

# File Upload Configuration
MAX_FILE_SIZE=5242880
# 5MB in bytes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
# 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100

# Database Connection Options
DB_MAX_POOL_SIZE=10
DB_SERVER_SELECTION_TIMEOUT_MS=5000
DB_SOCKET_TIMEOUT_MS=45000

# Logging Configuration
LOG_LEVEL=info
# Options: error, warn, info, debug

# Session Configuration
SESSION_MAX_AGE=86400000
# 24 hours in milliseconds

# Development/Debug Settings
DEBUG_MODE=false
ENABLE_MORGAN_LOGGING=true
```

---

## 🔧 Detailed Configuration Guide

### 1. Database Setup (MongoDB)

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
# Windows: net start MongoDB
# macOS/Linux: brew services start mongodb/community

# Set your MONGO_URI
MONGO_URI=mongodb://localhost:27017/excellence-school
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update your `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/excellence-school
```

### 2. Razorpay Setup (Payment Gateway)

1. **Create Razorpay Account:**
   - Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a free account
   - Complete KYC verification

2. **Get API Keys:**
   - Go to Settings > API Keys
   - Generate new API keys
   - Copy Key ID and Key Secret

3. **Update Environment:**
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXX
```

### 3. JWT Secret Configuration

#### For Development:
```env
JWT_SECRET=excellence-school-super-secure-jwt-secret-key-2025-hindi-english-medium
```

#### For Production (Generate Secure Secret):
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator
# https://randomkeygen.com/
```

### 4. Admin Credentials

#### Default Admin Login:
```env
ADMIN_EMAIL=admin@excellenceschool.com
ADMIN_PASSWORD=ExcellenceAdmin2025!
```

#### Custom Admin Setup:
```env
ADMIN_EMAIL=your-admin@school.com
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## 🚀 Running the Application

### Start Backend Server:
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:5000
```

### Start Frontend Server:
```bash
cd frontend
npm install
npm start
# Frontend will start on http://localhost:3000
```

---

## 🔒 Security Best Practices

### Environment Variables Security:
1. **Never commit `.env` files** to version control
2. **Use different values** for development and production
3. **Rotate secrets regularly** (JWT, API keys)
4. **Use environment-specific files** (`.env.development`, `.env.production`)

### Strong Passwords:
- **Admin Password:** At least 12 characters with mixed case, numbers, symbols
- **JWT Secret:** Use cryptographically secure random strings (64+ characters)
- **Database:** Use strong MongoDB user credentials

### Production Deployment:
```env
NODE_ENV=production
DEBUG_MODE=false
CORS_ORIGIN=https://your-domain.com
```

---

## 🧪 Testing Environment Variables

### Automated Environment Validation:
```bash
# Run the built-in validation script
cd backend
npm run validate-env

# Or run directly from root
node validate-env.js
```

The validation script will check:
- ✅ All required environment variables are set
- ✅ Values are in correct format
- ✅ Security requirements are met
- ✅ Database connection string is valid
- ✅ JWT secret is secure enough
- ✅ Admin credentials are strong

### Manual Verification:
```bash
# Test database connection
curl http://localhost:5000/api/health

# Test admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin@excellenceschool.com","password":"ExcellenceAdmin2025!"}'
```

### Quick Setup with Validation:
```bash
# Setup and start with automatic validation
cd backend
npm run setup
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found: dotenv"
```bash
# Install dotenv
cd backend
npm install dotenv
```

### Issue 2: "JWT secret not defined"
```bash
# Check your .env file exists and has JWT_SECRET
ls -la .env
grep JWT_SECRET .env
```

### Issue 3: "MongoDB connection failed"
```bash
# Check MongoDB service is running
# Windows: sc query MongoDB
# macOS/Linux: brew services list | grep mongodb
```

### Issue 4: "Razorpay keys invalid"
- Verify keys are copied exactly from dashboard
- Ensure no extra spaces or characters
- Check if using Test vs Live keys

---

## 📂 File Structure
```
School Website 2025/
├── .env                    # Your environment variables (DO NOT COMMIT)
├── .env.example           # Template file (SAFE TO COMMIT)
├── .gitignore            # Includes .env in ignore list
├── ENVIRONMENT_SETUP.md  # This guide
├── backend/
│   ├── server.js         # Uses dotenv.config()
│   ├── package.json      # Includes dotenv dependency
│   └── controllers/      # Uses process.env variables
└── frontend/
    └── src/
        └── setupProxy.js # Proxy configuration
```

---

## 🎯 Default System Credentials

### Admin Dashboard:
- **URL:** http://localhost:3000/admin/login
- **Username:** admin@excellenceschool.com
- **Password:** ExcellenceAdmin2025!

### Parent Portal:
- **URL:** http://localhost:3000/parent/login
- **Login:** Use student mobile & DOB

### Teacher Portal:
- **URL:** http://localhost:3000/teacher/login
- **Registration Required:** First register, then admin approval

---

## 📞 Support & Contact

If you encounter any issues with environment setup:

1. **Check the logs** in your terminal
2. **Verify all environment variables** are set correctly
3. **Ensure MongoDB and services** are running
4. **Contact development team** with specific error messages

---

*🏫 Excellence School Management System - Bilingual (Hindi/English) Education Platform*
*📚 Supporting Academic Years 2023-2027 with Complete Fee Management* 