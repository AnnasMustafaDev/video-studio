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
