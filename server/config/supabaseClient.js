import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.supabase'), override: false });

export const SERVER_SUPABASE_CONFIG = {
  url: process.env.SUPABASE_SERVICE_URL || process.env.SUPABASE_URL || '',
  serviceUrl: process.env.SUPABASE_SERVICE_URL || process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

export const isServerSupabaseReady =
  Boolean(SERVER_SUPABASE_CONFIG.serviceUrl) &&
  !SERVER_SUPABASE_CONFIG.serviceUrl.includes('your-project-ref.supabase.co') &&
  Boolean(SERVER_SUPABASE_CONFIG.anonKey) &&
  !SERVER_SUPABASE_CONFIG.anonKey.includes('your_supabase_anon_key_here');

export const supabaseAnon = isServerSupabaseReady
  ? createClient(SERVER_SUPABASE_CONFIG.serviceUrl, SERVER_SUPABASE_CONFIG.anonKey, {
      auth: { persistSession: false },
    })
  : null;

export const supabaseService = isServerSupabaseReady
  ? createClient(
      SERVER_SUPABASE_CONFIG.serviceUrl,
      SERVER_SUPABASE_CONFIG.serviceRoleKey &&
        !SERVER_SUPABASE_CONFIG.serviceRoleKey.includes('your_supabase_service_role_key_here')
        ? SERVER_SUPABASE_CONFIG.serviceRoleKey
        : SERVER_SUPABASE_CONFIG.anonKey,
      { auth: { persistSession: false } }
    )
  : null;

