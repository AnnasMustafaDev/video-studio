# 61 · Product UI demo from real screenshots

| | |
|---|---|
| **Purpose** | Animate a product walkthrough from real screenshots or recordings: framing, focus, cursor and transitions, without faking the UI. |
| **Use when** | You have an app (yours) and want a silent or music-only demo, feature highlight or launch clip in Remotion. If it is narrated with every cut on a word, use `60` instead. |
| **Stage** | Planning prompt for this job type. Replaces `10` and feeds `11`; then the normal loop `12`, `13`, `14`. |
| **Inputs you must fill in** | `[product]`, `[the feature or flow]`, `[screenshot/recording paths]`, `[the one thing to remember]`, `[CTA]`, `[format, length]`. |
| **Expected output** | An inventory of the screenshots with what each shows and its native size, a shot list (which screen, which region, camera move, cursor action, caption), a list of missing captures, then a storyboard. |
| **Next prompt** | `11-storyboard.md` (or approve the shot list as the storyboard), then `12-build-one-scene.md`. |

## Prompt

```text
Plan an animated product UI demo for [product], showing [feature or flow]. Real screenshots and recordings are in [paths]. Format [format], length [N] s. The viewer must remember: [message]. CTA: [one action, real URL].

1. Inventory: list each screenshot or recording, what state of the UI it shows, its pixel size, and whether it is sharp enough to zoom to 2x. Tell me which states are missing for the story and what I should capture (exact screen, state, viewport size, ideally 2x device scale).
2. Story: hook (a felt problem or a bold claim, not the logo), the flow in the order a real user does it, the result, CTA. One idea per beat, captions of at most 5 words.
3. Shot list per beat: which screenshot, which region is the focal point (in screenshot pixel coordinates), camera move (hold, push in, pull back, pan; one named move per shot, then hold), focus treatment (dim the rest, outline the region), cursor (appears, glides, clicks, the UI changes 80 to 150 ms after the press), caption text, transition to the next shot (shared element or cut on the click).
4. Rules: show the real UI flat and legible in a plain frame with one soft shadow. No invented UI, no tilted 3D slabs, no fake numbers; anything illustrative is listed as such. Never zoom in and straight back out. Keep the screenshot edge out of view during zooms.

Do not write code yet.
```

## Studio additions

```text
Screenshots go in studio/public/[slug]/ui/. Build the camera as keyframes (frame, scale, focusX, focusY) with holds between moves, interpolated in log space for scale; map region coordinates through the camera so outlines and cursor stay aligned at every zoom. Check alignment early with npm run stills -- [CompId] [frames at each zoom] and look at them.
For capturing my app, use my running local or test instance; I sign in myself.
```
