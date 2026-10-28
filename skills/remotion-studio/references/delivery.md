# Final delivery

## 1. Render

From `C:\Users\Annas Mustafa\Documents\me\video-studio\studio`, at the brief's resolution and fps (they come from the composition registration):

```
npx remotion render <CompId> ../projects/<yyyy-mm-dd>-<slug>/out/<slug>_<h>p<fps>.mp4 --codec=h264 --crf=16
```

One render per format composition (`<CompId>916` etc.). Run long renders in the background. Check the official rendering guide for current flags.

## 2. Loudness (when there is audio)

Target -14 LUFS integrated, ≤ -1 dBTP for web and social (-16 for presentations). Measure and, if needed, normalise without touching the picture:

```
node ~/.claude/skills/motion-review/tools/inspect.mjs probe <file.mp4> --loudness
ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 256k -movflags +faststart out.mp4
```

## 3. Verify the encoded file (not the stills)

```
node ~/.claude/skills/motion-review/tools/inspect.mjs probe <file.mp4> --expect 1920x1080@30 --duration 15 --loudness
node ~/.claude/skills/motion-review/tools/inspect.mjs sheet <file.mp4>
node ~/.claude/skills/motion-review/tools/inspect.mjs sync <file.mp4> <hits.json>
node ~/.claude/skills/motion-review/tools/inspect.mjs poster <file.mp4> <t of the best frame, usually the end card or hook>
```

Open `encoded_first.png`, `encoded_last.png`, the final contact sheet and the poster. Every check in the probe output must pass (or be explained, e.g. a deliberately silent video).

## 4. Delivery report (write to `projects/<slug>/notes.md` and give it to the user)

```markdown
# Delivery: <title>, <date>

Files
- <absolute path to each mp4>  (<w>×<h>, <fps> fps, <duration> s, <size> MB)
- Poster: <path> · Contact sheet: <path> · Stills: studio/out/stills/<CompId>/

Composition: <CompId> in studio/src/videos/<slug>/ (registered in studio/src/Root.tsx)

Assets and fonts used: <font families + source/licence>, <images/footage/music/SFX + source/licence>
Missing assets or licensing concerns: <none / list>
Illustrative (not real data): <list or none>

QA performed
- Rounds: <n>; last scores <row>; verdict <READY / stopped at user request>
- Looked at: <sheets, phone pages, strips, encoded first/last frame>
- Probe: resolution / fps / duration / yuv420p / audio / loudness: <pass or values>
- Sync: <hits within ±40 ms / exceptions>

Remaining limitations: <concrete defects still open, or "not visually verified: <reason>">
Next improvements I would make: <the review's open defects, concrete>
```

## 5. Learnings

Append technique-only lessons (no client, product or app names) to `C:\Users\Annas Mustafa\Documents\me\video-studio\skills\motion-studio\references\learnings.md` under the right heading, then re-run `node C:\Users\Annas Mustafa\Documents\me\video-studio\tools\install-skills.mjs` so the installed skills carry them. If a component proved itself, propose adding it to `studio/src/lib/` and `DESIGN_SYSTEM.md`.
