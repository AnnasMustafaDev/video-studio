# 18 · Parallel chapter build

| | |
|---|---|
| **Purpose** | Build a long film (over about 60 s) with several subagents at once, one chapter each, without style drift or edit collisions. |
| **Use when** | The storyboard is approved, the film has 3 or more chapters, and a pilot scene has already passed `13`. Not worth it for a 15 to 30 s piece (use `12` and `14`). |
| **Stage** | Build, replaces the serial `14` loop for long pieces. |
| **Inputs you must fill in** | `[slug]`, `[CompId]`, `[chapter list with frame ranges]`, `[golden scene path]`, `[fps]`, `[width]x[height]`. |
| **Expected output** | One animation guide, a pilot group judged first, then every chapter built in parallel in its own file, a QC table per chapter, and an integrated film that renders. |
| **Why this exists** | The only documented way to get 2.5 to 5 minute pieces out of agents without style drift. Evidence: shown in finished films (a 156 s painted music video and a 5 min narrated explainer with 44 shots, per their repos); we have not run the protocol ourselves. Finding F-A4. |
| **Next prompt** | `13-quality-review.md` on the whole film, then `72`, `50`, `53`. |

## Prompt

```text
Build [CompId] in parallel. You are the lead; do not build chapters yourself except the pilot.

1. Write the animation guide first and save it to projects/[yyyy-mm-dd]-[slug]/guide.md: canvas and safe zones; the helper API, one line per helper in studio/src/lib/; style rules (look, one accent, motion language, readability, minimum type size); a per-frame performance budget; the rule "every shot is a pure function of the frame: no carried state, seeded randomness only, so frames render in any order"; the self-check command that renders a labelled sheet of N frames per chapter.
2. Pilot group: build the first chapter (or the golden scene [golden scene path]) yourself, run 13, fix, and show me. No other chapter starts until the pilot is approved. The pilot becomes the golden scene all agents copy structure from.
3. Dispatch one subagent per chapter, in parallel, each with: the guide, the storyboard rows of its chapter, the golden scene, and its file path studio/src/videos/[slug]/chapters/Chapter[NN].tsx. Rules for every agent: edit only your own file; if you find a bug in a shared file (tokens, lib, composition), report it to the lead instead of editing; run the self-check command before reporting; one heavy job at a time (render or sheet, then stop), because agents that read many images die on the next heavy task about 30 percent of the time in the sources.
4. QC: a separate agent per chapter that did not build it appends findings to projects/[yyyy-mm-dd]-[slug]/review.md as a table (severity, shot, frame, phenomenon, criterion, suggested fix). It may not edit source.
5. Integrate: you wire chapters into the composition, check the hand-offs between chapters on stills (last frame of chapter k against the first of k+1), apply fixes yourself or send them back to the owning agent one at a time, then render the whole film's contact sheet and run 13.
```

## Studio additions

```text
Chapter files live in studio/src/videos/[slug]/chapters/; the composition in studio/src/videos/[slug]/[Name].tsx is edited only by the lead. Commit locally per approved chapter (see 72); never push.
Sources: protocol after JohnHeibel's PDoomVideo (ANIMATION_GUIDE.md, STORYBOARD.md) and Vincentwei1021's anything2explainer (agent-build-rules.md, agent-qc-rules.md). Our wording.
```
