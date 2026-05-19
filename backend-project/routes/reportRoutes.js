import express from 'express';
import {
  getServiceBill,
  getDailyPaymentReport,
  getMonthlyRevenueReport,
  getMechanicPerformanceReport,
  getServiceFrequencyReport,
  exportServiceBillPDF,
  exportPaymentReportPDF,
  exportServiceBillExcel,
  exportServiceBillCSV,
} from '../controllers/reportController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Report routes
router.get('/service-bill', isAuthenticated, getServiceBill);
router.get('/daily-payment', isAuthenticated, getDailyPaymentReport);
router.get('/monthly-revenue', isAuthenticated, getMonthlyRevenueReport);
router.get('/mechanic-performance', isAuthenticated, getMechanicPerformanceReport);
router.get('/service-frequency', isAuthenticated, getServiceFrequencyReport);

// Export routes
router.get('/export/service-bill-pdf', isAuthenticated, exportServiceBillPDF);
router.get('/export/payment-report-pdf', isAuthenticated, exportPaymentReportPDF);
router.get('/export/service-bill-excel', isAuthenticated, exportServiceBillExcel);
router.get('/export/service-bill-csv', isAuthenticated, exportServiceBillCSV);

export default router;
