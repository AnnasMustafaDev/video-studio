# 53 · Final render and delivery report

| | |
|---|---|
| **Purpose** | Render the approved video at spec, verify the files, and write the Phase 5 delivery report. |
| **Use when** | You approved the cut (picture, sound, captions, formats). Only then. |
| **Stage** | Final delivery (master phase 5). |
| **Inputs you must fill in** | `[CompId(s)]`, `[resolution]`, `[fps]`, `[codec/container, default H.264 MP4]`, `[loudness target]`, `[output names]`. |
| **Expected output** | Final files in `projects/<date>-<slug>/out/`, ffprobe and loudness measurements, a poster frame, and the delivery report covering every Phase 5 item. |
| **Next prompt** | `31-componentize-project.md`, then `70-post-mortem.md`. |

## Prompt

```text
Render the final version of [CompId(s)]. I approved the cut; do not change creative content now. If you find a defect, stop and tell me instead of fixing it silently.

Pre-flight (check and report each):
- Every scene reviewed on rendered frames, last review clean.
- Fonts load before frame 0; no fallback font visible on frame 0 or the final frame.
- All assets exist, aspect ratios preserved, none are placeholders.
- Composition duration equals the storyboard; final frame is the intended end card.
- Animation is deterministic (no timers, CSS transitions or unseeded random).

Render at [resolution], [fps] fps, [codec, default H.264, yuv420p, AAC audio], high quality (CRF around 15 to 18). Then:
- ffprobe the output: duration, resolution, frame rate, codec, pixel format, audio stream present.
- Measure loudness with ffmpeg ebur128; target [-14 LUFS integrated, true peak at or below -1 dBTP]. If off, apply loudnorm on the audio and remux without re-encoding the video.
- Spot-check the rendered file (not the preview): extract frames at each scene boundary and the final frame from the MP4 and look at them.
- Export a poster frame PNG (usually the end card or the strongest still).

Delivery report:
- The output file(s) and their location.
- Duration, resolution, and frame rate.
- Assets and fonts used.
- Any missing assets or licensing concerns.
- What was checked during quality assurance.
- Any remaining limitations.
Also list which visuals or numbers are illustrative rather than real, and the .srt files if any.
```

The six report bullets are the notes' Phase 5 list, verbatim.

## Studio additions

```text
Render from studio/: npx remotion render [CompId] ../projects/[yyyy-mm-dd]-[slug]/out/[slug]_[WxH]_[fps].mp4 --codec=h264 --crf=16 (repeat per format composition). Poster: npx remotion still [CompId] ../projects/[yyyy-mm-dd]-[slug]/out/[slug]_poster.png --frame=[frame]. Extract check frames from the MP4 with ffmpeg -ss [t] -i [file] -frames:v 1 [png] and look at them; if you could not view them, say so.
Write the report to projects/[yyyy-mm-dd]-[slug]/notes.md under "Delivery". out/ is gitignored; commit the code and the paper trail locally. Do not push.
```
