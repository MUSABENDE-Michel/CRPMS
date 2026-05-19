import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getCarsServicedToday,
} from '../controllers/carController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Car routes
router.get('/', isAuthenticated, getCars);
router.get('/today', isAuthenticated, getCarsServicedToday);
router.get('/:id', isAuthenticated, getCarById);
router.post('/', isAuthenticated, createCar);
router.put('/:id', isAuthenticated, updateCar);
router.delete('/:id', isAuthenticated, deleteCar);

export default router;
