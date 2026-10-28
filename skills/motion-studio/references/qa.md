# QA checklists

The loop that uses these checklists (stills, phone pages, strips, sync, scored review rounds, stop rule) is in [review.md](review.md); the final checks and report are in [delivery.md](delivery.md).

## Before showing a draft (contact sheets)

Render stills at every settled state and at transition midpoints (`node tools/render.mjs preview ...`) and look at every one:

- [ ] Frame 0 reads as a finished title card.
- [ ] The first 2 seconds would stop a scroll.
- [ ] Every caption ≤ 5 words, ≤ 2 lines, readable, not clipped, not overlapping the window.
- [ ] Text never sits on busy or white UI without contrast.
- [ ] Every number is real and has its reference on the same frame.
- [ ] Spotlights and cursor targets sit exactly on the UI they name at every zoom.
- [ ] No overlay is one frame late (camera updated first).
- [ ] No edge of the recording shows during zooms.
- [ ] Transitions cover the full frame at their peak (flood radius ≥ distance to the farthest corner).
- [ ] One accent colour, one radius scale, one family; no em dashes on screen.
- [ ] Every word readable on the phone pages (`inspect.mjs tile shots`).
- [ ] Strips across each transition: the cut frame shows the new image, no blank or flash frames.
- [ ] Console clean (the renderer reports page errors and 4xx responses).

## Before the final render

- [ ] The user approved the cut in the HTML player.
- [ ] Voice: `heard` matches the script for every line; no clipped words.
- [ ] Every visual change lands on its word (±0.1 s); clicks 80 to 150 ms before the UI reacts.
- [ ] Holds: numbers and CTA still for ≥ 1.5 to 2 s.
- [ ] CTA: one action, real URL or path.
- [ ] Music on the grid; payoff impact lands on the result; ducking audible but not pumping.
- [ ] Loudness: -14 LUFS integrated, ≤ -1 dBTP.
- [ ] Subtitles: timing, register, no dash separators. SRT files written.
- [ ] Illustrative visuals listed for the hand-over.

## After delivery

- [ ] `inspect.mjs probe` every file (resolution, fps, duration, yuv420p, audio, loudness) and open its first and last encoded frame.
- [ ] `inspect.mjs sync` against `build/comp_timing.json`; poster frame written.
- [ ] Delivery report written ([delivery.md](delivery.md)).
- [ ] Append technique-only lessons to `learnings.md`.
