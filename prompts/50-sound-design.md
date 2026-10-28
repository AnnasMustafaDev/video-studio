# 50 · Sound design pass

| | |
|---|---|
| **Purpose** | Add music, sound effects and voice-over balance so sound tells the story, synced to visual events and mixed to delivery loudness. |
| **Use when** | The picture is locked or nearly locked (all scenes built and reviewed). |
| **Stage** | Finishing, after `13` on the full film, before `51` and `53`. |
| **Inputs you must fill in** | `[CompId]`, `[music file or "compose/choose one"]` and its licence, `[VO file or none]`, `[mood and tempo]`, `[delivery: web/social -14 LUFS or presentation -16]`. |
| **Expected output** | A cue sheet (frame, sound, level, reason), audio wired into the composition, ducking under VO, a measured mix at the target loudness, and a list of every audio asset with its licence. |
| **Why this exists** | Cues derived from the same constants as the picture retime with it, and restraint (silence, a hit cap) fights busy mixes. Evidence: documented methods with stated tolerances (cinetic, shotcraft), the authors' own measurements; not verified by watching. Findings F-A8, F-A9, F-A15. |
| **Next prompt** | `51-captions-subtitles.md` if needed, else `53-final-render-delivery.md`. |

## Prompt

```text
Do a sound design pass on [CompId]. The picture is locked; do not change visual timing unless a sound cue proves a cut is badly placed, and then ask first.

1. Cue sheet first. Go through the storyboard and the actual composition and list every visual event that deserves sound: scene changes, the main reveal, impacts, clicks, counters landing, the end card. For each: frame, sound type (whoosh, impact, pop, click, tick, riser, swell, silence), level, and why. Fewer is better: transitions, interactions and the payoff. Silence is a choice; mark where it helps. Show me the cue sheet and wait.

2. Music bed: [music file or "propose options"], mood [mood], tempo [bpm]. Arrangement follows the story: sparse under the problem or question, lift into the payoff, an impact on the main reveal, a clean ending on the end card with a fade over the last 1 to 1.5 s or a natural tail. Prefer landing scene changes on bar lines; tell me where the music and the cuts disagree.

3. Sound effects: place each by its peak, not its start. If the whoosh peaks 0.4 s into the file, it starts 0.4 s before the visual hit. Click sounds lead the visual UI reaction by 80 to 150 ms. Keep SFX consistent in character across the film.

4. Voice-over: [VO file or none]. Duck the music under the voice (about -10 to -12 dB while speaking, 150 to 400 ms release so it does not pump). The voice must always be intelligible.

5. Mix and measure: target [-14 LUFS integrated, true peak at or below -1 dBTP] for web and social ([-16 LUFS] for presentations). Measure, do not guess: export the mix and run ffmpeg -i [mix.wav] -af ebur128=peak=true -f null - , and report integrated loudness, LRA and true peak. Normalise with loudnorm=I=-14:TP=-1:LRA=11 if needed.

6. Report every audio file used, its source and licence. Flag anything unlicensed or unclear.

7. Derive, do not hand-place: compute each cue frame from the same constants and spring functions the picture uses (the contact frame of a spring, the 50 percent frame of a pop-in, the velocity peak of a whip). Retime the animation and the sound retimes with it. Verify with the sync waveform check afterwards.
8. Restraint and silence: one soft sound per text fragment, near-silence while it is read, one big hit for the one reveal. Spotlight a key claim with a short dropout in the music (a few frames to half a second of hole, then the beat returns on the next visual event) instead of another effect. A calm film may be effects-only.
9. Beat-hit cap (music-led films): beat sync does not mean pulsing the whole picture. At most 3 full-frame or camera-layer impacts per film, at least 16 beats apart; every other hit lands on the hero element only.
10. Grid acceptance (track you did not write): fit a straight line to the detected beats, report the residual (accept up to about 15 ms), test half-time and double-time against where the kicks fall, keep float seconds until the last step into frames, and after render measure cut error (target 3 frames or less). Details in 75.

Use deterministic timing: all audio placement in frames, derived from the same constants as the visuals so cues move with the edit.
```

## Studio additions

```text
Audio files go in studio/public/audio/[slug]/. Use <Audio> inside <Sequence from={...}> for each cue, volume as a function of frame for ducking and fades (interpolate, clamped). Keep cue frames in a cues.ts next to the composition, derived from scene start constants.
Remotion does not normalise loudness: render the audio (npx remotion render [CompId] --codec=wav or extract from the MP4), measure with ffmpeg ebur128, then apply loudnorm on the final mux in 53.
If there is no licensed music, say so; the motion-studio skill can compose a bed in code (skills/motion-studio/references/audio.md) and synthesise whoosh, pop and click with ffmpeg.
Write the cue sheet and loudness numbers to projects/[yyyy-mm-dd]-[slug]/notes.md.
```

Sources: derived cues, silence recipes and the cap after Leonxlnx's cinetic (`sound.md`, `craft-rules.md`) and Vincentwei1021's video-shotcraft (`music-beat-sync.md`, `aesthetic-rules.md`). Our wording; the specific numbers are those authors' claims, so check them on the sync waveform.
