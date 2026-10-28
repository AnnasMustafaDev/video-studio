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

## Additions to the scene table

- **Transition out reads "X becomes Y".** The outgoing object, what it carries (label, words, colour), the incoming object. Never "cut" or "fade" on its own; a hard cut onto an already set page is written as that. Morph vocabulary (iris, accordion squeeze, flood-and-contract, line carry, bezel or mat grows, text rises from a mask line): `motion-studio/references/transitions.md`. Check on the contact sheet: does frame N-1 contain the thing frame N grows from? Why: naming the carried element removes the crossfade default. Evidence: shown in two finished films.
- **Density tag** per scene (sparse, medium, dense). Dense is rare and deliberate; "dead air" (a static screen under the voice) is a flag. Evidence: shown in a published workflow repo, not validated.
- **Colour-flow table** (section, time, dominant colour, mood) so the palette shift is planned. Not adopted: the source's fixed 1920x1080-only sizes and its purple and blue colour-psychology table.
- **Where real footage goes:** a list of scenes where an animated placeholder stands in until a real capture replaces it.
- **Beat map** (music-led only): beat, bar, event, sound; BPM, total beats, beats before the drop. No dead time does not mean constant motion.
- **Sanity numbers** (reference, not gates): median shot about 1.5 s, a new beat about every 0.7 to 1 s, no low-energy stretch over 4 s, one earned stillness of 1.0 to 1.6 s on the key claim, end card about 2 s. Author's measurements of other films (claimed).
- **Copy:** exact text is written as 1 to 4 word fragments; about 15 to 25 words per 30 s. See `motion-studio/references/design.md` "Copy budget and fragment chains".
