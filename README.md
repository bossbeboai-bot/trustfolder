# complybase · Internal Project Folder

**Internal project name:** complybase  
**Public brand:** TrustFolder  
**Positioning:** AI governance evidence folder for B2B AI SaaS companies preparing for EU AI Act transparency, buyer review, and legal/compliance review  
**Internal repo name:** complybase (unchanged)  
**Status:** Phase 2 — Engine + Supabase + PayPal scaffolding complete  
**Started:** 8 May 2026  
**Phase 1 completed:** 8 May 2026 (Day 0/1)  
**Phase 2 completed:** 8 May 2026 (Day 0/1)

---

## What is this

The internal working folder for an autonomous **AI Governance Readiness** product targeting small B2B AI SaaS companies (5-50 employees) with EU customers. 

**Pricing ladder (5 tiers):**
- **Tier 0 — Free Eligibility Check** ($0) — fit / needs review / out-of-scope verdict, no documents
- **Tier 1 — Lite Readiness Snapshot** ($99) — single readiness report, Markdown + PDF
- **Tier 2 — Article 50 Disclosure Pack** ($499) — 6-7 filled disclosure docs in ZIP
- **Tier 3 — Full AI Governance Evidence Folder** ($999) — 12-13 docs in organized ZIP
- **Tier 4 — Premium Buyer/Legal Handoff** ($2,500-$4,500) — application-only, manual fulfillment, Mo-2+

Value framing: *Start with a free eligibility check. Get a paid readiness snapshot for $99. Generate Article 50 disclosure documents for $499. Build your full buyer-ready AI governance evidence folder for $999.*

Full rationale: `docs/03-pricing-and-tiers.md`.

> **Brand locked:** Public brand is **TrustFolder** (8 May 2026). Internal folder remains `complybase`. TrustFolder is not a legal compliance guarantee — it is an AI governance evidence folder.

---

## Where to start

| If you want to... | Read |
|---|---|
| Understand the whole business at a glance | `docs/00-business-os.md` |
| Know what words to use (and not use) | `docs/01-brand-language-rules.md` |
| See who we sell to and who we don't | `docs/02-icp-and-niche-scope.md` |
| Understand the pricing ladder | `docs/03-pricing-and-tiers.md` |
| See the customer journey | `docs/04-product-flow.md` |
| Understand the tech stack | `docs/05-tech-architecture.md` |
| See AI output safety rules | `docs/06-confidence-bands.md` |
| Track regulatory changes | `docs/07-regulatory-watch.md` (LIVING DOC) |
| See brand decision status | `docs/08-brand-shortlist-verification.md` |
| Read learning notes | `docs/09-learning-notes/` |
| **Check the world-class bar before shipping** | **`docs/10-world-class-product-standards.md`** ⭐ |
| **Plan reliability + extraction upgrades** | **`docs/11-smooth-product-architecture.md`** ⭐ |
| Run a focused playbook for a recurring operational task | `docs/skills/*.md` (see below) |

---

## Folder structure

```
complybase/
├─ README.md                       ← you are here
├─ docs/                           ← Notion-ready governance docs
├─ templates/                      ← THE PRODUCT (19 master templates)
├─ engine/                         ← AI generation pipeline (Phase 2)
├─ marketing/                      ← Framer + Huashu mockups (Phase 3)
├─ app/                            ← Next.js product app (Phase 3)
├─ assets/                         ← Brand kit (post-brand-lock)
└─ resources/                      ← Research material (PDFs, links)
```

---

## Phase 0 status

- [x] Folder tree created
- [x] Brand candidate verification complete (3 of 5 hard-eliminated)
- [x] Founder picks final brand → **TrustFolder** (8 May 2026)
- [ ] Domain registration (trustfolder.com / .io)
- [ ] Social handles claimed (Twitter, LinkedIn, GitHub)
- [x] `docs/00-business-os.md` written
- [x] `docs/01-brand-language-rules.md` written
- [x] `docs/02-icp-and-niche-scope.md` written
- [x] `docs/03-pricing-and-tiers.md` written
- [x] `docs/04-product-flow.md` written
- [x] `docs/05-tech-architecture.md` written
- [x] `docs/06-confidence-bands.md` written
- [x] `docs/07-regulatory-watch.md` written (initial entries)
- [x] `docs/08-brand-shortlist-verification.md` written
- [x] `resources/research-bookmarks.md` written
- [x] `resources/reuters-2026-05-07-eu-dilution.md` written
- [x] `docs/09-learning-notes/` — 4 research guides (Article 50, ISO 42001, provider/deployer, risk classification)

## Phase 1 status — Templates v0.9 (pre-advisor)

- [x] `templates/README.md` — template index
- [x] `templates/tier-1/` — **7 of 7 Article 50 disclosure templates**
  - [x] `t1-01-chatbot-disclosure.md`
  - [x] `t1-02-ai-content-labeling.md`
  - [x] `t1-03-deepfake-notice.md`
  - [x] `t1-04-emotion-recognition-notice.md`
  - [x] `t1-05-biometric-categorization-notice.md`
  - [x] `t1-06-ai-system-disclosure-page.md`
  - [x] `t1-07-ai-usage-policy-summary.md`
- [x] `templates/tier-2/` — **12 of 12 governance templates**
  - [x] `t2-01-ai-system-inventory.md`
  - [x] `t2-02-provider-deployer-memo.md`
  - [x] `t2-03-risk-classification-memo.md`
  - [x] `t2-04-iso-42001-checklist.md`
  - [x] `t2-05-evidence-tracker.md`
  - [x] `t2-06-ai-policy-draft.md`
  - [x] `t2-07-human-oversight-procedure.md`
  - [x] `t2-08-vendor-questionnaire.md`
  - [x] `t2-09-lawyer-handoff-pack.md`
  - [x] `t2-10-governance-roadmap.md`
  - [x] `t2-11-pack-readme.md`
  - [x] `t2-12-out-of-scope-handoff.md`
- [ ] **Advisor review of Tier 2 master templates** (advisor budget gated to pre-Tier-2-launch — Day 28-32)
- [ ] Tier 1 templates self-validated (no advisor needed for pure transparency content)

**All 19 master templates total:** 19/19 ✓

## Phase 2 status — Engine + Supabase + PayPal scaffolding

- [x] `engine/` package scaffold (package.json, tsconfig, .env.example, README)
- [x] Supabase migration: `engine/supabase/migrations/0001_initial_schema.sql` — 8 tables (leads, assessments, orders, order_status_events, website_scans, generated_packs, qa_results, email_events) + indexes + RLS lock-down
- [x] Engine modules (10 + orchestrator):
  - [x] `crawler.ts` — fetch + cheerio + cache (graceful failure, never blocks user)
  - [x] `extract.ts` — Claude structured extraction with Zod validation
  - [x] `scope-check.ts` — deterministic keyword detection (no LLM)
  - [x] `classify.ts` — risk classification with conservative overrides
  - [x] `generate.ts` — template fill via Claude, parallel pool, retry
  - [x] `qa.ts` — deterministic + LLM 6-rule validation
  - [x] `package.ts` — ZIP build + Supabase Storage + signed URL
  - [x] `deliver.ts` — Resend email (delivery, confirmation, retry-notice, refund)
  - [x] `paypal.ts` — create order, capture, webhook signature verify, refund
  - [x] `order-status.ts` — 13-state machine with valid transitions + audit log
  - [x] `pipeline.ts` — async post-payment orchestration (classify→generate→qa→retry→package→deliver)
- [x] System prompts: extract / classify / generate / qa
- [x] Lib: env, supabase client, claude client, resend client, types
- [x] `app/` Next.js scaffold (TypeScript, Tailwind, App Router)
- [x] API routes: `/api/scan`, `/api/confirm`, `/api/paypal/create-order`, `/api/paypal/capture`, `/api/paypal/webhook`, `/api/status/[orderId]`
- [x] Frontend pages: `/`, `/assessment` (4-step flow), `/checkout/return`, `/checkout/cancel`, `/success/[orderId]`, `/out-of-scope`

**Customer journey supported end-to-end:**
URL + email → scan + extract → 8-question confirmation → scope-check → recommended pack → PayPal → success page (no on-screen wait) → email delivery.

**Phase 2 still pending (manual):**
- [ ] `npm install` in both `engine/` and `app/`
- [ ] Apply Supabase migration + create `deliveries` storage bucket
- [ ] Set env vars (Anthropic, Supabase, PayPal sandbox, Resend)
- [ ] Smoke test end-to-end with a real domain (your own) in PayPal sandbox

---

## World-Class UX Standards

Full doc: **`docs/10-world-class-product-standards.md`** ⭐ — read this before any user-facing change.

**The bar:** TrustFolder must feel like a premium AI governance evidence product, not a basic template generator. Fast to understand, easy to use, safe by default, polished output, clear boundaries, boringly reliable.

### The 15 standards (one-liners)

1. **Customer Journey** — URL → AI scan → short confirmation → PayPal → calm success → email. No legal-form feel.
2. **Magic Moment** — the website scan is the first wow. Prefilled summary on screen in 10-15 seconds.
3. **Plain English** — no provider/deployer/conformity-assessment in the buying flow. Technical terms live inside the pack.
4. **Trust** — every page reinforces "AI governance evidence folder, not a legal compliance guarantee."
5. **Premium Output** — every doc has title, context, purpose, content, confidence band, review note, next steps, sources, disclaimer. No raw ChatGPT feel.
6. **QA** — false-CLEAR is the worst failure. Bias toward REVIEW. Two-layer validation (deterministic + LLM).
7. **Out-of-Scope** — healthcare, HR, credit, biometrics, children, education-grading, law-enforcement, critical-infra → no checkout.
8. **Failure Recovery** — payment-success + generation-fail → order saved, calm message, retry email. Never abandoned.
9. **Speed** — never block on screen for generation. Email delivers; the success page polls lightly.
10. **Packaging** — organized ZIP folders (`01-disclosures/`, `02-governance/`, `03-evidence/`, `04-legal-review-handoff/`).
11. **Visual** — calm, premium, enterprise. White/soft backgrounds, navy text, subtle accent. No flashy/crypto/playful.
12. **Pricing** — 5-tier ladder: $0 / $99 / $499 / $999 / $2.5-4.5k (application-only). Founding prices; standard prices later. No discount-heavy language. See `docs/03-pricing-and-tiers.md`.
13. **Product Value** — sells an automated workflow, not blank templates. Output is more useful than ChatGPT.
14. **Smoke Test Gate** — 7 test paths must pass (or be documented pending) before Phase 3.
15. **Definition of World-Class** — fast to understand, easy to use, safe by default, polished output, clear boundaries, boringly reliable.

### Phase 3 gate

**Do NOT start Phase 3 (Framer marketing site + brand kit) until:**
- [x] `docs/10-world-class-product-standards.md` written (15 standards + smoke test gate)
- [x] `docs/11-smooth-product-architecture.md` written (10 reliability/extraction upgrades + skill index)
- [x] `docs/skills/{extraction-quality, qa, payment-recovery, out-of-scope, packaging}-skill.md` scaffolded
- [x] Review-before-payment screen built (`Step3_5Review` in `app/app/assessment/page.tsx` — doc 11 §3)
- [ ] `docs/12-smoke-test-procedure.md` written (next task — deterministic A-G walkthrough)
- [ ] `npm install` in `engine/` and `app/`
- [ ] Supabase migration applied + `deliveries` storage bucket created
- [ ] PayPal sandbox + Resend + Anthropic env vars set
- [ ] Smoke test paths A-G from `docs/10-world-class-product-standards.md` §14 confirmed (or documented as pending with known fix)

### Skills (operational playbooks)

| File | Triggers |
|---|---|
| `docs/skills/extraction-quality-skill.md` | Weak scan output, JS-heavy/Framer/Webflow site, bad extraction confidence |
| `docs/skills/qa-skill.md` | Adding/tuning a QA rule, debugging a flag, false-CLEAR investigation |
| `docs/skills/payment-recovery-skill.md` | Paid but no pack, stuck order, webhook missed, capture failed |
| `docs/skills/out-of-scope-skill.md` | New regulated vertical, scope-check keyword update, post-payment refund |
| `docs/skills/packaging-skill.md` | Tier folder change, new template added, README/manifest update |

---

## How to run

```powershell
# 1. Install engine deps
cd engine
npm install

# 2. Install app deps
cd ../app
npm install

# 3. Set up env files
cp ../engine/.env.example ../engine/.env       # fill secrets
cp .env.example .env.local                      # fill the same secrets

# 4. Apply Supabase migration (via dashboard SQL editor, or supabase CLI)
#    Run engine/supabase/migrations/0001_initial_schema.sql
#    Then create a private storage bucket named "deliveries"

# 5. Start dev server
npm run dev   # → http://localhost:3000
```

**PayPal webhook for local dev:** use ngrok or a similar tunnel and register the public URL with PayPal sandbox webhook ID. Without a webhook, the `/checkout/return` server-side capture acts as a backup trigger.

---

## Plan reference

Master plan lives at `C:\Users\hydra\.windsurf\plans\build-complybase-v4-8aff36.md`.

## What NOT to do

- ~~Do NOT register a domain until public brand is locked.~~ ✓ Brand locked. Domain registration ready.
- Do NOT spend on advisor until templates v0.9 are ready ✓ — templates done. Advisor outreach can begin; **paid review only at the Tier 2 launch gate (Day 28-32).**
- Do NOT use the word "compliance" in any customer-facing copy. Use "readiness" / "preparation."
- Do NOT accept paying customers in regulated verticals (banks, healthcare, HR, biometrics, children, credit, law-enforcement).
- Do NOT publish anything claiming "TrustFolder is EU AI Act compliant." It's an evidence folder, not a guarantee.

See `docs/01-brand-language-rules.md` for the full language list.
