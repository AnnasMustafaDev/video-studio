// Skills panel: docs/skills/index.html, one page per skill, one page per reference/template.
// Scans skills/*/SKILL.md and third_party/*/skills/*/SKILL.md at build time; nothing is hard-coded except
// optional presentation hints (META) that fall back to text derived from each skill's frontmatter.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc, REPO } from './template.mjs';
import { renderMarkdown, slugify } from './md.mjs';

const posix = path.posix;

/* ---------- small shared helpers (also imported by prompts.mjs) ---------- */

export function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  } catch {
    return null;
  }
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

export function parseFrontmatter(text) {
  const m = String(text).match(/^---\n([\s\S]*?)\n---\n?/);
  const fm = {};
  if (!m) return { fm, body: String(text) };
  let key = null;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      fm[key] = kv[2];
    } else if (key && /^\s+\S/.test(line)) {
      fm[key] += ' ' + line.trim();
    }
  }
  for (const k of Object.keys(fm)) {
    let v = fm[k].trim();
    if (/^(['"]).*\1$/s.test(v)) {
      const q = v[0];
      v = v.slice(1, -1);
      if (q === '"') v = v.replace(/\\"/g, '"');
    }
    fm[k] = v;
  }
  return { fm, body: String(text).slice(m[0].length) };
}

/** Relative URL between two site directories ('skills/a/' -> 'skills/b/'). */
export function rel(from, to) {
  const f = from.replace(/\/$/, '') || '.';
  const t = to.replace(/\/$/, '') || '.';
  const r = posix.relative(f, t);
  return r ? r + '/' : './';
}

export function rootFor(sitePath) {
  const n = sitePath.split('/').filter(Boolean).length;
  return '../'.repeat(n);
}

export function stripFirstH1(md) {
  const text = String(md).replace(/^---\n[\s\S]*?\n---\n/, '');
  const lines = text.split('\n');
  let title = '';
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) inFence = !inFence;
    if (!inFence && /^#\s+/.test(lines[i])) {
      title = lines[i].replace(/^#\s+/, '').replace(/`/g, '').trim();
      lines.splice(i, 1);
      break;
    }
  }
  return { title, md: lines.join('\n') };
}

export function plainScrub(s) {
  return String(s)
    .replace(/\{\{\s*VIDEO_STUDIO\s*\}\}/g, '<repo>')
    .replace(/C:[\\/]+Users[\\/]+[^\\/<>"'`]+[\\/]+Documents[\\/]+me[\\/]+video-studio/gi, '<repo>')
    .replace(/C:[\\/]+Users[\\/]+[^\\/<>"'`]+/gi, '~');
}

export function shorten(s, max) {
  s = plainScrub(s).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s-]+$/, '') + '...';
}

export function firstParagraph(md, max = 170) {
  let inFence = false;
  const buf = [];
  for (const line of String(md).split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^\s*(#|\||>|[-*+]\s|\d+[.)]\s|---)/.test(line)) {
      if (buf.length) break;
      continue;
    }
    if (line.trim() === '') {
      if (buf.length) break;
      continue;
    }
    buf.push(line.trim());
  }
  return shorten(buf.join(' ').replace(/[`*]/g, ''), max);
}

/* ---------- discovery ---------- */

function upstreamInfo(repo, project) {
  const t = readText(path.join(repo, 'third_party', project, 'UPSTREAM.md')) || '';
  const lic = t.match(/\|\s*\*{0,2}Licen[cs]e\*{0,2}\s*\|\s*([^|\n]+)\|/i);
  const up = t.match(/\|\s*\*{0,2}Upstream\*{0,2}\s*\|\s*(https?:\/\/[^\s|]+)/i);
  const pin = t.match(/Pinned commit\*{0,2}\s*\|\s*`?([0-9a-f]{7,40})/i);
  const licenceFull = lic ? lic[1].trim().replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') : '';
  return {
    licence: licenceFull.split(/[,(]/)[0].trim(),
    licenceFull,
    upstream: up ? up[1] : '',
    pin: pin ? pin[1].slice(0, 7) : '',
    hasUpstream: !!t,
    hasLicense: fs.existsSync(path.join(repo, 'third_party', project, 'LICENSE')),
  };
}

function collectRefs(repo, dir, vendored) {
  if (vendored) return [];
  const refs = [];
  for (const [sub, kind] of [
    ['references', 'Reference'],
    ['templates', 'Template'],
  ]) {
    const files = listDir(path.join(repo, dir, sub))
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
      .map((e) => e.name)
      .sort();
    for (const f of files) {
      const text = readText(path.join(repo, dir, sub, f)) || '';
      const { body } = parseFrontmatter(text);
      const { title, md } = stripFirstH1(body);
      const base = slugify(f.replace(/\.md$/i, '')) || 'ref';
      refs.push({
        kind,
        file: `${dir}/${sub}/${f}`,
        slug: kind === 'Template' ? `template-${base}` : base,
        title: title || f.replace(/\.md$/i, ''),
        desc: firstParagraph(md),
        md,
      });
    }
  }
  return refs;
}

export function collectSkills(repo) {
  const found = [];
  for (const e of listDir(path.join(repo, 'skills'))) {
    if (e.isDirectory()) found.push({ dir: `skills/${e.name}`, vendored: false, project: '' });
  }
  for (const p of listDir(path.join(repo, 'third_party'))) {
    if (!p.isDirectory()) continue;
    for (const e of listDir(path.join(repo, 'third_party', p.name, 'skills'))) {
      if (e.isDirectory()) found.push({ dir: `third_party/${p.name}/skills/${e.name}`, vendored: true, project: p.name });
    }
  }
  const skills = [];
  for (const f of found) {
    const text = readText(path.join(repo, f.dir, 'SKILL.md'));
    if (text == null) continue;
    const { fm, body } = parseFrontmatter(text);
    const name = fm.name || posix.basename(f.dir);
    const { title, md } = stripFirstH1(body);
    skills.push({
      ...f,
      name,
      slug: slugify(name) || posix.basename(f.dir),
      fm,
      title: title || name,
      md,
      refs: collectRefs(repo, f.dir, f.vendored),
      up: f.vendored ? upstreamInfo(repo, f.project) : null,
    });
  }
  skills.sort((a, b) => Number(a.vendored) - Number(b.vendored) || a.name.localeCompare(b.name));
  return skills;
}

/** repo-relative markdown path -> site directory, for every rendered page of the skills and prompts panels. */
export function buildLinkMap(repo, skills = collectSkills(repo)) {
  const map = new Map();
  for (const s of skills) {
    map.set(`${s.dir}/SKILL.md`, `skills/${s.slug}/`);
    for (const r of s.refs) map.set(r.file, `skills/${s.slug}/${r.slug}/`);
  }
  const pdir = path.join(repo, 'prompts');
  for (const e of listDir(pdir)) {
    if (e.isFile() && e.name.endsWith('.md')) {
      map.set(`prompts/${e.name}`, e.name === 'INDEX.md' ? 'prompts/' : `prompts/${e.name.replace(/\.md$/, '')}/`);
    }
  }
  for (const e of listDir(path.join(pdir, 'learning'))) {
    if (e.isFile() && e.name.endsWith('.md')) {
      map.set(`prompts/learning/${e.name}`, `prompts/learning/${e.name.replace(/\.md$/, '')}/`);
    }
  }
  return map;
}

/**
 * Turn references to other repo files into site links (or GitHub links), outside fenced blocks.
 * ctx: { file: repo path of the markdown being rendered, from: site dir of the page, map, repo }
 */
export function fixLinks(md, ctx) {
  const { file, from, map, repo } = ctx;
  const dirOfFile = posix.dirname(file);
  const skillDir = (file.match(/^((?:third_party\/[^/]+\/)?skills\/[^/]+)\//) || [])[1] || '';
  let inFence = false;
  return String(md)
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(/\[([^\]]*)\]\(([^)\s]+)\)|`([^`\n]+)`/g, (m, text, target, code) => {
        if (target !== undefined) {
          if (/^(https?:|mailto:|#|\/)/i.test(target)) return m;
          const [t, hash = ''] = target.split(/(?=#)/);
          const p = posix.normalize(posix.join(dirOfFile, t));
          if (map.has(p)) return `[${text}](${rel(from, map.get(p))}${hash})`;
          let st = null;
          try {
            st = fs.statSync(path.join(repo, p));
          } catch {
            st = null;
          }
          if (!st && t.endsWith('/')) return m; // already a site link
          if (st && !p.startsWith('..')) return `[${text}](${REPO}/${st.isDirectory() ? 'tree' : 'blob'}/main/${p}${hash})`;
          return text;
        }
        if (/^\d\d$/.test(code) && file.startsWith('prompts/')) {
          const hit = [...map.keys()].find((k) => k.startsWith(`prompts/${code}-`));
          return hit ? `[\`${code}\`](${rel(from, map.get(hit))})` : m;
        }
        if (!/^[\w./-]+\.md$/.test(code)) return m;
        const cands = [];
        if (code.includes('/')) {
          cands.push(code, posix.normalize(posix.join(dirOfFile, code)));
          if (skillDir) cands.push(posix.join(skillDir, code));
        } else if (/^\d\d-[\w-]+\.md$/.test(code)) cands.push(`prompts/${code}`);
        else if (/^day-\d\.md$/.test(code)) cands.push(`prompts/learning/${code}`);
        for (const c of cands) {
          if (map.has(c)) return `[\`${code}\`](${rel(from, map.get(c))})`;
        }
        return m;
      });
    })
    .join('\n');
}

/* ---------- presentation hints (optional; unknown skills fall back to frontmatter text) ---------- */

const META = {
  'remotion-studio': {
    badge: 'Remotion engine',
    line: 'The default engine: kinetic type, titles, UI demos, charts, explainers and reels as React, frame by frame.',
    when: 'Any motion-graphics video made in code. Start here unless the voice-over sets every cut.',
  },
  'motion-studio': {
    badge: 'HTML engine',
    line: 'Narrated product films where every cut, caption and camera move lands on a spoken word.',
    when: 'A voice-over-driven product film, reviewed live in an HTML player with the real mix.',
  },
  'motion-director': {
    badge: 'Planning, no code',
    line: 'Turns a vague idea into a brief, three directions and a timed storyboard, and reviews the plan.',
    when: 'Before building: brief, directions, storyboard, reference breakdown, plan review.',
  },
  'motion-review': {
    badge: 'Independent review',
    line: 'A strict, scored critique of a rendered video from stills and contact sheets, with a ready or another-round verdict.',
    when: 'After a render: is it good, is it ready to ship, what are the five worst defects.',
  },
  'shot-library': {
    badge: 'Shot picking',
    line: 'Matches each storyboard scene to a curated motion shot and fills in its parameters.',
    when: 'While storyboarding: which transition, title reveal or chart move fits this scene.',
  },
  'prompt-motion-search': {
    badge: 'Inspiration',
    line: 'Finds a Claude-made example on prompt-motion.com with its prompt and rewrites it into a brief.',
    when: 'You want to see what prompt made a video like yours.',
  },
  brag: {
    badge: 'Launch video',
    line: 'Turns a project into a short launch video with music, motion and share copy (full workflow).',
    when: 'A fast launch video of a project you just built.',
  },
  'brag-slim': {
    badge: 'Launch video',
    line: 'The one-file variant of brag: no bundled assets, the model builds the whole video itself.',
    when: 'A fast launch video from a project folder or a URL, without the bundled assets.',
  },
};

function derivedLine(desc) {
  const first = String(desc).split(/(?<=[a-z)])\.\s|:\s|;\s/)[0];
  return shorten(first, 190);
}

function useSentence(desc) {
  const m = String(desc).match(/\b(Use (?:when|for|whenever)[^.]*)\./i);
  return m ? shorten(m[1], 200) : derivedLine(desc);
}

function metaFor(s) {
  const m = META[s.name] || {};
  const desc = s.fm.description || '';
  return {
    badge: m.badge || (s.vendored ? 'Vendored skill' : 'Skill'),
    line: m.line || derivedLine(desc),
    when: m.when || useSentence(desc),
  };
}

/* ---------- shared layout bits ---------- */

export const CSS_LINK = (root) => `<link rel="stylesheet" href="${root}assets/panel-skills.css">`;

export const SIDE_SCRIPT = `<script>
(function(){
  var mq = window.matchMedia('(min-width: 981px)');
  function sync(){ document.querySelectorAll('details.ps-side-d').forEach(function(d){ d.open = mq.matches; }); }
  sync();
  if (mq.addEventListener) mq.addEventListener('change', sync);
  var links = [].slice.call(document.querySelectorAll('.ps-toc a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  links.forEach(function(a){ byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      links.forEach(function(a){ a.classList.remove('on'); });
      var a = byId[e.target.id]; if (a) a.classList.add('on');
    });
  }, { rootMargin: '-70px 0px -70% 0px' });
  Object.keys(byId).forEach(function(id){ var el = document.getElementById(id); if (el) io.observe(el); });
})();
</script>`;

export function crumbs(root, trail) {
  const parts = [`<a href="${root}">Home</a>`];
  trail.forEach((t, i) => {
    parts.push(
      t.href && i < trail.length - 1
        ? `<a href="${esc(t.href)}">${esc(t.label)}</a>`
        : `<span aria-current="page">${esc(t.label)}</span>`
    );
  });
  return `<nav class="crumbs ps-crumbs" aria-label="Breadcrumb">${parts.join(' <span aria-hidden="true">/</span> ')}</nav>`;
}

export function tocHtml(headings) {
  const seen = new Set();
  const items = headings.filter((h) => h.level >= 2 && h.level <= 3 && h.id && !seen.has(h.id) && seen.add(h.id));
  if (items.filter((h) => h.level === 2).length < 3 && items.length < 6) return '';
  return (
    `<details class="ps-side-d" open><summary>On this page</summary><ul class="ps-toc">` +
    items.map((h) => `<li class="l${h.level}"><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('') +
    `</ul></details>`
  );
}

export function prevNext(prev, next) {
  if (!prev && !next) return '';
  const cell = (x, dir) =>
    x
      ? `<a class="ps-pn ${dir}" href="${esc(x.href)}"><span class="ps-pn-dir">${dir === 'prev' ? 'Previous' : 'Next'}</span><span class="ps-pn-title">${esc(x.label)}</span></a>`
      : `<span></span>`;
  return `<nav class="ps-prevnext" aria-label="Previous and next">${cell(prev, 'prev')}${cell(next, 'next')}</nav>`;
}

function fmBox(rows) {
  return (
    `<dl class="ps-info">` +
    rows
      .filter((r) => r[1])
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
      .join('') +
    `</dl>`
  );
}

/* ---------- pages ---------- */

function skillPage(s, ctx) {
  const sitePath = `skills/${s.slug}/`;
  const root = rootFor(sitePath);
  const meta = metaFor(s);
  const desc = s.fm.description || '';
  const mdFixed = fixLinks(s.md, { file: `${s.dir}/SKILL.md`, from: sitePath, map: ctx.map, repo: ctx.repo });
  const { html, headings } = renderMarkdown(mdFixed, { stripFrontmatter: false });

  const badges = [
    `<span class="badge">${esc(meta.badge)}</span>`,
    s.vendored ? `<span class="badge warn">Third-party${s.up?.licence ? ' · ' + esc(s.up.licence) : ''}</span>` : '',
    s.fm.version ? `<span class="badge plain">v${esc(s.fm.version)}</span>` : '',
  ].join(' ');

  const gh = `${REPO}/tree/main/${s.dir}`;
  const ext = (href, label) => `<a href="${esc(href)}" rel="noopener noreferrer">${label}</a>`;
  const vendorNote = s.vendored
    ? `<div class="callout warn"><div class="title">Vendored third-party skill</div>` +
      `<p>This skill is copied unchanged from ${s.up?.upstream ? ext(s.up.upstream, 'its upstream project') : 'an upstream project'}` +
      `${s.up?.pin ? ` (pinned at <code>${esc(s.up.pin)}</code>)` : ''}${s.up?.licence ? `, licence: ${esc(s.up.licence)} (bundled music and sound effects carry their own licences, see Credits)` : ''}. ` +
      `This site renders its <code>SKILL.md</code> only. Its scripts, references and bundled assets are not rendered here; ` +
      `${ext(gh, 'browse the files on GitHub')}` +
      `${s.up?.hasUpstream ? `, or read the ${ext(`${REPO}/blob/main/third_party/${s.project}/UPSTREAM.md`, 'upstream notes')}` : ''}` +
      `${s.up?.hasLicense ? ` and the ${ext(`${REPO}/blob/main/third_party/${s.project}/LICENSE`, 'licence')}` : ''}. ` +
      `See also <a href="${root}credits/">Credits</a>.</p></div>`
    : '';

  const info = fmBox([
    ['Skill', `<code>${esc(s.name)}</code>`],
    ['Version', s.fm.version ? esc(s.fm.version) : ''],
    ['Trigger text', desc.length > 260 ? '<details class="ps-desc"><summary>' + esc(shorten(desc, 220)) + '</summary><p>' + esc(desc) + '</p></details>' : esc(desc)],
    ['Install', `<code>node tools/install-skills.mjs ${esc(s.name)}</code>`],
    ['Source', ext(gh, `<code>${esc(s.dir)}/</code>`)],
  ]);

  const refList = s.refs.length
    ? `<h2 id="references-and-templates">References and templates</h2>` +
      `<p>${s.refs.length} page${s.refs.length === 1 ? '' : 's'} this skill reads on demand, rendered in full.</p>` +
      `<ul class="ps-reflist">` +
      s.refs
        .map(
          (r) =>
            `<li><a href="${esc(r.slug)}/">${esc(r.title)}</a> <span class="badge plain">${esc(r.kind)}</span>` +
            `${r.desc ? `<div class="ps-refdesc">${esc(r.desc)}</div>` : ''}</li>`
        )
        .join('') +
      `</ul>`
    : '';

  const side =
    tocHtml(headings) +
    (s.refs.length
      ? `<details class="ps-side-d" open><summary>References (${s.refs.length})</summary><ul class="ps-sidelist">` +
        s.refs.map((r) => `<li><a href="${esc(r.slug)}/">${esc(r.title)}</a></li>`).join('') +
        `</ul></details>`
      : '') +
    `<p class="ps-side-foot"><a href="${root}skills/">All skills</a></p>`;

  const body =
    crumbs(root, [{ label: 'Skills', href: `${root}skills/` }, { label: s.name }]) +
    `<header class="ps-head"><div class="ps-badges">${badges}</div><h1>${esc(s.title)}</h1>` +
    `<p class="lead ps-lead">${esc(meta.line)}</p></header>` +
    vendorNote +
    info +
    `<div class="ps-doc"><article class="ps-article">${html}${refList}</article><aside class="ps-side">${side}</aside></div>` +
    SIDE_SCRIPT;

  return page({
    title: `${s.name} skill`,
    desc: meta.line,
    active: 'skills',
    root,
    body,
    extraHead: CSS_LINK(root),
  });
}

function refPage(s, r, idx, ctx) {
  const sitePath = `skills/${s.slug}/${r.slug}/`;
  const root = rootFor(sitePath);
  const mdFixed = fixLinks(r.md, { file: r.file, from: sitePath, map: ctx.map, repo: ctx.repo });
  const { html, headings } = renderMarkdown(mdFixed, { stripFrontmatter: false });
  const prev = s.refs[idx - 1];
  const next = s.refs[idx + 1];
  const link = (x) => (x ? { href: `../${x.slug}/`, label: x.title } : null);

  const sibs =
    `<details class="ps-side-d" open><summary>In ${esc(s.name)}</summary><ul class="ps-sidelist">` +
    `<li><a href="../">SKILL.md</a></li>` +
    s.refs
      .map((x) =>
        x === r
          ? `<li class="on"><span aria-current="page">${esc(x.title)}</span></li>`
          : `<li><a href="../${esc(x.slug)}/">${esc(x.title)}</a></li>`
      )
      .join('') +
    `</ul></details>`;

  const body =
    crumbs(root, [
      { label: 'Skills', href: `${root}skills/` },
      { label: s.name, href: `${root}skills/${s.slug}/` },
      { label: r.title },
    ]) +
    `<header class="ps-head"><div class="ps-badges"><span class="badge plain">${esc(r.kind)}</span> <span class="badge">${esc(s.name)}</span></div>` +
    `<h1>${esc(r.title)}</h1></header>` +
    `<div class="ps-doc"><article class="ps-article">${html}${prevNext(link(prev), link(next))}</article>` +
    `<aside class="ps-side">${tocHtml(headings)}${sibs}<p class="ps-side-foot"><a href="${esc(`${REPO}/blob/main/${r.file}`)}" rel="noopener noreferrer">View source on GitHub</a></p></aside></div>` +
    SIDE_SCRIPT;

  return page({
    title: `${r.title} (${s.name})`,
    desc: r.desc || `${r.kind} page of the ${s.name} skill.`,
    active: 'skills',
    root,
    body,
    extraHead: CSS_LINK(root),
  });
}

function indexPage(skills) {
  const root = '../';
  const own = skills.filter((s) => !s.vendored);
  const refCount = skills.reduce((n, s) => n + s.refs.length, 0);

  const cards = skills
    .map((s) => {
      const m = metaFor(s);
      const refs = s.refs.filter((r) => r.kind === 'Reference').length;
      const tpls = s.refs.filter((r) => r.kind === 'Template').length;
      const counts = s.vendored
        ? 'SKILL.md rendered here; assets on GitHub'
        : [refs ? `${refs} reference${refs === 1 ? '' : 's'}` : '', tpls ? `${tpls} template${tpls === 1 ? '' : 's'}` : '']
            .filter(Boolean)
            .join(' · ') || 'Single SKILL.md';
      const text = [s.name, m.badge, m.line, s.vendored ? 'third-party vendored ' + (s.up?.licence || '') : 'personal'].join(' ');
      return (
        `<a class="card ps-card" href="${esc(s.slug)}/" data-filter-text="${esc(text)}">` +
        `<div class="ps-badges"><span class="badge">${esc(m.badge)}</span>` +
        `${s.vendored ? `<span class="badge warn">Third-party${s.up?.licence ? ' · ' + esc(s.up.licence) : ''}</span>` : ''}` +
        `${s.fm.version ? `<span class="badge plain">v${esc(s.fm.version)}</span>` : ''}</div>` +
        `<h3>${esc(s.name)}</h3><p>${esc(m.line)}</p><div class="meta">${esc(counts)}</div></a>`
      );
    })
    .join('');

  const rows = skills
    .map((s) => {
      const m = metaFor(s);
      return `<tr><td>${esc(m.when)}</td><td><a href="${esc(s.slug)}/"><code>${esc(s.name)}</code></a></td><td>${esc(m.badge)}${s.vendored ? ' (third-party)' : ''}</td></tr>`;
    })
    .join('');

  const body =
    crumbs(root, [{ label: 'Skills' }]) +
    `<header class="ps-head"><div class="eyebrow">Skills</div><h1>The skills</h1>` +
    `<p class="lead ps-lead">Claude Code skills are the working knowledge of the studio: the workflow, the rules and the checks, written down so any session can pick them up.</p></header>` +
    `<section class="ps-intro"><div class="ps-intro-cols">` +
    `<div><h2 class="ps-h2-first">What a skill is</h2>` +
    `<p>A skill is a folder with a <code>SKILL.md</code>: a short description that tells Claude when to use it, the instructions themselves, and optional <code>references/</code> and <code>templates/</code> pages that are read only when the task needs them. Claude loads a skill when your request matches its description, so you can also just name it.</p>` +
    `<p>${skills.length} skills here (${own.length} personal, ${skills.length - own.length} vendored), with ${refCount} reference and template pages. Every one is rendered on this site.</p></div>` +
    `<div><h2 class="ps-h2-first">Install them</h2>` +
    `<p>From the repository root, copy every skill into <code>~/.claude/skills/</code>:</p>` +
    `<pre><code>node tools/install-skills.mjs</code></pre>` +
    `<p>Preview first with <code>--dry-run</code>, or install only some by name:</p>` +
    `<pre><code>node tools/install-skills.mjs --dry-run\nnode tools/install-skills.mjs remotion-studio motion-review</code></pre>` +
    `<p class="ps-small">A changed installed skill is moved to a timestamped backup before it is replaced, and an identical one is left alone.</p></div>` +
    `</div></section>` +
    `<h2 id="all-skills">All skills</h2>` +
    `<div class="filters"><input type="search" data-filter-input placeholder="Filter skills: name, engine, keyword" aria-label="Filter skills"> <span class="ps-count" aria-live="polite"><span data-filter-count></span> shown</span></div>` +
    `<div class="grid ps-grid">${cards}</div>` +
    `<h2 id="which-skill-when">Which skill when</h2>` +
    `<p>Start from what you want to do, not from the skill name.</p>` +
    `<table class="ps-table"><thead><tr><th>You want to</th><th>Use</th><th>Kind</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<div class="callout"><div class="title">Which engine?</div><p>Use <code>remotion-studio</code> by default. Switch to <code>motion-studio</code> only for a narrated product film where every cut lands on a spoken word. Plan with <code>motion-director</code> first, and finish with <code>motion-review</code> on the render.</p></div>`;

  return page({
    title: 'Skills',
    desc: `The ${skills.length} Claude Code skills of the studio: what each does, how to install them, and which to use when.`,
    active: 'skills',
    root,
    body,
    extraHead: CSS_LINK(root),
  });
}

export default async function build({ repo, docs }) {
  const skills = collectSkills(repo);
  const map = buildLinkMap(repo, skills);
  const ctx = { repo, map };
  const written = [];
  const write = (relPath, html) => {
    const file = path.join(docs, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push(file);
  };

  write('skills/index.html', indexPage(skills));
  for (const s of skills) {
    write(`skills/${s.slug}/index.html`, skillPage(s, ctx));
    s.refs.forEach((r, i) => write(`skills/${s.slug}/${r.slug}/index.html`, refPage(s, r, i, ctx)));
  }
  return written;
}
