/**
 * AI client wrapper.
 *
 * Supports two providers, selected by env.aiProvider():
 *  - 'anthropic' (default): Claude via @anthropic-ai/sdk
 *  - 'ollama': Ollama or any Ollama-compatible OpenAI-style /v1/chat/completions
 *    endpoint. Local Ollama needs no API key; hosted endpoints can supply one
 *    via OLLAMA_API_KEY which is sent server-side as `Authorization: Bearer ...`.
 *    Keys are never logged and never exposed to the client.
 *
 * Public surface (unchanged for callers):
 *  - completion(): structured text completion with one transient retry and,
 *    for Anthropic, a fallback to the cheaper model.
 *  - jsonCompletion(): convenience wrapper that parses JSON output safely.
 *  - estimateCostCents(): rough Anthropic cost from usage counts (Ollama = 0).
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from './env.js';

let _client: Anthropic | null = null;

export function claude(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: env.anthropicApiKey() });
  return _client;
}

// Approx pricing as of 2024-10 (in cents per 1M tokens). Update as Anthropic changes prices.
const MODEL_PRICING: Record<string, { in: number; out: number }> = {
  'claude-3-5-sonnet-20241022': { in: 300, out: 1500 }, // $3/M in, $15/M out
  'claude-3-5-haiku-20241022': { in: 80, out: 400 }, // $0.80/M in, $4/M out
};

export interface CompletionInput {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
  model?: string;
}

export interface CompletionOutput {
  text: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  api_cost_cents: number;
  duration_ms: number;
}

/**
 * Run a completion against the configured AI provider.
 * Anthropic: one transient retry on the primary model, then fall back to the
 * cheaper Anthropic model if allowed.
 * Ollama: one transient retry on the same model (no cross-model fallback).
 */
export async function completion(
  input: CompletionInput,
  options?: { allowFallback?: boolean },
): Promise<CompletionOutput> {
  if (env.aiProvider() === 'ollama') {
    return ollamaCompletion(input, options);
  }
  const allowFallback = options?.allowFallback ?? true;
  const primary = input.model ?? env.anthropicModelPrimary();
  const fallback = env.anthropicModelFallback();
  const start = Date.now();

  const attempt = async (model: string): Promise<CompletionOutput> => {
    const res = await claude().messages.create({
      model,
      max_tokens: input.max_tokens ?? 4_000,
      temperature: input.temperature ?? 0.2,
      system: input.system,
      messages: input.messages,
    });
    const textBlock = res.content.find((b) => b.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '';
    const usage = res.usage;
    return {
      text,
      model: res.model,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      api_cost_cents: estimateCostCents(model, usage.input_tokens, usage.output_tokens),
      duration_ms: Date.now() - start,
    };
  };

  try {
    return await attempt(primary);
  } catch (err) {
    const transient = isTransientError(err);
    if (transient) {
      // single retry on the same model
      try {
        return await attempt(primary);
      } catch (err2) {
        if (allowFallback && primary !== fallback) {
          return attempt(fallback);
        }
        throw err2;
      }
    }
    if (allowFallback && primary !== fallback) {
      return attempt(fallback);
    }
    throw err;
  }
}

export async function jsonCompletion<T = unknown>(
  input: CompletionInput,
): Promise<{ result: T; raw: CompletionOutput }> {
  // No native JSON mode; rely on system prompts being explicit and parse defensively.
  // Works for both Anthropic and Ollama-compatible providers.
  const out = await completion(input);
  const json = extractJson(out.text);
  return { result: json as T, raw: out };
}

// =============================================================================
// Ollama / Ollama-compatible provider
// =============================================================================

interface OllamaError extends Error {
  status?: number;
  transient?: boolean;
}

interface OllamaChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  model?: string;
}

async function ollamaCompletion(
  input: CompletionInput,
  options?: { allowFallback?: boolean },
): Promise<CompletionOutput> {
  const allowRetry = options?.allowFallback ?? true;
  const model = input.model ?? env.ollamaModel();
  const start = Date.now();
  const url = `${env.ollamaBaseUrl()}/v1/chat/completions`;

  const attempt = async (): Promise<CompletionOutput> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const apiKey = env.ollamaApiKey();
    if (apiKey.length > 0) {
      // Server-only. Never logged. Never sent to the client.
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body = {
      model,
      messages: [
        { role: 'system' as const, content: input.system },
        ...input.messages,
      ],
      max_tokens: input.max_tokens ?? 4_000,
      temperature: input.temperature ?? 0.2,
      stream: false,
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (err) {
      const e: OllamaError = new Error(
        `ollama_network_error:${(err as Error)?.message ?? 'unknown'}`,
      );
      e.transient = true;
      throw e;
    }

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      const e: OllamaError = new Error(
        `ollama_chat_failed:${res.status}:${t.slice(0, 500)}`,
      );
      e.status = res.status;
      e.transient = res.status === 429 || res.status >= 500;
      throw e;
    }

    const j = (await res.json()) as OllamaChatResponse;
    const text = j.choices?.[0]?.message?.content ?? '';
    return {
      text,
      model: j.model ?? model,
      input_tokens: j.usage?.prompt_tokens ?? 0,
      output_tokens: j.usage?.completion_tokens ?? 0,
      api_cost_cents: 0, // Local/self-hosted; not tracked here.
      duration_ms: Date.now() - start,
    };
  };

  try {
    return await attempt();
  } catch (err) {
    if (allowRetry && isOllamaTransient(err)) {
      return attempt();
    }
    throw err;
  }
}

function isOllamaTransient(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as OllamaError).transient === true
  );
}

function isTransientError(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    const s = err.status ?? 0;
    return s === 429 || s === 502 || s === 503 || s === 504 || s >= 500;
  }
  if (err instanceof Anthropic.APIConnectionError) return true;
  return false;
}

/**
 * Extract a JSON object from a Claude response. Handles cases where the model
 * wraps JSON in markdown fences or includes commentary before/after.
 */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }

  // Strip ```json ... ``` fences
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence && fence[1]) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      /* fall through */
    }
  }

  // Try to locate the first balanced { ... } or [ ... ]
  const firstBrace = trimmed.search(/[{[]/);
  if (firstBrace >= 0) {
    const candidate = trimmed.slice(firstBrace);
    // Walk and balance
    const open = candidate[0]!;
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let end = -1;
    let inString = false;
    let escape = false;
    for (let i = 0; i < candidate.length; i++) {
      const ch = candidate[i]!;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') inString = !inString;
      if (inString) continue;
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end > 0) {
      try {
        return JSON.parse(candidate.slice(0, end + 1));
      } catch {
        /* fall through */
      }
    }
  }

  throw new Error('Failed to parse JSON from Claude response');
}

export function estimateCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = MODEL_PRICING[model] ?? MODEL_PRICING['claude-3-5-sonnet-20241022']!;
  const inCents = (inputTokens / 1_000_000) * p.in;
  const outCents = (outputTokens / 1_000_000) * p.out;
  return Math.ceil(inCents + outCents);
}
