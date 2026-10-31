import express from 'express';
import rateLimit from 'express-rate-limit';
import { processAIRequest, getInteractions } from '../controllers/aiController.js';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody, aiRequestSchema } from '../middleware/validateMiddleware.js';

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded for AI processing. Please wait a moment and try again.',
  },
});

/**
 * Helper middleware that maps dedicated module endpoints into the unified AI controller
 */
function bindModuleRoute(moduleName) {
  return (req, res, next) => {
    const inputData =
      req.body.inputData ||
      req.body.text ||
      req.body.gesture ||
      req.body.prompt ||
      'Analyze frame and provide accessible output.';
    const options = {
      ...(req.body.options || {}),
      ...(req.body.imageBase64 ? { imageBase64: req.body.imageBase64 } : {}),
      ...(req.body.mimeType ? { mimeType: req.body.mimeType } : {}),
      ...(req.body.signSystem ? { signSystem: req.body.signSystem } : {}),
      ...(req.body.sourceLang ? { sourceLang: req.body.sourceLang } : {}),
      ...(req.body.targetLang ? { targetLang: req.body.targetLang } : {}),
    };
    req.body = {
      module: moduleName,
      inputData: String(inputData),
      options,
    };
    next();
  };
}

// Unified AI processing endpoint: POST /api/ai/process
router.post('/ai/process', aiRateLimiter, optionalAuth, validateBody(aiRequestSchema), processAIRequest);

// Dedicated specialized module endpoints required by Section 6
router.post(
  '/ai/sign-language',
  aiRateLimiter,
  optionalAuth,
  bindModuleRoute('sign-language'),
  validateBody(aiRequestSchema),
  processAIRequest
);

router.post(
  '/ai/visual-assist',
  aiRateLimiter,
  optionalAuth,
  bindModuleRoute('visual-assistant'),
  validateBody(aiRequestSchema),
  processAIRequest
);

router.post(
  '/ai/dyslexia-simplify',
  aiRateLimiter,
  optionalAuth,
  bindModuleRoute('dyslexia-reader'),
  validateBody(aiRequestSchema),
  processAIRequest
);

router.post(
  '/ai/text-enhance',
  aiRateLimiter,
  optionalAuth,
  bindModuleRoute('tts-stt'),
  validateBody(aiRequestSchema),
  processAIRequest
);

// Interaction history endpoint (strict RLS by JWT user_id): GET /api/interactions
router.get('/interactions', authenticateToken, getInteractions);

export default router;
