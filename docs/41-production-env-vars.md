# 41 — Production Environment Variables

Status: Phase 7 reference  
Pairs with: `app/.env.example`, `engine/.env.example`  
Last updated: 2026-05-19

This is the canonical list of production environment variables. Every
variable must be set in Vercel's Production environment. None of these
are committed to source control.

## 1 · Hard rules

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` via `NEXT_PUBLIC_*`.
- **Never** expose `PAYPAL_CLIENT_SECRET` via `NEXT_PUBLIC_*`.
- **Never** print secrets in logs.
- The only `NEXT_PUBLIC_*` values are safe public client IDs / URLs.
- Cookie / session secrets must be at least 32 random bytes.

## 2 · Supabase

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL, e.g. `https://abcd.supabase.co` |
| `SUPABASE_ANON_KEY` | optional | Anonymous key (only if a route uses it) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service role key (server only) |
| `SUPABASE_STORAGE_BUCKET` | yes | Bucket for delivered packs (default `deliveries`) |

The bucket must be **private**. Customers receive signed download URLs
generated server-side with the service role key.

## 3 · AI provider

| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | yes | `anthropic` (default) or `ollama` |
| `ANTHROPIC_API_KEY` | if `AI_PROVIDER=anthropic` | Production Anthropic key |
| `OLLAMA_BASE_URL` | if `AI_PROVIDER=ollama` | Always-on hosted URL |
| `OLLAMA_MODEL` | if `AI_PROVIDER=ollama` | Model name |
| `OLLAMA_API_KEY` | if needed | Auth header for hosted Ollama |

Local Ollama is **not** acceptable for 24/7 production. If `AI_PROVIDER=ollama`,
the host must be an always-on server (cloud GPU, internal box with
guaranteed uptime).

## 4 · Email (Resend)

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | yes | Production Resend API key |
| `RESEND_FROM_EMAIL` | yes | Verified sending address (e.g. `hello@trustfolder.com`). Code uses this name; `EMAIL_FROM` may be aliased to it during rename later. |
| `SUPPORT_EMAIL` | yes | Inbox shown to customers (`support@…`) |
| `ADMIN_EMAIL` | yes | Founder alert inbox |

## 5 · Payments (PayPal)

| Variable | Required | Description |
|---|---|---|
| `PAYPAL_CLIENT_ID` | yes | Live client ID |
| `PAYPAL_CLIENT_SECRET` | yes | Live client secret (server only) |
| `PAYPAL_WEBHOOK_ID` | yes | Webhook ID from the live app |
| `PAYPAL_ENV` | yes | `production` for live, `sandbox` for testing |
| `PAYPAL_BASE_URL` | optional | Override PayPal API host if needed |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | yes | Same value as `PAYPAL_CLIENT_ID` (client-side use) |

Allowed automated checkout tiers: `tier_1` ($99), `tier_2` ($499), and
`tier_3` ($999). `tier_0` is free and never hits PayPal. `tier_4` and
request-led compliance-readiness modules stay manual / application-only
and do not hit `/api/paypal/create-order`.

## 6 · App / sessions

| Variable | Required | Description |
|---|---|---|
| `APP_BASE_URL` | yes | `https://yourdomain.com`, no trailing slash |
| `ADMIN_PASSWORD` | yes | Password for `/admin/login` |
| `ADMIN_SESSION_SECRET` | yes | 32+ random bytes |
| `CUSTOMER_SESSION_SECRET` | yes | 32+ random bytes |
| `ALERT_WEBHOOK_URL` | optional | Slack / Discord / PagerDuty alert URL |
| `NODE_ENV` | yes | `production` |

`APP_BASE_URL` is used to build magic-link URLs, PayPal return URLs, and
absolute links in transactional emails. Do not include a trailing slash.

## 7 · Where each variable lives

- **App** (Vercel project env): all of the above.
- **Engine** (used in admin scripts, smoke tests, manual rescue):
  Supabase, AI provider, Resend, PayPal — copy into `engine/.env`
  on a maintainer machine. Production runs on Vercel use the app
  process; the engine is imported as a workspace package.

## 8 · Naming and visibility

- Anything prefixed `NEXT_PUBLIC_` is shipped to the browser. Only the
  PayPal public client ID belongs there.
- `*_SECRET`, `*_KEY` (except `NEXT_PUBLIC_*`), and `*_PASSWORD` must
  remain server-side.

## 9 · Validation at boot

`/api/health` (added in Phase 7) returns a small status object that
confirms whether the app can read Supabase. It does not return any
secret value, only `true` / `false` per check.

## 10 · Production audit

Run before launch:

```sh
node scripts/qa-production-readiness.mjs
```

The script defaults to `https://trustfolder.vercel.app`. Use
`BASE_URL=http://localhost:3000` for a local server. It verifies route
health, env names (without printing values), checkout tier guards, and
that checked public surfaces do not contain forbidden literal phrases.
