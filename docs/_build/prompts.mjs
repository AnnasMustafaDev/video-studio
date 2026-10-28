// Prompts panel: docs/prompts/index.html, one page per prompt, one page per learning day.
// Scans prompts/*.md and prompts/learning/*.md at build time. Reads the "which prompt for which purpose"
// content from prompts/INDEX.md and presents it; nothing is hard-coded except stage-group labels by number prefix.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc, REPO } from './template.mjs';
import { renderMarkdown } from './md.mjs';
import {
  readText,
  rel,
  rootFor,
  fixLinks,
  buildLinkMap,
  collectSkills,
  shorten,
  crumbs,
  prevNext,
  CSS_LINK,
} from './skills.mjs';

function listMd(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/* ---------- parsing ---------- */

function splitSections(lines) {
  // top-level "## " sections, fence-aware. Returns { pre: string[], sections: [{title, lines}] }
  const pre = [];
  const sections = [];
  let cur = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^##\s+(.*?)\s*$/);
    if (h) {
      cur = { title: h[1].replace(/`/g, ''), lines: [] };
      sections.push(cur);
    } else (cur ? cur.lines : pre).push(line);
  }
  return { pre, sections };
}

function parsePrompt(repo, file, learning) {
  const text = readText(path.join(repo, file));
  if (text == null) return null;
  const lines = text.split('\n');
  let titleRaw = '';
  const rest = [];
  let inFence = false;
  for (const l of lines) {
    if (/^\s*(```|~~~)/.test(l)) inFence = !inFence;
    if (!titleRaw && !inFence && /^#\s+/.test(l)) titleRaw = l.replace(/^#\s+/, '').trim();
    else rest.push(l);
  }
  const { pre, sections } = splitSections(rest);
  const fields = [];
  const introLines = [];
  for (const l of pre) {
    const m = l.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|?\s*$/);
    if (m) fields.push([m[1].trim(), m[2].trim()]);
    else if (/^\|[\s|:-]*$/.test(l)) continue;
    else introLines.push(l);
  }
  const base = path.basename(file, '.md');
  const tm = titleRaw.match(/^(\d\d|Day \d+)\s*·\s*(.*)$/);
  const num = tm ? tm[1] : base;
  const name = tm ? tm[2] : titleRaw || base;
  const get = (k) => (fields.find(([key]) => key.toLowerCase() === k.toLowerCase()) || [])[1] || '';
  const why = get('Why this exists');
  return {
    file,
    base,
    learning,
    slug: learning ? `learning/${base}` : base,
    sitePath: learning ? `prompts/learning/${base}/` : `prompts/${base}/`,
    num,
    name,
    titleRaw,
    fields,
    purpose: get('Purpose'),
    stage: get('Stage'),
    why,
    evidence: evidenceOf(why),
    intro: introLines.join('\n').trim(),
    sections,
  };
}

function evidenceOf(why) {
  const m = String(why).match(/Evidence[^:]*:\s*([^.;]*)/i);
  if (!m) return null;
  const t = m[1].toLowerCase();
  if (/^\s*only claimed|^\s*claimed|only claimed/.test(t)) return { label: 'Only claimed', tone: 'warn', text: m[1].trim() };
  if (/shown/.test(t)) return { label: 'Shown in films', tone: 'ok', text: m[1].trim() };
  if (/documented|doc-level|first-hand|forensics|methods/.test(t)) return { label: 'Documented', tone: '', text: m[1].trim() };
  return { label: 'Evidence noted', tone: 'plain', text: m[1].trim() };
}

const GROUPS = [
  { key: '0', label: 'Setup and guardrails', hint: '0x. Run once per session; they make every later prompt behave.' },
  { key: '1', label: 'Staged build', hint: '1x. Directions, storyboard, one scene, review, the rest, fixes and revisions.' },
  { key: '23', label: 'Design and references', hint: '2x and 3x. Analyse a reference, find an example, build the component library.' },
  { key: '4', label: 'Briefs', hint: '4x. Write the brief and the shared vocabulary before any code.' },
  { key: '5', label: 'Finishing', hint: '5x. Sound, captions, other formats, final render and delivery.' },
  { key: '6', label: 'Specialised films', hint: '6x. Prompts for a particular kind of piece.' },
  { key: '7', label: 'Process and review', hint: '7x. Commits, pacing, comparisons, taste rules, post-mortems and audits.' },
  { key: '8', label: 'Patterns', hint: '8x. Short reusable skeletons.' },
  { key: 'L', label: 'Learning plan', hint: 'Seven daily exercises that teach the craft in a week.' },
];

function groupOf(p) {
  if (p.learning) return GROUPS.find((g) => g.key === 'L');
  const d = (p.num.match(/^\d/) || [''])[0];
  return GROUPS.find((g) => g.key.includes(d)) || { key: 'x', label: 'Other', hint: '' };
}

/* ---------- INDEX.md ---------- */

function pipelineLanes(block, nums) {
  const lanes = [];
  let cur = null;
  for (const raw of block.split('\n')) {
    const h = raw.match(/^\s*([A-Z]{3,})\b(?:\s*\(([^)]*)\))?/);
    if (h && !/^\s*\d/.test(raw)) {
      cur = { label: h[1][0] + h[1].slice(1).toLowerCase(), note: h[2] || '', nums: [] };
      lanes.push(cur);
    }
    if (!cur) continue;
    const text = raw.replace(/\([^)]*\)/g, (m) => (/^\(\s*\d\d\b(?!\s*s)/.test(m) ? m : ''));
    for (const m of text.matchAll(/(?<![\w:./-])(\d\d)(?![\w:./-])(?!\s*(?:s\b|fps))/g)) {
      if (nums.has(m[1]) && !cur.nums.includes(m[1])) cur.nums.push(m[1]);
    }
  }
  return lanes.filter((l) => l.nums.length);
}

function numLink(md, ctx) {
  // Link bare prompt numbers in recipe lines and in the last column of tables; code spans untouched.
  const { numMap, from } = ctx;
  const doLine = (s) =>
    s
      .split(/(`[^`]*`)/)
      .map((part, i) =>
        i % 2
          ? part
          : part.replace(/(?<![\w:./x-])(\d\d)(?![\w:./x-])(?!\s*(?:s\b|fps|to \d|%))/g, (m, n) =>
              numMap.has(n) ? `[${n}](${rel(from, numMap.get(n))})` : m
            )
      )
      .join('');
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence || /^\s*\*\*/.test(line) || /^\s*#/.test(line)) return line;
      if (/^\s*\|/.test(line)) {
        if (/^\|[\s|:-]+$/.test(line.trim())) return line;
        const cells = line.split('|');
        const li = cells.length - 2;
        if (li < 2) return line;
        cells[li] = doLine(cells[li]);
        return cells.join('|');
      }
      return doLine(line);
    })
    .join('\n');
}

const arrows = (html) => html.replace(/→/g, '<span class="ps-arr" aria-hidden="true">→</span>');

function renderMd(md, ctx, opts = {}) {
  const { nctx, ...rest } = opts;
  let t = fixLinks(md, ctx);
  if (nctx) t = numLink(t, nctx);
  return renderMarkdown(t, { stripFrontmatter: false, ...rest });
}

function inlineMd(value, ctx) {
  const html = renderMd(value, ctx).html;
  const m = html.match(/^<p>([\s\S]*)<\/p>$/);
  return m && !m[1].includes('<p>') ? m[1] : html;
}

/* ---------- pages ---------- */

function promptPage(p, prev, next, ctx) {
  const root = rootFor(p.sitePath);
  const c = { file: p.file, from: p.sitePath, map: ctx.map, repo: ctx.repo };
  const order = ['Purpose', 'Use when', 'Stage', 'Inputs you must fill in', 'Expected output', 'Why this exists', 'Next prompt'];
  const sorted = [...p.fields].sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const info = sorted.length
    ? `<dl class="ps-info ps-info-prompt">` +
      sorted.map(([k, v]) => `<div class="${k === 'Purpose' ? 'wide' : ''}"><dt>${esc(k)}</dt><dd>${inlineMd(v, c)}</dd></div>`).join('') +
      `</dl>`
    : '';

  const intro = p.intro ? `<div class="ps-intro-text">${renderMd(p.intro, c).html}</div>` : '';
  const isAdd = (t) => /studio additions/i.test(t);
  const secHtml = (s, cls) => {
    const md = `## ${s.title}\n${s.lines.join('\n')}`;
    return `<section class="${cls}">${renderMd(md, c).html}</section>`;
  };
  const main = p.sections.filter((s) => !isAdd(s.title)).map((s) => secHtml(s, 'ps-section ps-prompt')).join('');
  const adds = p.sections
    .filter((s) => isAdd(s.title))
    .map((s) => secHtml(s, 'ps-section ps-additions'))
    .join('');

  const badges = [
    `<span class="badge plain">${/^\d/.test(p.num) ? 'Prompt ' + esc(p.num) : esc(p.num)}</span>`,
    `<span class="badge">${esc(groupOf(p).label)}</span>`,
    p.evidence ? `<span class="badge ${p.evidence.tone}">${esc(p.evidence.label)}</span>` : '',
  ].join(' ');

  const link = (x) => (x ? { href: rel(p.sitePath, x.sitePath), label: `${/^\d/.test(x.num) ? x.num + ' · ' : ''}${x.name}` } : null);
  const body =
    crumbs(root, [
      { label: 'Prompts', href: `${root}prompts/` },
      ...(p.learning ? [{ label: 'Learning plan', href: `${root}prompts/#learning-plan` }] : []),
      { label: p.titleRaw || p.base },
    ]) +
    `<div class="ps-narrow"><header class="ps-head"><div class="ps-badges">${badges}</div><h1>${esc(p.name)}</h1></header>` +
    info +
    intro +
    main +
    adds +
    prevNext(link(prev), link(next)) +
    `<p class="ps-small"><a href="${esc(`${REPO}/blob/main/${p.file}`)}" rel="noopener noreferrer">View this prompt on GitHub</a></p></div>`;

  return page({
    title: p.titleRaw || p.name,
    desc: p.purpose ? shorten(p.purpose.replace(/[`*]/g, ''), 200) : `Prompt ${p.num} of the studio prompt library.`,
    active: 'prompts',
    root,
    body,
    extraHead: CSS_LINK(root),
  });
}

const FILTER_SCRIPT = `<script>
(function(){
  var input = document.querySelector('[data-filter-input]');
  if (!input) return;
  function groups(){
    document.querySelectorAll('[data-group]').forEach(function(g){
      var any = g.querySelector('[data-filter-text]:not(.hidden)');
      g.classList.toggle('hidden', !any);
    });
  }
  input.addEventListener('input', function(){ setTimeout(groups, 0); });
  setTimeout(groups, 0);
})();
</script>`;

function indexPage(prompts, learning, ctx, repo) {
  const root = '../';
  const from = 'prompts/';
  const c = { file: 'prompts/INDEX.md', from, map: ctx.map, repo };
  const numMap = new Map(prompts.filter((p) => /^\d\d$/.test(p.num)).map((p) => [p.num, p.sitePath]));
  const byNum = new Map(prompts.filter((p) => /^\d\d$/.test(p.num)).map((p) => [p.num, p]));
  const nctx = { numMap, from };

  const idx = readText(path.join(repo, 'prompts/INDEX.md')) || '';
  const idxLines = idx.split('\n');
  const { sections } = splitSections(idxLines.filter((l, i) => !(i === 0 && /^#\s/.test(l))));
  const find = (re) => sections.find((s) => re.test(s.title));

  // pipeline
  let pipeline = '';
  const pipeSec = find(/pipeline/i);
  if (pipeSec) {
    const sj = pipeSec.lines.join('\n');
    const fence = sj.match(/```[\w-]*\n([\s\S]*?)\n```/);
    const after = fence ? sj.replace(fence[0], '') : sj;
    const lanes = fence ? pipelineLanes(fence[1], byNum) : [];
    const chip = (n) => {
      const p = byNum.get(n);
      let label = p.name.replace(/\s*\(.*$/, '').replace(/^[^:]*:\s+/, '');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      return `<a class="ps-chip" href="${esc(rel(from, p.sitePath))}" title="${esc(p.name)}"><b>${esc(n)}</b> ${esc(shorten(label, 46))}</a>`;
    };
    const visual = lanes.length
      ? `<ol class="ps-lanes">` +
        lanes
          .map(
            (l) =>
              `<li class="ps-lane"><div class="ps-lane-h"><span>${esc(l.label)}</span>${l.note ? `<small>${esc(l.note)}</small>` : ''}</div>` +
              `<div class="ps-lane-c">${l.nums.map(chip).join('<span class="ps-arr" aria-hidden="true">→</span>')}</div></li>`
          )
          .join('') +
        `</ol>`
      : '';
    const raw = fence
      ? `<details class="ps-raw"><summary>Show the original diagram (with the loop and branches)</summary><pre data-nocopy><code>${esc(fence[1])}</code></pre></details>`
      : '';
    pipeline =
      `<h2 id="pipeline">Pipeline for a normal video</h2>` +
      `<p>Read it top to bottom; click a step to open the prompt. In the build lane, <b>12</b>, <b>13</b> and <b>14</b> repeat per scene, and <b>15</b> or <b>16</b> fix what the review finds.</p>` +
      visual +
      raw +
      renderMd(after, c, { nctx }).html;
  }

  // other INDEX sections
  const sec = (re, id, heading, extra = '') => {
    const s = find(re);
    if (!s) return '';
    return `<h2 id="${id}">${esc(heading)}</h2>` + extra + `<div class="ps-tablewrap">${renderMd(s.lines.join('\n'), c, { nctx }).html}</div>`;
  };

  const goal = (() => {
    const s = find(/goal/i);
    if (!s) return '';
    return (
      `<h2 id="goal-to-prompt">Goal to prompt</h2><p>Find what you are trying to do; the file name is the prompt.</p>` +
      `<div class="ps-tablewrap">${renderMd(s.lines.join('\n'), c).html}</div>`
    );
  })();

  const want = sec(/i want/i, 'i-want-to', 'I want to...', `<p>The prompts to use, in order, for common jobs. Numbers are links.</p>`);

  const recipes = (() => {
    const s = find(/recipes/i);
    if (!s) return '';
    const items = [];
    let curI = null;
    for (const line of s.lines) {
      const t = line.match(/^\*\*(.+)\*\*\s*$/);
      if (t) {
        curI = { title: t[1], body: [] };
        items.push(curI);
      } else if (curI && line.trim()) curI.body.push(line);
      else if (!curI && line.trim()) items.push({ title: '', body: [line] });
    }
    return (
      `<h2 id="recipes">Recipes</h2><p>Complete prompt sequences for common kinds of video.</p><div class="ps-recipes">` +
      items
        .map(
          (r) =>
            `<div class="ps-recipe">${r.title ? `<h3>${esc(r.title)}</h3>` : ''}${arrows(
              renderMd(r.body.join('\n'), c, { nctx }).html
            )}</div>`
        )
        .join('') +
      `</div>`
    );
  })();

  const learnSec = find(/learning/i);
  const learn =
    `<h2 id="learning-plan">7-day learning plan</h2>` +
    (learnSec
      ? `<div class="ps-tablewrap">${renderMd(learnSec.lines.join('\n'), c).html}</div>`
      : `<ul>${learning.map((p) => `<li><a href="${esc(rel(from, p.sitePath))}">${esc(p.titleRaw)}</a></li>`).join('')}</ul>`);

  const rules = find(/rules/i);
  const rulesHtml = rules
    ? `<h2 id="rules">${esc(rules.title)}</h2><div class="callout"><div class="title">Read before you paste anything</div>${renderMd(rules.lines.join('\n'), c).html}</div>`
    : '';

  const known = [pipeSec, find(/goal/i), find(/i want/i), find(/recipes/i), learnSec, rules].filter(Boolean);
  const extra = sections
    .filter((s) => !known.includes(s))
    .map((s) => `<h2 id="${esc(s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(s.title)}</h2>${renderMd(s.lines.join('\n'), c).html}`)
    .join('');

  // card grid
  const cardOf = (p) => {
    const ev = p.evidence ? `<span class="badge ${p.evidence.tone}">${esc(p.evidence.label)}</span>` : '';
    const text = [p.num, p.name, p.purpose, p.stage, groupOf(p).label, p.evidence ? p.evidence.label : ''].join(' ').replace(/[`*]/g, '');
    return (
      `<a class="card ps-card" href="${esc(rel(from, p.sitePath))}" data-filter-text="${esc(text)}">` +
      `<div class="ps-badges"><span class="badge plain">${esc(/^\d/.test(p.num) ? p.num : p.num)}</span>${ev}</div>` +
      `<h3>${esc(p.name)}</h3><p>${esc(shorten(p.purpose.replace(/[`*]/g, ''), 170))}</p>` +
      `${p.stage ? `<div class="meta">Stage: ${esc(shorten(p.stage.replace(/[`*]/g, ''), 64))}</div>` : ''}</a>`
    );
  };
  const all = [...prompts, ...learning];
  const groupsHtml = GROUPS.map((g) => {
    const members = all.filter((p) => groupOf(p) === g);
    if (!members.length) return '';
    return (
      `<section class="ps-group" data-group id="stage-${g.key === 'L' ? 'learning' : g.key}">` +
      `<h3>${esc(g.label)} <span class="ps-n">${members.length}</span></h3><p class="ps-hint">${esc(g.hint)}</p>` +
      `<div class="grid ps-grid">${members.map(cardOf).join('')}</div></section>`
    );
  }).join('');
  const orphans = all.filter((p) => groupOf(p).key === 'x');
  const orphanHtml = orphans.length
    ? `<section class="ps-group" data-group><h3>Other</h3><div class="grid ps-grid">${orphans.map(cardOf).join('')}</div></section>`
    : '';

  const anatomy = ['Purpose', 'Use when', 'Stage', 'Inputs', 'Expected output', 'Next prompt'];

  const body =
    crumbs(root, [{ label: 'Prompts' }]) +
    `<header class="ps-head"><div class="eyebrow">Prompts</div><h1>The prompt library</h1>` +
    `<p class="lead ps-lead">${prompts.length + learning.length} paste-ready prompts that take a video from a vague idea to a checked render, one stage at a time.</p></header>` +
    `<section class="ps-intro"><div class="ps-intro-cols"><div><h2 class="ps-h2-first">How the library works</h2>` +
    `<p>Every prompt file has the same header, then one prompt to paste, then a separate block of studio-specific additions with repo paths. Fill every <code>[placeholder]</code>, paste, and follow the <em>Next prompt</em> link.</p>` +
    `<ul class="ps-anatomy">${anatomy.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` +
    `<p class="ps-small">Most prompts also carry <em>Why this exists</em> with an evidence level: shown in a finished film, documented in a public repo, or only claimed by a post. Treat claimed prompts as hypotheses to test.</p></div>` +
    `<div><h2 class="ps-h2-first">Start here</h2>` +
    `<ol class="steps ps-steps"><li>Write the brief with <a href="${esc(numMap.has('40') ? rel(from, numMap.get('40')) : '#')}">40 · Brief template</a>.</li>` +
    `<li>Paste it under <a href="${esc(numMap.has('00') ? rel(from, numMap.get('00')) : '#')}">00 · Master workflow</a>.</li>` +
    `<li>Pick a direction, storyboard, then build one scene and review it before the rest.</li></ol>` +
    `</div></div></section>` +
    `<nav class="ps-jump" aria-label="On this page"><a href="#pipeline">Pipeline</a><a href="#all-prompts">All prompts</a><a href="#goal-to-prompt">Goal to prompt</a><a href="#i-want-to">I want to</a><a href="#recipes">Recipes</a><a href="#learning-plan">Learning plan</a></nav>` +
    pipeline +
    `<h2 id="all-prompts">All prompts by stage</h2>` +
    `<div class="filters"><input type="search" data-filter-input placeholder="Filter prompts: number, goal, stage, evidence" aria-label="Filter prompts"> <span class="ps-count" aria-live="polite"><span data-filter-count></span> shown</span></div>` +
    groupsHtml +
    orphanHtml +
    goal +
    want +
    recipes +
    learn +
    rulesHtml +
    extra +
    FILTER_SCRIPT;

  return page({
    title: 'Prompts',
    desc: 'The studio prompt library: which prompt for which purpose, the pipeline order, recipes, and every paste-ready prompt.',
    active: 'prompts',
    root,
    body,
    extraHead: CSS_LINK(root),
  });
}

export default async function build({ repo, docs }) {
  const skills = collectSkills(repo);
  const map = buildLinkMap(repo, skills);
  const ctx = { repo, map };

  const prompts = listMd(path.join(repo, 'prompts'))
    .filter((f) => f !== 'INDEX.md')
    .map((f) => parsePrompt(repo, `prompts/${f}`, false))
    .filter(Boolean);
  const learning = listMd(path.join(repo, 'prompts/learning'))
    .map((f) => parsePrompt(repo, `prompts/learning/${f}`, true))
    .filter(Boolean);

  // pipeline order from INDEX.md, then everything else by number
  const byNum = new Map(prompts.filter((p) => /^\d\d$/.test(p.num)).map((p) => [p.num, p]));
  const idx = readText(path.join(repo, 'prompts/INDEX.md')) || '';
  const pipeSec = splitSections(idx.split('\n')).sections.find((s) => /pipeline/i.test(s.title));
  const fence = pipeSec ? pipeSec.lines.join('\n').match(/```[\w-]*\n([\s\S]*?)\n```/) : null;
  const order = [];
  if (fence) for (const l of pipelineLanes(fence[1], byNum)) for (const n of l.nums) if (!order.includes(n)) order.push(n);
  const rest = [...byNum.keys()].filter((n) => !order.includes(n)).sort();
  const seq = [...order, ...rest].map((n) => byNum.get(n));
  const orphan = prompts.filter((p) => !/^\d\d$/.test(p.num));
  seq.push(...orphan);

  const written = [];
  const write = (relPath, html) => {
    const file = path.join(docs, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push(file);
  };

  write('prompts/index.html', indexPage(seq, learning, ctx, repo));
  seq.forEach((p, i) => write(`${p.sitePath}index.html`, promptPage(p, seq[i - 1], seq[i + 1], ctx)));
  learning.forEach((p, i) => write(`${p.sitePath}index.html`, promptPage(p, learning[i - 1], learning[i + 1], ctx)));
  return written;
}
