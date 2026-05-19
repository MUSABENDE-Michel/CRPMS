import express from 'express';
import {
  getPayments,
  getPaymentById,
  recordPayment,
  updatePayment,
  deletePayment,
  getDailyRevenue,
  getMonthlyRevenue,
} from '../controllers/paymentController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Payment routes
router.get('/', isAuthenticated, getPayments);
router.get('/daily-revenue', isAuthenticated, getDailyRevenue);
router.get('/monthly-revenue', isAuthenticated, getMonthlyRevenue);
router.get('/:id', isAuthenticated, getPaymentById);
router.post('/', isAuthenticated, recordPayment);
router.put('/:id', isAuthenticated, updatePayment);
router.delete('/:id', isAuthenticated, deletePayment);

export default router;
