# Day 5 · 15-second product teaser

| | |
|---|---|
| **Purpose** | Practise storyboarding and transitions: make 15 seconds feel like one coherent piece. |
| **Use when** | Day 5 of the 7-day plan. Main skill: storyboarding and transitions. |
| **Stage** | Learning. The full staged loop: `10`, `11`, `12`, `13`, `14`. |
| **Inputs you must fill in** | `[product or idea]`, `[the one thing to remember]`, `[CTA or end line]`. |
| **Expected output** | Three directions, a storyboard with motivated transitions, scenes built one at a time, a reviewed 15 s teaser (silent today; sound is day 6), files in `learning/day-5/`. |
| **Next prompt** | `day-6.md` (it adds sound to this teaser). |

## Prompt

```text
Learning day 5: a 15-second product teaser, 16:9, 30 fps (450 frames). The goal is storyboarding and transitions. Work in stages and stop after each one for my approval.

Product: [product]. Remember: [message]. End on: [CTA or end line].

Stage A: three genuinely different creative directions (visual language, palette, typography, pacing, transitions). Recommend one. No code.
Stage B: storyboard with 4 to 5 scenes: hook in the first 2 s, build, reveal, end card held 2 s. For every transition say which kind (match cut by shape, position, motion or idea; shared element; mask reveal; cut on a beat) and what motivates it. Flag any transition that is just decoration and replace it.
Stage C: build scene 1 only, render stills, fix issues.
Stage D: build the remaining scenes one at a time, checking each transition at its start, midpoint and end.
Stage E: review the whole teaser as a strict director: five worst defects, fix the top ones, re-render.

Teach me at the end: which transition worked best and why, and which scene felt weakest in the storyboard versus in the render.
```

## Studio additions

```text
Composition Day5Teaser in studio/src/videos/day-5/. Stills: npm run stills -- Day5Teaser [frames]. Keep it silent; leave audio for day 6. Save directions, storyboard, review and notes to learning/day-5/. If you could not view the stills, say so.
```
