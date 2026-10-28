// Tour: the guided walkthrough for someone who has never seen the repo.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc, h, REPO } from './template.mjs';

const crumbs = `<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span class="sep">/</span><span aria-current="page">Tour</span></nav>`;

const exists = (repo, p) => fs.existsSync(path.join(repo, p));

function brief(title, text) {
  return `<div class="brief"><div class="brief-head">${esc(title)}</div><pre><code>${esc(text)}</code></pre></div>`;
}

function glossary(items) {
  return `<div class="gloss">${items
    .map(([t, d]) => `<div><strong class="term">${esc(t)}</strong><p>${esc(d)}</p></div>`)
    .join('')}</div>`;
}

export default async function build({ repo, docs }) {
  const repoMap = [
    ['studio/', 'The Remotion project. Components in src/lib, one folder per video in src/videos, design rules in DESIGN_SYSTEM.md.'],
    ['prompts/', 'The prompt library. INDEX.md says which prompt to use for which purpose, and in what order.'],
    ['skills/', 'The Claude Code skills, in source form. One script copies them where Claude can find them.'],
    ['third_party/', 'Skills made by other people, pinned to one upstream version and never edited here.'],
    ['guide/', 'The illustrated guide: one offline page with workflow, vocabulary and every prompt.'],
    ['shot-library/', 'Curated motion shots to choose from while storyboarding, with build notes.'],
    ['research/', 'What was learned from other people\'s Claude-made videos: findings and a gallery.'],
    ['learning/', 'The 7-day learning plan, a short exercise for each day.'],
    ['projects/', 'A paper trail per video: brief, directions, storyboard, review, notes. Renders stay on your machine.'],
    ['tools/', 'Small scripts for the repo itself. The main one installs the skills.'],
    ['source/', 'The notes this repo was built from.'],
    ['docs/', 'This website and the script that generates it.'],
  ]
    .filter(([p]) => p === 'docs/' || exists(repo, p))
    .map(([p, d]) => `<div><code>${esc(p)}</code><span>${esc(d)}</span></div>`)
    .join('');

  const body = `
${crumbs}
<div class="doc">
<aside class="doc-toc" data-auto aria-label="On this page"></aside>
<article class="prose wide">
<p class="eyebrow">Tour</p>
<h1>Your first video, step by step.</h1>
<p class="lead">This page is for someone who has never opened the repo. In about an hour you will have the tools installed, one video's first frames on screen, and a clear idea of where everything lives.</p>

<h2 id="need">What you need</h2>
<div class="grid cols-3">
  ${h.card({ badge: 'Required', title: 'Node.js', text: 'Version 20.19 or newer (24 is recommended). Check with node --version. Remotion and the helper scripts run on it.' })}
  ${h.card({ badge: 'Required', title: 'ffmpeg', text: 'On your PATH. It joins frames into contact sheets, generates sound effects and checks finished videos. Check with ffmpeg -version.' })}
  ${h.card({ badge: 'Required', title: 'Claude Code', text: 'The command line assistant that does the directing, building and reviewing. You talk to it in plain language.' })}
</div>
<p>You also need a few GB of free disk space (Remotion downloads a browser the first time) and an internet connection for the install. No video editing experience is needed, but a sense of what you want to see helps a lot.</p>

<h2 id="install">Clone and install</h2>
<ol class="steps">
  <li><strong>Get the repo.</strong>
    ${h.code(`git clone ${REPO}.git\ncd video-studio`)}
  </li>
  <li><strong>Install the skills.</strong> Skills are instruction packs Claude loads on demand. This copies them into <code>~/.claude/skills</code> and backs up any you already have.
    ${h.code('node tools/install-skills.mjs')}
  </li>
  <li><strong>Install the studio.</strong> This is the Remotion project where videos are built.
    ${h.code('cd studio\nnpm install')}
  </li>
  <li><strong>Add the official Remotion skills.</strong> They are not stored in this repo (their upstream has no licence), so you fetch them yourself. The versions are pinned in <code>skills-lock.json</code>.
    ${h.code('npx remotion skills add')}
  </li>
  <li><strong>Prove it works.</strong> This renders five frames of the showcase video and tiles them into one image. Open <code>studio/out/stills/LibraryShowcase/contact-sheet.png</code> to look at it.
    ${h.code('npm run stills -- LibraryShowcase 50,130,245,350,449')}
  </li>
  <li><strong>Optional: preview live.</strong> Opens Remotion Studio in your browser, with a timeline you can scrub. Stop it with Ctrl+C.
    ${h.code('npm run dev')}
  </li>
</ol>
${h.callout('If a step fails', '<p>Jump to <a href="#faq">troubleshooting</a>. Most problems are a missing ffmpeg, an old Node, or a path with spaces.</p>', 'warn')}

<h2 id="first-video">Your first video, in seven moves</h2>
<p>Open a second terminal at the repo root and run <code>claude</code>. Then work through these stages. The point is that you never ask for the whole video at once: each move ends with something you can look at and approve.</p>
<ol class="steps">
  <li><strong>Write a brief.</strong> Say what the video is for, how long, which format, the mood and the exact words on screen. Prompt <code>40-brief-template</code> gives you the fields. A weak brief gives you a generic video.</li>
  <li><strong>Get three directions.</strong> Ask for three genuinely different looks and no code yet. The <code>motion-director</code> skill does this, with prompt <code>10-creative-directions</code>. Pick one, or mix.</li>
  <li><strong>Approve a storyboard.</strong> Prompt <code>11-storyboard</code> returns a timed table of scenes with first and last frame, exact text, motion, easing, transition and sound cue. Read it like a script, and change anything you do not like now, while it is cheap.</li>
  <li><strong>Build one scene.</strong> Prompt <code>12-build-one-scene</code>, handled by the <code>remotion-studio</code> skill. Claude writes only scene 1, renders stills and a contact sheet, looks at them and fixes what is wrong. This first scene sets the standard for every other one.</li>
  <li><strong>Review it strictly.</strong> Prompt <code>13-quality-review</code>, ideally by a fresh agent that did not build it (<code>motion-review</code>). It scores the frames and lists the five worst defects with fixes. Fix them, re-render.</li>
  <li><strong>Build the rest.</strong> Prompt <code>14-build-next-scene</code>, one scene at a time, reviewing as you go. Then sound (<code>50</code>), other formats such as 9:16 (<code>52</code>) and the final render with checks (<code>53</code>).</li>
  <li><strong>Feed lessons back.</strong> Prompt <code>70-post-mortem</code> writes what you learned into the skills, so the next video starts smarter.</li>
</ol>
<p>The full ordered list, with a diagram, is in <a href="../prompts/">Prompts</a>. The <a href="../skills/">Skills</a> page says what each skill is for.</p>

<h2 id="map">Repo map</h2>
<p>Everything sits at the top level, so you can find it without a search.</p>
<div class="map">${repoMap}</div>

<h2 id="engines">The engines: which one when</h2>
<p>A video can be made in more than one way. This table is the quick answer, and the default is Remotion.</p>
<table class="engines">
<thead><tr><th>Engine</th><th>Use it for</th><th>Not for</th></tr></thead>
<tbody>
<tr><td>Remotion (<code>studio/</code>)</td><td>The default. Kinetic type, titles, UI demos, diagrams, data visualisation, explainers, captions, reels, reusable templates.</td><td>Real 3D or heavy compositing.</td></tr>
<tr><td>HTML engine (<code>motion-studio</code>)</td><td>Narrated product films where every cut, caption and camera move lands on a spoken word, reviewed live in an HTML player.</td><td>Silent pieces; use Remotion.</td></tr>
<tr><td>brag (<code>third_party/brag</code>)</td><td>A quick 15 to 25 second launch video of a project you just built, in one command, run from that project's folder.</td><td>Directed, storyboarded work with a house style.</td></tr>
<tr><td>After Effects or Blender</td><td>Shots that need real compositing or real 3D.</td><td>Anything code can do; say so instead of faking it.</td></tr>
</tbody></table>

<h2 id="ask">How to ask Claude</h2>
<p>Good requests name the stage, the format, the look and the exact text, and they say what not to do yet. Copy one of these and replace the placeholders.</p>
${brief('A launch teaser, directions first', `New video: 20 s launch teaser (16:9, 30 fps) for my side project <name>.
Goal: people understand what it does in the first 5 s.
Mood: calm and confident. Look: off-white background, near-black type, one blue accent.
Exact text: "<headline>" then "<one-line promise>".
Give me three creative directions and recommend one. No code yet.`)}
${brief('Storyboard after you chose a direction', `Direction B. Storyboard it.
Give me a timed scene table: first and last frame, focal point, exact text,
animation, easing, transition and sound cue per scene, plus a hits table for sound.
Keep every scene to one focal point. Stop after the table so I can edit it.`)}
${brief('Build only the first scene', `Build scene 1 only, in studio/src/videos/<slug>/.
Use components from studio/src/lib and the design tokens, nothing hand-rolled.
Render stills at the key frames and a contact sheet, open them, and fix what looks wrong.
Tell me plainly if you could not look at the images.`)}
${brief('A strict review', `Strict review of the rendered frames, from a fresh pair of eyes.
Score typography, hierarchy, spacing, timing, easing, transitions, consistency and pacing
with frame evidence. Give me the five worst defects with concrete fixes and a
READY or ANOTHER ROUND verdict.`)}
${brief('Copy a feel, not a design', `Analyse this reel: <path or link>. Break down composition, type, motion, timing and sound,
and separate what you can see from what you are guessing.
Then plan a video for <my app> with the same feel. Keep the principles, not the branding.`)}

<h2 id="glossary">Glossary</h2>
<p>The words you will meet in the prompts and in Claude's answers.</p>
${glossary([
  ['Deterministic frame', 'A frame that depends only on its frame number. Same number, same picture, every render. It is why no timers, CSS transitions or random numbers are allowed.'],
  ['Spring', 'A motion curve that behaves like a weight on a spring: it accelerates, overshoots a little and settles. Feels physical. Overshoot is kept small here.'],
  ['Easing', 'How speed changes between two states. Ease-out starts fast and lands softly. The curve is a large part of how motion feels.'],
  ['Interpolate', 'Mapping a frame number to a value, such as frames 0 to 20 to opacity 0 to 1. The basic building block of a Remotion animation.'],
  ['Composition', 'One renderable video: an id, a size, a frame rate and a length. A project can hold many.'],
  ['Scene', 'A segment of a video with one job and one focal point. Scenes are joined by transitions.'],
  ['Focal point', 'The one thing the eye should land on in a scene. If there are two, one is wrong.'],
  ['Storyboard', 'The timed plan of scenes. Here it is a table, not drawings.'],
  ['Golden scene', 'The first scene you build and approve. Every later scene is held to its standard of spacing, motion and polish.'],
  ['Banned list', 'A per-film list of things you refuse to see, such as glow, particles or bouncy overshoot. It removes the model\'s defaults.'],
  ['Hits table', 'A list of moments in the video that need a sound, with their frames. Sound is placed from it, not by feel.'],
  ['Contact sheet', 'Many rendered frames tiled into one image so you can judge a whole video at a glance.'],
  ['Still', 'A single rendered frame saved as an image. Quality is judged on stills, not on code.'],
  ['Safe area', 'The margin inside the frame where text must stay so it is not cropped on a phone or covered by an interface.'],
  ['LUFS and dBTP', 'Loudness and peak level. The target here is -14 LUFS with peaks under -1 dBTP, a normal level for online video.'],
  ['Skill', 'A folder of instructions Claude loads when your request matches it. This repo ships several.'],
])}

<h2 id="faq">Troubleshooting and FAQ</h2>
<details><summary>My path has spaces, such as D:\\My Projects\\...</summary><p>Wrap the path in double quotes in every command, for example <code>cd "D:\\My Projects\\video-studio"</code>. If a script still breaks, clone into a folder without spaces, such as <code>C:\\dev\\video-studio</code>. When you ask Claude to read a file, paste the path in quotes too.</p></details>
<details><summary>ffmpeg is not found</summary><p>Install it, then open a new terminal so the PATH refreshes. On Windows use <code>winget install ffmpeg</code> or download a build and add its <code>bin</code> folder to PATH. On macOS use <code>brew install ffmpeg</code>. Verify with <code>ffmpeg -version</code>. Contact sheets and sound effects need it.</p></details>
<details><summary>Node says the engine is not supported</summary><p>The studio needs Node 20.19, 22.13 or 24 and newer. Check with <code>node --version</code> and upgrade through your installer or a version manager.</p></details>
<details><summary>A preview or player freezes because the audio stalls</summary><p>Some previews follow the audio clock, so if the audio file fails to load or the browser blocks autoplay, the picture stops with it. Click once in the page to allow sound, check that the audio file exists at the path the page expects, and reload. For Remotion previews, make sure no sound file is missing in <code>studio/public</code>. Final renders are not affected, because they are built frame by frame.</p></details>
<details><summary>Fonts look different in my render</summary><p>The studio loads its fonts from Google Fonts through Remotion, and rendering waits until they are ready. If you are offline the first render can fall back to a system font. Connect once, render again, and the font is cached. Use only the fonts defined in <code>studio/src/lib/fonts.ts</code>.</p></details>
<details><summary>The preview will not start or the port is taken</summary><p>Remotion Studio uses a local port, 3000 by default. If it is busy, stop the other process or start on another port: <code>npx remotion studio --port 3100</code>. The preview is long-running on purpose, so stop it with Ctrl+C when done.</p></details>
<details><summary>Claude says it cannot find a skill</summary><p>Run <code>node tools/install-skills.mjs</code> again and restart Claude Code, because skills are read at startup. Prompt <code>01-skills-check</code> lists what Claude sees.</p></details>
<details><summary>The animation flickers or differs between renders</summary><p>Something is not frame-based. Run prompt <code>02-deterministic-rule</code>, which audits the code for CSS transitions, timers and random numbers, and replaces them with <code>useCurrentFrame</code>, <code>interpolate</code> and <code>spring</code>.</p></details>
<details><summary>Claude says the video looks good but I disagree</summary><p>Ask it whether it opened the rendered images. Judgements from code alone do not count. Ask for stills at the key frames, and for a strict review by a fresh agent.</p></details>
<details><summary>Can I push this to my own GitHub?</summary><p>Yes, it is your clone. The repo ships no licence file, so check the <a href="../credits/">credits page</a> before you republish anything, and note that the vendored third-party folders carry their own licences.</p></details>

<h2 id="plan">A 7-day learning plan</h2>
<p>One small piece per day, each with a ready prompt in <code>prompts/learning/</code>. By day seven you have made a title, a type sequence, a UI demo, a chart, a teaser and a sound-designed cut, and copied a style you admire.</p>
<div class="days">
${[
  ['Title', 'A 5-second animated title. Learn what a frame, a spring and an easing curve do.'],
  ['Kinetic type', 'A short typography sequence. Learn staggering, timing and one focal point.'],
  ['Product UI', 'An animated interface demo. Learn cursors, highlights and camera moves.'],
  ['Data', 'A data visualisation with real numbers only. Learn counters and chart motion.'],
  ['Teaser', 'A 15-second product teaser. Learn the whole workflow on one piece.'],
  ['Sound', 'Add sound to that teaser from a hits table. Learn mixing and loudness.'],
  ['Reference', 'Recreate the style of a reference. Learn to take principles without copying.'],
]
  .map(
    ([t, d], i) =>
      `<div class="day"><div class="n"><small>Day</small><b>${i + 1}</b></div><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`
  )
  .join('')}
</div>

<h2 id="next">Where to go next</h2>
<div class="grid">
  ${h.card({ title: 'Read the guide', text: 'The illustrated handbook with workflow, vocabulary and every prompt.', href: '../guide/' })}
  ${h.card({ title: 'Browse the prompts', text: 'Pick the prompt for your stage and copy it.', href: '../prompts/' })}
  ${h.card({ title: 'Meet the skills', text: 'What each skill does and when Claude uses it.', href: '../skills/' })}
  ${h.card({ title: 'See the studio', text: 'The components, tokens and videos in the Remotion project.', href: '../studio/' })}
  ${h.card({ title: 'Pick a shot', text: 'Curated motion shots to use while storyboarding.', href: '../shot-library/' })}
  ${h.card({ title: 'Look for ideas', text: 'Videos made with Claude, with how they were made.', href: '../gallery/' })}
</div>

<div class="pager">
  <a class="prev" href="../"><small>Back</small><strong>Home</strong></a>
  <a class="next" href="../guide/"><small>Next</small><strong>Guide</strong></a>
</div>
</article>
</div>`;

  const dir = path.join(docs, 'tour');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(
    out,
    page({
      title: 'Tour',
      desc: 'A guided walkthrough for first-time users: what you need, install steps, your first video, the repo map, the engines, example briefs, glossary, troubleshooting and a 7-day plan.',
      active: 'tour',
      root: '../',
      body,
    })
  );
  return [out];
}
