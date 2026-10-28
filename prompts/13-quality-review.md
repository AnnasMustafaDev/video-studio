# 13 · Visual quality review

| | |
|---|---|
| **Purpose** | Run a strict director's review on rendered output, find the five worst defects, fix the biggest and re-render. |
| **Use when** | After every built scene, after a full assembly, and before the final render. Run it more than once. |
| **Stage** | Staged prompt 4 of 4. Preview, inspect and revise (master phase 4). |
| **Inputs you must fill in** | None in the original. Studio additions: `[CompId]`, `[frames or scene range]`. |
| **Expected output** | Ranked list of five defects with specific corrections, the highest-impact fixes implemented, a fresh render, and a before/after note. |
| **Next prompt** | More scenes: `14-build-next-scene.md`. A single stubborn problem: `15-fix-defect.md`. Everything built and clean: `50-sound-design.md`. |

Source: notes §6, prompt 4, verbatim.

## Prompt

```text
Act as a strict motion-design director reviewing the rendered output. Evaluate typography, hierarchy, spacing, timing, easing, transitions, visual consistency, pacing, and sound synchronization. Identify the five most consequential defects. Give specific corrections, then implement the highest-impact fixes and render again. Do not add new effects unless they solve a real problem.
```

## Studio additions

```text
Review [CompId], [frames or scene range]. Render stills first: npm run stills -- [CompId] [frames] (use the "stills to check" column in projects/[yyyy-mm-dd]-[slug]/storyboard.md, plus every scene boundary and the final frame). Judge the images, not the code. For timing and easing, also render 3 consecutive frames around each key move so you can see spacing.
Checklist on top of the prompt: no clipped or overflowing text; safe margins held; one focal point per frame; holds of 1.5 to 2 s on numbers and CTA; one accent colour, one type family; transitions fully cover the frame at their peak; no element pops in on a single frame; final frame is a clean end card.
For each defect give: frame number, what is wrong, why it matters, exact fix (values, not adjectives).
Append the review to projects/[yyyy-mm-dd]-[slug]/review.md with the date. If you could not view the images, say so instead of claiming the result was verified.
```
