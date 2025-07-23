# 🌟 Saraswati School Management System 2025
*Complete School Management Solution with Bilingual Support (Hindi/English)*

[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-blue.svg)](https://razorpay.com/)

---

## 🎯 Project Overview

Saraswati School Management System is a comprehensive, production-ready bilingual school management platform supporting both Hindi and English medium education. The system provides complete end-to-end school management with advanced features for administrators, teachers, and parents.

### ✨ Complete Feature Set

#### 🏫 **Administrative Management**
- **Admin Dashboard:** Complete system oversight with real-time statistics
- **Medium Selection:** Separate management for Hindi and English medium
- **Year Filtering:** Academic year-based data management (2023-2027)
- **Audit Logging:** Complete activity tracking and accountability
- **Announcement System:** School-wide communication management
- **Teacher Approval:** Registration and approval workflow
- **Student Management:** Comprehensive student records and filtering
- **Exam Configuration:** Flexible exam types and marking systems

#### 👨‍🏫 **Teacher Portal**
- **Student Creation:** Complete student registration with auto-generated SR numbers
- **Marks Management:** Subject-wise marks upload with automatic grade calculation
- **Class Management:** Teacher-specific student access and management
- **Fee Integration:** Automatic fee calculation based on class and bus routes
- **Subject Auto-fetch:** Dynamic subject loading based on student class
- **Audit Trail:** Complete tracking of marks changes and modifications

#### 👨‍👩‍👧‍👦 **Parent Portal**
- **Secure Authentication:** Mobile number + child's date of birth login
- **Multi-child Support:** Handle families with multiple children
- **Academic Progress:** Complete marks viewing with progress charts
- **Fee Management:** Real-time fee status and online payment via Razorpay
- **Marksheet Download:** PDF generation and printable marksheets
- **Payment Tracking:** Screenshot upload and admin approval workflow
- **Responsive Design:** Mobile-first interface with bilingual support

#### 💰 **Financial Management**
- **Razorpay Integration:** Secure online payment processing
- **Fee Structure:** Class fees and bus fees with automatic calculation
- **Payment Requests:** Screenshot upload with admin approval workflow
- **Fee Tracking:** Real-time payment status and balance management
- **Revenue Analytics:** Comprehensive financial reporting and statistics

#### 🌐 **System Features**
- **Bilingual Interface:** Complete Hindi and English language support
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- **Security:** JWT authentication with role-based access control
- **Performance:** Optimized database queries with proper indexing
- **Scalability:** Modular architecture supporting future enhancements

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
ADMIN_EMAIL=mayanksaraswal@gmail.com
ADMIN_PASSWORD=HelloAdmin
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
- **Admin ID:** mayanksaraswal@gmail.com
- **Password:** HelloAdmin

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
  -d '{"adminId":"mayanksaraswal@gmail.com","password":"HelloAdmin"}'
```

---

## 🏗️ Complete Implementation Guide

### Step-by-Step Development Journey

#### **Step 1-4: Foundation Setup**
- ✅ **Basic Infrastructure:** Node.js, Express, MongoDB, React setup
- ✅ **Authentication System:** JWT-based login for teachers and admin
- ✅ **Database Models:** Core schemas for users, students, teachers
- ✅ **Frontend Framework:** React with Tailwind CSS and responsive design

#### **Step 5: Student Management System**
- ✅ **Student Creation:** Complete student registration with auto-generated SR numbers
- ✅ **Fee Integration:** Automatic fee calculation based on class and bus routes
- ✅ **Subject Auto-fetch:** Dynamic subject loading based on student class
- ✅ **Teacher Access Control:** Teachers limited to their assigned class students
- ✅ **Search & Filter:** Advanced student management with pagination

#### **Step 6: Marks Management System**
- ✅ **Marks Upload:** Subject-wise exam marks with auto-grade calculation
- ✅ **Validation System:** Comprehensive validation with instant feedback
- ✅ **Audit Trail:** Complete tracking of marks changes with reasons
- ✅ **Grade System:** Standard grading (A+, A, B+, B, C+, C, D, F)
- ✅ **Result Calculation:** Pass/Fail/Compartment result determination

#### **Step 7: Exam Configuration**
- ✅ **Admin Exam Types:** Create and manage exam types by class/medium/year
- ✅ **Max Marks Setup:** Configure maximum marks for each subject
- ✅ **Flexible System:** Support for multiple exam types and grading scales
- ✅ **Teacher Integration:** Auto-populated exam types in teacher forms

#### **Step 8: Parent Portal**
- ✅ **Secure Authentication:** Mobile number + child's date of birth login
- ✅ **Multi-child Support:** Handle families with multiple children
- ✅ **Academic Progress:** Complete marks viewing with progress charts
- ✅ **Marksheet Download:** PDF generation and printable marksheets
- ✅ **Responsive Design:** Mobile-first interface with bilingual support

#### **Step 9: Payment System**
- ✅ **Razorpay Integration:** Secure online payment processing
- ✅ **Payment Workflow:** Order creation, payment processing, verification
- ✅ **Screenshot Upload:** Payment proof submission with admin approval
- ✅ **Fee Tracking:** Real-time payment status and balance management
- ✅ **Admin Approval:** Complete payment request management system

#### **Step 10: Announcement System**
- ✅ **Admin Announcements:** Create, manage, and delete announcements
- ✅ **Targeted Notifications:** Year and medium-based filtering
- ✅ **Public Display:** Homepage integration with modern UI
- ✅ **Student Notifications:** Dismissible banners in student dashboards
- ✅ **Bilingual Support:** Complete Hindi/English interface

#### **Step 11: Admin Authentication**
- ✅ **Secure Admin Login:** JWT-based authentication with HTTP-only cookies
- ✅ **Medium Selection:** Interactive selection between Hindi and English
- ✅ **Data Filtering:** All dashboard data filtered by selected medium
- ✅ **Session Management:** Persistent login state with token verification
- ✅ **Enhanced Dashboard:** Context-driven state management

#### **Step 12: Year Filtering System**
- ✅ **Comprehensive Filtering:** Year-based data management across all admin functions
- ✅ **Sidebar Integration:** Year selector in admin sidebar with persistence
- ✅ **API Enhancement:** All admin endpoints include year/medium filtering
- ✅ **Student Management:** Full-featured student list with advanced filtering
- ✅ **Performance Optimization:** Database indexes and efficient queries

#### **Step 13: Audit & Analytics**
- ✅ **Comprehensive Audit Logging:** All admin actions tracked with metadata
- ✅ **Dashboard Statistics:** Real-time insights with financial and academic metrics
- ✅ **Security Focus:** Login/logout tracking and failed attempts monitoring
- ✅ **Performance Optimized:** Database indexes for efficient querying
- ✅ **Admin Accountability:** Complete transparency of admin operations

---

## 📊 Database Architecture

### Core Collections

#### **Students Collection**
```javascript
{
  _id: ObjectId,
  srNumber: String,           // Auto-generated (SR2025001)
  name: String,
  class: String,
  medium: String,             // "Hindi" or "English"
  year: Number,               // Academic year
  parentMobile: String,
  dateOfBirth: Date,
  subjects: [String],         // Auto-fetched based on class
  classFee: Number,           // Auto-calculated
  busFee: Number,             // Based on bus route
  feeStatus: String,          // "Paid", "Partial", "Unpaid"
  createdBy: ObjectId,        // Teacher who created
  createdAt: Date
}
```

#### **Marks Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  examType: String,
  marks: [{
    subject: String,
    obtained: Number,
    maxMarks: Number,
    percentage: Number,
    grade: String,
    status: String            // "Pass" or "Fail"
  }],
  totalObtained: Number,
  totalMaxMarks: Number,
  overallPercentage: Number,
  overallGrade: String,
  result: String,             // "Pass", "Fail", "Compartment"
  uploadedBy: ObjectId,
  uploadedAt: Date
}
```

#### **PaymentRequest Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  parentMobile: String,
  type: String,               // "class" or "bus"
  amount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  screenshotUrl: String,
  description: String,
  status: String,             // "pending", "approved", "rejected"
  processedBy: ObjectId,
  adminRemarks: String,
  createdAt: Date
}
```

#### **Announcements Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  year: Number,
  medium: String,
  visibility: String,         // "public" or "dashboard"
  createdBy: ObjectId,
  createdByName: String,
  isActive: Boolean,
  postedOn: Date
}
```

#### **AuditLog Collection**
```javascript
{
  _id: ObjectId,
  action: String,
  data: Mixed,                // Sanitized action data
  adminId: String,
  adminName: String,
  category: String,           // "Student", "Teacher", "System", etc.
  severity: String,           // "Low", "Medium", "High", "Critical"
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

---

## 🔌 Complete API Documentation

### **Admin Authentication APIs**
```http
POST   /api/admin/login              # Admin login with credentials
GET    /api/admin/verify             # Verify admin token
POST   /api/admin/logout             # Admin logout
```

### **Student Management APIs**
```http
POST   /api/students/create          # Create new student
GET    /api/students/my-students     # Get teacher's students
GET    /api/admin/students           # Get filtered students (admin)
PUT    /api/students/:id             # Update student
GET    /api/students/next-sr-number  # Generate next SR number
```

### **Marks Management APIs**
```http
POST   /api/marks/upload             # Upload marks for student
PUT    /api/marks/update/:studentId/:examType  # Update existing marks
GET    /api/marks/student/:studentId # Get marks for specific student
GET    /api/marks/my-uploads         # Get teacher's uploaded marks
```

### **Parent Portal APIs**
```http
POST   /api/parent/login             # Parent authentication
GET    /api/parent/marks/:studentId  # Get student marks
GET    /api/parent/fees/:studentId   # Get fee details
GET    /api/parent/marksheet/:studentId # Get marksheet data
```

### **Payment System APIs**
```http
POST   /api/payment/create-order     # Create Razorpay order
POST   /api/payment/upload-screenshot # Upload payment proof
GET    /api/payment/admin/requests   # Get payment requests (admin)
PUT    /api/payment/admin/process/:id # Process payment request
```

### **Announcement APIs**
```http
POST   /api/announcements/create     # Create announcement (admin)
GET    /api/announcements/public     # Get public announcements
GET    /api/announcements/dashboard  # Get dashboard announcements
GET    /api/announcements/admin/all  # Get all announcements (admin)
DELETE /api/announcements/admin/:id  # Delete announcement
```

### **Admin Statistics APIs**
```http
GET    /api/admin/dashboard-stats    # Comprehensive dashboard statistics
GET    /api/admin/audit-logs         # Get filtered audit logs
GET    /api/admin/audit-stats        # Get audit log statistics
```

---

## 🎨 Frontend Component Architecture

### **Context Providers**
- **AdminContext:** Complete admin state management with medium/year filtering
- **ParentContext:** Parent authentication and student data management
- **TeacherContext:** Teacher authentication and class management

### **Admin Components**
- **AdminDashboard:** Main dashboard with tabbed interface
- **AdminDashboardStats:** Real-time statistics with responsive cards
- **AdminAuditLogPage:** Complete audit trail with filtering
- **ExamTypeConfigPanel:** Exam type and max marks configuration
- **AdminAnnouncementForm/List:** Announcement management system

### **Teacher Components**
- **TeacherDashboard:** Teacher portal with student and marks management
- **StudentCreateForm:** Comprehensive student registration
- **StudentList:** Advanced student management with filtering
- **MarksUploadForm:** Subject-wise marks upload with validation
- **MarksTable:** Marks management with editing capabilities

### **Parent Components**
- **ParentLogin:** Secure authentication with mobile + DOB
- **ParentDashboard:** Multi-child support with tabbed interface
- **MarksViewer:** Responsive marks display with grade calculations
- **ProgressChart:** CSS-based progress visualization
- **FeeStatusPanel:** Fee tracking with payment integration
- **MarksheetDownload:** PDF generation and printable formats

### **Payment Components**
- **FeePaymentPage:** Main payment interface with Razorpay
- **RazorpayPayment:** Secure payment processing
- **ScreenshotUploadForm:** Payment proof submission
- **PaymentApprovalPanel:** Admin payment approval interface

---

## 🔐 Security Implementation

### **Authentication & Authorization**
```javascript
// JWT Token Structure
{
  userId: ObjectId,
  role: "admin" | "teacher" | "parent",
  permissions: [...],
  exp: timestamp
}

// Role-based Access Control
- Admin: Full system access
- Teacher: Limited to assigned class students
- Parent: Access only to their children's data
```

### **Data Protection**
- **Input Validation:** Comprehensive server-side validation
- **XSS Prevention:** Data sanitization and encoding
- **SQL Injection Protection:** Parameterized queries
- **File Upload Security:** Type and size restrictions
- **Rate Limiting:** API abuse prevention

### **Audit & Compliance**
- **Activity Logging:** Complete admin action tracking
- **Data Integrity:** Soft delete with audit trails
- **Privacy Protection:** Minimal data exposure
- **Secure Sessions:** HTTP-only cookies with expiration

---

## 📱 Mobile Optimization

### **Responsive Design**
- **Mobile-first Approach:** Optimized for mobile devices
- **Breakpoint System:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly Interface:** Minimum 44px tap targets
- **Adaptive Layouts:** Card-based mobile, table-based desktop

### **Performance Optimization**
- **Code Splitting:** Components loaded on demand
- **Image Optimization:** Compressed images with lazy loading
- **API Optimization:** Efficient data fetching with pagination
- **Caching Strategy:** Context-based state management

---

## 🧪 Testing & Quality Assurance

### **Testing Scenarios**

#### **Authentication Testing**
- Valid/invalid login credentials
- Token expiration and refresh
- Role-based access control
- Session management

#### **Data Integrity Testing**
- Student creation with auto-calculations
- Marks upload with validation
- Payment processing workflow
- Audit log accuracy

#### **UI/UX Testing**
- Responsive design across devices
- Bilingual interface functionality
- Form validation and error handling
- Loading states and user feedback

#### **Integration Testing**
- End-to-end payment flow
- Admin approval workflows
- Real-time data updates
- Cross-component communication

### **Performance Testing**
- API response times (< 500ms)
- Database query optimization
- Frontend rendering performance
- Mobile device compatibility

---

## 📈 Development Roadmap

### **Completed Features ✅**
- [x] Complete student management system with auto-calculations
- [x] Teacher registration, approval, and marks management
- [x] Comprehensive fee management with Razorpay integration
- [x] Parent portal with marks viewing and payment capabilities
- [x] Admin dashboard with real-time statistics and audit logging
- [x] Bilingual interface (Hindi/English) throughout the system
- [x] Announcement system with targeted notifications
- [x] Exam configuration with flexible marking systems
- [x] Security implementation with JWT and role-based access
- [x] Mobile-responsive design with modern UI/UX

### **Future Enhancements 🚧**

#### **Phase 1: Communication & Notifications**
- [ ] Email notification system for important updates
- [ ] SMS integration for fee reminders and announcements
- [ ] Push notifications for mobile devices
- [ ] WhatsApp integration for parent communication

#### **Phase 2: Advanced Features**
- [ ] Attendance management system
- [ ] Library management with book tracking
- [ ] Transport tracking with GPS integration
- [ ] Online class integration with video conferencing

#### **Phase 3: Analytics & Reporting**
- [ ] Advanced reporting and analytics dashboard
- [ ] Performance trend analysis with ML insights
- [ ] Custom report generation (PDF/Excel)
- [ ] Comparative analysis across years and mediums

#### **Phase 4: Mobile & Integration**
- [ ] React Native mobile application
- [ ] API integration with third-party systems
- [ ] Bulk data import/export capabilities
- [ ] Advanced search with Elasticsearch

#### **Phase 5: AI & Automation**
- [ ] AI-powered student performance predictions
- [ ] Automated fee reminder system
- [ ] Intelligent resource recommendations
- [ ] Chatbot for common queries

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