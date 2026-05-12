# 22 — Output Pack Experience

Status: planning artifact. No code changes flow from this document.
Owns: the evidence pack itself — folder layout, file specs, confidence bands, source notes, review notes, next actions, delivery format.
Companion: `docs/20-product-ux-blueprint.md` §6 for the cross-cutting summary; `docs/23-email-and-status-flow.md` for delivery emails.

Hard rule: every paid pack delivered after launch must conform to this spec. Any deviation must be tracked as a documented exception in `docs/24-pack-exceptions.md` (to be created as needed).

---

## 0 — Reading guide

This doc is the contract for what gets delivered. It is intentionally pedantic.

- §1 sets the canonical folder layout (Tier 3 target).
- §2 describes each folder's purpose.
- §3 specs every file: purpose, where the user uses it, confidence band, source notes, review note, next action.
- §4 specs the README.md.
- §5 specs the next-steps-roadmap.md.
- §6 specs the per-tier subset (Tier 1 / Tier 2 / Tier 3 / Enterprise).
- §7 specs file formats, naming, and the manifest.
- §8 specs confidence bands and how they are assigned.
- §9 specs source-note format.
- §10 specs delivery (zip vs single PDF, email link, signed URL, dashboard surfacing).
- §11 specs QA gates the pack must pass before delivery.
- §12 lists known gaps and pending work.

---

## 1 — Canonical folder layout (Tier 3 target)

```
TrustFolder Evidence Pack/
├─ README.md
├─ 01-disclosures/
│   ├─ 01-chatbot-disclosure.md
│   ├─ 02-ai-generated-content-notice.md
│   ├─ 03-ai-system-disclosure-page.md
│   └─ 04-placement-guide.md
├─ 02-governance/
│   ├─ 01-ai-system-inventory.md
│   ├─ 02-governance-policy-draft.md
│   ├─ 03-risk-notes.md
│   └─ 04-internal-transparency-summary.md
├─ 03-evidence/
│   ├─ 01-evidence-tracker.md
│   ├─ 02-third-party-models-vendor-list.md
│   ├─ 03-data-handling-summary.md
│   └─ 04-website-scan-snapshot.md
├─ 04-buyer-legal-handoff/
│   ├─ 01-lawyer-review-checklist.md
│   ├─ 02-buyer-questionnaire-answers-template.md
│   └─ 03-handoff-cover-note.md
├─ 05-source-notes/
│   ├─ 01-source-citations.md
│   ├─ 02-confirmed-answers.md
│   └─ 03-model-rationale.md
└─ next-steps-roadmap.md
```

Every file is markdown by default, plus a single rendered PDF of `README.md` for the customer who only opens one file. Tier 1 ships as a single PDF (see §6.1).

---

## 2 — Folder purposes

- **`01-disclosures/`** — drafts the customer can adapt and place on their site, in their chat product, in their privacy policy, or in their docs.
- **`02-governance/`** — internal governance artifacts: inventory of AI systems, policy draft, internal transparency note, risk notes.
- **`03-evidence/`** — supporting evidence: tracker, vendor / third-party model list, data handling summary, scan snapshot.
- **`04-buyer-legal-handoff/`** — the bundle a founder hands to either a buyer's procurement / legal review or to their own lawyer.
- **`05-source-notes/`** — full transparency on where every claim in the pack came from.
- **`next-steps-roadmap.md`** — a concrete 30-day list of what to do next, grouped by priority.

The numerical prefixes are intentional: they force a stable reading order in any file explorer or zip viewer.

---

## 3 — Per-file spec

For every file: purpose / where used / confidence band rules / source notes content / review note / next action. All files end with the same disclaimer footer (see §3.18).

### 3.1 `01-disclosures/01-chatbot-disclosure.md`

- **Purpose**: short notice the customer can place at the top of an embedded chat or assistant explaining that the user is interacting with AI.
- **Where used**: chat header, modal first-message, bot welcome text, chat onboarding.
- **Confidence band**: High when scan found a chat widget AND `ai_user_interaction = direct chat`; Medium otherwise; Low when interaction type is unclear.
- **Source notes**: scan-page citation that prompted inclusion; user-confirmed `ai_feature_type` and `ai_user_interaction`.
- **Review note**: lawyer should check tone vs market norms, alignment with EU AI Act Article 50 transparency obligations (interpretation only — not legal advice).
- **Next action**: paste into chat product copy and test on a logged-out session.

### 3.2 `01-disclosures/02-ai-generated-content-notice.md`

- **Purpose**: disclosure to attach to AI-generated content (text, summaries, images, video).
- **Where used**: any UI surface that surfaces generated output; export / share flows.
- **Confidence band**: High when feature includes content generation; Medium when summarisation only; Low when no content surface in scan.
- **Source notes**: scan citation of generated-content surface; confirmed `ai_feature_type`.
- **Review note**: confirm jurisdictional language for EU users; align with brand voice.
- **Next action**: attach as caption, hover, or footer to generated artifacts.

### 3.3 `01-disclosures/03-ai-system-disclosure-page.md`

- **Purpose**: a "How we use AI" page draft for the customer's marketing or trust site.
- **Where used**: `/ai`, `/trust`, `/transparency`, or footer link.
- **Confidence band**: High when product has clear AI claims found in scan; Medium otherwise.
- **Source notes**: scan-page list of AI claim sources; confirmed product description.
- **Review note**: align with privacy policy and terms; check that vendor names match contractual usage.
- **Next action**: publish under `/ai` or `/trust`; link from footer and product onboarding.

### 3.4 `01-disclosures/04-placement-guide.md`

- **Purpose**: tells the customer **where** each disclosure should live across their product surface area.
- **Where used**: product copy review, marketing review, eng implementation ticket.
- **Confidence band**: High (this is a guide, not a draft).
- **Source notes**: which scan signals or confirmed answers drove each placement recommendation.
- **Review note**: confirm placement matches the product's information architecture.
- **Next action**: convert to engineering tickets per surface.

### 3.5 `02-governance/01-ai-system-inventory.md`

- **Purpose**: a single table of every AI capability the product ships, with its model, vendor, data, oversight, intended use, prohibited use.
- **Where used**: internal record; buyer due diligence; lawyer review.
- **Confidence band**: High for items the customer confirmed; Medium for items inferred from scan.
- **Source notes**: confirmed `third_party_models`, `ai_feature_type`, scan signals per capability.
- **Review note**: customer should add any internal-only AI use we couldn't see from the website.
- **Next action**: review with engineering, fill any gaps, mark as "internal final" once aligned.

### 3.6 `02-governance/02-governance-policy-draft.md`

- **Purpose**: short policy doc covering responsible use, oversight, incident handling, vendor selection.
- **Where used**: internal handbook; buyer review pack.
- **Confidence band**: Medium by default (drafted from confirmed answers; needs human ownership).
- **Source notes**: confirmed answers about `human_oversight`, `has_incident_response`.
- **Review note**: assign an owner, set a review cadence.
- **Next action**: assign owner, schedule next review.

### 3.7 `02-governance/03-risk-notes.md`

- **Purpose**: enumerate the risks TrustFolder identified, with severity and mitigation suggestion.
- **Where used**: internal review; buyer questionnaire support.
- **Confidence band**: High for scan-derived risks (we saw it); Medium for inferred risks; Low when based only on vertical heuristics.
- **Source notes**: scan citations and confirmed-answer triggers per risk.
- **Review note**: customer should add risks we cannot see (internal pipelines, training data sources).
- **Next action**: assign owners and target dates.

### 3.8 `02-governance/04-internal-transparency-summary.md`

- **Purpose**: one-pager team members can read to understand how AI is used and what they should and shouldn't say externally.
- **Where used**: internal onboarding; sales enablement; support team.
- **Confidence band**: High.
- **Source notes**: derived from inventory + product description.
- **Review note**: confirm voice matches sales / support messaging.
- **Next action**: post to internal handbook; reference in onboarding.

### 3.9 `03-evidence/01-evidence-tracker.md`

- **Purpose**: a checklist mapping each disclosure / governance artifact to a status (drafted / placed / live / reviewed).
- **Where used**: internal project tracker; buyer-review evidence; QA reference.
- **Confidence band**: High (it is a status doc, not a substantive draft).
- **Source notes**: links every row to the file that produced it.
- **Review note**: convert to a tracker tool (Linear, Notion, Asana) once stable.
- **Next action**: assign each row to an owner.

### 3.10 `03-evidence/02-third-party-models-vendor-list.md`

- **Purpose**: list of third-party AI vendors / model APIs in use, with contractual notes.
- **Where used**: buyer due diligence, vendor management.
- **Confidence band**: High for items confirmed by user; Medium for items inferred.
- **Source notes**: confirmed `third_party_models`, scan citations of vendor mentions.
- **Review note**: confirm the contract type, region, data-handling terms with each vendor.
- **Next action**: collect DPAs / sub-processor lists per vendor.

### 3.11 `03-evidence/03-data-handling-summary.md`

- **Purpose**: short summary of how the product handles data passing through AI features.
- **Where used**: privacy review; buyer questionnaire.
- **Confidence band**: Medium by default; promoted to High when customer attaches a DPA copy in the Enterprise tier.
- **Source notes**: confirmed `processes_personal_data`, `data_subject_categories`, `ai_training_data_sources`.
- **Review note**: align with privacy policy.
- **Next action**: pair with privacy team or external counsel.

### 3.12 `03-evidence/04-website-scan-snapshot.md`

- **Purpose**: archived summary of the scan that informed this pack: pages crawled, AI signals found, key quotes.
- **Where used**: provenance, future re-scans.
- **Confidence band**: High (factual record of what was scanned).
- **Source notes**: scan-page list + URLs + timestamp.
- **Review note**: regenerate after major site copy changes.
- **Next action**: re-scan if the website has been updated significantly.

### 3.13 `04-buyer-legal-handoff/01-lawyer-review-checklist.md`

- **Purpose**: short, ordered list of items a lawyer should specifically check across the pack.
- **Where used**: scoping conversation with external counsel.
- **Confidence band**: High (it's a checklist).
- **Source notes**: each item points to the pack file it covers.
- **Review note**: customer should add any contracts / agreements they want reviewed alongside.
- **Next action**: send with the pack to outside counsel.

### 3.14 `04-buyer-legal-handoff/02-buyer-questionnaire-answers-template.md`

- **Purpose**: pre-filled answer drafts for common buyer security / compliance questionnaires (excluding certifications we don't have).
- **Where used**: enterprise sales pursuits.
- **Confidence band**: Medium by default.
- **Source notes**: derived from inventory + governance + risk notes.
- **Review note**: do not represent any answer as a certification we have not earned.
- **Next action**: customise per buyer questionnaire received.

### 3.15 `04-buyer-legal-handoff/03-handoff-cover-note.md`

- **Purpose**: short cover note the founder can paste in an email to a buyer or lawyer that explains what is in the pack and how to read it.
- **Where used**: outbound email to buyer or external counsel.
- **Confidence band**: High.
- **Source notes**: derived from README; no claims beyond what's in the pack.
- **Review note**: confirm the recipient's name and current ask before sending.
- **Next action**: send with the pack as an attachment.

### 3.16 `05-source-notes/01-source-citations.md`

- **Purpose**: every URL / page that fed into the pack, listed once.
- **Where used**: provenance audit, customer review of "where did this come from".
- **Confidence band**: High.
- **Source notes**: this *is* the source notes.
- **Review note**: re-pull if the website has been substantially rewritten.
- **Next action**: archive alongside the pack.

### 3.17 `05-source-notes/02-confirmed-answers.md`

- **Purpose**: the user's confirmation answers, including edits made vs the extracted values.
- **Where used**: provenance, regulatory / buyer audit trail.
- **Confidence band**: High.
- **Source notes**: timestamps, edit history.
- **Review note**: refresh when answers change.
- **Next action**: archive alongside the pack.

### 3.18 `05-source-notes/03-model-rationale.md`

- **Purpose**: the AI's reasoning for the major drafts: why this paragraph, why this risk, why this confidence band.
- **Where used**: optional, transparency-oriented buyers; internal QA.
- **Confidence band**: Medium.
- **Source notes**: per-section rationale tied to scan + answers.
- **Review note**: optional; redact if the customer prefers.
- **Next action**: use during internal review of the pack.

### 3.19 Universal disclaimer footer (every file)

```
---
This document is an AI-generated draft for review. It is not legal advice, not certification,
and not a compliance guarantee. Confirm with qualified counsel before relying on any element
in regulatory, contractual, or buyer-review contexts.
```

---

## 4 — `README.md` spec

The README is the single most-read file in the pack. It must answer, in order:

1. **What this pack is** — one paragraph, plain language.
2. **What this pack is not** — the disclaimer paragraph (no legal advice / certification / guarantee).
3. **How to read it** — short tour of the folder structure with one-line descriptions.
4. **What was generated for you** — bullet list of every file, grouped by folder, with confidence band per file.
5. **Recommended next steps** — short pointer to `next-steps-roadmap.md`.
6. **How to refresh this pack** — rescan instructions and link to upgrade / request-review path.
7. **How to ask for help** — contact email; SLA expectation.

The README must be both rendered as PDF (for one-click "open the pack") and present as `README.md` in the zip.

---

## 5 — `next-steps-roadmap.md` spec

A pragmatic 30-day plan, grouped by week:

- **Week 1 — Place disclosures.** Concrete actions: chat header text, AI-generated-content notice, footer link to `/ai` page.
- **Week 2 — Internalise governance.** Owner assignments, internal one-pager publication, vendor DPA collection.
- **Week 3 — Buyer / lawyer handoff.** Send pack to counsel, pre-fill buyer questionnaires.
- **Week 4 — Refresh + monitor.** Re-scan after copy changes, schedule next governance review.

Each task carries: owner, expected effort (XS/S/M/L), priority (must / should / nice).

---

## 6 — Per-tier subsets

### 6.1 Tier 1 — AI Website Trust Snapshot

- **Format**: single PDF, no folder, no zip.
- **Contents**:
  - Cover (title, scan date, customer name).
  - Website scan summary.
  - AI product overview.
  - Likely disclosure areas.
  - Readiness result (ready / draft-needed / expert-review-needed).
  - Next steps (3–5 bullets).
  - Disclaimer footer.
- **Pending**: snapshot.ts pipeline, single-PDF assembly, and Tier 1 routing are not yet implemented. Until they are, Tier 1 should remain marked "expected pending" in the smoke-test logs and request flow language should not promise instant delivery.

### 6.2 Tier 2 — AI Disclosure Pack

- **Format**: zip.
- **Contents**:
  - `README.md` + rendered PDF.
  - `01-disclosures/` (all four files).
  - `02-internal-summary/` — single file: `01-internal-transparency-summary.md`.
  - `03-legal-review/` — single file: `01-lawyer-review-checklist.md`.
  - `next-steps-roadmap.md` (Tier 2 scoped: weeks 1–2 only).
  - `05-source-notes/` (full).

Tier 2 omits `02-governance/`, `03-evidence/`, `04-buyer-legal-handoff/buyer-questionnaire-answers-template.md`, and `04-buyer-legal-handoff/handoff-cover-note.md`.

### 6.3 Tier 3 — Buyer-Ready AI Governance Folder

- **Format**: zip.
- **Contents**: full canonical layout from §1.

### 6.4 Enterprise Buyer Handoff

- **Format**: zip + Loom link + scheduled call.
- **Contents**: Tier 3 zip, plus:
  - `06-handoff-recording/loom-link.txt` — link to the recorded walkthrough.
  - `06-handoff-recording/transcript.md` — auto-transcribed walkthrough.
  - `07-revision-log/01-revision-notes.md` — the customer's requested edits and what changed in the pack.

---

## 7 — File formats, naming, manifest

### 7.1 Naming

- Every file is markdown except the rendered README PDF and the Tier 1 single PDF.
- File names are lowercase kebab-case, prefixed with two-digit ordering inside their folder (`01-`, `02-`, …).
- Folder names are lowercase kebab-case, prefixed with two-digit ordering at the root (`01-disclosures/`, `02-governance/`, …).

### 7.2 Manifest

Every pack ships a `manifest.json` at the top level (alongside README.md) with:

```
{
  "pack_id": "...",
  "tier": "tier_3",
  "generated_at": "ISO-8601",
  "scan_id": "...",
  "assessment_id": "...",
  "order_id": "...",
  "files": [
    {
      "path": "01-disclosures/01-chatbot-disclosure.md",
      "purpose": "...",
      "confidence": "High",
      "sources": [
        { "type": "scan", "url": "...", "snippet": "..." },
        { "type": "answer", "field": "ai_feature_type", "value": "chatbot" }
      ]
    },
    ...
  ],
  "qa": {
    "verdict": "pass",
    "checks": ["forbidden_phrases", "source_citations", "vertical_guardrails", "confidence_floor"]
  }
}
```

The manifest powers the customer dashboard's pack tab (doc 21 §4) and the source-notes tab (§8).

### 7.3 Encoding

- All markdown files UTF-8 with LF line endings.
- All PDFs rendered with the brand fonts from `docs/14-DESIGN.md`.
- All zips deterministic-ordered (alphabetical) so re-deliveries diff cleanly.

---

## 8 — Confidence bands

Every file carries one of: **High**, **Medium**, **Low**.

Assigned by the generator based on:

- **Scan grounding**: did the scan find supporting language for the claim? Direct citation = High; indirect = Medium; none = Low.
- **Answer grounding**: did the user confirm a relevant answer? Yes, with no edit = High; yes, with edit = Medium; declined / unknown = Low.
- **Vertical heuristic only**: claim derived purely from vertical category (e.g. "you're in dev tools, so likely no health data") = capped at Medium.

If the generator cannot reach Medium for a required file, the QA gate fails that pack and the pack is not delivered until either a manual draft replaces it (Enterprise) or the user is asked for the missing answer.

---

## 9 — Source-note format

Every claim in every draft must trace to one or more of:

```
[scan: https://example.com/about — "We use AI to summarise meetings."]
[answer: ai_feature_type = "summarisation" (confirmed, not edited)]
[rationale: vertical=productivity + summarisation feature → no high-risk gate triggered]
```

Source notes are inlined per-paragraph in the `05-source-notes/03-model-rationale.md` file and aggregated per-file in the manifest.

---

## 10 — Delivery

### 10.1 Tier 1 (Snapshot)

- Email contains: subject "Your TrustFolder Snapshot for {company_name}", body with one-paragraph summary, single PDF attachment OR signed download URL (TTL 7 days, re-issuable).
- `/success/[orderId]` shows the same download.

### 10.2 Tier 2 / Tier 3

- Email contains: subject "Your TrustFolder Evidence Pack is ready", body with link to download zip (TTL 7 days, re-issuable).
- `/success/[orderId]` shows the same download.
- Customer dashboard (when built) surfaces the pack in the Pack / Disclosures / Governance tabs from the manifest.

### 10.3 Enterprise

- Email contains: subject "Your TrustFolder Enterprise Handoff is ready", body with download link, Loom link, and a scheduled call slot.
- Founder must sign off in the admin Failed Jobs / Generated Packs tabs before the email goes out.

### 10.4 Storage

- Deliveries land in the `deliveries` bucket inside Supabase storage.
- Signed URLs are issued per-recipient with a 7-day TTL; reissuance writes a new `email_events` row.
- Old signed URLs are not actively invalidated for the customer (server-side rotation only) to avoid breaking active downloads, but reissuance is logged.

---

## 11 — Pack QA gates

Every pack must pass all of these before delivery:

1. **Forbidden phrases**: zero hits on the prohibited language list (see `docs/20-product-ux-blueprint.md` §11).
2. **Source citation coverage**: every required claim resolves to at least one source-note entry.
3. **Confidence floor**: no required file at confidence Low; if any are Low, the pack is rejected and the order moves to `failed_needs_retry`.
4. **Vertical guardrails**: assessments tagged HIGH-risk vertical never auto-deliver, regardless of band; founder review required.
5. **Manifest validity**: the manifest JSON validates against the schema in §7.2.

QA results are written to `qa_results` and surfaced to the founder dashboard's QA tab (doc 21 §19).

---

## 12 — Known gaps and pending work

- **Tier 1 (Snapshot)**: pipeline (`snapshot.ts`) not yet implemented. Single-PDF assembly, Tier 1 routing, and Tier 1 delivery email are pending. Smoke test B remains EXPECTED_PENDING until shipped.
- **Manifest writer**: the engine currently does not emit a per-file manifest. Generator and QA need to be updated together to enforce §7.2 and §11.5.
- **Source-note inlining**: model-rationale tagging exists per assessment but is not yet inlined in pack files. Required before Tier 3 launch.
- **Enterprise revision log**: no UX yet for capturing Enterprise edits; planned for the Enterprise launch wave.

These are tracked in `progress.txt` and `docs/20-product-ux-blueprint.md` §12.2.

---

## 13 — Acceptance criteria

A new developer, given this doc plus 20/21/23, must be able to:

- Generate a Tier 2 or Tier 3 pack that conforms to §1, §3, §4, §5, §7, §11.
- Produce a Tier 1 PDF when the snapshot pipeline is wired, conforming to §6.1.
- Implement the QA gate exactly as §11 specifies, with each check independently testable.
- Surface the pack in the customer dashboard tabs (doc 21 §§4–9) by reading only the manifest.
- Recover from a failed pack via the admin dashboard's Failed Jobs tab (doc 21 §20).
