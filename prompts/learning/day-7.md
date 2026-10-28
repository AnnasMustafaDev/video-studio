# Day 7 · Recreate a reference style

| | |
|---|---|
| **Purpose** | Practise art direction, iteration and QA by capturing a reference's principles in your own piece. |
| **Use when** | Day 7 of the 7-day plan. Main skill: art direction, iteration and QA. |
| **Stage** | Learning. `20-reference-analysis.md`, then the staged loop with at least two review rounds. |
| **Inputs you must fill in** | `[reference video or frames]`, `[your own subject]`, `[what to keep]`, `[what to change]`. |
| **Expected output** | The 10-point breakdown, an implementation plan, a 10 to 15 s piece in your own branding, two documented review rounds, a week retrospective, files in `learning/day-7/`. |
| **Next prompt** | `30-design-system.md` (promote the week's best pieces), then `70-post-mortem.md` for the whole week. |

## Prompt

```text
Learning day 7: recreate the style of a reference, not its content. The goal is art direction, iteration and QA.

Reference: [video or frames]. My subject: [subject]. Keep: [what to keep]. Change: [what to change].

1. Analyse the reference as a motion designer: composition and hierarchy; typography; palette, texture and lighting; movement of each major element; timing, pacing, easing and stagger; transitions and continuity; depth, camera and layering; sound and its relationship to visual events; which choices create the premium look; what Remotion can recreate and what needs external assets or tools. Separate observable facts from interpretations.
2. Write an implementation plan that captures the underlying principles with my subject, without copying branding, exact copy or characters.
3. Storyboard, build scene 1, review, then the rest one scene at a time.
4. Two full review rounds as a strict director. Each round: five worst defects with frame numbers, the fixes applied, stills before and after. Compare the result with the reference frames side by side and list what is still different and whether it matters.
5. Week retrospective: across days 1 to 7, which prompts, components and habits should become defaults? Which components deserve a place in the shared library?
```

## Studio additions

```text
Extract reference frames with ffmpeg -i [ref.mp4] -vf fps=4 learning/day-7/ref/%04d.png and analyse those (Claude cannot watch video directly). Composition Day7Style in studio/src/videos/day-7/. Stills: npm run stills -- Day7Style [frames]. Save the breakdown, plan, storyboard, both reviews and the retrospective to learning/day-7/. Append technique-only lessons to skills/motion-studio/references/learnings.md. If you could not view the stills, say so.
```
