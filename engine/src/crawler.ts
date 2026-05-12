/**
 * Website crawler.
 *
 * Fetches up to 4 paths (/, /pricing, /about, /docs) in parallel with a
 * conservative timeout. Parses with cheerio. Returns combined text + per-page
 * metadata. Caches results in website_scans to avoid re-fetching the same
 * URL within the TTL window.
 *
 * Resilience requirements (per Phase 2 spec):
 *  - If website scan fails, fall back gracefully — return ok:false with a
 *    reason, but the API layer still lets the user proceed via manual
 *    questions.
 *  - Never block the user with a hard error.
 */

import * as cheerio from 'cheerio';
import { env } from './lib/env.js';
import { service, dbError } from './lib/supabase.js';
import type { CrawlPage, CrawlResult, Result } from './lib/types.js';

const PATHS_TO_TRY = ['/', '/pricing', '/about', '/docs', '/product', '/features'];
const MAX_BODY_BYTES_PER_PAGE = 200_000; // 200 KB per page, then truncated
const COMBINED_TEXT_CAP = 60_000; // safety cap before sending to Claude

// =============================================================================
// Public API
// =============================================================================

export interface CrawlInput {
  url: string;
  /** When true, skip cache and always re-fetch. Default false. */
  force?: boolean;
}

export async function crawl(input: CrawlInput): Promise<Result<CrawlResult>> {
  const url = normalizeUrl(input.url);
  if (!url) {
    return { ok: false, error: 'invalid_url' };
  }

  // Cache lookup (within TTL)
  if (!input.force) {
    const cached = await readCache(url);
    if (cached) return { ok: true, data: cached };
  }

  // Fresh crawl
  let pages: CrawlPage[];
  try {
    pages = await fetchAllPaths(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const result: CrawlResult = {
      url,
      ok: false,
      pages: [],
      combined_text: '',
      fetched_at: new Date().toISOString(),
      fetch_error: msg,
    };
    await writeCache(result);
    return { ok: true, data: result };
  }

  // We consider the scan "ok" if at least one page returned 2xx.
  const okPages = pages.filter((p) => p.ok);
  const combined = combineText(pages);

  const result: CrawlResult = {
    url,
    ok: okPages.length > 0,
    pages,
    combined_text: combined,
    fetched_at: new Date().toISOString(),
    fetch_error:
      okPages.length === 0 ? 'no_successful_page_fetch' : undefined,
  };

  await writeCache(result);
  return { ok: true, data: result };
}

// =============================================================================
// Internal: fetch, parse, normalize
// =============================================================================

async function fetchAllPaths(rootUrl: string): Promise<CrawlPage[]> {
  const base = new URL(rootUrl);
  const targets = PATHS_TO_TRY.map((p) => new URL(p, base).toString());

  const settled = await Promise.allSettled(targets.map((u) => fetchOne(u)));
  return settled.map((r, idx) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      path: PATHS_TO_TRY[idx]!,
      url: targets[idx]!,
      status: 0,
      ok: false,
      headings: [],
      body_text: '',
      fetch_error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });
}

async function fetchOne(targetUrl: string): Promise<CrawlPage> {
  const path = new URL(targetUrl).pathname || '/';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), env.crawlerTimeoutMs());

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': env.crawlerUserAgent(),
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: ctrl.signal,
    });

    if (!res.ok) {
      return {
        path,
        url: targetUrl,
        status: res.status,
        ok: false,
        headings: [],
        body_text: '',
        fetch_error: `http_${res.status}`,
      };
    }

    // Read up to N bytes
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return {
        path,
        url: targetUrl,
        status: res.status,
        ok: false,
        headings: [],
        body_text: '',
        fetch_error: `unsupported_content_type:${contentType}`,
      };
    }

    const html = await readBoundedText(res, MAX_BODY_BYTES_PER_PAGE);
    return parseHtml(path, targetUrl, res.status, html);
  } catch (err) {
    return {
      path,
      url: targetUrl,
      status: 0,
      ok: false,
      headings: [],
      body_text: '',
      fetch_error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function readBoundedText(res: Response, maxBytes: number): Promise<string> {
  // Stream and cap
  const reader = res.body?.getReader();
  if (!reader) return await res.text();
  const decoder = new TextDecoder();
  let received = 0;
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    received += value?.byteLength ?? 0;
    if (value) buf += decoder.decode(value, { stream: true });
    if (received >= maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      break;
    }
  }
  return buf + decoder.decode();
}

function parseHtml(path: string, url: string, status: number, html: string): CrawlPage {
  const $ = cheerio.load(html);
  // Strip noise
  $('script, style, noscript, svg, link, meta, iframe').remove();

  const title = ($('title').first().text() || '').trim() || undefined;
  const description =
    ($('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '').trim() || undefined;

  const headings: string[] = [];
  $('h1, h2, h3').each((_i, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && t.length < 240) headings.push(t);
  });

  // Body text — main + body fallback
  const main = $('main').first().text() || $('body').text();
  const body_text = collapseWhitespace(main).slice(0, MAX_BODY_BYTES_PER_PAGE);

  return {
    path,
    url,
    status,
    ok: true,
    title,
    description,
    headings: dedup(headings).slice(0, 40),
    body_text,
  };
}

function combineText(pages: CrawlPage[]): string {
  const parts: string[] = [];
  for (const p of pages) {
    if (!p.ok) continue;
    const lead = [p.title, p.description].filter(Boolean).join(' · ');
    parts.push(`### ${p.path} ${lead ? `· ${lead}` : ''}`);
    if (p.headings.length) parts.push(p.headings.map((h) => `# ${h}`).join('\n'));
    if (p.body_text) parts.push(p.body_text);
  }
  let combined = parts.join('\n\n');
  if (combined.length > COMBINED_TEXT_CAP) {
    combined = combined.slice(0, COMBINED_TEXT_CAP) + '\n\n[truncated]';
  }
  return combined;
}

function normalizeUrl(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    // Strip query + fragment + trailing slash variations on the apex
    u.hash = '';
    u.search = '';
    return u.origin;
  } catch {
    return null;
  }
}

function collapseWhitespace(s: string): string {
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function dedup(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

// =============================================================================
// Cache (website_scans table)
// =============================================================================

async function readCache(url: string): Promise<CrawlResult | null> {
  const sb = service();
  try {
    const { data, error } = await sb
      .from('website_scans')
      .select('*')
      .eq('url', url)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const ttlMs = (data.ttl_seconds ?? 86_400) * 1000;
    const ageMs = Date.now() - new Date(data.fetched_at).getTime();
    if (ageMs > ttlMs) return null;

    // pages_fetched is stored as a JSONB array of pages OR an array of paths;
    // we recompute combined_text from the persisted text column.
    return {
      url: data.url,
      ok: data.fetch_ok,
      pages: Array.isArray(data.pages_fetched) ? (data.pages_fetched as CrawlPage[]) : [],
      combined_text: data.raw_text ?? '',
      fetched_at: data.fetched_at,
      fetch_error: data.fetch_error ?? undefined,
    };
  } catch (err) {
    dbError('crawler.readCache', err);
    return null;
  }
}

async function writeCache(r: CrawlResult): Promise<void> {
  const sb = service();
  try {
    await sb.from('website_scans').insert({
      url: r.url,
      fetched_at: r.fetched_at,
      fetch_ok: r.ok,
      http_status: r.pages.find((p) => p.ok)?.status ?? null,
      pages_fetched: r.pages,
      raw_text_length: r.combined_text.length,
      raw_text: r.combined_text,
      fetch_error: r.fetch_error ?? null,
    });
  } catch (err) {
    dbError('crawler.writeCache', err);
    // do not throw — caching is best-effort
  }
}
