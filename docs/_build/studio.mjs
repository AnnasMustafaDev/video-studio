// STUDIO panel: docs/studio/{index,components,tokens,design-system,engines}/index.html
// Everything is read from the repo at build time (studio/src/lib, tokens.ts, DESIGN_SYSTEM.md,
// Root.tsx, skills/motion-studio). Repo text is data: it is parsed, escaped and rendered through
// md.mjs / esc(). Nothing from the sources is passed through as raw HTML and no source code is run.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { REPO, esc, h, page, safeUrl } from './template.mjs';
import { renderMarkdown } from './md.mjs';

/* ------------------------------------------------------------------ */
/* shared helpers (also imported by techniques.mjs)                    */
/* ------------------------------------------------------------------ */

export const readText = (p) => {
  try {
    return readFileSync(p, 'utf8').replace(/\r\n?/g, '\n');
  } catch {
    return '';
  }
};

export const ghUrl = (path, kind = 'blob') =>
  `${REPO}/${kind}/main/${String(path).split('/').map(encodeURIComponent).join('/')}`;

export const css = (root) => `<link rel="stylesheet" href="${root}assets/panel-studio.css">`;

/** Inline code spans, bold, and bare https URLs in a short string; everything else escaped. */
export function inlineText(src) {
  const parts = String(src ?? '').split(/(`[^`]+`|https?:\/\/[^\s)]+)/g);
  return parts
    .map((p) => {
      if (/^`[^`]+`$/.test(p)) return `<code>${esc(p.slice(1, -1))}</code>`;
      if (/^https?:\/\//.test(p)) {
        const url = p.replace(/[.,;:]+$/, '');
        const tail = p.slice(url.length);
        return `<a href="${esc(safeUrl(url))}" rel="noopener noreferrer">${esc(url.replace(/^https?:\/\//, ''))}</a>${esc(tail)}`;
      }
      return esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    })
    .join('');
}

/** Rewrite relative links in rendered markdown to GitHub blob links. */
export function fixLinks(html, baseDir = '') {
  return html.replace(/href="([^"]*)"/g, (m, href) => {
    if (/^(https?:|#|mailto:)/i.test(href) || href === '') return m;
    const joined = (baseDir ? baseDir + '/' : '') + href.replace(/^\.\//, '');
    const parts = [];
    for (const seg of joined.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg && seg !== '.') parts.push(seg);
    }
    return `href="${esc(ghUrl(parts.join('/')))}" rel="noopener noreferrer"`;
  });
}

/** Body of a "## Heading" section (without the heading line). */
export function sectionOf(md, headingRe, level = 2) {
  const lines = md.split('\n');
  const mark = '#'.repeat(level);
  const start = lines.findIndex((l) => l.startsWith(mark + ' ') && headingRe.test(l.slice(level + 1)));
  if (start < 0) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = /^(#{1,6})\s/.exec(lines[i]);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n').trim();
}

const pill = (href, label, current) =>
  `<li><a href="${href}"${current ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;

const SUBNAV = [
  ['', 'Overview', 'overview'],
  ['components/', 'Components', 'components'],
  ['tokens/', 'Design tokens', 'tokens'],
  ['design-system/', 'Design system', 'design-system'],
  ['engines/', 'Two engines', 'engines'],
];

function subnav(rootToStudio, current) {
  return (
    `<nav class="ps-subnav" aria-label="Studio sections"><ul class="pills">` +
    SUBNAV.map(([href, label, id]) => pill((rootToStudio + href) || './', label, id === current)).join('') +
    `</ul></nav><!--mtoc-->`
  );
}

const SPY = `<script>
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

export function docLayout(main, tocItems, extra = '') {
  const toc = tocItems.length
    ? `<aside class="doc-toc" data-spy aria-label="On this page"><p class="toc-title">On this page</p><ul>${tocItems
        .map((t) => `<li class="${t.level === 3 ? 'l3' : ''}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
        .join('')}</ul></aside>`
    : '';
  const mtoc = tocItems.length
    ? `<details class="ps-mtoc"><summary>On this page</summary><ul>${tocItems
        .filter((t) => t.level !== 3)
        .map((t) => `<li><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
        .join('')}</ul></details>`
    : '';
  main = main.includes('<!--mtoc-->') ? main.replace('<!--mtoc-->', mtoc) : main;
  return `<div class="doc"><div class="doc-main ps-main">${main}</div>${toc}</div>${extra}${SPY}`;
}

function hero(eyebrow, title, lead) {
  return `<header class="ps-hero"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="lead">${lead}</p></header>`;
}

/* ------------------------------------------------------------------ */
/* TypeScript reading (comments, props, signatures)                    */
/* ------------------------------------------------------------------ */

function cleanDoc(raw) {
  return raw
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

/** Skips strings and comments so braces inside doc comments do not confuse matching. */
function matchClose(src, openIdx) {
  const open = src[openIdx];
  const close = { '{': '}', '(': ')', '[': ']' }[open];
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2);
      i = e < 0 ? src.length : e + 1;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      const e = src.indexOf('\n', i);
      i = e < 0 ? src.length : e;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      i = j;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Doc comment directly above `export const|function|type NAME`. */
function docAbove(src, name) {
  const re = new RegExp(`(?:^|\\n)export\\s+(?:const|function|type)\\s+${name}\\b`);
  const m = re.exec(src);
  if (!m) return { doc: '', index: -1 };
  const before = src.slice(0, m.index + (m[0].startsWith('\n') ? 1 : 0));
  const dm = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*$/.exec(before);
  return { doc: dm ? cleanDoc(dm[1]) : '', index: m.index + (m[0].startsWith('\n') ? 1 : 0) };
}

function splitDoc(doc) {
  const fence = /```[a-z]*\n([\s\S]*?)```/.exec(doc);
  const example = fence ? fence[1].trim() : '';
  const prose = doc.replace(/```[a-z]*\n[\s\S]*?```/g, '').trim();
  const paras = prose.split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
  return { summary: paras[0] || '', more: paras.slice(1), example };
}

function parseProps(body) {
  const props = [];
  let i = 0;
  let doc = '';
  while (i < body.length) {
    const rest = body.slice(i);
    let m = /^\s+/.exec(rest);
    if (m) {
      i += m[0].length;
      continue;
    }
    if (rest.startsWith('/**')) {
      const e = rest.indexOf('*/');
      if (e < 0) break;
      doc = cleanDoc(rest.slice(3, e));
      i += e + 2;
      continue;
    }
    if (rest.startsWith('//')) {
      const e = rest.indexOf('\n');
      i += e < 0 ? rest.length : e + 1;
      continue;
    }
    m = /^(readonly\s+)?([A-Za-z_]\w*)(\?)?\s*:/.exec(rest);
    if (!m) {
      i++;
      continue;
    }
    let j = i + m[0].length;
    let depth = 0;
    let end = j;
    for (; j < body.length; j++) {
      const c = body[j];
      if (c === '"' || c === "'") {
        const q = c;
        j++;
        while (j < body.length && body[j] !== q) j++;
        continue;
      }
      if ('({['.includes(c)) depth++;
      else if (')}]'.includes(c)) depth--;
      else if (c === ';' && depth <= 0) {
        end = j;
        break;
      }
      end = j + 1;
    }
    props.push({
      name: m[2],
      optional: Boolean(m[3]),
      type: body.slice(i + m[0].length, end).replace(/\s+/g, ' ').trim(),
      doc: doc.replace(/\n/g, ' '),
    });
    doc = '';
    i = end + 1;
  }
  return props;
}

function parseDefaults(src, fnIndex) {
  // default values from the destructured parameter list: ({ a, b = 1, c = "x" }) =>
  const open = src.indexOf('({', fnIndex);
  if (open < 0) return {};
  const braceAt = open + 1;
  const close = matchClose(src, braceAt);
  if (close < 0) return {};
  const inner = src.slice(braceAt + 1, close);
  const out = {};
  let depth = 0;
  let cur = '';
  const flush = () => {
    const m = /^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]+?)\s*$/.exec(cur);
    if (m) out[m[1]] = m[2].replace(/\s+/g, ' ');
    cur = '';
  };
  for (const c of inner) {
    if ('({['.includes(c)) depth++;
    else if (')}]'.includes(c)) depth--;
    if (c === ',' && depth === 0) flush();
    else cur += c;
  }
  flush();
  return out;
}

function signatureOf(src, index) {
  const tail = src.slice(index);
  const head = /^export\s+(?:const|function)\s+(\w+)\s*(?::[^=]+)?(=)?\s*/.exec(tail);
  if (!head) return { sig: '', kind: 'unknown' };
  let pos = head[0].length;
  let rest = tail.slice(pos);
  if (rest.startsWith('{') && head[2]) {
    const close = matchClose(rest, 0);
    const body = close > 0 ? rest.slice(0, close + 1) : '';
    const keys = [...body.matchAll(/^ {2}([A-Za-z_]\w*)\s*[:(=]/gm)].map((m) => m[1]);
    return { sig: '', kind: 'object', keys };
  }
  // follow a curried arrow: (a) => (b) => ...
  const p = rest.indexOf('(');
  if (p < 0 || p > 6) return { sig: '', kind: 'value' };
  const pc = matchClose(rest, p);
  if (pc < 0) return { sig: '', kind: 'value' };
  const afterParams = rest.slice(pc + 1);
  const stop = /=>|\{/.exec(afterParams);
  const ret = stop ? afterParams.slice(0, stop.index) : '';
  const sig = (rest.slice(p, pc + 1) + ret).replace(/\s+/g, ' ').trim();
  return { sig: sig.length > 220 ? sig.slice(0, 217) + '...' : sig, kind: 'function' };
}

/* ------------------------------------------------------------------ */
/* read the component library                                          */
/* ------------------------------------------------------------------ */

const GROUPS = [
  ['Layout, background and camera', ['Background', 'SafeArea', 'Camera']],
  ['Text and copy', ['TitleReveal', 'WordStagger', 'CharStagger', 'FragmentChain', 'GhostType', 'LowerThird', 'Captions']],
  ['Data', ['StatCounter', 'BarChart']],
  ['Masks and transitions', ['ShapeMask']],
  ['Sound', ['Sfx']],
];
const FILE_LABEL = {
  motion: 'Motion hooks and curves',
  curves: 'Motion hooks and curves',
  transitions: 'Transitions',
  copy: 'Copy checks',
  Sfx: 'Sound',
  Captions: 'Captions',
  GhostType: 'Text and copy',
};

function readLib(studioDir) {
  const libDir = join(studioDir, 'src', 'lib');
  const indexSrc = readText(join(libDir, 'index.ts'));
  const exported = []; // {name, file, type}
  for (const m of indexSrc.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s+from\s+"\.\/(\w+)"/g)) {
    for (const raw of m[2].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '');
      if (name) exported.push({ name, file: m[3], type: Boolean(m[1]) });
    }
  }
  const fileSrc = new Map();
  const srcOf = (file) => {
    if (!fileSrc.has(file)) {
      fileSrc.set(file, readText(join(libDir, file + '.tsx')) || readText(join(libDir, file + '.ts')));
    }
    return fileSrc.get(file);
  };
  const components = [];
  const functions = [];
  const resolve = (name, file, depth = 0) => {
    const src = srcOf(file);
    if (new RegExp('export\\s+(?:const|function)\\s+' + name + '\\b').test(src) || depth > 2) return file;
    for (const m of src.matchAll(/export\s+\{([^}]*)\}\s+from\s+"\.\/(\w+)"/g)) {
      if (m[1].split(',').some((x) => x.trim() === name)) return resolve(name, m[2], depth + 1);
    }
    return file;
  };
  for (const e of exported) {
    if (e.type) continue;
    e.file = resolve(e.name, e.file);
    const src = srcOf(e.file);
    const { doc, index } = docAbove(src, e.name);
    if (index < 0 || e.file === 'fonts') continue;
    const parts = splitDoc(doc);
    const isComponent = new RegExp(`export\\s+const\\s+${e.name}\\s*:\\s*React\\.FC`).test(src);
    if (isComponent) {
      const gm = new RegExp(`export\\s+const\\s+${e.name}\\s*:\\s*React\\.FC<(\\w+)>`).exec(src);
      const typeName = gm ? gm[1] : 'Props';
      let props = [];
      const tm = new RegExp(`(?:^|\\n)(?:export\\s+)?type\\s+${typeName}\\s*=\\s*\\{`).exec(src);
      if (tm) {
        const open = src.indexOf('{', tm.index);
        const close = matchClose(src, open);
        if (close > 0) props = parseProps(src.slice(open + 1, close));
      }
      const defaults = parseDefaults(src, index);
      components.push({ name: e.name, file: e.file, ...parts, props, defaults, path: `studio/src/lib/${e.file}.tsx` });
    } else {
      const sig = signatureOf(src, index);
      functions.push({
        name: e.name,
        file: e.file,
        ...parts,
        ...sig,
        path: `studio/src/lib/${e.file}${existsSync(join(libDir, e.file + '.tsx')) ? '.tsx' : '.ts'}`,
        fids: [...new Set([...doc.matchAll(/\bF-[ABC]\d+\b/g)].map((m) => m[0]))],
      });
    }
  }
  for (const c of components) {
    const { doc } = docAbove(srcOf(c.file), c.name);
    c.fids = [...new Set([...doc.matchAll(/\bF-[ABC]\d+\b/g)].map((m) => m[0]))];
  }
  return { components, functions, exported };
}

/** DESIGN_SYSTEM.md "### `<Name>`: when" entries. */
function readDsComponents(dsMd) {
  const body = sectionOf(dsMd, /^Components$/);
  const map = new Map();
  for (const chunk of body.split(/\n(?=### )/)) {
    const hm = /^### (.*?`):\s+(.*)$/m.exec(chunk);
    if (!hm) continue;
    const names = [...hm[1].matchAll(/`<?(\w+)>?`/g)].map((m) => m[1]);
    const rest = chunk.slice(chunk.indexOf('\n') + 1);
    const para = rest.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith('```')) || '';
    const fence = /```[a-z]*\n([\s\S]*?)```/.exec(rest);
    for (const n of names) map.set(n, { when: hm[2].trim(), note: para.trim(), example: fence ? fence[1].trim() : '' });
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* tokens.ts reading                                                   */
/* ------------------------------------------------------------------ */

function literalOf(src, name) {
  const m = new RegExp(`export\\s+const\\s+${name}\\b[^=]*=\\s*`).exec(src);
  if (!m) return null;
  const start = m.index + m[0].length;
  if (src[start] !== '{') {
    const end = src.indexOf(';', start);
    const raw = src.slice(start, end).trim();
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  const close = matchClose(src, start);
  if (close < 0) return null;
  let text = src.slice(start, close + 1);
  const comments = {};
  for (const cm of text.matchAll(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*\n\s*([A-Za-z_]\w*|"[^"]+"):/g)) {
    comments[cm[2].replace(/"/g, '')] = cleanDoc(cm[1]).replace(/\n/g, ' ');
  }
  text = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/Easing\.bezier\(([^)]*)\)/g, '[$1]')
    .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1');
  try {
    return { value: JSON.parse(text), comments };
  } catch {
    return null;
  }
}

function readTokens(studioDir) {
  const src = readText(join(studioDir, 'src', 'lib', 'tokens.ts'));
  const t = {};
  for (const name of ['color', 'type', 'space', 'radius', 'frameRamp', 'safeArea', 'ease', 'springs', 'timing']) {
    const lit = literalOf(src, name);
    t[name] = lit ? lit.value : null;
    t[name + 'Doc'] = lit ? lit.comments : {};
  }
  t.fps = literalOf(src, 'FPS');
  t.floor = literalOf(src, 'TEXT_FLOOR_VW');
  const doc = (name) => {
    const { doc } = docAbove(src, name);
    return doc;
  };
  t.docs = { frameRamp: doc('frameRamp'), safeArea: doc('safeArea'), springs: doc('springs'), ease: doc('ease'), type: doc('type'), space: doc('space') };
  t.count = ['color', 'type', 'space', 'radius', 'frameRamp', 'safeArea', 'ease', 'springs', 'timing'].reduce(
    (n, k) => n + (t[k] ? Object.keys(t[k]).length : 0),
    0
  );
  return t;
}

/* spring and easing plots */

/**
 * Same per-frame closed-form step Remotion's spring() uses (remotion/src/spring/spring-utils.ts),
 * so the plotted curve matches what a render does. Values go from 0 to 1.
 */
function springCurve({ damping: c, stiffness: k, mass: m }, fps = 30, frames = 60) {
  let x = 0;
  let vel = 0;
  const pts = [0];
  const t = 1 / fps;
  for (let f = 1; f <= frames; f++) {
    const v0 = -vel;
    const x0 = 1 - x;
    const zeta = c / (2 * Math.sqrt(k * m));
    const w0 = Math.sqrt(k / m);
    const w1 = w0 * Math.sqrt(1 - zeta ** 2);
    if (zeta < 1) {
      const env = Math.exp(-zeta * w0 * t);
      const frag = env * (Math.sin(w1 * t) * ((v0 + zeta * w0 * x0) / w1) + x0 * Math.cos(w1 * t));
      vel = zeta * w0 * frag - env * (Math.cos(w1 * t) * (v0 + zeta * w0 * x0) - w1 * x0 * Math.sin(w1 * t));
      x = 1 - frag;
    } else {
      const env = Math.exp(-w0 * t);
      x = 1 - env * (x0 + (v0 + w0 * x0) * t);
      vel = env * (v0 * (t * w0 - 1) + t * x0 * w0 * w0);
    }
    pts.push(x);
  }
  const peak = Math.max(...pts);
  let settle = 0;
  for (let i = pts.length - 1; i >= 0; i--) {
    if (Math.abs(pts[i] - 1) > 0.005) {
      settle = i + 1;
      break;
    }
  }
  return { pts, overshoot: Math.max(0, peak - 1), settle };
}

function plotSvg(values, { w = 220, h = 110, ymin = 0, ymax = 1.15, label = '' } = {}) {
  const pad = 8;
  const n = values.length - 1;
  const X = (i) => pad + (i / n) * (w - 2 * pad);
  const Y = (v) => h - pad - ((v - ymin) / (ymax - ymin)) * (h - 2 * pad);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return (
    `<svg class="ps-plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">` +
    `<line x1="${pad}" y1="${Y(1).toFixed(1)}" x2="${w - pad}" y2="${Y(1).toFixed(1)}" class="ref"/>` +
    `<line x1="${pad}" y1="${Y(0).toFixed(1)}" x2="${w - pad}" y2="${Y(0).toFixed(1)}" class="axis"/>` +
    `<path d="${d}" class="curve"/></svg>`
  );
}

function bezierPlot([x1, y1, x2, y2], label) {
  const w = 120;
  const hgt = 120;
  const pad = 10;
  const X = (v) => pad + v * (w - 2 * pad);
  const Y = (v) => hgt - pad - v * (hgt - 2 * pad);
  return (
    `<svg class="ps-plot sq" viewBox="0 0 ${w} ${hgt}" role="img" aria-label="${esc(label)}">` +
    `<rect x="${pad}" y="${pad}" width="${w - 2 * pad}" height="${hgt - 2 * pad}" class="box"/>` +
    `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(y1)}" class="handle"/>` +
    `<line x1="${X(1)}" y1="${Y(1)}" x2="${X(x2)}" y2="${Y(y2)}" class="handle"/>` +
    `<path d="M${X(0)},${Y(0)} C${X(x1)},${Y(y1)} ${X(x2)},${Y(y2)} ${X(1)},${Y(1)}" class="curve"/></svg>`
  );
}

/* ------------------------------------------------------------------ */
/* Root.tsx: the example videos                                        */
/* ------------------------------------------------------------------ */

function readVideos(studioDir, libNames) {
  const rootSrc = readText(join(studioDir, 'src', 'Root.tsx'));
  const videosDir = join(studioDir, 'src', 'videos');
  let dirs = [];
  try {
    dirs = readdirSync(videosDir).filter((d) => statSync(join(videosDir, d)).isDirectory());
  } catch {
    /* none */
  }
  // numeric constants across the video folders, for durations
  const consts = {};
  const filesOf = (d) => {
    try {
      return readdirSync(join(videosDir, d)).filter((f) => /\.(ts|tsx)$/.test(f));
    } catch {
      return [];
    }
  };
  const allSrc = {};
  for (const d of dirs) for (const f of filesOf(d)) allSrc[`${d}/${f}`] = readText(join(videosDir, d, f));
  for (let pass = 0; pass < 3; pass++) {
    for (const src of Object.values(allSrc)) {
      for (const m of src.matchAll(/export\s+const\s+([A-Z][A-Z0-9_]+)\s*=\s*([^;\n]+);/g)) {
        if (consts[m[1]] !== undefined) continue;
        const expr = m[2].replace(/\b([A-Z][A-Z0-9_]+)\b/g, (_, id) => (consts[id] !== undefined ? consts[id] : id));
        if (/^[\d\s+\-*/().]+$/.test(expr)) {
          try {
            consts[m[1]] = Function(`"use strict";return (${expr})`)();
          } catch {
            /* ignore */
          }
        }
      }
    }
  }
  const imports = {};
  for (const m of rootSrc.matchAll(/import\s*\{([^}]*)\}\s*from\s*"\.\/videos\/([\w-]+)\/[\w]+"/g)) {
    for (const n of m[1].split(',')) imports[n.trim()] = m[2];
  }
  const comps = [];
  const registeredDirs = new Set();
  const folderBlocks = [...rootSrc.matchAll(/<Folder name="([^"]+)">([\s\S]*?)<\/Folder>/g)];
  for (const fb of folderBlocks) {
    for (const cm of fb[2].matchAll(/<Composition\s+([\s\S]*?)\/>/g)) {
      const attrs = cm[1];
      const get = (k) => {
        const m1 = new RegExp(`${k}=(?:"([^"]*)"|\\{([^}]*)\\})`).exec(attrs);
        return m1 ? (m1[1] ?? m1[2]).trim() : '';
      };
      const compName = get('component');
      const dir = imports[compName] || '';
      if (dir) registeredDirs.add(dir);
      const durRaw = get('durationInFrames');
      const fps = Number(get('fps')) || 30;
      const frames = /^\d+$/.test(durRaw) ? Number(durRaw) : consts[durRaw];
      comps.push({
        id: get('id'),
        folder: fb[1],
        width: Number(get('width')) || 1920,
        height: Number(get('height')) || 1080,
        fps,
        seconds: typeof frames === 'number' ? frames / fps : null,
        dir,
        compName,
      });
    }
  }
  const describe = (dir, compName) => {
    for (const f of filesOf(dir)) {
      const src = allSrc[`${dir}/${f}`];
      if (compName) {
        const { doc } = docAbove(src, compName);
        if (doc) return doc.replace(/\n/g, ' ');
      }
    }
    for (const f of filesOf(dir)) {
      const dm = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*\nexport/.exec(allSrc[`${dir}/${f}`]);
      if (dm) return cleanDoc(dm[1]).replace(/\n/g, ' ');
    }
    return '';
  };
  const uses = (dir) => {
    const set = new Set();
    for (const f of filesOf(dir)) {
      for (const m of allSrc[`${dir}/${f}`].matchAll(/import\s*\{([^}]*)\}\s*from\s*"\.\.\/\.\.\/lib"/g)) {
        for (const n of m[1].split(',')) {
          const name = n.trim();
          if (libNames.has(name)) set.add(name);
        }
      }
    }
    return [...set];
  };
  const videos = comps.map((c) => ({ ...c, description: describe(c.dir, c.compName), uses: uses(c.dir) }));
  const unregistered = dirs
    .filter((d) => !registeredDirs.has(d))
    .map((d) => ({
      id: d,
      folder: d.startsWith('_') ? 'Template source' : 'Not registered yet',
      dir: d,
      description: describe(d, ''),
      uses: uses(d),
      width: 1920,
      height: 1080,
      seconds: null,
    }));
  return { videos, unregistered };
}

/* ------------------------------------------------------------------ */
/* page builders                                                       */
/* ------------------------------------------------------------------ */

const fmtSize = (v) => (v.width && v.height ? `${v.width}×${v.height}` : '');
const fmtDur = (s) => (typeof s === 'number' ? `${Number.isInteger(s) ? s : s.toFixed(1)} s` : '');

function codeBlock(code, lang = 'tsx') {
  return `<pre><code class="lang-${esc(lang)}">${esc(code)}</code></pre>`;
}

function componentCard(c, ds, root) {
  const d = ds.get(c.name);
  const desc = c.summary || (d && d.note) || '';
  const example = d?.example || c.example;
  const reqCount = c.props.filter((p) => !p.optional).length;
  const rows = c.props
    .map((p) => {
      const def = c.defaults[p.name];
      const clean = p.type.replace(/^readonly\s+/, '');
      const type = clean.length > 90 ? clean.slice(0, 87) + '...' : clean;
      return (
        `<tr><td><code>${esc(p.name)}</code>${p.optional ? '' : ' <span class="ps-req">required</span>'}</td>` +
        `<td><code title="${esc(p.type)}">${esc(type)}</code></td>` +
        `<td>${def ? `<code>${esc(def)}</code>` : '<span class="ps-dim">none</span>'}</td>` +
        `<td>${inlineText(p.doc)}</td></tr>`
      );
    })
    .join('');
  const fids = (c.fids || [])
    .map((f) => `<a class="ps-chip tech" href="${root}techniques/#${esc(f)}">from technique ${esc(f)}</a>`)
    .join('');
  return (
    `<article class="ps-comp" id="c-${esc(c.name)}">` +
    `<header><h3><code>&lt;${esc(c.name)} /&gt;</code></h3>` +
    `<a class="ps-src" href="${esc(ghUrl(c.path))}" rel="noopener noreferrer">${esc(c.path)}</a></header>` +
    (desc ? `<p class="ps-desc">${inlineText(desc)}</p>` : '') +
    (d?.when ? `<p class="ps-when"><span>Use it for</span> ${inlineText(d.when)}</p>` : '') +
    (fids ? `<p class="ps-chips">${fids}</p>` : '') +
    (example ? codeBlock(example) : '') +
    (c.props.length
      ? `<details class="ps-props"><summary>${c.props.length} props${reqCount ? `, ${reqCount} required` : ''}</summary>` +
        `<div class="ps-table"><table><thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>What it does</th></tr></thead><tbody>${rows}</tbody></table></div></details>`
      : '') +
    `</article>`
  );
}

function functionRow(f, root) {
  const sig =
    f.kind === 'object'
      ? `{ ${f.keys.join(', ')} }`
      : f.sig
        ? `${f.name}${f.sig}`
        : f.name;
  const fids = (f.fids || [])
    .map((x) => `<a class="ps-chip tech" href="${root}techniques/#${esc(x)}">${esc(x)}</a>`)
    .join(' ');
  return (
    `<div class="ps-fn" id="f-${esc(f.name)}"><div class="ps-fn-head"><code class="name">${esc(f.name)}</code> ${fids}</div>` +
    (f.summary ? `<p>${inlineText(f.summary)}</p>` : '') +
    `<pre class="ps-sig" data-nocopy><code>${esc(sig)}</code></pre></div>`
  );
}

async function buildOverview({ root, lib, tokens, videos, unregistered, readme, docs, repo, dsMd }) {
  const mediaDir = join(docs, 'media');
  const hasMp4 = existsSync(join(mediaDir, 'showcase.mp4'));
  const hasGif = existsSync(join(mediaDir, 'showcase.gif'));
  const hasGuide = existsSync(join(mediaDir, 'guide.png'));
  const intro = readme.split('\n').find((l) => l.trim() && !l.startsWith('#')) || '';

  const quick = sectionOf(readme, /^Quick start$/);
  const scripts = sectionOf(readme, /^Scripts$/);
  const startNew = sectionOf(readme, /^Start a new video$/);
  const rend = (md) => fixLinks(renderMarkdown(md, { headingOffset: 2 }).html, 'studio');

  const stats = [
    [lib.components.length, 'components'],
    [lib.functions.length, 'motion helpers'],
    [tokens.count, 'design tokens'],
    [videos.length, 'example videos'],
    [2, 'engines'],
  ];

  const principles = [
    ['Deterministic frames', 'Every frame is a pure function of the frame number: useCurrentFrame, interpolate, spring. No CSS transitions, timers or Math.random, so a still and a render always agree.'],
    ['Reusable components', `${lib.components.length} small components in src/lib: titles, staggered text, captions, counters, charts, masks, sound. Prop-driven, frame-local, safe by default.`],
    ['One folder per video', 'Each film lives in src/videos/<slug>/ with its scenes and a timeline file, registered in Root.tsx. Copy the template to start.'],
    ['Design tokens', 'Palette, type scale, spacing, safe margins, springs, easing and timing live in one tokens file. Change values there, never inline in a scene.'],
  ];

  const helperIds = ['buoyant', 'velocityCut', 'FragmentChain', 'speedCurve', 'GhostType'];
  const helperCards = helperIds
    .map((n) => lib.components.find((c) => c.name === n) || lib.functions.find((f) => f.name === n))
    .filter(Boolean)
    .map((x) => {
      const isComp = Array.isArray(x.props);
      const f = (x.fids || [])[0];
      return (
        `<div class="card"><h3><code>${esc(x.name)}${isComp ? '' : '()'}</code></h3>` +
        `<p>${inlineText((x.summary || '').slice(0, 260))}</p>` +
        `<div class="meta"><a href="${root}studio/components/#${isComp ? 'c-' : 'f-'}${esc(x.name)}">In the catalogue</a>` +
        (f ? ` &middot; <a href="${root}techniques/#${esc(f)}">Technique ${esc(f)}</a>` : '') +
        `</div></div>`
      );
    })
    .join('');

  const vidCards = (list) =>
    list
      .map(
        (v) =>
          `<div class="card ps-video"><span class="badge plain">${esc(v.folder)}</span><h3>${esc(v.id)}</h3>` +
          `<p>${inlineText(v.description || 'Example composition.')}</p>` +
          `<div class="meta">${[fmtSize(v), fmtDur(v.seconds), v.dir ? 'src/videos/' + v.dir : ''].filter(Boolean).map(esc).join(' &middot; ')}</div>` +
          (v.uses.length
            ? `<p class="ps-chips">${v.uses.slice(0, 8).map((u) => `<a class="ps-chip" href="${root}studio/components/#c-${esc(u)}">${esc(u)}</a>`).join('')}</p>`
            : '') +
          (v.dir ? `<div class="meta"><a href="${esc(ghUrl('studio/src/videos/' + v.dir, 'tree'))}" rel="noopener noreferrer">Source on GitHub</a></div>` : '') +
          `</div>`
      )
      .join('');

  const toc = [
    { id: 'what', text: 'What it is' },
    { id: 'film', text: 'See it' },
    { id: 'quick-start', text: 'Quick start' },
    { id: 'videos', text: 'Example videos' },
    { id: 'helpers', text: 'New helpers from the research' },
    { id: 'engines', text: 'Two engines' },
    { id: 'next', text: 'Go deeper' },
  ];

  const media = hasMp4
    ? `<figure class="ps-film"><video controls preload="metadata" playsinline muted poster="${root}media/showcase-poster.jpg"${hasGif ? '' : ''} aria-label="LibraryShowcase render"><source src="${root}media/showcase.mp4#t=4" type="video/mp4"></video>` +
      `<figcaption>LibraryShowcase, 15 s, 1920×1080 at 30 fps: every library component in one film, rendered from this project.</figcaption></figure>`
    : hasGif
      ? `<figure class="ps-film"><img src="${root}media/showcase.gif" alt="LibraryShowcase render" loading="lazy"><figcaption>LibraryShowcase: every library component in one film.</figcaption></figure>`
      : '';

  const main =
    hero(
      'Studio',
      'A small Remotion studio for motion graphics',
      `${inlineText(intro)}`
    ) +
    `<ul class="ps-stats" aria-label="At a glance">${stats.map(([n, l]) => `<li><b>${n}</b><span>${esc(l)}</span></li>`).join('')}</ul>` +
    subnav('', 'overview') +
    `<section id="what" class="ps-sec"><h2>What it is</h2><div class="grid cols-2 ps-principles">${principles
      .map(([t, p]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`)
      .join('')}</div></section>` +
    (media ? `<section id="film" class="ps-sec"><h2>See it</h2>${media}${hasGuide ? `<p class="ps-note">New here? The <a href="${root}guide/">illustrated guide</a> walks through the whole workflow.</p>` : ''}</section>` : '') +
    `<section id="quick-start" class="ps-sec"><h2>Quick start</h2>${rend(quick)}<h3>Scripts</h3>${rend(scripts)}<h3>Start a new video</h3>${rend(startNew)}</section>` +
    `<section id="videos" class="ps-sec"><h2>Example videos</h2><p class="ps-lead">Read these before writing a scene: each one shows the library in use.</p>` +
    (videos.length ? `<div class="grid">${vidCards(videos)}</div>` : '<p class="ps-note">No compositions are registered yet.</p>') +
    (unregistered.length ? `<h3>Also in the repo</h3><div class="grid">${vidCards(unregistered)}</div>` : '') +
    `</section>` +
    (helperCards
      ? `<section id="helpers" class="ps-sec"><h2>New helpers from the research</h2><p class="ps-lead">Techniques that earned a place in the library after the Claude motion research. Each links to the finding it came from.</p><div class="grid">${helperCards}</div></section>`
      : '') +
    `<section id="engines" class="ps-sec"><h2>Two engines</h2><p>Remotion (this project) is the default: kinetic type, titles, UI demos, diagrams, data, captions, reels, templates. The HTML engine in <code>skills/motion-studio</code> is for narrated product films where every cut lands on a spoken word. <a href="${root}studio/engines/">Which one, and what each contains</a>.</p></section>` +
    `<section id="next" class="ps-sec"><h2>Go deeper</h2><div class="grid">` +
    h.card({ title: 'Component catalogue', text: `All ${lib.components.length} components with props, defaults and an example.`, href: `${root}studio/components/` }) +
    h.card({ title: 'Design tokens', text: 'Palette, type, spacing, safe margins, springs and easing, drawn.', href: `${root}studio/tokens/` }) +
    h.card({ title: 'Design system rules', text: 'The rules every video follows.', href: `${root}studio/design-system/` }) +
    `</div></section>`;

  return page({
    title: 'Studio',
    desc: 'The Remotion studio: deterministic frame-based components, design tokens and example videos.',
    active: 'studio',
    root,
    extraHead: css(root),
    body: docLayout(main, toc),
  });
}

function buildComponents({ root, lib, ds }) {
  const grouped = new Map();
  for (const c of lib.components) {
    const g = GROUPS.find(([, names]) => names.includes(c.name));
    const label = g ? g[0] : 'More components';
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(c);
  }
  const order = [...GROUPS.map(([l]) => l), 'More components'].filter((l) => grouped.has(l));
  const sections = order
    .map((label, i) => {
      const id = 'g-' + label.toLowerCase().replace(/[^a-z]+/g, '-');
      return `<section id="${id}" class="ps-sec"><h2>${esc(label)}</h2>${grouped.get(label).map((c) => componentCard(c, ds, root)).join('')}</section>`;
    })
    .join('');
  const toc = order.map((label) => ({ id: 'g-' + label.toLowerCase().replace(/[^a-z]+/g, '-'), text: label }));
  const fnGroups = new Map();
  for (const f of lib.functions) {
    const label = FILE_LABEL[f.file] || f.file;
    if (!fnGroups.has(label)) fnGroups.set(label, []);
    fnGroups.get(label).push(f);
  }
  const fnHtml = [...fnGroups.entries()]
    .map(([label, list]) => `<h3>${esc(label)}</h3><div class="ps-fns">${list.map((f) => functionRow(f, root)).join('')}</div>`)
    .join('');
  toc.push({ id: 'helpers', text: 'Motion and timing helpers' });
  const main =
    hero(
      'Studio / Components',
      'Component catalogue',
      `Generated from <code>studio/src/lib</code>: ${lib.components.length} components and ${lib.functions.length} helpers. Every component is frame-local (frame 0 is its parent Sequence start) and takes <code>delay</code>, and most take <code>durationInFrames</code>.`
    ) +
    subnav('../', 'components') +
    sections +
    `<section id="helpers" class="ps-sec"><h2>Motion and timing helpers</h2><p class="ps-lead">Pure functions of the frame: hooks, easing, camera curves, transitions, copy checks. Signatures are read from the source.</p>${fnHtml}</section>`;
  return page({
    title: 'Component catalogue',
    desc: 'Every component in the studio library: what it is for, props, defaults and an example.',
    active: 'studio',
    root,
    extraHead: css(root),
    body: docLayout(main, toc),
  });
}

function swatch(name, value, note) {
  return (
    `<div class="ps-swatch"><div class="chip" style="--c:${esc(value)}"><i></i></div>` +
    `<div><b>${esc(name)}</b><code>${esc(value)}</code>${note ? `<span>${esc(note)}</span>` : ''}</div></div>`
  );
}

function buildTokens({ root, tokens: t, dsMd, lib }) {
  const toc = [];
  const sec = (id, title, intro, body) => {
    toc.push({ id, text: title });
    return `<section id="${id}" class="ps-sec"><h2>${esc(title)}</h2>${intro ? `<p class="ps-lead">${intro}</p>` : ''}${body}</section>`;
  };
  const use = {};
  for (const m of sectionOf(dsMd, /^Palette$/).matchAll(/^\|\s*`color\.(\w+)`(?:\s*\/\s*`(\w+)`)?[^|]*\|[^|]*\|\s*([^|]+?)\s*\|/gm)) {
    use[m[1]] = m[3];
    if (m[2]) use[m[2]] = m[3];
  }
  let out = '';
  if (t.color)
    out += sec(
      'palette',
      'Palette',
      'One accent. Everything else is neutral. The accent marks the focal point only: one word, one bar, one number.',
      `<div class="ps-swatches">${Object.entries(t.color).map(([k, v]) => swatch(`color.${k}`, v, t.colorDoc[k] || use[k] || '')).join('')}</div>`
    );
  if (t.type) {
    const rows = Object.entries(t.type)
      .map(([k, v]) => {
        const px = v.fontSize;
        const shown = Math.round(px * 0.34);
        return (
          `<div class="ps-type-row"><div class="meta"><b>type.${esc(k)}</b><span>${px} px / ${esc(v.lineHeight)} / ${esc(v.fontWeight)}</span><span>${esc(v.letterSpacing)}</span></div>` +
          `<div class="sample" style="font-size:${shown}px;line-height:${esc(v.lineHeight)};letter-spacing:${esc(v.letterSpacing)};font-weight:${esc(v.fontWeight)}">${k === 'label' ? 'LABEL 00:12' : 'Motion explains'}</div></div>`
        );
      })
      .join('');
    out += sec(
      'type',
      'Type scale',
      'Sizes are for the 1080 px short side, so the same scale works in 16:9, 9:16 and 1:1. Samples are drawn at about a third of video size. Fonts in the films: Inter Tight for reading, JetBrains Mono for labels.',
      `<div class="ps-type">${rows}</div>`
    );
  }
  if (t.frameRamp) {
    const max = Math.max(...Object.values(t.frameRamp));
    const rows = Object.entries(t.frameRamp)
      .map(
        ([k, v]) =>
          `<div class="ps-ramp-row"><b>${esc(k)}</b><div class="bar"><i style="width:${((v / max) * 100).toFixed(1)}%"></i></div><span>${v} vw</span><span class="px">${Math.round((1920 * v) / 100)} px at 1920</span>` +
          `${t.frameRampDoc[k] ? `<em>${esc(t.frameRampDoc[k])}</em>` : ''}</div>`
      )
      .join('');
    out += sec(
      'ramp',
      'Video-native type ramp',
      `For hero moments. Sizes are a percent of the composition width, so a keyword can be as large as the frame allows${t.floor && t.floor.value ? `; nothing goes below ${t.floor.value} vw` : ''}.`,
      `<div class="ps-ramp">${rows}</div>`
    );
  }
  if (t.space) {
    const max = Math.max(...Object.values(t.space));
    const rows = Object.entries(t.space)
      .map(([k, v]) => `<div class="ps-space-row"><b>space.${esc(k)}</b><div class="bar"><i style="width:${((v / max) * 100).toFixed(1)}%"></i></div><span>${v} px</span></div>`)
      .join('');
    const radii = t.radius
      ? `<div class="ps-radii">${Object.entries(t.radius).map(([k, v]) => `<div><i style="border-radius:${v}px"></i><b>radius.${esc(k)}</b><span>${v} px</span></div>`).join('')}</div>`
      : '';
    out += sec('space', 'Spacing and radii', 'An 8 px base grid for gaps and padding.', `<div class="ps-spaces">${rows}</div>${radii}`);
  }
  if (t.safeArea) {
    const fmts = Object.entries(t.safeArea).map(([f, ins]) => {
      const dims = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080] }[f] || [1920, 1080];
      const [W, H] = dims;
      return (
        `<figure class="ps-safe"><div class="frame" style="aspect-ratio:${W}/${H}"><div class="inner" style="top:${((ins.top / H) * 100).toFixed(2)}%;bottom:${((ins.bottom / H) * 100).toFixed(2)}%;left:${((ins.left / W) * 100).toFixed(2)}%;right:${((ins.right / W) * 100).toFixed(2)}%"></div></div>` +
        `<figcaption><b>${esc(f)}</b> ${W}×${H}<br>top ${ins.top}, right ${ins.right}, bottom ${ins.bottom}, left ${ins.left}</figcaption></figure>`
      );
    });
    out += sec(
      'safe',
      'Safe margins per format',
      'Key text and logos stay inside the inner box. 9:16 reserves extra room at the top and bottom for platform interface. Re-compose for each format instead of scaling.',
      `<div class="ps-safes">${fmts.join('')}</div>`
    );
  }
  if (t.springs) {
    const fps = typeof t.fps?.value === 'number' ? t.fps.value : 30;
    const cards = Object.entries(t.springs)
      .map(([k, cfg]) => {
        const c = springCurve(cfg, fps, 60);
        return (
          `<div class="card ps-curve"><h3>springs.${esc(k)}</h3>${plotSvg(c.pts, { label: `${k} spring response` })}` +
          `<p>${esc(t.springsDoc[k] || '')}</p>` +
          `<div class="meta">damping ${cfg.damping}, stiffness ${cfg.stiffness}, mass ${cfg.mass}<br>overshoot ${(c.overshoot * 100).toFixed(1)}%, settles in about ${c.settle} frames</div></div>`
        );
      })
      .join('');
    out += sec('springs', 'Spring presets', 'Plotted over two seconds with the same step the Remotion spring() function takes each frame. The dashed line is the target.', `<div class="grid ps-curves">${cards}</div>`);
  }
  if (t.ease) {
    const cards = Object.entries(t.ease)
      .map(
        ([k, c]) =>
          `<div class="card ps-curve"><h3>ease.${esc(k)}</h3>${bezierPlot(c, `ease ${k}`)}<p>${esc(t.easeDoc[k] || '')}</p><div class="meta">cubic-bezier(${c.join(', ')})</div></div>`
      )
      .join('');
    const buoy = lib.functions.find((f) => f.name === 'buoyant');
    let buoyCard = '';
    if (buoy) {
      const bob = 0.03;
      const vals = Array.from({ length: 61 }, (_, i) => {
        const x = i / 60;
        return 1 - Math.pow(1 - x, 3) + bob * Math.sin(Math.PI * x);
      });
      buoyCard =
        `<div class="card ps-curve"><h3>buoyant()</h3>${plotSvg(vals, { label: 'buoyant ease', ymax: 1.12 })}` +
        `<p>${inlineText(buoy.summary)}</p><div class="meta">plotted with the default bob of 0.03 from the formula in its doc comment</div></div>`;
    }
    out += sec(
      'easing',
      'Easing curves',
      'Bezier curves for <code>interpolate()</code>. Never animate linearly unless it is a counter or a constant drift.',
      `<div class="grid ps-curves">${cards}${buoyCard}</div>`
    );
  }
  if (t.timing) {
    const rows = Object.entries(t.timing)
      .map(([k, v]) => `<tr><td><code>timing.${esc(k)}</code></td><td>${esc(v)}</td><td>${typeof v === 'number' ? (v / (typeof t.fps?.value === 'number' ? t.fps.value : 30)).toFixed(2) + ' s' : ''}</td><td>${esc(t.timingDoc[k] || '')}</td></tr>`)
      .join('');
    out += sec('timing', 'Timing defaults', 'In frames at 30 fps.', `<div class="ps-table"><table><thead><tr><th>Token</th><th>Frames</th><th>Seconds</th><th>Meaning</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }
  const main =
    hero('Studio / Tokens', 'Design tokens', `Read from <code>studio/src/lib/tokens.ts</code>: ${t.count} values. Change them there, never inline in a scene. Rules for using them are in the <a href="${root}studio/design-system/">design system</a>.`) +
    subnav('../', 'tokens') +
    (out || '<p class="ps-note">tokens.ts could not be read.</p>');
  return page({
    title: 'Design tokens',
    desc: 'The studio design tokens drawn: palette, type scale, spacing, safe margins, springs and easing.',
    active: 'studio',
    root,
    extraHead: css(root),
    body: docLayout(main, toc),
  });
}

function buildDesignSystem({ root, dsMd }) {
  if (!dsMd) {
    return page({ title: 'Design system', desc: 'Design system', active: 'studio', root, extraHead: css(root), body: hero('Studio', 'Design system', 'DESIGN_SYSTEM.md was not found.') + subnav('../', 'design-system') });
  }
  const body = dsMd.replace(/^# .*\n/, '');
  const r = renderMarkdown(body, { headingOffset: 0 });
  const toc = r.headings.filter((x) => x.level === 2).map((x) => ({ id: x.id, text: x.text }));
  const html = fixLinks(r.html, 'studio');
  const main =
    hero('Studio / Design system', 'Design system rules', `The rules every video in the studio follows, rendered from <a href="${esc(ghUrl('studio/DESIGN_SYSTEM.md'))}" rel="noopener noreferrer">DESIGN_SYSTEM.md</a>. See them drawn on the <a href="${root}studio/tokens/">tokens page</a>.`) +
    subnav('../', 'design-system') +
    `<div class="prose wide ps-prose">${html}</div>`;
  return page({
    title: 'Design system',
    desc: 'The rules every video follows: palette, type, spacing, motion principles, transitions and components.',
    active: 'studio',
    root,
    extraHead: css(root),
    body: docLayout(main, toc),
  });
}

function describeTool(file, text) {
  if (file.endsWith('.py')) {
    const m = /"""([\s\S]*?)(?:\n\n|""")/.exec(text);
    return m ? m[1].replace(/\n/g, ' ').trim() : '';
  }
  const lines = text.split('\n');
  const out = [];
  for (const l of lines) {
    if (!l.startsWith('//')) break;
    const t = l.replace(/^\/\/\s?/, '');
    if (/^(Usage|node |python)/i.test(t.trim())) break;
    out.push(t);
  }
  return out.join(' ').trim();
}

function buildEngines({ root, repo }) {
  const sk = join(repo, 'skills', 'motion-studio');
  const engineMd = readText(join(sk, 'references', 'engine.md'));
  const audioMd = readText(join(sk, 'references', 'audio.md'));
  const claudeMd = readText(join(repo, 'CLAUDE.md'));
  const rend = (md, off = 2) => fixLinks(renderMarkdown(md, { headingOffset: off }).html, 'skills/motion-studio/references');
  const toc = [];
  const sec = (id, title, body) => {
    toc.push({ id, text: title });
    return `<section id="${id}" class="ps-sec"><h2>${esc(title)}</h2>${body}</section>`;
  };

  const compare = [
    ['Best for', 'Kinetic type, titles, UI demos, diagrams, data viz, explainers, captions, reels, templates', 'Narrated product films where every cut, caption and camera move lands on a spoken word'],
    ['Written in', 'React and TypeScript, frame based', 'One HTML composition, one function of time'],
    ['Reviewing', 'Remotion Studio preview, rendered stills and contact sheets', 'A live HTML player with the real mix, scrubbable; MP4 only on approval'],
    ['Timing comes from', 'Frame numbers and a timeline file per video', 'Voice-over word times (Kokoro voice, Whisper timestamps) on a beat grid'],
    ['Sound', 'Sfx component and built-in synthesised cues', 'A hits table, a composed music bed, ducked mix at -14 LUFS'],
    ['Rendering', 'remotion render', 'Headless browser, subframe motion blur, piped into ffmpeg'],
    ['Pick it when', 'It is the default', 'The voice sets the pace of the film'],
  ];
  const cmp =
    `<div class="ps-table"><table class="engines"><thead><tr><th></th><th>Remotion (studio/)</th><th>HTML engine (skills/motion-studio)</th></tr></thead><tbody>` +
    compare.map(([a, b, c]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('') +
    `</tbody></table></div>`;

  const which = sectionOf(claudeMd, /^Which engine$/);
  const whichHtml = which ? `<div class="prose wide">${fixLinks(renderMarkdown(which, { headingOffset: 2 }).html)}</div>` : '';

  // tools in the HTML engine template
  const toolDir = join(sk, 'template', 'tools');
  let tools = [];
  try {
    tools = readdirSync(toolDir).sort();
  } catch {
    /* none */
  }
  const toolRows = tools
    .map((f) => {
      const d = describeTool(f, readText(join(toolDir, f)));
      return `<tr><td><a href="${esc(ghUrl('skills/motion-studio/template/tools/' + f))}" rel="noopener noreferrer"><code>${esc(f)}</code></a></td><td>${esc(d)}</td></tr>`;
    })
    .join('');
  const compDir = join(sk, 'template', 'comp');
  let compFiles = [];
  try {
    compFiles = readdirSync(compDir).sort();
  } catch {
    /* none */
  }

  const contract = sectionOf(engineMd, /^The contract$/);
  const loop = sectionOf(engineMd, /^The live review loop/);
  const rendering = sectionOf(engineMd, /^Rendering$/);
  const hitsPara = audioMd
    .split('\n\n')
    .find((p) => /hits table/i.test(p) && /cue sheet/i.test(p));

  let refs = [];
  try {
    refs = readdirSync(join(sk, 'references')).filter((f) => f.endsWith('.md')).sort();
  } catch {
    /* none */
  }
  const refRows = refs
    .map((f) => {
      const t = (/^# (.*)$/m.exec(readText(join(sk, 'references', f))) || [])[1] || f;
      return `<li><a href="${esc(ghUrl('skills/motion-studio/references/' + f))}" rel="noopener noreferrer">${esc(t)}</a></li>`;
    })
    .join('');

  let main =
    hero('Studio / Engines', 'Two engines', 'Remotion is the default. The HTML engine exists for one job: a narrated film where the voice sets the pace. Pick before you plan.') +
    subnav('../', 'engines') +
    sec('compare', 'Which one, when', cmp + whichHtml);
  main += sec(
    'html-engine',
    'What the HTML engine contains',
    `<p>A project is created by <code>skills/motion-studio/tools/new-project.mjs</code> and holds the pieces below.</p>` +
      `<div class="grid cols-2">` +
      h.card({ title: 'Composition', text: compFiles.length ? `comp/ with ${compFiles.join(', ')}. frame(t) sets every style from time alone.` : 'The stage and the frame(t) function.' }) +
      h.card({ title: 'Live player', text: 'A review bar over the stage: play, scrub, time readout, subtitle toggle, driven by the real mix.' }) +
      h.card({ title: 'Hits table', text: 'Every sound event is a row; the cue sheet in the composition is a one-to-one copy, and a sync check verifies each cue lands within 40 ms.' }) +
      h.card({ title: 'Sound pipeline', text: 'Voice-over, word times, a beat-grid timeline, a composed music bed and a ducked, loudness-normalised mix.' }) +
      h.card({ title: 'Render tools', text: 'Preview stills and contact sheets, frame-exact video with subframe motion blur, subtitles.' }) +
      `</div>` +
      (hitsPara ? `<h3>The hits table</h3><div class="prose wide">${rend(hitsPara.replace(/`~\/\.claude\/skills\/motion-review\/tools\/inspect\.mjs`/g, '`inspect.mjs`'))}</div>` : '') +
      (toolRows ? `<h3>Tools in every project</h3><div class="ps-table"><table><thead><tr><th>File</th><th>What it does</th></tr></thead><tbody>${toolRows}</tbody></table></div>` : '')
  );
  if (contract) main += sec('contract', 'The contract', `<div class="prose wide">${rend(contract)}</div>`);
  if (loop) main += sec('review-loop', 'The live review loop', `<div class="prose wide">${rend(loop)}</div>`);
  if (rendering) main += sec('rendering', 'Rendering', `<div class="prose wide">${rend(rendering)}</div>`);
  if (refRows) main += sec('references', 'Reference guides', `<p class="ps-lead">The engine's written method, one file per concern.</p><ul class="ps-refs">${refRows}</ul>`);

  return page({
    title: 'Two engines',
    desc: 'Remotion versus the HTML motion-studio engine: when to use which and what the HTML engine contains.',
    active: 'studio',
    root,
    extraHead: css(root),
    body: docLayout(main, toc),
  });
}

/* ------------------------------------------------------------------ */
/* entry                                                               */
/* ------------------------------------------------------------------ */

function write(docs, rel, html) {
  const p = join(docs, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, html, 'utf8');
  return rel;
}

export default async function build({ repo, docs }) {
  const studioDir = join(repo, 'studio');
  const readme = readText(join(studioDir, 'README.md'));
  const dsMd = readText(join(studioDir, 'DESIGN_SYSTEM.md'));
  const lib = readLib(studioDir);
  const libNames = new Set(lib.exported.map((e) => e.name));
  const tokens = readTokens(studioDir);
  const { videos, unregistered } = readVideos(studioDir, libNames);
  const ds = readDsComponents(dsMd);
  const ctx = { lib, tokens, videos, unregistered, readme, docs, repo, dsMd, ds };
  const written = [];
  written.push(write(docs, 'studio/index.html', await buildOverview({ root: '../', ...ctx })));
  written.push(write(docs, 'studio/components/index.html', buildComponents({ root: '../../', ...ctx })));
  written.push(write(docs, 'studio/tokens/index.html', buildTokens({ root: '../../', ...ctx })));
  written.push(write(docs, 'studio/design-system/index.html', buildDesignSystem({ root: '../../', ...ctx })));
  written.push(write(docs, 'studio/engines/index.html', buildEngines({ root: '../../', ...ctx })));
  console.log(`studio: ${lib.components.length} components, ${lib.functions.length} helpers, ${tokens.count} tokens, ${videos.length} videos (+${unregistered.length} unregistered), ${written.length} pages`);
  return written;
}
