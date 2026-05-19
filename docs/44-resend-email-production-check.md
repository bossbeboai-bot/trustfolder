# 44 — Resend Email Production Check

Status: Phase 7 reference  
Pairs with: `scripts/test-email-production.mjs`  
Last updated: 2026-05-19

## 1 · Sending domain

1. In Resend, add the sending domain (e.g. `trustfolder.com`).
2. Verify SPF and DKIM records at the registrar.
3. Wait for verification status to be green.
4. Set the production env:
   - `RESEND_API_KEY=...`
   - `RESEND_FROM_EMAIL=hello@trustfolder.com`
   - `SUPPORT_EMAIL=support@trustfolder.com`
   - `ADMIN_EMAIL=founder@trustfolder.com`

Bare-bones sender hygiene:

- DMARC policy at least `p=none` initially, move to `p=quarantine`
  after deliverability is stable.
- Reverse DNS / PTR is not needed when sending via Resend.

## 2 · Transactional emails to verify

Each of these should send successfully against a real inbox in
production-or-equivalent settings:

- Magic link email (customer login)
- Request received (after `/request`)
- Payment confirmed (after `tier_1` / `tier_2` / `tier_3` capture)
- Pack preparing (during generation)
- Pack delivered (with dashboard link)
- Payment failed / refunded notification

Founder alerts:

- New request submission (info)
- Generation failure (`failed_needs_retry`)
- Payment denied / refunded / reversed
- Email send failure (best-effort; never blocks the customer flow)

If `ALERT_WEBHOOK_URL` is unset, alerts fall back to `ADMIN_EMAIL`.

## 3 · Test script

Run:

```sh
node scripts/test-email-production.mjs --to founder@trustfolder.com
```

The script:

- Reads `engine/.env`
- Sends one clearly-marked test email to the address you pass via
  `--to` (or falls back to `ADMIN_EMAIL`)
- Never prints `RESEND_API_KEY` or any other secret
- Logs `EMAIL_TEST_RESULT: GO` / `BLOCKED`
- On failure, prints the non-secret Resend error message, for example
  `API key is invalid`.

## 3.1 · Current production blocker

As of 2026-05-19, production email delivery is blocked by Resend returning
`401` with `API key is invalid`.

Observed evidence:

- Direct script probe failed:

```sh
node scripts/test-email-production.mjs --to aaron.miller198@protonmail.com
```

- Live `/api/request` created an `email_events` row but moved it to
  `failed` with `error_message = API key is invalid`.

Next action:

1. Replace `RESEND_API_KEY` in Vercel Production with a valid key.
2. Replace local `engine/.env` with the same approved key for operator
   probes.
3. Confirm `RESEND_FROM_EMAIL` is verified in Resend.
4. Redeploy production if Vercel requires it for the env update.
5. Rerun the test script and one live request.
6. Accept email only after `email_events.status = sent` and a real
   `resend_message_id` exists.

## 4 · Hard rules

- Never test email to a real customer inbox without consent.
- Never include unredacted PII in alert payloads.
- Never log API keys or `Authorization` headers.
