# Phase 3 Site Plan — TrustFolder Premium Marketing Site

## Objective

Build TrustFolder's premium lead-generation marketing site inside the existing Next.js App Router app. The site targets US/EU/UK/global B2B AI SaaS companies and AI agencies that need buyer-ready and lawyer-review-ready AI governance evidence folders.

This phase is not a full checkout, auth, dashboard, connector, or subscription build. It should improve positioning, explain product value, route free checks to `/assessment`, and route paid-pack intent to `/request`.

## Explicit non-goals

- No customer login.
- No dashboard.
- No auth.
- No connectors.
- No subscription portal.
- No Remotion video system.
- No payment provider rebuild.
- No full instant checkout promotion.
- Do not reopen PayPal testing.

## Strategic positioning

TrustFolder helps international AI teams turn scattered website claims and product descriptions into an AI governance evidence folder for buyer, internal, and legal review.

Approved language:

- Run free eligibility check
- Request paid pack
- Join waitlist
- Apply for premium handoff
- buyer-ready
- lawyer-review-ready
- AI governance evidence folder
- not legal advice
- not certification
- not a compliance guarantee

Forbidden language:

- Buy now
- guaranteed compliance
- audit-proof
- no lawyer needed
- fully compliant

## Routes

### `/`

Premium marketing homepage with:

1. Header
2. Hero section
3. Trust strip
4. Problem section
5. How it works
6. Packages section
7. Evidence folder contents
8. AI agency section
9. Safety/scope section
10. Final CTA
11. Footer

Primary CTA routes to `/assessment`.

Secondary/request CTAs route to `/request` with optional query parameters.

### `/request`

Lead-generation request page for paid pack interest.

Initial implementation can be a safe placeholder form if backend lead capture is risky. It should not touch payment code. It should clearly state that this is a request/waitlist flow, not checkout.

Expected query parameters:

- `/request`
- `/request?type=snapshot`
- `/request?type=pack`
- `/request?type=agency`
- `/request?type=premium`

### Existing `/assessment`

Keep the existing assessment flow intact. Marketing CTAs should route to it.

## Homepage content plan

### 1. Header

Wordmark: `TrustFolder`

Nav:

- Product
- How it works
- Packs
- Agencies
- Safety

CTA:

- Run free check → `/assessment`

### 2. Hero

Headline:

> Buyer-ready AI governance evidence folders for B2B AI companies.

Subheadline:

> Scan your AI product website, confirm a few details, and get disclosure, governance, and legal-review handoff drafts prepared for buyer and internal review.

CTAs:

- Run free eligibility check → `/assessment`
- Request paid pack → `/request?type=pack`

Hero visual:

- Original animated product mockup.
- Website URL → AI scan → Review summary → Evidence folder.
- Motion cards, document layers, calm progress rail.

### 3. Trust strip

Copy:

> Built for international AI startups, AI agencies, and B2B software teams preparing for buyer review. Not legal advice. Not certification. Not a compliance guarantee.

### 4. Problem section

Headline:

> Your product says “AI.” Your buyers will ask what that means.

Cards:

- Enterprise buyers ask how AI is used.
- Legal teams ask for disclosure language.
- Founders do not know what to prepare.
- AI claims are scattered across the website.
- Compliance review starts expensive when evidence is messy.

### 5. How it works

Four steps:

1. Enter your website.
2. Confirm what we found.
3. TrustFolder prepares your evidence folder.
4. Use it for buyer, internal, or legal review.

### 6. Packages

Use elevated request-oriented cards.

#### Free Eligibility Check

Price: Free
CTA: Start free check
Output: Likely fit / needs review / out of scope, recommended next step. No documents.

#### AI Website Trust Snapshot

Price: $99
CTA: Request snapshot
Output: Website scan summary, AI product overview, likely disclosure areas, readiness result, next steps.

#### AI Disclosure Pack

Price: $499
CTA: Request pack
Output: Chatbot disclosure, AI-generated content notice, AI system disclosure page, placement guide, internal transparency summary, legal-review note.

#### Buyer-Ready AI Governance Folder

Price: $999
CTA: Request pack
Output: AI system inventory, governance policy draft, disclosure docs, evidence tracker, risk notes, lawyer/buyer handoff, 30-day roadmap.

#### Enterprise Buyer Handoff

Price: $2,500+
CTA: Apply
Output: Everything in governance folder plus handoff cleanup, Loom walkthrough, one revision, optional advisor-supported review later.

### 7. Evidence folder contents

Premium document-stack visual with:

- AI system summary
- AI disclosure drafts
- Placement guide
- Governance policy draft
- Evidence tracker
- Source notes
- Lawyer/buyer handoff
- Next-step roadmap

### 8. AI agencies

Headline:

> Add a governance handoff folder to every AI client project.

CTA:

- Request agency pack → `/request?type=agency`

### 9. Safety / scope

Headline:

> Safe by default. Clear when expert review is needed.

Copy should clearly state TrustFolder does not auto-generate packs for high-risk areas like hiring, healthcare diagnosis, credit scoring, biometrics, children’s products, law enforcement, critical infrastructure, or education grading/admissions.

CTA:

- Check your fit → `/assessment`

### 10. Final CTA

Headline:

> Turn your AI website into a buyer-ready evidence folder.

Buttons:

- Run free eligibility check → `/assessment`
- Request paid pack → `/request?type=pack`

## Implementation approach

- Build in existing Next.js App Router.
- Use Tailwind CSS and small shadcn/ui-style local components.
- Add Framer Motion for scroll/entrance motion.
- Prefer original CSS/React product visuals over external imagery.
- Keep motion lightweight and reduced-motion safe.
- Do not alter payment code.
- Do not alter existing `/assessment` flow except global layout styles if necessary.

## Request capture approach

Safe first version:

- `/request` page with a polished lead form placeholder.
- Use mailto/contact fallback or client-side success state if server-side Supabase lead capture is not implemented in this pass.
- Document backend lead capture as pending if not implemented.

Potential later API, not required for initial Phase 3:

- `POST /api/request`
- Insert into existing `leads` table with `source='paid_pack_request'` if table fields are sufficient.
- Avoid schema migration unless explicitly approved.

## Acceptance criteria

- Desktop and mobile responsive.
- Premium visual quality.
- Clear copy.
- No legal overclaims.
- CTAs work.
- `/assessment` still works.
- Builds pass.
- `progress.txt` updated with Phase 3 work.
