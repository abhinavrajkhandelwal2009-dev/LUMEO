import axios from 'axios';
import { CLIENT_SUPABASE_CONFIG } from '../config/supabase';

const isVercelHost =
  typeof window !== 'undefined' &&
  window.location.hostname.endsWith('.vercel.app');

const API_BASE_URL = isVercelHost
  ? import.meta.env.VITE_RENDER_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    'https://lumeo-backend.onrender.com/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Lumeo-Client-Platform': 'vercel',
    'X-Supabase-Service-Url': CLIENT_SUPABASE_CONFIG.serviceUrl || '',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumeo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEDICATED_ENDPOINT_MAP = {
  'sign-language': '/ai/sign-language',
  'visual-assistant': '/ai/visual-assist',
  'dyslexia-reader': '/ai/dyslexia-simplify',
  'tts-stt': '/ai/text-enhance',
};

export async function processModuleAI(module, inputData, options = {}) {
  const endpoint = DEDICATED_ENDPOINT_MAP[module] || '/ai/process';
  const response = await api.post(endpoint, {
    module,
    inputData,
    options,
    ...options,
  });
  return response.data;
}

export async function fetchUserInteractions(moduleFilter = '') {
  const params = moduleFilter ? { module: moduleFilter } : {};
  const response = await api.get('/interactions', { params });
  return response.data.interactions;
}

export default api;
