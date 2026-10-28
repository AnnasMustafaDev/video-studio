// Builds the whole docs site: node docs/_build/build.mjs [--only name[,name]]
// Runs every generator that exists, then checks for forbidden words, local path leaks and broken internal links.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, '..');
const repo = path.resolve(docs, '..');

const MODULES = ['home', 'tour', 'credits', 'embed', 'skills', 'prompts', 'studio', 'techniques'];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? String(args[onlyIdx + 1] || '').split(',').map((s) => s.trim()).filter(Boolean) : null;
if (only) {
  const bad = only.filter((n) => !MODULES.includes(n));
  if (bad.length) {
    console.error(`Unknown module(s): ${bad.join(', ')}. Known: ${MODULES.join(', ')}`);
    process.exit(2);
  }
}

const rel = (p) => path.relative(docs, p).split(path.sep).join('/');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_build' || e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// ---------- run generators
const summary = [];
const warnings = [];
const origWarn = console.warn;
console.warn = (...a) => { warnings.push(a.join(' ')); origWarn(...a); };

for (const name of MODULES) {
  if (only && !only.includes(name)) continue;
  const file = path.join(here, `${name}.mjs`);
  if (!fs.existsSync(file)) {
    summary.push({ name, status: 'skipped (no module yet)', files: 0, ms: 0 });
    continue;
  }
  const t0 = Date.now();
  try {
    const mod = await import(pathToFileURL(file).href);
    const written = (await mod.default({ repo, docs })) || [];
    summary.push({ name, status: 'ok', files: written.length, ms: Date.now() - t0 });
  } catch (err) {
    summary.push({ name, status: `FAILED: ${err && err.message ? err.message : err}`, files: 0, ms: Date.now() - t0 });
    console.error(`\n[${name}] failed:\n`, err && err.stack ? err.stack : err);
  }
}
console.warn = origWarn;

try { if (!fs.existsSync(path.join(docs, '.nojekyll'))) fs.writeFileSync(path.join(docs, '.nojekyll'), ''); } catch {}

// ---------- checks over everything currently in docs/
const htmlFiles = walk(docs).filter((f) => f.endsWith('.html'));
const problems = [];

// 1) forbidden words in the visible text (scripts, styles and tags removed; hex hashes ignored)
// Built from fragments so this guard file itself never spells the words it blocks.
const BLOCKED = [['b', 'i', 'k'], ['c', 'd', 'b']].map((p) => p.join('')).join('|');
const FORBIDDEN = new RegExp(`(^|[^A-Za-z0-9])(${BLOCKED})`, 'i');
for (const f of htmlFiles) {
  const text = fs
    .readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b[0-9a-f]{7,}\b/gi, ' ');
  const m = FORBIDDEN.exec(text);
  if (m) {
    const i = m.index + m[1].length;
    problems.push(`forbidden word in ${rel(f)}: "...${text.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ')}..."`);
  }
}

// 2) local path leaks (raw file, any slash style, JSON-escaped included)
const LEAK = /[A-Za-z]:(\\{1,4}|\/)+Users(\\{1,4}|\/)/;
for (const f of htmlFiles) {
  const raw = fs.readFileSync(f, 'utf8');
  const m = LEAK.exec(raw);
  if (m) problems.push(`local path leak in ${rel(f)}: "${raw.slice(m.index, m.index + 50).replace(/\s+/g, ' ')}"`);
}

// 3) internal links and assets must resolve to a file under docs/
let linkCount = 0;
const ATTR = /\b(?:href|src|poster)\s*=\s*"([^"]*)"/gi;
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/gi, (s) => s.replace(ATTR, '')).replace(/<!--[\s\S]*?-->/g, '');
  const dir = path.dirname(f);
  for (const m of html.matchAll(ATTR)) {
    let u = m[1].trim().replace(/&amp;/g, '&');
    if (!u || u.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//')) continue;
    u = u.split('#')[0].split('?')[0];
    if (!u) continue;
    linkCount++;
    let target = u.startsWith('/') ? path.join(docs, u) : path.resolve(dir, decodeURI(u));
    if (u.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target, 'index.html');
    const inside = path.relative(docs, target);
    if (inside.startsWith('..') || path.isAbsolute(inside) || !fs.existsSync(target)) {
      problems.push(`broken link in ${rel(f)}: ${m[1]}`);
    }
  }
}

// ---------- report
const pad = (s, n) => String(s).padEnd(n);
console.log('\nBuild summary');
console.log(pad('module', 12) + pad('status', 34) + pad('files', 7) + 'ms');
for (const r of summary) console.log(pad(r.name, 12) + pad(r.status.length > 32 ? r.status.slice(0, 31) + '…' : r.status, 34) + pad(r.files, 7) + r.ms);
console.log(`\nChecked ${htmlFiles.length} html files, ${linkCount} internal links.`);
if (warnings.length) console.log(`Warnings: ${warnings.length}`);
const failed = summary.filter((r) => r.status.startsWith('FAILED'));
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 60)) console.log('  - ' + p);
  if (problems.length > 60) console.log(`  ... and ${problems.length - 60} more`);
} else {
  console.log('Checks passed: no forbidden words, no local path leaks, no broken internal links.');
}
process.exit(problems.length || failed.length ? 1 : 0);
