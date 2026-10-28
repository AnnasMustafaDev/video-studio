# Gotchas catalogue

Failure-derived checks. Each line: rule, why, and the evidence level. Read before the first draft; the reviewer and `qa.md` use the same list. External sources are credited in `learnings.md`.

## Render and layout

| Rule | Why (evidence) |
|---|---|
| Fast moves (flood, wipe, drag, whip) render **8 motion-blur subframes**, with a shutter below 360 degrees (about 0.7 of a frame). 4 stays the default elsewhere. If ghost steps remain, slow the move instead. | 4 subframes leave ghost copies on fast moves; two authors found it independently (claimed in three prompts, not measured on our output). Check by zooming a fast-move frame pair. |
| No `will-change` on anything the camera scales. | Blurry scaled text (failure-derived, already in our rules; corroborated). |
| A child set `visibility: visible` shows through a hidden parent; use `visibility: inherit`. | Layers appear during a hand-off (failure-derived). |
| A flood needs 0.3 to 0.35 s and must overscale past all corners; give every layer an explicit z-index so cards never float above it. | Half the screen changes in one frame otherwise (we hit this ourselves). |
| Typed text sits on fixed lines (layout locked, see design.md "Typed text") so the camera never follows a wrapping cursor. | Camera lurches on line wraps (failure-derived). |
| Text that swaps inside a morphing shape gets its own mask and its own enter and exit timing. | Old and new text overlap otherwise (already in motion.md; corroborated). |
| A fade shorter than 0.3 s reads as a pop (0.05 s certainly does). Fade at least 0.3 s unless the pop is the intent. | Failure-derived, from finished films. |
| A highlight box behind a word reads like a Windows text selection. Use colour, weight or an underline rule. | Failure-derived. |
| Start each scene at the zoom the previous one ended on; a camera that resets to 1.0 at a hand-off snaps. | We already hit this (camera reset). |
| Fade a card out into the haze or background colour before cutting it to transparent; fading through transparency shows what is behind. | Failure-derived (fly-over prompt). |
| Loop footage is re-encoded all-intra (`-g 1`) and seeked by blob URL when the server cannot range-seek. | Failure-derived. |

## Frame arithmetic traps (frame-driven animation)

Evidence: failure-derived, real rework in a 44-shot explainer (F-A14); all apply to Remotion and the HTML engine.

- A fade-in that returns 0 at frame 0 leaves the first frame of a shot empty. Start soft at 25 to 57 percent opacity, or start on a settled frame.
- A faded exit that ends at 40 to 57 percent opacity pops at a hard cut. Finish the fade (an ease like `1 - (n/N)^1.5`) or end on a full cut frame.
- First elements of a shot start on the shot's first frame, not when the caption starts; otherwise an empty beat opens each group.
- An element rendered twice (one steady, one glitching) hides the effect behind the steady copy.
- Do not wrap an already ramping component in a second fade.
- A keyframe table starts with the off-screen value at shot start, or the element parks on screen early.
- A slide-in from below that travels more than about 120 px crosses the caption band.
- Freeze the words before hard-coding frame numbers; changed words shift every number after them (see voice.md).
- Check how many frames the last beat has left before giving it a long animation.

## Taste precedents (each came from a rework round)

Evidence: first-hand rules from one author's product-video projects (F-A12); each rule cites a rework.

- Hold a brand wordmark a full second.
- Batch entrances accelerate; they never move at constant speed. End the batch with a half-second rest.
- First drafts are almost always too fast: default one notch slower, then judge.
- No handheld shake in bright UI films.
- At most one sheen or glint per hero element, clipped to its corner radius.
- Sharp text in 3D perspective needs high-resolution rasterising (layout-level zoom), never depth of field as the fix (see three-d.md).
- No small source or disclaimer text on the last beat; if it must be there it needs 2.5 s or more at half opacity or higher.
