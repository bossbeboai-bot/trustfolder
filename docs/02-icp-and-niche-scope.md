# 02 · ICP and Niche Scope · Who We Sell To, Who We Don't

The canonical list of who is in scope and who gets auto-rejected. Used by: marketing copy, landing-page targeting, the AI engine's out-of-scope detector, advisor briefings, sales DMs.

---

## In one line

> Small B2B AI SaaS companies (5-50 employees) building generative, conversational, or content-AI products who serve EU customers — and are NOT in banking, healthcare, HR, biometrics, children, credit, law-enforcement, or critical-infrastructure verticals.

---

## ICP persona

**Title:** Founder / CTO / Head of Engineering / Chief of Staff  
**Company stage:** Seed to Series B (5-50 employees)  
**Product type:** AI SaaS — chatbot, AI agent, AI writing assistant, AI image generator, AI video tool, AI dev tool, AI sales tool, etc.  
**Customer base:** B2B, with at least one of:
- EU-based paying customers
- EU users in the product
- Enterprise customers asking AI governance questions in vendor questionnaires
- Procurement-driven sales cycles

**Revenue:** $100k-$5M ARR (typical)  
**Founding year:** 2022-2026 (post-ChatGPT generation)

**Pain triggers:**
1. Enterprise prospect asks for AI governance documentation in a vendor questionnaire
2. Lawyer mentions EU AI Act and they realize they have nothing
3. ISO 42001 comes up in a procurement call
4. Internal compliance person asks "what's our AI policy?"
5. Reading the news about AI Act fines and panicking
6. Heard a podcast about ISO 42001 and feeling behind

**Where they hang out:**
- LinkedIn (founder + CTO communities)
- Indie Hackers
- Twitter/X (AI dev community)
- Hacker News (Show HN, Ask HN)
- Lenny's Newsletter, Every.to, Dan Shipper, Bharat Founders
- Maven cohort communities (Lenny, Section, Reforge)
- ProductHunt

**What they currently do about it:**
- Nothing (yet)
- Asked ChatGPT to draft a policy and got something generic
- Paid a consultant $5-20k for a starter doc set
- Hired a fractional DPO
- Bought a $99 Notion template pack from Gumroad

We replace the "ask ChatGPT" and "Notion template" approaches with something structured, advisor-reviewed, and tailored to their actual product.

---

## IN-SCOPE verticals (we accept)

### Generative & content AI
- AI writing assistants (copy, marketing, code-doc generation)
- AI image generators (logos, ads, mockups, art)
- AI video generation (short-form, marketing, animation)
- AI audio (podcasts, voiceovers, music)
- AI summarization tools (meetings, docs, emails)
- AI translation tools

### Conversational AI
- Customer-support chatbots
- Sales AI agents (SDR, BDR automation)
- AI tutors / learning assistants (NOT for K-12 children — see out-of-scope)
- AI coaches (productivity, fitness, mental wellness — adult only)

### Productivity AI
- AI dev tools (code completion, code review, IDE plugins)
- AI design tools (Figma plugins, mockup generators)
- AI sales tools (deal coaching, email drafting, CRM enrichment)
- AI marketing tools (campaign generation, A/B testing AI)
- AI research tools (search, summarization, analyst tools)

### Vertical AI (in-scope subset)
- Legal AI for non-regulated work (contract drafting assistant for SMBs, NOT for litigation)
- Real estate AI (listing generation, market analysis)
- E-commerce AI (product descriptions, image enhancement)
- Travel AI (itinerary planning, booking assistance)

---

## OUT-OF-SCOPE verticals (we auto-reject)

These are EU AI Act high-risk verticals (Annex III) or otherwise carry serious harm risk if AI gives wrong output. We refuse to serve them in v1.

### Hard reject — regulated high-risk verticals

| Vertical | Why rejected | EU AI Act reference |
|---|---|---|
| **Banking / financial services** | Credit scoring, loan approval = Annex III high-risk | Annex III(5)(b) |
| **Healthcare / medical devices** | Patient diagnosis, treatment = high-risk + MDR overlap | Annex III(5)(c-d) + MDR |
| **HR / employment** | CV screening, performance scoring, layoffs = high-risk | Annex III(4) |
| **Biometric identification** | Identification (vs categorization) = high-risk or prohibited | Annex III(1) + Art 5 |
| **Credit scoring** | Annex III high-risk | Annex III(5)(b) |
| **Law enforcement** | Annex III high-risk | Annex III(6) |
| **Migration / asylum / border** | Annex III high-risk | Annex III(7) |
| **Judicial / democratic processes** | Annex III high-risk | Annex III(8) |
| **Education scoring** | Student access decisions = high-risk | Annex III(3) |
| **Critical infrastructure** | Energy, water, transport = high-risk | Annex III(2) |

### Hard reject — children's products

| Vertical | Why rejected |
|---|---|
| **K-12 educational AI** | Children's data + age verification + GDPR-K complexity |
| **Children's content AI** | Compounding obligations under Digital Services Act |
| **Toys with embedded AI** | Toy Safety Directive overlap |
| Any product where >10% of users are <18 | Risk too high for v1 |

### Hard reject — prohibited AI uses (Article 5)

| Vertical | Why rejected |
|---|---|
| **Social scoring systems** | Article 5 prohibited |
| **Emotion recognition in workplace/education** | Article 5 prohibited |
| **Biometric categorization on sensitive attributes** | Article 5 prohibited |
| **Real-time remote biometric identification** | Article 5 prohibited |
| **Predictive policing solely based on profiling** | Article 5 prohibited |
| **Untargeted facial-image scraping for databases** | Article 5 prohibited |

### Soft reject — too complex for v1

| Vertical | Why deferred |
|---|---|
| **Insurance underwriting AI** | High-risk + sector-specific regulators |
| **Legal AI for litigation/court filings** | Unauthorized practice of law risk |
| **Government / public sector AI** | Procurement complexity + sector-specific rules |
| **Defense / military AI** | Out of EU AI Act scope but high risk |
| **Heavy industry / manufacturing AI** | Sector-specific safety regs |

---

## How rejection works

### At intake (Free Assessment)
- 8 confirmation questions include vertical-detection questions
- Specific keywords trigger out-of-scope flag
- User sees: "Based on your responses, your product appears to operate in [vertical]. AI tools in this category have higher-risk classifications and require qualified legal review beyond our automated tool's scope. We recommend [next-steps]."

### At checkout (Paid Tiers)
- Same out-of-scope detector runs before PayPal redirect
- If triggered, payment is blocked + user sees rejection message
- No charge happens

### Post-payment edge case (rare)
- If somehow a regulated-vertical user pays before detection
- Engine's QA pass detects out-of-scope content in generation
- Auto-refund issued via PayPal
- Email sent: "We've issued a refund — your product appears to be in [vertical], which is out of our v1 scope. Recommend [next-steps]."

---

## Confidence-band integration

Even within in-scope verticals, individual customers may have systems that need higher-risk treatment. The confidence band system handles this gracefully:

| Customer profile | Likely band |
|---|---|
| Pure conversational AI for B2B SaaS | Likely limited-risk |
| AI writing assistant for SMBs | Likely limited-risk |
| AI image generator for marketers | Likely limited-risk |
| AI sales tool with EU user data | Limited-risk + GDPR overlap (flag) |
| AI tutor for adults | Limited-risk |
| AI tutor for "students" with unclear age | Requires clarification → if children, out-of-scope |

Detail in `06-confidence-bands.md`.

---

## ICP messaging tests

Before publishing any marketing copy, run these checks:

1. **Vertical fit:** Does the copy clearly speak to in-scope ICPs and not signal welcome to out-of-scope verticals?
2. **Stage fit:** Is this written for a 5-50 employee company, not enterprise?
3. **Pain fit:** Does it mention the actual triggers (vendor questionnaires, lawyer prep, procurement) instead of generic "compliance"?
4. **Geographic fit:** Does it implicitly or explicitly indicate EU customer focus?

---

## Living document

Updated whenever:
- A new vertical is asked about
- An out-of-scope edge case slips through
- The EU AI Act phasing changes scope
- We expand verticals (post-Mo-3 with appropriate advisor coverage)

Last updated: 8 May 2026 (Day 0)
