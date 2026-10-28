# 53 · Final render and delivery report

| | |
|---|---|
| **Purpose** | Render the approved video at spec, verify the files, and write the Phase 5 delivery report. |
| **Use when** | You approved the cut (picture, sound, captions, formats). Only then. |
| **Stage** | Final delivery (master phase 5). |
| **Inputs you must fill in** | `[CompId(s)]`, `[resolution]`, `[fps]`, `[codec/container, default H.264 MP4]`, `[loudness target]`, `[output names]`. |
| **Expected output** | Final files in `projects/<date>-<slug>/out/`, ffprobe and loudness measurements, a poster frame, and the delivery report covering every Phase 5 item. |
| **Why this exists** | Contact sheets hide frozen stretches, one-frame pops and loop seams that measurement finds; embedding on a web page has its own failure set. Evidence: forensics reported to catch real defects in three public repos (not run by us); the embed list is one builder's first-hand debugging. Findings F-A1, F-C12. |
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
- Pixel forensics on the rendered MP4 (not the preview), with intent declared. List designed moments first (a flash cut, a planned freeze) with a reason each, then measure on a small copy (for example 320x180, mean grey change between frames): the longest dead stretch per shot (under about 0.35 counts as still) and the settle time before each exit; one-frame pops; ghost frames next to cuts; judder; banding in dark gradients; for loops, the pixel difference between the last and first frame. Report every flag as intended or defect. Do not fix silently.
- Export a poster frame PNG (usually the end card or the strongest still).

Delivery report:
- The output file(s) and their location.
- Duration, resolution, and frame rate.
- Assets and fonts used.
- Any missing assets or licensing concerns.
- What was checked during quality assurance.
- Any remaining limitations.
Also list which visuals or numbers are illustrative rather than real, and the .srt files if any.

Delivery checklist if the file goes on a web page: H.264 High profile, pixel format yuv420p, -movflags +faststart, muted playsinline autoplay, preload="metadata", server supports byte ranges, a new filename per export (browsers cache a failed load), -tune grain only if dark gradients band, and check the file size in the network panel against a budget. A black video in Safari is usually the pixel format, missing faststart or no range support, not the profile.
```

The six report bullets are the notes' Phase 5 list, verbatim.

## Studio additions

```text
Render from studio/: npx remotion render [CompId] ../projects/[yyyy-mm-dd]-[slug]/out/[slug]_[WxH]_[fps].mp4 --codec=h264 --crf=16 (repeat per format composition). Poster: npx remotion still [CompId] ../projects/[yyyy-mm-dd]-[slug]/out/[slug]_poster.png --frame=[frame]. Extract check frames from the MP4 with ffmpeg -ss [t] -i [file] -frames:v 1 [png] and look at them; if you could not view them, say so.
Write the report to projects/[yyyy-mm-dd]-[slug]/notes.md under "Delivery". out/ is gitignored; commit the code and the paper trail locally. Do not push.
```

Sources: forensics after Leonxlnx/cinetic, echris6/motion-video-kit and Vincentwei1021/anything2explainer; web-embed list after u/Vitalic7 (r/ClaudeAI) with the diagnosis corrected. Our wording.
