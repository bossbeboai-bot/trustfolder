# TrustFolder Master Templates

The product. 19 master templates that the AI engine customizes per customer based on URL crawl + 8-15 confirmation questions.

**Status:** v0.9 (pre-advisor-review)  
**Advisor review gate:** Tier 2 templates require advisor sign-off before $499 launch (Day 35)  
**Tier 1 launch:** Day 24 (no advisor gate — pure transparency content)

---

## Template structure

Every template uses this format:
1. **Front matter** — template ID, source citations, applicable confidence bands
2. **AI instructions** — how the engine should fill placeholders
3. **Customer-facing content** — markdown body with `{{ placeholder }}` variables
4. **Confidence-band markers** — every classification uses one of 5 bands
5. **Disclaimer footer** — canonical language from `docs/01-brand-language-rules.md`

Placeholders use `{{ snake_case }}` format. The AI engine substitutes these at generation time.

---

## Tier 1 · Article 50 Disclosure Documents (7 templates)

For the $99 Disclosure Generator. Pure transparency content — safe to launch without advisor.

| ID | Template | Article 50 reference | When generated |
|---|---|---|---|
| t1-01 | `tier-1/t1-01-chatbot-disclosure.md` | Article 50(1) | Customer has chatbot/conversational AI |
| t1-02 | `tier-1/t1-02-ai-content-labeling.md` | Article 50(2) | Customer generates AI content |
| t1-03 | `tier-1/t1-03-deepfake-notice.md` | Article 50(4) | Customer creates synthetic media |
| t1-04 | `tier-1/t1-04-emotion-recognition-notice.md` | Article 50(5) | Customer uses emotion recognition |
| t1-05 | `tier-1/t1-05-biometric-categorization-notice.md` | Article 50(5) | Customer uses biometric categorization |
| t1-06 | `tier-1/t1-06-ai-system-disclosure-page.md` | Article 50 (general) | Always (master AI disclosure page) |
| t1-07 | `tier-1/t1-07-ai-usage-policy-summary.md` | Article 50 (internal) | Always (internal policy summary) |

**Generation rule:** Templates 1-5 are CONDITIONAL — only generated if the customer has the relevant AI system. Templates 6-7 are ALWAYS generated.

---

## Tier 2 · AI Governance Documents (12 templates)

For the $499 Readiness Pack. Risk classification + governance — REQUIRES advisor review before launch.

| ID | Template | Source | Applicable bands |
|---|---|---|---|
| t2-01 | `tier-2/t2-01-ai-system-inventory.md` | ISO 42001 A.4 | All in-scope |
| t2-02 | `tier-2/t2-02-provider-deployer-memo.md` | EU AI Act Art 3, 25 | All in-scope |
| t2-03 | `tier-2/t2-03-risk-classification-memo.md` | EU AI Act Art 6, Annex III, Art 50 | All in-scope |
| t2-04 | `tier-2/t2-04-iso-42001-checklist.md` | ISO/IEC 42001:2023 Annex A | All in-scope |
| t2-05 | `tier-2/t2-05-evidence-tracker.md` | ISO 42001 + Art Act docs requirements | All in-scope |
| t2-06 | `tier-2/t2-06-ai-policy-draft.md` | ISO 42001 A.2 | All in-scope |
| t2-07 | `tier-2/t2-07-human-oversight-procedure.md` | EU AI Act Art 14 + ISO 42001 A.9 | All in-scope |
| t2-08 | `tier-2/t2-08-vendor-questionnaire.md` | ISO 42001 A.10 | All in-scope |
| t2-09 | `tier-2/t2-09-lawyer-handoff-pack.md` | TrustFolder original | All in-scope |
| t2-10 | `tier-2/t2-10-governance-roadmap.md` | TrustFolder original | All in-scope |
| t2-11 | `tier-2/t2-11-pack-readme.md` | TrustFolder original | All deliveries |
| t2-12 | `tier-2/t2-12-out-of-scope-handoff.md` | TrustFolder original | SOFT-OUT cases |

---

## Variable conventions

Standard placeholders that appear across templates:

| Variable | Type | Source | Example |
|---|---|---|---|
| `{{ company_name }}` | string | URL crawl + question | "Acme AI" |
| `{{ product_name }}` | string | URL crawl + question | "Acme Chat" |
| `{{ company_url }}` | URL | Customer input | "https://acme.ai" |
| `{{ ai_systems[] }}` | array | URL crawl + questions | List of detected AI features |
| `{{ primary_ai_use_case }}` | string | URL crawl | "AI customer support chatbot" |
| `{{ b2b_or_b2c }}` | enum | Question | "B2B" |
| `{{ has_eu_customers }}` | bool | Question | true |
| `{{ ai_role }}` | enum | Inferred | "deployer" / "provider" / "both" |
| `{{ third_party_models[] }}` | array | Question | ["OpenAI GPT-4", "Anthropic Claude"] |
| `{{ confidence_band }}` | enum | Engine | "CLEAR" / "REVIEW" / "UNCERTAIN" / "SOFT-OUT" / "HARD-OUT" |
| `{{ generation_date }}` | date | Engine | "2026-05-08" |

---

## Quality gates

Before any template ships to a customer:
1. **AI generates** content from template + customer context
2. **QA pass** (second LLM call) validates: confidence bands present, citations cited, disclaimers attached, no forbidden words
3. **Auto-regenerate** once if QA fails
4. **Manual review** if second QA fails

For Tier 2: also pre-launch advisor review of master templates (Day 28-32).

---

## Template version control

- Master templates are git-tracked (this folder is the most precious asset)
- Customer-generated docs are stored in Supabase Storage per order, not committed
- Template revisions follow semver: `v0.9` → `v1.0` (post-advisor) → `v1.1` (incremental)

---

Last updated: 8 May 2026 (Day 0)
