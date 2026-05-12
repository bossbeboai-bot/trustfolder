# 04 · Product Flow · Customer Journey End-to-End

The full path a customer takes from "first heard of us" to "received their docs" — for each tier. The website-URL + 8-question intake is the structural innovation that makes the experience feel premium.

---

## The big-picture flow

```
LEAD → ASSESS → DECIDE → PAY → INTAKE → GENERATE → DELIVER → FOLLOW-UP
```

Every tier follows this flow with different intensity at each stage.

---

## The killer UX: Website URL + 8 confirmation questions

Instead of asking customers to fill an 8-question form from scratch, we ask for their website URL FIRST and then auto-fill what we can:

### Stage 1 · URL intake
```
"Enter your product URL — we'll do most of the work for you."
[https://example.com]   →   [ Continue → ]
```

### Stage 2 · Backend scan (10-15 seconds)
- Fetch homepage, /pricing, /about, /docs (if exist)
- Cheerio parse for: page title, meta description, headings, body text
- Send extracted text to Claude with a structured-extraction prompt
- AI returns JSON: `{ company_name, product_description, ai_features[], target_users, b2b_or_b2c, eu_signals[], possible_risk_areas[] }`

### Stage 3 · Confirmation form
The 8 questions are now auto-filled where possible. Customer sees:

```
✓ Company name: Acme AI [edit]
✓ Product type: AI writing assistant [edit]
✓ AI features detected: text generation, summarization, translation [edit]
? B2B or B2C: [B2B / B2C / Both]   ← user selects
? Do you have EU customers: [Yes / No / Don't know]   ← user selects
? Do users interact directly with AI output: [Yes / No]   ← user selects
? Is AI output reviewed by humans before delivery: [Yes / No / Sometimes]   ← user selects
? Do you process personal data: [Yes / No / Don't know]   ← user selects
? Vertical: [Marketing / Sales / Dev tools / Customer support / Other]   ← user selects
```

The pre-filled fields are editable. The unfilled fields have visual emphasis ("Please confirm").

### Stage 4 · Scope check
Before payment, the engine runs the out-of-scope detector:
- Specific keywords from URL scan flagging regulated verticals
- Confirmation question answers (HR, healthcare, etc.)
- If triggered → polite redirect to "out of automated scope" page

### Stage 5 · Payment (paid tiers only)
- PayPal Checkout button
- Single click for PayPal account holders
- Webhook confirms payment server-side

### Stage 6 · Generation
- Engine runs (5-15 min)
- Customer sees "Generating your pack — we'll email you when ready"
- Optional: real-time progress page

### Stage 7 · Delivery
- Email with download link (signed S3/Supabase URL)
- ZIP file + Notion-importable folder
- README explains every doc + how to use

### Stage 8 · Follow-up
- 24-hr email: "How was the pack? Anything we should improve?"
- 7-day email: "Need help reviewing with your lawyer? Tier 3 includes 30-min call."
- 30-day email: "Quarterly governance review reminder."

---

## Tier 0 · Free Self-Assessment Flow

**Time to complete:** ~2 min (or 30 sec if user skips URL)

```
[Land on /assessment]
   ↓
"Quick 2-min AI Act self-assessment. Free."
   ↓
Step 1: Email + URL (URL optional)
   ↓
Step 2 (if URL): Backend scans (10s), then 5 confirmation questions
Step 2 (if no URL): All 8 questions manual
   ↓
Step 3: Scope-check
   ↓
Result page (15s after submission):
   - 1-page risk classification PDF (download)
   - Email with same PDF
   - 3 specific next steps
   - Upsell card: "Need the full disclosure pack? $99 →"
   ↓
Added to email nurture sequence
```

**What the PDF contains:**
- "Based on your answers, your primary AI feature is likely classified as [limited-risk transparency obligation / requires legal review / out of automated scope]"
- 1-paragraph plain-English explanation
- 3 next steps tailored to classification
- Disclaimer footer (canonical, from `01-brand-language-rules.md`)

---

## Tier 1 · $99 Disclosure Generator Flow

**Time to complete:** ~7 min (5 min form + 2 min payment + 5 min generation)

```
[Land on /disclosures]
   ↓
"Generate your AI Act Article 50 transparency disclosures. $99."
   ↓
Step 1: Email + URL (required for paid tiers)
   ↓
Step 2: Backend scans (10s), then 8-10 confirmation questions (auto-prefilled)
   ↓
Step 3: Scope-check (synchronous, ~1s)
   - If out-of-scope → friendly redirect, no payment
   - If unclear → request manual classification before continuing
   - If clear → proceed to checkout
   ↓
Step 4: PayPal Checkout (auto-redirect)
   ↓
Step 5: Payment confirmation page
   "Payment received. Generating your disclosure pack now."
   "We'll email you within 5 minutes."
   ↓
[Backend, async]
   - Engine generates 7 disclosure docs
   - QA pass (second LLM)
   - Package as ZIP + Notion folder
   - Upload to Supabase Storage with signed URL
   - Email customer with download link
   ↓
Customer receives email (within 5 min):
   "Your AI Act Disclosures are ready"
   - Download link (24-hr signed URL)
   - 7 docs in ZIP + Notion-importable folder
   - README explains each doc
   - Disclaimer footer
   ↓
24-hr follow-up email:
   "How was the pack? Reply to share feedback."
   ↓
7-day upsell email:
   "Want the full Readiness Pack? Includes risk classification + ISO 42001 checklist. $499 →"
```

---

## Tier 2 · $499 Readiness Pack Flow

**Time to complete:** ~15 min (10 min form + 2 min payment + 10 min generation)

```
[Land on /readiness]
   ↓
"AI Governance Readiness Pack. $499. Reviewed by [Advisor Name]."
   ↓
Step 1: Email + URL (required) + Company name
   ↓
Step 2: Backend deeper scan (20s) — homepage + pricing + about + docs
   ↓
Step 3: 12-15 confirmation questions (auto-prefilled, deeper coverage)
   - All 8 from Tier 1
   - Plus: number of EU customers, primary jurisdictions, data subjects categories
   - Plus: AI training data sources, model providers used
   - Plus: human oversight processes, incident response setup
   ↓
Step 4: Scope-check
   - Out-of-scope → no payment, polite redirect
   - Unclear classification → flag for manual review (still allow payment with disclaimer)
   - Clear → proceed to checkout
   ↓
Step 5: PayPal Checkout
   ↓
Step 6: Payment confirmation
   "Payment received. Generating your full readiness pack now."
   "We'll email you within 10 minutes."
   ↓
[Backend, async, ~10 min]
   1. Run AI extraction on URL scan + form data
   2. Apply confidence-band classifier
   3. Generate 12 documents in parallel:
      - System inventory
      - Provider/deployer memo
      - Risk classification memo
      - ISO 42001 checklist
      - Evidence tracker
      - AI policy draft
      - Human oversight procedure
      - Vendor questionnaire
      - Lawyer handoff
      - Governance roadmap
      - README
      - + Tier 1 disclosures
   4. QA pass (second LLM checks completeness + citations + confidence-band labels)
   5. Package as ZIP + Notion folder
   6. Upload to Supabase Storage
   7. Email signed download link
   ↓
Customer receives delivery email (within 10 min):
   "Your AI Governance Readiness Pack is ready"
   - Download ZIP (Notion-importable folder included)
   - README with how-to-use guide
   - 30-day governance roadmap
   - Disclaimer footer
   ↓
24-hr follow-up:
   "How was the pack? Anything missing or unclear?"
   ↓
7-day follow-up:
   "Have you brought it to your lawyer yet? Tier 3 includes a 30-min advisor call to review the classification."
   ↓
30-day follow-up:
   "Quarterly governance review reminder. Want monthly support? Tier 4 →"
```

---

## Tier 3 · Application-only Flow

**Time to complete:** ~3-5 days (manual)

```
[Land on /enterprise]
   ↓
"For larger teams or higher-risk products. By application only."
   ↓
Application form (no payment):
   - Company size, vertical, AI use case
   - Compliance trigger (vendor q? lawyer? procurement?)
   - Timeline urgency
   - Email
   ↓
[Email to founder]
   ↓
Founder reviews (within 24 hrs):
   - In-scope vertical? → respond with quote ($1,500-$2,500)
   - Out-of-scope? → polite decline + referral to specialized lawyer
   - Edge case? → 15-min discovery call
   ↓
Customer accepts quote → manual invoice (PayPal Invoice or Stripe link)
   ↓
Customer pays → kickoff email scheduled within 7 days
   ↓
30-min advisor call (paid via $500-1k advisor fee from Tier 2 budget)
   ↓
Tier 2 pack generated + custom revisions applied
   ↓
Delivery within 5 business days
   ↓
30 days of email Q&A access
   ↓
Final report email at Day 30
```

---

## Out-of-scope rejection flow

When the scope-check detects a regulated vertical:

```
[Detection point: end of confirmation questions]
   ↓
Page shown:
   "Thanks for considering us. Based on your answers, your product appears to be in [vertical] — banks/healthcare/HR/biometrics/children/credit/law-enforcement.
   
   AI tools in this category have higher-risk classifications under the EU AI Act and require qualified legal review beyond our automated tool's scope.
   
   We recommend reaching out to a specialized [vertical] AI compliance lawyer. Here's a starting list of well-regarded firms: [link]
   
   No charge today. Stay in touch."
   ↓
Email captured for "we expanded coverage" future notification
   ↓
No payment processed
```

---

## Edge cases and error handling

### Customer enters non-existent URL
- Backend fetches → 404 or DNS fail
- Show: "We couldn't reach that URL. Want to enter your product info manually?"
- Fallback to manual 8-question form

### Customer URL is JavaScript-heavy SPA
- Cheerio fetch returns minimal text
- Show: "We couldn't extract enough info from your site. Want to enter manually?"
- Fallback to manual form
- Phase 2 consideration: Playwright headless browser for SPA crawl

### PayPal payment fails / abandons
- No order created
- Cart preserved in localStorage for re-attempt
- 24-hr email: "Hey, you started checkout but didn't finish. Want to complete it?"

### Engine generates partial output (1+ doc fails)
- QA pass detects missing docs
- Engine retries failed docs once
- If still failed: deliver what's complete + flag missing docs to founder for manual generation
- Customer email: "Most of your pack is ready. We're hand-finishing the rest within 24 hrs."

### Customer asks for a different format (Word, Google Docs)
- Mo-1: manual conversion via founder
- Mo-2: build automated export-to-Word + Google Docs

---

## Real-time progress UX (optional, Phase 3.5)

Show generation progress in real time on the confirmation page:

```
✓ Scanned your website (10s)
✓ Confirmed product details (you, just now)
✓ Out-of-scope check passed
✓ Payment received
⏳ Generating system inventory... (currently running)
○ Risk classification memo
○ ISO 42001 checklist
○ ... (9 more)

Estimated time remaining: 7 minutes
We'll also email you when ready.
```

---

## Key flow design principles

1. **URL-first feels magical.** Most competitors ask 20+ questions cold. We ask for one URL and 8 quick confirmations.
2. **Out-of-scope check before payment.** Never charge a customer we can't serve.
3. **Asynchronous delivery.** Email link, don't make them wait on a page for 10 min.
4. **Pre-fill everything we can.** Editable, but pre-filled.
5. **Confidence bands visible.** Customer sees "likely limited-risk" not "you are limited-risk."
6. **Disclaimers in every step.** Footer on every page, every email, every doc.

---

## Living document

Updated whenever:
- A tier flow changes
- A new edge case is encountered
- The crawler implementation changes
- The questionnaire schemas evolve

Last updated: 8 May 2026 (Day 0)
