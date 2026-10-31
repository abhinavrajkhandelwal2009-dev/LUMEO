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

export function isClientSupabaseConfigured() {
  return (
    Boolean(CLIENT_SUPABASE_CONFIG.serviceUrl) &&
    CLIENT_SUPABASE_CONFIG.serviceUrl.startsWith('https://') &&
    !CLIENT_SUPABASE_CONFIG.serviceUrl.includes('your-project-ref.supabase.co') &&
    Boolean(CLIENT_SUPABASE_CONFIG.anonKey) &&
    !CLIENT_SUPABASE_CONFIG.anonKey.includes('your_supabase_anon_key_here')
  );
}

export const supabaseClient = isClientSupabaseConfigured()
  ? createClient(CLIENT_SUPABASE_CONFIG.serviceUrl, CLIENT_SUPABASE_CONFIG.anonKey)
  : null;

export default supabaseClient;

