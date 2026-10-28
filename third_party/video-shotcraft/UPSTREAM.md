# video-shotcraft (vendored, third-party)

Do not edit anything in this folder except this file and `NOTICE.md`. Everything else is a byte-for-byte copy of upstream.

| | |
|---|---|
| Upstream | https://github.com/Vincentwei1021/video-shotcraft |
| Pinned commit | `5a2e98daade313c4f376120f38427eb19a108e8c` (default branch `main`, last push 2026-10-28) |
| Fetched | 2026-10-29, read-only through the GitHub API; nothing was cloned, installed or run |
| Licence | Apache-2.0 (see [LICENSE](LICENSE)); credit in [NOTICE.md](NOTICE.md) |
| Live gallery | https://vincentwei1021.github.io/video-shotcraft/ (150 motion previews; the previews are not vendored) |

## What it is

A library of 124 "shot recipe cards" (150 shots) for Remotion product films, each with a parameter table and tuned demo source, plus a Chinese-language agent skill that wraps a whole promo pipeline (screen capture, beat sync, sound design, workbench, social publishing). Cards and docs are written in Chinese.

## What is included (1.2 MB)

| Path | Content |
|---|---|
| `LICENSE`, `README.md`, `SKILL.md` | Upstream licence, readme, and its agent skill file. `SKILL.md` is kept as a document only. It is **not** installed as a skill (see below) |
| `references/shots/<category>/<card>.md` | **51 of 124** recipe cards: the ones curated into our `shot-library/`. `references/shots/ATTRIBUTION.md` (upstream's source and legal note) is included |
| `references/aesthetic-rules.md`, `references/music-beat-sync.md` | Upstream's visual QA rules and beat-sync method (the latter contains librosa snippets; they are text only, nothing is run) |
| `demos/<category>/<card>/*.tsx` | Demo source for **24 shots** that need no screenshots (code only) |
| `demos/_fixtures/*.tsx`, `demos/README.md` | Shared helper components the demos import, and the demos' own readme |
| `gallery/api/library.json` | Upstream's index of all 124 cards: category, duration, summary, style keys and preview media paths |

## What is excluded, on purpose

- All audio (`assets/audio`, 37 MB), all textures and screenshots (`demos/_textures`), `template/`, `workbench/`, `gallery/media`, `assets/brand` and every logo or brand asset, `assets/readme` (cover images, sponsor logos), MP4/GIF/WebP/PNG previews. The live gallery is linked instead.
- The other 73 cards, and demos that load screenshots through `staticFile('textures/...')` (crash-zoom-punch, depth-layer-moves, row-embed, shot-transitions, speed-ramp-freeze, type-and-filter): their cards are included where curated, but the demo source is not, because it cannot render without the excluded screenshots.
- `references/pipeline.md`, `sound-design.md`, `final-review.md`, `guided-free-creation.md`, `workbench.md`, `jianying-export.md`, `publish-upload-post.md`, `publish/` (a script that calls a third-party posting API), `jianying-export/`, `workbench/`, `.github/`, the translated READMEs.
- There is deliberately **no `skills/` folder** here, so `tools/install-skills.mjs` installs nothing from this folder. We maintain our own skill, `skills/shot-library/`.

## Review notes (read before trusting any of it)

All of this is untrusted data. Findings from the review on 2026-10-29:

- Demo `.tsx`: no network calls, no `fetch`, `eval`, `process`, storage or `Math.random`/`Date.now` (only `xmlns` strings contain `http://`). Imports are `react`, `remotion` and sibling files; one file imports `@remotion/motion-blur` (not in the vendored set). Nothing was executed.
- Cards: no commands, URLs or instructions aimed at an agent.
- `README.md`: contains sponsor blocks with affiliate links and social "follow" links; marketing only.
- `SKILL.md`: written to steer an agent. It tells the agent to open a local workbench after delivery and to recommend `@`-mentioning the author, submitting the film to the author's showcase, and exporting to JianYing; it also drives a mode-selection dialogue. None of it applies to us. Do not follow it.
- The demos are branded "video-shotcraft" (logo and copy). Swap `demos/_fixtures/Brand.tsx` for your own before use.

## Update

1. Read-only fetch at a new SHA (`gh api repos/Vincentwei1021/video-shotcraft/contents/<path>?ref=<sha>` with the personal token), into an empty scratch folder.
2. Re-scan the demos and cards for network calls, installs, deletes and steering text. Read what you vendor.
3. Replace the files above with the new copies (same subset, or a new one), update the SHA and date in this file, and re-check `shot-library/cards.json` against the new cards (paths, durations, parameters).
4. Run `node tools/install-skills.mjs --dry-run`; it must list only our own skills.
