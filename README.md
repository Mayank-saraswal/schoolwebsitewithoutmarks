# 🌟 Saraswati School Management System 2025
*Complete School Management Solution with Bilingual Support (Hindi/English)*

[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)

---

## 🎯 Project Overview

Saraswati School Management System is a comprehensive, bilingual school management platform supporting both Hindi and English medium education. The system handles student admissions, fee management, academic records, teacher administration, and parent communication.

### ✨ Key Features

- **🏫 Complete School Management:** Students, Teachers, Admissions, Fees
- **🌐 Bilingual Interface:** Full Hindi and English language support  
- **💰 Fee Management:** Online payments via Razorpay integration
- **📊 Academic Records:** Marks management with exam type configuration
- **👨‍🏫 Teacher Portal:** Registration, approval system, class management
- **👨‍👩‍👧‍👦 Parent Portal:** View student progress, pay fees, download marksheets
- **🔐 Admin Dashboard:** Complete system control with audit logging
- **📱 Responsive Design:** Mobile-friendly interface with Tailwind CSS

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.0 or higher
- MongoDB 6.0 or higher
- Razorpay account (for payments)

### Step 1: Clone & Setup
```bash
git clone <repository-url>
cd "School Website 2025"
```

### Step 2: Environment Configuration
```bash
# Create your environment file
touch .env

# Add the following variables to .env:
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=saraswati-school-super-secure-jwt-secret-key-2025-hindi-english-medium
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
ADMIN_EMAIL=admin@saraswatischool.com
ADMIN_PASSWORD=SaraswatiAdmin2025!
CORS_ORIGIN=http://localhost:3000
```

**📚 For detailed environment setup, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**

### Step 3: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4: Start the Application
```bash
# Terminal 1: Start Backend (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 3000)
cd frontend
npm start
```

🎉 **Application will be available at:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000/admin/login

---

## 🔑 Default Login Credentials

### Admin Dashboard
- **URL:** http://localhost:3000/admin/login
- **Admin ID:** admin@saraswatischool.com
- **Password:** SaraswatiAdmin2025!

### Parent Portal
- **URL:** http://localhost:3000/parent/login
- **Login:** Use student's parent mobile number + date of birth

### Teacher Portal
- **URL:** http://localhost:3000/teacher/login
- **Process:** Register → Admin Approval → Login

---

## 📁 Project Structure

```
School Website 2025/
├── 📄 .env                    # Environment variables (create this)
├── 📄 .env.example           # Environment template
├── 📄 .gitignore            # Git ignore rules
├── 📄 ENVIRONMENT_SETUP.md  # Detailed setup guide
├── 📄 README.md             # This file
├── 📂 backend/              # Node.js/Express API
│   ├── 📂 controllers/      # Business logic
│   ├── 📂 models/          # MongoDB schemas
│   ├── 📂 routes/          # API endpoints
│   ├── 📂 middleware/      # Authentication & validation
│   ├── 📂 utils/           # Helper functions
│   ├── 📄 server.js        # Main server file
│   └── 📄 package.json     # Dependencies
└── 📂 frontend/            # React.js application
    ├── 📂 src/
    │   ├── 📂 components/  # Reusable components
    │   ├── 📂 pages/       # Main pages
    │   ├── 📂 context/     # State management
    │   └── 📄 App.js       # Main app component
    ├── 📄 package.json     # Dependencies
    └── 📄 tailwind.config.js # Styling configuration
```

---

## 🔧 Technology Stack

### Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with bcrypt encryption
- **Payments:** Razorpay integration
- **File Upload:** Multer middleware
- **Security:** CORS, rate limiting, input validation

### Frontend
- **Framework:** React.js with functional components
- **Styling:** Tailwind CSS for responsive design
- **State Management:** Context API
- **HTTP Client:** Axios for API communication
- **Routing:** React Router for navigation
- **UI Components:** Custom components with Tailwind

### DevOps & Tools
- **Environment:** Node.js ES6 modules
- **Development:** Nodemon for hot reloading
- **Package Manager:** npm
- **Version Control:** Git with comprehensive .gitignore

---

## 🌟 System Features

### 🎓 Academic Management
- **Student Records:** Complete student profiles with academic history
- **Teacher Management:** Registration, approval, and class assignments
- **Exam Configuration:** Flexible exam types and marking systems
- **Marks Management:** Subject-wise marks with audit trails
- **Admissions:** Online admission system with document uploads

### 💰 Financial Management
- **Fee Structure:** Class fees and bus fees management
- **Payment Processing:** Razorpay integration for online payments
- **Fee Tracking:** Real-time fee status and payment history
- **Payment Requests:** Screenshot upload for offline payments
- **Financial Reports:** Comprehensive payment analytics

### 🔐 Administration
- **Admin Dashboard:** Complete system oversight and statistics
- **Audit Logging:** Comprehensive activity tracking
- **User Management:** Multi-role access control
- **Data Filtering:** Year and medium-based data segregation
- **Security:** JWT authentication with role-based access

### 👨‍👩‍👧‍👦 Parent Portal
- **Student Progress:** View marks and academic performance
- **Fee Management:** Pay fees online and track payment status
- **Marksheet Download:** Generate and download student marksheets
- **Announcements:** Receive school announcements
- **Multi-Child Support:** Manage multiple children from single account

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens:** Secure token-based authentication
- **Role-Based Access:** Admin, Teacher, Parent role separation
- **Password Security:** bcrypt encryption with salt rounds
- **Session Management:** Configurable token expiration

### Data Protection
- **Input Validation:** Comprehensive data validation
- **CORS Protection:** Cross-origin request security
- **Rate Limiting:** API abuse prevention
- **Audit Trails:** Complete activity logging
- **File Upload Security:** Type and size restrictions

---

## 🌐 Internationalization

### Bilingual Support
- **Hindi & English:** Complete interface in both languages
- **Dynamic Switching:** Medium-based content adaptation
- **Cultural Adaptation:** Date formats and educational terminology
- **Error Messages:** Bilingual error handling
- **Academic Terms:** Support for both educational systems

---

## 📊 System Statistics

### Student Management
- **Multi-Year Support:** Academic years 2023-2027
- **Medium Support:** Hindi and English streams
- **Class Management:** Grade-wise organization
- **Subject Tracking:** Multiple subjects per student
- **Fee Categories:** Class fees and bus fees

### Performance Features
- **Database Optimization:** Indexed queries and aggregations
- **Pagination:** Efficient data loading
- **Parallel Processing:** Concurrent API calls
- **Caching:** Context-based state management
- **Real-time Updates:** Dynamic data refresh

---

## 🐛 Troubleshooting

### Common Issues

#### Environment Variables
```bash
# Check if .env file exists
ls -la .env

# Verify required variables
grep -E "(MONGO_URI|JWT_SECRET|RAZORPAY)" .env
```

#### Database Connection
```bash
# Test MongoDB connection
curl http://localhost:5000/api/health
```

#### Port Conflicts
```bash
# Check if ports are available
lsof -i :3000
lsof -i :5000
```

#### Authentication Issues
```bash
# Test admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin@saraswatischool.com","password":"SaraswatiAdmin2025!"}'
```

---

## 📈 Development Roadmap

### Completed Features ✅
- [x] Student management system
- [x] Teacher registration and approval
- [x] Fee management with Razorpay integration
- [x] Parent portal with marks viewing
- [x] Admin dashboard with statistics
- [x] Bilingual interface (Hindi/English)
- [x] Audit logging system
- [x] Environment configuration
- [x] Security implementation

### Future Enhancements 🚧
- [ ] Email notification system
- [ ] SMS integration for alerts
- [ ] Advanced reporting and analytics
- [ ] Mobile application (React Native)
- [ ] Attendance management
- [ ] Library management system
- [ ] Transport tracking
- [ ] Online class integration

---

## 🤝 Contributing

### Development Guidelines
1. **Code Style:** Follow existing patterns and conventions
2. **Commits:** Use descriptive commit messages
3. **Testing:** Test all features before committing
4. **Documentation:** Update documentation for new features
5. **Security:** Follow security best practices

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support & Contact

### Technical Support
- **Environment Issues:** See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- **API Documentation:** Check controllers and routes
- **Database Schema:** Review models directory
- **Frontend Components:** Explore components directory

### System Access
- **Admin Portal:** Full system access and configuration
- **Teacher Portal:** Class management and student records
- **Parent Portal:** Student progress and fee payments
- **Developer Access:** API endpoints and database direct access

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🏆 Acknowledgments

### Development Team
- **Backend Development:** Node.js/Express API with MongoDB
- **Frontend Development:** React.js with Tailwind CSS
- **Database Design:** MongoDB schema and relationships
- **UI/UX Design:** Responsive bilingual interface
- **Payment Integration:** Razorpay gateway implementation
- **Security Implementation:** JWT authentication and authorization

### Special Features
- **Bilingual Support:** Complete Hindi and English interface
- **Academic Management:** Multi-year and multi-medium support
- **Financial System:** Comprehensive fee management
- **Audit System:** Complete activity tracking
- **Responsive Design:** Mobile-first approach

---

*🏫 Saraswati School Management System - Empowering Education Through Technology*
*📚 Supporting Both Hindi and English Medium Education Since 2025*

**Made with ❤️ for Educational Excellence** 