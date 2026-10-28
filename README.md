# Video Studio

A personal studio for making motion graphics and animated videos with Claude Code: a Remotion project, a prompt library, Claude Code skills and an illustrated guide, all in one repo.

The idea: Claude works as creative director, motion designer, animator and engineer, and you direct it stage by stage. You don't ask for a whole video in one shot. Every frame is rendered from code, and quality is judged on rendered frames, never on the code.

## What's inside

| Path | What it is |
|---|---|
| [`studio/`](studio/) | Remotion 4 project (React, frame-based). Component library in `src/lib/` (titles, kinetic type, captions, lower thirds, counters, charts, transitions, backgrounds, sound cues), design tokens, [`DESIGN_SYSTEM.md`](studio/DESIGN_SYSTEM.md), the official Remotion agent skills, and a `_template` for new videos |
| [`prompts/`](prompts/) | Prompt library. [`prompts/INDEX.md`](prompts/INDEX.md) says which prompt to use for which purpose, and in what order |
| [`skills/`](skills/) | Claude Code skills (see below). Installed into `~/.claude/skills` with `node tools/install-skills.mjs` |
| [`third_party/`](third_party/) | Vendored third-party skills, pinned to an upstream commit and never edited here (each has an `UPSTREAM.md` with source, licence and how to update). The same install script installs them |
| [`guide/index.html`](guide/index.html) | Self-contained illustrated guide: workflow, tools, setup, prompting, motion vocabulary, master prompt, staged prompts, references, design system, learning path. Open it in a browser |
| [`learning/`](learning/) + [`prompts/learning/`](prompts/learning/) | A 7-day learning plan, with one ready prompt per day |
| [`source/`](source/) | The notes this repo was built from |
| `projects/<date>-<slug>/` | One paper trail per video: brief, directions, storyboard, review, notes (renders stay local) |

## Skills

| Skill | Use it for |
|---|---|
| `motion-director` | Creative direction with no code: a 10-ingredient brief, three distinct directions, a timed storyboard with a hits table, reference breakdowns |
| `remotion-studio` | Building and rendering videos in `studio/` with the staged workflow, frame checks and a delivery report. The default engine |
| `motion-studio` | Voice-over-driven product films in a single HTML composition, where every cut lands on a spoken word |
| `motion-review` | A strict, independent review of rendered frames: scores, top defects, a verdict. Best run as a subagent |
| `prompt-motion-search` | Searching [prompt-motion.com](https://prompt-motion.com) for animations made with Claude, then turning a chosen prompt into a proper brief (credited, on demand) |
| `brag`, `brag-slim` | **Third-party, MIT** ([latent-spaces/brag](https://github.com/latent-spaces/brag), vendored in [`third_party/brag/`](third_party/brag/UPSTREAM.md)). A quick 15 to 25 s launch video of a project you just built, in one command, written to `brag-output/` in that project. `brag-slim` needs no extra tools; full `brag` uses Hyperframes |

## Quick start

Prerequisites: Node 20.19+ (24 recommended), ffmpeg on PATH, [Claude Code](https://claude.com/claude-code).

```bash
git clone https://github.com/AnnasMustafaDev/video-studio.git
cd video-studio
node tools/install-skills.mjs        # copies skills/ into ~/.claude/skills (backs up existing ones)
cd studio
npm install
npm run stills -- LibraryShowcase 50,130,245,350,449   # renders frames + a contact sheet
npm run dev                                           # Remotion Studio preview
```

Then, in a second terminal in the repo root, run `claude` and start with a brief:

```
New video: 15 s Instagram reel (9:16, 30 fps) about <topic>.
Goal: <what it should achieve>. Mood: <calm / bold / ...>.
Look: <background>, <type colour>, one <accent> accent.
Exact text: "<line 1>" then "<line 2>".
Reference: <image or video path>.
Start with 3 creative directions. No code yet.
```

## The workflow

1. **Direction:** three genuinely different looks, pick one (`prompts/10`)
2. **Storyboard:** a timed scene table with exact text, motion, easing, transitions and sound cues (`prompts/11`)
3. **One scene:** build it, render stills, look at them, fix (`prompts/12`)
4. **Review:** a strict director review, top five defects, re-render (`prompts/13`)
5. **The rest:** remaining scenes one at a time, then sound, formats and final render (`prompts/14`, `50` to `53`)
6. **Post-mortem:** lessons go back into the skills (`prompts/70`)

Rules that hold throughout: deterministic, frame-based animation only (`useCurrentFrame`, `interpolate`, `spring`, no CSS transitions, timers or `Math.random`); one focal point per scene; real numbers only; -14 LUFS / -1 dBTP; and never claim a video was visually checked unless the frames were actually looked at.

## Licences

- Remotion is free for individuals and companies with up to 3 employees; larger companies need a [company licence](https://remotion.dev/license).
- Prompts found through `prompt-motion-search` belong to their authors and are always credited.
- `third_party/brag/` is MIT (Shunit Haviv Hakimi). Its bundled music is CC BY 4.0 (Sascha Ende, ende.app) and must be credited in any published video that uses it; its SFX are CC0.
- Sound effects in `studio/` are generated with ffmpeg, so they have no licence questions.
