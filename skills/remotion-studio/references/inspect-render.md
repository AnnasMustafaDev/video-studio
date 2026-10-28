# Render, inspect, improve

Successful compilation is not proof of visual quality. Judge rendered frames.

`$R` = `~/.claude/skills/motion-review` (tools/inspect.mjs needs ffmpeg + ffprobe).

## 1. Choose frames that can fail

For each scene: first frame, every settled state, mid-transition frames, the densest text frame, the last frame. For the film: frame 0, each scene boundary (last frame of A, first of B, and the middle of the transition), every hit frame, the end card, and the final frame. Typically 8 to 20 frames for one scene, 20 to 40 for a film.

## 2. Render stills and the contact sheet

From `{{VIDEO_STUDIO}}\studio`:

```
npm run stills -- <CompId> 0,30,45,60,90,119
```

Writes the stills and a contact sheet to `studio/out/stills/<CompId>/`. Add phone-size pages (what a viewer sees on a phone at arm's length):

```
node $R/tools/inspect.mjs tile out/stills/<CompId>
```

## 3. Look, then fix

Open the contact sheet, the phone pages and any still that looks off at full size. Check: clipping and overflow, alignment and margins, inconsistent typography, text on busy backgrounds, focal point, flicker or discontinuity between neighbouring frames, wrong timing against the storyboard, the final frame. Fix what you see, re-render the same frames, look again.

Motion (easing, pacing, transitions) cannot be judged from scattered stills. Render a short draft of the section and use sheets and strips on it:

```
npx remotion render <CompId> out/draft/<CompId>.mp4 --frames=0-149 --scale=0.5
node $R/tools/inspect.mjs sheet out/draft/<CompId>.mp4 --every 0.25
node $R/tools/inspect.mjs strip out/draft/<CompId>.mp4 2.2 2.9 --n 8 --name cut1
```

## 4. Independent review round

Spawn a fresh reviewer (`~/.claude/skills/motion-review/agent.md`) with the stills folder, the draft video, `hits.json`, the storyboard and the round number. It appends the round to `projects/<slug>/review.md`: nine scores, top 5 defects with fixes, verdict.

Fix defects 1 to 3 at least, re-render the same frames, spawn a new reviewer. Stop rule (from motion-review): every score ≥ 8, no blocking check failed, ≥ 2 rounds (≥ 3 for > 30 s or showcase pieces). If the minimum score stalls for two rounds, or after 6 rounds, bring it to the user. Do not add new effects unless they solve a listed defect.

## 5. Honest reporting

- Say exactly what you looked at ("opened the contact sheet and phone pages for frames 0-119, strips for both transitions").
- If you could not view images (tool missing, render failed), write "not visually verified" in the reply and in `notes.md`, with what is missing. Never describe a frame you did not open.

## Speed tips

- `--scale=0.5` and `--frames=a-b` for drafts; full scale only for the final.
- Keep Remotion Studio (`npm run dev`) for the user's own scrubbing; your verification is stills and sheets.
- Re-render only frames affected by a fix plus their neighbours and the scene boundaries.

## Measured checks (research round)

- **Motion bug? Plot first.** When a move pauses, snaps or feels late, do not try another eased variant. Run `inspect.mjs plot` on the timing function (value and velocity over frames) and look for a zero-velocity run mid-move, kinks, false overshoot. Fix the cause, plot again. (Evidence: a first-hand write-up: five blind fixes failed, the plot showed 16 percent of the move at zero velocity.)
- **Camera and transitions:** `inspect.mjs flow` on a 30 fps draft: speed never dips, zoom does not reverse, speed continues across a velocity-matched cut. (Evidence: described in a prompt, results not shown.)
- **Rendered file:** `inspect.mjs forensics` for frozen stretches, one-frame pops, ghost frames and banding that sheets hide; declare designed moments (a planned freeze or flash cut) with a reason. (Evidence: three repos converged; one reported about 10 of 36 s frozen.) `inspect.mjs compare` against the golden scene's sheet gives the reviewer something to fall short of.
- **Ghost steps:** zoom into a fast-move frame pair; if steps remain, render 8 subframes or slow the move.
- **Review inputs:** hand the reviewer the film's banned list, glossary and acceptance criteria as well as the storyboard.
