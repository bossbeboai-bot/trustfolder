/**
 * Supabase client wrapper.
 *
 * Two clients are exposed:
 *  - service(): server-only, uses service-role key. Bypasses RLS.
 *               Use this in API routes, webhooks, background jobs.
 *  - publicAnon(): anon-key client for any explicit public reads.
 *
 * Engine modules ALWAYS use service(). The Next.js layer chooses.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let _service: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

export function service(): SupabaseClient {
  if (_service) return _service;
  _service = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-trustfolder-client': 'engine-service' } },
  });
  return _service;
}

export function publicAnon(): SupabaseClient {
  if (_anon) return _anon;
  _anon = createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-trustfolder-client': 'engine-anon' } },
  });
  return _anon;
}

/**
 * Helper: log structured error to console + return a typed Result.
 * Engine modules use this to keep error handling uniform.
 */
export function dbError<T>(context: string, err: unknown): { ok: false; error: string } {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[supabase:${context}] ${msg}`);
  return { ok: false, error: `${context}: ${msg}` };
}
