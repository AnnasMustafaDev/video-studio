# docs: the Video Studio website

A static site, published on GitHub Pages from this folder at https://annasmustafadev.github.io/video-studio/. It is generated from the repository by Node scripts (no dependencies), and the generated HTML is committed.

## Build

```bash
node docs/_build/build.mjs                 # everything
node docs/_build/build.mjs --only home     # one generator (comma-separate for several)
```

Needs Node 20.19 or newer. Preview it with any static server, for example `python -m http.server --bind 127.0.0.1 --directory docs`.

The build runs each generator that exists, then checks the output and exits with code 1 if anything fails:

- no forbidden words in the visible text of any page,
- no local machine paths (such as a home directory) anywhere,
- every internal `href`, `src` and `poster` resolves to a file under `docs/`.

## Layout

| Path | What it is |
|---|---|
| `_build/template.mjs` | `page()`, `esc()`, `safeUrl()`, the nav list and small HTML helpers. Every page goes through `page()` |
| `_build/md.mjs` | A small, safe Markdown renderer (raw HTML is escaped) |
| `_build/build.mjs` | Runs the generators and the checks |
| `_build/<name>.mjs` | One generator per section: `home`, `tour`, `credits`, `embed`, `skills`, `prompts`, `studio`, `techniques` |
| `assets/site.css`, `assets/site.js` | Shared styles and behaviour (theme toggle, mobile menu, copy buttons, filter, in-page contents) |
| `assets/panel-*.css` | Extra styles for the skills, prompts, studio and techniques panels |
| `media/` | The showcase video and GIF, and a screenshot of the guide |

Each generator is `export default async function build({ repo, docs })`, writes pages under `docs/<section>/index.html`, and returns the list of files it wrote. A missing source file is skipped with a warning, never a crash.

## The embedded viewers

`embed.mjs` copies four standalone pages of the repo into the site without editing the originals: `guide/` to `docs/guide/`, `research/gallery/` to `docs/gallery/`, `research/findings/` to `docs/research/` and `shot-library/` to `docs/shot-library/`. Each copy gets a slim top bar with the site navigation, starts on its light theme, and keeps its own theme button. Re-run the build after those pages are regenerated.

## Look and feel

Light by default: white, airy, one soft blue accent. Dark mode exists only through the Theme button (stored in the browser), never from the system setting. Helper classes for new pages: `.doc` with `.doc-toc` and `.prose` (sticky in-page contents, built from the headings when `data-auto` is set), `.card`, `.grid`, `.stats`, `.callout`, `.badge`, `.steps`, `.flow`, `.pager` and `.crumbs`.

## Publishing

Settings, Pages, deploy from the `main` branch, folder `/docs`. `docs/.nojekyll` is created by the build so the files are served as they are.
