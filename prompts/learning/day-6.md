# Day 6 · Sound-designed version

| | |
|---|---|
| **Purpose** | Practise audio synchronization and pacing by sound-designing the day 5 teaser. |
| **Use when** | Day 6 of the 7-day plan. Main skill: audio synchronization and pacing. |
| **Stage** | Learning. A run of `50-sound-design.md` on Day5Teaser. |
| **Inputs you must fill in** | `[music file and licence, or "compose one"]`, `[SFX source]`. |
| **Expected output** | A cue sheet, music and SFX placed by peak, one picture tweak the sound revealed, a measured -14 LUFS mix, a silent vs sound comparison note, files in `learning/day-6/`. |
| **Next prompt** | `53-final-render-delivery.md` on the teaser, then `day-7.md`. |

## Prompt

```text
Learning day 6: sound-design the day 5 teaser (Day5Teaser). The goal is audio synchronization and pacing.

Music: [file and licence, or "compose a bed in code"]. SFX: [source, or "synthesise whoosh, pop, click with ffmpeg"].

1. Cue sheet: every visual hit that deserves sound (transitions, the reveal, the end card) with frame, sound, level and reason. Also mark one place where silence is stronger. Fewer cues are better. Show it to me first.
2. Music: sparse under the hook, a lift into the reveal, an impact on the reveal frame, a clean ending on the end card. Tell me where scene cuts and bar lines disagree, and propose moving cuts by a few frames to land on the beat. Apply only what I approve.
3. SFX placed by their peak on the visual hit, not by their start.
4. Mix to -14 LUFS integrated, true peak at or below -1 dBTP. Measure with ffmpeg ebur128 and report the numbers.
5. Render the teaser with sound. Write a short comparison: what the sound changed about the pacing and the feel compared with the silent day 5 version.
6. Teach me: what "place by peak", ducking, LUFS and true peak mean, in one line each.
```

## Studio additions

```text
Audio in studio/public/audio/day-5/, cue frames in studio/src/videos/day-5/cues.ts derived from scene starts. Measure: ffmpeg -i [mix.wav or mp4] -af ebur128=peak=true -f null -. Save the cue sheet, numbers and notes to learning/day-6/.
```
