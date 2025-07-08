#!/usr/bin/env node

/**
 * Saraswati School Management System
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are properly configured
 * Run this before starting the application to ensure proper setup
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}
🌟 Saraswati School Management System 2025
Environment Variables Validation
${colors.reset}`);

// Required environment variables
const requiredVars = [
  {
    name: 'PORT',
    description: 'Server port number',
    defaultValue: '5000',
    validation: (value) => {
      const port = parseInt(value);
      return port >= 1000 && port <= 65535;
    }
  },
  {
    name: 'MONGO_URI',
    description: 'MongoDB connection string',
    required: true,
    validation: (value) => {
      return value.includes('mongodb://') || value.includes('mongodb+srv://');
    }
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT signing secret',
    required: true,
    validation: (value) => {
      return value.length >= 32; // Minimum 32 characters for security
    }
  },
  {
    name: 'RAZORPAY_KEY_ID',
    description: 'Razorpay API Key ID',
    required: true,
    validation: (value) => {
      return value.startsWith('rzp_test_') || value.startsWith('rzp_live_');
    }
  },
  {
    name: 'RAZORPAY_KEY_SECRET',
    description: 'Razorpay API Key Secret',
    required: true,
    validation: (value) => {
      return value.length >= 20; // Razorpay secrets are typically longer
    }
  },
  {
    name: 'ADMIN_EMAIL',
    description: 'Admin login email',
    defaultValue: 'admin@saraswatischool.com',
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
  },
  {
    name: 'ADMIN_PASSWORD',
    description: 'Admin login password',
    defaultValue: 'SaraswatiAdmin2025!',
    validation: (value) => {
      return value.length >= 8; // Minimum 8 characters
    }
  }
];

// Optional environment variables with defaults
const optionalVars = [
  'NODE_ENV',
  'CORS_ORIGIN',
  'MAX_FILE_SIZE',
  'BCRYPT_SALT_ROUNDS',
  'SESSION_SECRET',
  'DB_MAX_POOL_SIZE',
  'DB_SERVER_SELECTION_TIMEOUT_MS',
  'DB_SOCKET_TIMEOUT_MS'
];

let hasErrors = false;
let hasWarnings = false;

console.log(`${colors.blue}📋 Checking Environment Configuration...${colors.reset}\n`);

// Check if .env file exists
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.log(`${colors.red}❌ .env file not found!${colors.reset}`);
  console.log(`${colors.yellow}   Create a .env file in the root directory${colors.reset}`);
  console.log(`${colors.yellow}   You can copy from .env.example if available${colors.reset}\n`);
  hasErrors = true;
} else {
  console.log(`${colors.green}✅ .env file found${colors.reset}\n`);
}

// Validate required environment variables
console.log(`${colors.bright}Required Environment Variables:${colors.reset}`);
console.log('━'.repeat(50));

requiredVars.forEach(({ name, description, defaultValue, required, validation }) => {
  const value = process.env[name];
  
  if (!value) {
    if (required) {
      console.log(`${colors.red}❌ ${name}: Missing (${description})${colors.reset}`);
      hasErrors = true;
    } else {
      console.log(`${colors.yellow}⚠️  ${name}: Using default value "${defaultValue}"${colors.reset}`);
      hasWarnings = true;
    }
  } else {
    // Validate the value
    if (validation && !validation(value)) {
      console.log(`${colors.red}❌ ${name}: Invalid format (${description})${colors.reset}`);
      hasErrors = true;
    } else {
      // Mask sensitive values
      let displayValue = value;
      if (name.includes('SECRET') || name.includes('PASSWORD')) {
        displayValue = '*'.repeat(8) + value.slice(-4);
      } else if (name.includes('RAZORPAY')) {
        displayValue = value.slice(0, 8) + '*'.repeat(8);
      }
      console.log(`${colors.green}✅ ${name}: ${displayValue}${colors.reset}`);
    }
  }
});

// Check optional variables
console.log(`\n${colors.bright}Optional Environment Variables:${colors.reset}`);
console.log('━'.repeat(50));

optionalVars.forEach(name => {
  const value = process.env[name];
  if (value) {
    console.log(`${colors.green}✅ ${name}: ${value}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}➖ ${name}: Not set (using default)${colors.reset}`);
  }
});

// Database connectivity test
console.log(`\n${colors.bright}Connection Tests:${colors.reset}`);
console.log('━'.repeat(50));

if (process.env.MONGO_URI) {
  try {
    const url = new URL(process.env.MONGO_URI.replace('mongodb://', 'http://').replace('mongodb+srv://', 'https://'));
    console.log(`${colors.green}✅ MongoDB URI format is valid${colors.reset}`);
    console.log(`${colors.cyan}   Host: ${url.hostname}${colors.reset}`);
    if (url.pathname && url.pathname !== '/') {
      console.log(`${colors.cyan}   Database: ${url.pathname.slice(1)}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ MongoDB URI format is invalid${colors.reset}`);
    hasErrors = true;
  }
} else {
  console.log(`${colors.red}❌ Cannot test MongoDB - URI not provided${colors.reset}`);
  hasErrors = true;
}

// Security checks
console.log(`\n${colors.bright}Security Validation:${colors.reset}`);
console.log('━'.repeat(50));

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length >= 64) {
    console.log(`${colors.green}✅ JWT Secret is highly secure (${jwtSecret.length} characters)${colors.reset}`);
  } else if (jwtSecret.length >= 32) {
    console.log(`${colors.yellow}⚠️  JWT Secret is adequate (${jwtSecret.length} characters)${colors.reset}`);
    console.log(`${colors.yellow}   Consider using a longer secret for production${colors.reset}`);
    hasWarnings = true;
  } else {
    console.log(`${colors.red}❌ JWT Secret is too short (${jwtSecret.length} characters)${colors.reset}`);
    console.log(`${colors.red}   Use at least 32 characters for security${colors.reset}`);
    hasErrors = true;
  }
}

const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  const hasUpper = /[A-Z]/.test(adminPassword);
  const hasLower = /[a-z]/.test(adminPassword);
  const hasNumbers = /\d/.test(adminPassword);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(adminPassword);
  const isLongEnough = adminPassword.length >= 12;
  
  const strength = [hasUpper, hasLower, hasNumbers, hasSymbols, isLongEnough].filter(Boolean).length;
  
  if (strength >= 4) {
    console.log(`${colors.green}✅ Admin password is strong${colors.reset}`);
  } else if (strength >= 3) {
    console.log(`${colors.yellow}⚠️  Admin password is moderate${colors.reset}`);
    hasWarnings = true;
  } else {
    console.log(`${colors.red}❌ Admin password is weak${colors.reset}`);
    hasErrors = true;
  }
}

// Environment recommendations
console.log(`\n${colors.bright}Environment Recommendations:${colors.reset}`);
console.log('━'.repeat(50));

const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'production') {
  console.log(`${colors.green}✅ Production environment detected${colors.reset}`);
  
  // Production-specific checks
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('default')) {
    console.log(`${colors.red}❌ Using default JWT secret in production!${colors.reset}`);
    hasErrors = true;
  }
  
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD === 'SaraswatiAdmin2025!') {
    console.log(`${colors.red}❌ Using default admin password in production!${colors.reset}`);
    hasErrors = true;
  }
} else {
  console.log(`${colors.yellow}⚠️  Development environment (NODE_ENV: ${nodeEnv})${colors.reset}`);
  console.log(`${colors.cyan}   Set NODE_ENV=production for production deployment${colors.reset}`);
}

// Final summary
console.log(`\n${colors.bright}Validation Summary:${colors.reset}`);
console.log('━'.repeat(50));

if (hasErrors) {
  console.log(`${colors.red}❌ Configuration has errors that must be fixed${colors.reset}`);
  console.log(`${colors.red}   Please resolve the issues above before starting the application${colors.reset}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}⚠️  Configuration is functional but has warnings${colors.reset}`);
  console.log(`${colors.yellow}   Consider addressing the warnings for better security${colors.reset}`);
} else {
  console.log(`${colors.green}✅ All environment variables are properly configured!${colors.reset}`);
}

console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
console.log('━'.repeat(50));
console.log(`${colors.cyan}1. Start the backend server: cd backend && npm run dev${colors.reset}`);
console.log(`${colors.cyan}2. Start the frontend server: cd frontend && npm start${colors.reset}`);
console.log(`${colors.cyan}3. Access the application at http://localhost:3000${colors.reset}`);
console.log(`${colors.cyan}4. Login to admin panel with configured credentials${colors.reset}`);

  console.log(`\n${colors.green}🎉 Saraswati School Management System is ready to launch!${colors.reset}`);
console.log(`${colors.blue}📚 For detailed setup instructions, see ENVIRONMENT_SETUP.md${colors.reset}\n`);

process.exit(hasErrors ? 1 : 0); 