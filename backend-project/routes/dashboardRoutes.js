import express from 'express';
import {
  getDashboardSummary,
  getPaymentStatusData,
  getMonthlyRevenueData,
  getServiceCategoryData,
  getActivityLog,
} from '../controllers/dashboardController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Dashboard routes
router.get('/summary', isAuthenticated, getDashboardSummary);
router.get('/payment-status', isAuthenticated, getPaymentStatusData);
router.get('/monthly-revenue', isAuthenticated, getMonthlyRevenueData);
router.get('/service-category', isAuthenticated, getServiceCategoryData);
router.get('/activity-log', isAuthenticated, getActivityLog);

export default router;
