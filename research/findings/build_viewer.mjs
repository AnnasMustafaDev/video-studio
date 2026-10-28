#!/usr/bin/env node
// Builds research/findings/index.html from the three analyst markdown files
// (A-github-web.md, B-x-youtube.md, C-reddit-social.md) and ledger/*.json.
// No dependencies. Re-run any time a ledger file changes:
//   node research/findings/build_viewer.mjs
// The page has the data inlined and works offline from file://.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLICES = [
  { id: "A", file: "A-github-web.md", label: "GitHub and web" },
  { id: "B", file: "B-x-youtube.md", label: "X and YouTube" },
  { id: "C", file: "C-reddit-social.md", label: "Reddit and social" },
];
const STATUS_RANK = { landed: 4, partial: 3, deferred: 2, rejected: 1 };
const FIELD_KEYS = {
  category: "category",
  "what it is": "what",
  "why it is good": "why",
  "adopt?": "adopt",
  "where it goes": "where",
  effort: "effort",
  source: "source",
};
const warnings = [];

function warn(msg) {
  warnings.push(msg);
  console.warn("warning: " + msg);
}

// ---------- markdown parsing ----------

function splitSections(md) {
  // returns [{ heading, lines }] for every "## " section; preamble gets heading ""
  const out = [{ heading: "", lines: [] }];
  for (const line of md.split(/\r?\n/)) {
    const m = /^##\s+(.*\S)\s*$/.exec(line);
    if (m && !line.startsWith("###")) out.push({ heading: m[1], lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

function parseFindings(slice, lines) {
  const findings = [];
  let cur = null;
  let field = null;
  const flush = () => {
    if (cur) findings.push(cur);
    cur = null;
    field = null;
  };
  for (const line of lines) {
    const h = /^###\s+(F-([ABC])(\d+)):\s*(.*\S)\s*$/.exec(line);
    if (h) {
      flush();
      cur = {
        id: h[1],
        slice: h[2],
        n: Number(h[3]),
        title: h[4],
        category: "", what: "", why: "", adopt: "", where: "", effort: "", source: "",
      };
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("---")) { field = null; continue; }
    // "- **Label:** text" or "- **Label**: text"
    const b = /^-\s+\*\*([^*]+?)\*\*\s*:?\s*(.*)$/.exec(line);
    if (b) {
      const label = b[1].replace(/:\s*$/, "").trim().toLowerCase();
      const key = FIELD_KEYS[label];
      if (key) {
        field = key;
        cur[key] = b[2].trim();
        continue;
      }
    }
    if (field && line.trim() && /^\s+|^[^-#]/.test(line)) {
      cur[field] += " " + line.trim();
    } else if (!line.trim()) {
      field = null;
    }
  }
  flush();
  return findings;
}

function parseNumbered(lines) {
  // "1. **Title.** text ... Credit: ..." possibly continued on following lines
  const items = [];
  let cur = null;
  for (const line of lines) {
    const m = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (m) {
      if (cur) items.push(cur);
      cur = { raw: m[2].trim() };
    } else if (cur && line.trim() && !/^#/.test(line)) {
      cur.raw += " " + line.trim();
    } else if (cur && !line.trim()) {
      items.push(cur);
      cur = null;
    }
  }
  if (cur) items.push(cur);
  return items.map((it) => {
    const t = /^\*\*(.+?)\*\*\s*(.*)$/.exec(it.raw);
    let title = "", body = it.raw;
    if (t) { title = t[1].replace(/[.:]\s*$/, ""); body = t[2]; }
    let credit = "";
    const c = /\bCredit:\s*(.*)$/.exec(body);
    if (c) { credit = c[1].trim(); body = body.slice(0, c.index).trim(); }
    return { title, body: body.trim(), credit };
  });
}

function parseBullets(lines) {
  // top-level bullets with continuation lines
  const items = [];
  let cur = null;
  for (const line of lines) {
    const m = /^-\s+(.*)$/.exec(line);
    const sub = /^\s{2,}-\s+(.*)$/.exec(line);
    if (m) {
      if (cur) items.push(cur);
      cur = m[1].trim();
    } else if (sub && cur) {
      cur += " " + sub[1].trim();
    } else if (cur && line.trim() && !/^#/.test(line)) {
      cur += " " + line.trim();
    } else if (cur && !line.trim()) {
      items.push(cur);
      cur = null;
    }
  }
  if (cur) items.push(cur);
  return items.map((raw) => {
    const t = /^\*\*(.+?)\*\*\s*(.*)$/.exec(raw);
    if (t) return { title: t[1].replace(/[.:]\s*$/, ""), body: t[2].trim() };
    return { title: "", body: raw };
  });
}

function evidenceOf(why) {
  const m = /(Strength|Evidence)\s*:/.exec(why);
  if (!m) return { main: why, clause: "", level: "unknown" };
  const main = why.slice(0, m.index).trim();
  const clause = why.slice(m.index).trim();
  const low = clause.toLowerCase();
  let level = "unknown";
  if (/only claimed|not shown|not demonstrated|opinion|ai summary|claimed by|described,|described by|did not watch|not verified/.test(low)) level = "claimed";
  else if (/doc-level/.test(low)) level = "doc";
  else if (/shown|finished|posted|consistent across|failure-derived|precise|documented|reported/.test(low)) level = "shown";
  return { main, clause, level };
}

function verdictOf(adopt) {
  const m = /^\s*(yes|maybe|no)\b/i.exec(adopt);
  if (m) return m[1].toLowerCase();
  // "Mostly already done", "Partly", "Already adopted in part": a qualified maybe
  return /^\s*(mostly|partly|already|in part)/i.test(adopt) ? "maybe" : "unclear";
}

function readSlice(slice) {
  const path = join(HERE, slice.file);
  if (!existsSync(path)) { warn("missing " + slice.file); return null; }
  const sections = splitSections(readFileSync(path, "utf8"));
  const out = { notes: [], findings: [], patterns: [], rejected: [] };
  for (const s of sections) {
    const h = s.heading.toLowerCase();
    if (/^findings/.test(h)) out.findings = parseFindings(slice, s.lines);
    else if (/^prompt patterns/.test(h)) out.patterns = parseNumbered(s.lines);
    else if (/^rejected/.test(h)) out.rejected = parseBullets(s.lines);
    else if (/^how (to read|this was)/.test(h)) {
      const stop = s.lines.findIndex((l) => /^(###|---)/.test(l));
      out.notes = parseBullets(stop < 0 ? s.lines : s.lines.slice(0, stop));
    }
  }
  // some files put findings under "###" headings with no "## Findings" wrapper
  if (!out.findings.length) {
    out.findings = parseFindings(slice, sections.flatMap((s) => s.lines));
  }
  for (const f of out.findings) {
    for (const k of ["category", "what", "why", "adopt", "where", "effort", "source"]) {
      if (!f[k]) warn(f.id + " has no " + k + " field");
    }
  }
  return out;
}

// ---------- ledger ----------

function readLedgers() {
  const dir = join(HERE, "ledger");
  const byId = new Map();
  const files = [];
  if (!existsSync(dir)) return { byId, files };
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch (e) {
      warn("ledger " + name + " is not valid JSON yet: " + e.message);
      continue;
    }
    const arr = Array.isArray(data) ? data : Array.isArray(data.entries) ? data.entries : null;
    if (!arr) { warn("ledger " + name + " is not an array"); continue; }
    files.push(name.replace(/\.json$/, ""));
    for (const e of arr) {
      if (!e || typeof e.id !== "string") { warn("ledger " + name + " has an entry without id"); continue; }
      const status = String(e.status || "").toLowerCase();
      if (!STATUS_RANK[status]) { warn("ledger " + name + " " + e.id + " has unknown status " + e.status); continue; }
      const entry = {
        by: name.replace(/\.json$/, ""),
        status,
        paths: Array.isArray(e.paths) ? e.paths.map(String) : [],
        why: e.why ? String(e.why) : "",
        note: e.note ? String(e.note) : "",
      };
      if (!byId.has(e.id)) byId.set(e.id, []);
      byId.get(e.id).push(entry);
    }
  }
  return { byId, files };
}

// ---------- build ----------

const slicesData = {};
const findings = [];
const patterns = [];
const rejected = [];
const notes = {};
for (const slice of SLICES) {
  const r = readSlice(slice);
  if (!r) continue;
  notes[slice.id] = r.notes;
  findings.push(...r.findings);
  r.patterns.forEach((p, i) => patterns.push({ slice: slice.id, n: i + 1, ...p }));
  r.rejected.forEach((p) => rejected.push({ slice: slice.id, ...p }));
  slicesData[slice.id] = { label: slice.label, count: r.findings.length };
}

const ledger = readLedgers();
for (const id of ledger.byId.keys()) {
  if (!findings.some((f) => f.id === id)) warn("ledger mentions " + id + " which is not a finding");
}

const data = {
  generated: new Date().toISOString().slice(0, 10),
  slices: slicesData,
  ledgers: ledger.files,
  findings: findings.map((f) => {
    const ev = evidenceOf(f.why);
    const entries = (ledger.byId.get(f.id) || []).slice().sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status]);
    return {
      id: f.id,
      slice: f.slice,
      n: f.n,
      title: f.title,
      tags: f.category.split(/[,/]/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean),
      effort: (/^\s*([SML])\b/.exec(f.effort) || [, "?"])[1],
      effortText: f.effort,
      verdict: verdictOf(f.adopt),
      adopt: f.adopt,
      what: f.what,
      why: ev.main,
      evidence: ev.clause,
      evidenceLevel: ev.level,
      where: f.where,
      source: f.source,
      status: entries.length ? entries[0].status : "none",
      ledger: entries,
    };
  }),
  patterns,
  rejected,
  notes,
};

const counts = { total: data.findings.length, landed: 0, partial: 0, deferred: 0, rejected: 0, none: 0 };
for (const f of data.findings) counts[f.status]++;

// ---------- html ----------

const TEMPLATE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Research findings viewer</title>
<meta name="description" content="Every finding from the Claude motion research, what it teaches, and where it landed in the studio.">
<style>
:root{
  --bg:#fbfaf8; --surface:#ffffff; --surface2:#f3f1ed; --ink:#1d2026; --muted:#5a606b; --line:#e2dfd8;
  --accent:#5B8CFF; --accent-ink:#2f5fd6; --accent-bg:#e9f0ff;
  --landed:#1f7a4d; --landed-bg:#e2f4ea; --partial:#8a5a00; --partial-bg:#fbefd2;
  --deferred:#4a5668; --deferred-bg:#e6eaf0; --rejected:#a33a3a; --rejected-bg:#f8e3e3;
  --none:#5a606b; --none-bg:#eceae5; --code-bg:#efede8; --shadow:0 1px 2px rgba(20,22,26,.06);
}
:root[data-theme="dark"]{
  --bg:#14161a; --surface:#1b1e23; --surface2:#22262c; --ink:#e7e9ec; --muted:#9aa1ac; --line:#2e333b;
  --accent:#5B8CFF; --accent-ink:#8fb0ff; --accent-bg:#1f2a44;
  --landed:#6fd09c; --landed-bg:#173324; --partial:#e8b957; --partial-bg:#392c10;
  --deferred:#a9b4c4; --deferred-bg:#262c36; --rejected:#f0908f; --rejected-bg:#3b2020;
  --none:#9aa1ac; --none-bg:#262a30; --code-bg:#252a31; --shadow:none;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#14161a; --surface:#1b1e23; --surface2:#22262c; --ink:#e7e9ec; --muted:#9aa1ac; --line:#2e333b;
    --accent:#5B8CFF; --accent-ink:#8fb0ff; --accent-bg:#1f2a44;
    --landed:#6fd09c; --landed-bg:#173324; --partial:#e8b957; --partial-bg:#392c10;
    --deferred:#a9b4c4; --deferred-bg:#262c36; --rejected:#f0908f; --rejected-bg:#3b2020;
    --none:#9aa1ac; --none-bg:#262a30; --code-bg:#252a31; --shadow:none;
  }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow-wrap:anywhere}
a{color:var(--accent-ink)}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{max-width:1040px;margin:0 auto;padding:0 16px}
header.top{padding:28px 0 8px}
.top-row{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
h1{font:600 clamp(1.5rem,4vw,2.1rem)/1.2 Georgia,"Times New Roman",serif;margin:0 0 6px;letter-spacing:-.01em}
.lede{color:var(--muted);margin:0;max-width:62ch}
.btn{white-space:nowrap;border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:6px 12px;cursor:pointer;min-height:36px}
.btn:hover{border-color:var(--accent)}
.btn.small{padding:2px 8px;min-height:28px;font-size:.8rem}
.counts{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin:20px 0 4px}
.count{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px;box-shadow:var(--shadow)}
.count b{display:block;font:600 1.6rem/1.1 Georgia,serif}
.count span{color:var(--muted);font-size:.85rem}
.count.landed b{color:var(--landed)} .count.partial b{color:var(--partial)} .count.rejected b{color:var(--rejected)}
.pending{margin:10px 0 0;color:var(--muted);font-size:.9rem}
nav.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-top:18px;overflow-x:auto}
nav.tabs button{background:none;border:0;border-bottom:3px solid transparent;padding:10px 12px;cursor:pointer;color:var(--muted);white-space:nowrap}
nav.tabs button[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--accent);font-weight:600}
h2{font:600 1.15rem/1.3 Georgia,serif;margin:28px 0 10px}
.picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.pick{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:10px 12px;cursor:pointer;text-align:left;display:block;width:100%}
.pick:hover{border-color:var(--accent)}
.pick small{color:var(--muted);display:block}
.pick strong{display:block;font-weight:600;line-height:1.35;margin-top:2px}
.filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:18px 0 8px}
.filters label{display:block;font-size:.78rem;color:var(--muted);margin-bottom:2px}
.filters select,.filters input{width:100%;min-height:38px;border:1px solid var(--line);background:var(--surface);border-radius:8px;padding:6px 8px}
.filters .search{grid-column:1/-1}
.resultline{display:flex;justify-content:space-between;align-items:center;gap:8px;color:var(--muted);font-size:.9rem;margin:6px 0 10px;flex-wrap:wrap}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;margin:0 0 14px;box-shadow:var(--shadow);scroll-margin-top:12px}
.card.flash{outline:2px solid var(--accent)}
.card h3{font:600 1.1rem/1.35 Georgia,serif;margin:6px 0 8px}
.meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.id{font:600 .8rem ui-monospace,Consolas,monospace;color:var(--muted)}
.pill{display:inline-block;border-radius:999px;padding:1px 9px;font-size:.78rem;border:1px solid var(--line);background:var(--surface2);color:var(--muted)}
.pill.yes{color:var(--landed);background:var(--landed-bg);border-color:transparent}
.pill.maybe{color:var(--partial);background:var(--partial-bg);border-color:transparent}
.pill.no{color:var(--rejected);background:var(--rejected-bg);border-color:transparent}
.badge{display:inline-block;border-radius:6px;padding:2px 9px;font-size:.8rem;font-weight:600}
.badge.landed{color:var(--landed);background:var(--landed-bg)} .badge.partial{color:var(--partial);background:var(--partial-bg)}
.badge.deferred{color:var(--deferred);background:var(--deferred-bg)} .badge.rejected{color:var(--rejected);background:var(--rejected-bg)}
.badge.none{color:var(--none);background:var(--none-bg)}
.sec{margin-top:12px}
.sec h4{margin:0 0 3px;font:600 .78rem/1.3 system-ui,sans-serif;text-transform:none;letter-spacing:.02em;color:var(--muted)}
.sec p{margin:0}
.evidence{margin-top:8px;border-left:3px solid var(--muted);background:var(--surface2);padding:6px 10px;border-radius:0 8px 8px 0;font-size:.92rem}
.evidence.shown{border-left-color:var(--landed)} .evidence.claimed{border-left-color:var(--partial)} .evidence.doc{border-left-color:var(--accent)}
.evidence b{font-weight:600}
code,.chip{font:.85em ui-monospace,Consolas,"Cascadia Mono",monospace;background:var(--code-bg);border-radius:5px;padding:1px 5px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}
.chipwrap{display:inline-flex;align-items:center;gap:2px;max-width:100%}
.chip{display:inline-block;padding:2px 7px;max-width:100%;overflow-wrap:anywhere}
.ledger{border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-top:6px;background:var(--surface2)}
.ledger .who{color:var(--muted);font-size:.8rem}
.planned{color:var(--muted);font-size:.9rem}
.src{font-size:.9rem;color:var(--muted)}
details{margin-top:10px}
summary{cursor:pointer;color:var(--accent-ink)}
.pattern{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 12px}
.pattern pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0;font:.92rem/1.55 system-ui,sans-serif;background:var(--surface2);border-radius:8px;padding:10px}
.pattern h3,.rej h3{margin:0 0 4px;font:600 1rem/1.35 system-ui,sans-serif}
.rej{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--rejected);border-radius:10px;padding:10px 14px;margin:0 0 10px}
.rej p{margin:0}
.about{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:6px 18px 14px}
.about ul{padding-left:20px} .about li{margin:5px 0}
.empty{padding:30px 0;color:var(--muted);text-align:center}
footer{margin:36px 0;color:var(--muted);font-size:.85rem}
.toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:6px 14px;border-radius:8px;font-size:.85rem;opacity:0;pointer-events:none;transition:opacity .15s}
.toast.on{opacity:1}
[hidden]{display:none!important}
@media print{
  :root,:root[data-theme="dark"]{--bg:#fff;--surface:#fff;--surface2:#f4f4f4;--ink:#000;--muted:#444;--line:#bbb;--shadow:none}
  .filters,nav.tabs,.btn,.picks,.toast,#theme{display:none!important}
  .panel{display:block!important}
  .card,.pattern,.rej{break-inside:avoid}
  body{font-size:11pt}
}
</style>
</head>
<body>
<div class="wrap">
<header class="top">
  <div class="top-row">
    <div>
      <h1>Research findings viewer</h1>
      <p class="lede">Fifty findings from the Claude motion research: what each one teaches, why it is good, and whether it reached the studio.</p>
    </div>
    <button class="btn" id="theme" type="button" aria-label="Toggle light and dark theme">Theme</button>
  </div>
  <div class="counts" id="counts"></div>
  <p class="pending" id="pending"></p>
</header>

<nav class="tabs" role="tablist" aria-label="Sections">
  <button role="tab" id="tab-findings" aria-selected="true" data-tab="findings">Findings</button>
  <button role="tab" id="tab-prompts" aria-selected="false" data-tab="prompts">Prompt patterns</button>
  <button role="tab" id="tab-rejected" aria-selected="false" data-tab="rejected">Rejected or weak</button>
  <button role="tab" id="tab-about" aria-selected="false" data-tab="about">About this research</button>
</nav>

<main>
<section class="panel" id="panel-findings" role="tabpanel" aria-labelledby="tab-findings">
  <h2 id="picks-title">Top picks</h2>
  <div class="picks" id="picks"></div>
  <div class="filters" role="search">
    <div class="search"><label for="q">Search titles and text</label><input id="q" type="search" placeholder="Search"></div>
    <div><label for="f-cat">Category</label><select id="f-cat"></select></div>
    <div><label for="f-verdict">Analyst verdict</label><select id="f-verdict"><option value="">All</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></div>
    <div><label for="f-status">Studio status</label><select id="f-status"><option value="">All</option><option value="landed">Landed</option><option value="partial">Partial</option><option value="deferred">Deferred</option><option value="rejected">Rejected</option><option value="none">Not adopted yet</option></select></div>
    <div><label for="f-effort">Effort</label><select id="f-effort"><option value="">All</option><option value="S">S (small)</option><option value="M">M (medium)</option><option value="L">L (large)</option></select></div>
    <div><label for="f-slice">Slice</label><select id="f-slice"></select></div>
    <div><label for="f-sort">Sort</label><select id="f-sort"><option value="rank">Analyst order</option><option value="status">Studio status</option><option value="effort">Effort, small first</option><option value="verdict">Verdict</option><option value="title">Title</option></select></div>
  </div>
  <div class="resultline"><span id="resultcount"></span><button class="btn small" id="reset" type="button">Reset filters</button></div>
  <div id="cards"></div>
  <div class="empty" id="none" hidden>No findings match these filters.</div>
</section>

<section class="panel" id="panel-prompts" role="tabpanel" aria-labelledby="tab-prompts" hidden>
  <h2>Prompt patterns worth keeping</h2>
  <p class="src">Skeletons paraphrased by the analysts. The prompts belong to their authors; credits link back to the sources.</p>
  <div id="patterns"></div>
</section>

<section class="panel" id="panel-rejected" role="tabpanel" aria-labelledby="tab-rejected" hidden>
  <h2>Rejected or weak</h2>
  <p class="src">Sources and ideas the analysts set aside, with their reasons.</p>
  <div id="rejected"></div>
</section>

<section class="panel" id="panel-about" role="tabpanel" aria-labelledby="tab-about" hidden>
  <h2>About this research</h2>
  <div class="about" id="about"></div>
</section>
</main>
<footer>Generated <span id="gen"></span> by build_viewer.mjs. Data is inlined; the page works offline. Regenerate with <code>node research/findings/build_viewer.mjs</code>.</footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script id="viewer-data" type="application/json">/*__DATA__*/</script>
<script>
(function(){
"use strict";
var DATA = JSON.parse(document.getElementById("viewer-data").textContent);
var STATUS_LABEL = {landed:"Landed",partial:"Partial",deferred:"Deferred",rejected:"Rejected",none:"Not adopted yet"};
var STATUS_ORDER = {landed:0,partial:1,deferred:2,none:3,rejected:4};
var EFFORT_ORDER = {S:0,M:1,L:2,"?":3};
var VERDICT_ORDER = {yes:0,maybe:1,no:2,unclear:3};
var EVIDENCE_LABEL = {shown:"Shown in a finished film or posted work",claimed:"Only claimed or described",doc:"Doc-level: method read, result not seen",unknown:"Evidence level not stated"};

function el(tag, cls, text){
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
var URL_RE = /https?:\/\/[^\s)<>"'\`]+/g;
function safeUrl(u){ return /^https?:\/\//i.test(u) ? u : null; }

// Renders text with \`code\` spans and http(s) links. Everything goes through textContent.
function rich(parent, text){
  String(text || "").split("\`").forEach(function(part, i){
    if (i % 2 === 1) { parent.appendChild(el("code", null, part)); return; }
    var last = 0, m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(part))) {
      var url = m[0].replace(/[.,;:]+$/, "");
      if (m.index > last) parent.appendChild(document.createTextNode(part.slice(last, m.index)));
      var ok = safeUrl(url);
      if (ok) {
        var a = el("a", null, url);
        a.href = ok; a.target = "_blank"; a.rel = "noopener noreferrer";
        parent.appendChild(a);
      } else parent.appendChild(document.createTextNode(url));
      last = m.index + url.length;
      URL_RE.lastIndex = last;
    }
    if (last < part.length) parent.appendChild(document.createTextNode(part.slice(last)));
  });
  return parent;
}
function para(text, cls){ return rich(el("p", cls), text); }

var toastTimer;
function toast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("on"); }, 1400);
}
function copy(text){
  function fallback(){
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    toast(ok ? "Copied" : "Copy failed");
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function(){ toast("Copied"); }, fallback);
  } else fallback();
}
function copyBtn(text, label){
  var b = el("button", "btn small", label || "Copy");
  b.type = "button";
  b.setAttribute("aria-label", (label || "Copy") + ": " + text.slice(0, 60));
  b.addEventListener("click", function(){ copy(text); });
  return b;
}

// repo paths mentioned in the analyst's "where it goes" text
function pathsFrom(text){
  var out = [], seen = {};
  String(text || "").replace(/\`([^\`]+)\`/g, function(_, p){
    var q = p.trim();
    if (/[\/\\]|\.\w{2,4}$/.test(q) && !/\s{2,}/.test(q) && q.length < 140 && !seen[q]) { seen[q] = 1; out.push(q); }
    return _;
  });
  return out;
}
function chipRow(paths){
  var row = el("div", "chips");
  paths.forEach(function(p){
    var w = el("span", "chipwrap");
    w.appendChild(el("span", "chip", p));
    w.appendChild(copyBtn(p, "Copy path"));
    row.appendChild(w);
  });
  return row;
}
function section(title, node){
  var s = el("div", "sec");
  s.appendChild(el("h4", null, title));
  s.appendChild(node);
  return s;
}

function renderCard(f){
  var c = el("article", "card"); c.id = f.id;
  var meta = el("div", "meta");
  meta.appendChild(el("span", "id", f.id));
  var b = el("span", "badge " + f.status, STATUS_LABEL[f.status]); meta.appendChild(b);
  meta.appendChild(el("span", "pill " + (f.verdict === "unclear" ? "" : f.verdict), "Analyst: " + f.verdict));
  meta.appendChild(el("span", "pill", "Effort " + f.effort));
  f.tags.forEach(function(t){ meta.appendChild(el("span", "pill", t)); });
  c.appendChild(meta);
  c.appendChild(rich(el("h3"), f.title));
  c.appendChild(section("What it is", para(f.what)));
  var why = section("Why it is good", para(f.why));
  if (f.evidence) {
    var ev = el("div", "evidence " + f.evidenceLevel);
    ev.appendChild(el("b", null, EVIDENCE_LABEL[f.evidenceLevel] + ". "));
    rich(ev, f.evidence);
    why.appendChild(ev);
  }
  if (!f.evidence) {
    var ev0 = el("div", "evidence unknown", "Evidence level not stated by the analyst.");
    why.appendChild(ev0);
  }
  c.appendChild(why);

  var land = el("div");
  if (f.ledger.length) {
    f.ledger.forEach(function(e){
      var box = el("div", "ledger");
      var head = el("div", "meta");
      head.appendChild(el("span", "badge " + e.status, STATUS_LABEL[e.status]));
      head.appendChild(el("span", "who", "reported by " + e.by));
      box.appendChild(head);
      if (e.why) box.appendChild(para(e.why));
      if (e.paths.length) box.appendChild(chipRow(e.paths));
      if (e.note) box.appendChild(para(e.note, "src"));
      land.appendChild(box);
    });
  } else {
    land.appendChild(para("No ledger entry yet. Nothing from this finding is recorded as landed.", "planned"));
  }
  c.appendChild(section("Where it landed", land));

  var det = el("details");
  det.appendChild(el("summary", null, "Analyst verdict and proposed placement"));
  var adopt = para(f.adopt); adopt.className = "src"; det.appendChild(section("Adopt?", adopt));
  var wh = para(f.where, "src"); det.appendChild(section("Where the analyst proposed it", wh));
  var pp = pathsFrom(f.where);
  if (pp.length) det.appendChild(chipRow(pp));
  c.appendChild(det);

  c.appendChild(section("Source and credit", para(f.source, "src")));
  return c;
}

var state = {};
var cardNodes = {};
function haystack(f){
  return [f.id, f.title, f.tags.join(" "), f.what, f.why, f.evidence, f.adopt, f.where, f.source,
    f.ledger.map(function(e){ return e.why + " " + e.note + " " + e.paths.join(" "); }).join(" ")].join(" ").toLowerCase();
}
function applyFilters(){
  var q = document.getElementById("q").value.trim().toLowerCase();
  var cat = document.getElementById("f-cat").value;
  var ver = document.getElementById("f-verdict").value;
  var st = document.getElementById("f-status").value;
  var ef = document.getElementById("f-effort").value;
  var sl = document.getElementById("f-slice").value;
  var sort = document.getElementById("f-sort").value;
  var list = DATA.findings.filter(function(f){
    if (cat && f.tags.indexOf(cat) < 0) return false;
    if (ver && f.verdict !== ver) return false;
    if (st && f.status !== st) return false;
    if (ef && f.effort !== ef) return false;
    if (sl && f.slice !== sl) return false;
    if (q && haystack(f).indexOf(q) < 0) return false;
    return true;
  });
  var cmp = {
    rank: function(a,b){ return a.slice < b.slice ? -1 : a.slice > b.slice ? 1 : a.n - b.n; },
    status: function(a,b){ return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; },
    effort: function(a,b){ return EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort]; },
    verdict: function(a,b){ return VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]; },
    title: function(a,b){ return a.title.localeCompare(b.title); }
  }[sort];
  list = list.slice().sort(function(a,b){ return cmp(a,b) || (a.slice < b.slice ? -1 : a.slice > b.slice ? 1 : a.n - b.n); });
  var host = document.getElementById("cards");
  while (host.firstChild) host.removeChild(host.firstChild);
  list.forEach(function(f){ host.appendChild(cardNodes[f.id]); });
  document.getElementById("resultcount").textContent = "Showing " + list.length + " of " + DATA.findings.length + " findings";
  document.getElementById("none").hidden = list.length > 0;
}

function renderCounts(){
  var counts = {total: DATA.findings.length, landed:0, partial:0, deferred:0, rejected:0, none:0};
  DATA.findings.forEach(function(f){ counts[f.status]++; });
  var host = document.getElementById("counts");
  [["total","Findings"],["landed","Landed"],["partial","Partial"],["deferred","Deferred"],["rejected","Rejected"],["none","Not adopted"]].forEach(function(p){
    var d = el("div", "count " + p[0]);
    d.appendChild(el("b", null, String(counts[p[0]])));
    d.appendChild(el("span", null, p[1]));
    host.appendChild(d);
  });
  var pend = document.getElementById("pending");
  pend.textContent = DATA.ledgers.length
    ? "Studio status from " + DATA.ledgers.length + " ledger file" + (DATA.ledgers.length === 1 ? "" : "s") + ": " + DATA.ledgers.join(", ") + "."
    : "No ledger files found yet, so every finding shows as not adopted. Regenerate this page once the ledgers exist.";
  return counts;
}

function renderPicks(counts){
  var host = document.getElementById("picks");
  var pool = DATA.findings.filter(function(f){ return f.status === "landed"; });
  var title = document.getElementById("picks-title");
  if (!pool.length) {
    title.textContent = "Top picks (analyst ranking, nothing has landed yet)";
    pool = DATA.findings.filter(function(f){ return f.verdict === "yes"; });
  } else title.textContent = "Top picks: landed in the studio";
  pool = pool.slice().sort(function(a,b){
    return (VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]) || (EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort]) || (a.n - b.n);
  }).slice(0, 6);
  pool.forEach(function(f){
    var b = el("button", "pick"); b.type = "button";
    b.appendChild(el("small", null, f.id + " , " + STATUS_LABEL[f.status] + " , effort " + f.effort));
    b.appendChild(rich(el("strong"), f.title));
    b.addEventListener("click", function(){
      var node = cardNodes[f.id];
      document.getElementById("f-status").value = ""; document.getElementById("f-verdict").value = "";
      document.getElementById("f-cat").value = ""; document.getElementById("f-effort").value = "";
      document.getElementById("f-slice").value = ""; document.getElementById("q").value = "";
      applyFilters();
      node.scrollIntoView({behavior: "smooth", block: "start"});
      node.classList.add("flash");
      setTimeout(function(){ node.classList.remove("flash"); }, 1500);
    });
    host.appendChild(b);
  });
}

function fillSelects(){
  var cats = {};
  DATA.findings.forEach(function(f){ f.tags.forEach(function(t){ cats[t] = (cats[t] || 0) + 1; }); });
  var sel = document.getElementById("f-cat");
  sel.appendChild(new Option("All", ""));
  Object.keys(cats).sort().forEach(function(t){ sel.appendChild(new Option(t + " (" + cats[t] + ")", t)); });
  var sl = document.getElementById("f-slice");
  sl.appendChild(new Option("All", ""));
  Object.keys(DATA.slices).forEach(function(k){ sl.appendChild(new Option(k + ": " + DATA.slices[k].label + " (" + DATA.slices[k].count + ")", k)); });
}

function renderPatterns(){
  var host = document.getElementById("patterns");
  DATA.patterns.forEach(function(p){
    var box = el("div", "pattern");
    box.appendChild(el("h3", null, p.slice + p.n + ". " + (p.title || "Pattern")));
    var pre = el("pre"); rich(pre, p.body); box.appendChild(pre);
    var row = el("div", "meta");
    row.appendChild(copyBtn(p.body, "Copy skeleton"));
    if (p.credit) { var cr = el("span", "src"); cr.appendChild(document.createTextNode("Credit: ")); rich(cr, p.credit); row.appendChild(cr); }
    box.appendChild(row);
    host.appendChild(box);
  });
  if (!DATA.patterns.length) host.appendChild(el("div", "empty", "No prompt patterns found."));
}
function renderRejected(){
  var host = document.getElementById("rejected");
  DATA.rejected.forEach(function(r){
    var box = el("div", "rej");
    box.appendChild(el("h3", null, (r.title || "Note") + " (slice " + r.slice + ")"));
    box.appendChild(para(r.body));
    host.appendChild(box);
  });
  if (!DATA.rejected.length) host.appendChild(el("div", "empty", "Nothing listed."));
}
function renderAbout(){
  var host = document.getElementById("about");
  function block(title, items){
    host.appendChild(el("h2", null, title));
    var ul = el("ul");
    items.forEach(function(t){ var li = el("li"); rich(li, t); ul.appendChild(li); });
    host.appendChild(ul);
  }
  block("What this is", [
    "Three analysts read the 73 items in the research gallery and wrote 50 findings: 18 from GitHub and web (A), 18 from X and YouTube (B), 14 from Reddit and social (C).",
    "Each finding says what it is, why it is good, whether the studio should adopt it, and where it would go. Integrators then adopted them into skills, studio code and prompts and logged the result in ledger files; the status badges come from those.",
    "Status is from the ledger: landed, partial, deferred or rejected. A finding with no ledger entry shows as not adopted yet."
  ]);
  block("How verification works", [
    "Nobody watched any video. Analysts read READMEs, prompts, post text, comment trees and article text.",
    "The evidence line on each card says how far the claim goes: shown means a finished film or post exists and the method is written out; claimed means the author says so with no demonstration; doc-level means the method was read but the result was not seen.",
    "A reported number (frozen seconds, hours saved, cost per video) is the author's own figure unless a card says otherwise."
  ]);
  block("Caveats", [
    "The Reddit mirror used for the gallery returned wrong post ids for some entries. Analyst C found that id 1sya1rc is the question about slick demo videos and 1sw2dtm is an unrelated Three.js post. The gallery data was corrected and the app launch post by Tarun122 is marked unconfirmed.",
    "Reddit vote counts in the findings come from an archive snapshot and are often lower than the gallery's.",
    "All TikTok and Instagram items could not be opened; they are leads only and sit under Rejected or weak.",
    "Several sources are vendor posts or promotional; the analysts flag those and kept only the technique."
  ]);
  block("Licence and credit", [
    "Prompts and repos belong to their authors. This page paraphrases the method in the analysts' words and links to the source. No prompt text is republished as ours; if you reuse a pattern in a brief, credit the author.",
    "Every source link opens in a new tab and carries the author's name or handle as the analysts recorded it."
  ]);
  var names = {A: "GitHub and web", B: "X and YouTube", C: "Reddit and social"};
  Object.keys(DATA.notes).forEach(function(k){
    if (DATA.notes[k] && DATA.notes[k].length) block("Analyst notes, slice " + k + " (" + names[k] + ")", DATA.notes[k].map(function(n){ return (n.title ? n.title + ". " : "") + n.body; }));
  });
}

function setTab(name){
  ["findings","prompts","rejected","about"].forEach(function(t){
    document.getElementById("panel-" + t).hidden = t !== name;
    document.getElementById("tab-" + t).setAttribute("aria-selected", t === name ? "true" : "false");
  });
}
function setTheme(t){
  if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
}
function currentIsDark(){
  var a = document.documentElement.getAttribute("data-theme");
  if (a) return a === "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

document.getElementById("gen").textContent = DATA.generated;
fillSelects();
DATA.findings.forEach(function(f){ cardNodes[f.id] = renderCard(f); });
var counts = renderCounts();
renderPicks(counts);
renderPatterns(); renderRejected(); renderAbout();
["q","f-cat","f-verdict","f-status","f-effort","f-slice","f-sort"].forEach(function(id){
  document.getElementById(id).addEventListener(id === "q" ? "input" : "change", applyFilters);
});
document.getElementById("reset").addEventListener("click", function(){
  document.getElementById("q").value = "";
  ["f-cat","f-verdict","f-status","f-effort","f-slice"].forEach(function(id){ document.getElementById(id).value = ""; });
  document.getElementById("f-sort").value = "rank";
  applyFilters();
});
Array.prototype.forEach.call(document.querySelectorAll("nav.tabs button"), function(b){
  b.addEventListener("click", function(){ setTab(b.getAttribute("data-tab")); });
});
document.getElementById("theme").addEventListener("click", function(){
  var next = currentIsDark() ? "light" : "dark";
  setTheme(next);
  try { localStorage.setItem("findings-theme", next); } catch (e) {}
});
try { var saved = localStorage.getItem("findings-theme"); if (saved === "light" || saved === "dark") setTheme(saved); } catch (e) {}
applyFilters();
})();
</script>
</body>
</html>
`;

const BS = String.fromCharCode(92);
const esc = (code) => BS + "u" + code;
const payload = JSON.stringify(data)
  .replace(/</g, esc("003c"))
  .replace(/>/g, esc("003e"))
  .replace(/&/g, esc("0026"))
  .split(String.fromCharCode(0x2028)).join(esc("2028"))
  .split(String.fromCharCode(0x2029)).join(esc("2029"));
const html = TEMPLATE.replace("/*__DATA__*/", () => payload);
writeFileSync(join(HERE, "index.html"), html, "utf8");

console.log(
  `index.html written: ${counts.total} findings (landed ${counts.landed}, partial ${counts.partial}, deferred ${counts.deferred}, rejected ${counts.rejected}, not adopted ${counts.none}); ` +
    `${patterns.length} prompt patterns, ${rejected.length} rejected notes, ledgers: ${ledger.files.join(", ") || "none"}; ${warnings.length} warning(s)`
);
