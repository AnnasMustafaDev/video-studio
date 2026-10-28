# 62 · Data visualization

| | |
|---|---|
| **Purpose** | Turn real data into an animated chart or data story where the animation reveals the insight, not decoration. |
| **Use when** | You have numbers (CSV, JSON, a table) and one point to make with them. |
| **Stage** | Planning prompt for this job type. Feeds `11`; then `12`, `13`, `14`. |
| **Inputs you must fill in** | `[data file or table]`, `[source and date of the data]`, `[the one insight]`, `[audience]`, `[format, length]`. |
| **Expected output** | Data check, the insight stated in one sentence, a chart choice with reason, a reveal sequence with timings, exact labels and source line, then a storyboard. |
| **Next prompt** | `11-storyboard.md`, then `12-build-one-scene.md`. |

## Prompt

```text
Plan an animated data visualization. Data: [file or table]. Source: [source, date]. The one insight: [insight]. Audience: [audience]. Format [format], length [N] s.

1. Check the data: units, totals, missing values, outliers, anything that looks wrong. Do not change values; report problems.
2. State the insight as a headline of at most 8 words, and the single comparison that proves it.
3. Choose the chart form for that comparison (bar for ranking, line for change over time, single big number for one value, part-to-whole only when parts sum to a meaningful total). Explain the choice in one sentence. Axes start at zero for bars. No 3D charts, no dual axes, no pie with more than 3 slices.
4. Reveal sequence: what appears first (context: axis, baseline, labels), then the data (bars grow from the baseline, lines draw left to right, numbers count up with the value they label), then the highlight (the insight's data point in the accent colour, everything else muted), then a hold of at least 2 s on the conclusion. Give timings in frames. Counters must land exactly on the true value and match the chart.
5. Text: exact labels, units, number formatting, and a source line on the same frame as the data ("Source: [source], [date]").
6. Hierarchy: one accent colour for the insight only; gridlines and secondary series quiet.

Do not write code yet.
```

## Studio additions

```text
Put the data in studio/src/videos/[slug]/data.ts (typed, the single source for chart and counters). Reuse chart and counter components from studio/src/lib/ if they exist; otherwise build them there with props. Format numbers with Intl.NumberFormat and a fixed locale so renders are identical. Check the final frame of every reveal with npm run stills -- [CompId] [frames] and compare displayed numbers against data.ts.
```
