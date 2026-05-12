/**
 * Founder alert channel.
 *
 * Optional outbound webhook for founder-side notifications on:
 *  - request_submitted
 *  - failed_needs_retry
 *  - payment_failed (denied / reversed / refunded)
 *  - qa_failed
 *
 * Designed to be fire-and-forget. Never throws. Never blocks the customer
 * flow. If `ALERT_WEBHOOK_URL` is unset or the webhook fails, the call
 * silently no-ops.
 *
 * The default payload shape is Slack-compatible (`text` + `blocks`) but a
 * generic JSON receiver works equally well.
 */

import { env } from './env.js';

export interface NotifyFounderInput {
  /** Short headline (becomes Slack `text` and the first block). */
  message: string;
  /** Optional structured context block. Stringified as a code block. */
  context?: Record<string, unknown>;
  /**
   * Optional severity tag prepended to the message ("info" / "warn" / "error").
   * Defaults to "info".
   */
  severity?: 'info' | 'warn' | 'error';
}

export async function notifyFounder(input: NotifyFounderInput): Promise<void> {
  const url = env.alertWebhookUrl();
  if (!url || url.length === 0) return;

  const severity = input.severity ?? 'info';
  const headline = `[trustfolder/${severity}] ${input.message}`;

  const blocks: Array<Record<string, unknown>> = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${headline}*` },
    },
  ];

  if (input.context && Object.keys(input.context).length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '```' + safeStringify(input.context) + '```',
      },
    });
  }

  const body = JSON.stringify({
    text: headline,
    blocks,
    severity,
    context: input.context ?? null,
  });

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch {
    // intentionally swallowed — alerts must never break the customer flow
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
