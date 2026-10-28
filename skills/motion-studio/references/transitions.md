# Transitions: "X becomes Y", velocity handoff, hidden cuts

Complements the table in [motion.md](motion.md). Components: see `studio/src/lib/transitions.tsx` (Remotion); the HTML engine writes the recipe by hand. Numbers below come from the authors' frame measurements of other films and were tuned on placeholder material: they are starting points, not laws.

## 1. Every scene is made out of the previous one

Rule: the storyboard's transition column never says "cut" or "fade". It says **"X becomes Y"**: the outgoing object, what it carries (label, words, colour, position), the incoming object.
Why: naming the shared element is what removes the crossfade default, and it is checkable on a contact sheet (does frame N-1 contain the thing frame N grows from?). Evidence: shown in two finished films (F-B3); our showreel inspiration already adopted it.
Scope: strict for UI and product pieces. For type pieces a hard cut onto a page that is already set is still fine (learnings): then the column says "hard cut, page already set" and the cut sits on a beat.

Morph vocabulary (write these in the column):

| Name | What happens |
|---|---|
| Iris | A circle clip opens or closes on the element the viewer was looking at |
| Flood and contract | A solid shape floods past all corners (0.3 to 0.35 s), then contracts into the next scene's first element |
| Accordion squeeze | Panels fold to a line or strip, and the line is the next scene's rule or bar |
| Line carry | A rule leaves the frame and the camera follows it; it turns corners and draws the next card (section 3D) |
| Bezel or mat grows | A device bezel grows out of the screen edge, or a mat grows from the photo edge, into the next surface |
| Text rises from a mask line | The next caption starts as the line the previous one sat on |
| Label carry | A button carries its label into the next page's heading |

## 2. Velocity-matched cut

The outgoing shot accelerates one way and is cut at its fastest frame; the incoming shot starts already moving the same way and brakes to rest, so momentum crosses the edit.
Why: it turns "smooth transition" into numbers and explains why some dissolve-free cuts feel dead. Evidence: doc-level, numbers are the author's measurement at 60 fps (F-A6).

| Parameter | Value (at 60 fps; scale by 60/fps for px per frame) |
|---|---|
| Exit | speeds up about 1.1x to 1.2x per frame over the last 16 to 24 frames, ends at 25 to 40 px/frame, never above 60 |
| Entry | starts at 30 to 55 px/frame, decays about 0.92 to 0.94 per frame |
| Text on a moving shot | under 20 px/frame by the time it is read |
| Motion blur | the cut is an act boundary: subframes never straddle it |

Companion rule: a hard cut works when subject, scale, direction and material continue across it. Helper: see `studio/src/lib/transitions.tsx` (velocity-matched cut) and `studio/src/lib/motion.ts`; check the result with `inspect.mjs flow` (speed must not dip at the cut) and `inspect.mjs plot` for a single value.

## 3. Hidden-cut and no-cut recipes

Why: each carries a cause before the cut and a result after, and the failure modes are written down. Evidence: doc-level cards (F-A7); re-skin to our tokens (no source brand colours, one accent).

**A. Occluder cut.** A soft, out-of-focus foreground object sweeps across; the hard cut happens inside the frames where it covers the screen. About 28 px of drag before, a settle after, so it reads as one take.

**B. Impact slam (comparison moments only).** Two half-screens with a slanted seam collide: white flash 3 frames, screen shake about 16 px decaying over about 5 frames, a stamp, **all on the same frame** (a one-frame offset scatters it). Counts against the film's cap of 3 full-frame beat hits (audio.md).

**C. Light-leak burn.** A diagonal wash of light ramps up slowly (ease-in), the cut hides at the peak, it recedes faster. The old picture must also wash out (brightness up, contrast down) or the leak reads as a sticker. Studio fit: tint the wash with the accent or a warm tint of the brand neutral, no flare streaks, no glow clichés; if it is not clearly better than a plain flood, use the flood.

**D. Line carry (no cut at all).** A progress bar extends out of frame, the camera follows the line, the line turns corners and draws the next scene's card frame. Pin the pen tip near x = 1480 (at 1920 wide) so it never leaves the frame or lags.

## Banned, unchanged

Cross-dissolves between unrelated shots, wipes and star transitions, zooming in and straight back out. A hard cut still needs a page that is already set.
