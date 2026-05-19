# Car Repair Management System (CRPMS)

A complete car repair management system built with modern web technologies. Manage cars, services, service records, payments, and generate comprehensive reports.

## 📋 Project Overview

CRPMS is a full-stack web application designed to manage car repair operations efficiently. It provides features for managing cars, recording services, tracking payments, and generating detailed reports.

### Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Chart.js for data visualization
- Lucide React for icons
- Axios for HTTP requests

**Backend:**
- Node.js with Express.js
- MongoDB for database
- Bcryptjs for password hashing
- Session-based authentication
- PDFKit and XLSX for report generation

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- Git

### Installation

#### 1. Clone or Extract Project

```bash
cd crpms-project
```

#### 2. Setup Backend

```bash
cd backend-project
npm install
```

Configure environment variables in `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crpms
SESSION_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev    # Development mode with nodemon
npm start      # Production mode
```

Server will run on `http://localhost:5000`

#### 3. Setup Frontend

```bash
cd frontend-project
npm install
```

Start the development server:
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## 📚 Project Features

### Authentication Module
- ✅ Admin registration with security question
- ✅ Login with username and password
- ✅ Password recovery via security question
- ✅ Session-based authentication
- ✅ Password hashing with bcryptjs

### Car Management
- ✅ CRUD operations for cars
- ✅ Unique plate number validation
- ✅ Phone number validation
- ✅ Service history per car
- ✅ Search and filter
- ✅ Pagination support

### Service Management
- ✅ CRUD operations for services
- ✅ Unique service code validation
- ✅ Price management
- ✅ Service descriptions
- ✅ Status management (Active/Inactive)

### Service Records
- ✅ CRUD operations for service records
- ✅ Track service dates and payment dates
- ✅ Payment status tracking (Paid, Partial, Unpaid)
- ✅ Mechanic assignment
- ✅ Pending payments tracking

### Payment Management
- ✅ Record payments with amounts
- ✅ Payment method tracking
- ✅ Payment date tracking
- ✅ Daily revenue calculation
- ✅ Monthly revenue reports

### Reports
- ✅ Service bill report
- ✅ Daily payment report
- ✅ Monthly revenue report
- ✅ Mechanic performance report
- ✅ Service frequency report
- ✅ Export to PDF, Excel, CSV

### Dashboard
- ✅ Summary cards (KPIs)
- ✅ Interactive charts (revenue, payment status, services)
- ✅ Recent activity log
- ✅ Quick action buttons

### UI/UX Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Form validation
- ✅ Confirmation dialogs
- ✅ Empty states
- ✅ Pagination
- ✅ Search and filter

### Audit & Activity Tracking
- ✅ Activity log for all CRUD operations
- ✅ Timestamp tracking
- ✅ User action tracking

## 🗂️ Project Structure

```
crpms-project/
├── backend-project/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── serviceController.js
│   │   ├── serviceRecordController.js
│   │   ├── paymentController.js
│   │   ├── reportController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Car.js
│   │   ├── Service.js
│   │   ├── ServiceRecord.js
│   │   ├── Payment.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── serviceRecordRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reportRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── activityLogger.js
│   │   └── reportGenerator.js
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── frontend-project/
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js
│   │   ├── components/
│   │   │   ├── UI.jsx
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   └── useCustomHooks.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CarsPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── ServiceRecordsPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
└── README.md (this file)
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register             - Register new admin
POST   /api/auth/login                - Login admin
POST   /api/auth/logout               - Logout
GET    /api/auth/me                   - Get current user
POST   /api/auth/security-question    - Get security question
POST   /api/auth/reset-password       - Reset password
```

### Cars
```
GET    /api/cars                      - Get all cars (paginated)
GET    /api/cars/:id                  - Get car by ID
POST   /api/cars                      - Create new car
PUT    /api/cars/:id                  - Update car
DELETE /api/cars/:id                  - Delete car
GET    /api/cars/today                - Get cars serviced today
```

### Services
```
GET    /api/services                  - Get all services
GET    /api/services/active           - Get active services
GET    /api/services/:id              - Get service by ID
POST   /api/services                  - Create new service
PUT    /api/services/:id              - Update service
DELETE /api/services/:id              - Delete service
```

### Service Records
```
GET    /api/service-records           - Get all records (paginated)
GET    /api/service-records/:id       - Get record by ID
POST   /api/service-records           - Create record
PUT    /api/service-records/:id       - Update record
DELETE /api/service-records/:id       - Delete record
GET    /api/service-records/car/:carId - Get car service history
GET    /api/service-records/pending   - Get pending payments
```

### Payments
```
GET    /api/payments                  - Get all payments (paginated)
GET    /api/payments/:id              - Get payment by ID
POST   /api/payments                  - Record payment
PUT    /api/payments/:id              - Update payment
DELETE /api/payments/:id              - Delete payment
GET    /api/payments/daily-revenue    - Get daily revenue
GET    /api/payments/monthly-revenue  - Get monthly revenue
```

### Reports
```
GET    /api/reports/service-bill               - Service bill data
GET    /api/reports/daily-payment              - Daily payment report
GET    /api/reports/monthly-revenue            - Monthly revenue report
GET    /api/reports/mechanic-performance       - Mechanic performance
GET    /api/reports/service-frequency          - Service frequency
GET    /api/reports/export/service-bill-pdf    - Export PDF
GET    /api/reports/export/payment-report-pdf  - Payment report PDF
GET    /api/reports/export/service-bill-excel  - Export Excel
GET    /api/reports/export/service-bill-csv    - Export CSV
```

### Dashboard
```
GET    /api/dashboard/summary         - Dashboard summary
GET    /api/dashboard/payment-status  - Payment status data
GET    /api/dashboard/monthly-revenue - Monthly revenue data
GET    /api/dashboard/service-category - Service category data
GET    /api/dashboard/activity-log    - Activity log
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Session-based authentication
- ✅ Security questions for password recovery
- ✅ Input validation on both frontend and backend
- ✅ CORS enabled
- ✅ Activity logging and audit trail
- ✅ Unique constraints on plate numbers and service codes

## 📊 Database Schema

### Admin Collection
- username (unique, indexed)
- password (hashed)
- securityQuestion
- securityAnswer (hashed)
- role (default: Admin)
- isActive
- timestamps

### Car Collection
- plateNumber (unique)
- type
- model
- manufacturingYear
- driverPhone (validated 10 digits)
- mechanicName
- createdBy (reference to Admin)
- status (Active/Inactive)
- timestamps

### Service Collection
- serviceCode (unique)
- serviceName
- servicePrice (must be positive)
- serviceDescription
- createdBy (reference to Admin)
- status (Active/Inactive)
- timestamps

### ServiceRecord Collection
- serviceDate
- plateNumber (reference to Car)
- serviceCode (reference to Service)
- amountPaid
- paymentDate
- paymentStatus (Paid/Partial/Unpaid)
- doneBy
- createdBy (reference to Admin)
- timestamps

### Payment Collection
- serviceRecordId (reference to ServiceRecord)
- paymentDate
- amountPaid
- receivedBy
- paymentMethod (Cash/Check/Card/Transfer)
- createdBy (reference to Admin)
- timestamps

### ActivityLog Collection
- adminId (reference to Admin)
- action (CREATE/UPDATE/DELETE/LOGIN/LOGOUT/VIEW)
- entity (Car/Service/ServiceRecord/Payment/Admin)
- entityId
- description
- timestamp

## 🎨 Color Palette

- Primary Blue: #0ea5e9
- Secondary Purple: #8b5cf6
- Success Green: #10b981
- Warning Yellow: #f59e0b
- Danger Red: #ef4444
- Dark Background: #0f172a

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔄 Workflow Example

1. **Registration**: User registers with username, password, and security question
2. **Login**: User logs in with credentials
3. **Add Car**: User adds a car with plate number, type, model, etc.
4. **Add Service**: User defines available services with prices
5. **Record Service**: User records a service for a car, selecting the car and service
6. **Record Payment**: User records payment amounts for services
7. **View Reports**: User generates and exports reports
8. **Dashboard**: User views KPIs and charts

## 🧪 Testing

### Test Data

Default Security Questions:
- What is your mother's maiden name?
- What was your first pet's name?
- What city were you born in?
- What is your favorite color?
- What was your first car model?

Sample Cars:
- Plate: ABC-123, Toyota Camry 2020
- Plate: XYZ-789, Honda Civic 2021

Sample Services:
- Oil Change: $50
- Tire Rotation: $40
- Full Service: $200

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify database permissions

### CORS Error
- Check FRONTEND_URL in backend .env
- Ensure credentials: true in API calls
- Verify allowed origins

### Session Issues
- Clear browser cookies
- Restart backend server
- Check MongoDB session collection

## 📈 Performance Optimization

- Pagination on all list endpoints
- Database indexing on frequently queried fields
- Lazy loading of pages
- Skeleton loaders for perceived performance
- Optimized bundle size with Vite
- Image optimization

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Ensure MongoDB is accessible
3. Use `npm start` for production

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set API endpoint in environment variables

## 📝 License

All rights reserved.

## 📞 Support

For issues and questions, please refer to the documentation in README files of respective folders.

## ✨ Future Enhancements

- Multi-user support with role-based access
- Email notifications
- SMS alerts
- Customer management
- Inventory tracking
- Appointment scheduling
- Mobile app (React Native)
- Advanced analytics
- Two-factor authentication

---

**Version**: 1.0.0
**Last Updated**: 2024
# CRPMS
