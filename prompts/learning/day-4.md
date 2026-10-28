# Day 4 · Data visualization

| | |
|---|---|
| **Purpose** | Practise visual hierarchy and information design by animating one real insight. |
| **Use when** | Day 4 of the 7-day plan. Main skill: visual hierarchy and information design. |
| **Stage** | Learning. A short run of `62-data-visualization.md`. |
| **Inputs you must fill in** | `[small real dataset, 3 to 8 values]`, `[source]`, `[the insight]`. |
| **Expected output** | Insight headline, chart choice, a 10 to 12 s reveal, a muted-vs-accent comparison, files in `learning/day-4/`. |
| **Next prompt** | `13-quality-review.md`, `70-post-mortem.md` (short), then `day-5.md`. |

## Prompt

```text
Learning day 4: a data visualization, 10 to 12 seconds, 16:9, 30 fps. The goal is visual hierarchy and information design.

Data: [3 to 8 real values with labels and units]. Source: [source]. Insight: [insight].

1. Write the insight as a headline of at most 8 words. Choose the chart form and justify it in one sentence.
2. Reveal: context first (baseline, labels), then data (bars grow from zero, counters land on the true value), then the highlight (insight in the accent colour, the rest muted), then a 2 s hold on the conclusion with the source line visible.
3. Build two versions of the final frame: (a) every bar the same colour, (b) one accent bar and the rest muted. Render both and explain what the eye does in each.
4. Render stills at the end of each reveal step and compare every displayed number with the data.
5. Teach me: three hierarchy tools you used (size, colour, position, motion order) and where.
```

## Studio additions

```text
Composition Day4Data in studio/src/videos/day-4/, data in studio/src/videos/day-4/data.ts. Stills: npm run stills -- Day4Data [frames]. Save brief, prompt, storyboard and notes to learning/day-4/. If you could not view the stills, say so.
```
