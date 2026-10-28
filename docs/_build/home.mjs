// Home page: hero, demo video, what it is, workflow, panels, numbers computed from the repo, quick start.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc, h, REPO } from './template.mjs';

const ICONS = {
  tour: '<path d="M3 11l18-8-8 18-2-8-8-2z"/>',
  guide: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
  skills: '<path d="M12 3l2.6 5.6L21 9.5l-4.6 4.2L17.6 20 12 16.9 6.4 20l1.2-6.3L3 9.5l6.4-.9z"/>',
  prompts: '<path d="M4 5h16v11H9l-5 4z"/>',
  studio: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
  techniques: '<path d="M4 18c3-9 5-9 8-3s5 6 8-9"/>',
  shots: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M8 5v4M13 5v4M18 5v4"/>',
  research: '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
  gallery: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
};
const icon = (k) =>
  `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg></span>`;

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function ls(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

function computeStats(repo) {
  const s = {};
  const skillDirs = ls(path.join(repo, 'skills')).filter((d) => d.isDirectory() && fs.existsSync(path.join(repo, 'skills', d.name, 'SKILL.md')));
  s.skills = skillDirs.length || null;
  s.thirdSkills = ls(path.join(repo, 'third_party/brag/skills')).filter((d) => d.isDirectory()).length || 0;

  const pr = ls(path.join(repo, 'prompts'));
  const main = pr.filter((d) => d.isFile() && /^\d\d-.*\.md$/.test(d.name)).length;
  const days = ls(path.join(repo, 'prompts/learning')).filter((d) => /^day-\d+\.md$/.test(d.name)).length;
  s.prompts = main ? main + days : null;
  s.promptDays = days;

  s.components = ls(path.join(repo, 'studio/src/lib')).filter((d) => d.isFile() && d.name.endsWith('.tsx')).length || null;
  s.videos = ls(path.join(repo, 'studio/src/videos')).filter((d) => d.isDirectory() && !d.name.startsWith('_')).length || null;

  const cards = readJson(path.join(repo, 'shot-library/cards.json'));
  s.shots = cards && Array.isArray(cards.cards) ? cards.cards.length : null;

  // Findings: unique ids from the three analyst files; landed = at least one ledger entry says landed
  let ids = new Set();
  for (const f of ls(path.join(repo, 'research/findings')).filter((d) => /^[A-Z]-.*\.md$/.test(d.name))) {
    try {
      const t = fs.readFileSync(path.join(repo, 'research/findings', f.name), 'utf8');
      for (const m of t.matchAll(/^###\s+(F-[A-Z]\d+)/gm)) ids.add(m[1]);
    } catch {}
  }
  const landed = new Set();
  for (const f of ls(path.join(repo, 'research/findings/ledger')).filter((d) => d.name.endsWith('.json'))) {
    const arr = readJson(path.join(repo, 'research/findings/ledger', f.name));
    if (!Array.isArray(arr)) continue;
    for (const e of arr) {
      if (!e || !e.id) continue;
      if (!ids.size) ids.add(e.id); // no markdown found: fall back to ledger ids
      if (e.status === 'landed' && ids.has(e.id)) landed.add(e.id);
    }
  }
  s.findings = ids.size || null;
  s.landed = ids.size ? landed.size : null;

  let gal = 0, galFound = false;
  for (const f of ls(path.join(repo, 'research/gallery')).filter((d) => d.name.endsWith('.json'))) {
    const arr = readJson(path.join(repo, 'research/gallery', f.name));
    if (Array.isArray(arr)) { gal += arr.length; galFound = true; }
  }
  s.gallery = galFound ? gal : null;
  return s;
}

export default async function build({ repo, docs }) {
  const st = computeStats(repo);
  const hasMp4 = fs.existsSync(path.join(docs, 'media/showcase.mp4'));
  const hasGif = fs.existsSync(path.join(docs, 'media/showcase.gif'));
  if (!hasMp4 && !hasGif) console.warn('home: no showcase media found in docs/media');

  const media = hasMp4
    ? `<video controls muted loop playsinline preload="metadata" poster="media/showcase-poster.jpg" aria-label="The 15 second library showcase, rendered from code">` +
      `<source src="media/showcase.mp4#t=2" type="video/mp4">` +
      (hasGif ? `<img src="media/showcase.gif" alt="The library showcase, rendered from code" loading="lazy">` : '') +
      `</video>`
    : hasGif ? `<img src="media/showcase.gif" alt="The library showcase, rendered from code">` : '';

  const stat = (n, label, note) =>
    n == null ? '' : `<div class="stat"><b>${esc(n)}</b><span>${esc(label)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;

  const stats = [
    stat(st.skills, 'Claude Code skills', st.thirdSkills ? `plus ${st.thirdSkills} vendored (brag)` : ''),
    stat(st.prompts, 'Ready prompts', st.promptDays ? `including ${st.promptDays} daily lessons` : ''),
    stat(st.components, 'Components', 'in studio/src/lib'),
    stat(st.shots, 'Shot cards', 'curated, with build notes'),
    stat(st.findings, 'Research findings', st.landed != null ? `${st.landed} landed in the studio` : ''),
    stat(st.gallery, 'Gallery items', 'videos made with Claude'),
  ].join('');

  const panels = [
    ['tour', 'tour/', 'Tour', 'Start here. Install, make a first video, learn the vocabulary, follow a 7-day plan.'],
    ['guide', 'guide/', 'Guide', 'The illustrated handbook: workflow, tools, prompting, motion vocabulary, design system.'],
    ['skills', 'skills/', 'Skills', 'The Claude Code skills that direct, build, review and search for inspiration.'],
    ['prompts', 'prompts/', 'Prompts', 'Every prompt in order, with a copy button. Pick the stage, paste, go.'],
    ['studio', 'studio/', 'Studio', 'The Remotion project: components, design tokens and the videos made with it.'],
    ['techniques', 'techniques/', 'Techniques', 'Lessons learned from finished videos: what worked, what to avoid.'],
    ['shots', 'shot-library/', 'Shot library', 'Curated motion shots to pick from while storyboarding, with build notes.'],
    ['research', 'research/', 'Research findings', 'What the research found and which findings landed in the studio.'],
    ['gallery', 'gallery/', 'Gallery', 'Videos made with Claude from around the web, each with how it was made.'],
  ];
  const cards = panels
    .map(([k, href, title, text]) => {
      const c = h.card({ title, text, href });
      return c.replace('<h3>', icon(k) + '<h3>');
    })
    .join('\n');

  const flow = [
    ['Direction', 'Three genuinely different looks. You pick one.', 'prompts/10'],
    ['Storyboard', 'A timed scene table: text, motion, easing, sound.', 'prompts/11'],
    ['One scene', 'Build only the first scene, render frames, look, fix.', 'prompts/12'],
    ['Review', 'A fresh strict reviewer scores it and lists the worst defects.', 'prompts/13'],
    ['The rest', 'Remaining scenes, then sound, formats and the final render.', 'prompts/14, 50 to 53'],
  ]
    .map(([t, p, tag]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p><span class="tag">${esc(tag)}</span></li>`)
    .join('');

  const quick = `git clone ${REPO}.git
cd video-studio
node tools/install-skills.mjs   # copies skills/ into ~/.claude/skills
cd studio
npm install
npx remotion skills add         # official Remotion agent skills
npm run stills -- LibraryShowcase 50,130,245,350,449`;

  const brief = `New video: 15 s Instagram reel (9:16, 30 fps) about <topic>.
Goal: <what it should achieve>. Mood: <calm / bold / ...>.
Look: <background>, <type colour>, one <accent> accent.
Exact text: "<line 1>" then "<line 2>".
Start with 3 creative directions. No code yet.`;

  const body = `
<div class="hero-band">
  <div class="wrap">
    <div class="hero">
      <p class="eyebrow">A personal studio for Claude Code</p>
      <h1>Motion graphics, made in code, directed by you.</h1>
      <p class="lead">Claude works as creative director, motion designer, animator and engineer. You steer it stage by stage, every frame is rendered from code, and quality is judged on the rendered frames, never on the code.</p>
      <div class="cta">
        <a class="btn primary lg" href="tour/">Take the tour</a>
        <a class="btn lg" href="guide/">Browse the guide</a>
        <a class="btn lg ghost" href="${REPO}" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
    ${media ? `<figure class="hero-media" style="margin-bottom:0">${media}</figure>
    <p class="hero-cap">The 15 s library showcase (1920 by 1080, 30 fps), built entirely from the components in <code>studio/src/lib</code>.</p>` : ''}
  </div>
</div>

<section class="section" id="what">
  <div class="section-head">
    <p class="eyebrow">What it is</p>
    <h2>A repo you open Claude Code in, and make videos.</h2>
  </div>
  <div class="grid cols-3">
    ${h.card({ title: 'A Remotion project', text: 'React components that draw every frame: titles, kinetic type, captions, charts, transitions, backgrounds, sound cues. Same input, same video, every time.' })}
    ${h.card({ title: 'Skills that act as a crew', text: 'A director that plans, a builder that renders, a strict reviewer that only trusts rendered frames, and a scout that finds inspiration with credit.' })}
    ${h.card({ title: 'A prompt library and a guide', text: 'Ordered prompts for each stage, a 7-day learning plan and an illustrated handbook, so you never start from a blank page.' })}
  </div>
  <p class="prose-wrap" style="color:var(--ink-2)">You do not ask for a whole video in one shot. You decide the direction, approve a storyboard, see one scene, and only then let the rest follow. That order is what keeps the results good.</p>
</section>

<section class="section" id="how">
  <div class="section-head">
    <p class="eyebrow">How it works</p>
    <h2>Five stages, one decision at a time.</h2>
    <p>Each stage ends with something you can look at before the next one starts. A sixth, optional step feeds the lessons back into the skills.</p>
  </div>
  <ol class="flow">${flow}</ol>
  <div class="callout"><div class="title">The rules that hold throughout</div>
  <p>Deterministic, frame-based animation only. One focal point per scene. Real numbers only. Sound at -14 LUFS and -1 dBTP. And never say a video was checked visually unless the frames were actually looked at.</p></div>
</section>

<section class="section" id="inside">
  <div class="section-head">
    <p class="eyebrow">What is inside</p>
    <h2>Everything has its own page.</h2>
  </div>
  <div class="grid">${cards}</div>
</section>

<section class="section" id="numbers">
  <div class="section-head">
    <p class="eyebrow">By the numbers</p>
    <h2>Counted from the repository when this site was built.</h2>
  </div>
  <div class="stats">${stats}</div>
</section>

<section class="section" id="quick-start">
  <div class="section-head">
    <p class="eyebrow">Quick start</p>
    <h2>From clone to first frames in minutes.</h2>
    <p>You need Node 20.19 or newer, ffmpeg on your PATH and <a href="https://claude.com/claude-code" rel="noopener noreferrer">Claude Code</a>. The <a href="tour/">tour</a> walks through every step and what to do if one fails.</p>
  </div>
  <div class="two">
    <div>
      <h3>1. Set up</h3>
      ${h.code(quick)}
    </div>
    <div>
      <h3>2. Ask for a first video</h3>
      <p>In a second terminal at the repo root, run <code>claude</code> and send a brief like this one.</p>
      ${h.code(brief)}
    </div>
  </div>
</section>

<section class="section" id="licences">
  <div class="callout">
    <div class="title">Licences and credits</div>
    <p>Remotion is free for individuals and small companies, vendored third-party skills keep their own licences, and prompts found on the web stay with their authors. The details, including the music credit you owe if you use it, are on the <a href="credits/">credits page</a>.</p>
  </div>
</section>`;

  const out = path.join(docs, 'index.html');
  fs.writeFileSync(
    out,
    page({
      title: 'Home',
      desc: 'A personal studio for making motion graphics and animated videos with Claude Code: a Remotion project, skills, a prompt library and an illustrated guide.',
      active: 'home',
      root: '',
      body,
    })
  );
  return [out];
}
