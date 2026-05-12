# 40 — Vercel Deployment Guide

Status: Phase 7 deployment guide  
Last updated: 2026-05-11

## Overview

TrustFolder is a Next.js 14 app under `app/` with the engine as a local
workspace dependency under `engine/`. Vercel is the deployment target.
Supabase is the database/storage. PayPal is the payment provider.
Resend handles transactional email.

## 1 · Vercel project setup

1. Create a new Vercel project from the Git repository.
2. Project settings:
   - **Framework preset**: Next.js
   - **Root directory**: `app`
   - **Build command**: `npm run build`
   - **Install command**: `npm install`
   - **Output directory**: leave default (`.next`)
3. Node version: 20 (matches `engine/package.json` and
   `app/package.json` engines).

Because the engine is a local workspace dependency declared as
`"@trustfolder/engine": "file:../engine"` in `app/package.json`, Vercel
will install it during `npm install`. No additional build step is
needed — `engine` is consumed as compiled TypeScript via its package
exports.

## 2 · Environment variables

Set every variable from `docs/41-production-env-vars.md` in
**Project → Settings → Environment Variables**. Use the Production
environment only (or split Production/Preview if you want a staging
deployment, but never put real customer keys in Preview).

Critical rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` via `NEXT_PUBLIC_*`.
- Never expose `PAYPAL_CLIENT_SECRET` via `NEXT_PUBLIC_*`.
- The only PayPal value safe for client-side is the public client ID,
  set as `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (matches the server
  `PAYPAL_CLIENT_ID`).
- `APP_BASE_URL` must be `https://yourdomain.com` (no trailing slash).

## 3 · Domain setup

1. **Project → Settings → Domains**, add your apex and www.
2. Configure DNS at your registrar according to Vercel's instructions.
3. Once verified, Vercel will provision SSL automatically.
4. Update production env: `APP_BASE_URL=https://yourdomain.com`.
5. Configure PayPal live webhook URL:
   `https://yourdomain.com/api/paypal/webhook`.

## 4 · Function runtimes

Sensitive API routes already declare `export const runtime = 'nodejs'`.
This is required for routes that:

- Use cookies / sessions (admin and customer auth)
- Talk to Supabase via the service role
- Call the engine SDK
- Call PayPal or Resend

Vercel will run these as Node serverless functions. Cold start is fine
for our request rate.

## 5 · Redeploy steps

After any merged change:

1. Vercel auto-deploys on push to the production branch.
2. Visit the deployment URL after build.
3. Watch logs in **Deployments → [latest] → Logs** for the first hour.
4. If the deployment is bad, **Promote** the previous successful
   deployment from **Deployments → [previous] → Promote to Production**.

## 6 · Common errors

- **`Cannot find module './1682.js'`** — stale `.next` build artefact.
  Locally, delete `app/.next` and rebuild. On Vercel, redeploy with the
  "Redeploy without cache" option.
- **`MODULE_NOT_FOUND: @trustfolder/engine`** — Vercel root directory is
  wrong. Set it to `app`. The workspace `file:../engine` resolves
  relative to the project root.
- **PayPal webhook 401 / 403** — `PAYPAL_WEBHOOK_ID` mismatch or signing
  cert mismatch. Verify the webhook ID in the PayPal dashboard matches
  the env var.
- **Supabase 401 / 403** — wrong service role key, or the URL points at
  a different project than the keys.
- **Magic link email arrives but token rejected** — `APP_BASE_URL`
  mismatch between the link generator and the verifier; ensure the env
  var is set in production.
- **`build` fails on Vercel but works locally** — usually a missing env
  var that breaks a route during static analysis. Add the missing var
  in Vercel and redeploy.

## 7 · Build verification

Locally, before merging to production:

```sh
cd app
npx tsc --noEmit
npm run build
```

Both must pass with zero errors. Engine build:

```sh
cd ../engine
npm run build
```

## 8 · Health route

`GET /api/health` should return:

```json
{ "ok": true, "checks": { "app": true, "supabase": true, "storage": true } }
```

Use this for UptimeRobot / Better Stack checks.

## 9 · Logging and observability

- Vercel: function logs, build logs, runtime logs.
- Supabase: SQL logs and storage logs.
- PayPal: webhook delivery view.
- Resend: dashboard.

Phase 7 does not add Sentry, Axiom, or Logtail. Those are P2 in
`docs/48-competitor-audit-action-plan.md`.

## 10 · Production scope

This guide is for the existing system. Do not add new providers, new
modules, or new payment paths in this phase.
