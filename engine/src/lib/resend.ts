/**
 * Resend email client wrapper.
 *
 * Wraps email sends with structured logging into the email_events table.
 * Engine modules use sendTransactional() for all customer-facing email.
 */

import { Resend } from 'resend';
import { env } from './env.js';
import { service } from './supabase.js';

let _client: Resend | null = null;

export function resend(): Resend {
  if (_client) return _client;
  _client = new Resend(env.resendApiKey());
  return _client;
}

export interface SendTransactionalInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  template_id: string; // 'pack_delivery' | 'order_confirmation' | 'retry_notice' | 'out_of_scope_refund' | ...
  order_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SendTransactionalOutput {
  email_id: string; // our email_events.id
  resend_message_id?: string;
  status: 'sent' | 'failed';
  error?: string;
}

export async function sendTransactional(
  input: SendTransactionalInput,
): Promise<SendTransactionalOutput> {
  const sb = service();

  // 1. Log the email_event row first (queued)
  const { data: ev, error: insertErr } = await sb
    .from('email_events')
    .insert({
      order_id: input.order_id ?? null,
      to_email: input.to,
      template_id: input.template_id,
      subject: input.subject,
      status: 'queued',
      metadata: input.metadata ?? {},
    })
    .select('id')
    .single();

  if (insertErr || !ev) {
    return {
      email_id: '',
      status: 'failed',
      error: `db_insert_failed: ${insertErr?.message ?? 'unknown'}`,
    };
  }

  const emailId = ev.id as string;

  // 2. Send via Resend
  try {
    const r = await resend().emails.send({
      from: env.resendFromEmail(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: env.resendReplyTo(),
      headers: { 'X-Trustfolder-Email-ID': emailId },
    });
    if (r.error) {
      await sb
        .from('email_events')
        .update({
          status: 'failed',
          error_message: r.error.message,
        })
        .eq('id', emailId);
      return { email_id: emailId, status: 'failed', error: r.error.message };
    }

    await sb
      .from('email_events')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        resend_message_id: r.data?.id ?? null,
      })
      .eq('id', emailId);

    return { email_id: emailId, resend_message_id: r.data?.id, status: 'sent' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sb
      .from('email_events')
      .update({ status: 'failed', error_message: msg })
      .eq('id', emailId);
    return { email_id: emailId, status: 'failed', error: msg };
  }
}
