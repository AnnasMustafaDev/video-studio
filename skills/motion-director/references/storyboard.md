# Storyboard

Turn the chosen direction into a storyboard with timestamps and a clear narrative arc (hook, development, payoff, ending). Write it so a builder can implement a scene without asking a question. Template: [../templates/storyboard.md](../templates/storyboard.md).

## Scene table: one row per scene, every column filled

| Column | Rule |
|---|---|
| **#, time** | Seconds and frames at the video's fps (`2.50 s / f75`). Scene boundaries on the music grid if there is music |
| **First frame** | What is on screen at the first frame. Frame 0 of the video is a finished frame (muted autoplay shows it), never black or empty |
| **Last frame** | What is on screen at the last frame (the hand-off to the next scene) |
| **Focal point** | The one thing the eye goes to. One per scene |
| **Exact text** | Every on-screen word as it will appear, with line breaks (`/`). Max ~5 words per beat for captions |
| **Animation** | What moves, from where to where, distance, duration, stagger, trigger |
| **Easing** | Named: `spring (damping 200)`, `spring (stiffness 120, damping 14), slight overshoot`, `ease-out cubic 0.5 s`, `linear (intentional: progress bar)` |
| **Transition out** | Cut, match cut, mask reveal, wipe, zoom, morph, camera move; and **what carries across** |
| **Audio cue** | Music section, SFX names with times, voice line, or silence |
| **Purpose** | Why this scene exists in the story (one sentence) |
| **Link to next** | How it leads into the next scene (shape, motion, idea, colour) |
| **Repetition flag** | `REPEAT?` if it reuses the same layout, motion or trick as an earlier scene, with the scene it repeats. Fix or justify each flag |

## Hits table (sound cannot drift)

Every accent that should have a sound, one row each: `time (s) | frame | visual event | sound | level`. Builders turn this table into the SFX list in code (`hits.ts` for Remotion, `sfx` cues for the HTML engine) and nothing else adds SFX. The reviewer checks the render against it with `inspect.mjs sync`. Fewer is better: transitions, the main reveal, the payoff, the logo.

## Also in the storyboard file

- **Design-system notes:** palette tokens, type scale, spacing, radius, default spring and durations, safe margins, which existing components (`studio/src/lib/`) each scene reuses. New components are named once and reused.
- **Assets list:** real files needed (path or "missing"), fonts and music with licence.
- **Formats:** one line per scene on how each extra aspect ratio differs (stacking, type size, crop focus). Each format is composed for its shape.
- **Pacing check:** longest gap without a new event (aim ≤ 4 s), where the holds are, the two or three showpiece moments.
- **Build order:** which scene is built first as the quality probe (usually the hook or the signature moment).

## Timing rules of thumb

- Reading time ≈ 0.3 s per word plus 0.5 s; numbers and the CTA hold still 1.5 to 2 s.
- Entrances 0.4 to 0.7 s; exits faster (0.25 to 0.35 s); stagger 40 to 80 ms.
- Something new every 2 to 4 s; alternate long and short beats.
- The end card holds at least 2 s.
