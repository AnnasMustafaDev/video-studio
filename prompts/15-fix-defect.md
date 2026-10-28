# 15 · Fix one specific defect

| | |
|---|---|
| **Purpose** | Fix one named visual problem (clipping, timing, easing, alignment, flicker) precisely, without collateral changes. |
| **Use when** | You or a review spotted a concrete defect at a known frame. Not for taste changes (use `16`). |
| **Stage** | Inspect and revise loop (master phase 4). |
| **Inputs you must fill in** | `[CompId]`, `[frame or frame range]`, `[defect type]`, `[what you see]`, `[what it should do instead]`. |
| **Expected output** | Root cause in one or two sentences, a minimal code change, before and after stills of the same frames, and confirmation nothing else moved. |
| **Why this exists** | Plotting a value over time found a root cause that five blind fixes missed. Evidence: one detailed first-hand production write-up (RapidEye), second source only corroborates; no film was watched by the analysts. Findings F-B5, F-A3. |
| **Next prompt** | Back to `13-quality-review.md`, or continue `14-build-next-scene.md`. |

## Prompt

```text
Fix one defect in [CompId]. Do not change anything else.

Defect: [clipping | overflow | timing | easing | alignment | flicker | pop-in | font | colour | other]
Where: frame(s) [frames], scene [scene], element [element]
What I see: [what you see]
What it should do: [target behaviour, with numbers where possible]

Steps:
0. Motion defects only (pause, snap, stall, kink, false overshoot): do not edit yet and do not try another variant. Sample the animated value of the element at every frame of the move, print value and velocity (per-frame difference), and show me the curve, marking any run of zero velocity inside the move. Name the cause from the plot. Typical cause: a wave or ease scoped to part of the lifetime instead of all of it.
1. Render the affected frames as they are now and describe exactly what is wrong in the image.
2. Find the root cause in code. State it in one or two sentences before editing.
3. Make the smallest change that fixes the cause, not the symptom. Do not resize fonts globally to fix one line, do not add effects to hide a problem.
4. Render the same frames again, plus one frame before and after the range, and compare.
5. Confirm no other scene changed. If a shared component or token changed, render one frame of every scene that uses it.

Defect-specific checks:
- Clipping or overflow: measure the text box against the safe area at the longest string; prefer rewrapping or reflowing over shrinking; check the frame where the element is largest (overshoot peak).
- Timing: give the old and new start frame, duration and hold in frames; keep the total duration and later scenes in sync.
- Easing: name the curve or spring config (damping, stiffness, mass) before and after; show three consecutive frames at the start, middle and end of the move so spacing is visible.
- Regression guard: after the fix run git diff --stat, name anything that changed outside this defect, and re-render the earlier approved stills of the same scene.
- Flicker or pop-in: look for values that are not clamped, conditional rendering on a single frame, non-deterministic values, or fonts and images not loaded before render.
```

## Studio additions

```text
Stills: npm run stills -- [CompId] [frames] in studio/. If you could not view them, say so. Log the defect and fix in one line in projects/[yyyy-mm-dd]-[slug]/review.md.
```

Sources: velocity-plot idea from Samuel Parks, RapidEye, "Building our launch video with Claude"; diff check after u/TheHol1day (r/ClaudeAI). Our wording.
