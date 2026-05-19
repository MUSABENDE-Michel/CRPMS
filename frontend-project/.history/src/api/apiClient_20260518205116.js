import axios from 'axios';

// FIXED: Use import.meta.env instead of process.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if needed
api.interceptors.request.use(
  (config) => {
    // You can add token logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear localStorage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getSecurityQuestion: (username) => api.post('/auth/security-question', { username }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Car API calls
export const carAPI = {
  getCars: (page = 1, limit = 10, search = '', status = 'Active') =>
    api.get('/cars', { params: { page, limit, search, status } }),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (data) => api.post('/cars', data),
  updateCar: (id, data) => api.put(`/cars/${id}`, data),
  deleteCar: (id) => api.delete(`/cars/${id}`),
  getCarsServicedToday: () => api.get('/cars/today'),
};

// Service API calls
export const serviceAPI = {
  getServices: (page = 1, limit = 10, search = '', status = 'Active') =>
    api.get('/services', { params: { page, limit, search, status } }),
  getServiceById: (id) => api.get(`/services/${id}`),
  getActiveServices: () => api.get('/services/active'),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// Service Record API calls
export const serviceRecordAPI = {
  getServiceRecords: (page = 1, limit = 10, search = '', status = '') =>
    api.get('/service-records', { params: { page, limit, search, status } }),
  getServiceRecordById: (id) => api.get(`/service-records/${id}`),
  createServiceRecord: (data) => api.post('/service-records', data),
  updateServiceRecord: (id, data) => api.put(`/service-records/${id}`, data),
  deleteServiceRecord: (id) => api.delete(`/service-records/${id}`),
  getCarHistory: (carId, page = 1, limit = 10) =>
    api.get(`/service-records/car/${carId}`, { params: { page, limit } }),
  getPendingPayments: () => api.get('/service-records/pending'),
};

// Payment API calls
export const paymentAPI = {
  getPayments: (page = 1, limit = 10, search = '') =>
    api.get('/payments', { params: { page, limit, search } }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  recordPayment: (data) => api.post('/payments', data),
  updatePayment: (id, data) => api.put(`/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  getDailyRevenue: () => api.get('/payments/daily-revenue'),
  getMonthlyRevenue: (month, year) =>
    api.get('/payments/monthly-revenue', { params: { month, year } }),
};

// Report API calls
export const reportAPI = {
  getServiceBill: () => api.get('/reports/service-bill'),
  getDailyPaymentReport: (date) => api.get('/reports/daily-payment', { params: { date } }),
  getMonthlyRevenueReport: (month, year) =>
    api.get('/reports/monthly-revenue', { params: { month, year } }),
  getMechanicPerformanceReport: () => api.get('/reports/mechanic-performance'),
  getServiceFrequencyReport: () => api.get('/reports/service-frequency'),
  exportServiceBillPDF: () => api.get('/reports/export/service-bill-pdf', { responseType: 'blob' }),
  exportPaymentReportPDF: (date) =>
    api.get('/reports/export/payment-report-pdf', { params: { date }, responseType: 'blob' }),
  exportServiceBillExcel: () => api.get('/reports/export/service-bill-excel', { responseType: 'blob' }),
  exportServiceBillCSV: () => api.get('/reports/export/service-bill-csv', { responseType: 'blob' }),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboardSummary: () => api.get('/dashboard/summary'),
  getPaymentStatusData: () => api.get('/dashboard/payment-status'),
  getMonthlyRevenueData: () => api.get('/dashboard/monthly-revenue'),
  getServiceCategoryData: () => api.get('/dashboard/service-category'),
  getActivityLog: (page = 1, limit = 20, action = '', entity = '') =>
    api.get('/dashboard/activity-log', { params: { page, limit, action, entity } }),
};

export default api;