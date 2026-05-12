# Smoke Test Procedure Before Phase 3

Purpose: give one deterministic local walkthrough for the smoke-test gate in `docs/10-world-class-product-standards.md` §14.

Scope:
- Covers paths **A, B, B2, B3, C, D, E, F, G**.
- Keeps Path **B** explicitly pending until Tier 1 snapshot delivery is implemented.
- Does **not** add connectors or start Phase 3.

---

## 1. Setup checklist

Complete this once before testing:

- **Install dependencies**
  - Run `npm install` in `engine/`.
  - Run `npm install` in `app/`.

- **Supabase**
  - Apply the project migration.
  - Create the `deliveries` storage bucket.
  - Confirm orders and generated package metadata can be written.

- **Environment variables**
  - Pick an AI provider via `AI_PROVIDER` (default `anthropic`, alternative `ollama`).
  - If `AI_PROVIDER=anthropic`: set `ANTHROPIC_API_KEY` (and optionally model overrides).
  - If `AI_PROVIDER=ollama`: set `OLLAMA_BASE_URL` (e.g. `http://localhost:11434`) and `OLLAMA_MODEL` (e.g. `qwen2.5:7b-instruct`). Leave `OLLAMA_API_KEY` empty for local Ollama; set it only for hosted Ollama-compatible endpoints — it is sent server-side as `Authorization: Bearer ...` and never exposed to the client.
  - Set Supabase URL and service credentials. Required for all paths regardless of AI provider.
  - Set PayPal sandbox client, secret, webhook ID, and return/cancel URLs. Required for paths B/B2/B3/E/F.
  - Set Resend key and sender address. Required for delivery email checks unless email is mocked.

- **AI provider note**
  - The Ollama path only replaces the AI generation provider.
  - It does not replace Supabase database/storage, PayPal payment, or Resend email delivery.
  - For paths A, C, D you still need Supabase env.
  - For paths B, B2, B3 you still need PayPal sandbox env.
  - For delivery checks you still need Resend env unless email is mocked.

- **Local services**
  - Start the app locally.
  - Start the engine worker/API if it is separate from the app.
  - Start a webhook tunnel for PayPal sandbox callbacks.
  - Point the PayPal sandbox webhook to the local webhook URL.

- **Inbox access**
  - Use a test inbox where Resend deliveries can be inspected.
  - Keep spam/promotions tabs visible during delivery checks.

---

## 2. Test data

Use the same data across runs unless a path says otherwise.

| Field | Value |
|---|---|
| Safe test URL | A real B2B AI SaaS/product site controlled by you, or a stable public B2B SaaS URL |
| Broken URL | `https://does-not-exist-smoke-test.invalid` |
| Test company | `Smoke Test AI Ltd` |
| Product | `AI assistant for customer support teams` |
| AI feature | `Summarizes support conversations and drafts suggested replies` |
| Target users | `B2B SaaS support managers and agents` |
| Customer email | Test inbox address controlled by you |
| Out-of-scope vertical | `hr` or `healthcare` |
| PayPal buyer | PayPal sandbox personal buyer account |

Recommended manual fallback answers:

| Question | Answer |
|---|---|
| Does the product make high-impact decisions? | No |
| Does it replace human review? | No |
| Does it process children, health, hiring, credit, housing, or biometric data? | No |
| Are outputs shown to end users? | Yes, as support draft suggestions |
| Is a human expected to review before sending? | Yes |

---

## 3. Smoke paths and expected outcomes

### Path A — Tier 0 Free Eligibility Check

Steps:
1. Open the local assessment flow.
2. Enter the safe test URL.
3. Run website scan.
4. Complete the 8-question form.
5. Choose the free eligibility check path.
6. Submit and view the web verdict.

Expected outcome:
- Verdict renders in the browser as `likely fit`, `needs review`, or `out of scope`.
- No payment button is required.
- No documents, ZIP, or PDF are generated.
- No paid order is created.

### Path B — Tier 1 Snapshot paid PayPal sandbox flow

Steps:
1. Enter the safe test URL.
2. Confirm extracted/manual answers.
3. Choose Tier 1 Snapshot.
4. Attempt the PayPal sandbox flow only if snapshot delivery is implemented.

Expected outcome:
- Current expected status: **pending**.
- This path cannot pass until `engine/src/snapshot.ts`, Tier 1 routing, and single-file delivery are implemented.
- Do not block Phase 3 solely on Path B if it is documented as pending with this known fix path.

### Path B2 — Tier 2 Disclosure Pack paid PayPal sandbox flow

Steps:
1. Enter the safe test URL.
2. Run scan and review extracted answers on the review-before-payment screen.
3. Confirm the answers.
4. Choose Tier 2 Disclosure Pack.
5. Pay with the PayPal sandbox buyer.
6. Return to the success page.
7. Check the test inbox.

Expected outcome:
- PayPal redirects to the success page.
- Order status reaches the paid/generating/completed path.
- Email arrives with a ZIP containing the disclosure pack folder.
- Generated contents match Tier 2 scope only.

### Path B3 — Tier 3 Full Evidence Folder paid PayPal sandbox flow

Steps:
1. Repeat Path B2 using Tier 3 Full Evidence Folder.
2. Complete PayPal sandbox payment.
3. Wait for delivery email.

Expected outcome:
- PayPal redirects to the success page.
- ZIP email arrives with the full governance folder.
- Output is technically generated in sandbox.
- Any advisor-review production gating is noted but does not block sandbox technical pass.

### Path C — Website scan failure fallback

Steps:
1. Open the local assessment flow.
2. Enter the broken URL.
3. Run scan.
4. Continue using the manual fallback flow.
5. Fill the manual test data.
6. Reach the review-before-payment screen.

Expected outcome:
- Scan failure is handled without a crash.
- Manual fallback appears in plain English.
- User can still complete answers and proceed to review.
- No hidden connector or external upload flow is required.

### Path D — Out-of-scope rejection

Steps:
1. Start a new assessment.
2. Use manual answers or scanned data.
3. Set vertical/sensitive area to `hr` or `healthcare`.
4. Continue to the verdict/payment decision point.
5. Enter the test email if prompted.

Expected outcome:
- No PayPal button is shown.
- User sees a polite out-of-scope message.
- Email is captured for follow-up or manual review.
- No charge is created.

### Path E — Payment success plus generation failure recovery

Steps:
1. Complete a paid sandbox checkout for Tier 2 or Tier 3.
2. Force one generation failure using the documented local test method for the engine.
3. Observe the order status and recovery email behavior.
4. Confirm original assessment answers remain attached to the order.

Expected outcome:
- Payment remains recorded as successful.
- Generation failure does not lose customer answers.
- Status changes to `failed_needs_retry` or equivalent recovery state.
- Retry/support email is sent or queued.
- No duplicate customer charge occurs.

### Path F — Duplicate PayPal webhook idempotency

Steps:
1. Complete or simulate one successful `PAYMENT.CAPTURE.COMPLETED` sandbox webhook.
2. Replay the same webhook payload/event ID.
3. Inspect webhook response and order/package records.

Expected outcome:
- First webhook processes normally.
- Second webhook returns `already_processed` or equivalent idempotent result.
- No second generation starts.
- No duplicate email or ZIP is sent.

### Path G — QA failure retry path

Steps:
1. Run a paid Tier 2 or Tier 3 generation in local/sandbox mode.
2. Force a forbidden phrase in generated output using the documented local QA test method.
3. Let QA run.
4. Observe retry behavior and final order status.

Expected outcome:
- QA catches the forbidden phrase.
- One retry is attempted.
- Final status is either completed after clean retry or `failed_needs_retry`.
- Failed output is not delivered as a successful customer package.

---

## 4. Pass/fail table

| Path | Scenario | Result | Notes / evidence |
|---|---|---|---|
| A | Tier 0 free eligibility check | Not run | |
| B | Tier 1 snapshot paid flow | Pending | Blocked until snapshot generator and delivery are implemented |
| B2 | Tier 2 Disclosure Pack paid flow | Not run | |
| B3 | Tier 3 Full Evidence Folder paid flow | Not run | |
| C | Website scan failure fallback | Not run | |
| D | Out-of-scope rejection | Not run | |
| E | Payment success + generation failure recovery | Not run | |
| F | Duplicate PayPal webhook idempotency | Not run | |
| G | QA failure retry path | Not run | |

Acceptable result values: `Pass`, `Fail`, `Pending`, `Not run`.

---

## 5. Stop/go rule before Phase 3

Do **not** start Phase 3 until:

- **Required pass**: Paths A, B2, B3, C, D, E, F, and G pass locally/sandbox, or any failure is documented with a clear owner and fix path.
- **Allowed pending**: Path B may remain `Pending` until Tier 1 snapshot generation and single-file delivery are implemented.
- **No silent failures**: Any paid path must preserve answers, avoid duplicate charges, and provide a visible recovery state if generation fails.
- **No scope creep**: Do not add connectors, upload flows, or Phase 3 marketing work as part of this gate.

If any paid Tier 2/Tier 3 path can charge without successful delivery or recovery, the gate is **blocked**.
