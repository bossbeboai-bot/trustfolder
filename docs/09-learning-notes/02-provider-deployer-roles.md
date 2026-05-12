# Provider vs Deployer Roles · EU AI Act · Learning Note

Source: EU AI Act (Regulation 2024/1689), Articles 3(3), 3(4), Chapter III
Reference: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

## Why this matters

The EU AI Act assigns different obligations to different roles in the AI value chain. A company's obligations depend entirely on whether they are a **provider**, **deployer**, or both. Getting this wrong means the customer prepares the wrong documents.

---

## Definitions (Article 3)

### Provider (Article 3(3))
> 'provider' means a natural or legal person, public authority, agency or other body that develops an AI system or a general-purpose AI model or that has an AI system or a general-purpose AI model developed and **places it on the market or puts it into service under its own name or trademark**, whether for payment or free of charge.

**Plain English:** You BUILD the AI and sell/offer it under your name.

### Deployer (Article 3(4))
> 'deployer' means a natural or legal person, public authority, agency or other body **using an AI system under its authority**, except where the AI system is used in the course of a personal non-professional activity.

**Plain English:** You USE an AI system in your product or business, but you didn't build the underlying AI model.

---

## The critical distinction for TrustFolder customers

Most TrustFolder customers are **deployers** — they use third-party LLMs (OpenAI, Anthropic, Google) in their products. They did NOT build the foundational AI model.

However, some customers may ALSO be providers:
- If they fine-tuned a model and offer it under their brand → **provider** of the fine-tuned system
- If they built a wrapper product (chatbot, agent) with substantial logic → **deployer** of the LLM, possibly **provider** of the wrapper system
- If they train and sell their own model → **provider**

### Common patterns for our ICP

| Customer scenario | Role | Why |
|---|---|---|
| Uses OpenAI API to power a chatbot | **Deployer** of the chatbot system | They use OpenAI's model under their authority |
| Fine-tunes GPT-4 and sells it as "AcmeAI" | **Provider** of AcmeAI | They put a modified AI system on the market under their name |
| Builds a RAG system using Claude + own data | **Deployer** of Claude; possibly **provider** of the RAG system | Depends on whether the RAG system itself is an "AI system" |
| Uses Stable Diffusion to generate images in their product | **Deployer** of the image generation system | They use Stability AI's model |
| Trains a custom ML model for text classification | **Provider** | They developed the AI system |
| Resells an AI tool white-labeled | **Provider** | They place it on the market under their name (Article 25) |

---

## Why "both" is common

Article 25 explicitly addresses this. A deployer can become a provider if they:
1. Put their name or trademark on a high-risk AI system already on the market
2. Make a substantial modification to a high-risk AI system
3. Modify the intended purpose of an AI system so it becomes high-risk

**Implication for templates:** The Provider/Deployer Role Memo must assess each AI system individually and flag when a customer might be BOTH.

---

## Different obligations by role

### Providers must (among others):
- Ensure conformity with AI Act requirements
- Draw up technical documentation
- Implement quality management systems
- Register AI systems in the EU database (for high-risk)
- Report serious incidents
- Implement Article 50 transparency measures

### Deployers must (among others):
- Use AI systems in accordance with instructions
- Implement human oversight measures
- Monitor operation and report malfunctions
- Conduct fundamental rights impact assessments (for high-risk, certain deployers)
- Implement Article 50 transparency obligations (informing users)

---

## How this maps to TrustFolder templates

| Template | Provider-relevant | Deployer-relevant |
|---|---|---|
| `t2-02-provider-deployer-memo.md` | ✓ (identifies role) | ✓ (identifies role) |
| `t1-01-chatbot-disclosure.md` | ✓ | ✓ (primary audience) |
| `t2-03-risk-classification-memo.md` | ✓ | ✓ |
| `t2-07-human-oversight-procedure.md` | ✓ | ✓ (primary audience) |
| `t2-01-ai-system-inventory.md` | ✓ | ✓ |

---

## Confidence band implications

| Scenario | Band |
|---|---|
| Customer clearly uses third-party LLM API → Deployer | **CLEAR** |
| Customer fine-tuned a model and sells under own name → Provider | **CLEAR** |
| Customer built a wrapper product — unclear if "AI system" or just "use" | **UNCERTAIN** → recommend legal review |
| Customer white-labels another AI product → Possibly provider per Art 25 | **REVIEW** |
| Customer is unsure about their model provenance | **UNCERTAIN** |

---

## Template writing rules for provider/deployer

1. **Always assess per system.** A customer might be a deployer for one system and a provider for another.
2. **Default to deployer** for the typical ICP (small SaaS using LLM APIs). But always check.
3. **Flag Article 25 scenarios** explicitly — white-labeling and substantial modification are the most common triggers.
4. **Never assert.** Use "You appear to be a deployer of [system]" not "You are a deployer."
5. **Recommend legal confirmation** for any borderline case.

---

Last updated: 8 May 2026
