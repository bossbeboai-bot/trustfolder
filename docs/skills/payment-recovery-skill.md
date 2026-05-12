---
description: Use when a customer paid but no pack arrived, a PayPal webhook missed, a capture failed, or an order is stuck in any non-terminal state for >30 minutes.
---

# Payment Recovery Skill

## When to use this skill

- Customer email: *"I paid but never got my pack"*
- Order is stuck in `payment_completed` / `generation_started` / `qa_started` / `package_created` for >30 minutes
- PayPal webhook returned non-2xx (look in Vercel logs)
- `paypal_capture_id` is null but `payment_status` says `completed`
- A duplicate webhook fired and you need to verify idempotency held
- Refund failed to issue on out-of-scope auto-rejection

## Reference docs

- Failure recovery: `docs/10-world-class-product-standards.md` §8
- Pipeline orchestration: `docs/05-tech-architecture.md`
- Code: `engine/src/paypal.ts`, `engine/src/pipeline.ts`, `engine/src/order-status.ts`, `app/app/api/paypal/*`

## Procedure

1. **Locate the order.** Use the customer's email or the PayPal `custom_id` (which is our `order.id`).
   ```sql
   select id, status, payment_status, paypal_order_id, paypal_capture_id,
          retry_count, last_error, last_error_at, created_at, paid_at
   from orders where email = $1 order by created_at desc;
   ```
2. **Check the status timeline.**
   ```sql
   select from_status, to_status, actor, metadata, created_at
   from order_status_events where order_id = $1 order by created_at;
   ```
   The `actor` field tells you whether the webhook fired, the manual capture endpoint fired, or the pipeline reached a step.
3. **Diagnose by current state:**
   - **`payment_pending` + paypal_order_id set** — capture didn't fire. Run manual capture (`POST /api/paypal/capture { order_id }`).
   - **`payment_completed` + no `generation_started` event** — pipeline never started. Re-fire: `runPipeline({ order_id, is_retry: true })`.
   - **`generation_started` for >10 min** — Vercel timeout likely killed the function. Re-fire `runPipeline({ order_id, is_retry: true })`. *Doc 11 §7 — switch to Inngest before this becomes systemic.*
   - **`qa_started` / `qa_passed` / `package_created` for >5 min** — same fix; pipeline is idempotent on a fresh `generation_run`.
   - **`failed_needs_retry`** — read `last_error`, fix root cause if non-transient (e.g., bad template), then `runPipeline({ order_id, is_retry: true })`.
   - **`delivered` but customer says no email** — check `email_events` for the order; verify Resend bounce/spam status; resend manually if needed (`POST /api/admin/retry-email` once admin tools land).
4. **Verify webhook idempotency** for duplicate-webhook reports:
   - Replay the same `PAYMENT.CAPTURE.COMPLETED` event from PayPal's webhook simulator.
   - Confirm the second call returns `{ status: 'already_processed' }` and no second pipeline run started (no second `generated_pack_id` for the order).
5. **Communicate calmly with the customer.**
   - Default reply template: *"Sorry for the delay — I can see your payment came through, and I've manually nudged the generation. You should receive your pack within 10 minutes. If not, I'll personally send it. — [founder]"*
   - **Never** say "the system is broken" or "we had an outage" unless it's true and you can be specific.
6. **If the pack truly cannot be generated** (e.g., template corruption + can't fix in 30 min):
   - Issue a refund: `refundCapture(paypal_capture_id, "TrustFolder generation failed; full refund issued")`.
   - Send the refund-explanation email.
   - Move the order to `out_of_scope` (terminal) so it doesn't show up in pipeline retries.
   - Open a postmortem note in `progress.txt`.

## Anti-patterns

- **Marking the order delivered without re-running the pipeline** — the customer doesn't have the pack; status lying.
- **Re-running the pipeline without setting `is_retry: true`** — clobbers the prior `generation_run` and breaks audit trail.
- **Manually sending a generic email instead of the proper delivery email** — skips the signed-URL refresh and the email_events log.
- **Issuing a partial refund** — Tier 1/2/3 are atomic deliverables; either deliver or full refund. No middle ground in v1.
- **Skipping `markFailed`** when a real failure happens — the order needs to land in `failed_needs_retry` so admin tools (and future Inngest retry policies) can find it.
- **Pretending the webhook is the only path** — the manual capture endpoint at `/api/paypal/capture` exists exactly for this skill; use it.

## Definition of done

- Order is in a terminal state: `delivered` (success) OR `out_of_scope` (refund issued) OR explicitly `failed_needs_retry` with a clear `last_error` for human follow-up.
- Customer has been emailed with the truth (delivered pack, refund explanation, or "we're working on it").
- `order_status_events` shows the recovery action with `actor: 'admin.recovery'` for audit.
- No double-charge and no double-generation.
- If a systemic cause was found (Vercel timeout, Resend bounce pattern, etc.), it's logged in `progress.txt` for the next iteration.
