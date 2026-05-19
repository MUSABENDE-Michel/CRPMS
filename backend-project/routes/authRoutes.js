import express from 'express';
import {
  register,
  login,
  logout,
  getSecurityQuestion,
  resetPassword,
  getCurrentAdmin,
} from '../controllers/authController.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', isNotAuthenticated, register);
router.post('/login', isNotAuthenticated, login);
router.post('/logout', isAuthenticated, logout);
router.post('/security-question', getSecurityQuestion);
router.post('/reset-password', resetPassword);
router.get('/me', isAuthenticated, getCurrentAdmin);

export default router;
