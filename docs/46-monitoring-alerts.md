# 46 — Monitoring and Alerts

Status: Phase 7 reference  
Last updated: 2026-05-11

## 1 · 24/7 minimum

For launch, the operator must be able to see:

- Vercel function logs (`Deployments → [latest] → Functions`)
- Supabase logs (`Project → Logs`)
- PayPal webhook delivery view (`Apps → [app] → Webhooks → Webhook events`)
- Resend dashboard (Activity)

Bookmark all four. If any of them is unreachable, do not launch.

## 2 · Alerts

Founder alerts route via `ALERT_WEBHOOK_URL` (Slack/Discord/PagerDuty
incoming webhook). If unset, the engine alert helper falls back to
emailing `ADMIN_EMAIL`.

Trigger conditions (existing or to add as bug fixes if missing):

- Generation failure (`failed_needs_retry`)
- Payment denied / refunded / reversed
- Email send failure (best-effort; never blocks the customer flow)
- New request submission (info-level, optional)

The customer flow must never fail because alerting failed.

## 3 · `/api/health`

Phase 7 adds a small read-only health endpoint:

`GET /api/health`

```json
{ "ok": true, "checks": { "app": true, "supabase": true, "storage": true } }
```

It returns 200 only when every check is `true`, and 503 otherwise. It
never returns secrets, project IDs, or schema details.

## 4 · Optional uptime monitoring

After launch, configure one of:

- UptimeRobot HTTP check on `https://yourdomain.com/api/health`,
  5-minute interval.
- Better Stack (Logtail) heartbeat on the same URL.

Alert on two consecutive failures (10 minutes outage budget).

## 5 · Optional later observability

Not required for launch:

- Sentry for client/server errors.
- Axiom or Logtail for structured logs.
- Plausible or PostHog for marketing analytics.

These are P2 in `docs/48-competitor-audit-action-plan.md` and can be
added without code changes here when ready.

## 6 · Hard rules

- No PII in alert payloads beyond email + order ID.
- No secrets in any log or alert.
- No public exposure of Supabase / PayPal / Resend internals via
  `/api/health`.
