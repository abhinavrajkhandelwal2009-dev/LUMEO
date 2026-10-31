import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load both standard .env and dedicated .env.supabase
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.supabase'), override: false });

export const SUPABASE_CONFIG = {
  url:
    process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-ref')
      ? process.env.SUPABASE_URL
      : process.env.SUPABASE_SERVICE_URL || '',
  serviceUrl:
    process.env.SUPABASE_SERVICE_URL && !process.env.SUPABASE_SERVICE_URL.includes('your-project-ref')
      ? process.env.SUPABASE_SERVICE_URL
      : process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  dbUrl: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '',
};

/**
 * Checks whether real Supabase credentials have been populated in .env / .env.supabase
 */
export function isSupabaseConfigured() {
  const { url, anonKey, serviceRoleKey } = SUPABASE_CONFIG;
  const hasValidUrl =
    Boolean(url) &&
    url.startsWith('https://') &&
    !url.includes('your-project-ref.supabase.co');

  const hasValidKey =
    (Boolean(serviceRoleKey) && !serviceRoleKey.includes('your_supabase_service_role_key_here')) ||
    (Boolean(anonKey) && !anonKey.includes('your_supabase_anon_key_here'));

  return hasValidUrl && hasValidKey;
}

/**
 * Public/Anon Supabase client (uses SUPABASE_SERVICE_URL / SUPABASE_URL + SUPABASE_ANON_KEY)
 */
export const supabaseAnonClient = isSupabaseConfigured() && SUPABASE_CONFIG.anonKey
  ? createClient(SUPABASE_CONFIG.serviceUrl, SUPABASE_CONFIG.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/**
 * Privileged Backend Admin Supabase client (uses SUPABASE_SERVICE_URL + SUPABASE_SERVICE_ROLE_KEY,
 * falling back to SUPABASE_ANON_KEY if service role key is not yet set)
 */
export const supabaseAdminClient = isSupabaseConfigured()
  ? createClient(
      SUPABASE_CONFIG.serviceUrl,
      SUPABASE_CONFIG.serviceRoleKey &&
        !SUPABASE_CONFIG.serviceRoleKey.includes('your_supabase_service_role_key_here')
        ? SUPABASE_CONFIG.serviceRoleKey
        : SUPABASE_CONFIG.anonKey,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    )
  : null;

/**
 * Creates a request-scoped Supabase client using the Anon Key and forwarding the user's JWT
 * so Supabase Row Level Security (RLS) policies can evaluate auth.uid().
 */
export function createScopedSupabaseClient(jwtToken) {
  if (!isSupabaseConfigured()) return null;
  return createClient(SUPABASE_CONFIG.serviceUrl, SUPABASE_CONFIG.anonKey, {
    global: {
      headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {},
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default {
  SUPABASE_CONFIG,
  isSupabaseConfigured,
  supabaseAnonClient,
  supabaseAdminClient,
  createScopedSupabaseClient,
};

