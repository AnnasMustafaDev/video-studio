# 31 · Turn this video into reusable components

| | |
|---|---|
| **Purpose** | Harvest the best pieces of a finished video into the shared library, so the next video starts further ahead. |
| **Use when** | A video is delivered and approved. Before you forget why things worked. |
| **Stage** | After delivery, alongside `70-post-mortem.md`. |
| **Inputs you must fill in** | `[slug]`, `[CompId]`, optional `[pieces you especially liked]`. |
| **Expected output** | A short candidate list with keep/skip reasons, the approved pieces promoted into `studio/src/lib/` with props, the video refactored to use them with identical frames, `DESIGN_SYSTEM.md` updated. |
| **Next prompt** | `70-post-mortem.md`. |

## Prompt

```text
The video [CompId] in studio/src/videos/[slug]/ is finished and approved. Turn what worked into reusable components.

1. List every pattern in this video that is a candidate for the shared library: text reveals, captions, stat counters, charts, transitions, backgrounds, layouts, audio cue helpers, timing presets. Pieces I especially liked: [pieces].
2. For each candidate: does something similar already exist in studio/src/lib/? If yes, should it be merged into the existing component as a new prop, or is it genuinely different? If no, is it general enough to be reused in a different video, or is it specific to this one? Recommend keep or skip with one reason each. Show me the list and wait.
3. For approved pieces: extract them into studio/src/lib/ with props for content, duration, delay, colour, size and movement where it makes sense. Timing in frames, values from tokens, no hard-coded copy, deterministic.
4. Refactor the video to use the new components. Its output must not change: render the same frames before and after with npm run stills -- [CompId] [frames] and compare them. Report any difference.
5. Add each new component to LibraryShowcase and to the component table in studio/DESIGN_SYSTEM.md with a one-line "use when" and the video it came from.

Small and high quality beats many. Do not promote one-off decoration.
```
