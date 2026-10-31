import { z } from 'zod';

export const aiRequestSchema = z.object({
  module: z.string().min(1, 'Module name is required'),
  inputData: z.string().min(1, 'Input data cannot be empty'),
  options: z.record(z.any()).optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  accessibility_prefs: z
    .object({
      highContrast: z.boolean().optional(),
      fontSize: z.enum(['normal', 'large', 'xlarge']).optional(),
      dyslexiaFont: z.boolean().optional(),
      speechRate: z.number().min(0.5).max(2.0).optional(),
      speechPitch: z.number().min(0.5).max(2.0).optional(),
      defaultLanguage: z.string().optional(),
      globalMute: z.boolean().optional(),
      colorOverlay: z.string().optional(),
    })
    .optional(),
});

/**
 * Sanitizes string inputs to prevent script injection before database storage or AI prompt interpolation.
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\0/g, '')
    .trim();
}

export function sanitizePayload(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = sanitizePayload(v);
    }
    return cleaned;
  }
  return obj;
}

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = sanitizePayload(req.body);
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
}

