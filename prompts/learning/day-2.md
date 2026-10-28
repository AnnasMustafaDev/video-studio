# Day 2 · Kinetic typography sequence

| | |
|---|---|
| **Purpose** | Practise timing, easing and stagger with a short type-only sequence. |
| **Use when** | Day 2 of the 7-day plan. Main skill: timing, easing and stagger. |
| **Stage** | Learning. Uses `63-kinetic-type-hook.md` principles with deliberate easing experiments. |
| **Inputs you must fill in** | `[a 10 to 15 word line]`, `[bpm or "no music"]`. |
| **Expected output** | A beat map, one sequence built three ways (linear, ease-out, spring), side-by-side stills, your pick with reasons, files in `learning/day-2/`. |
| **Next prompt** | `13-quality-review.md`, `70-post-mortem.md` (short), then `day-3.md`. |

## Prompt

```text
Learning day 2: a kinetic typography sequence, 8 to 10 seconds, 16:9, 30 fps. The goal is timing, easing and stagger.

Text: "[line of 10 to 15 words]". Rhythm: [bpm or "no music, natural reading pace"].

1. Beat map: split the text into 4 to 6 beats, one phrase each. Give frame ranges, the emphasis word per beat, and the hold before each exit. Reading time: at least 0.3 s per word on screen, plus 0.5 s.
2. Build the sequence three times as separate compositions, identical except for the motion curve: (a) linear interpolate, (b) ease-out cubic-bezier, name it, (c) spring with a named config and a subtle overshoot. Stagger words by a fixed number of frames; tell me the number.
3. Then vary the stagger only on version (c): 1, 3 and 6 frames per word. Render the same mid-reveal frame for each.
4. Render matching stills (same frames) for all versions and put them side by side. Describe the difference in feel in plain words, and which one you would ship and why.
5. Teach me: what overshoot, settle, stagger and hold look like in these stills, pointing at specific frames.
```

## Studio additions

```text
Compositions Day2Linear, Day2Ease, Day2Spring (and Day2Stagger1/3/6) in studio/src/videos/day-2/, sharing one staggered-text component from studio/src/lib/ with the curve as a prop. Stills via npm run stills -- [CompId] [frames]. Save brief, prompt, beat map and notes to learning/day-2/. If you could not view the stills, say so.
```
