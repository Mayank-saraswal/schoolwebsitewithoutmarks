# Docker MongoDB Setup और Environment Configuration

## 1. Docker Compose Setup

आपकी `docker-compose.yml` file पहले से ही create हो गई है। MongoDB container start करने के लिए:

```bash
# MongoDB container start करें
docker-compose up -d

# Container status check करें
docker ps

# MongoDB logs देखें
docker logs mongo
```

## 2. Backend Environment Setup

Backend directory में `.env` file create करें:

```bash
cd backend
```

`.env` file create करें और इसमें यह content डालें:

```env
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
```

## 3. Root Directory Environment Setup

Root directory में `.env` file create करें:

```env
# MongoDB Configuration for Docker
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
```

## 4. Start करने के लिए Commands

1. **MongoDB Start करें:**
```bash
docker-compose up -d
```

2. **Backend Start करें:**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend Start करें:**
```bash
cd frontend
npm install
npm start
```

## 5. MongoDB Connection Test

Backend start होने के बाद health check करें:
```bash
curl http://localhost:5000/api/health
```

## 6. Database Access

MongoDB container में access करने के लिए:
```bash
# MongoDB shell में login करें
docker exec -it mongo mongosh -u root -p example --authenticationDatabase admin

# Database list करें
show dbs

# School website database use करें
use school-website

# Collections देखें
show collections
```

## 7. Troubleshooting

अगर connection issues हों तो:

1. **Port conflicts check करें:**
```bash
netstat -an | findstr :27017
```

2. **MongoDB container status:**
```bash
docker ps
docker logs mongo
```

3. **Backend logs check करें:**
```bash
cd backend
npm run dev
```

## 8. Production Setup

Production environment के लिए:
- JWT_SECRET को strong secret से replace करें
- Email credentials update करें
- Razorpay credentials add करें
- MongoDB password change करें 