# CRPMS Frontend

Car Repair Management System Frontend built with React, Vite, and Tailwind CSS.

## Features

- Modern, responsive UI with dark mode support
- Authentication (Login, Registration, Password Recovery)
- Dashboard with charts and analytics
- Car management with service history
- Service management
- Service records tracking
- Payment management
- Comprehensive reports with export (PDF, Excel, CSV)
- Activity audit trail
- Toast notifications
- Form validation
- Loading skeletons
- Empty states

## Project Structure

```
frontend-project/
├── src/
│   ├── api/
│   │   └── apiClient.js          # API service configuration
│   ├── components/
│   │   ├── UI.jsx                # Reusable UI components
│   │   └── Layout.jsx            # Main layout with sidebar
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication context
│   │   └── ToastContext.jsx      # Toast notifications context
│   ├── hooks/
│   │   └── useCustomHooks.js     # Custom React hooks
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CarsPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── ServiceRecordsPage.jsx (also PaymentsPage)
│   │   └── ReportsPage.jsx
│   ├── styles/
│   │   └── index.css             # Global styles with Tailwind
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

1. Navigate to frontend directory:
```bash
cd frontend-project
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

## Features Breakdown

### Authentication
- User registration with security question setup
- Login with username and password
- Password recovery using security questions
- Session-based authentication
- Auto-logout on session expiry

### Dashboard
- Summary cards (cars serviced today, pending payments, daily revenue, pending amount)
- Monthly revenue chart (line chart)
- Payment status distribution (pie chart)
- Top services (bar chart)
- Recent activity log

### Car Management
- Add, edit, delete cars
- View service history per car
- Search and filter cars
- Pagination support
- Form validation

### Service Management
- Add, edit, delete services
- Set service prices
- Search and filter services
- Status management

### Service Records
- Record services for cars
- Track payment status (Paid, Partial, Unpaid)
- Assign mechanics
- Edit and delete records

### Payments
- Record payments
- View payment history
- Daily revenue tracking
- Payment method tracking

### Reports
- Service bill report (with payment details)
- Daily payment report
- Monthly revenue report
- Mechanic performance report
- Service frequency report
- Export to PDF, Excel, CSV

## UI Components

### Available Components
- Toast (notifications)
- Modal (dialogs)
- Loading spinner
- Skeleton loaders
- Confirm dialog
- Form group
- Input, Select, Textarea
- Badge
- Alert
- Empty state
- Pagination

### Styling
- Tailwind CSS for styling
- Dark mode support
- Custom CSS variables for theming
- Responsive design (mobile-first)
- Professional color palette (blues, purples, grays)
- Smooth transitions and animations

## Hooks

### Custom Hooks
- `useAuth()` - Authentication context
- `useToast()` - Toast notifications
- `useDarkMode()` - Dark mode management

## Utilities

- Date formatting functions
- Currency formatting
- Phone number formatting
- Validation functions
- File download utility
- Color utilities
- Text truncation
- Debouncing

## API Integration

All API calls are managed through `src/api/apiClient.js` which provides:
- Auth API methods
- Car API methods
- Service API methods
- Service Record API methods
- Payment API methods
- Report API methods
- Dashboard API methods

## Environment Variables

Create a `.env.local` file if needed:
```
VITE_API_URL=http://localhost:5000/api
```

## Development Tips

1. **Dark Mode Toggle**: Click the moon/sun icon in the header
2. **Form Validation**: All forms have inline error messages
3. **Toast Notifications**: Check top-right corner for feedback
4. **Responsive Design**: Test on mobile, tablet, and desktop
5. **Accessibility**: Use keyboard navigation and screen readers

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Code splitting with Vite
- Lazy loading pages
- Skeleton loaders for better perceived performance
- Optimized images
- Minified CSS and JS

## Dependencies

- **react** - UI library
- **react-dom** - React DOM rendering
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **chart.js** - Charts library
- **react-chartjs-2** - React wrapper for charts
- **date-fns** - Date utilities
- **clsx** - Conditional class names
- **lucide-react** - Icon library
- **tailwindcss** - Utility CSS framework

## License

All rights reserved.
