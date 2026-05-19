# CRPMS Backend

Car Repair Management System Backend built with Express.js and MongoDB.

## Features

- User Authentication (Registration, Login, Password Recovery)
- Car Management (CRUD Operations)
- Service Management (CRUD Operations)
- Service Records Management
- Payment Tracking
- Comprehensive Reports (PDF, Excel, CSV)
- Activity Audit Trail
- Dashboard with Analytics

## Project Structure

```
backend-project/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── carController.js      # Car management logic
│   ├── serviceController.js  # Service management logic
│   ├── serviceRecordController.js
│   ├── paymentController.js  # Payment logic
│   ├── reportController.js   # Report generation
│   └── dashboardController.js
├── models/
│   ├── Admin.js              # Admin user model
│   ├── Car.js                # Car model
│   ├── Service.js            # Service model
│   ├── ServiceRecord.js       # Service record model
│   ├── Payment.js            # Payment model
│   └── ActivityLog.js        # Audit trail model
├── routes/
│   ├── authRoutes.js
│   ├── carRoutes.js
│   ├── serviceRoutes.js
│   ├── serviceRecordRoutes.js
│   ├── paymentRoutes.js
│   ├── reportRoutes.js
│   └── dashboardRoutes.js
├── middleware/
│   └── auth.js               # Authentication middleware
├── utils/
│   ├── activityLogger.js
│   └── reportGenerator.js    # PDF, Excel, CSV generation
├── .env                       # Environment variables
├── package.json
└── server.js                  # Main server file
```

## Installation

1. Navigate to backend directory:
```bash
cd backend-project
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env` file

4. Ensure MongoDB is running

5. Start the server:
```bash
npm start          # Production
npm run dev        # Development (with nodemon)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current admin
- `POST /api/auth/security-question` - Get security question
- `POST /api/auth/reset-password` - Reset password

### Cars
- `GET /api/cars` - Get all cars (paginated)
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `GET /api/cars/today` - Get cars serviced today

### Services
- `GET /api/services` - Get all services
- `GET /api/services/active` - Get active services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Service Records
- `GET /api/service-records` - Get all records
- `GET /api/service-records/:id` - Get record by ID
- `POST /api/service-records` - Create record
- `PUT /api/service-records/:id` - Update record
- `DELETE /api/service-records/:id` - Delete record
- `GET /api/service-records/car/:carId` - Get car history
- `GET /api/service-records/pending` - Get pending payments

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/daily-revenue` - Daily revenue
- `GET /api/payments/monthly-revenue` - Monthly revenue

### Reports
- `GET /api/reports/service-bill` - Service bill data
- `GET /api/reports/daily-payment` - Daily payment report
- `GET /api/reports/monthly-revenue` - Monthly revenue report
- `GET /api/reports/mechanic-performance` - Mechanic performance
- `GET /api/reports/service-frequency` - Service frequency
- `GET /api/reports/export/service-bill-pdf` - Export PDF
- `GET /api/reports/export/service-bill-excel` - Export Excel
- `GET /api/reports/export/service-bill-csv` - Export CSV

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/payment-status` - Payment status chart
- `GET /api/dashboard/monthly-revenue` - Revenue chart
- `GET /api/dashboard/service-category` - Service category chart
- `GET /api/dashboard/activity-log` - Activity log

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **connect-mongo** - MongoDB session store
- **cors** - Cross-origin requests
- **pdfkit** - PDF generation
- **xlsx** - Excel file generation
- **validator** - Input validation
- **dotenv** - Environment variable management

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crpms
SESSION_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## Notes

- All passwords are hashed using bcryptjs (salt rounds: 10)
- Session tokens are stored in MongoDB
- All CRUD actions are logged in ActivityLog
- Dates are stored in ISO format
- All API responses follow a consistent JSON structure
