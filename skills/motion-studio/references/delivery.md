# Final delivery (Phase 5)

Only after the user approved the cut in the HTML player and the last review round said READY (or the user accepted the open defects).

## 1. Render, mix, mux, subtitles

```
node tools/render.mjs video out/work/v.mp4 blur=4
node tools/mix.mjs
ffmpeg -i out/work/v.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/<Name>_<lang>_1080p60.mp4
node tools/srt.mjs
```

Each extra format is its own stage and render, never a crop of the master ([formats.md](formats.md)). Copy finals to `projects/<slug>/out/` if the film folder lives elsewhere.

## 2. Verify the encoded file, not the stills

`$R` = `~/.claude/skills/motion-review`:

```
node $R/tools/inspect.mjs probe out/<file>.mp4 --expect 1920x1080@60 --duration <s> --loudness
node $R/tools/inspect.mjs sheet out/<file>.mp4
node $R/tools/inspect.mjs sync out/<file>.mp4 build/comp_timing.json
node $R/tools/inspect.mjs poster out/<file>.mp4 <t of the end card or hook>
```

Open `encoded_first.png`, `encoded_last.png`, the final sheet and `poster.png`. Every probe check passes (resolution, fps, duration, yuv420p, audio, -14 LUFS ±1, ≤ -1 dBTP) or the exception is explained.

## 3. Delivery report (to the user and `projects/<slug>/notes.md`)

- Output files with absolute paths, and for each: duration, resolution, frame rate, size.
- Poster frame, final contact sheet, SRT files.
- Assets and fonts used, with source and licence; voice (engine and voice id); music (synthesised in code or source).
- Missing assets or licensing concerns.
- What is illustrative versus real data.
- What QA was performed: review rounds and last scores, sheets and strips looked at, probe and sync results.
- Remaining limitations, named concretely; "not visually verified" where that is the truth.
- What you would improve next (the review's open defects).

## 4. Learn

Append technique-only lessons (no client, product or app names) to [learnings.md](learnings.md) in the repo copy (`<VS>/skills/motion-studio/references/learnings.md`), then `node <VS>/tools/install-skills.mjs`.
