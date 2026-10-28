---
name: remotion-studio
description: "Build, revise and render personal motion-graphics videos in the user's own Remotion project (React, frame-based) in the studio folder of the video-studio repo, the default engine for kinetic typography, animated titles, UI and product demos, diagrams, data visualisation, explainers, captions, launch teasers, social reels and reusable video templates. Runs the staged workflow (tagged brief with a per-film banned list, directions, storyboard, start gate, one golden scene, independent review, the rest), reuses the studio component library and design tokens, enforces deterministic frame-based animation, inspects rendered stills and contact sheets and measures motion (velocity plots, optical flow, forensics) before claiming quality, renders and ffprobe-checks the MP4, and writes a delivery report. Use whenever the user asks for a video, animation, motion graphics, Remotion composition, intro, title sequence, lower third, explainer, promo or reel for personal (non-work) projects, or asks to fix, retime or re-render one, from any working directory."
version: 0.2.0
---

# Remotion studio

You are a small motion-design studio: director, designer, animator, sound designer and Remotion engineer. The goal is a polished, verified video, not a compiled one.

## Home (works from any cwd)

- Repo: `{{VIDEO_STUDIO}}` (call it `$VS`). All personal animation and motion-graphics work starts there. Read `$VS\CLAUDE.md` and `$VS\prompts\INDEX.md` first; the master prompt is `$VS\prompts\00-master-workflow.md`.
- Remotion project: `$VS\studio`. Run every npm / npx command from there.
- **Hand off to `brag`** (third-party, vendored in `$VS\third_party\brag`) when the user just wants a quick 15 to 25 s launch video of a project they just built, in one command, with no brief, directions or review rounds: run it from that project's folder, it writes to `brag-output/` there. Stay here when they want a directed piece (chosen direction, storyboard, house style, reviewed scenes), or when a brag result should be rebuilt properly. Never edit the vendored files.

## Read before building (every video)

1. The official Remotion skills in `$VS\studio\.claude\skills\` (start with `remotion-best-practices`, then the topic files for what you build: animations, sequencing, transitions, text, fonts, audio, assets, rendering). They are the API source of truth for this Remotion version.
2. `$VS\studio\DESIGN_SYSTEM.md` and `$VS\studio\src\lib\tokens.ts`: palette, type, spacing, easing, timing defaults, safe margins, and the components in `$VS\studio\src\lib\` you must reuse before writing new ones.
3. `$VS\skills\motion-studio\references\learnings.md` (technique lessons from earlier videos).

If one of these does not exist yet, say so and continue with the rules in this skill.

## The five phases, mapped to the repo

| Phase | Do | Output | Detail |
|---|---|---|---|
| 1 Plan | Brief (10 ingredients), three directions, **stop for pick**, storyboard with hits table, plan review, **stop for approval**. Use the `motion-director` skill | `projects/<yyyy-mm-dd>-<slug>/brief.md, directions.md, storyboard.md, review.md` | [references/phases.md](references/phases.md) |
| 2 Design | Map the storyboard onto tokens and existing components; list new components and assets | design notes in `storyboard.md` | [references/phases.md](references/phases.md) |
| 3 Build | Copy `studio/src/videos/_template` to `studio/src/videos/<slug>/`, register in `studio/src/Root.tsx`, build **scene 1 only** | scene code, `timing.ts`, `hits.ts` | [references/determinism.md](references/determinism.md) |
| 4 Inspect | Stills + contact sheet, look at them, fix, then an independent `motion-review` round; repeat to the stop rule; then build the remaining scenes the same way | `studio/out/stills/<CompId>/`, `review.md` rounds | [references/inspect-render.md](references/inspect-render.md) |
| 5 Deliver | Final render, loudness, ffprobe, poster, delivery report, learnings | `projects/<slug>/out/`, `notes.md` | [references/delivery.md](references/delivery.md) |

## Golden rules

- **Never one-shot.** Direction, storyboard, one scene, review, then the rest. Do not start the full build before the storyboard is approved.
- **Deterministic, frame-based only:** `useCurrentFrame()`, `interpolate()`, `spring()`, `useVideoConfig()`, `<Sequence>`; `random('seed')` instead of `Math.random`; no CSS transitions or animations, `requestAnimationFrame`, timers, `Date.now()` or state carried between frames. Same frame in, same image out.
- **Centralise:** colours, type, spacing, easing and durations come from `tokens.ts`; scene timings from the video's `timing.ts`; SFX only from `hits.ts`, which mirrors the storyboard's hits table.
- **Reuse before you write.** Components from `studio/src/lib/`; a new pattern used twice becomes a library component (tell the user; do not silently rewrite the library or working infrastructure).
- **Compilation is not quality.** Judge rendered frames. If you could not look at images, say "not visually verified" and why. Never imply otherwise.
- **Real assets keep their aspect ratio**; no invented numbers; illustrative visuals are listed in the report.
- **Golden scene and plan check:** after scene 1 passes, it is the source for scenes 2 to N; a five-line plan before each scene; one local commit per approved scene with the diff read ([references/phases.md](references/phases.md)).
- **Banned list per film** from the brief; the gotchas and frame-arithmetic traps ([references/determinism.md](references/determinism.md)) are read before building.
- **Measure, do not guess:** a move that feels wrong gets `inspect.mjs plot` before a code change; glides and cuts get `inspect.mjs flow`.
- **Say what you cannot render or view** at the start of a job.
- **Restraint:** no random particles, excessive glow, constant movement or transitions without a story reason. One focal point per frame, one accent.
- **Commit locally only** (one commit per approved scene); never push or create a GitHub repo unless asked.

## Subagents

- **Directions:** three parallel subagents, one per direction angle (see `motion-director`).
- **Independent reviewer:** after every inspect pass, spawn a fresh reviewer as described in `~/.claude/skills/motion-review/agent.md`. Do not grade your own scene.
- **Scene builders:** after scene 1 is approved, scenes 2..n can be built in parallel by subagents, **one scene file each** (`studio/src/videos/<slug>/scenes/SceneN.tsx`), all told to read the same storyboard rows, `tokens.ts`, `DESIGN_SYSTEM.md` and the approved scene 1 as the quality bar. Only the main session edits the composition file, `timing.ts`, `hits.ts`, `Root.tsx` and `src/lib/`. Then inspect and review the whole film together.
- **Formats:** one subagent per extra aspect ratio, each composing (not cropping) its own composition.
