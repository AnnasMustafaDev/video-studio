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

## Additional checks (techniques from the research round)

Before a draft:

- [ ] Every item in the film's **Banned for this film** list was looked for in the stills ([banned-effects.md](banned-effects.md)).
- [ ] The relevant [gotchas.md](gotchas.md) lines were read: fast moves at 8 subframes, no fade under 0.3 s, no `will-change` on scaled text, no highlight box, each scene starts at the previous end zoom, frame-arithmetic traps.
- [ ] Copy budget: 1 to 4 word fragments, about 15 to 25 words per 30 s, copy on under about 65 percent of frames.
- [ ] Every transition names the carried element (`X becomes Y`); the frame before a hand-off contains the thing the next frame grows from.
- [ ] Type is on the frame ramp and above the text floor; one accent mark per frame.
- [ ] Density: dense scenes are rare and deliberate; no static screen under the voice.

Motion:

- [ ] A move that feels wrong gets plotted before any code change: `inspect.mjs plot` (value and velocity; look for a zero-velocity run mid-move).
- [ ] Camera glides and transitions: `inspect.mjs flow` on a 30 fps draft (speed never dips, zoom does not reverse, speed continues across velocity-matched cuts).
- [ ] Rendered file: `inspect.mjs forensics` for frozen stretches, one-frame pops, ghost frames and banding; declare designed moments (a planned freeze, a flash cut) with a reason so thresholds stay strict elsewhere. A cheaper read: `inspect.mjs compare` against the approved golden scene or a reference.

Loops (social loops, showreel):

- [ ] Last frame equals first, including cursor position and speed; accent, cursor and type match. Diff frame N-1 against frame 0 and preview the loop twice (`inspect.mjs probe` returns both frames).

Music-led:

- [ ] Beat-grid residual at most about 15 ms; cut error at most 3 frames; at most 3 full-frame beat hits, 16 beats apart.
- [ ] Voice about 9 dB above music per phrase between 300 Hz and 4 kHz.
- [ ] Web embed: the checklist in [formats.md](formats.md).
