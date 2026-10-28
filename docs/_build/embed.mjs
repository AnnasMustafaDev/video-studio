// Copies the repo's standalone viewer pages into the site, WITHOUT touching the sources.
// Each copy gets a slim fixed top bar (site name + main nav), light theme by default, local paths scrubbed.
// Injection is idempotent: the block between the vs-embed markers is replaced, never duplicated.
import fs from 'node:fs';
import path from 'node:path';
import { NAV, SITE_NAME, esc, scrubLocalPaths } from './template.mjs';

const BAR_H = 44;

const PAGES = [
  { src: 'guide/index.html', dest: 'guide/index.html', active: 'guide', css: guideCss() },
  { src: 'research/gallery/index.html', dest: 'gallery/index.html', active: 'gallery', css: '', patch: patchGallery },
  { src: 'research/findings/index.html', dest: 'research/index.html', active: 'research', css: '' },
  { src: 'shot-library/index.html', dest: 'shot-library/index.html', active: 'shots', css: shotCss() },
];

function guideCss() {
  return `
@media (min-width: 961px) { .sidebar { top: ${BAR_H}px !important; height: calc(100vh - ${BAR_H}px) !important; } }
@media (max-width: 960px) {
  .topbar { top: ${BAR_H}px !important; }
  .sidebar { top: ${BAR_H + 53}px !important; max-height: calc(100vh - ${BAR_H + 53}px) !important; }
  section.doc, h3[id], h4[id] { scroll-margin-top: ${BAR_H + 64}px !important; }
}`;
}
function shotCss() {
  return `
.controls { top: ${BAR_H}px !important; }
article.card { scroll-margin-top: ${BAR_H + 150}px !important; }
@media (max-width: 760px) { article.card { scroll-margin-top: ${BAR_H + 16}px !important; } }`;
}

// Gallery cycles auto, dark, light and starts on "auto" (follows the OS). Start on light instead.
function patchGallery(html) {
  return html.replace('localStorage.getItem("gallery-theme") || "auto"', 'localStorage.getItem("gallery-theme") || "light"');
}

function barCss() {
  return `
html { scroll-padding-top: ${BAR_H + 12}px; }
body { padding-top: ${BAR_H}px !important; }
.vs-bar { position: fixed; top: 0; left: 0; right: 0; height: ${BAR_H}px; z-index: 2147483000; display: flex; align-items: center; gap: 4px;
  padding: 0 14px; background: rgba(255,255,255,.94); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  border-bottom: 1px solid #e8eaf0; font: 500 13.5px/1 Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  box-sizing: border-box; color: #454b57; }
.vs-bar * { box-sizing: border-box; }
.vs-bar .vs-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #15171c; text-decoration: none; white-space: nowrap; margin-right: 10px; flex: none; }
.vs-bar .vs-brand i { width: 11px; height: 11px; border-radius: 50%; background: #3b6cf6; display: inline-block; box-shadow: 0 0 0 3px #eef3ff; }
.vs-bar nav { display: flex; gap: 1px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0; align-items: center; height: 100%; }
.vs-bar nav::-webkit-scrollbar { display: none; }
.vs-bar nav a { color: #454b57; text-decoration: none; padding: 7px 10px; border-radius: 8px; white-space: nowrap; flex: none; }
.vs-bar nav a:hover { background: #f0f2f7; color: #15171c; }
.vs-bar nav a[aria-current="page"] { background: #eef3ff; color: #2c55d4; font-weight: 650; }
.vs-bar a:focus-visible { outline: 3px solid rgba(59,108,246,.5); outline-offset: 1px; }
html[data-theme="dark"] .vs-bar { background: rgba(14,16,19,.94); border-bottom-color: #262a32; color: #c6c9d1; }
html[data-theme="dark"] .vs-bar .vs-brand { color: #f1f2f4; }
html[data-theme="dark"] .vs-bar .vs-brand i { background: #6b93ff; box-shadow: 0 0 0 3px #19233f; }
html[data-theme="dark"] .vs-bar nav a { color: #c6c9d1; }
html[data-theme="dark"] .vs-bar nav a:hover { background: #1b1f26; color: #fff; }
html[data-theme="dark"] .vs-bar nav a[aria-current="page"] { background: #19233f; color: #8aa9ff; }
@media print { .vs-bar { display: none; } body { padding-top: 0 !important; } }`;
}

function barHtml(active) {
  const links = NAV.map(
    (n) => `<a href="../${n.href}"${n.id === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`
  ).join('');
  return `<!--vs-embed-start--><div class="vs-bar" role="navigation" aria-label="Site"><a class="vs-brand" href="../"><i></i>${esc(SITE_NAME)}</a><nav>${links}</nav></div><!--vs-embed-end-->`;
}

export function inject(html, { active, css = '' }) {
  // idempotent: remove any earlier injection first
  html = html
    .replace(/<!--vs-embed-start-->[\s\S]*?<!--vs-embed-end-->/g, '')
    .replace(/<style id="vs-embed-style">[\s\S]*?<\/style>/g, '');
  // light by default: the pages' own CSS keeps data-theme="light" ahead of any prefers-color-scheme rule
  html = html.replace(/<html([^>]*)>/i, (m, attrs) =>
    /data-theme=/.test(attrs) ? m.replace(/data-theme="[^"]*"/, 'data-theme="light"') : `<html${attrs} data-theme="light">`
  );
  html = html.replace(/<\/head>/i, `<style id="vs-embed-style">${barCss()}${css}</style>\n</head>`);
  html = html.replace(/<body([^>]*)>/i, (m) => `${m}\n${barHtml(active)}`);
  return html;
}

export default async function build({ repo, docs }) {
  const written = [];
  for (const p of PAGES) {
    const srcPath = path.join(repo, p.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`embed: ${p.src} not found, skipped`);
      continue;
    }
    let html = fs.readFileSync(srcPath, 'utf8');
    if (p.patch) html = p.patch(html);
    html = scrubLocalPaths(html);
    html = inject(html, p);
    const out = path.join(docs, p.dest);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    written.push(out);
  }
  return written;
}
