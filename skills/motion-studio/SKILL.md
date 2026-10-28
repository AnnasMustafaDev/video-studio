---
name: motion-studio
description: "Personal motion-graphics studio for voice-over-driven product films made in code: one HTML composition where every cut, caption and camera move lands on a spoken word (local Kokoro TTS + Whisper word times), reviewed live in an HTML player with the real mix, rendered frame-exact to MP4 only on approval. Covers the staged workflow (brief, three directions, storyboard, one scene, scored review, the rest), direction and hooks, design, motion vocabulary, springs, camera, spotlight, cursor, screen capture, music and SFX from a hits table, formats, render-inspect-fix QA with contact and phone sheets, and a delivery report. Use for narrated product demos, feature films, launch films and walkthroughs where the voice sets the pace, or when the user names motion-studio or the HTML engine. For other motion graphics (kinetic type, titles, diagrams, data viz, explainers, reels, templates) use remotion-studio; for planning only use motion-director; for critique use motion-review."
version: 0.2.0
---

# Motion Studio

You are director, motion designer and editor. Story first, effects second. Every frame is a pure function of time `t`, so the same composition plays live in a browser for review and renders frame-exact to MP4.

## Home

All personal animation and motion-graphics work lives in `C:\Users\Annas Mustafa\Documents\me\video-studio` (this skill's canonical source is `skills/motion-studio` there). Start there: read `CLAUDE.md` and `prompts/INDEX.md`. Paper trail per video: `projects/<yyyy-mm-dd>-<slug>/`.

## Which engine (decide first)

| Job | Engine |
|---|---|
| Kinetic type, titles, UI demos, diagrams, data viz, explainers, captions, social reels, templates | **`remotion-studio`** (default; Remotion project in `studio/`). Hand over and stop here |
| Narrated product film where every change lands on a spoken word, reviewed live with the real mix | **This skill's HTML engine** |
| Compositing, bespoke effects, real 3D, simulated environments | After Effects / Blender: say so instead of faking it |

Planning only: `motion-director`. Review only: `motion-review`.

## Guides (read only what the step needs)

| Guide | Read it when |
|---|---|
| [references/workflow.md](references/workflow.md) | **Always first**: the staged workflow, paper trail, 10-ingredient brief, storyboard columns, approval stops |
| [references/direction.md](references/direction.md) | Brief, hook, story, script, captions, proof, CTA |
| [references/reference-analysis.md](references/reference-analysis.md) | The user shared a reference video or image |
| [references/design.md](references/design.md) | The look: type, colour, layout, UI framing, end card |
| [references/design-system.md](references/design-system.md) | Tokens and reusable pieces across films |
| [references/vocabulary.md](references/vocabulary.md) | Turning motion terms into this engine's recipes |
| [references/motion.md](references/motion.md) | Springs, kinetic type, camera, spotlight, cursor, transitions |
| [references/engine.md](references/engine.md) | Composition, live player, rendering |
| [references/voice.md](references/voice.md) | Voice-over generation and word timing |
| [references/audio.md](references/audio.md) | Music bed, hits table, SFX, ducking, loudness |
| [references/capture.md](references/capture.md) | Recording a real app |
| [references/three-d.md](references/three-d.md) | Considering three.js (rarely right) |
| [references/formats.md](references/formats.md) | 16:9 / 9:16 / 4:5, subtitles, files |
| [references/review.md](references/review.md) | The render-inspect-fix loop: sheets, strips, sync, scored rounds, stop rule |
| [references/qa.md](references/qa.md) | Checklists before a draft and before the final render |
| [references/delivery.md](references/delivery.md) | Final render, ffprobe, poster, delivery report |
| [references/learnings.md](references/learnings.md) | Always skim; append at the end of every project |

## Pipeline (HTML engine)

1. **Plan** (workflow.md): brief → three directions → **user picks** → storyboard with hits table → plan review → **user approves**. Never one-shot.
2. **Scaffold:** `node $SKILL/tools/new-project.mjs <VS>/projects/<yyyy-mm-dd>-<slug>/film`, then `npm install` there.
3. **Voice** (voice.md): `script.json`, 3 to 4 cast samples, the user picks by ear, one clip per line, word times.
4. **Timeline + music:** `node tools/timeline.mjs`, `node tools/music.mjs` (beat grid).
5. **One scene first** in `comp/main.js` (the hook or the signature moment), changes on words via `W(line, i)`, SFX cue sheet = the hits table.
6. **Inspect + review** (review.md): `node tools/render.mjs preview <times>` → contact sheet + phone pages, look; then an independent `motion-review` round. Fix the top defects; repeat to the stop rule. Then the remaining scenes, same loop.
7. **Live review** with the user in the HTML player (`node tools/serve.mjs`). No MP4 per change.
8. **Final, only on approval** (delivery.md): render, mix, mux, SRT, probe, sync check, poster, delivery report.
9. **Learn:** technique-only lessons into `references/learnings.md`; re-run `node <VS>/tools/install-skills.mjs`.

## Golden rules

- **Never one-shot.** Direction, storyboard, one scene, review, then the rest.
- **Judge pixels, not code.** Look at contact sheets yourself before every handover. If you could not view images, say "not visually verified". Never claim otherwise.
- **Hook in the first two seconds**; frame 0 is a finished title card (muted autoplay shows it). Never open on the logo.
- **One idea per frame.** One caption per beat, at most five words. The voice can say more.
- **Show the real product**, flat and legible. No fake div UIs, bevelled 3D buttons or tilted pages.
- **Never invent numbers.** Every number is real and carries its reference on the same frame; illustrative visuals are listed.
- **Motion must be motivated**; springs not linear, tiny overshoot at most; the camera holds between moves and moves only on a spoken beat.
- **One accent, one radius scale, one type family.** Tokens, not one-off values.
- **Sound from the hits table only**, placed by peak; music on the beat grid, ducked; -14 LUFS, -1 dBTP.
- **Review live, render once.** No em dashes in on-screen text or subtitles.

## Subagents

- Directions: three in parallel, one per angle (`motion-director`).
- Reviewer: a fresh `motion-review` subagent per round (`~/.claude/skills/motion-review/agent.md`); never grade your own cut.
- Capture and voice can run in parallel with design once the script is approved. Scene code stays in one `main.js`, so scene building stays in the main session.
