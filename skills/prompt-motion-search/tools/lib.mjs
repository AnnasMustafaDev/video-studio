// Shared helpers for the prompt-motion search tools (Node 18+, no dependencies).
//
// Site rules this file enforces (robots.txt: search=yes, ai-train=no, use=reference; Disallow /api/):
// - only https://prompt-motion.com pages, never /api/
// - at most one request per second, on demand only
// - the cache holds index data only (slug, title, tags, type, handle, date), never prompt bodies
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const SITE = 'https://prompt-motion.com';
export const USER_AGENT = 'Mozilla/5.0 (compatible; prompt-motion-search/1.0; personal on-demand lookup)';
export const CACHE_FILE =
  process.env.PROMPT_MOTION_CACHE || join(homedir(), '.cache', 'prompt-motion-search', 'index.json');
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_PAGES_PER_RUN = 10;
const MIN_GAP_MS = 1000;

export const TAGS = {
  'product-ui': 'Product UI',
  phone: 'Phone',
  charts: 'Charts',
  diagrams: 'Diagrams',
  'kinetic-type': 'Kinetic type',
  shapes: 'Shapes',
  particles: 'Particles',
  characters: 'Characters',
  photos: 'Photos',
  music: 'Music',
  code: 'Code',
};

export function tagSlug(name) {
  const n = String(name).trim().toLowerCase().replace(/\s+/g, '-');
  if (TAGS[n]) return n;
  const hit = Object.entries(TAGS).find(([, label]) => label.toLowerCase() === String(name).trim().toLowerCase());
  return hit ? hit[0] : null;
}

export const tagLabel = (slug) => TAGS[slug] || slug;

// ---------- polite fetching ----------

let lastRequest = 0;
let pagesFetched = 0;

export async function fetchText(pathOrUrl, { countsAsPage = true } = {}) {
  const url = new URL(pathOrUrl, SITE);
  if (url.origin !== SITE) throw new Error(`Refusing to fetch outside ${SITE}: ${url.href}`);
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    throw new Error(`Refusing to fetch ${url.pathname}: /api/ is disallowed by robots.txt`);
  }
  if (countsAsPage && pagesFetched >= MAX_PAGES_PER_RUN) {
    throw new Error(`Page cap reached (${MAX_PAGES_PER_RUN} per run); not fetching ${url.href}`);
  }
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  if (countsAsPage) pagesFetched++;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xml' } });
  if (!res.ok) throw new Error(`GET ${url.href} failed: HTTP ${res.status}`);
  return res.text();
}

// ---------- Next.js RSC payload ----------

// Collect the flight data the page streams through self.__next_f.push([1,"..."]).
export function rscPayload(html) {
  const re = /self\.__next_f\.push\(\[\d+,("(?:[^"\\]|\\.)*")\]\)/g;
  let m;
  let out = '';
  while ((m = re.exec(html))) {
    try {
      out += JSON.parse(m[1]);
    } catch {
      // A chunk that is not a plain JSON string carries no page data we use.
    }
  }
  return out;
}

// Split the payload into rows: "<hex id>:<json>\n" or "<hex id>:T<hex byte length>,<text>".
export function rscRows(payload) {
  const buf = Buffer.from(payload, 'utf8');
  const rows = new Map();
  let i = 0;
  while (i < buf.length) {
    const colon = buf.indexOf(0x3a, i); // ':'
    if (colon < 0) break;
    const id = buf.toString('utf8', i, colon).trim();
    if (!/^[0-9a-f]+$/i.test(id)) {
      const nl = buf.indexOf(0x0a, i);
      if (nl < 0) break;
      i = nl + 1;
      continue;
    }
    if (buf[colon + 1] === 0x54) {
      // 'T' text row with an explicit byte length
      const comma = buf.indexOf(0x2c, colon);
      const len = parseInt(buf.toString('utf8', colon + 2, comma), 16);
      rows.set(id, { text: buf.toString('utf8', comma + 1, comma + 1 + len) });
      i = comma + 1 + len;
      continue;
    }
    let nl = buf.indexOf(0x0a, colon);
    if (nl < 0) nl = buf.length;
    const raw = buf.toString('utf8', colon + 1, nl);
    i = nl + 1;
    if (/^[A-Z]/.test(raw)) continue; // module (I), hint (HL) and similar rows
    try {
      rows.set(id, { json: JSON.parse(raw) });
    } catch {
      // Malformed row: skip it rather than fail the whole page.
    }
  }
  return rows;
}

function resolver(rows) {
  const resolve = (v, depth = 0) => {
    if (typeof v !== 'string' || depth > 20) return v;
    const m = /^\$L?([0-9a-f]+)$/i.exec(v);
    if (!m || !rows.has(m[1])) return v;
    const row = rows.get(m[1]);
    return row.text !== undefined ? row.text : resolve(row.json, depth + 1);
  };
  return resolve;
}

const isElement = (n) => Array.isArray(n) && n[0] === '$' && typeof n[1] === 'string' && n.length >= 4;

function walk(node, visit, resolve, seen = new Set(), depth = 0) {
  node = resolve(node);
  if (node === null || typeof node !== 'object' || depth > 200 || seen.has(node)) return;
  seen.add(node);
  visit(node);
  for (const child of Array.isArray(node) ? node : Object.values(node)) walk(child, visit, resolve, seen, depth + 1);
}

function textOf(node, resolve, depth = 0) {
  node = resolve(node);
  if (depth > 100 || node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node.startsWith('$') ? '' : node;
  if (typeof node === 'number') return String(node);
  if (isElement(node)) {
    if (/\bsr-only\b/.test(node[3]?.className || '')) return ''; // screen-reader hints like "(opens in a new tab)"
    return textOf(node[3]?.children, resolve, depth + 1);
  }
  if (Array.isArray(node)) return node.map((c) => textOf(c, resolve, depth + 1)).join('');
  return '';
}

function kidsOf(props, resolve) {
  const c = resolve(props.children);
  if (c === null || c === undefined) return [];
  return (isElement(c) || !Array.isArray(c) ? [c] : c).map(resolve);
}

function linksIn(node, resolve) {
  const out = [];
  walk(node, (n) => isElement(n) && n[1] === 'a' && typeof n[3]?.href === 'string' && out.push(n[3].href), resolve);
  return out;
}

const realString = (v) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('$');

// ---------- page parsing ----------

function ldJson(html) {
  const out = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      // Ignore a broken block; the RSC payload still has the page data.
    }
  }
  return out;
}

const meta = (html, prop) =>
  new RegExp(`<meta[^>]*(?:property|name)="${prop}"[^>]*content="([^"]*)"`).exec(html)?.[1];

const decodeEntities = (s) =>
  s?.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export function parseEntry(html, url) {
  const rows = rscRows(rscPayload(html));
  const resolve = resolver(rows);
  const video = ldJson(html).find((o) => o['@type'] === 'VideoObject') || {};
  const entry = {
    title: video.name || decodeEntities(meta(html, 'og:title')) || null,
    url: video.url || url,
    type: null,
    tags: [],
    author: video.creator?.name || null,
    authorUrl: video.creator?.url || null,
    handle: null,
    postUrl: null,
    model: null,
    effort: null,
    date: video.uploadDate || null,
    video: video.contentUrl || null,
    prompt: null,
    note: null,
    translation: null,
    skill: null,
  };

  for (const row of rows.values()) {
    if (!row.json) continue;
    walk(
      row.json,
      (n) => {
        if (!isElement(n)) return;
        const [, type, key, props = {}] = n;
        if (type === 'h1' && !entry._h1) entry._h1 = textOf(props.children, resolve).trim();
        if (Array.isArray(props.tags) && props.tags.every((t) => typeof t === 'string') && !entry.tags.length) {
          entry.tags = props.tags;
        }
        const prompt = resolve(props.prompt);
        if (realString(prompt) && !entry.prompt) {
          entry.prompt = prompt;
          const note = resolve(props.note);
          if (realString(note)) entry.note = note;
          const tr = resolve(props.translation);
          if (tr && typeof tr === 'object' && realString(tr.prompt)) {
            entry.translation = { language: realString(tr.language) ? tr.language : null, prompt: tr.prompt };
          }
        }
        if (type === 'a' && typeof props.href === 'string' && /View post/.test(textOf(props.children, resolve))) {
          entry.postUrl = props.href;
        }
        if (props['data-slot'] === 'entry-creator') {
          // The handle renders as children ["@", "<handle>"].
          walk(props.children, (k) => {
            const c = isElement(k) ? k[3]?.children : null;
            if (Array.isArray(c) && c.length === 2 && c[0] === '@' && realString(c[1])) entry.handle ??= c[1];
          }, resolve);
        }
        if (type === 'section') {
          const kids = kidsOf(props, resolve);
          const label = kids.find((k) => isElement(k) && k[1] === 'h2');
          if (label && textOf(label, resolve).trim() === 'Skill') {
            const rest = kids.filter((k) => k !== label);
            const text = rest.map((k) => textOf(k, resolve).trim()).filter(Boolean);
            const links = rest.flatMap((k) => linksIn(k, resolve)).filter((h) => /^https?:/.test(h));
            const lines = text.map((t) => t.replace(/View repo$/i, '').trim()).filter(Boolean);
            entry.skill = [...lines, ...links.map((h) => `Repo: ${h}`)].join('\n');
          }
        }
        if (type === 'div' && (key === 'Model' || key === 'Effort' || key === 'Posted')) {
          const kids = kidsOf(props, resolve);
          const dd = kids.find((k) => isElement(k) && k[1] === 'dd');
          if (dd) {
            const value = textOf(dd, resolve).trim();
            if (key === 'Model') entry.model = value;
            if (key === 'Effort') entry.effort = value;
            if (key === 'Posted' && !entry.date) entry.date = value;
          }
        }
      },
      resolve,
    );
  }

  if (!entry.title && entry._h1) entry.title = entry._h1;
  delete entry._h1;
  if (!entry.handle && entry.authorUrl) entry.handle = entry.authorUrl.split('/').filter(Boolean).pop();
  entry.type = entry.skill && entry.prompt ? 'Prompt + Skill' : entry.skill ? 'Skill' : entry.prompt ? 'Prompt' : null;
  return entry;
}

// ---------- index (titles, tags, URLs only) ----------

// The home page embeds every gallery card as {"cards":[...]} in its RSC payload.
function cardsFromHome(html) {
  const payload = rscPayload(html);
  const start = payload.indexOf('{"cards":[');
  if (start < 0) return [];
  let depth = 0;
  let end = start;
  for (; end < payload.length; end++) {
    const c = payload[end];
    if (c === '"') {
      for (end++; payload[end] !== '"'; end++) if (payload[end] === '\\') end++;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) break;
  }
  try {
    return JSON.parse(payload.slice(start, end + 1)).cards || [];
  } catch {
    return [];
  }
}

function slugsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1].trim()).pathname.replace(/^\/|\/$/g, ''))
    .filter((p) => p && !p.includes('/') && !['templates', 'customize', 'blog'].includes(p));
}

const indexRecord = (c) => ({
  slug: c.slug,
  title: c.title || null,
  date: c.date || null,
  type: (c.tags || []).filter((t) => t === 'prompt' || t === 'skill'),
  tags: c.contentTags || [],
  handle: c.handle || null,
});

function readCache() {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

export async function loadIndex({ refresh = false, log = () => {} } = {}) {
  const cached = readCache();
  if (!refresh && cached && Date.now() - Date.parse(cached.fetchedAt) < CACHE_TTL_MS) return cached.entries;

  log('Refreshing the index (home page + sitemap)...');
  const cards = cardsFromHome(await fetchText('/', { countsAsPage: false })).map(indexRecord);
  const slugs = slugsFromSitemap(await fetchText('/sitemap.xml', { countsAsPage: false }));
  const known = new Map(cards.map((c) => [c.slug, c]));
  if (!cards.length) log('Warning: no cards found on the home page; the site layout may have changed.');

  // Entries in the sitemap but not on the home page: fetch a few individually, keep the rest as bare slugs.
  const missing = slugs.filter((s) => !known.has(s));
  for (const slug of missing.slice(0, 2)) {
    try {
      const e = parseEntry(await fetchText(`/${slug}`), `${SITE}/${slug}`);
      known.set(slug, { slug, title: e.title, date: e.date, type: [], tags: e.tags, handle: e.handle });
    } catch (err) {
      log(`Could not index /${slug}: ${err.message}`);
    }
  }
  for (const slug of missing.slice(2)) known.set(slug, { slug, title: null, date: null, type: [], tags: [], handle: slug.replace(/-[0-9a-f]{6,7}$/, '') });

  const entries = [...known.values()];
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), source: SITE, entries }, null, 1));
  log(`Indexed ${entries.length} entries (cache: ${CACHE_FILE}).`);
  return entries;
}

// ---------- output ----------

export function formatEntry(e, n) {
  const lines = [];
  lines.push(`${n ? `${n}. ` : ''}${e.title || '(untitled)'}`);
  lines.push(`   Watch:   ${e.url}`);
  lines.push(`   Tags:    ${e.tags.map(tagLabel).join(', ') || '-'}   Type: ${e.type || '-'}`);
  lines.push(`   Author:  ${e.author || '-'}${e.handle ? ` (@${e.handle})` : ''}   Original post: ${e.postUrl || e.authorUrl || '-'}`);
  lines.push(`   Model:   ${e.model || '-'}   Effort: ${e.effort || '-'}   Posted: ${e.date || '-'}`);
  if (e.prompt) lines.push('   Prompt:', ...e.prompt.split('\n').map((l) => `     ${l}`));
  if (e.translation) {
    lines.push(`   English (site translation from ${e.translation.language || 'the original'}):`);
    lines.push(...e.translation.prompt.split('\n').map((l) => `     ${l}`));
  }
  if (e.note) lines.push(`   Note:    ${e.note}`);
  if (e.skill) lines.push('   Skill:', ...e.skill.split('\n').map((l) => `     ${l}`));
  if (!e.prompt && !e.skill) lines.push('   Prompt:  (not found in the page; open the URL)');
  return lines.join('\n');
}

export const CREDIT_LINE = 'Prompts and videos belong to their authors. Credit the author and link the original post when you reuse one.';
