# studio

The Remotion project for personal motion graphics: a small, consistent component library (`src/lib/`) plus one folder per video (`src/videos/<slug>/`), rendered frame by frame from React.

- Remotion **4.0.537** (all `@remotion/*` packages pinned to the same exact version), React 19, Node 20.19+ / 22.13+ / 24.
- Rules and approved components: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). Tokens: [`src/lib/tokens.ts`](src/lib/tokens.ts).
- Reference compositions: `LibraryShowcase` (15 s, 1920x1080, 30 fps) and `Showcase-Vertical` (8.5 s, 1080x1920).

## Quick start

Prerequisites: Node 24 (or 20.19+ / 22.13+), ffmpeg on PATH (for `stills` contact sheets and `sfx`).

```bash
cd studio
npm install
npm run typecheck                                   # tsc --noEmit
npm run stills -- LibraryShowcase 50,130,245,350,449  # PNGs + contact sheet in out/stills/LibraryShowcase/
npm run render -- LibraryShowcase out/LibraryShowcase.mp4
npm run dev                                         # Remotion Studio preview (long-running; stop with Ctrl+C)
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Remotion Studio, the interactive preview |
| `npm run render -- <CompId> [out.mp4]` | `remotion render`; e.g. `npm run render -- Showcase-Vertical out/vertical.mp4` |
| `npm run stills -- <CompId> <f1,f2,...>` | Bundles once, renders each frame with `remotion still` to `out/stills/<CompId>/f<frame>.png`, then tiles them into `contact-sheet.png` with ffmpeg |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Remotion rules, e.g. flags non frame-based animation) + typecheck |
| `npm run sfx` | Regenerates the built-in sound cues in `public/sfx/` with ffmpeg |
| `npm run build` | `remotion bundle` |
| `npm run upgrade` | `remotion upgrade` (keeps all Remotion packages on one version) |

`out/` is gitignored.

## Start a new video

1. Copy `src/videos/_template/` to `src/videos/<slug>/`; rename `Template` to your video's name.
2. One component per scene (copy `Scene.tsx`), one focal point per scene, built from `src/lib` components and tokens only.
3. Chain scenes in a `<TransitionSeries>`, with `presets.wipe() / fade() / circle()` and `transitionTiming()` between them. Duration = sum of scenes - 15 frames per transition. Keep scene lengths in a `timeline.ts` like the showcase does.
4. Register the composition in `src/Root.tsx` inside a `<Folder>`, with inline `id`, `fps={30}`, `width`, `height`, `durationInFrames`.
5. Judge rendered frames, not code: `npm run stills -- <CompId> <scene boundaries, text-heavy frames, mid-transition frames, last frame>`, open the PNGs, fix, repeat. Then render the MP4 and check it with `ffprobe`.

The paper trail for each video (brief, storyboard, review) lives in `../projects/<yyyy-mm-dd>-<slug>/`, see the repo `CLAUDE.md`.

## Official Remotion agent skills

Not committed to git (the upstream `remotion-dev/skills` repo declares no licence, so this repo does not redistribute them). Install them after cloning, from `studio/`:

```bash
npx remotion skills add
```

The versions are pinned in `skills-lock.json`. They land in `.agents/skills/` (Cursor, Codex and other agents) and `.claude/skills/` (Claude Code); on Windows the installer creates absolute-path junctions for the second, which is fine locally.

Skills: `remotion-best-practices` (router, start here), `remotion-create`, `remotion-markup`, `remotion-interactivity`, `remotion-captions`, `remotion-render`, `remotion-studio`, `remotion-docs`, `remotion-multimedia`, `remotion-maps`, `remotion-saas`, `remotion-upgrade`.

Update them with `npx remotion skills update`.

## Techniques (new helpers)

`TechniquesDemo` (`src/videos/techniques-demo/`, 11.4 s; `REGISTER.md` there lists the lines to add to `Root.tsx`) uses each once. All frame-based, exported from `src/lib`:

| Helper | Use it when | Why (evidence) |
|---|---|---|
| `buoyant(bob?)` easing | A rising element should keep drifting through its peak | One production write-up; a velocity plot found a 16 % stall |
| `exitRamp`, `entryDecay`, `velocityCut` | Momentum across a cut | Author-measured numbers, claimed |
| `occluderCut` | Hide a cut behind a soft band | Tuned on placeholder material |
| `frameRamp`, `frameType`, `useFrameType` | Hero type in vw, text floor enforced | Published launch-video spec |
| `FragmentChain`, `lintCopy` | Copy as 1 to 4 word fragments with a word budget | Eight-film study, author's claim |
| `speedCurve`, `logZoom`, `Camera` | Glide shots from a speed table | One precisely described prompt |
| `GhostType` | Typed text without reflow | Well-known layout trick |
| `paginateCaptions(..., {maxPageMs, breakOnSentence})` | Captions on cut audio | One reported failure |
| `sampleCurve`, `longestStall`, exporter script | Plot a move instead of guessing | The write-up above |

Scripts (not yet in `package.json`, which this change did not touch): `node scripts/export-curve.mjs <buoyant|cubicOut|exitRamp|entryDecay|speedCurve> [--frames N] [--count N] [--out file]` writes `out/curves/<name>.json` as `{name, fps, unit, startFrame, values[]}` and prints the longest mid-move stall (more than 2 frames reads as a stall); `node scripts/copy-lint.mjs "a|b|c" --seconds 11` checks the copy budget. Both need Node 22.13+ (they load the `.ts` files directly).

Frame-arithmetic traps (F-A14) are listed in the header of `src/lib/curves.ts`.

### Motion blur per shot (F-B12)

Fast moves (wipes, drags, the velocity cut) show ghost steps at few subframes; the source reports 8 subframes (16 for fly-overs, shutter under 360 degrees) and slowing the move as the alternative. Here, `velocityCut` fakes a directional blur with an SVG blur sized from the per-frame step. For real subframe blur the official `@remotion/motion-blur` (`<CameraMotionBlur samples shutterAngle>`) exists at 4.0.537, MIT, about 24 KB. It is NOT installed. Vet before adding: install at the exact pinned version, wrap only the fast shot (it renders children several times, so render time grows only there), then zoom into a fast frame pair to look for steps. Evidence: stated in three prompts, not measured on this studio's output.

## Rendering notes

- Everything is deterministic: `useCurrentFrame()` / `interpolate()` / `spring()` only, `random(seed)` for noise. No CSS transitions, `requestAnimationFrame`, timers or `Math.random()`.
- Fonts (Inter Tight, JetBrains Mono) load through `@remotion/google-fonts`; the first render needs network access to fetch them.
- Sound cues in `public/sfx/` are synthesised by `scripts/make-sfx.mjs`, so they carry no licence restrictions.

## Licence

Remotion is not MIT. It is free for individuals and for companies with up to 3 employees; larger companies need a paid company licence. Check the current terms at https://www.remotion.dev/license before using this studio for commercial or company work.
