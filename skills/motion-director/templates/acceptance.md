# Acceptance criteria: <title>

Outcomes with thresholds, each checkable on a still, a strip or a measurement. The builder chooses the implementation values and reports which it picked. A change request cites the criteria it must satisfy.

| # | Scene | Criterion (measurable) | How it is checked |
|---|---|---|---|
| 1 | all | No text closer than <120> px to any edge; 9:16 keeps the top 220 and bottom 380 px free | still + `SafeArea` |
| 2 | 3 | The focal point is alone on screen for at least <45> frames | strip |
| 3 | all | Every fade is at least 0.3 s unless listed as an intended pop | frames |
| 4 | all | Type at or above the text floor (1.4 vw) | still |
| 5 | <transition> | Speed does not dip at the cut | `inspect.mjs flow` |
| 6 | whole film | At most 3 full-frame beat hits, 16 beats apart | hits table |

Vague words go in `glossary.md`, not here.
