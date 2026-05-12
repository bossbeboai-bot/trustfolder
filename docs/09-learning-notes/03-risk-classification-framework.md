# Risk Classification Framework · EU AI Act · Learning Note

Source: EU AI Act (Regulation 2024/1689), Title II (Prohibited), Title III + Annex III (High-risk), Article 50 (Limited-risk)
Reference: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

## The 4-tier risk pyramid

The EU AI Act classifies AI systems into four risk tiers. Each tier carries different obligations.

```
     ┌──────────────┐
     │  PROHIBITED   │  Article 5
     │  (banned)     │  → Cannot exist in EU
     ├──────────────┤
     │  HIGH-RISK    │  Annex III + Article 6
     │  (regulated)  │  → Conformity assessment, registration, monitoring
     ├──────────────┤
     │  LIMITED-RISK │  Article 50
     │  (transparency)│ → Disclosure obligations
     ├──────────────┤
     │  MINIMAL-RISK │  No specific obligations
     │  (unregulated) │ → Voluntary codes of conduct
     └──────────────┘
```

---

## Prohibited AI systems (Article 5) — OUT OF SCOPE for TrustFolder

These are banned in the EU entirely. TrustFolder auto-rejects any customer in these categories.

| Prohibited practice | Article 5 reference |
|---|---|
| Social scoring by public authorities | Art 5(1)(c) |
| Exploitation of vulnerabilities (age, disability) | Art 5(1)(b) |
| Real-time remote biometric identification in public spaces (by law enforcement) | Art 5(1)(h) |
| Emotion recognition in workplace/education | Art 5(1)(f) |
| Biometric categorization on sensitive attributes (race, political opinion, etc.) | Art 5(1)(g) |
| Untargeted scraping of facial images for databases | Art 5(1)(e) |
| Predictive policing based solely on profiling | Art 5(1)(d) |
| Subliminal/manipulative techniques causing harm | Art 5(1)(a) |

---

## High-risk AI systems (Annex III) — OUT OF SCOPE for TrustFolder v1

These require extensive conformity assessment, CE marking, registration in the EU database, quality management systems, post-market monitoring, and incident reporting.

| Annex III category | Examples | Why TrustFolder rejects |
|---|---|---|
| 1. Biometric identification and categorisation | Facial recognition, fingerprint ID | Specialized legal counsel needed |
| 2. Critical infrastructure | Energy, water, transport management | Sector-specific safety regulations |
| 3. Education and vocational training | Student scoring, admission decisions | Children's data complexity |
| 4. Employment, workers management | CV screening, performance evaluation, hiring AI | High individual harm potential |
| 5. Access to essential services | Credit scoring, insurance pricing, social benefits | Financial services regulation overlap |
| 6. Law enforcement | Predictive policing, evidence evaluation | Government/criminal justice complexity |
| 7. Migration, asylum, border control | Visa processing, border surveillance | Government complexity |
| 8. Administration of justice | Legal research AI for courts, recidivism prediction | Judicial independence concerns |

**TrustFolder position:** We do not serve high-risk AI system customers in v1. These require qualified legal counsel and conformity assessment bodies. Our out-of-scope detector hard-rejects at intake.

---

## Limited-risk AI systems (Article 50) — PRIMARY TrustFolder scope

These are the transparency-obligation systems. This is where TrustFolder operates.

| Article 50 section | Obligation | Typical customer |
|---|---|---|
| 50(1) | Disclose AI interaction | Chatbots, AI assistants |
| 50(2) | Mark AI-generated content | Content generators, image/video AI |
| 50(3) | Disclose AI-generated public text | AI writing tools for public content |
| 50(4) | Disclose deepfakes | Face/voice synthesis tools |
| 50(5) | Inform about emotion recognition / biometric categorization | Sentiment analysis, categorization tools |

**Key principle:** Limited-risk obligations are about TRANSPARENCY, not about restricting the AI system itself. The customer can keep operating — they just need to disclose.

---

## Minimal-risk AI systems — TrustFolder still helps

AI systems that don't fall into any of the above categories have no specific obligations under the AI Act. However:

1. **Voluntary codes of conduct** (Article 95) apply — showing governance readiness is a market advantage
2. **Enterprise buyers still ask** — vendor questionnaires don't wait for legal mandates
3. **ISO 42001 alignment** — useful regardless of regulatory classification
4. **Future-proofing** — classification can change as regulations evolve

---

## How TrustFolder classifies customers

### Step 1: Vertical check (hard-coded, no LLM)
- Keywords from out-of-scope list → HARD-OUT or SOFT-OUT
- See `02-icp-and-niche-scope.md` for full list

### Step 2: System-level assessment (per AI system)
For each AI system the customer has:

| Signal | Classification | Band |
|---|---|---|
| Chatbot / conversational AI + B2B + no personal data decisions | Limited-risk (Article 50) | CLEAR |
| Content generation + published publicly | Limited-risk (Article 50) | CLEAR |
| Deepfake / synthetic media generation | Limited-risk (Article 50) | CLEAR (with extra disclosure) |
| Emotion recognition (non-prohibited use) | Limited-risk + sensitive | REVIEW |
| AI making decisions about individuals (hiring, credit, etc.) | Potentially high-risk (Annex III) | HARD-OUT |
| AI for internal productivity (no customer-facing) | Minimal-risk | CLEAR (voluntary governance) |
| Unclear use case | Cannot classify | UNCERTAIN |

### Step 3: Confidence band assignment
See `06-confidence-bands.md` for the 5-band system.

---

## Common edge cases

### "We use AI for customer support — is that high-risk?"
- Customer support chatbot answering questions → **limited-risk** (Article 50(1) disclosure)
- AI making decisions about customer access/service levels → **potentially high-risk** → REVIEW
- AI triaging support tickets internally → **minimal-risk**

### "We generate marketing content with AI"
- AI writing marketing copy → **limited-risk** if published publicly (Article 50(3))
- AI generating images for ads → **limited-risk** (Article 50(2))
- AI generating content for internal use only → **minimal-risk**

### "We have a recommendation engine"
- Product recommendations → **minimal-risk** (no specific obligations)
- Content recommendations → **minimal-risk**
- Recommendation affecting access to services → **potentially high-risk** → REVIEW

### "We use AI for data analysis"
- Internal analytics → **minimal-risk**
- Analytics producing individual-level decisions → **REVIEW** (could be high-risk depending on domain)
- Analytics for public reporting → **minimal-risk** (but transparency is good practice)

---

## Template writing rules for risk classification

1. **Never use "is" — use "likely" or "appears to be."**
2. **Classify per system, not per company.** A company can have limited-risk AND minimal-risk systems.
3. **Default to REVIEW when uncertain.** False-CLEAR is the worst outcome.
4. **Always cite the specific Article or Annex.** "Likely limited-risk under Article 50(1)" not just "limited-risk."
5. **Explain what the classification means practically.** "This means you need to add a disclosure notice to your chatbot" — not just "limited-risk."
6. **Include the standard disclaimer.** Every classification ends with "This is a preparatory assessment. Review with qualified counsel."

---

Last updated: 8 May 2026
