# Review rubric

Score what you see on the images, at the size the viewer will see it. Anchors: **3** = a viewer notices the problem without being told; **5** = acceptable template work; **8** = a professional would ship it; **10** = nothing to change.

## The nine dimensions

| Dimension | 8+ looks like | Typical defects (cost points) |
|---|---|---|
| **Typography** | One family (plus one mono for meta), deliberate weights, tight display tracking, clean line breaks, no widows, readable on the phone sheet | Clipped descenders, orphan words, mixed fonts, fallback glyphs, text too small on the phone sheet, centred lines that build word by word and look lopsided |
| **Hierarchy** | One focal point per frame; the eye knows where to go in under 0.5 s; the accent marks the one thing that matters | Two things fighting, everything the same weight, accent used on decoration, key text smaller than secondary |
| **Spacing** | Safe margins respected, consistent grid and gaps from the design tokens, optical alignment of left edges | Elements kissing the edge, uneven gaps, text over busy UI without a scrim, overlaps, cramped cards |
| **Timing** | Each change lands on its beat or word (±0.1 s); holds long enough to read (≈ 0.3 s per word, numbers and CTA ≥ 1.5 to 2 s still) | Text gone before it can be read, dead holds with nothing new, reveals late against the voice |
| **Easing** | Springs or ease-out entrances, faster accelerating exits, at most a small overshoot, motion blur where things move fast | Linear moves, bouncy overshoot, everything with the same ease and duration, robotic start/stop |
| **Transitions** | Motivated (a shape, motion or colour carries over); cut frames open on the new image; whips show both shots | Cross-dissolve between unrelated shots, blank or flash frames at cuts, transition for its own sake, zoom in and straight back out |
| **Consistency** | Same palette, radius, shadow, stroke and type scale in every scene; tokens, not one-off values | A scene that looks like another video, a second accent with no meaning, mixed icon strokes |
| **Pacing** | Something new every 2 to 4 s; long and short beats alternate; showpieces reserved for 2 or 3 moments; clear arc to the end | Monotone rhythm, a middle that sags, a gap over 4 s, an ending that stops instead of lands |
| **Sound sync** | Every accent in the hits table has a sound within 40 ms (`inspect.mjs sync`); music sections change on the cuts; mix breathes; -14 LUFS / ≤ -1 dBTP | SFX early or late, sounds with no visual event, wall-to-wall SFX, music fighting the voice. Silent video by design: `n/a` |

## Pass / fail checks

Blocking (any fail means not READY):

- [ ] Frame 0 is already a finished, readable frame (muted autoplay shows it), and the first 2 s would stop a scroll.
- [ ] Every word the viewer must read is readable on the phone sheet, inside the platform safe area (9:16: nothing important in the top 220 px or bottom 380 px).
- [ ] No clipped, overflowing or overlapping text anywhere on the sheets.
- [ ] No invented numbers, quotes or results; every number carries its reference on the same frame.
- [ ] No cut opens on a blank or full-frame flash (at most two structural flashes in the film); check the strips.
- [ ] The end card / CTA holds still for ≥ 1.5 s.
- [ ] Each non-primary format is composed for its own shape, not a crop or letterbox of the master.
- [ ] The encoded file matches the brief (`inspect.mjs probe`: resolution, fps, duration, yuv420p, audio present).

Non-blocking (report them):

- [ ] No banned defaults: centred title on a gradient, everything fading in, glow on UI, random particles, corner labels, constant camera drift, lens flares.
- [ ] Longest gap without a new event (name it with its times).
- [ ] Matches the approved storyboard, or the deviation is an improvement you can defend.

## Ranking defects

Order the top five by damage to the viewer, not by ease of fixing: (1) anything that breaks the message (unreadable, wrong, missing) > (2) anything that looks broken (clipping, flash frames, overlap) > (3) anything that looks cheap (easing, consistency) > (4) polish.
