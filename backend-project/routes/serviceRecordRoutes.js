import express from 'express';
import {
  getServiceRecords,
  getServiceRecordById,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  getCarServiceHistory,
  getPendingPayments,
} from '../controllers/serviceRecordController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Service record routes
router.get('/', isAuthenticated, getServiceRecords);
router.get('/pending', isAuthenticated, getPendingPayments);
router.get('/car/:carId', isAuthenticated, getCarServiceHistory);
router.get('/:id', isAuthenticated, getServiceRecordById);
router.post('/', isAuthenticated, createServiceRecord);
router.put('/:id', isAuthenticated, updateServiceRecord);
router.delete('/:id', isAuthenticated, deleteServiceRecord);

export default router;
