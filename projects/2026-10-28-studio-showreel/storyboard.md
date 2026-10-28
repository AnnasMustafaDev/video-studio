# Studio showreel: brief and storyboard

Status: approved direction by the user's brief ("20 s, hyper professional, every kind of edit motion, camera moves, 3D, or what you think best"). Show an HTML demo first; no MP4 render until approved.

## Brief (10 ingredients)

1. **Purpose.** The hero video of this repo's README: in 20 s, show that this studio turns a typed brief into a finished, reviewed motion film, entirely in code.
2. **Format.** 16:9, 1920x1080, 60 fps, 20.0 s. Poster = last frame. (A 9:16 cut later, not now.)
3. **Art direction.** Near-black `#0B0C0F` with a faint 48 px grid; off-white `#F2F2EE` type; one accent, electric blue `#5B8CFF` (the studio token). Calm, precise, expensive. Depth from fog, soft shadows and focus, not glow. No particles, no lens flares, no plexus, no gradients-as-decoration.
4. **Composition.** One focal point per beat. Big type left-aligned on a 12-column grid with 120 px safe margins; centred only on the end card.
5. **Typography.** One grotesk family (Inter Tight from the studio, or Inter), weights 500/700, sentence case, tight tracking (-2 %) on display, no full stops except the end line. JetBrains Mono only for code, timecodes and frame counters.
6. **Movement.** Closed-form springs (zeta about 0.8, at most a tiny overshoot) for landings; expo in/out for camera; camera driven by a speed curve, never reversing inside a shot, zoom in log space. Every shot enters already moving and exits on an accelerating move. Nothing static longer than 0.6 s except the final 1 s hold.
7. **Timing.** 120 BPM: beat 0.5 s, bar 2 s, 10 bars. Every cut on a downbeat, every hit on a beat.
8. **Transitions.** Only motivated ones: match cuts on shared shapes (text line to card, card to full frame, text to timeline track, timeline to contact wall, everything to the dot). No crossfades.
9. **Audio.** Synthesised bed at 120 BPM (soft kick, sub pulse, airy pad, a riser into the end card); SFX only from the hits table (key ticks, card ticks, whooshes peaking on the cut, keyframe locks, a soft low hit on the logo). Master -14 LUFS / -1 dBTP. The demo plays with sound.
10. **Quality constraints.** No clipped or overlapping text, no unreadable type (min 28 px for anything meant to be read), no fake numbers (every counter shows the film's own real frame numbers), no em dashes on screen, deterministic: every frame a pure function of t.

## Scenes

| # | Time | Bars | Camera | What we see | On-screen text (exact) | Transition out |
|---|---|---|---|---|---|---|
| 1 Brief | 0.0-3.0 | 1.5 | Locked-off, then a slow 4 % dolly-in from 1.0 s | Black + grid. Frame 0 already shows a finished mono brief line with a blinking caret (muted autoplay reads it). The line types out its second half on the beats; caret in accent. | `20 s showreel. One accent. Every frame from code.` | At 2.5 s the camera starts pulling back and tilting 12 degrees: the line is revealed to be printed on a card (match cut: line to card) |
| 2 Storyboard | 3.0-7.0 | 2 | Pull-back into a lateral tracking move across a 3x4 wall of storyboard cards in 3D, slight parallax between rows, 6 degree yaw | The cards are real miniature compositions (title card, kinetic type, bar chart, lower third, captions, end card, timeline...), each drawn live, flipping in with a staggered spring (2 frames apart). Each card has a timecode label in mono. | Big overlay word, left: `Direct` with a small mono line `brief, directions, storyboard` | Camera picks one card (the kinetic-type one) and pushes into it: log zoom until it fills the frame (match cut: card to full frame) |
| 3 Design | 7.0-11.0 | 2 | Inside the card: flat 2D, gentle 2 % push; one 1.5 degree roll settle | Full-screen kinetic type: words rise from a mask one per beat, accent word springs in, a thin accent rule draws under it. | `Motion should` / `explain,` (accent) / `not decorate.` and small label top-left `Design` | Words collapse into horizontal bars that slide down into tracks (match cut: text to timeline tracks) |
| 4 Animate | 11.0-15.0 | 2 | Crane down onto a 3D timeline lying at 60 degrees, then a slow track along it following the playhead | A clean timeline: 4 tracks (Type, Camera, Audio, Hits), keyframe diamonds that pop and lock on beats, an audio waveform drawn from the actual bed, a playhead sweeping with a mono timecode and real frame counter (`frame 0660` to `0900`, at 60 fps). | Overlay word `Animate` with mono `springs, camera, sound on the beat` | Timeline tracks fold up and rotate into a vertical wall (match cut: tracks to contact sheet rows) |
| 5 Review | 15.0-18.0 | 1.5 | 20 degree orbit around a contact-sheet wall, slight focus pull from front row to the wall | A contact sheet of this very film's own frames (rendered thumbnails of scenes 1 to 4), revealed row by row; each row gets a small accent check mark as it lands. | Overlay word `Review` with mono `every frame, looked at` | Everything contracts toward the centre into a single accent dot (shared element) |
| 6 End card | 18.0-20.0 | 1 | Settles to flat-on, locked | The dot lands, then `Video Studio` wordmark resolves (mask reveal), small line below. Hold 1.0 s clean: this frame is the poster. | `Video Studio` and below in mono: `Motion graphics, made in code with Claude` | none |

## Hits table (the only source of SFX)

| Time | Event | Sound |
|---|---|---|
| 0.5-2.0, every beat | brief characters typing | soft key ticks (quiet, one per character, peak on the char) |
| 2.5 | pull-back starts | short whoosh, peak at 3.0 cut |
| 3.0-4.5, stagger | cards flip in | soft card ticks (3 grouped per beat) |
| 6.5 | push into card | whoosh, peak at 7.0 |
| 7.0 / 7.5 / 8.0 | three words land | low soft tick each; accent word gets a brighter tick |
| 10.5 | collapse to tracks | reversed swell into 11.0 |
| 11.5-14.5, on beats | keyframes lock | crisp lock tick x7 |
| 15.0 | fold to wall | whoosh, peak at 15.0 |
| 15.5 / 16.0 / 16.5 / 17.0 | contact rows land | card tick x4 |
| 17.5-18.0 | contract to dot | riser into 18.0 |
| 18.0 | dot lands | soft low hit |
| 18.5 | wordmark resolves | airy shimmer, quiet |
