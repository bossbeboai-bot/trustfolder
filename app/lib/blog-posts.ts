import type { BlogPost } from './blog';

/**
 * 10 starter posts. Plain-English, no legal overclaims or broad outcome
 * promise language. Each post is short (~3–5 minute
 * read) and links naturally to the rest of the site.
 *
 * Editing notes:
 *   - Keep titles ≤ 70 chars where possible.
 *   - Use "readiness" / "review-ready" / "draft" language.
 *   - Mention pricing tier or pack name in context, never as a hard sell.
 *   - Each post should answer one specific question a founder or AI agency
 *     operator might Google.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'what-is-an-ai-governance-evidence-folder',
    title: 'What is an AI governance evidence folder?',
    description:
      'A plain-English explanation of what an AI governance evidence folder contains, why buyers ask for one, and how AI startups can prepare review-ready drafts.',
    lede: 'A short answer to a question more buyers and lawyers are asking AI founders every quarter.',
    published_at: '2025-08-12T09:00:00Z',
    tags: ['AI governance documents', 'AI governance evidence folder', 'AI startup readiness'],
    reading_minutes: 4,
    sections: [
      { type: 'p', text: 'An AI governance evidence folder is a single, organised package of documents that explains what your AI product does, how it is governed, and where the supporting evidence lives. It is the artefact a senior buyer, internal review committee, or external lawyer expects to receive when they ask, "How does your AI work and how do we know it is safe to roll out?"' },
      { type: 'p', text: 'It is not a single template. It is a small folder of related drafts that read together as one coherent picture of your AI product.' },
      { type: 'h2', text: 'What an evidence folder typically contains' },
      { type: 'ul', items: [
        'AI use summary — a plain-English description of what the AI feature does and who is exposed to it.',
        'AI disclosure drafts — user-facing language for chatbots, AI-generated content, and AI-assisted features.',
        'Governance summary — how the team reviews AI outputs, sets boundaries, and assigns responsibility.',
        'Evidence tracker — a structured record of what your website says, what you confirmed, and what still needs review.',
        'Source notes — citations to where the AI claims live on your site or product.',
        'Buyer or legal handoff document — a one-page cover note your reviewer can read first.',
        'Next-step roadmap — the practical list of disclosures, reviews, and updates queued for the next 30 days.',
      ] },
      { type: 'h2', text: 'Why a folder, not a single document?' },
      { type: 'p', text: 'Because the people reviewing your AI product do not have one job. A buyer wants to understand exposure quickly. A lawyer wants to scan disclosure language and pick at gaps. An internal owner wants the operational checklist. A folder lets each of them open the document that matches their question without forcing one document to do five jobs badly.' },
      { type: 'h2', text: 'Who needs one?' },
      { type: 'p', text: 'B2B AI SaaS companies with mid-market or enterprise customers, AI agencies handing off chatbots and automation work to clients, and any AI product team that has heard the words "vendor review" or "AI use questionnaire" more than once this quarter.' },
      { type: 'callout', tone: 'info', title: 'TrustFolder note', text: 'TrustFolder prepares review-ready evidence folder drafts based on your AI product website and a short questionnaire. The output is a draft for review — not legal advice, certification, or a compliance guarantee.' },
    ],
  },
  {
    slug: 'ai-disclosure-documents-b2b-startup',
    title: 'What AI disclosure documents should a B2B AI startup prepare?',
    description:
      'A short checklist of the AI disclosure documents most B2B AI SaaS startups should have a draft of before the first enterprise vendor review.',
    lede: 'You do not need everything on day one. You do need these.',
    published_at: '2025-08-15T09:00:00Z',
    tags: ['AI disclosure', 'AI disclosure template', 'B2B AI startup'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'Most B2B AI startups end up needing the same handful of AI disclosure documents. The order they appear on your roadmap is usually driven by the first time a customer asks for them, which is later than ideal.' },
      { type: 'p', text: 'Here is a practical starter list. Drafts are fine — none of these need to be final or counsel-reviewed before you can answer a buyer who asks for them.' },
      { type: 'h2', text: '1. AI chatbot disclosure' },
      { type: 'p', text: 'A short, user-facing notice that the chat interface is an AI system, what it can do, what it cannot, and how a user can reach a human if they need to. Often lives in the chat header, settings, or a linked policy.' },
      { type: 'h2', text: '2. AI-generated content notice' },
      { type: 'p', text: 'A short notice anywhere your product produces text, images, or recommendations to a user that came from an AI model. Buyers and the EU AI Act both care about clarity here.' },
      { type: 'h2', text: '3. AI system disclosure page' },
      { type: 'p', text: 'A single page on your site that explains what AI does in your product, what data it uses, where the human review sits, and how the user can opt out where applicable. This is the page you point buyers to before a sales conversation gets technical.' },
      { type: 'h2', text: '4. Internal AI use summary' },
      { type: 'p', text: 'A plain-English summary your sales team, customer success, and support can quote when asked the obvious questions. Short, factual, no marketing language.' },
      { type: 'h2', text: '5. Review note for legal handoff' },
      { type: 'p', text: 'A one-page note your lawyer or external counsel can read first that orients them to the AI feature, the disclosure choices you have made so far, and the open questions you would like their opinion on.' },
      { type: 'callout', tone: 'info', title: 'Where TrustFolder fits', text: 'The Disclosure Pack tier prepares draft language for #1, #2, #3, and a one-page placement guide. The Buyer-Ready AI Governance Folder tier adds the internal summary and the lawyer handoff note. Drafts are for review — TrustFolder is not legal advice or certification.' },
    ],
  },
  {
    slug: 'eu-ai-act-transparency-plain-english',
    title: 'EU AI Act transparency obligations in plain English for AI SaaS teams',
    description:
      'A plain-English summary of the EU AI Act transparency obligations most B2B AI SaaS teams will face, and the readiness documentation that supports review.',
    lede: 'A starter explainer for product, founder, and operations teams. Not legal advice.',
    published_at: '2025-08-18T09:00:00Z',
    tags: ['EU AI Act readiness', 'AI transparency', 'EU AI Act for startups'],
    reading_minutes: 6,
    sections: [
      { type: 'p', text: 'The EU AI Act has a set of transparency obligations that most B2B AI SaaS products will need to think about, regardless of whether they are based in the EU. The headline is simple: when a user is interacting with an AI system, or seeing AI-generated content, they should be told.' },
      { type: 'callout', tone: 'warn', title: 'Not legal advice', text: 'This is a plain-English starter, not a legal interpretation of the EU AI Act. Final compliance decisions should be reviewed by qualified counsel.' },
      { type: 'h2', text: 'The four transparency themes most B2B AI products encounter' },
      { type: 'h3', text: '1. AI system disclosure' },
      { type: 'p', text: 'When a person interacts with an AI system, they should generally be informed of that fact. For B2B AI SaaS this typically shows up as a chat header notice, a settings page line, or a system disclosure page on the marketing site.' },
      { type: 'h3', text: '2. AI-generated content notice' },
      { type: 'p', text: 'Where the AI produces text, images, or recommendations served to a user, it should generally be clear that the output came from an AI model.' },
      { type: 'h3', text: '3. Emotion recognition or biometric categorisation' },
      { type: 'p', text: 'These categories carry stricter obligations. Most general-purpose B2B AI products do not touch them, but it is worth knowing they sit in a separate, higher-risk lane.' },
      { type: 'h3', text: '4. Documentation expected to exist' },
      { type: 'p', text: 'Internally, the act expects organisations to be able to point to documentation describing the AI system, its intended purpose, and the people responsible for oversight. This is what an evidence folder is for.' },
      { type: 'h2', text: 'What "readiness" looks like in practice' },
      { type: 'ul', items: [
        'A draft of every user-facing AI disclosure surface on your site or product.',
        'A short internal note describing the AI system, its training and inference pipeline, and the human in the loop.',
        'An evidence tracker that names the people responsible for each surface so review is not a treasure hunt.',
        'A folder you can hand a lawyer or buyer without rebuilding it from scratch.',
      ] },
      { type: 'p', text: 'Readiness is not the same as a compliance certificate. Final compliance is a decision your counsel and your team make together. Documentation makes that decision faster.' },
    ],
  },
  {
    slug: 'ai-chatbot-disclosure-what-users-and-buyers-need',
    title: 'AI chatbot disclosure: what should users and buyers know?',
    description:
      'A short guide to AI chatbot disclosure language, where to place it, and what enterprise buyers expect to see during vendor review.',
    lede: 'Two audiences read your chatbot disclosure: the user and the procurement reviewer. Both deserve clear language.',
    published_at: '2025-08-22T09:00:00Z',
    tags: ['AI chatbot disclosure', 'AI disclosure', 'AI transparency'],
    reading_minutes: 4,
    sections: [
      { type: 'p', text: 'AI chatbot disclosure is the single most-asked-for surface during a B2B AI vendor review. The good news is that it is also one of the easiest to draft and keep current.' },
      { type: 'h2', text: 'Three things a user should know in one short paragraph' },
      { type: 'ol', items: [
        'They are interacting with an AI system, not a human, by default.',
        'The high-level scope of what the AI can and cannot help with.',
        'How to reach a human, if and when that is supported in the product.',
      ] },
      { type: 'h2', text: 'Three things a buyer wants to confirm separately' },
      { type: 'ol', items: [
        'Where the disclosure appears in the product (header, footer, settings, first-message).',
        'Whether the disclosure language has been reviewed and by whom.',
        'How the disclosure is updated when the chatbot capability changes.',
      ] },
      { type: 'h2', text: 'Sample disclosure language (for editing)' },
      { type: 'quote', text: 'You are chatting with an AI assistant. It can help with [scope]. It cannot help with [out-of-scope]. To reach a human, type "agent" or [link].', cite: 'Starter draft — adapt to your product before shipping.' },
      { type: 'h2', text: 'What to avoid' },
      { type: 'ul', items: [
        'Hiding the disclosure inside a long terms of service. Buyers will notice.',
        'Using broad outcome promises instead of specific disclosure and review language.',
        'Pretending the AI cannot make mistakes. Saying that out loud reduces user surprise and lawyer concern.',
      ] },
    ],
  },
  {
    slug: 'ai-agency-client-handoff',
    title: 'How AI agencies can hand off client projects with better governance notes',
    description:
      'A short playbook for AI agencies and automation studios to add a governance handoff folder to every chatbot, agent, and workflow client project.',
    lede: 'The AI build is fast. The trust artefacts are not. Closing that gap is mostly process.',
    published_at: '2025-08-26T09:00:00Z',
    tags: ['AI agency client handoff', 'AI agency documentation', 'AI workflow documentation'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'AI agencies build chatbots, agents, and automations quickly. The handoff package — what the client team will use to defend the system to their procurement, security, and legal stakeholders — is usually the slow part. Most of that lag is process, not work, and it is fixable.' },
      { type: 'h2', text: 'What a "governance handoff" looks like' },
      { type: 'p', text: 'A short folder, attached to the project deliverable, that lets the client team answer the obvious questions in the first 30 days post-launch without coming back to you for every one.' },
      { type: 'ul', items: [
        'Client AI use summary — what we built, what data it uses, where users see AI output.',
        'Disclosure drafts — chatbot or assistant disclosure language placed at the right surfaces.',
        'Workflow documentation — the AI steps, the human steps, the failure mode behaviour.',
        'Evidence tracker — what we said in the project, where it lives, who owns updates.',
        'Internal handoff note — three to five sentences your client champion can quote when asked.',
        'Open questions — the things their lawyer or buyer might raise that they should be ready for.',
      ] },
      { type: 'h2', text: 'Why this protects you, the agency' },
      { type: 'p', text: 'When something looks ambiguous to the client team six weeks after launch, they will reach for the handoff document before they reach for you. That changes the conversation from "your AI broke our review process" to "let me check what the doc says first."' },
      { type: 'h2', text: 'Where TrustFolder fits' },
      { type: 'p', text: 'The Agency Pack adapts the Buyer-Ready AI Governance Folder for repeatable client delivery. You bring the project context; we draft the documents. Drafts are for review and adaptation by you and your client.' },
    ],
  },
  {
    slug: 'enterprise-buyer-ai-readiness',
    title: 'What to prepare before an enterprise buyer asks about your AI system',
    description:
      'A pre-meeting checklist for B2B AI startups to prepare the AI use summary, disclosures, governance notes, and evidence the procurement team will ask for.',
    lede: 'The questions are predictable. The answers should be too.',
    published_at: '2025-08-29T09:00:00Z',
    tags: ['AI buyer due diligence', 'enterprise AI vendor review', 'AI procurement'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'When a mid-market or enterprise buyer engages with a B2B AI product, their procurement and legal teams ask a recognisable set of questions. The answers do not need to be elaborate. They do need to exist before the meeting.' },
      { type: 'h2', text: 'The pre-meeting checklist' },
      { type: 'ol', items: [
        'AI use summary — what the AI does in your product, in plain English, in under 200 words.',
        'AI disclosure surfaces — links to the chatbot disclosure, AI content notice, and system disclosure page.',
        'Governance summary — who reviews AI outputs, who owns updates, what the human-in-the-loop looks like.',
        'Evidence tracker — for every claim your website makes about AI, where the supporting evidence lives.',
        'Risk and scope notes — what your AI does not do, especially in the higher-risk areas.',
        'Open questions — the things you have not finalised yet, written down so the buyer is not the first to find them.',
      ] },
      { type: 'h2', text: 'What the buyer is actually evaluating' },
      { type: 'p', text: 'Whether your team can describe its own AI in stable, internally-consistent language. The procurement team is not looking for certifications most of the time. They are looking for signs that the founder, the engineer, and the marketing site agree with each other.' },
      { type: 'h2', text: 'A small move that pays off' },
      { type: 'p', text: 'Send the buyer a one-page AI use summary one business day before the meeting. It removes the awkward first 15 minutes of "tell me what you do" and reframes the conversation around their actual concerns.' },
    ],
  },
  {
    slug: 'ai-disclosure-page-examples',
    title: 'AI disclosure page examples: what to include and what to avoid',
    description:
      'Practical patterns for writing an AI disclosure page that reads well to both end users and procurement reviewers, plus the patterns that get flagged.',
    lede: 'A short anatomy of a disclosure page that survives both an end-user and a procurement reviewer.',
    published_at: '2025-09-02T09:00:00Z',
    tags: ['AI disclosure page', 'AI transparency notice', 'AI product disclosure'],
    reading_minutes: 4,
    sections: [
      { type: 'h2', text: 'A useful disclosure page has six short sections' },
      { type: 'ol', items: [
        'What the AI does in our product (one paragraph).',
        'Where users see AI output (named surfaces, not abstract phrases).',
        'What data the AI uses to produce that output (sources at a high level).',
        'Where the human review sits (when, who, for which decisions).',
        'What the AI is not used for (the "out-of-scope" section).',
        'How users or partners can ask questions (a real email or contact form).',
      ] },
      { type: 'h2', text: 'Patterns that get flagged' },
      { type: 'ul', items: [
        'Broad legal outcome promises — too broad to be useful in buyer review.',
        '"No human review required." — almost never accurate, almost always concerning.',
        'Review-sounding labels without explaining the actual review. Empty signals.',
        'Disclosure language that contradicts the marketing copy two clicks away. Reviewers click around.',
      ] },
      { type: 'h2', text: 'Patterns that build trust' },
      { type: 'ul', items: [
        'Naming the specific AI surfaces — the chat, the suggestion ribbon, the auto-summary block.',
        'Showing the disclosure with a screenshot, so the reviewer sees the placement.',
        'Linking to a contact path that is monitored.',
        'Dating the page so reviewers know it is current.',
      ] },
    ],
  },
  {
    slug: 'ai-governance-checklist-small-saas',
    title: 'AI governance checklist for small AI SaaS teams',
    description:
      'A practical AI governance checklist for two-to-twenty person AI SaaS teams. Plain English, no certifications required to get started.',
    lede: 'A starter checklist for teams who do not yet have a dedicated governance role.',
    published_at: '2025-09-05T09:00:00Z',
    tags: ['AI governance checklist', 'ISO 42001 for startups', 'AI governance policy draft'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'You do not need an AI governance committee to get started. You need a small set of named decisions, written down, and a way to find them again.' },
      { type: 'h2', text: 'The starter checklist' },
      { type: 'ul', items: [
        'AI system inventory — every AI feature in the product, named, with a one-line purpose.',
        'Owner per feature — one person who can answer the obvious questions about it.',
        'AI disclosure surfaces — listed with their URLs or in-product locations.',
        'Human review touchpoints — where a human checks AI output and what triggers that review.',
        'Failure mode notes — what happens when the AI is wrong, slow, or unavailable.',
        'Update cadence — how often the disclosure language and inventory get reviewed.',
        'External handoff doc — the page you would send a lawyer or buyer if asked tomorrow.',
      ] },
      { type: 'h2', text: 'How this maps to ISO 42001 ideas' },
      { type: 'p', text: 'ISO 42001 is the AI management system standard. You are not certifying anything by writing this checklist. But the structure — inventory, owners, review cadence, evidence — is the same shape. Small teams that start here have less work to do later if certification ever becomes a real requirement.' },
      { type: 'callout', tone: 'info', title: 'Where TrustFolder fits', text: 'The Buyer-Ready AI Governance Folder includes drafts for the inventory, governance summary, and external handoff doc. Drafts are for review and adaptation by your team and counsel.' },
    ],
  },
  {
    slug: 'ai-buyer-due-diligence-documents',
    title: 'Buyer due diligence for AI products: documents founders should prepare',
    description:
      'The short list of documents that resolve most AI vendor due diligence questions before they become deal-blockers.',
    lede: 'The questions land in waves. The folder should already exist when the first wave arrives.',
    published_at: '2025-09-08T09:00:00Z',
    tags: ['AI buyer due diligence', 'AI vendor due diligence', 'AI procurement documents'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'AI buyer due diligence rarely arrives as a single email. It usually comes in three waves: the initial AI use questionnaire from the buyer\u2019s legal team, a follow-up from security, and a final clarifying request from a senior reviewer or external counsel.' },
      { type: 'h2', text: 'Wave one — the AI use questionnaire' },
      { type: 'ul', items: [
        'A 200-word AI use summary that names the surfaces where AI appears.',
        'Public disclosure pages or surfaces, linked.',
        'A statement of what the AI does not do, especially in higher-risk areas.',
      ] },
      { type: 'h2', text: 'Wave two — the security follow-up' },
      { type: 'ul', items: [
        'A short note on the AI training and inference pipeline at a high level.',
        'A statement about data flow into and out of the AI provider.',
        'The list of surfaces where users can opt out, if applicable.',
      ] },
      { type: 'h2', text: 'Wave three — the senior reviewer' },
      { type: 'ul', items: [
        'A handoff cover sheet that orients them in two minutes.',
        'An open-questions section that names the things you have not yet finalised.',
        'A 30-day next-step roadmap so they know what is already in motion.',
      ] },
      { type: 'h2', text: 'The folder pays for itself once' },
      { type: 'p', text: 'After the first deal where the folder removes a 10-day legal back-and-forth, no AI founder we have spoken to wants to ship the next one without a folder ready.' },
    ],
  },
  {
    slug: 'free-ai-templates-not-enough',
    title: 'Why free AI compliance templates are not enough for product-specific review',
    description:
      'Free AI policy and disclosure templates are a useful starting point. The reasons they get rejected at product-specific review are predictable.',
    lede: 'Templates remove the blank page. They do not pass review on their own.',
    published_at: '2025-09-12T09:00:00Z',
    tags: ['AI policy template', 'AI compliance template', 'AI disclosure template'],
    reading_minutes: 5,
    sections: [
      { type: 'p', text: 'A founder pasting a free AI policy template into their site is not making a mistake. They are doing the right first step. The next step — adapting that template to their actual product — is where most of the value, and most of the rejection at vendor review, sits.' },
      { type: 'h2', text: 'Why templates get flagged in review' },
      { type: 'ul', items: [
        'They describe a generic AI system, not your specific product surfaces.',
        'They use the same disclosure language across companies, which reviewers pattern-match against.',
        'They reference data flows, training pipelines, or human review steps that do not exist in your stack.',
        'They make claims that contradict your marketing copy.',
        'They use broad outcome promises that procurement teams now treat as warnings.',
      ] },
      { type: 'h2', text: 'What "product-specific review" actually means' },
      { type: 'p', text: 'A reviewer comparing your disclosure to your product. They click the chat, look at the settings page, read the marketing copy, and see whether the three sources agree. Generic templates almost never survive that pass.' },
      { type: 'h2', text: 'The smaller-than-it-sounds fix' },
      { type: 'p', text: 'The fix is not throwing the template away. It is layering a product-specific scan on top of it. Pull the AI claims your site already makes, confirm the few details that matter, and rewrite the template language so it points at your actual surfaces. That is the work TrustFolder does.' },
      { type: 'callout', tone: 'info', title: 'Try the free check', text: 'The free eligibility check scans your AI product website and returns a fit summary in under two minutes. No payment required.' },
    ],
  },
];
