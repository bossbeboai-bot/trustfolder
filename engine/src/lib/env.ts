/**
 * Centralized environment access. Throws clearly if a required var is missing.
 * Keep this the ONLY place we read process.env.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(
      `[trustfolder/engine] Missing required env var: ${name}. See engine/.env.example`,
    );
  }
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function optionalNumber(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  // AI provider switch
  aiProvider: (): 'anthropic' | 'ollama' =>
    optional('AI_PROVIDER', 'anthropic').toLowerCase() === 'ollama'
      ? 'ollama'
      : 'anthropic',

  // Anthropic (used when aiProvider() === 'anthropic')
  anthropicApiKey: () => required('ANTHROPIC_API_KEY'),
  anthropicModelPrimary: () =>
    optional('ANTHROPIC_MODEL_PRIMARY', 'claude-3-5-sonnet-20241022'),
  anthropicModelFallback: () =>
    optional('ANTHROPIC_MODEL_FALLBACK', 'claude-3-5-haiku-20241022'),

  // Ollama / Ollama-compatible (used when aiProvider() === 'ollama').
  // Key may be empty for local Ollama; only sent server-side when present.
  ollamaBaseUrl: () =>
    optional('OLLAMA_BASE_URL', 'http://localhost:11434').replace(/\/+$/, ''),
  ollamaApiKey: () => optional('OLLAMA_API_KEY', ''),
  ollamaModel: () => optional('OLLAMA_MODEL', 'qwen2.5:7b-instruct'),

  // Supabase
  supabaseUrl: () => required('SUPABASE_URL'),
  supabaseAnonKey: () => required('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseStorageBucket: () => optional('SUPABASE_STORAGE_BUCKET', 'deliveries'),

  // PayPal
  paypalClientId: () => required('PAYPAL_CLIENT_ID'),
  paypalClientSecret: () => required('PAYPAL_CLIENT_SECRET'),
  paypalWebhookId: () => required('PAYPAL_WEBHOOK_ID'),
  paypalEnv: (): 'sandbox' | 'production' =>
    optional('PAYPAL_ENV', 'sandbox') === 'production' ? 'production' : 'sandbox',
  paypalApiBase: (): string =>
    env.paypalEnv() === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com',

  // Email
  resendApiKey: () => required('RESEND_API_KEY'),
  resendFromEmail: () => optional('RESEND_FROM_EMAIL', 'hello@trustfolder.com'),
  resendReplyTo: () => optional('RESEND_REPLY_TO', 'hello@trustfolder.com'),

  // App
  appBaseUrl: () => optional('APP_BASE_URL', 'http://localhost:3000'),
  appName: () => optional('APP_NAME', 'TrustFolder'),

  // Templates
  templatesDir: () => optional('TEMPLATES_DIR', '../templates'),

  // Crawler
  crawlerTimeoutMs: () => optionalNumber('CRAWLER_TIMEOUT_MS', 12_000),
  crawlerUserAgent: () =>
    optional(
      'CRAWLER_USER_AGENT',
      'TrustFolderBot/0.1 (+https://trustfolder.com/bot)',
    ),

  // Generation
  generationMaxRetries: () => optionalNumber('GENERATION_MAX_RETRIES', 1),
  qaMinScore: () => optionalNumber('QA_MIN_SCORE', 80),
  signedUrlTtlSeconds: () => optionalNumber('SIGNED_URL_TTL_SECONDS', 604_800), // 7 days

  // Founder alert channel (optional). Set to a Slack incoming-webhook URL or
  // any JSON receiver. Empty string = disabled; alerts silently no-op.
  alertWebhookUrl: () => optional('ALERT_WEBHOOK_URL', ''),
};
