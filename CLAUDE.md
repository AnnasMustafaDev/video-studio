# Video Studio: the home for all personal animation and motion-graphics work

This repo is where every personal video, animation and motion-graphics job starts. It is personal.

## Layout

| Path | What it is |
|---|---|
| `guide/index.html` | The full illustrated guide: workflow, tools, setup, prompting, vocabulary, master prompt, staged prompts, references, design system, learning path, 7-day plan, resources |
| `prompts/` | Prompt library. `prompts/INDEX.md` says which prompt to use for which purpose and in what order |
| `skills/` | Canonical source of the personal skills. `node tools/install-skills.mjs` copies them into `~/.claude/skills/` |
| `third_party/` | Vendored third-party skills (`third_party/brag/`), pinned to an upstream commit. Never edit them; update only by re-fetching at a new SHA as described in their `UPSTREAM.md`. The same install script installs them |
| `studio/` | The Remotion project (React, frame-based). Official Remotion agent skills live in `studio/.claude/skills/`. Component library in `studio/src/lib/`, tokens in `studio/src/lib/tokens.ts`, rules in `studio/DESIGN_SYSTEM.md` |
| `studio/src/videos/<slug>/` | One folder per video (scenes + composition), registered in `studio/src/Root.tsx` |
| `projects/<yyyy-mm-dd>-<slug>/` | Per-video paper trail: `brief.md`, `directions.md`, `storyboard.md`, `review.md`, `notes.md`, renders in `out/` (gitignored) |
| `learning/` | 7-day plan, one folder per day with brief, prompt, storyboard, notes |
| `source/` | The notes this repo was built from |

Skills and prompts refer to this repo as `{{VIDEO_STUDIO}}`; `tools/install-skills.mjs` swaps it for the real absolute path when it installs a skill. Never commit a personal absolute path.

## Which engine

- **Remotion (`studio/`)**: default. Kinetic type, UI demos, diagrams, data viz, explainers, captions, templates.
- **motion-studio HTML engine** (`skills/motion-studio`): voice-over-driven product films where every cut lands on a spoken word, reviewed live in an HTML player.
- **brag / brag-slim** (third-party, `third_party/brag`): a quick 15 to 25 s launch video of a project you just built, in one command, run from that project's folder. For directed, storyboarded work (a brief, chosen direction, reviewed scenes, house style) use remotion-studio instead.
- **After Effects / Blender**: only when the shot needs compositing or real 3D; say so instead of faking it.

## How to work here

1. Open `prompts/INDEX.md`, pick the stage, follow `prompts/00-master-workflow.md`.
2. Never one-shot a whole video: direction, storyboard, one scene, review, then the rest.
3. Frame-based, deterministic animation only (`useCurrentFrame`, `interpolate`, `spring`, `useVideoConfig`). No CSS transitions, rAF, timers or `Math.random` (use Remotion's `random(seed)`).
4. Judge rendered frames, not code. `npm run stills -- <CompId> <frames>` in `studio/` and look at the images. If you could not look, say so.
5. After each video, append technique-only lessons to `skills/motion-studio/references/learnings.md` and re-run the install script.
6. Commit locally. Never push or create a GitHub repo unless asked.
