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
| **Pacing** | Something new every 2 to 4 s; long and short beats alternate; tension varies (see Pacing and tension below); showpieces reserved for 2 or 3 moments; clear arc to the end | Monotone rhythm, a middle that sags, a gap over 4 s, an ending that stops instead of lands, every transition the same length, one easing on everything |
| **Sound sync** | Every accent in the hits table has a sound within 40 ms (`inspect.mjs sync`); music sections change on the cuts; mix breathes; full-frame beat hits capped (see below); -14 LUFS / ≤ -1 dBTP | SFX early or late, sounds with no visual event, wall-to-wall SFX, music fighting the voice. Silent video by design: `n/a` |

## Pass / fail checks

Blocking (any fail means not READY):

- [ ] Frame 0 is already a finished, readable frame (muted autoplay shows it), and the first 2 s would stop a scroll.
- [ ] Every word the viewer must read is readable on the phone sheet, inside the platform safe area (9:16: nothing important in the top 220 px or bottom 380 px).
- [ ] No clipped, overflowing or overlapping text anywhere on the sheets.
- [ ] No invented numbers, quotes or results; every number carries its reference on the same frame.
- [ ] No cut opens on a blank or full-frame flash (at most two structural flashes in the film); check the strips.
- [ ] The end card / CTA holds still for ≥ 1.5 s.
- [ ] Each non-primary format is composed for its own shape, not a crop or letterbox of the master.
- [ ] No unexplained `pop`, `flash`, `ghost` or `loop_seam` finding from `forensics`, and every acceptance criterion in the brief passes.
- [ ] The encoded file matches the brief (`inspect.mjs probe`: resolution, fps, duration, yuv420p, audio present).

Non-blocking (report them):

- [ ] No banned defaults: centred title on a gradient, everything fading in, glow on UI, random particles, corner labels, constant camera drift, lens flares.
- [ ] Pacing and tension varied (not one transition type, one curve, one duration throughout); full-frame beat hits within the cap.
- [ ] Longest gap without a new event (name it with its times).
- [ ] Matches the approved storyboard, or the deviation is an improvement you can defend.

## Pacing and tension (a criterion, not a recipe)

Even rhythm is the commonest AI-motion fault: every cut a crossfade of the same length, one expo-out curve on every entrance, no beat that is sharper or slower than the rest. Check on the strips and the `forensics` hard-cut list:

- Name the one hard cut and the one fast (under 6 frames) fade or whip. If every transition has the same type and duration, flag it (pacing, transitions).
- Entrance and exit curves and durations differ by role (hero, support, exit); a single curve everywhere is a template tell.
- Numbers to read against (norms from professional launch films, the author's measurements, so reference points, not pass/fail): median shot about 1.5 to 3 s for a launch cut, a new visual beat about every 1 to 2 s, first readable word by about 0.4 s, low-energy stretch under 4 s, one earned stillness of 1.0 to 1.6 s on the key claim followed by the biggest move, accent colour about 5 percent of pixels, end card about 2 s still, a repeated reveal about 40 percent faster the second time. `inspect.mjs forensics` gives hard-cut count, median and longest shot, and the still share; the share of still frames is high (over about 40 percent) only when the film is a stills-and-holds piece by design.
- Spent-once rule: a hold longer than 1.6 s that is not the key claim or the end card is a defect or must be declared in `qa.json` with a reason.
- Full-frame beat hits (whole-picture or camera-layer impacts on the beat): at most 3 per film, at least 16 beats apart; everything else on the beat hits only the hero element. Mark them `"scope":"full"` in hits.json and run `sync --bpm`.

## Measured defects (`inspect.mjs forensics`, `flow`)

Stills hide time. Run `forensics` on the encoded file and judge each finding against the flagged frames; a measurement is a pointer, your eyes decide.

| Finding | Counts as a defect when |
|---|---|
| `still_hold` | over 1.6 s and not the key claim or end card; or the first 4 frames are dead (`slow_open`) |
| `pop` / `flash` | any one-frame glitch; more than two structural flashes in the film |
| `ghost` | any frame that is a blend of two shots at a cut (double exposure) |
| `judder` | repeated frames or uneven timing inside moving stretches (regular = fps-conversion cadence, irregular = a stall) |
| `banding` | staircase gradient steps visible on the poster frame of the flagged time |
| `loop_seam` | only if the piece is a loop (`"loop": true` in qa.json) and the last frame does not meet the first |

Intended moments are declared in `projects/<slug>/qa.json` (`holds`, `flashes`, `cuts`, `ghosts`, `pops`, `judder`, `ignore`, each with a `reason`); declared items are listed apart and not counted. Declare only what the storyboard promises; do not declare to silence the tool.

Camera shots: `flow` gives the global speed curve (frame widths per second) and zoom rate. A glide is one hump or plateau; a `speed_dip` (speed under half of the neighbouring peak between two moves) or a `zoom_reversal` (zoom in turning to zoom out) is a surge or stall the stills cannot show. Camera speed is specified in the brief as shares of cruise at timestamps; compare the measured curve to it. Frames where the picture changed by local animation (type, cards) rather than a camera move are skipped, not measured. For any other animated value (a spring, a card position), export it to JSON/CSV and run `plot --deriv`: a motion bug is diagnosed by plotting value and velocity over frames before any code changes.

## Banned-effects check (cheap tells, report each hit with its time)

Borrowed props (rocket, lightbulb, handshake), a demo with no cause, a recycled end card, the device or hero dropping out at a seam, handheld shake in a bright UI film, more than one sheen or glint per hero, small source or disclaimer text on the last beat (needs 2.5 s or more at half opacity or higher), a brand wordmark held under 1 s. Plus the non-blocking banned defaults below.

## Acceptance criteria and glossary

If `brief.md` has a glossary ("punchy = entrances at most 10 frames, one scale event per scene") or acceptance criteria ("title block no closer than 120 px to any edge", "focal point alone for at least 45 frames"), check each one by number on the images and list it as pass or fail. A vague word with no definition in the brief ("premium", "punchier") is itself a finding: say which words need defining. Do not score against a taste the brief never stated.

## Reference comparison

If a reference clip, sheet or approved golden scene is given, run `inspect.mjs compare` and add one line per matched pair: "in what way does ours fall short of (or beat) this" (type scale, density, colour, blur, spacing, focal point). Do not copy the reference's look as a defect; only gaps in craft count. No reference given: write `reference: none`.

## Ranking defects

Order the top five by damage to the viewer, not by ease of fixing: (1) anything that breaks the message (unreadable, wrong, missing) > (2) anything that looks broken (clipping, flash frames, overlap) > (3) anything that looks cheap (easing, consistency) > (4) polish.
