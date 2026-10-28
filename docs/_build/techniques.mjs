// TECHNIQUES panel: docs/techniques/index.html
// "The methods and rules that earned their place": every research finding that landed (or partly landed)
// in the studio, read at build time from research/findings/{A,B,C}-*.md and research/findings/ledger/*.json.
// Repo text is data: parsed, escaped, rendered through md.mjs / esc(). Never passed through as HTML.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { esc, page, safeUrl } from './template.mjs';
import { renderMarkdown } from './md.mjs';
import { css, ghUrl, inlineText, readText } from './studio.mjs';

const SLICES = [
  { id: 'A', file: 'A-github-web.md' },
  { id: 'B', file: 'B-x-youtube.md' },
  { id: 'C', file: 'C-reddit-social.md' },
];
const RANK = { landed: 4, partial: 3, deferred: 2, rejected: 1 };

const CATEGORIES = [
  ['direction', 'Direction', 'Idea, hook, story and the look of a film before any code.'],
  ['camera', 'Camera', 'Moving the world, not the objects: speed curves, zoom and framing.'],
  ['transitions', 'Transitions', 'How one scene becomes the next.'],
  ['typography', 'Typography and copy', 'What the words say, how many, and how they arrive.'],
  ['sound', 'Sound', 'Hits, music, mix and sync.'],
  ['pipeline', 'Pipeline and tooling', 'Scripts, helpers and measured checks that remove guessing.'],
  ['qa', 'QA and review', 'Judging the render, with a reviewer who did not build it.'],
  ['prompting', 'Prompting', 'How to ask so the first draft is already close.'],
  ['process', 'Process', 'Staging the work so it does not drift or regress.'],
  ['other', 'Other', ''],
];
const CAT_RE = [
  ['qa', /\bqa\b|review/i],
  ['prompting', /prompt/i],
  ['process', /process/i],
  ['sound', /sound|audio|music/i],
  ['transitions', /transition/i],
  ['typography', /typograph|copy|type\b/i],
  ['camera', /camera/i],
  ['pipeline', /pipeline|tool/i],
  ['direction', /direction|taste|design/i],
];

function categoryOf(raw) {
  let best = null;
  for (const [id, re] of CAT_RE) {
    const m = re.exec(raw || '');
    if (m && (!best || m.index < best.index)) best = { id, index: m.index };
  }
  return best ? best.id : 'other';
}

/* ------------------------------ parsing ------------------------------ */

const FIELD = { category: 'category', 'what it is': 'what', 'why it is good': 'why', 'adopt?': 'adopt', 'where it goes': 'where', effort: 'effort', source: 'source' };

function parseFindings(lines) {
  const out = [];
  let cur = null;
  let field = null;
  for (const line of lines) {
    const hm = /^###\s+(F-([ABC])(\d+)):\s*(.*\S)\s*$/.exec(line);
    if (hm) {
      if (cur) out.push(cur);
      cur = { id: hm[1], slice: hm[2], n: Number(hm[3]), title: hm[4], category: '', what: '', why: '', adopt: '', where: '', effort: '', source: '' };
      field = null;
      continue;
    }
    if (!cur) continue;
    if (/^---/.test(line)) {
      field = null;
      continue;
    }
    const b = /^-\s+\*\*([^*]+?)\*\*\s*:?\s*(.*)$/.exec(line);
    if (b) {
      const key = FIELD[b[1].replace(/:\s*$/, '').trim().toLowerCase()];
      if (key) {
        field = key;
        cur[key] = b[2].trim();
        continue;
      }
    }
    if (field && line.trim() && !/^#/.test(line)) cur[field] += ' ' + line.trim();
    else if (!line.trim()) field = null;
  }
  if (cur) out.push(cur);
  return out;
}

function sections(md) {
  const out = [{ heading: '', lines: [] }];
  for (const line of md.split('\n')) {
    const m = /^##\s+(.*\S)\s*$/.exec(line);
    if (m && !line.startsWith('###')) out.push({ heading: m[1], lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

function parseNumbered(lines) {
  const items = [];
  let cur = null;
  for (const line of lines) {
    const m = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (m) {
      if (cur) items.push(cur);
      cur = { n: Number(m[1]), raw: m[2].trim() };
    } else if (cur && line.trim() && !/^#/.test(line)) cur.raw += ' ' + line.trim();
    else if (cur && !line.trim()) {
      items.push(cur);
      cur = null;
    }
  }
  if (cur) items.push(cur);
  return items.map((it) => {
    const t = /^\*\*(.+?)\*\*\s*(.*)$/.exec(it.raw);
    const credit = /\bCredit:\s*(.*)$/.exec(it.raw);
    return { n: it.n, title: t ? t[1].replace(/[.:]\s*$/, '') : it.raw.slice(0, 60), body: t ? t[2] : it.raw, credit: credit ? credit[1].trim() : '' };
  });
}

function parseBullets(lines) {
  const items = [];
  let cur = null;
  for (const line of lines) {
    const m = /^-\s+(.*)$/.exec(line);
    if (m) {
      if (cur) items.push(cur);
      cur = m[1].trim();
    } else if (cur && line.trim() && !/^#/.test(line)) cur += ' ' + line.trim();
    else if (cur && !line.trim()) {
      items.push(cur);
      cur = null;
    }
  }
  if (cur) items.push(cur);
  return items.map((raw) => {
    const t = /^\*\*(.+?)\*\*\s*(.*)$/.exec(raw);
    return t ? { title: t[1].replace(/[.:]\s*$/, ''), body: t[2].trim() } : { title: '', body: raw };
  });
}

function evidenceOf(why) {
  const m = /(Strength|Evidence)\s*:/.exec(why);
  if (!m) return { main: why, clause: '', level: 'unrated' };
  const main = why.slice(0, m.index).trim();
  const clause = why.slice(m.index).trim();
  const low = clause.toLowerCase();
  let level = 'unrated';
  if (/only claimed|not shown|not demonstrated|opinion|ai summary|claimed by|described,|described by|did not watch|not verified|claimed/.test(low)) level = 'claimed';
  else if (/doc-level/.test(low)) level = 'doc';
  else if (/shown|finished|posted|consistent across|failure-derived|precise|documented|reported|first-hand/.test(low)) level = 'shown';
  return { main, clause, level };
}
const EVIDENCE = {
  shown: ['Shown in a finished film', 'ok'],
  doc: ['Documented method', ''],
  claimed: ['Only claimed', 'warn'],
  unrated: ['Evidence not rated', 'plain'],
};

function firstSentences(text, max = 330) {
  const t = text.trim();
  if (t.length <= max) return { head: t, tail: '' };
  const re = /[.!?](\s|$)/g;
  let cut = -1;
  let m;
  while ((m = re.exec(t))) {
    if (m.index + 1 > max) break;
    cut = m.index + 1;
  }
  if (cut < 80) cut = t.lastIndexOf(' ', max);
  return { head: t.slice(0, cut).trim(), tail: t.slice(cut).trim() };
}

function readLedgers(dir) {
  const by = new Map();
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return by;
  }
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    } catch {
      continue;
    }
    const arr = Array.isArray(data) ? data : Array.isArray(data?.entries) ? data.entries : [];
    for (const e of arr) {
      if (!e || typeof e.id !== 'string') continue;
      const status = String(e.status || '').toLowerCase();
      if (!RANK[status]) continue;
      if (!by.has(e.id)) by.set(e.id, []);
      by.get(e.id).push({ status, paths: Array.isArray(e.paths) ? e.paths.map(String) : [], why: String(e.why || ''), note: String(e.note || '') });
    }
  }
  return by;
}

function mergeEntry(list) {
  const best = list.reduce((a, b) => (RANK[b.status] > RANK[a.status] ? b : a));
  const paths = [...new Set(list.flatMap((x) => x.paths))];
  const notes = [...new Set(list.map((x) => x.note).filter(Boolean))];
  const whys = [...new Set(list.map((x) => x.why).filter(Boolean))];
  return { status: best.status, paths, notes, whys };
}

/* ------------------------------ rendering ------------------------------ */

const md = (text) => renderMarkdown(String(text || ''), { stripFrontmatter: false }).html;

function pathChip(repoDir, p) {
  const clean = p.replace(/^\.?\//, '').replace(/\\/g, '/');
  if (/[*\s]/.test(clean) || /^[a-z]+:/i.test(clean) || clean.includes('..')) return `<span class="ps-chip path">${esc(clean)}</span>`;
  const isDir = clean.endsWith('/');
  const exists = existsSync(join(repoDir, clean));
  const href = ghUrl(clean.replace(/\/$/, ''), isDir ? 'tree' : 'blob');
  return `<a class="ps-chip path${exists ? '' : ' missing'}" href="${esc(href)}" rel="noopener noreferrer" title="${esc(clean)}">${esc(clean.length > 54 ? '...' + clean.slice(-51) : clean)}</a>`;
}

function creditHtml(source) {
  if (!source) return '';
  return `<p class="pt-credit"><span>Credit</span> ${inlineText(source)}</p>`;
}

function card(f, e, root, repoDir) {
  const cat = categoryOf(f.category);
  const ev = evidenceOf(f.why);
  const what = firstSentences(f.what);
  const effort = (/^\s*([SML])\b/.exec(f.effort) || [])[1] || '';
  const effortLabel = { S: 'Small effort', M: 'Medium effort', L: 'Large effort' }[effort] || '';
  const [evLabel, evKind] = EVIDENCE[ev.level];
  const search = [f.id, f.title, f.what, ev.main, e.paths.join(' ')].join(' ').toLowerCase();
  const note = e.notes.join(' ');
  return (
    `<article class="pt-card" id="${esc(f.id)}" data-cat="${cat}" data-ev="${ev.level}" data-status="${e.status}" data-text="${esc(search.slice(0, 900))}">` +
    `<header><span class="pt-id">${esc(f.id)}</span><h3>${inlineText(f.title)}</h3></header>` +
    `<p class="pt-badges"><span class="badge ${e.status === 'landed' ? 'ok' : 'warn'}">${e.status === 'landed' ? 'Landed' : 'Partly landed'}</span>` +
    `<span class="badge ${evKind}" title="${esc(ev.clause)}">${esc(evLabel)}</span>` +
    (effortLabel ? `<span class="badge plain">${esc(effortLabel)}</span>` : '') +
    `</p>` +
    `<div class="pt-block"><h4>The technique</h4>${md(what.head)}${what.tail ? `<details><summary>More</summary>${md(what.tail)}</details>` : ''}</div>` +
    `<div class="pt-block"><h4>Why it earned its place</h4>${md(ev.main)}${ev.clause ? `<p class="pt-ev"><span>Evidence</span> ${inlineText(ev.clause.replace(/^(Strength|Evidence)\s*:\s*/i, ''))}</p>` : ''}</div>` +
    (note ? `<div class="pt-block"><h4>${e.status === 'partial' ? 'What landed, and what did not' : 'What landed'}</h4>${md(note)}</div>` : '') +
    (e.paths.length ? `<div class="pt-block"><h4>Where it lives</h4><p class="ps-chips">${e.paths.map((p) => pathChip(repoDir, p)).join('')}</p></div>` : '') +
    creditHtml(f.source) +
    `<p class="pt-links"><a href="${root}research/#${esc(f.id)}">Open in the research findings</a></p>` +
    `</article>`
  );
}

const RULES = [
  {
    t: 'Deterministic frames',
    p: 'Every frame is a pure function of the frame number or the time. No CSS transitions, no timers, no random numbers (seeded random only). The same frame must always render the same pixels, so a still you inspect is exactly what ships.',
    paths: ['studio/DESIGN_SYSTEM.md', 'studio/eslint.config.mjs', 'CLAUDE.md'],
  },
  {
    t: 'One focal point',
    p: 'Each moment has one thing to look at, and the accent colour marks it. Stage, do not stack: the lower third leaves before the captions arrive.',
    paths: ['studio/DESIGN_SYSTEM.md'],
  },
  {
    t: 'Real numbers only',
    p: 'Every figure, label and UI on screen comes from the script or a real source. No invented dashboards, no placeholder data that looks real.',
    paths: ['skills/motion-studio/references/banned-effects.md', 'studio/src/lib/tokens.ts'],
  },
  {
    t: 'Judge rendered frames, not code',
    p: 'Quality is decided by looking at stills, contact sheets and phone-size sheets of the render, ideally by a reviewer who did not build it. If nobody could look, the report says so.',
    paths: ['CLAUDE.md', 'skills/motion-review/SKILL.md', 'skills/motion-review/references/rubric.md'],
  },
  {
    t: 'Never one-shot a film',
    p: 'Brief, three directions, storyboard, one golden scene, a scored review, then the rest. Each stage ends with an approval stop, because the cheapest time to change a film is before it is built.',
    paths: ['prompts/00-master-workflow.md', 'skills/motion-studio/references/workflow.md', 'skills/motion-studio/references/golden-scene.md'],
  },
  {
    t: 'A banned-effects list per film',
    p: 'The brief names what this film must never do (glows, particle bursts, bounce, stock-template looks), seeded from a global list. The reviewer checks it at the storyboard, after scene one, and on the final sheet.',
    paths: ['skills/motion-studio/references/banned-effects.md'],
  },
  {
    t: 'No plain templated looks',
    p: 'One accent, restrained motion, a distinct idea per film. Anything that looks like a stock template gets rewritten, however clean it is.',
    paths: ['skills/motion-studio/references/banned-effects.md', 'studio/DESIGN_SYSTEM.md'],
  },
];

const SCRIPT = `<script>
(function(){
  var q=document.getElementById('pt-q'),cat=document.getElementById('pt-cat'),ev=document.getElementById('pt-ev'),st=document.getElementById('pt-st');
  if(!q)return;
  var cards=[].slice.call(document.querySelectorAll('#methods .pt-card'));
  var groups=[].slice.call(document.querySelectorAll('.pt-group'));
  var out=document.getElementById('pt-count'),empty=document.getElementById('pt-empty'),reset=document.getElementById('pt-reset');
  function apply(){
    var t=q.value.trim().toLowerCase(),shown=0;
    cards.forEach(function(c){
      var ok=(!t||c.getAttribute('data-text').indexOf(t)>-1||c.id.toLowerCase()===t)&&(!cat.value||c.dataset.cat===cat.value)&&(!ev.value||c.dataset.ev===ev.value)&&(!st.value||c.dataset.status===st.value);
      c.classList.toggle('hidden',!ok);if(ok)shown++;
    });
    groups.forEach(function(g){g.classList.toggle('hidden',!g.querySelector('.pt-card:not(.hidden)'));});
    out.textContent='Showing '+shown+' of '+cards.length;
    empty.classList.toggle('hidden',shown>0);
    var dirty=!!(t||cat.value||ev.value||st.value);reset.classList.toggle('hidden',!dirty);
  }
  [q,cat,ev,st].forEach(function(el){el.addEventListener('input',apply);el.addEventListener('change',apply);});
  reset.addEventListener('click',function(){q.value='';cat.value='';ev.value='';st.value='';apply();q.focus();});
  [].slice.call(document.querySelectorAll('[data-pick-cat]')).forEach(function(a){a.addEventListener('click',function(){cat.value='';apply();});});
  apply();
})();
</script>`;

export default async function build({ repo, docs }) {
  const root = '../';
  const findDir = join(repo, 'research', 'findings');
  const ledger = readLedgers(join(findDir, 'ledger'));

  const findings = new Map();
  const patterns = new Map();
  const weak = [];
  for (const s of SLICES) {
    const text = readText(join(findDir, s.file));
    if (!text) continue;
    const secs = sections(text);
    const all = secs.flatMap((x) => x.lines);
    for (const f of parseFindings(secs.some((x) => /^findings/i.test(x.heading)) ? secs.filter((x) => /^findings/i.test(x.heading)).flatMap((x) => x.lines) : all)) findings.set(f.id, f);
    for (const sec of secs) {
      if (/^prompt patterns/i.test(sec.heading)) for (const p of parseNumbered(sec.lines)) patterns.set(`PP-${s.id}${p.n}`, { ...p, slice: s.id });
      if (/^rejected/i.test(sec.heading)) for (const b of parseBullets(sec.lines)) weak.push({ ...b, slice: s.id });
    }
  }

  const merged = new Map();
  for (const [id, list] of ledger) merged.set(id, mergeEntry(list));

  const landed = [];
  const rejected = [];
  const deferred = [];
  for (const [id, e] of merged) {
    const f = findings.get(id);
    if (e.status === 'landed' || e.status === 'partial') {
      if (f) landed.push({ f, e });
    } else if (e.status === 'rejected') {
      const p = patterns.get(id);
      rejected.push({ id, f, p, e });
    } else if (e.status === 'deferred' && f) deferred.push({ f, e });
  }
  // findings with no ledger entry yet are shown nowhere on this page; they live in the research viewer.
  const order = (a, b) => RANK[b.e.status] - RANK[a.e.status] || a.f.slice.localeCompare(b.f.slice) || a.f.n - b.f.n;
  landed.sort(order);
  deferred.sort(order);

  const byCat = new Map(CATEGORIES.map(([id]) => [id, []]));
  for (const x of landed) byCat.get(categoryOf(x.f.category)).push(x);
  const cats = CATEGORIES.filter(([id]) => byCat.get(id).length);

  const nLanded = landed.filter((x) => x.e.status === 'landed').length;
  const nPartial = landed.length - nLanded;

  const toc = [{ id: 'rules', text: 'The rules we never break' }, { id: 'methods', text: `Methods that earned their place (${landed.length})` }];
  const catToc = cats.map(([id, label]) => ({ id: 'cat-' + id, text: `${label} (${byCat.get(id).length})`, level: 3 }));
  toc.push(...catToc);
  toc.push({ id: 'rejected', text: `Considered and rejected (${rejected.length})` });
  if (deferred.length) toc.push({ id: 'later', text: `Not yet (${deferred.length})` });

  const repoDir = repo;
  const rulesHtml = RULES.map((r, i) => {
    const chips = r.paths.filter((p) => existsSync(join(repo, p))).map((p) => pathChip(repo, p)).join('');
    return `<li class="pt-rule"><span class="n">${i + 1}</span><div><h3>${esc(r.t)}</h3><p>${esc(r.p)}</p>${chips ? `<p class="ps-chips">${chips}</p>` : ''}</div></li>`;
  }).join('');

  const catOptions = cats.map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join('');
  const usedEv = new Set(landed.map((x) => evidenceOf(x.f.why).level));
  const evOptions = Object.entries(EVIDENCE).filter(([k]) => usedEv.has(k)).map(([k, v]) => `<option value="${k}">${esc(v[0])}</option>`).join('');

  const groupsHtml = cats
    .map(
      ([id, label, blurb]) =>
        `<section class="pt-group" id="cat-${id}"><h3 class="pt-cat">${esc(label)} <small>${byCat.get(id).length}</small></h3>${blurb ? `<p class="pt-blurb">${esc(blurb)}</p>` : ''}` +
        `<div class="pt-cards">${byCat.get(id).map((x) => card(x.f, x.e, root, repoDir)).join('')}</div></section>`
    )
    .join('');

  const rejectedHtml = rejected
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map((r) => {
      const title = r.f ? r.f.title : r.p ? r.p.title : r.id;
      const reason = r.e.whys.join(' ') || r.e.notes.join(' ');
      const wf = r.f ? firstSentences(r.f.what, 260) : r.p ? firstSentences(r.p.body, 260) : { head: '', tail: '' };
      const what = wf.head + (wf.tail ? ' ...' : '');
      const source = r.f ? r.f.source : r.p ? r.p.credit : '';
      return (
        `<article class="pt-card rej" id="${esc(r.id)}"><header><span class="pt-id">${esc(r.id)}</span><h3>${inlineText(title)}</h3></header>` +
        `<p class="pt-badges"><span class="badge bad">Rejected</span></p>` +
        (what ? `<div class="pt-block"><h4>What it was</h4>${md(what)}</div>` : '') +
        `<div class="pt-block why-no"><h4>Why it stays out</h4>${md(reason || 'Does not fit the studio taste.')}</div>` +
        (source ? creditHtml(source) : '') +
        `<p class="pt-links"><a href="${root}research/#${esc(r.id)}">Open in the research findings</a></p></article>`
      );
    })
    .join('');

  const weakHtml = weak.length
    ? `<h3>Sources set aside</h3><p class="ps-lead">Whole sources, patterns and house styles that were read and left out.</p><ul class="pt-weak">${weak
        .map((w) => `<li>${w.title ? `<strong>${inlineText(w.title)}</strong> ` : ''}${inlineText(w.body)}</li>`)
        .join('')}</ul>`
    : '';

  const deferredHtml = deferred.length
    ? `<section id="later" class="ps-sec"><h2>Not yet</h2><p class="ps-lead">Good ideas that wait for the right film or enough effort. They are queued, not forgotten.</p><ul class="pt-weak">${deferred
        .map((x) => `<li><a href="${root}research/#${esc(x.f.id)}"><strong>${esc(x.f.id)}</strong></a> ${inlineText(x.f.title)}${x.e.whys[0] ? `<br><span class="ps-dim">${inlineText(firstSentences(x.e.whys[0], 220).head)}</span>` : ''}</li>`)
        .join('')}</ul></section>`
    : '';

  const empty = !landed.length;
  const main =
    `<header class="ps-hero"><p class="eyebrow">Techniques</p><h1>The methods and rules that earned their place</h1>` +
    `<p class="lead">${findings.size} ideas were collected from public repos, articles, posts and videos. These are the ones that survived a test against the studio's taste and were built into it, with where they live and who they came from.</p></header>` +
    `<ul class="ps-stats" aria-label="At a glance"><li><b>${nLanded}</b><span>landed</span></li><li><b>${nPartial}</b><span>partly landed</span></li><li><b>${rejected.length}</b><span>rejected</span></li><li><b>${deferred.length}</b><span>queued</span></li></ul><!--mtoc-->` +
    `<section id="rules" class="ps-sec"><h2>The rules we never break</h2><p class="ps-lead">Seven rules sit above every technique. A film that breaks one is not finished.</p><ol class="pt-rules">${rulesHtml}</ol></section>` +
    `<section id="methods" class="ps-sec"><h2>Methods that earned their place</h2>` +
    `<p class="ps-lead">Every card says what the technique is, why it is good and how well that is evidenced, where it lives in the repo, and who to thank. <strong>Evidence</strong> is honest: a technique shown in a finished film is stronger than one that is only claimed.</p>` +
    (empty
      ? `<p class="ps-note">No technique has landed in the ledgers yet. This page fills in as the research is integrated.</p>`
      : `<form class="filters pt-filters" role="search" onsubmit="return false"><input type="search" id="pt-q" placeholder="Search techniques, files, authors" aria-label="Search techniques">` +
        `<select id="pt-cat" aria-label="Category"><option value="">All categories</option>${catOptions}</select>` +
        `<select id="pt-ev" aria-label="Evidence level"><option value="">Any evidence</option>${evOptions}</select>` +
        `<select id="pt-st" aria-label="Status"><option value="">Landed and partly</option><option value="landed">Landed</option><option value="partial">Partly landed</option></select>` +
        `<button type="button" class="btn ghost hidden" id="pt-reset">Clear</button></form>` +
        `<p class="pt-count" id="pt-count" aria-live="polite"></p>` +
        `<p class="ps-note hidden" id="pt-empty">Nothing matches. Clear a filter or search for something broader.</p>` +
        groupsHtml) +
    `</section>` +
    `<section id="rejected" class="ps-sec"><h2>Considered and rejected, and why</h2><p class="ps-lead">Taste is what you leave out. These were read carefully and turned down, each with the reason.</p>` +
    (rejected.length ? `<div class="pt-cards">${rejectedHtml}</div>` : '<p class="ps-note">Nothing has been rejected yet.</p>') +
    weakHtml +
    `</section>` +
    deferredHtml +
    `<p class="ps-note">Everything here also appears in the <a href="${root}research/">research findings viewer</a>, including the ideas not yet decided. The raw notes are in <a href="${esc(ghUrl('research/findings', 'tree'))}" rel="noopener noreferrer">research/findings</a>.</p>`;

  const tocHtml = `<aside class="doc-toc" data-spy aria-label="On this page"><p class="toc-title">On this page</p><ul>${toc
    .map((t) => `<li class="${t.level === 3 ? 'l3' : ''}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
    .join('')}</ul></aside>`;

  const spy = `<script>
(function(){
  var links=[].slice.call(document.querySelectorAll('[data-spy] a[href^="#"]'));
  var items=[];links.forEach(function(a){var el=document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));if(el)items.push({a:a,el:el});});
  if(!items.length)return;
  var tick=false;
  function update(){tick=false;var cur=null;items.forEach(function(it){if(it.el.getBoundingClientRect().top<=140)cur=it;});links.forEach(function(a){a.classList.remove('active');});if(cur)cur.a.classList.add('active');}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(update);}},{passive:true});
  update();
})();
</script>`;

  const mtoc = `<details class="ps-mtoc"><summary>On this page</summary><ul>${toc.filter((t) => t.level !== 3).map((t) => `<li><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join('')}</ul></details>`;
  const html = page({
    title: 'Techniques',
    desc: 'The methods and rules that earned their place in the studio, with evidence, where they live and who to credit.',
    active: 'techniques',
    root,
    extraHead: css(root),
    body: `<div class="doc"><div class="doc-main ps-main">${main.replace('<!--mtoc-->', mtoc)}</div>${tocHtml}</div>${empty ? '' : SCRIPT}${spy}`,
  });
  const out = join(docs, 'techniques', 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, 'utf8');
  console.log(`techniques: ${nLanded} landed, ${nPartial} partial, ${rejected.length} rejected, ${deferred.length} deferred, ${weak.length} sources set aside`);
  return ['techniques/index.html'];
}
