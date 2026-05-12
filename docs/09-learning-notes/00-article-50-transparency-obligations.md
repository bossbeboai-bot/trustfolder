# Article 50 · Transparency Obligations · Learning Note

Source: EU AI Act (Regulation 2024/1689), Article 50
Reference: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

## What Article 50 requires

Article 50 imposes transparency obligations on **providers and deployers** of certain AI systems. These are NOT high-risk obligations — they apply to AI systems that interact with people or generate content, regardless of risk level.

### Article 50(1) — AI systems interacting with people

> Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural person concerned is informed that they are interacting with an AI system, unless this is obvious from the circumstances and context of use.

**What this means for TrustFolder customers:**
- Any chatbot, AI assistant, or conversational AI must disclose its AI nature to users
- The disclosure must happen BEFORE or AT the point of interaction
- Exception: only if AI nature is "obvious from the circumstances" (high bar — most products should disclose)

### Article 50(2) — AI-generated content (including deepfakes)

> Providers of AI systems, including GPAI systems, generating synthetic audio, image, video or text content, shall ensure that the outputs of the AI system are marked in a machine-readable format and detectable as artificially generated or manipulated.

**What this means:**
- AI-generated text, images, audio, video must be marked as AI-generated
- Marking must be machine-readable (not just a label — technical watermarking or metadata)
- Applies to providers of the generation system

### Article 50(3) — Deployers using AI for text on matters of public interest

> Deployers of an AI system that generates or manipulates text which is published with the purpose of informing the public on matters of public interest shall disclose that the text has been artificially generated or manipulated.

**What this means:**
- If your customer uses AI to write public-facing content (news, public information), they must disclose
- This is a deployer obligation, not just a provider obligation

### Article 50(4) — Deepfakes

> Deployers of an AI system that generates or manipulates image, audio or video content constituting a deep fake, shall disclose that the content has been artificially generated or manipulated.

**What this means:**
- Any deepfake content must be disclosed
- Applies to the deployer (the person using the tool to create the deepfake)

### Article 50(5) — Emotion recognition and biometric categorization

> Information referred to in paragraphs 1 to 4 shall be provided to the natural persons concerned in a clear and distinguishable manner at the latest at the time of the first interaction or exposure.

Plus specific obligations for emotion recognition and biometric categorization systems.

---

## Timeline

- **Applies from:** 2 August 2026 (per Article 113(c))
- **Note:** The May 2026 provisional dilution deal may adjust some aspects — track in `07-regulatory-watch.md`

---

## How this maps to TrustFolder templates

| Article 50 section | TrustFolder Tier 1 template |
|---|---|
| 50(1) — AI interaction disclosure | `t1-01-chatbot-disclosure.md` |
| 50(2) — AI-generated content marking | `t1-02-ai-content-labeling.md` |
| 50(4) — Deepfake disclosure | `t1-03-deepfake-notice.md` |
| 50(5) — Emotion recognition | `t1-04-emotion-recognition-notice.md` |
| 50(5) — Biometric categorization | `t1-05-biometric-categorization-notice.md` |
| General transparency page | `t1-06-ai-system-disclosure-page.md` |
| Internal AI usage policy | `t1-07-ai-usage-policy-summary.md` |

---

## Key distinctions for template writing

1. **Provider vs deployer:** Different obligations. Provider = builds the AI system. Deployer = uses it in their product. Many TrustFolder customers are deployers (they use third-party LLMs).
2. **Machine-readable marking:** Article 50(2) requires technical marking, not just a text label. Templates should recommend both human-readable disclosures AND technical metadata/watermarking.
3. **"Unless obvious":** The exception in 50(1) is narrow. Templates should recommend disclosure even when AI nature might seem obvious — safer to over-disclose.
4. **Content type matters:** Text, image, audio, video each have specific provisions. Templates must be content-type-aware.

---

## Confidence band implications

- Most in-scope TrustFolder customers (B2B SaaS chatbots, content tools) → **CLEAR** band for Article 50 obligations
- Emotion recognition / biometric categorization → **REVIEW** band (even if in-scope, these are sensitive)
- Deepfake generation → **REVIEW** band (legitimate uses exist but require careful disclosure)

---

Last updated: 8 May 2026
