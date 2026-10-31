import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  SUPABASE_CONFIG,
  isSupabaseConfigured,
  supabaseAdminClient,
  supabaseAnonClient,
} from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.supabase'), override: false });

const { Pool } = pg;

const connectionString =
  process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString,
  ssl:
    connectionString.includes('supabase.com') || process.env.SUPABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
});

const FALLBACK_DB_PATH = path.join(__dirname, 'local_store.json');

function loadLocalStore() {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      return JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not read local store:', e.message);
  }
  return { users: [], user_interactions: [] };
}

function saveLocalStore(store) {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write local store:', e.message);
  }
}

let isPostgresConnected = false;
let activeStorageEngine = 'local-fallback';

export function getDatabaseStatus() {
  return {
    engine: activeStorageEngine,
    supabaseSdkConfigured: isSupabaseConfigured(),
    supabaseServiceUrl: SUPABASE_CONFIG.serviceUrl,
    postgresPoolConnected: isPostgresConnected,
  };
}

export async function initializeDatabase() {
  // 1. Check if Supabase JS Client is configured with SUPABASE_SERVICE_URL & SUPABASE_ANON_KEY / SERVICE_ROLE_KEY
  if (isSupabaseConfigured() && (supabaseAdminClient || supabaseAnonClient)) {
    activeStorageEngine = 'supabase-sdk';
    console.log(
      `Supabase SDK initialized with Service URL: ${SUPABASE_CONFIG.serviceUrl}`
    );
  }

  // 2. Check if direct PostgreSQL / Supabase Pooler connection string is live
  const isValidPostgresUri =
    Boolean(connectionString) &&
    (connectionString.startsWith('postgres://') ||
      connectionString.startsWith('postgresql://')) &&
    !connectionString.includes('your-project-ref') &&
    !connectionString.includes('user:password@localhost');

  if (isValidPostgresUri) {
    try {
      const client = await pool.connect();
      try {
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(schemaSql);
        isPostgresConnected = true;
        activeStorageEngine = 'supabase-postgres-pool';
        console.log('Supabase PostgreSQL Pool connected and schema verified.');
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      isPostgresConnected = false;
      console.warn('Supabase Postgres Pool unreachable (' + err.message + ').');
    }
  }

  if (activeStorageEngine !== 'supabase-sdk') {
    console.log(
      'Running with local persistent relational store until Supabase credentials in .env.supabase are populated.'
    );
  }
}

/**
 * Unified query executor supporting:
 * 1. Direct Supabase PostgreSQL connection pool (`pg`)
 * 2. Supabase Data API Client (`@supabase/supabase-js` using SUPABASE_SERVICE_URL & SUPABASE_ANON_KEY / SERVICE_ROLE_KEY)
 * 3. Local JSON relational fallback for zero-downtime development
 */
export async function query(text, params = []) {
  // Priority 1: Live PostgreSQL / Supabase Pooler
  if (isPostgresConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === '57P01' || err.code === 'ENOTFOUND') {
        isPostgresConnected = false;
      } else {
        throw err;
      }
    }
  }

  const normalized = text.replace(/\s+/g, ' ').trim().toUpperCase();
  const sb = supabaseAdminClient || supabaseAnonClient;

  // Priority 2: Supabase SDK (@supabase/supabase-js) over HTTPS Service URL
  if (isSupabaseConfigured() && sb) {
    try {
      // 1. Select user by email
      if (normalized.startsWith('SELECT * FROM USERS WHERE EMAIL = $1')) {
        const email = String(params[0]).toLowerCase();
        const { data, error } = await sb
          .from('users')
          .select('*')
          .eq('email', email);
        if (!error && data) return { rows: data, rowCount: data.length };
      }

      // 2. Select user by id
      if (
        normalized.startsWith(
          'SELECT ID, NAME, EMAIL, ACCESSIBILITY_PREFS, CREATED_AT, UPDATED_AT FROM USERS WHERE ID = $1'
        ) ||
        normalized.startsWith('SELECT ID, NAME, EMAIL, ACCESSIBILITY_PREFS FROM USERS WHERE ID = $1') ||
        normalized.startsWith('SELECT * FROM USERS WHERE ID = $1')
      ) {
        const id = params[0];
        const { data, error } = await sb
          .from('users')
          .select('id, name, email, accessibility_prefs, created_at, updated_at')
          .eq('id', id);
        if (!error && data) return { rows: data, rowCount: data.length };
      }

      // 3. Insert new user
      if (normalized.startsWith('INSERT INTO USERS')) {
        const [name, email, password_hash, prefs] = params;
        const parsedPrefs =
          typeof prefs === 'string' ? JSON.parse(prefs) : prefs;
        const { data, error } = await sb
          .from('users')
          .insert([
            {
              name,
              email: String(email).toLowerCase(),
              password_hash,
              accessibility_prefs: parsedPrefs,
            },
          ])
          .select('id, name, email, accessibility_prefs, created_at, updated_at');
        if (!error && data) return { rows: data, rowCount: data.length };
      }

      // 4. Update user profile & accessibility_prefs
      if (normalized.startsWith('UPDATE USERS SET')) {
        let userId, nextPrefs, nextName;
        if (params.length === 3) {
          [nextName, nextPrefs, userId] = params;
        } else {
          [nextPrefs, userId] = params;
        }
        const parsedPrefs =
          typeof nextPrefs === 'string' ? JSON.parse(nextPrefs) : nextPrefs;
        const updatePayload = {
          accessibility_prefs: parsedPrefs,
          updated_at: new Date().toISOString(),
        };
        if (nextName) updatePayload.name = nextName;

        const { data, error } = await sb
          .from('users')
          .update(updatePayload)
          .eq('id', userId)
          .select('id, name, email, accessibility_prefs, created_at, updated_at');
        if (!error && data) return { rows: data, rowCount: data.length };
      }

      // 5. Insert user_interactions (RLS user_id enforced)
      if (normalized.startsWith('INSERT INTO USER_INTERACTIONS')) {
        const [user_id, module_name, input_payload, ai_response] = params;
        const parsedResponse =
          typeof ai_response === 'string' ? JSON.parse(ai_response) : ai_response;
        const { data, error } = await sb
          .from('user_interactions')
          .insert([
            {
              user_id,
              module_name,
              input_payload,
              ai_response: parsedResponse,
            },
          ])
          .select('*');
        if (!error && data) return { rows: data, rowCount: data.length };
      }

      // 6. Select user_interactions with RLS user_id filter
      if (normalized.includes('FROM USER_INTERACTIONS WHERE USER_ID = $1')) {
        const userId = params[0];
        const moduleFilter = params[1];
        let reqQuery = sb
          .from('user_interactions')
          .select('id, user_id, module_name, input_payload, ai_response, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (moduleFilter && normalized.includes('MODULE_NAME = $2')) {
          reqQuery = reqQuery.eq('module_name', moduleFilter);
        }

        const { data, error } = await reqQuery;
        if (!error && data) return { rows: data, rowCount: data.length };
      }
    } catch (sbErr) {
      console.warn('Supabase SDK query fallback notice:', sbErr.message);
    }
  }

  // Priority 3: Local persistent relational fallback store
  const store = loadLocalStore();

  if (normalized.startsWith('SELECT * FROM USERS WHERE EMAIL = $1')) {
    const email = String(params[0]).toLowerCase();
    const rows = store.users.filter((u) => u.email.toLowerCase() === email);
    return { rows, rowCount: rows.length };
  }

  if (
    normalized.startsWith(
      'SELECT ID, NAME, EMAIL, ACCESSIBILITY_PREFS, CREATED_AT, UPDATED_AT FROM USERS WHERE ID = $1'
    ) ||
    normalized.startsWith('SELECT ID, NAME, EMAIL, ACCESSIBILITY_PREFS FROM USERS WHERE ID = $1') ||
    normalized.startsWith('SELECT * FROM USERS WHERE ID = $1')
  ) {
    const id = params[0];
    const rows = store.users
      .filter((u) => u.id === id)
      .map(({ password_hash, ...rest }) => rest);
    return { rows, rowCount: rows.length };
  }

  if (normalized.startsWith('INSERT INTO USERS')) {
    const [name, email, password_hash, prefs] = params;
    const exists = store.users.some(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) {
      const err = new Error(
        'duplicate key value violates unique constraint "users_email_key"'
      );
      err.code = '23505';
      throw err;
    }
    const now = new Date().toISOString();
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: String(email).toLowerCase(),
      password_hash,
      accessibility_prefs: prefs
        ? typeof prefs === 'string'
          ? JSON.parse(prefs)
          : prefs
        : {
            highContrast: false,
            fontSize: 'normal',
            dyslexiaFont: false,
            speechRate: 1.0,
            defaultLanguage: 'English',
            globalMute: false,
          },
      created_at: now,
      updated_at: now,
    };
    store.users.push(newUser);
    saveLocalStore(store);
    const { password_hash: _, ...safeUser } = newUser;
    return { rows: [safeUser], rowCount: 1 };
  }

  if (normalized.startsWith('UPDATE USERS SET')) {
    let userId, nextPrefs, nextName;
    if (params.length === 3) {
      [nextName, nextPrefs, userId] = params;
    } else {
      [nextPrefs, userId] = params;
    }
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx === -1) return { rows: [], rowCount: 0 };

    const parsedPrefs =
      typeof nextPrefs === 'string' ? JSON.parse(nextPrefs) : nextPrefs;
    if (nextName) store.users[idx].name = nextName;
    store.users[idx].accessibility_prefs = {
      ...store.users[idx].accessibility_prefs,
      ...parsedPrefs,
    };
    store.users[idx].updated_at = new Date().toISOString();
    saveLocalStore(store);
    const { password_hash: _, ...safeUser } = store.users[idx];
    return { rows: [safeUser], rowCount: 1 };
  }

  if (normalized.startsWith('INSERT INTO USER_INTERACTIONS')) {
    const [user_id, module_name, input_payload, ai_response] = params;
    const newInteraction = {
      id: crypto.randomUUID(),
      user_id,
      module_name,
      input_payload,
      ai_response:
        typeof ai_response === 'string' ? JSON.parse(ai_response) : ai_response,
      created_at: new Date().toISOString(),
    };
    store.user_interactions.push(newInteraction);
    saveLocalStore(store);
    return { rows: [newInteraction], rowCount: 1 };
  }

  if (normalized.includes('FROM USER_INTERACTIONS WHERE USER_ID = $1')) {
    const userId = params[0];
    const moduleFilter = params[1];
    let rows = store.user_interactions.filter((item) => item.user_id === userId);
    if (moduleFilter && normalized.includes('MODULE_NAME = $2')) {
      rows = rows.filter((item) => item.module_name === moduleFilter);
    }
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: rows.slice(0, 50), rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

export default {
  pool,
  query,
  initializeDatabase,
  getDatabaseStatus,
};
