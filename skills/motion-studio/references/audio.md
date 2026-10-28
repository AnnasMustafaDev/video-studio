# Music, sound effects, loudness

## Music bed composed in code

`tools/music.mjs` renders music with the Web Audio `OfflineAudioContext` inside headless Edge and writes `audio/music.wav` (48 kHz stereo). No licensing questions, and it sits on the exact beat grid of `build/timeline.json`.

- Instruments: kick, hats, clap, saw bass with a closing low-pass, detuned-saw pad, noise riser, sub impact, convolver reverb from a seeded noise impulse, glue compressor on the master.
- 100 to 115 BPM for product films (110 worked well). Chords one per bar (e.g. Am, F, C, G).
- **Arrangement follows the story** (configure in `script.json` → `music`):
  - `intro`: soft kick only during the hook.
  - `breakdown`: drop drums and darken the pad under a tense or reflective beat (a question, a pause).
  - `lift`: riser in the bar before, impact on the downbeat of the payoff scene, brighter pad inside it.
  - `end`: impact on the last bar for the logo, then let the reverb tail ring.
- Scene changes land on bar lines for free because the timeline snaps scenes to bars.

## Ducking

Sidechain the music under the voice bus (`sidechaincompress=threshold=0.025:ratio=5:attack=30:release=420`). Music level about 0.5 before ducking. No hand-drawn volume automation.

## Hits table: the only source of SFX

The storyboard has a hits table (`time | visual event | sound | level`). The `SFX` cue sheet in `comp/main.js` is a one-to-one copy of it, with times expressed through `S/E/L/W` helpers so cues move with the edit. Nothing else adds sound effects. The renderer exports the cues to `build/comp_timing.json`; after the mix, `node ~/.claude/skills/motion-review/tools/inspect.mjs sync <mp4> build/comp_timing.json` checks every cue lands within ±40 ms and draws a waveform with the hits marked. A hit without a visual event, or a visual accent without a hit, is a storyboard bug: fix the table first, then the code.

## Sound effects

Synthesised with ffmpeg `lavfi`, each with a known peak offset:

| SFX | Recipe | Peak |
|---|---|---|
| whoosh | pink noise, band-pass 900 Hz, gaussian envelope peaking at 0.42 s, HP 180, LP 5200 | 0.42 s |
| pop | `sin(2π(380+900t)t)·(1−e^(−900t))·e^(−26t)`, LP 4 kHz | 0 |
| tick / click | `(sin 2100 + 0.5 sin 3400)·e^(−90t)` | 0 |

- **Place every SFX by its peak** on the visual hit (`adelay = (cue − peak)`).
- Cues come from the composition (`window.__timing.sfx`, `{name, at, vol}`), so they move with the edit.
- Volumes: whoosh 0.4 to 0.55, pop 0.25 to 0.3, click 0.4. Fewer is better: transitions, clicks, the payoff.

## Loudness

- Final mix `loudnorm=I=-14:TP=-1:LRA=11` for web and social; -16 for presentations.
- Measure with `ffmpeg -i mix.wav -af ebur128=peak=true -f null -`.
- Fade the last 1.2 s.

## Storytelling with sound

- Problem: sparse, a ticking clock or room tone, muted drums.
- Solution: full groove, clean UI clicks on cursor presses.
- Payoff: the riser and impact land exactly on the result.
- End: one impact on the logo, then silence or the reverb tail.

## Derive the hits table from the animation

For UI-style films with many micro-hits, do not hand-place sound events. Compute the contact frame of each spring, the 50 percent frame of each pop-in and the velocity peak of each whip from the **same constants and spring functions the picture uses**, and export them as the cue list; `inspect.mjs sync` then verifies it. Retiming the animation retimes the sound. Helper: see `studio/src/lib/Sfx.tsx`. For narrated films the voice leads and the hand-authored hits table stays the source.
Distance sound (only when a scene depicts distance): delay by distance at 343 m/s, low-pass and pan by position.
Why: sound sync becomes a property of the code. Evidence: cue-export design documented with sync-audit tolerances; the historical-film example is unseen (F-A8).

## Music-led films: beat map, drop anchor, loop seam

- Fix BPM and total beats; start the song a stated number of beats before its drop; write the structure as beat ranges; zoom or reveal lands on the drop; a quiet breakdown carries the hold scene. Show the beat map before building.
- "Something happens on every beat" means no dead time, not constant motion: the page never empties, and not every beat moves the whole picture.
- **Loops:** the last frame equals the first, including cursor position **and** cursor speed; accent, cursor and type identical in first and last frame. The opening word returns on the beat when the loop restarts.
Why: sync as a property of the plan; the loop checklist adds cursor speed to the "re-set the opening word" learning. Evidence: stated in the prompts of films that were posted; seam quality not verified (F-B8, F-B9).

## Beat-grid acceptance (tracks you did not write)

- Fit a straight line to the detected beat times by least squares and report the residual; accept up to about 15 ms.
- Check half-time and double-time candidates by whether kicks land on whole beats; separate the drum stem for dense mixes.
- Classify onsets by band: kick drives impacts, snare drives swaps and flash cuts, hi-hat drives micro-motion density.
- Keep float seconds until the last step into frames; after rendering, measure cut error (target 3 frames or less).
- **Cap:** full-frame or camera-layer beat hits at most **3 per film**, at least 16 beats apart; the rest only on the hero element. Beat sync does not mean pulsing the whole picture.
Why: a complete grid-acceptance step we lacked, and a hard fix for beat-frequency jitter. Evidence: documented; one 70 s film reported all cuts within 2.2 frames (author's measurement), the cap came from a user complaint (F-A9). Our own `music.mjs` grid is exact by construction; use this for imported tracks.

## Silence and restraint

SFX only on structural moments (transition, main reveal, payoff, logo). Recipes, each an alternative to adding sound:

- One soft sound per text fragment, near-silence while it is read, a big hit only for the one reveal. No pitch climbing in a stacked lockup.
- **Spotlight a claim with silence:** cut a statement card 3 to 12 frames into a 12 to 24 frame hole in the music and bring the beat back about 17 frames later; or drop bass and kick for 2 to 4 beats and land the next visual event on the returning downbeat. Mute the sub 12 to 18 frames before the hardest cut and release it on the cut.
- A calm film can be mastered effects-only at about -18 LUFS (below the -14 web target on purpose; say so in the report).
Why: a concrete alternative to "add more SFX", which is how films get busy. Evidence: documented with a warning rule in the author's score script; the underlying measurements are theirs (F-A15, F-C5).

## Voice over music, per phrase

After the mix, check each phrase: voice about 9 dB above music between 300 Hz and 4 kHz. The single sidechain stays; try a 3-band duck only if a mix sounds muddy (author's figures: lows 30, mids 85, air 55 percent, 0.3 s hold, 50 ms look-ahead, 0.5 s release; untested here).
Why: measurable, replaces "ducking audible but not pumping" by ear. Evidence: precise in a finished film's prompt (F-B11).

## Visual lead (to be A/B-tested, not a rule)

Viewers expect light before sound, so a caption or cut tied to a word may start a few frames before the word's onset. Candidate range 80 to 150 ms (2 to 5 frames at 30 fps), not the 250 ms one commenter suggested. Add a `lead` column to the hits table (default 0 for SFX, which are placed by peak; the existing word enter starts 60 ms before the word). Test once on the next narrated film: picture at onset versus onset minus 4 frames, choose on the phone sheet, then record the number in learnings.
Evidence: one comment, no demonstration (F-C3); matches how editors treat J-cuts.
