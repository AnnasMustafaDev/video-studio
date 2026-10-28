# 14 · Build the next scene

| | |
|---|---|
| **Purpose** | Build the remaining scenes one at a time, each matching scene 1's quality bar and connecting cleanly to the scene before. |
| **Use when** | Scene 1 (or the previous scene) passed `13-quality-review.md`. Repeat once per scene. |
| **Stage** | Implementation, scenes 2..N. |
| **Inputs you must fill in** | `[N]` scene number, `[slug]`, `[CompId]`, optional `[notes from the last review]`. |
| **Expected output** | Scene N built, the transition from N-1 into N working, stills of the boundary inspected, earlier scenes unchanged unless a shared component improved. |
| **Next prompt** | `13-quality-review.md` on scene N. After the last scene: `13` on the whole film, then `50-sound-design.md`. |

## Prompt

```text
Implement only scene [N] of the approved storyboard in Remotion. Scenes 1 to [N-1] are approved; treat them as the quality and style reference and do not change them unless a shared component needs a fix, in which case tell me what changed and re-check the affected scenes.

Before coding, restate scene [N] from the storyboard: first frame, final frame, focal point, exact text, animation, easing, transition in and out, audio cues. Then check the hand-off: the last frame of scene [N-1] and the first frame of scene [N] must connect as the storyboard says (match cut, shared element, cut on a beat). If the storyboard's transition no longer makes sense given how scene [N-1] turned out, propose a fix before building.

Reuse existing components and tokens. Keep the scene visually distinct from the previous one but stylistically consistent. Deterministic, frame-based animation only.

Render representative frames of scene [N], including the transition from scene [N-1] at its start, midpoint and end, and the settled state of scene [N]. Inspect the actual output and fix visible issues. Notes from the last review to carry forward: [notes].

Do not build scene [N+1] yet.
```

## Studio additions

```text
Files: studio/src/videos/[slug]/scenes/Scene[NN].tsx, wired into studio/src/videos/[slug]/[Name].tsx. Total duration in Root.tsx must still equal the storyboard length.
Stills: npm run stills -- [CompId] [boundary frames and settled frames from storyboard.md]. If you could not view them, say so.
Update projects/[yyyy-mm-dd]-[slug]/storyboard.md if timings moved.
```
