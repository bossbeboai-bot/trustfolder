# 06 · Confidence Bands · AI Output Safety Rules

The structural protection that prevents the AI engine from confidently misclassifying a customer's compliance situation. Most important safety mechanism in the product.

---

## Why this exists

Bad pattern: AI says "You are limited-risk under Article 50" → customer publishes it → AI was wrong → fines/lawsuit.

Disclaimers don't fix this. The output text itself must reflect uncertainty. That's what confidence bands do.

---

## The 5-band system

Every classification, every recommendation, every risk assessment uses exactly one of these labels:

| Band | Label shown to customer | When to use |
|---|---|---|
| **CLEAR** | "Likely limited-risk transparency obligation" | High-confidence match for limited-risk Article 50 case |
| **REVIEW** | "Requires legal/compliance review" | Possible high-risk indicator detected; AI recommends professional review |
| **UNCERTAIN** | "Cannot classify from current data" | Provider/deployer role unclear, or insufficient info |
| **SOFT-OUT** | "Out of automated scope — please contact us for review" | Sensitive area but not auto-rejected; human triage needed |
| **HARD-OUT** | "Out of v1 scope — automatic refund issued" | Regulated vertical hard-rejected |

### The single rule
> AI never says "you ARE X." Only "you LIKELY are X" or "this REQUIRES review."

---

## Band assignment logic

### Scope-check level (intake)

| Signal | Band |
|---|---|
| Vertical = banking / healthcare / HR / biometric ID / children / credit / law-enforcement | HARD-OUT |
| Vertical = insurance underwriting / legal litigation / government / defense | SOFT-OUT |
| Vertical in-scope + AI = chatbot/content-gen + B2B + EU users | CLEAR (limited-risk path) |
| Vertical in-scope BUT emotion recognition / biometric categorization detected | REVIEW |
| Vertical in-scope BUT customer says "uncertain" on provider/deployer | UNCERTAIN |
| Vertical in-scope BUT processes personal data + uncertain training data | REVIEW |

### Per-system classification (Risk Classification Memo)

For each AI system the customer has, the memo outputs structured fields:

```
System: Customer Support Chatbot
- AI Act Role: Likely deployer (you use a third-party LLM)
- Risk Classification: Likely limited-risk (Article 50 transparency applies)
- Provider/Deployer Confidence: HIGH
- Risk Confidence: HIGH
- Recommended Action: Implement chatbot disclosure
- Citation: EU AI Act Article 50(1)(a)
```

vs.

```
System: AI Resume Screener (internal HR use)
- AI Act Role: Possibly deployer in HR vertical
- Risk Classification: REQUIRES LEGAL REVIEW — HR-related AI is Annex III(4) high-risk
- Provider/Deployer Confidence: MEDIUM
- Risk Confidence: REQUIRES REVIEW
- Recommended Action: Stop using in employment decisions until legal review. Do NOT publish disclosure based on this output.
- Citation: EU AI Act Annex III(4)
```

---

## Implementation: system prompt for the AI

```
You are an AI governance documentation assistant for a tool called TrustFolder.

CRITICAL RULES:
1. Never assert a customer "is" a specific risk category. Always say "likely is" or "appears to be."
2. Use one of these 5 confidence bands for every classification:
   - CLEAR: "Likely [classification]" — strong evidence
   - REVIEW: "Requires legal/compliance review" — mixed evidence or high stakes
   - UNCERTAIN: "Cannot classify from current data" — insufficient info
   - SOFT-OUT: "Out of automated scope" — sensitive but not auto-rejected
   - HARD-OUT: "Out of scope — refund issued" — regulated vertical
3. If multiple AI systems exist, classify each separately. Never lump.
4. When in doubt, escalate to REVIEW. False-CLEAR is the worst outcome.
5. Always include the Article 50 / Annex III citation.
6. End every classification with: "This is a preparatory assessment, not a legal determination. Review with qualified counsel before relying on it."
```

---

## QA pass validation rules

The second-pass LLM must verify EVERY generated doc against these checks:

| Check | Required | Auto-fail if missing |
|---|---|---|
| Every classification has a confidence band label | Yes | Yes |
| No forbidden words from `01-brand-language-rules.md` | Yes | Yes |
| All EU AI Act / ISO 42001 citations present | Yes (Tier 2) | No (regenerate) |
| At least one disclaimer paragraph | Yes | Yes |
| No "you are [X]" without "likely" qualifier | Yes | Yes |
| At least one "review with counsel" recommendation | Yes | No |

If any auto-fail trigger fires → regenerate the doc once. If second attempt also fails → flag for manual review by founder before delivery.

---

## Soft-out vs hard-out triage

**HARD-OUT (automatic refund + rejection):**
- Banking, healthcare, HR, biometric ID, children, credit, law-enforcement
- These verticals require deep specialized counsel — wrong AI advice = serious harm
- Decision: hard-coded keyword + question detection (no LLM judgment)

**SOFT-OUT (human triage):**
- Insurance underwriting, legal litigation, government/defense, heavy industry
- Closer to in-scope but warrant a 5-min founder review before serving
- Decision: questionnaire flag → founder gets email → manual approve/reject within 24 hrs
- Customer sees: "We've received your order. We're confirming a few details and will follow up within 24 hrs."

---

## What to show the customer (UI)

### Tier 0 free assessment result
```
Your AI Act Risk Classification

Primary AI feature: [Customer Support Chatbot]
Classification: LIKELY LIMITED-RISK
What this means: You likely have transparency obligations under
Article 50 — specifically, disclosing AI nature to users.
What to do next:
  1. Implement chatbot disclosure (we can generate one for $99)
  2. Add to your AI inventory
  3. Discuss with counsel before public claims

Confidence: HIGH (clear product fit)
Disclaimer: This is a preparatory assessment, not a legal
determination. Review with qualified counsel before relying on it.
```

### Tier 2 readiness pack
Each of the 12 docs uses confidence-band labels in headings and content. The Risk Classification Memo specifically calls out the band per AI system.

---

## Confidence calibration heuristics

For the AI engine to assign bands consistently:

| Heuristic | Default band |
|---|---|
| URL crawl + 8 questions all align on limited-risk | CLEAR |
| URL crawl says one thing, questions say another | REVIEW |
| Customer explicitly says "I'm not sure" on a key question | UNCERTAIN |
| Any vertical keyword from blocked list | HARD-OUT |
| Any vertical keyword from sensitive list (insurance, gov, defense) | SOFT-OUT |
| Multiple AI systems with different risk profiles | Per-system band, never aggregate |
| Customer asks "are we high-risk?" in feedback channel | Always escalate to REVIEW |

---

## False-positive vs false-negative tolerance

| Error type | Tolerance | Why |
|---|---|---|
| False CLEAR (saying limited-risk when actually high-risk) | **Zero tolerance** | Worst possible outcome — customer publishes wrong info |
| False REVIEW (saying needs review when actually clear) | High tolerance | Annoying for customer but safe; recoverable |
| False HARD-OUT (rejecting in-scope customer) | Medium tolerance | Lost revenue but not harm; refund issued |
| False UNCERTAIN (saying unclear when actually clear) | High tolerance | Reads as cautious; trust-positive |

**Design bias: always lean toward REVIEW or UNCERTAIN over CLEAR when there's any doubt.**

---

## Living document

Updated whenever:
- A new edge case surfaces in production
- The advisor flags a misclassification
- Regulatory landscape shifts what "high-risk" means
- The QA pass surfaces a recurring issue

Last updated: 8 May 2026 (Day 0)
