# Prompt library: which prompt for which purpose

Every file has the same header (Purpose, Use when, Stage, Inputs, Expected output, Next prompt), then one prompt to paste and, below it, a separate "Studio additions" block with repo paths. Fill every `[placeholder]`. Prompts from the source notes are verbatim.

## Pipeline for a normal video

```text
 SETUP (once per machine / session)
   01 skills check ─► 02 deterministic rule
                            │
 BRIEF                      ▼
   40 brief template ─► 00 master workflow (Phase 1)
                            │
 DIRECTION                  ▼
   20 reference analysis ─┐   (if you have a reference)
   10 creative directions ┴─► 11 storyboard
                                   │
 BUILD (loop per scene)            ▼
   12 build scene 1 ─► 13 quality review ─► 14 next scene ─► 13 ... ─┐
          ▲                 │                                         │
          └── 15 fix defect / 16 revision from feedback ◄─────────────┘
                                   │ (all scenes clean)
 FINISH                            ▼
   50 sound design ─► 51 captions ─► 52 9:16 + 1:1 ─► 13 per format ─► 53 final render + report
                                   │
 AFTER                             ▼
   31 componentize ─► 70 post-mortem  (lessons into skills/motion-studio/references/learnings.md)
```

Narrated product film where every cut lands on a spoken word: skip the build loop and use **60** (motion-studio engine).

## Goal → prompt

| Goal | File | Stage | What you get |
|---|---|---|---|
| Start any video the right way | `00-master-workflow.md` | Session start | Phase 1 plan: assumptions, direction, storyboard, design system, asset list |
| Check Claude sees the Remotion skills | `01-skills-check.md` | Setup | Skill list mapped to planning, type, transitions, audio, render, QA |
| Stop flicker / non-deterministic code | `02-deterministic-rule.md` | Guardrail | Frame-based constraint, audit of violations |
| Pick a look | `10-creative-directions.md` | Direction | 3 different directions + recommendation |
| Plan scenes and timing | `11-storyboard.md` | Storyboard | Timed scene table with first/last frame, text, easing, audio |
| Build the first scene | `12-build-one-scene.md` | Build | Scene 1 coded, stills inspected |
| Build the remaining scenes | `14-build-next-scene.md` | Build | Scene N + clean hand-off from N-1 |
| Judge quality | `13-quality-review.md` | Review | 5 worst defects, fixes, re-render |
| Fix one known problem | `15-fix-defect.md` | Review | Root cause, minimal fix, before/after stills |
| Apply someone's feedback | `16-revision-feedback.md` | Revise | Vague notes turned into an approved change list |
| Copy the feel of a reel | `20-reference-analysis.md` | Direction | 10-point breakdown + plan, no copying |
| Find a Claude-made example and its prompt | `21-find-inspiration-prompt-motion.md` | Direction | 3 to 5 prompt-motion.com matches, pick saved with credit, 10-ingredient brief |
| Build the component library | `30-design-system.md` | System | Components, tokens, `DESIGN_SYSTEM.md`, showcase |
| Harvest a finished video | `31-componentize-project.md` | After | Best pieces promoted to `studio/src/lib/` |
| Write a brief | `40-brief-template.md` | Brief | Fill-in brief on the 10 ingredients, weak vs strong example |
| Find the right motion word | `41-vocabulary-cheatsheet.md` | Reference | 5 core terms + precise terms + paste-in glossary |
| Add music and SFX | `50-sound-design.md` | Finish | Cue sheet, ducking, measured -14 LUFS / -1 dBTP mix |
| Add captions / subtitles | `51-captions-subtitles.md` | Finish | Word-timed captions, `.srt` per language |
| Make vertical and square cuts | `52-recompose-formats.md` | Finish | 9:16 and 1:1 composed for their own frame |
| Render and hand over | `53-final-render-delivery.md` | Deliver | Final files, ffprobe + loudness, Phase 5 report |
| Narrated product film | `60-voiceover-film.md` | Own pipeline | motion-studio scene table, HTML review player |
| Demo an app from screenshots | `61-product-ui-demo.md` | Plan | Screenshot inventory + shot list (camera, focus, cursor) |
| Animate a chart | `62-data-visualization.md` | Plan | Insight, chart choice, reveal sequence, source line |
| Type-only opener | `63-kinetic-type-hook.md` | Plan + build | Beat map, 2 to 3 treatments, built hook |
| Learn from the project | `70-post-mortem.md` | After | notes.md + technique lessons in learnings.md |
| Learn the craft in a week | `learning/day-1.md` .. `day-7.md` | Learning | One exercise per day (below) |

## I want to...

| I want to... | Use, in order |
|---|---|
| copy a reel I saw | 20 → 11 → 12 → 13 → 14 → 50 → 53 |
| see what prompt made a video like mine (prompt-motion.com) | 21 → 10 or 20 → 11 → 12 ... |
| make something but have no idea how it should look | 40 → 00 → 10 → 11 → 12 ... |
| turn a script I already have into a video | 40 → 00 → 11 → 12 ... (narrated with cuts on words: 60) |
| fix text that is cut off | 15 |
| make it feel less robotic | 41 (easing, spring, stagger) → 15 or 16 |
| react to "make it pop" from someone | 16 |
| post the YouTube video as a Reel too | 52 → 13 → 53 |
| add music | 50 |
| make the next video faster | 31 → 30 |
| show my app | 61 (silent or music) or 60 (narrated) |
| get a launch video of a project I just built, fast | `/brag` (third-party skill, `third_party/brag`), run in that project's folder; no prompt file. For a directed version: 40 → 00 → 61 ... |
| explain numbers | 62 |
| make a scroll-stopping opener | 63 |
| check before I send it | 13 → 53 |

## Recipes

**15 s launch teaser (16:9, 30 fps)**
40 → 00 → 10 → 11 (4 to 5 scenes, end card held 2 s) → 63 for scene 1 → 13 → 14 per scene → 50 (one impact on the reveal) → 53.

**YouTube explainer (16:9, 60 to 180 s, narrated)**
40 → 60 if every cut follows the voice; otherwise 00 → 11 (chapters as scenes) → 62 / 61 for the data and UI sections → 12 → 13 → 14 loop → 50 (VO ducking) → 51 (.srt) → 53 → 31 → 70.

**Instagram reel (9:16 1080x1920, 15 to 30 s)**
40 (format 9:16, muted autoplay yes) → 00 → 10 → 11 (hook readable at frame 0) → 63 → 12 → 13 → 14 → 51 (burned-in captions) → 50 → 53. Making it from a 16:9 master instead: 52.

**Data story (16:9 or 1:1, 20 to 45 s)**
40 → 00 → 62 → 11 → 12 → 13 → 14 → 50 (counter ticks, light) → 53, with every on-screen number checked against `data.ts`.

**UI demo (16:9, 20 to 40 s)**
Silent or music-only: 40 → 00 → 61 → 11 → 12 → 13 → 14 → 50 → 52 if needed → 53.
Narrated: 60.

## 7-day learning plan

| Day | File | Project | Main skill |
|---|---|---|---|
| 1 | `learning/day-1.md` | 5-second animated title | Typography and composition |
| 2 | `learning/day-2.md` | Kinetic typography sequence | Timing, easing and stagger |
| 3 | `learning/day-3.md` | Animated product UI demo | Layout and scene choreography |
| 4 | `learning/day-4.md` | Data visualization | Visual hierarchy and information design |
| 5 | `learning/day-5.md` | 15-second product teaser | Storyboarding and transitions |
| 6 | `learning/day-6.md` | Sound-designed version (of day 5) | Audio synchronization and pacing |
| 7 | `learning/day-7.md` | Recreate a reference style | Art direction, iteration and QA |

Save the prompt, storyboard, render and notes for every day in `learning/day-N/`.

## Rules every prompt assumes

- Never one-shot a whole video: direction, storyboard, one scene, review, then the rest.
- Deterministic, frame-based animation only (02).
- Judge rendered frames, not code: `npm run stills -- <CompId> <frames>` in `studio/`. If Claude could not look, it must say so.
- Commit locally after approved stages; never push.
