import { createClient } from '@supabase/supabase-js';

export const CLIENT_SUPABASE_CONFIG = {
  url:
    import.meta.env.VITE_SUPABASE_SERVICE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    '',
  serviceUrl:
    import.meta.env.VITE_SUPABASE_SERVICE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  vercelProjectUrl:
    import.meta.env.VITE_VERCEL_PROJECT_URL || 'https://lumeo-client.vercel.app',
};

export const supabaseClient =
  CLIENT_SUPABASE_CONFIG.serviceUrl && CLIENT_SUPABASE_CONFIG.anonKey
    ? createClient(CLIENT_SUPABASE_CONFIG.serviceUrl, CLIENT_SUPABASE_CONFIG.anonKey)
    : null;

export default supabaseClient;

