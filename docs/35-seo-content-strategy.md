# 35 — SEO + Content Strategy

Status: planning + reference doc. Drives metadata, blog content, and
on-page copy for the public marketing surface. Pairs with `docs/01`
(brand language rules) and `docs/14-DESIGN.md` (forbidden phrases).

Hard rule: every keyword cluster below uses **readiness language**, never
guarantees. Do not imply regulatory status, certification, guaranteed
outcomes, audit immunity, or replacement of qualified legal review.

---

## 0 · Goals

- Rank for plain-English questions an AI founder, AI agency operator, or
  procurement reviewer actually types into Google.
- Build organic top-of-funnel traffic that converts to free-check runs.
- Feed the customer dashboard tone: clear, calm, technical, factual.
- Survive a forbidden-phrase audit on every page and every blog post.

Success looks like: a B2B AI founder Googles "AI chatbot disclosure
example" or "EU AI Act transparency requirements for SaaS startups",
lands on a TrustFolder post, runs the free check, then later requests a
paid pack.

---

## 1 · Keyword clusters

### Cluster 1 — AI governance documents

Primary intent: "what documents does an AI startup need?"

- AI governance documents
- AI governance documentation
- AI governance evidence folder
- AI governance checklist
- AI governance template
- AI policy template for startups
- AI system inventory template

Pages and posts:
- `/` (homepage) — primary
- `/pricing` — supporting
- `/blog/what-is-an-ai-governance-evidence-folder` — primary
- `/blog/ai-governance-checklist-small-saas` — secondary

### Cluster 2 — AI disclosure

Primary intent: "what should our AI disclosure say?"

- AI disclosure template
- AI chatbot disclosure
- AI generated content disclosure
- AI disclosure page
- AI transparency notice
- AI product disclosure

Pages and posts:
- `/pricing` (Disclosure Pack tier) — primary
- `/examples` — supporting
- `/blog/ai-chatbot-disclosure-what-users-and-buyers-need` — primary
- `/blog/ai-disclosure-page-examples` — primary
- `/blog/ai-disclosure-documents-b2b-startup` — secondary

### Cluster 3 — EU AI Act readiness

Primary intent: "what does my AI startup need for the EU AI Act?"

- EU AI Act transparency requirements
- EU AI Act AI disclosure
- EU AI Act chatbot disclosure
- EU AI Act documentation
- EU AI Act compliance checklist (intent term — we answer with readiness wording)
- EU AI Act for startups

Pages and posts:
- `/blog/eu-ai-act-transparency-plain-english` — primary

Wording rule: we use **"transparency-readiness"** and **"governance
documentation for review"**. We do not use **"compliant"** or **"compliance
guarantee"**. The blog post explicitly notes that final compliance
decisions belong to qualified counsel.

### Cluster 4 — AI buyer due diligence

Primary intent: "what does an enterprise buyer want from an AI vendor?"

- AI vendor due diligence
- AI buyer due diligence
- AI security questionnaire AI governance
- AI procurement documents
- AI risk review documents
- AI legal review handoff

Pages and posts:
- `/` (homepage problem section + "Buyer Handoff Layer" pillar) — primary
- `/blog/enterprise-buyer-ai-readiness` — primary
- `/blog/ai-buyer-due-diligence-documents` — primary

### Cluster 5 — AI agencies

Primary intent: AI agency operators searching for handoff and
documentation patterns.

- AI agency client handoff
- AI automation agency documentation
- AI chatbot client handoff
- AI workflow documentation
- AI agency governance pack

Pages and posts:
- `/agencies` — primary
- `/blog/ai-agency-client-handoff` — primary

### Cluster 6 — ISO 42001 / AI management system

Primary intent: small AI SaaS teams curious about AI management
standards without committing to certification.

- ISO 42001 checklist
- AI management system checklist
- ISO 42001 for startups
- AI governance policy draft

Pages and posts:
- `/blog/ai-governance-checklist-small-saas` — primary

Wording rule: we describe ISO 42001 as a **standard**, never imply
certification. We say "ISO 42001-inspired" only on the homepage and
`/safety`, never on a customer-facing pack name.

### Cluster 7 — SOC 2 readiness

Primary intent: security evidence preparation for AI startups and B2B SaaS teams.

- SOC 2 readiness checklist
- SOC 2 evidence checklist
- SOC 2 readiness pack
- SOC 2 security questionnaire
- SOC 2 for AI startups

Starter topics:
- SOC 2 readiness checklist for AI startups
- What documents belong in an AI security evidence pack?

### Cluster 8 — GDPR AI/data readiness

Primary intent: privacy-review preparation for AI SaaS data processing.

- GDPR AI readiness
- GDPR AI data checklist
- GDPR documentation for AI SaaS
- GDPR vendor review AI
- AI data processing summary

Starter topics:
- GDPR AI readiness for B2B SaaS teams

### Cluster 9 — Security questionnaires

Primary intent: buyer and vendor security review support.

- Enterprise security questionnaire
- Vendor security questionnaire
- AI vendor security questionnaire
- Security questionnaire automation
- Buyer security review

Starter topics:
- How to prepare for an enterprise security questionnaire
- AI vendor due diligence: documents buyers ask for

### Cluster 10 — HIPAA / healthcare intake

Primary intent: healthcare-data intake before qualified review.

- HIPAA AI checklist
- Healthcare AI data intake
- HIPAA readiness for AI tools

Starter topics:
- HIPAA and AI tools: what to gather before legal review

### Cluster 11 — ISO 42001 readiness expansion

Primary intent: AI management-system readiness documentation.

- ISO 42001 readiness checklist
- AI management system checklist
- ISO 42001 documentation
- ISO 42001 for AI startups

Starter topics:
- ISO 42001 readiness in plain English

### Cluster 12 — Regulated AI expert-review intake

Primary intent: preparing sensitive AI use cases for expert review.

- Hiring AI compliance intake
- Medical AI compliance intake
- Credit AI risk review
- Biometric AI risk review

Starter topics:
- Why high-risk AI use cases need expert review
- Hiring AI: what to prepare before compliance review

---

## 2 · Per-page metadata (locked)

These titles and descriptions live in `app/lib/seo.ts` (per-page
overrides) and are mirrored in this doc as the source of truth.
Maximum title length: 60 chars where possible. Maximum description: 160.

| Path | Title | Description |
|---|---|---|
| `/` | TrustFolder — AI Governance Documents for B2B AI Companies | TrustFolder prepares review-ready AI disclosure drafts, governance summaries, evidence trackers, source notes, and buyer/legal handoff documents for B2B AI SaaS companies and AI agencies. |
| `/pricing` | AI Governance Document Packs and Disclosure Drafts — TrustFolder | Compare TrustFolder packs for AI disclosure drafts, governance summaries, evidence trackers, buyer/legal handoff documents, and AI readiness review. |
| `/examples` | AI Governance Evidence Folder Examples — TrustFolder | See illustrative examples of AI disclosure drafts, evidence trackers, governance summaries, and buyer/legal handoff documents for AI products. |
| `/safety` | TrustFolder Safety and Scope — AI Governance Drafts, Not Legal Advice | Learn what TrustFolder does, what it does not do, and when AI products need expert review instead of automated governance document drafts. |
| `/agencies` | AI Governance Handoff Packs for AI Agencies — TrustFolder | TrustFolder helps AI agencies prepare client-ready AI use summaries, disclosure drafts, evidence trackers, and governance handoff documents. |
| `/blog` | AI Governance Readiness Guides — TrustFolder Blog | Plain-English guides on AI disclosure documents, EU AI Act transparency readiness, AI governance checklists, and buyer due diligence for AI products. |
| `/contact` | Contact TrustFolder — AI Governance Documents and Custom Packs | Get in touch about custom AI governance packs, agency partnerships, advisor interest, support on a delivered pack, or press. We reply within one business day. |
| `/assessment` | Run the Free AI Eligibility Check — TrustFolder | Run the free TrustFolder eligibility check. We scan your AI product website, confirm a few details, and tell you if a buyer-ready governance pack is a fit. |
| `/request` | Request an AI Governance Pack — TrustFolder | Request an AI disclosure pack, AI governance folder, premium handoff, or agency pack. A founder reviews every request and replies within one business day. |

Per-blog-post metadata is generated automatically from the post's `title`
and `description` fields in `app/lib/blog-posts.ts`.

---

## 3 · Sitemap and robots

- `app/app/sitemap.ts` enumerates the public routes from
  `app/lib/seo.ts:PUBLIC_ROUTES` and merges in the blog post slugs.
- `app/app/robots.ts` allows everything by default and disallows
  `/admin`, `/dashboard`, `/login`, `/checkout/`, `/success/`, `/api/`,
  `/out-of-scope` (see `NOINDEX_PATH_PREFIXES`).
- Sitemap is served at `/sitemap.xml`. robots.txt at `/robots.txt`.
  Both are generated by Next 14's metadata routes — no manual upload.

---

## 4 · Blog cadence

Initial 10 posts ship together so the index is not anaemic. After that:

- Cadence: 1 new post / week minimum, 2 / week if outbound campaigns
  surface new objections.
- Length: 600–1,200 words. Every post earns its title.
- Source data: customer questions, founder questions in
  `requests.message`, common buyer-review patterns the founder sees.
- Forbidden phrases re-checked at draft and at publish.

---

## 5 · On-page copy rules

Every public page must answer, above the fold or in the first scroll:

1. What does TrustFolder do?
2. What documents does it prepare?
3. What readiness areas does it support?
4. What does it not guarantee?
5. What is the next step for the visitor?

Allowed wording:
- "Supports EU AI Act transparency-readiness documentation."
- "Prepares review-ready AI governance drafts."
- "Organizes evidence for buyer, legal, and internal review."
- "Uses confidence bands to flag when expert review is needed."
- "Drafts for review by your team and counsel."

Forbidden wording classes (audit on every change):
- Direct claims that a company already satisfies a named law.
- Direct claims of certification or accreditation.
- Guaranteed legal, procurement, regulator, or audit outcomes.
- Claims that TrustFolder replaces qualified counsel or review.
- Broad all-laws claims that no product-specific review could support.

These are codified in `docs/14-DESIGN.md` §12 and grep-checked by every
batch acceptance.

---

## 6 · Structured data (deferred)

Phase 5 v1 keeps structured data minimal — only the FAQPage JSON-LD on
the homepage. We add Article + BreadcrumbList JSON-LD to blog posts once
the first 10 posts have settled in production for two weeks and we know
which ones are getting traffic.

---

## 7 · Open questions (low priority)

- Localisation: should we ship `/blog` in EN only for v1, or also a `/de`
  / `/fr` lane? Recommendation: EN only until validation surfaces real
  demand from non-EN buyers.
- AI-generated meta descriptions: for now we hand-write each. Revisit if
  the post count exceeds 50.

---

*This doc is the source of truth for SEO copy decisions. If on-page copy
on a public route diverges from §2, this doc is wrong and gets updated
in the same commit.*
