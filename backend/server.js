import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, getDatabaseStatus } from './config/db.js';
import { SUPABASE_CONFIG, isSupabaseConfigured } from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.supabase'), override: false });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_VERCEL_URL,
  process.env.FRONTEND_URL,
  'https://lumeo-client.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from Vercel deployments (*.vercel.app), configured origins, or server-to-server calls
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check & Render + Supabase connectivity diagnostic route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LUMEO Core Accessibility Backend (Render + Supabase)',
    version: '1.0.0',
    renderService: process.env.RENDER_SERVICE_NAME || 'lumeo-backend-api',
    renderExternalUrl: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Dedicated Supabase status endpoint
app.get('/api/supabase/status', (req, res) => {
  res.status(200).json({
    configured: isSupabaseConfigured(),
    serviceUrl: SUPABASE_CONFIG.serviceUrl,
    hasAnonKey: Boolean(SUPABASE_CONFIG.anonKey),
    hasServiceRoleKey: Boolean(SUPABASE_CONFIG.serviceRoleKey),
    storageEngine: getDatabaseStatus().engine,
  });
});

// Mount API routes
app.use('/api', authRoutes);
app.use('/api', aiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Backend Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred.',
  });
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `LUMEO Backend (Render + Supabase) listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();

export default app;
