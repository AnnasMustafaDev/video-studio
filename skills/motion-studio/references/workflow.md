# Staged workflow

People getting impressive results use Claude as motion designer, creative director, animator and developer, with a workflow that lets them inspect and improve the actual video. Separate creative decisions from implementation, and implementation from quality assurance. Never generate the whole video in one shot.

`<VS>` = `C:\Users\Annas Mustafa\Documents\me\video-studio`. Paper trail: `<VS>\projects\<yyyy-mm-dd>-<slug>\` with `brief.md`, `reference.md`, `directions.md`, `storyboard.md`, `review.md`, `notes.md`, and renders in `out/` (gitignored). For the HTML engine the film project itself goes in `film/` inside that folder. Templates for the documents: `~/.claude/skills/motion-director/templates/`.

## The five phases

| Phase | What happens | Stop? |
|---|---|---|
| **1 Understand and plan** | Brief from the 10 ingredients (assume and document, ask only critical gaps); reference breakdown if any; three genuinely different directions with a recommendation; storyboard of the chosen one with hits table; design system; which assets are code-made versus real | Stop after directions (user picks) and after the storyboard (user approves) |
| **2 Design for quality** | Hierarchy and negative space, one focal point per scene, consistent type/spacing/colour/alignment, purposeful easing and duration, controlled stagger and layering, meaningful transitions, depth/texture/light only where justified, sound synced to events, readable text in safe margins | |
| **3 Implement** | Inspect the project first; tokens and timings centralised; deterministic (every frame from `t`); reusable pieces; real assets at their aspect ratio; audio and picture timing coordinated. **One scene first** | |
| **4 Render, inspect, improve** | Stills and sheets, look, fix, independent scored review, fix the top defects, re-render, repeat to the stop rule ([review.md](review.md)); then the remaining scenes | Show the user only after a passing round |
| **5 Deliver** | Final render at spec, ffprobe, sync check, poster, delivery report, learnings ([delivery.md](delivery.md)) | |

Prioritise creative quality, visual consistency, deterministic rendering and verified output over adding effects.

## The 10 ingredients of a brief

1. **Purpose:** what the video must achieve, the audience, the one thing to remember.
2. **Format:** 16:9 / 9:16 / 1:1 / 4:5, resolution, frame rate, duration.
3. **Art direction:** aesthetic, references, palette, contrast, materials, texture, atmosphere.
4. **Composition:** where things sit, negative space, foreground / background layers.
5. **Typography:** typeface, weights, hierarchy, line breaks, tracking, alignment, **exact on-screen text**.
6. **Movement:** what moves, direction, distance, speed, trigger.
7. **Timing:** scene durations, delays, holds, overlaps, reveal times, ending.
8. **Transitions:** cut, match cut, mask reveal, wipe, zoom, morph, camera move, each supporting the story.
9. **Audio:** music mood, SFX, voice-over, accents and silence, and where they occur.
10. **Quality constraints:** no clipped text, broken layouts, random decoration, accidental overlaps, inconsistent fonts or unreviewed final renders.

Full guidance and a weak-versus-strong example: `~/.claude/skills/motion-director/references/brief.md`.

## The staged prompts (one stage per turn)

1. **Directions:** three genuinely different directions (visual language, palette, type, pacing, animation style, transitions, audio), which is strongest and why. No code.
2. **Storyboard:** timestamps and a clear arc. For every scene: first frame, last frame, focal point, exact text, animation, easing, transition, audio cue, purpose, how it connects to the next; flag visually repetitive scenes. Plus the hits table.
3. **Build one scene:** only scene 1 from the approved storyboard; composition, type, timing and motion quality; reusable pieces; frame-based. Render representative frames, inspect, fix before moving on.
4. **Quality review:** a strict director (best a fresh subagent with `motion-review`) scores typography, hierarchy, spacing, timing, easing, transitions, consistency, pacing, sound sync; names the five most consequential defects with fixes; the builder fixes the highest-impact ones and re-renders. No new effects unless they solve a real problem.

The same prompts, for humans, are in `<VS>\prompts\` (see `prompts/INDEX.md`).

## When the user says "just make it"

Still write a short brief and storyboard (minutes, not hours), say that you skipped the approval stops at their request, and keep the one-scene-first and review loop: those protect the result, not the process.
