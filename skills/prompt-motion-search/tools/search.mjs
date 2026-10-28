#!/usr/bin/env node
// Search the prompt-motion.com gallery for motion videos made with Claude, then print the best matches
// with their full prompt and credit.
//
//   node search.mjs "<query>" [--tag "Kinetic type"]... [--limit 5] [--json] [--refresh]
//
// The index (titles, tags, URLs) comes from the home page and sitemap and is cached for 24 h.
// Only the top --limit pages (max 10) are fetched for prompt text, one request per second.
import { CREDIT_LINE, MAX_PAGES_PER_RUN, SITE, TAGS, fetchText, formatEntry, loadIndex, parseEntry, tagLabel, tagSlug } from './lib.mjs';

const USAGE = `usage: node search.mjs "<query>" [--tag "<tag>"]... [--limit N] [--json] [--refresh]
tags: ${Object.values(TAGS).join(', ')}`;

function parseArgs(argv) {
  const opts = { query: [], tags: [], limit: 5, json: false, refresh: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--refresh') opts.refresh = true;
    else if (a === '--tag') opts.tags.push(argv[++i]);
    else if (a === '--limit') opts.limit = Number(argv[++i]);
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}\n${USAGE}`);
    else opts.query.push(a);
  }
  return opts;
}

// Words people use for each gallery tag.
const TAG_WORDS = {
  'kinetic-type': ['kinetic', 'type', 'typography', 'typographic', 'text', 'title', 'titles', 'words', 'lettering', 'font', 'hook', 'quote'],
  'product-ui': ['product', 'ui', 'ux', 'app', 'saas', 'dashboard', 'interface', 'screen', 'demo', 'website', 'landing', 'launch', 'feature'],
  phone: ['phone', 'mobile', 'iphone', 'ios', 'android', 'app'],
  charts: ['chart', 'charts', 'graph', 'graphs', 'data', 'stats', 'numbers', 'bar', 'line', 'pie', 'metrics', 'growth', 'dataviz'],
  diagrams: ['diagram', 'diagrams', 'flow', 'flowchart', 'architecture', 'system', 'explainer', 'process', 'pipeline', 'network'],
  shapes: ['shape', 'shapes', 'geometric', 'geometry', 'abstract', 'morph', 'logo'],
  particles: ['particle', 'particles', 'dots', 'sparks', 'confetti', 'swarm', 'generative'],
  characters: ['character', 'characters', 'mascot', 'person', 'avatar', 'cartoon'],
  photos: ['photo', 'photos', 'image', 'images', 'picture', 'pictures', 'gallery', 'collage'],
  music: ['music', 'audio', 'beat', 'sound', 'song', 'rhythm', 'sync'],
  code: ['code', 'coding', 'terminal', 'developer', 'programming', 'cli', 'editor'],
};

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'with', 'like', 'some', 'me', 'my', 'video', 'videos', 'animation', 'animations', 'motion', 'claude']);

const words = (s) => (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

function score(entry, terms) {
  const title = words(entry.title);
  let s = 0;
  for (const t of terms) {
    if (title.includes(t)) s += 3;
    else if (t.length >= 4 && title.some((w) => w.startsWith(t) || t.startsWith(w) && w.length >= 4)) s += 1.5;
    for (const tag of entry.tags) if (TAG_WORDS[tag]?.includes(t)) s += 2;
    if (entry.handle && entry.handle.toLowerCase() === t) s += 2;
  }
  return s;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.query.length && !opts.tags.length)) {
    console.log(USAGE);
    process.exit(opts.help ? 0 : 1);
  }
  const tagFilter = opts.tags.map((t) => {
    const slug = tagSlug(t);
    if (!slug) throw new Error(`Unknown tag "${t}". Tags: ${Object.values(TAGS).join(', ')}`);
    return slug;
  });
  const limit = Math.max(1, Math.min(Number.isFinite(opts.limit) ? opts.limit : 5, MAX_PAGES_PER_RUN - 2));
  const log = (m) => console.error(m);

  const index = await loadIndex({ refresh: opts.refresh, log });
  const terms = words(opts.query.join(' ')).filter((w) => !STOP.has(w));
  const ranked = index
    .filter((e) => tagFilter.every((t) => e.tags.includes(t)))
    .map((e) => ({ e, s: score(e, terms) }))
    .filter((x) => x.s > 0 || !terms.length)
    .sort((a, b) => b.s - a.s || String(b.e.date).localeCompare(String(a.e.date)));

  if (!ranked.length) {
    console.error(`No matches for "${opts.query.join(' ')}"${tagFilter.length ? ` with tags ${tagFilter.map(tagLabel).join(' + ')}` : ''}. Try fewer words or a tag.`);
    process.exitCode = 2;
    return;
  }
  log(`${ranked.length} candidate(s) in an index of ${index.length}; fetching the top ${Math.min(limit, ranked.length)}...`);

  const results = [];
  for (const { e, s } of ranked.slice(0, limit)) {
    const url = `${SITE}/${e.slug}`;
    try {
      const page = parseEntry(await fetchText(`/${e.slug}`), url);
      if (!page.tags.length) page.tags = e.tags;
      if (!page.handle) page.handle = e.handle;
      if (!page.type && e.type.length) page.type = e.type.map((t) => t[0].toUpperCase() + t.slice(1)).join(' + ');
      results.push({ ...page, score: s });
    } catch (err) {
      log(`Could not read ${url}: ${err.message}`);
      results.push({ title: e.title, url, tags: e.tags, handle: e.handle, date: e.date, type: null, error: err.message, score: s });
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({ query: opts.query.join(' '), tags: tagFilter, credit: CREDIT_LINE, results }, null, 2));
    return;
  }
  console.log(results.map((r, i) => formatEntry(r, i + 1)).join('\n\n'));
  console.log(`\n${CREDIT_LINE}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1; // not process.exit(): it can abort while fetch sockets close on Windows
});
