# Reference breakdown

When the user shares a video or image they like, never "make something like this". Analyse it as a motion designer first, then plan from its principles, not its branding or exact creative expression.

## Get looking material

- A video file: one frame per shot plus a 1 fps sheet. `node ~/.claude/skills/motion-review/tools/inspect.mjs sheet <ref.mp4> --every 1` (contact + phone pages), and `strip <ref.mp4> a b` across each transition you want to understand. Measure the cut rhythm by noting shot changes on the sheet.
- A URL to a video: ask the user to download it themselves or give you the file (do not download from untrusted sources unasked). For a web page, screenshots are fine.
- Images: open them directly.
- If you cannot see the reference (no file, no image tool), say so and work from the user's description, marking every point as interpretation.

## Break down (write `reference.md` with these ten sections)

1. **Composition and hierarchy:** grid, margins, alignment, scale contrast, negative space, focal point per shot.
2. **Typography:** font character (geometric / grotesque / serif / mono), weights, size relative to frame, tracking, line breaks, text treatment (per word, per glyph, masked).
3. **Colour, contrast, texture, lighting:** how the palette is used (large flat fields, neutral with accent pops), gradients, grain, shadows, glow.
4. **Movement of each major element:** entrance, exit, direction, distance, overshoot.
5. **Timing, pacing, easing, stagger:** median shot length, cuts per 10 s, holds, how fast moves resolve ("6 to 8 frames with about 10 % overshoot", not "snappy").
6. **Transitions and continuity:** cut types, what carries across (shape, colour, motion).
7. **Depth, camera, layering:** static / push / parallax / whip; foreground, midground, background.
8. **Sound and its relation to picture:** what is accented, where silence sits.
9. **What creates the premium look:** the two or three decisions that matter most. Usually restraint, not effects.
10. **Feasibility:** what Remotion can do, what the HTML engine can do, what needs external assets or After Effects / Blender (complex 3D, footage, compositing).

Mark each point **Observed** (visible on the frames, measurable) or **Interpreted** (your reading). Then:

- **Keep:** the principles to carry over (rhythm, composition, motion character).
- **Change:** what must differ (brand colours and type win over the reference's, its logo and exact expressions are not copied).
- **Signature move:** the one thing a viewer would remember, and how we get our own version of it.

Do not write implementation until the breakdown is complete and the user has confirmed what to keep and change.
