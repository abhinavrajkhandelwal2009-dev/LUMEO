import express from 'express';
import rateLimit from 'express-rate-limit';
import { processAIRequest, getInteractions } from '../controllers/aiController.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody, aiRequestSchema } from '../middleware/validateMiddleware.js';

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded for AI processing. Please wait a moment and try again.',
  },
});

// Unified AI processing endpoint: POST /api/ai/process
router.post('/ai/process', aiRateLimiter, optionalAuth, validateBody(aiRequestSchema), processAIRequest);

// Interaction history endpoint (strict RLS by JWT user_id): GET /api/interactions
router.get('/interactions', authenticateToken, getInteractions);

export default router;

