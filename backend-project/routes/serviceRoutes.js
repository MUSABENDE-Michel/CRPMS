import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getActiveServices,
} from '../controllers/serviceController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Service routes
router.get('/', isAuthenticated, getServices);
router.get('/active', isAuthenticated, getActiveServices);
router.get('/:id', isAuthenticated, getServiceById);
router.post('/', isAuthenticated, createService);
router.put('/:id', isAuthenticated, updateService);
router.delete('/:id', isAuthenticated, deleteService);

export default router;
