# Day 1 · 5-second animated title

| | |
|---|---|
| **Purpose** | Practise typography and composition on the smallest possible piece: one title, five seconds. |
| **Use when** | Day 1 of the 7-day plan (notes §10). Main skill: typography and composition. |
| **Stage** | Learning. Runs a mini version of the full loop: direction, build, review. |
| **Inputs you must fill in** | `[title text]`, `[subtitle text]`, `[mood]`. |
| **Expected output** | Three static layouts to compare, one animated 5 s title, stills, a short critique, files in `learning/day-1/`. |
| **Next prompt** | `13-quality-review.md` once, then `70-post-mortem.md` (short), then `day-2.md`. |

## Prompt

```text
Learning day 1: a 5-second animated title. The goal is typography and composition, not effects.

Title: "[title text]". Subtitle: "[subtitle text]". Mood: [mood]. Format 16:9 1920x1080, 30 fps, 150 frames.

1. Before any animation, design three static end-frame layouts that differ in composition (for example: centred stack, left-aligned with large negative space, asymmetric with a rule line). For each give typeface, weights, sizes, tracking, line breaks, alignment, margins, and explain the hierarchy in one sentence. Render each as a still and show me. I will pick one.
2. Animate the chosen layout with at most two moves: the title enters (masked reveal or rise with ease-out, name the curve and frames) and the subtitle follows with a stagger. Hold the final layout still for at least 2 s. Background static.
3. Render stills at frames 0, 15, 30, 45, 75 and 149 and inspect them. Then critique your own result in five lines: hierarchy, spacing, alignment, type choice, timing.
4. Teach me: name the two typography decisions that mattered most in this piece and why.
```

## Studio additions

```text
Composition id Day1Title in studio/src/videos/day-1/, registered in Root.tsx, tokens from studio/src/lib/tokens.ts. Stills: npm run stills -- Day1Title 0,15,30,45,75,149. Save the brief, this prompt, the three layout options and notes to learning/day-1/ (brief.md, prompt.md, storyboard.md, notes.md). If you could not view the stills, say so.
```
