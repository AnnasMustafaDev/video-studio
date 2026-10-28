# Using a visual reference

Never "make something like this". Analyse the reference as a motion designer, separate what you observe from what you interpret, then plan from its principles without copying its branding or exact creative expression. The full procedure and template live in `~/.claude/skills/motion-director/references/reference-analysis.md` and `templates/reference.md`; this is the short version for the HTML engine.

## Look at it properly

- Video file: `node ~/.claude/skills/motion-review/tools/inspect.mjs sheet <ref.mp4> --every 1` (contact + phone pages), plus `strip <ref.mp4> a b` across transitions you want to copy the feel of.
- If you cannot see it, say so and mark the whole breakdown as interpretation.

## Break down (into `projects/<slug>/reference.md`)

1. Composition and hierarchy. 2. Typography, spacing, text treatment. 3. Palette, contrast, texture, lighting. 4. Movement of each major element. 5. Timing, pacing, easing, stagger (measure: "resolves in 6 to 8 frames, ~10 % overshoot"). 6. Transitions and continuity. 7. Depth, camera, layering. 8. Sound against visual events. 9. What creates the premium look. 10. What this engine can do versus what needs Remotion, footage, After Effects or Blender.

Then: **keep** (principles), **change** (brand colours and type win), **signature move** (our own version). No implementation until the breakdown is done and the user agreed on keep/change.

## Translating into this engine

- Measured rhythm becomes the beat grid (`bpm` in `script.json`) and scene `minBars`.
- Entrance character becomes spring `ζ, ω` values and GSAP eases in `motion.md` terms.
- Camera language maps onto camera keys with holds; transitions onto the table in `motion.md`.
- If the reference depends on complex 3D, real footage or compositing, say so; do not fake it with glow and particles.
