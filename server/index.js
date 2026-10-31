import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import {
  SERVER_SUPABASE_CONFIG,
  isServerSupabaseReady,
} from './config/supabaseClient.js';

dotenv.config();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 4000;
const TARGET_BACKEND =
  process.env.NODE_ENV === 'production'
    ? process.env.RENDER_BACKEND_URL || 'https://lumeo-backend.onrender.com'
    : process.env.LOCAL_BACKEND_URL || 'http://localhost:5000';

app.use(
  cors({
    origin: [
      process.env.VERCEL_CLIENT_URL || 'https://lumeo-client.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));

// Gateway status endpoint
app.get('/api/server/status', (req, res) => {
  res.status(200).json({
    system: 'LUMEO Dedicated Server Gateway',
    port: SERVER_PORT,
    targetBackend: TARGET_BACKEND,
    supabaseReady: isServerSupabaseReady,
    supabaseServiceUrl: SERVER_SUPABASE_CONFIG.serviceUrl,
    timestamp: new Date().toISOString(),
  });
});

// Proxy all /api/* requests cleanly to the Render / Core Backend
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${TARGET_BACKEND}/api${req.url}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      validateStatus: () => true,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(502).json({
      error: 'Backend Gateway Error',
      message: err.message,
      targetBackend: TARGET_BACKEND,
    });
  }
});

app.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(
    `LUMEO Server Gateway running on http://0.0.0.0:${SERVER_PORT} -> forwarding to ${TARGET_BACKEND}`
  );
});

