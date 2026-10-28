# Render, inspect, fix: the review loop

Do not treat a successful build or render as proof of quality. Judge the actual frames, and say so honestly when you could not.

`$R` = `~/.claude/skills/motion-review` (tools/inspect.mjs, needs ffmpeg).

## 1. Stills at the frames that can fail

`node tools/render.mjs preview <t1,t2,...>` writes `shots/preview_*.png` and `shots/preview_sheet.png`. Pick: frame 0, every settled state, mid-transition moments, the densest caption, every hit, scene boundaries, the end card, the last frame. Then phone-size pages:

```
node $R/tools/inspect.mjs tile shots
```

Open the sheet and the phone pages. Fix what is clipped, cramped, off-word, misaligned, unreadable at phone size, or where an overlay lags the camera. Re-render the same times. Look again.

## 2. Motion needs motion

Stills cannot show easing, pacing or transitions. For a section: `node tools/render.mjs video out/work/draft.mp4 blur=1 <from>-<to>` (fast, no motion blur), then:

```
node $R/tools/inspect.mjs sheet out/work/draft.mp4 --every 0.25
node $R/tools/inspect.mjs strip out/work/draft.mp4 <a> <b> --n 8 --name <cut>
```

A cut's first frame shows the new image, never a blank or flash; a flood covers all corners at its peak; a whip shows both shots.

## 3. Sound against picture

After `node tools/mix.mjs` and a mux of the draft: `node $R/tools/inspect.mjs sync <draft-with-audio.mp4> build/comp_timing.json` reports each SFX cue's offset (±40 ms passes) and draws `sync_wave.png`. The cue list in `main.js` mirrors the storyboard's hits table; nothing else adds SFX, so sound cannot drift from picture.

## 4. Scored rounds with a stop rule

Spawn a fresh reviewer per round (`$R/agent.md`). It scores typography, hierarchy, spacing, timing, easing, transitions, consistency, pacing and sound sync 1 to 10 with frame evidence, lists the top 5 defects with concrete fixes and a verdict, and appends to `projects/<slug>/review.md`.

- Fix defects 1 to 3 at least; re-render; new reviewer, next round.
- **READY:** every judged score ≥ 8, no blocking check failed, ≥ 2 rounds (≥ 3 for films over 30 s or showcase pieces).
- **Ask the user** when the minimum score stalls for two rounds or after 6 rounds: that is a direction problem, not polish.
- No new effects unless they fix a listed defect.

## 5. Honest reporting

State what you looked at. If images could not be viewed or the render failed, write "not visually verified" in the reply and in `notes.md`, with the reason and the commands that would produce the evidence.
