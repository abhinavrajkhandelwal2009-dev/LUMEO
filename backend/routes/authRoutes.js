import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  validateBody,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
} from '../middleware/validateMiddleware.js';

const router = express.Router();

// Auth endpoints: /api/auth/register & /api/auth/login
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/login', validateBody(loginSchema), login);

// User Profile & Accessibility Preferences endpoints: /api/user/profile
router.get('/user/profile', authenticateToken, getProfile);
router.put('/user/profile', authenticateToken, validateBody(profileUpdateSchema), updateProfile);

export default router;

