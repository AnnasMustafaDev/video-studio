// Credits and licences page. Statements adapt to what exists in the repo at build time.
import fs from 'node:fs';
import path from 'node:path';
import { page, esc, h, REPO } from './template.mjs';

const exists = (repo, p) => fs.existsSync(path.join(repo, p));

export default async function build({ repo, docs }) {
  const hasLicense = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md'].find((f) => exists(repo, f));
  const hasBrag = exists(repo, 'third_party/brag');
  const hasShotcraft = exists(repo, 'third_party/video-shotcraft');

  const ext = (u, t) => `<a href="${esc(u)}" rel="noopener noreferrer">${esc(t || u)}</a>`;

  const repoLicence = hasLicense
    ? `<p>The repository carries a licence file at its root (<a href="${REPO}/blob/main/${esc(hasLicense)}" rel="noopener noreferrer"><code>${esc(hasLicense)}</code></a>). Read it for what you may do with the original work in this repo. The folders below keep their own licences and are not covered by it.</p>`
    : `<p>The repository itself has <strong>no licence file yet</strong>. That means default copyright applies: the original work here is not offered for reuse, copying or redistribution. You may read it, and clone it for your own private use. If you want to reuse something, ask first. The third-party material listed below keeps its own licence and is not affected by this.</p>`;

  const toc = `<aside class="doc-toc" data-auto aria-label="On this page"></aside>`;

  const body = `
<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a><span class="sep">/</span><span aria-current="page">Credits</span></nav>
<div class="doc">
${toc}
<article class="prose wide">
<p class="eyebrow">Credits and licences</p>
<h1>Who made what, and what you may do with it.</h1>
<p class="lead">This studio stands on other people's work. This page says whose, under which licence, and what you must do if you use it in a published video.</p>
${h.callout('Short version', '<p>Check the Remotion licence for your company size. Credit the bundled music if you use it. Prompts found on the web belong to their authors. Everything vendored keeps its original licence.</p>')}

<h2 id="repo">This repository</h2>
${repoLicence}
<p>This website is generated from the repository by a script in <code>docs/_build</code>. It quotes and links to the sources below rather than copying them.</p>

<h2 id="remotion">Remotion</h2>
<p>Videos here are rendered with ${ext('https://www.remotion.dev', 'Remotion')}. Remotion is free for individuals and for companies with up to 3 employees. Larger companies need a company licence. Check the current terms at ${ext('https://remotion.dev/license', 'remotion.dev/license')} before you use it commercially, because they can change.</p>
<h3 id="remotion-skills">Official Remotion agent skills</h3>
<p>The official Remotion agent skills are <strong>not redistributed</strong> in this repo, because their upstream repository declares no licence. Install them yourself from the <code>studio/</code> folder:</p>
${h.code('npx remotion skills add')}
<p>The versions are pinned in <code>studio/skills-lock.json</code>.</p>

${
  hasBrag
    ? `<h2 id="brag">brag (third party, MIT)</h2>
<p><code>third_party/brag/</code> is a byte-for-byte copy of ${ext('https://github.com/latent-spaces/brag', 'latent-spaces/brag')} by Shunit Haviv Hakimi, pinned to one upstream commit, under the <strong>MIT licence</strong>. The licence text sits next to the files. It is not edited here.</p>
<div class="callout warn"><div class="title">Credit the music</div>
<p>The music bundled with brag, "Happy Beats / Business Moves", is by <strong>Sascha Ende</strong> (${ext('https://ende.app', 'ende.app')}) and is licensed <strong>CC BY 4.0</strong>, not MIT. If a published video uses it, you must credit it. A line you can paste:</p>
${h.code('Music: Sascha Ende, ende.app (CC BY 4.0)')}
<p>The sound effects bundled with brag come from Kenney.nl and unicae_games and are CC0, so no credit is required.</p></div>`
    : ''
}

${
  hasShotcraft
    ? `<h2 id="shotcraft">video-shotcraft (third party, Apache-2.0)</h2>
<p><code>third_party/video-shotcraft/</code> is an unmodified subset of ${ext('https://github.com/Vincentwei1021/video-shotcraft', 'video-shotcraft')} by Vincent Wei, pinned to one commit, under the <strong>Apache License 2.0</strong>. The licence and a NOTICE file are kept with it. The cards and demo source are Vincent Wei's work.</p>
<p>The <a href="../shot-library/">shot library</a> on this site is a separate work, written in our own words, that points back to each upstream card and credits it.</p>`
    : ''
}

<h2 id="prompt-motion">Prompts from other authors</h2>
<p>The <code>prompt-motion-search</code> skill looks up animations on ${ext('https://prompt-motion.com', 'prompt-motion.com')}. The prompts and videos it finds <strong>belong to their authors</strong>. The skill always shows the author and the link, and saves a chosen prompt only with credit, on demand. If you reuse a prompt, keep the credit.</p>

<h2 id="gallery">The research gallery</h2>
<p>The <a href="../gallery/">gallery</a> and the <a href="../research/">research findings</a> collect videos made with Claude by other people, from GitHub, Reddit, X, YouTube, TikTok, Instagram and the web. The policy is simple:</p>
<ul>
<li>Entries are <strong>paraphrased</strong> in our own words, never copied wholesale.</li>
<li>Every entry <strong>links to its source</strong> and names its creator.</li>
<li>Nobody watched the videos while researching. Descriptions come from captions, READMEs, post text and articles, and entries are marked verified or unconfirmed.</li>
<li>The videos themselves are not hosted here. They stay with their creators.</li>
</ul>
<p>If you made something listed there and want it changed or removed, open an issue on ${ext(REPO + '/issues', 'the repository')}.</p>

<h2 id="fonts">Fonts</h2>
<p>Videos use <strong>Inter Tight</strong> for text and <strong>JetBrains Mono</strong> for labels and code, loaded through Remotion's Google Fonts package. Both are under the <strong>SIL Open Font Licence 1.1</strong>, which allows use in published work. This website uses the Inter and JetBrains Mono families if you have them installed, and falls back to system fonts otherwise.</p>

<h2 id="sound">Sound effects in the studio</h2>
<p>The sound cues in <code>studio/public/sfx/</code> are generated with ffmpeg by a script in the repo, so they have no licence questions.</p>

<h2 id="more">More</h2>
<div class="grid">
  ${h.card({ title: 'Source on GitHub', text: 'Every licence file lives next to the code it covers.', href: REPO })}
  ${h.card({ title: 'Tour', text: 'Back to the walkthrough for new users.', href: '../tour/' })}
</div>
<div class="pager">
  <a class="prev" href="../research/"><small>Previous</small><strong>Research findings</strong></a>
  <a class="next" href="../"><small>Back to</small><strong>Home</strong></a>
</div>
</article>
</div>`;

  const dir = path.join(docs, 'credits');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(
    out,
    page({
      title: 'Credits and licences',
      desc: 'Licences and credits for the Video Studio: Remotion, vendored third-party skills, bundled music, prompt authors, the research gallery policy and fonts.',
      active: 'credits',
      root: '../',
      body,
    })
  );
  return [out];
}
