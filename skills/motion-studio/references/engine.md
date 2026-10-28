# Engine: composition, live player, renderer

## Project layout (created by `tools/new-project.mjs`)

```
<project>/
  script.json            lines (id, scene, text, de), voice, bpm, scene plan, music
  comp/index.html        the stage (1920×1080) + the review bar
  comp/style.css         tokens, layout
  comp/engine.js         time helpers, captions, camera, spotlight, cursor, player
  comp/main.js           THE composition: frame(t)
  tools/                 vo.py, words.py, timeline.mjs, music.mjs, serve.mjs, render.mjs, mix.mjs, srt.mjs
  audio/vo/*.wav         one clip per line (+ durations.json, words.json)
  audio/music.wav, audio/mix.wav
  build/timeline.json    lines at beat-grid times with absolute word times
  assets/                screenshots, logos, documents
  footage/               recorded frames + frames.json [{file, t}]
  shots/                 preview stills and contact sheets
  out/                   final MP4 and SRT
```

## The contract

- `frame(t)` sets every style from `t` alone. No CSS transitions, no timers, no state between frames.
- `window.__seek(t)` awaits image decodes and draws `t` (renderer). `window.__timing` exposes `{fps, duration, sfx, lines}` for the mixer.
- `?render=1` hides the review bar; `?subs=de` turns on subtitles; `?t=12.5` opens at a time.
- Kinetic type runs on **one paused GSAP timeline** (`master`) with a label per voice line; `frame(t)` calls `master.time(t, true)` first. Procedural parts (camera, spotlight, cursor, footage) are computed right after.

## Timing helpers

```js
S('scene', o)  // scene start + o        E('scene', o)  // scene end + o
L('line', o)   // line start + o         LE('line', o)  // line end + o
W('line', i)   // start of spoken word i; throws if the word does not exist
```

`W` throwing is deliberate: when the voice is re-recorded, a missing word fails loudly instead of silently mistiming the edit. Without word times (draft before the voice exists), the engine estimates them evenly across the line.

## The live review loop (do this instead of rendering MP4s)

1. `node tools/serve.mjs` (default port 5199) serves only the project folders the page needs, with HTTP range support for audio.
2. Open `http://127.0.0.1:5199/comp/index.html`. Play / Space, scrub bar, time readout, subtitle toggle. The bar drives `frame()` from `audio.currentTime` of `audio/mix.wav` (falls back to `music.wav`, then a silent clock).
3. The user reviews, asks for changes; you edit and they reload. Only the approved cut is rendered.
4. For your own QA use stills: `node tools/render.mjs preview 0,4.2,13.1,...` writes `shots/preview_*.png` and `shots/preview_sheet.png` (3 columns). Pick each settled state plus mid-transition moments, and look at every sheet.

The stage is 1920×1080 and is scaled to fit the window with `translate(-50%,-50%) scale(k)` on an absolutely centred stage (grid centring overflows to the right for oversized children).

## Rendering

`node tools/render.mjs video out/work/v.mp4 blur=4 fps=60 [from-to] [subs=de]`

- Headless Edge/Chromium via playwright-core, screenshot per subframe piped as JPEG into ffmpeg (`image2pipe`, `libx264 -crf 15 -preset slow -pix_fmt yuv420p`).
- 4 subframes at 60 fps for a 68 s film: about 12 minutes on a laptop. Run it in the background.
- WebGL in headless Edge: add `--use-angle=d3d11 --ignore-gpu-blocklist` and `preserveDrawingBuffer: true`.
- The renderer writes `build/comp_timing.json` (sfx cues, line times) for the mixer.

Then: `node tools/mix.mjs` (music + VO + SFX, ducked, -14 LUFS) and mux:
`ffmpeg -i v.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/name.mp4`

## Footage inside the composition

- Store screen recordings as numbered JPEG frames + `frames.json` (`[{file, t}]`, source seconds).
- Time-remap per segment `[outStart, outEnd, srcStart, srcEnd]` so the typing, the send click and the result land on the voice; binary-search the frame for the source time.
- Warm the cache on load (create `Image()` objects for every frame the segments use) so live playback does not stutter.
- Swap stills for states the recording doesn't hold cleanly (a modal, a final result).

## Windows notes

- PowerShell 5.1 mangles UTF-8; write files from Node or Python, not `Set-Content`.
- Smart App Control may block bundled ffmpeg; use the system ffmpeg.
- Long bash heredocs with backticks and quotes can break; write edit scripts to a file and run them.
