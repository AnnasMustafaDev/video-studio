# 10 · Creative directions

| | |
|---|---|
| **Purpose** | Get three genuinely different visual directions and a recommendation before any storyboard or code. |
| **Use when** | The look is not decided yet. Skip it when a reference (`20`) or the design system (`30`) already fixes the look. |
| **Stage** | Staged prompt 1 of 4. Creative direction. |
| **Inputs you must fill in** | `[topic]`, and edit the duration if it is not 20 seconds. Optional: brief, audience, platform, references. |
| **Expected output** | Three directions, each with visual language, palette, typography, pacing, animation style, transitions and audio direction, plus which is strongest and why. No code. |
| **Next prompt** | Pick one (or mix), then `11-storyboard.md`. |

Source: notes §6, prompt 1, verbatim.

## Prompt

```text
I want a 20-second premium motion-graphics video about [topic]. Generate three genuinely different creative directions. For each, describe the visual language, palette, typography, pacing, animation style, transitions, and audio direction. Explain which direction is strongest and why. Do not write code yet.
```

## Studio additions

```text
Format: [16:9 1920x1080 | 9:16 1080x1920 | 1:1 1080x1080], [30|60] fps. Audience: [audience]. The one thing to remember: [message].
"Genuinely different" means different composition logic and motion language, not three palettes on the same layout. At least one direction must stay inside the existing tokens in studio/src/lib/tokens.ts; say which. For each direction add: the hook in the first 2 seconds, one sentence on what could go wrong, and whether it needs assets Remotion cannot make (footage, 3D, photos).
Write the result to projects/[yyyy-mm-dd]-[slug]/directions.md.
```
