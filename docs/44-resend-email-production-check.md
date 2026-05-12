# 44 — Resend Email Production Check

Status: Phase 7 reference  
Pairs with: `scripts/test-email-production.mjs`  
Last updated: 2026-05-11

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
- Payment confirmed (after `tier_2` / `tier_3` capture)
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

## 4 · Hard rules

- Never test email to a real customer inbox without consent.
- Never include unredacted PII in alert payloads.
- Never log API keys or `Authorization` headers.
