# CRPMS - Complete Setup Guide

## 📦 Project Delivery

This is a complete Car Repair Management System (CRPMS) delivered as a production-ready application.

### File: `crpms-complete.zip`

Contains the entire project with both frontend and backend fully implemented.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Extract the Project
```bash
unzip crpms-complete.zip
cd crpms-project
```

### Step 2: Install Backend Dependencies
```bash
cd backend-project
npm install
```

### Step 3: Setup MongoDB
Ensure MongoDB is running:
```bash
# Using local MongoDB
mongod

# OR using MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### Step 4: Start Backend Server
```bash
npm run dev    # Development with nodemon
# Server runs on http://localhost:5000
```

### Step 5: Install Frontend Dependencies (New Terminal)
```bash
cd frontend-project
npm install
```

### Step 6: Start Frontend Application
```bash
npm run dev
# App runs on http://localhost:5173
```

### Step 7: Access the Application
Open browser and go to: `http://localhost:5173`

---

## 👤 Default Account

Since this is a new installation:

1. **Register a new account:**
   - Click "Create Account" on login page
   - Fill in username, password, security question/answer
   - Click "Create Account"

2. **Login:**
   - Use your registered credentials
   - You're now in the system as Admin

---

## 📋 Checklist: What's Included

### ✅ Backend (Complete)
- [x] Express.js server setup
- [x] MongoDB models and schemas
- [x] Authentication system (registration, login, password recovery)
- [x] Car management (CRUD)
- [x] Service management (CRUD)
- [x] Service records (CRUD)
- [x] Payment management (CRUD)
- [x] Report generation (PDF, Excel, CSV)
- [x] Dashboard API with charts data
- [x] Activity logging and audit trail
- [x] Input validation
- [x] Error handling
- [x] Session-based authentication
- [x] CORS support
- [x] All routes implemented

### ✅ Frontend (Complete)
- [x] React with Vite setup
- [x] Tailwind CSS styling
- [x] Dark mode toggle
- [x] Responsive design
- [x] Login/Register pages
- [x] Password recovery page
- [x] Dashboard page with charts
- [x] Cars management page
- [x] Services management page
- [x] Service records page
- [x] Payments page
- [x] Reports page with export
- [x] Toast notifications
- [x] Form validation
- [x] Loading states
- [x] Skeleton loaders
- [x] Empty states
- [x] Pagination
- [x] Search and filter
- [x] Modal dialogs
- [x] Confirmation dialogs
- [x] Activity logging
- [x] All UI components

### ✅ Database
- [x] Admin collection with password hashing
- [x] Car collection with validation
- [x] Service collection
- [x] ServiceRecord collection
- [x] Payment collection
- [x] ActivityLog collection
- [x] Indexes and relationships

### ✅ Features
- [x] Unique plate number validation
- [x] Phone number format validation
- [x] Year range validation
- [x] Payment status tracking
- [x] Pending balance calculation
- [x] Service history per car
- [x] Daily/Monthly revenue reports
- [x] Mechanic performance tracking
- [x] Service frequency analysis
- [x] Export to PDF/Excel/CSV

---

## 🔧 Environment Configuration

### Backend `.env` File

Located at: `backend-project/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crpms

# Session Configuration
SESSION_SECRET=your-secret-key-change-this

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**Important**: Change `SESSION_SECRET` in production!

### Frontend Configuration

API is configured to use: `http://localhost:5000/api`

To change API URL, update in `frontend-project/src/api/apiClient.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

## 📊 Database Connection

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Default connection string works: `mongodb://localhost:27017/crpms`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/crpms
   ```
4. Update in `.env`:
   ```env
   MONGODB_URI=your-mongodb-atlas-uri
   ```

---

## 🧪 Test the Application

### Registration Test
1. Go to Register page
2. Create account with:
   - Username: `testadmin`
   - Password: `Test@123`
   - Security Question: Select one
   - Security Answer: Enter an answer

### Add Test Data
1. **Add Car:**
   - Plate: ABC-001
   - Type: Sedan
   - Model: Toyota Camry
   - Year: 2020
   - Phone: 1234567890
   - Mechanic: John Doe

2. **Add Service:**
   - Code: OIL-CHG
   - Name: Oil Change
   - Price: 50
   - Description: Regular oil change service

3. **Record Service:**
   - Select car: ABC-001
   - Select service: Oil Change
   - Date: Today
   - Amount: 50
   - Status: Paid

4. **View Reports:**
   - Go to Reports page
   - Click on different report tabs
   - Export as PDF/Excel/CSV

---

## 🛠️ Troubleshooting

### Issue: MongoDB Connection Error

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solution:**
1. Check if MongoDB is running
2. Verify connection string in `.env`
3. For local: `mongodb://localhost:27017/crpms`
4. For Atlas: Use correct username/password in URI

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Ensure backend is running on port 5000
2. Check `FRONTEND_URL` in backend `.env` matches frontend URL
3. Restart backend server after changing `.env`

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Issue: Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Blank Page on Frontend

**Error:** Blank white page after login

**Solution:**
1. Check browser console for errors (F12)
2. Check if backend API is running
3. Verify API endpoint in `apiClient.js`
4. Clear browser cache

---

## 📖 Using the Application

### Main Menu
- **Dashboard:** Overview of key metrics
- **Cars:** Manage all cars in the system
- **Services:** Define available services and prices
- **Service Records:** Record services performed
- **Payments:** Track all payments
- **Reports:** Generate and export reports

### Adding a Car
1. Go to Cars page
2. Click "Add New Car"
3. Fill in all required fields
4. Phone must be 10 digits
5. Year must be valid (1900 - current year)
6. Click "Create"

### Recording a Service
1. Go to Service Records page
2. Click "Record Service"
3. Select car and service
4. Enter amount paid
5. Select payment status (Paid/Partial/Unpaid)
6. Click "Create"

### Generating Reports
1. Go to Reports page
2. Select report type from tabs
3. View the data in table
4. Click Export button for PDF/Excel/CSV

### Password Recovery
1. Click "Forgot password?" on login
2. Enter username
3. Answer security question
4. Set new password
5. Login with new password

---

## 📱 Mobile Responsiveness

The application is fully responsive:
- **Mobile:** Optimized for small screens
- **Tablet:** Touch-friendly interface
- **Desktop:** Full feature layout

Test on different devices using:
- Browser DevTools (F12 → Device Toggle)
- Physical devices
- Chrome mobile emulator

---

## 🌙 Dark Mode

Toggle dark mode:
1. Click sun/moon icon in top-right header
2. Preference is saved in localStorage
3. Auto-detects system preference on first visit

---

## 📊 Performance

### Frontend Optimization
- ✅ Code splitting with Vite
- ✅ Lazy loading pages
- ✅ Skeleton loaders for perceived performance
- ✅ Minified CSS and JS

### Backend Optimization
- ✅ Database indexing
- ✅ Pagination on all list endpoints
- ✅ Efficient queries with populate()
- ✅ Async/await error handling

### Build for Production
```bash
# Frontend
npm run build

# Creates optimized dist/ folder for deployment
```

---

## 🔐 Security Notes

1. **Password Hashing:** Uses bcryptjs with 10 salt rounds
2. **Session Security:** Session stored in MongoDB
3. **CORS:** Restricted to frontend URL
4. **Input Validation:** Implemented on both frontend and backend
5. **Activity Logging:** All CRUD operations logged

### For Production:
1. Change `SESSION_SECRET` to strong random string
2. Set `NODE_ENV=production`
3. Use HTTPS instead of HTTP
4. Enable MongoDB authentication
5. Use environment variables for all secrets

---

## 📚 Documentation

Detailed documentation available in:
- `README.md` - Main project overview
- `backend-project/README.md` - Backend documentation
- `frontend-project/README.md` - Frontend documentation

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

### Backend Deployment (Heroku/Railway)
1. Set environment variables in platform
2. Ensure MongoDB URI is set
3. Set `NODE_ENV=production`
4. Deploy to platform

---

## 📞 Support

### Common Questions

**Q: How do I backup my data?**
A: Export MongoDB database using `mongodump` command

**Q: Can I have multiple admins?**
A: Currently single admin role. Extend User model for multi-user support.

**Q: How do I change the port?**
A: Set `PORT=3000` in backend `.env` and update frontend API URL

**Q: Is there a limit on records?**
A: No hard limit. Pagination handles large datasets efficiently.

**Q: How do I reset the database?**
A: Delete MongoDB database `crpms` and restart application

---

## ✨ Next Steps

1. **Customize**: Update company name, colors, logo
2. **Extend**: Add more features as needed
3. **Scale**: Deploy to production servers
4. **Maintain**: Regular database backups
5. **Monitor**: Track application logs

---

## 📄 Summary

You now have a **complete, production-ready Car Repair Management System** with:

✅ Full authentication system
✅ Complete CRUD operations
✅ Professional UI/UX
✅ Comprehensive reports
✅ Dark mode support
✅ Responsive design
✅ Activity logging
✅ Payment tracking
✅ Export functionality
✅ Dashboard with charts

**Total Setup Time:** ~5-10 minutes

**Everything is ready to use!**

---

**Version:** 1.0.0
**Last Updated:** May 2024
**Status:** Production Ready ✅
