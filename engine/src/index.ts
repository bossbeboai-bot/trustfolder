/**
 * Engine public surface.
 * Re-exports the modules consumed by Next.js API routes.
 */

export * from './lib/types.js';
export { env } from './lib/env.js';
export { service, publicAnon } from './lib/supabase.js';

export { crawl } from './crawler.js';
export { extract } from './extract.js';
export { scopeCheck } from './scope-check.js';
export { classify } from './classify.js';
export { generate } from './generate.js';
export { qa } from './qa.js';
export { buildPack } from './package.js';
export {
  deliverPack,
  sendOrderConfirmation,
  sendRetryNotice,
  sendOutOfScopeRefund,
  sendRequestReceived,
  sendPaymentFailed,
} from './deliver.js';
export { createRequest } from './requests.js';
export type { CreateRequestInput, RequestRow, RequestStatus } from './requests.js';
export { sendCustomerMagicLink } from './customer-mail.js';
export type { SendCustomerMagicLinkInput } from './customer-mail.js';
export { notifyFounder } from './lib/alert.js';
export {
  createPaypalOrder,
  capturePaypalOrder,
  verifyWebhookSignature,
  refundCapture,
  priceCentsForTier,
  tierLabel,
} from './paypal.js';
export { transition, markFailed, STATUS_LABELS } from './order-status.js';
export { runPipeline } from './pipeline.js';
export {
  runSnapshot,
  renderSnapshotMarkdown,
} from './snapshot.js';
export type { RunSnapshotInput, RunSnapshotOutput } from './snapshot.js';
export { computeReadinessScore } from './readiness-score.js';
export type {
  ReadinessScore,
  ReadinessBand,
  ReadinessDimension,
  ReadinessDimensionKey,
  ReadinessInput,
} from './readiness-score.js';
export {
  buildOpenReviewItems,
  renderOpenReviewItemsMarkdown,
} from './open-review-items.js';
export type {
  OpenReviewItem,
  OpenReviewCategory,
  OpenReviewPriority,
} from './open-review-items.js';
export {
  buildBuyerReviewPacket,
} from './buyer-review-packet.js';
export type { BuyerReviewPacketInput } from './buyer-review-packet.js';
