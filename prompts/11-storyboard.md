# 11 · Storyboard

| | |
|---|---|
| **Purpose** | Turn the chosen direction into a timed, frame-specific storyboard with a narrative arc. |
| **Use when** | A direction is chosen (from `10`, `20` or your own brief). |
| **Stage** | Staged prompt 2 of 4. Script and storyboard. |
| **Inputs you must fill in** | Which direction was chosen (name it, or paste it), any changes you want to it. |
| **Expected output** | A scene table: timestamps, purpose, first frame, final frame, focal point, exact text, animation, easing, transition, audio cues, link to the next scene, plus flags on repetitive scenes. |
| **Why this exists** | A transition column that must name the carried element, plus colour flow and density tags, makes storyboards checkable on a contact sheet. Evidence: the "X becomes Y" rule is shown in two finished films; colour-flow and density come from a public repo spec, only claimed to work. Findings F-B3, F-C9. |
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
Transition column rule (UI, product and diagram pieces): write every hand-off as "X becomes Y", naming the element that carries across and what it carries (label, words, colour). "Cut" and "fade" are not allowed as the whole answer; a hard cut is fine only when subject, scale, direction or material continues across it, and you say which. For type-only pieces a plain cut onto a settled page may stay, marked as chosen. Check later: does the last frame of scene N already contain what scene N+1 grows from?
Colour flow: add a small table (scene, time, dominant colour, mood). Still one accent per frame.
Density: tag each scene sparse, medium or dense. Dense scenes are rare and deliberate; flag dead air (a static screen under a voice) and effect soup.
Real footage or captures: list places where a real screen recording or screenshot replaces drawn UI.
Optional for music-led films: see 75 for the beat map first.
Write it to projects/[yyyy-mm-dd]-[slug]/storyboard.md as a Markdown table. No code yet.

Sources: "A becomes B" rule from the prompt-motion.com briefs of @twoclipping and @ultimaxbt; colour-flow, density and anti-pattern names after u/VanCliefMedia's public Animation-Workflow repo. Our wording.
```
