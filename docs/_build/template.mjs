// Shared page template for the docs site. Every generated page goes through page().
// `root` is the relative prefix to the site root: '' for /index.html, '../' for /skills/index.html.
// All dynamic text must go through esc(); body is trusted HTML you built from escaped parts.

export const REPO = 'https://github.com/AnnasMustafaDev/video-studio';
export const SITE_NAME = 'Video Studio';

export const NAV = [
  { id: 'home', label: 'Home', href: '' },
  { id: 'tour', label: 'Tour', href: 'tour/' },
  { id: 'guide', label: 'Guide', href: 'guide/' },
  { id: 'skills', label: 'Skills', href: 'skills/' },
  { id: 'prompts', label: 'Prompts', href: 'prompts/' },
  { id: 'studio', label: 'Studio', href: 'studio/' },
  { id: 'techniques', label: 'Techniques', href: 'techniques/' },
  { id: 'shots', label: 'Shot library', href: 'shot-library/' },
  { id: 'research', label: 'Research', href: 'research/' },
  { id: 'gallery', label: 'Gallery', href: 'gallery/' },
  { id: 'credits', label: 'Credits', href: 'credits/' },
];

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only allow http(s) and relative links in generated content. */
export function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (/^(\.{0,2}\/|#|[A-Za-z0-9_-]+\/)/.test(s) && !/^[a-z]+:/i.test(s)) return s;
  return '#';
}

export function nav(root, active) {
  return NAV.map(
    (n) =>
      `<a href="${root}${n.href}"${n.id === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`
  ).join('');
}

/** Public site: never leak local machine paths. Applied to every page body. */
export function scrubLocalPaths(s) {
  return String(s)
    .replace(/\{\{\s*VIDEO_STUDIO\s*\}\}|&#123;&#123;\s*VIDEO_STUDIO\s*&#125;&#125;|&lbrace;&lbrace;\s*VIDEO_STUDIO\s*&rbrace;&rbrace;/g, '&lt;repo&gt;')
    .replace(/C:[\\/]+Users[\\/]+[^\\/<>"'`]+[\\/]+Documents[\\/]+me[\\/]+video-studio/gi, '&lt;repo&gt;')
    .replace(/C:[\\/]+Users[\\/]+[^\\/<>"'`]+/gi, '~');
}

export function page({ title, desc = '', active = '', root = '', body, extraHead = '' }) {
  body = scrubLocalPaths(body);
  const fullTitle = active === 'home' ? `${SITE_NAME}: motion graphics made in code with Claude` : `${title} · ${SITE_NAME}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23eef3ff'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%233b6cf6'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${root}assets/site.css">
${extraHead}
</head>
<body>
<header class="site">
  <div class="wrap">
    <a class="brand" href="${root}"><span class="dot"></span>${esc(SITE_NAME)}</a>
    <nav class="main" aria-label="Main">${nav(root, active)}</nav>
    <div class="tools">
      <a class="btn" href="${REPO}" rel="noopener noreferrer">GitHub</a>
      <button class="btn" id="theme-toggle" type="button" aria-label="Toggle light or dark theme">Theme</button>
    </div>
  </div>
</header>
<main>
  <div class="wrap">
${body}
  </div>
</main>
<footer class="site">
  <div class="wrap cols">
    <div>
      <strong>${esc(SITE_NAME)}</strong><br>
      A personal studio for motion graphics and animated videos with Claude Code.
    </div>
    <div>
      <a href="${REPO}" rel="noopener noreferrer">Source on GitHub</a><br>
      <a href="${root}credits/">Credits and licences</a>
    </div>
  </div>
</footer>
<script src="${root}assets/site.js" defer></script>
</body>
</html>
`;
}

/** Small helpers for building bodies */
export const h = {
  card: ({ title, text, href, meta, badge }) =>
    `<${href ? 'a' : 'div'} class="card"${href ? ` href="${esc(safeUrl(href))}"` : ''}>` +
    `${badge ? `<span class="badge">${esc(badge)}</span>` : ''}<h3>${esc(title)}</h3>` +
    `${text ? `<p>${esc(text)}</p>` : ''}${meta ? `<div class="meta">${esc(meta)}</div>` : ''}</${href ? 'a' : 'div'}>`,
  code: (s) => `<pre><code>${esc(s)}</code></pre>`,
  callout: (title, html, kind = '') =>
    `<div class="callout ${kind}"><div class="title">${esc(title)}</div>${html}</div>`,
};
