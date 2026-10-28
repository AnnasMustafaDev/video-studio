# 11 · Storyboard

| | |
|---|---|
| **Purpose** | Turn the chosen direction into a timed, frame-specific storyboard with a narrative arc. |
| **Use when** | A direction is chosen (from `10`, `20` or your own brief). |
| **Stage** | Staged prompt 2 of 4. Script and storyboard. |
| **Inputs you must fill in** | Which direction was chosen (name it, or paste it), any changes you want to it. |
| **Expected output** | A scene table: timestamps, purpose, first frame, final frame, focal point, exact text, animation, easing, transition, audio cues, link to the next scene, plus flags on repetitive scenes. |
| **Next prompt** | Approve or edit, then `12-build-one-scene.md`. |

Source: notes §6, prompt 2, verbatim.

## Prompt

```text
Turn the chosen direction into a storyboard with timestamps and a clear narrative arc. For every scene, specify the first frame, final frame, focal point, exact text, animation, easing, transition, and audio cues. Include the purpose of each scene and how it connects to the next. Flag any scene that is visually repetitive.
```

## Studio additions

```text
Chosen direction: [direction name or paste]. Changes: [changes].
Give timings in seconds and in frames at [fps] fps. Scene durations must add up exactly to the composition length, accounting for transition overlaps (TransitionSeries overlaps shorten the total).
Holds: any number or call to action stays still for at least 1.5 to 2 s. On-screen text: at most 5 words per beat unless the scene is a title.
Add a column "stills to check" with 2 to 4 frame numbers per scene (settled state, transition midpoint, last frame); prompt 13 will use them.
Write it to projects/[yyyy-mm-dd]-[slug]/storyboard.md as a Markdown table. No code yet.
```
