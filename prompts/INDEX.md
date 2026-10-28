# Prompt library: which prompt for which purpose

Every file has the same header (Purpose, Use when, Stage, Inputs, Expected output, Why this exists with its evidence level, Next prompt), then one prompt to paste and, below it, a separate "Studio additions" block with repo paths. Fill every `[placeholder]`. Prompts from the source notes are verbatim.

## Pipeline for a normal video

```text
 SETUP (once per machine / session)
   01 skills check ─► 02 deterministic rule
                            │
 BRIEF                      ▼
   40 brief template (Banned list, glossary, gotchas, start gate) ─► 00 master workflow (Phase 1)
                            │
 DIRECTION                  ▼
   19 concept triple ─► 20 reference analysis ─┐   (20 if you have a reference)
                        10 creative directions ┴─► 11 storyboard  (75 beat map first if music-led; 17 picks a shot per scene)
                                   │
 BUILD (loop per scene)            ▼
   12 build scene 1 (golden scene + 5-line plan) ─► 13 quality review ─► 14 next scene ─► 13 ... ─┐
          ▲                 │   72 commit + decision log after each approval                       │
          └── 15 fix defect / 16 revision feedback ◄───────────────────────────────────────────┘
          (over about 60 s and 3+ chapters: 18 parallel chapter build replaces the 14 loop)
                                   │ (all scenes clean)
 FINISH                            ▼
   73 pacing review, 74 compare to reference, 77 taste rules (optional, with 13)
   50 sound design ─► 51 captions ─► 52 9:16 + 1:1 ─► 13 per format ─► 53 final render + forensics + report
                                   │
 AFTER                             ▼
   31 componentize ─► 70 post-mortem  (lessons into skills/motion-studio/references/learnings.md)
   71 system audit (quarterly, not per video)
```

Narrated product film where every cut lands on a spoken word: skip the build loop and use **60** (motion-studio engine).

## Goal → prompt

| Goal | File | Stage | What you get |
|---|---|---|---|
| Start any video the right way | `00-master-workflow.md` | Session start | Phase 1 plan: assumptions, direction, storyboard, design system, asset list |
| Check Claude sees the Remotion skills | `01-skills-check.md` | Setup | Skill list mapped to planning, type, transitions, audio, render, QA |
| Stop flicker / non-deterministic code | `02-deterministic-rule.md` | Guardrail | Frame-based constraint, audit of violations |
| Find the idea before the look | `19-concept-triple.md` | Direction | 3 concepts as Idea / Device / Grammar, kill-tested, 1 recommended |
| Pick a look | `10-creative-directions.md` | Direction | 3 different directions + recommendation |
| Plan scenes and timing | `11-storyboard.md` | Storyboard | Timed scene table with first/last frame, text, easing, audio |
| Pick a concrete shot for every scene from the curated library | `17-pick-shots-from-library.md` | Storyboard add-on | Per scene: chosen shot, alternative, filled parameters, taste verdict (library: `shot-library/`) |
| Build the first scene | `12-build-one-scene.md` | Build | Scene 1 coded, stills inspected |
| Build the remaining scenes | `14-build-next-scene.md` | Build | Scene N + clean hand-off from N-1 (golden scene + 5-line plan) |
| Build a long film with several agents | `18-parallel-chapter-build.md` | Build | Guide, pilot first, chapters in parallel, QC table |
| Judge quality | `13-quality-review.md` | Review | 5 worst defects, fixes, re-render |
| Judge pacing and tension | `73-pacing-and-tension-review.md` | Review | Measured pacing table, 3 flags, cut/keep per scene |
| Compare with a reference or golden scene | `74-reference-golden-compare.md` | Review | Twin contact sheets, falls-short list, borrowed vs changed |
| Check against precedent taste rules | `77-precedent-taste-rules.md` | Review | Pass/fail per rule, proposed new rules |
| Fix one known problem | `15-fix-defect.md` | Review | Velocity plot for motion bugs, root cause, minimal fix, before/after stills |
| Apply someone's feedback | `16-revision-feedback.md` | Revise | Vague notes turned into an approved change list with acceptance criteria and a glossary |
| Checkpoint after an approval | `72-commit-per-scene-and-decision-log.md` | Revise | Local commit, diff check, decision log |
| Copy the feel of a reel | `20-reference-analysis.md` | Direction | 10-point breakdown + plan, no copying |
| Find a Claude-made example and its prompt | `21-find-inspiration-prompt-motion.md` | Direction | 3 to 5 prompt-motion.com matches, pick saved with credit, 10-ingredient brief |
| Build the component library | `30-design-system.md` | System | Components, tokens, `DESIGN_SYSTEM.md`, showcase |
| Harvest a finished video | `31-componentize-project.md` | After | Best pieces promoted to `studio/src/lib/` |
| Write a brief | `40-brief-template.md` | Brief | Fill-in brief on the 10 ingredients plus Banned list, glossary, gotchas and a start gate; tagged variant; weak vs strong example |
| Find the right motion word | `41-vocabulary-cheatsheet.md` | Reference | 5 core terms + precise terms + paste-in glossary |
| Plan a music-led piece | `75-music-led-beat-map.md` | Plan | Beat map, grid acceptance, hit cap, loop plan |
| Add music and SFX | `50-sound-design.md` | Finish | Cue sheet from animation constants, silence recipes, hit cap, measured -14 LUFS / -1 dBTP mix |
| Add captions / subtitles | `51-captions-subtitles.md` | Finish | Word-timed captions, `.srt` per language |
| Make vertical and square cuts | `52-recompose-formats.md` | Finish | 9:16 and 1:1 composed for their own frame |
| Render and hand over | `53-final-render-delivery.md` | Deliver | Final files, ffprobe + loudness, pixel forensics, web-embed checklist, Phase 5 report |
| Narrated product film | `60-voiceover-film.md` | Own pipeline | motion-studio scene table, HTML review player |
| Tighten voice timing (experimental) | `76-voice-segment-anchor.md` | Own pipeline | Segment-anchored word times, lead A/B, mix ratio check |
| Demo an app from screenshots | `61-product-ui-demo.md` | Plan | Screenshot inventory + shot list (camera, focus, cursor) |
| Animate a chart | `62-data-visualization.md` | Plan | Insight, chart choice, reveal sequence, source line |
| Type-only opener | `63-kinetic-type-hook.md` | Plan + build | Beat map, 2 to 3 treatments, fragment-chain copy and word budget, built hook |
| Learn from the project | `70-post-mortem.md` | After | notes.md + technique lessons in learnings.md |
| Audit the studio itself | `71-system-audit.md` | Maintenance | Two unlike briefs traced; missing promises and leaked defaults |
| Look up a reusable prompt skeleton | `80-prompt-patterns.md` | Reference | 14 short skeletons with credit and evidence level |
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
| check before I send it | 13 → 77 → 53 |
| make a 60 s+ film without style drift | 19 → 40 → 11 → 12 → 13 → 18 → 13 → 53 |
| find the idea, not just a look | 19 → 10 |
| score a track-driven loop or showreel | 75 → 11 → 12 ... → 50 → 53 |
| judge if it drags or feels tensionless | 73 |
| compare my render to a reference or my best scene | 74 |
| stop revisions from breaking approved scenes | 72 after each approval, 16 for notes |
| a move pauses, snaps or stalls | 15 (plot the velocity first) |
| captions or cuts feel late on a narrated film | 76 |
| test whether the studio really handles a kind of video it has never made | 71 |
| write a one-off prompt fast | 80 |

## Recipes

**15 s launch teaser (16:9, 30 fps)**
40 → 00 → 10 → 11 (4 to 5 scenes, end card held 2 s) → 63 for scene 1 → 13 → 14 per scene → 50 (one impact on the reveal) → 53.

**YouTube explainer (16:9, 60 to 180 s, narrated)**
40 → 60 if every cut follows the voice; otherwise 00 → 11 (chapters as scenes) → 62 / 61 for the data and UI sections → 12 → 13 → 14 loop → 50 (VO ducking) → 51 (.srt) → 53 → 31 → 70.

**30 s launch film (16:9, 30 fps), golden scene + banned list + parallel chapters**
19 (pick the Device) → 40 (fill Banned, Glossary, Gotchas, Start gate; show the beat map and named stills before code) → 00 → 11 (every transition "A becomes B", colour flow, density) → 12 for the pilot chapter with a five-line plan → 13 → 72 (commit) → 18 for chapters 2..N, each agent copying the pilot as its golden scene and owning one file (for 30 s, two or three chapters is plenty; skip 18 under about 60 s) → 73 and 77 → 50 (cues derived from the animation, one earned silence, 3 full-frame hits at most) → 53 (forensics + delivery checklist) → 70.

**Music-led showreel or loop (16:9 or 1:1, 15 to 25 s)**
75 (beat map shown first, grid residual, hit cap, loop plan) → 19 → 11 → 12 → 13 → 14 → 74 against a reference → 50 → 53 (first-vs-last frame diff) → 70.

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

Number 17 is the shot-library picker (`shot-library/index.html` is its browsable viewer).

## Rules every prompt assumes

- Never one-shot a whole video: direction, storyboard, one scene, review, then the rest.
- Deterministic, frame-based animation only (02).
- Judge rendered frames, not code: `npm run stills -- <CompId> <frames>` in `studio/`. If Claude could not look, it must say so.
- Commit locally after approved stages (72); never push.
- Every new or changed prompt names its evidence in the header (shown in a finished film, or only claimed). Treat "only claimed" as a hypothesis to test, not a rule.
