/**
 * Request lead capture.
 *
 * Public surface used by `app/app/api/request/route.ts` (the lead capture
 * endpoint). Inserts a row into `requests` (see migration 0002) and returns
 * the new id + status. Email + founder alert are sent by the route handler
 * as fire-and-forget side effects so a missing env never breaks the form.
 */

import { service } from './lib/supabase.js';
import type { Result } from './lib/types.js';

// =============================================================================
// Types
// =============================================================================

export type RequestStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'closed_lost';

export interface CreateRequestInput {
  email: string;
  website_url?: string | null;
  company_name?: string | null;
  package_interest?: string | null;
  message?: string | null;
  source_page?: string | null;
  metadata?: Record<string, unknown>;
}

export interface RequestRow {
  id: string;
  email: string;
  website_url: string | null;
  company_name: string | null;
  package_interest: string | null;
  message: string | null;
  source_page: string | null;
  status: RequestStatus;
  created_at: string;
  metadata: Record<string, unknown>;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Insert a new request. Always returns a Result; never throws.
 *
 * Caller is responsible for any best-effort side effects (email, alert).
 */
export async function createRequest(
  input: CreateRequestInput,
): Promise<Result<RequestRow>> {
  const email = (input.email ?? '').trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  const sb = service();
  const { data, error } = await sb
    .from('requests')
    .insert({
      email,
      website_url: nullIfEmpty(input.website_url),
      company_name: nullIfEmpty(input.company_name),
      package_interest: nullIfEmpty(input.package_interest),
      message: nullIfEmpty(input.message),
      source_page: nullIfEmpty(input.source_page),
      status: 'new',
      metadata: input.metadata ?? {},
    })
    .select(
      'id, email, website_url, company_name, package_interest, message, source_page, status, created_at, metadata',
    )
    .single();

  if (error || !data) {
    return { ok: false, error: `requests_insert_failed: ${error?.message ?? 'unknown'}` };
  }

  return { ok: true, data: data as RequestRow };
}

// =============================================================================
// Helpers
// =============================================================================

function nullIfEmpty(s: string | null | undefined): string | null {
  if (s === undefined || s === null) return null;
  const trimmed = s.trim();
  return trimmed.length === 0 ? null : trimmed;
}
