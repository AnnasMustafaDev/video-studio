# Findings A: GitHub and web items

Scope: the 19 GitHub items in `research/gallery/github.json` and the 4 web items in `research/gallery/x_youtube_web.json`. Read on 2026-10-29 with `gh api` (read-only) and WebFetch. Everything fetched was treated as data; no code from these repos was run, nothing downloaded, no logins.

## How to read this

- **Evidence levels.** "Doc-level" means I read the written method (README, reference files, script header comments) but did not watch the film. "Shown" means a finished film exists in the repo or post, but I did not play it either, because I cannot watch video. Nothing here is verified by looking at frames. Where a number comes from a source I say so.
- **What the studio already does** (from `CLAUDE.md`, `prompts/INDEX.md`, the skills and `learnings.md`): staged workflow, three directions, scene-table storyboard, deterministic frame-based code, contact and phone sheets, `inspect.mjs` (sheet, strip, probe, sync waveform), fresh-subagent review with a rubric, -14 LUFS and -1 dBTP check, hits table for sound, sidechain ducking, closed-form springs, subframe motion blur, banned-transition list. Generic advice ("use contact sheets", "separate builder and judge", "sync SFX to hits") is therefore not repeated below; only the delta is.
- **Studio fit filter.** One accent, no plain templated looks, HTML engine plus Remotion, deterministic, personal repo. Several sources ship their own house bans (no serif, no cream, no orange, no purple). Those are taste choices of that author, not rules for us; I adopt the mechanism (a ban list enforced by a linter and by the reviewer), not their specific bans.

Ranked by value to the studio.

---

### F-A1: Pixel forensics on the rendered MP4 (frozen time, pops, ghosts, judder, banding, loop seam), with declared intent
- **Category:** QA/review
- **What it is:** A script reads the encoded video and the cue list and flags frame-level defects that contact sheets hide: stretches where nothing changes, one-frame pops (a value jumps in a single frame), ghost frames next to cuts, judder, banding, and a loop that does not close. The author declares designed moments (a flash cut, a planned freeze) in a small `qa.json` with a reason each, so thresholds stay strict for everything else. A simpler cousin measures the longest "dead" stretch per shot and the settle time before an exit (mean grey change on a 320x180 copy; under about 0.35 counts as still).
- **Why it is good:** Three independent repos converged on it. The critic-loop kit reports that about 10 of 36 seconds of one film were effectively frozen and none of the builder's own checks flagged it; the explainer kit reports beat-timing and dead-stretch defects that only measurement found. Our QA is look-at-stills plus loudness; a 2 s freeze between two good stills passes it. Evidence: doc-level, with reported real defects; I did not run the scripts.
- **Adopt?** Yes. It is engine-agnostic, needs only ffmpeg and a small numpy/PIL script, and closes the biggest hole in our QA.
- **Where it goes:** a new `forensics` subcommand in `skills/motion-review/tools/inspect.mjs` (or a sibling `forensics.mjs`), a new "Measured defects" block in `skills/motion-review/references/rubric.md`, and one checklist line in `skills/motion-studio/references/qa.md`. Declarations live in `projects/<date>-<slug>/qa.json`.
- **Effort:** M
- **Source:** Leonxlnx/cinetic, `skills/cinetic/references/review-loop.md` (https://github.com/Leonxlnx/cinetic); echris6/motion-video-kit, `quality-bar.md` and `gauntlet.md` (https://github.com/echris6/motion-video-kit); Vincentwei1021/anything2explainer, `template/scripts/motion_check.py` and `reference/agent-qc-rules.md` (https://github.com/Vincentwei1021/anything2explainer).

### F-A2: Fragment-chain copy grammar and a hard word budget
- **Category:** typography (copy and kinetic type)
- **What it is:** Film copy never lands as a sentence. It arrives as fragments of 1 to 4 words with a picture beat between them, in one of two modes: "build" (fragments append to a held line, the newest in the accent, the line re-centres once per fragment) or "replace" (each fragment leaves whole, the next takes the same centre). Recipes: the animation is the verb (words before and after the demo, never describing it), the cliffhanger cut (the picture delivers the payoff word), stem plus rotating slot instead of a list, an image standing in for a word, one giant keyword per film. Budget: about 15 to 25 words for a 30 s launch, 6 or fewer for a muted loop, no more than about 8 words readable on one frame, and a "subtitle film" smell test (copy on more than about 65 percent of frames fails).
- **Why it is good:** It is a concrete, checkable answer to text walls and to captions that fight the picture, a common amateur tell. The numbers come from a frame-by-frame study of eight professional films (the author's claim; I could not check those films) and are enforced by a string audit and a layout audit in the author's pipeline. Their blind evaluation credits the ideas and story quality of films made this way, though a neutral judge preferred the baseline in two of four rounds, so evidence for taste is mixed and for discipline is good.
- **Adopt?** Yes as a rule set and a pre-flight check. Not the author's copy bans verbatim (no questions or exclamation marks is a style choice; keep it as a default, allow exceptions).
- **Where it goes:** new section "Copy budget and fragment chains" in `skills/motion-studio/references/design.md` (with a pointer from `skills/motion-director/references/storyboard.md`, column "exact text"); extend `prompts/63-kinetic-type-hook.md` with the budget and the two modes; add a copy-budget line to `skills/motion-review/references/rubric.md`.
- **Effort:** S
- **Source:** Leonxlnx/cinetic, `references/copy-and-type.md` §1, §2b and `taste-and-slop.md` B4, B8, B9. Credit: Leonxlnx.

### F-A3: Measure motion instead of guessing: velocity plot, and the "buoyant bob" ease
- **Category:** pipeline/tooling (and motion)
- **What it is:** When a move "pauses then snaps", plot position and velocity over time instead of reasoning about it. In a production write-up, five intuitive fixes failed over about an hour; a debug overlay graphing velocity showed zero velocity for 16 percent of the move; the cause was a bob sine covering only the rise phase, fixed by spanning the whole lifetime. The same article's reusable ease: a cubic ease plus a half-sine bob so a rising element keeps drifting through its peak instead of freezing ("buoyant").
- **Why it is good:** It replaces the commonest failure mode (an agent retrying eased variants blind) with a 30 second visual check. Evidence: one detailed first-hand production article with numbers; it names no capture tool and I did not see the film.
- **Adopt?** Yes. It fits the deterministic model: a value that is a pure function of frame is trivial to sample.
- **Where it goes:** a small `tools/motion-plot.mjs` (sample a timing function over N frames, print value and velocity, flag a zero-velocity run in the middle of a move); one paragraph in `skills/remotion-studio/references/inspect-render.md` and `skills/motion-studio/references/qa.md` ("when a move feels wrong, plot it"); a `buoyant()` helper next to the springs in `studio/src/lib/motion.ts`.
- **Effort:** S
- **Source:** Samuel Parks, RapidEye, "Building our launch video with Claude" (https://rapideye-seo-tools.pages.dev/blog/building-our-launch-video-with-claude/).

### F-A4: Parallel build protocol for long pieces (guide for subagents, pure functions of time, file ownership, pilot first)
- **Category:** process
- **What it is:** For a long film the lead writes one animation guide (canvas size, safe zones, helper API, a style section, a self-check command) and a storyboard, then runs one subagent per chapter in parallel. Rules that made it work: every shot is a pure function of `t` so frames render out of order; each agent edits only its own chapter file and reports shared-file bugs instead of editing them; a pilot group is built first and judged before the rest; one heavy job per agent; a QC agent per chapter appends findings to a table (severity, shot, frame, phenomenon, criterion, suggested fix) and may not edit source. Recorded losses: agents that had read many images died on the next heavy task about 30 percent of the time.
- **Why it is good:** It is the only documented way in this set to get 2.5 to 5 minute pieces (a 156 s painted music video, a 5 min narrated explainer with 44 shots) out of agents without style drift. The music-video repo says the whole repo, including the guide, was written by the model. Evidence: shown (finished videos linked) plus the written protocols; I did not play them.
- **Adopt?** Yes for pieces over about 60 s. Not worth it for a 15 to 30 s reel.
- **Where it goes:** new prompt `prompts/17-parallel-chapter-build.md` (guide template plus ownership and pilot rules), referenced from `prompts/INDEX.md` after 12 and from `skills/remotion-studio/references/phases.md`. Reuse the QC table columns in `skills/motion-review/agent.md`.
- **Effort:** M
- **Source:** JohnHeibel/PDoomVideo, `ANIMATION_GUIDE.md`, `STORYBOARD.md` (https://github.com/JohnHeibel/PDoomVideo); Vincentwei1021/anything2explainer, `reference/agent-build-rules.md`, `agent-qc-rules.md`, `lessons.md`.

### F-A5: A video-native brand spec ("frame.md"): frame-relative type ramp, one accent per frame, text floor
- **Category:** typography / direction
- **What it is:** A published launch-video project argues that web design specs make agents build slides (cards, pills, panels). Its fix is a second spec that keeps the brand atoms (colours, type family) and re-expresses scale for a 16:9 frame: sizes in frame-relative units (vw), a hero ramp far larger than the reading ramp (wordmark 30vw, display 14vw, claim 6 to 9vw, stat numeral 18vw), a hard text floor (1.4vw at 1920 wide; chrome labels may go below), a safe area in vw, named easings and durations, and the rule that the accent colour appears once per frame. Motto: atoms are sacred, composition is free, numbers come from the script.
- **Why it is good:** It gives the agent a ramp that cannot collapse into a web page layout, and it matches our "one accent" rule in a testable form. Evidence: shown as source of real launch compositions (viewer links were not opened, they are JS viewers); the reasoning is stated in a handoff doc.
- **Adopt?** Yes as a template; we already have `studio/DESIGN_SYSTEM.md` and `tokens.ts`, so add the frame ramp rather than a new system.
- **Where it goes:** `studio/src/lib/tokens.ts` (frame ramp in percent of frame) and `studio/DESIGN_SYSTEM.md` ("Frame ramp, text floor, one accent per frame"); a frame-ramp section in `skills/motion-studio/references/design-system.md`; add "does the type ramp read as web UI?" to `skills/motion-review/references/rubric.md`.
- **Effort:** S
- **Source:** heygen-com/hyperframes-launches, `claude-paper-launch/FRAME-claude.md` and `frame-md-launch-storyboard/HANDOFF.md` (https://github.com/heygen-com/hyperframes-launches). Credit: HeyGen.

### F-A6: Velocity-matched cut and measured entrance/exit curves
- **Category:** transitions (and camera)
- **What it is:** The outgoing shot accelerates in one direction and is cut at its fastest frame; the incoming shot starts already moving the same way and brakes to rest, so momentum crosses the edit. Numbers given: exit speeds up about 1.1 to 1.2 times per frame over the last 16 to 24 frames, ending at 25 to 40 px/frame at 60 fps (never above 60); entry starts at 30 to 55 px/frame and decays about 0.92 to 0.94 per frame; text inside a moving shot must be under 20 px/frame by the time it is read; the cut is also an act boundary so motion-blur samples never straddle it. Companion rule: a hard cut works when subject, scale, direction and material continue across it.
- **Why it is good:** It turns "make smooth transitions" into numbers and explains why some dissolve-free cuts feel dead. The numbers come from the author's frame measurements of professional films (claimed); the recipe itself is easy to test.
- **Adopt?** Yes, as a named transition plus exit/entry helpers.
- **Where it goes:** `skills/motion-studio/references/motion.md` (Transitions with meaning table: add "velocity handoff") and `skills/motion-director/references/vocabulary.md`; helpers `exitRamp()` and `entryDecay()` in `studio/src/lib/motion.ts` and `studio/src/lib/transitions.tsx`.
- **Effort:** S
- **Source:** Leonxlnx/cinetic, technique entry `tr-velocity-handoff-cut` and `references/craft-rules.md` §2, §4; echris6/motion-video-kit, `motion-grammar.md` rules 4 and 5.

### F-A7: Hidden-cut and no-cut transitions (occluder cut, impact slam, light-leak burn, line carry)
- **Category:** transitions
- **What it is:** Four recipes with parameters. (A) A soft, out-of-focus foreground object sweeps across and the hard cut happens inside the frames where it covers the screen, with a drag of about 28 px before and a settle after so it reads as one take. (B) Two half-screens with a slanted seam collide: white flash 3 frames, screen shake about 16 px decaying over about 5 frames, a stamp, all on the same frame (a one-frame offset scatters it). (C) A warm diagonal light leak ramps up slowly (ease-in), the cut hides at the peak, and it recedes faster; the old picture must also wash out (brightness up, contrast down) or it reads as a sticker. (D) A progress bar extends out of frame, the camera follows the line, and the line turns corners to draw the next scene's card frame: no cut at all, with the pen tip pinned near x=1480 so it never leaves or lags.
- **Why it is good:** Each carries a cause before and a result after, and the failure modes are written down (ease-in on the leak, three impact elements on one frame). Evidence: doc-level cards with the author's tuned frame numbers plus reference demos; the author notes parameters were tuned on placeholder material, so treat them as starting points.
- **Adopt?** Yes for A, C, D; B only for comparison moments. Must be re-skinned (no source brand colours) and the leak must respect one-accent discipline.
- **Where it goes:** `skills/motion-studio/references/motion.md` transitions table and `skills/motion-director/references/vocabulary.md`; component stubs in `studio/src/lib/transitions.tsx`; entries for `prompts/41-vocabulary-cheatsheet.md`.
- **Effort:** M
- **Source:** Vincentwei1021/video-shotcraft, `references/shots/transition/transition-hidden-cut.md` and `line-carry-transition.md` (https://github.com/Vincentwei1021/video-shotcraft). Credit: Vincentwei1021. Cards are written in Chinese; I read and paraphrased them.

### F-A8: Sound cues computed from the animation itself, plus physics-based audio timing
- **Category:** sound / pipeline
- **What it is:** Sound events are never placed by hand. A sync module computes the contact frame of each spring, the 50 percent frame of each pop-in and the velocity peaks of each whip from the same constants and spring functions the picture uses; the cue export feeds the score. In the long historical film, sound cues are derived from the picture's events (each gun, volley, hoofbeat) and delayed by distance at 343 m/s, filtered and panned by position.
- **Why it is good:** Sound sync becomes a property of the code, so retiming the animation retimes the sound. Our hits table is hand-authored; this would generate it. Evidence: the cue-export design is documented with sync-audit tolerances (lag up to 48 samples); the historical film is shown on X per the gallery, but I could not watch it.
- **Adopt?** Yes for UI-style films with many micro-hits; maybe for narrated films where the voice leads.
- **Where it goes:** `skills/motion-studio/references/audio.md` (new "Derive the hits table from the animation constants") and a helper in `studio/src/lib/Sfx.tsx` that exposes contact frames next to each spring; the existing `inspect.mjs sync` then verifies it.
- **Effort:** M
- **Source:** Leonxlnx/cinetic README ("One beat grid, measured sound") and `references/sound.md`; WinterArc21/Battle-of-Austerlitz-Film README (`web/events.js` description).

### F-A9: Rigorous beat-grid method and a cap on full-frame beat hits
- **Category:** sound / rhythm
- **What it is:** For a track you did not write: fit a straight line to the detected beat times by least squares, report the residual (accept up to about 15 ms), check half-time and double-time candidates by whether kicks land on whole beats, separate the drum stem for dense mixes, classify onsets by band (kick drives impacts, snare drives swaps and flash cuts, hi-hat drives micro-motion density), keep float seconds until the last step into frames, and measure cut error after rendering (target 3 frames or less). A feedback-derived rule: beat sync does not mean pulsing the whole picture every beat; full-frame or camera-layer impacts at most 3 per film, at least 16 beats apart, the rest only on the hero element. A separate UI-morph-loop guide adds: the last frame, including cursor position and velocity, must equal the first.
- **Why it is good:** It is a complete grid-acceptance step the studio lacks, and the 3-impact cap is a hard, evidence-based fix for beat-frequency jitter that kinetic pieces are prone to. Evidence: documented, with a 70 s, 18-shot film reported with all cuts within 2.2 frames (author's measurement) and a user complaint cited as the origin of the cap.
- **Adopt?** Yes.
- **Where it goes:** `prompts/50-sound-design.md` (add a "grid acceptance" step) and `skills/motion-studio/references/audio.md`; a loop-seam item in `skills/motion-studio/references/qa.md` (`inspect.mjs probe` already returns first and last frame: add a pixel difference between them).
- **Effort:** M
- **Source:** Vincentwei1021/video-shotcraft, `references/music-beat-sync.md`, `aesthetic-rules.md` R4; opusvideo/awesome-claude-video, `IMPLEMENTATION_GUIDES.md` (UI morph loop case, original post by @twoclipping on X, not opened).

### F-A10: Verification critic and a ledger (fresh judge per round, FIXED / PARTLY / STILL PRESENT)
- **Category:** QA/review
- **What it is:** Each review round uses a new critic that gets only the artifact, the brief, references and (in verification rounds) the previous report, never the builder's reasoning or a list of what was fixed. The verification critic marks each earlier item FIXED, PARTLY or STILL PRESENT, hunts for regressions, and ends with SHIP or ONE MORE PASS (at most 3 fixes). Critics also look at dense windows (every 1/30 s) around each transition. A one-table ledger (round, artifact, top findings, change, measured result) is kept. Companion limits: one round after the machine gates pass, then ask before a second, hard stop around 3 to 5 rounds.
- **Why it is good:** We already use a fresh reviewer; the delta is the verification-round template, the regression hunt (the repo lists real examples: a covered element losing its z-order, a moved object crossing a headline) and the stop rule. Evidence: documented with listed defects the critic caught; sample films exist but I did not see them.
- **Adopt?** Yes, small additions only.
- **Where it goes:** `skills/motion-review/agent.md` (add a verification template), `skills/motion-review/SKILL.md` (round cap), and a ledger table in the `projects/<date>-<slug>/review.md` template.
- **Effort:** S
- **Source:** echris6/motion-video-kit, `references/gauntlet.md`, `critic-prompts.md` (adapted there from a public "Gauntlet loop" idea I did not open); Leonxlnx/cinetic `review-loop.md`; Vincentwei1021/video-talkcraft changelog (one round then ask, 2026-09-11).

### F-A11: Concept triple (Idea, Device, Grammar) and kill-tests before any pixel
- **Category:** direction
- **What it is:** A concept is three sentences: the Idea (what the viewer should believe, 8 words or fewer), the Device (one object that carries it through every shot, e.g. a dot handed from shot to shot that ends as the mark), and the Grammar (a rule the form obeys, e.g. opens and closes on the same tick). Filled from an inventory of real specifics first, then three concepts through different lenses, then tests that kill weak ones (ownership, deletion, specificity, could a competitor say it). The companion tell catalogue lists borrowed props (rocket, lightbulb), demo without a cause, a recycled end card, and the device dropping out at a seam.
- **Why it is good:** It stops "style posing as idea", which our three-directions step can still produce (three looks, no idea). Evidence: doc-level, with four worked concepts; reasonable, but the strength of the resulting films is only claimed.
- **Adopt?** Yes, as extra fields, not a new stage.
- **Where it goes:** `skills/motion-director/references/directions.md` and `templates/brief.md` (Idea / Device / Grammar rows and the tests), `prompts/10-creative-directions.md`; borrow the cheap-tells catalogue into `skills/motion-review/references/rubric.md`.
- **Effort:** S
- **Source:** Leonxlnx/cinetic, `references/concept-and-story.md` §1 to §6 and `taste-and-slop.md` A group; echris6/motion-video-kit `motion-grammar.md` (persistent actor rule).

### F-A12: Precedent-based taste rules from real rework
- **Category:** direction (taste)
- **What it is:** A rule file where each rule has the rule, the case that produced it, and a self-check question. The ones new to us and cheap to adopt: hold a brand wordmark a full second; batch entrances should accelerate, never move at constant speed, and end with a half-second rest; first drafts are almost always too fast, so default one notch slower; no handheld shake in bright UI films; at most one sheen or glint per hero, clipped to its corner radius; sharp text in 3D perspective needs high-resolution rasterising (layout-level zoom, never blame depth of field); no small source or disclaimer text on the last beat (it needs 2.5 s or more at half opacity or higher).
- **Why it is good:** These are defects a reviewer repeatedly sent back, so they pre-empt rounds. Evidence: each rule cites a specific rework; first-hand but from one author's product-video projects.
- **Adopt?** Yes (selected rules); our `learnings.md` already has a similar spirit, so merge, do not duplicate.
- **Where it goes:** technique-only lines appended to `skills/motion-studio/references/learnings.md` (Direction and taste, Motion) and a check line in `skills/motion-review/references/rubric.md`; the 3D text rule goes to `skills/motion-studio/references/three-d.md`.
- **Effort:** S
- **Source:** Vincentwei1021/video-shotcraft, `references/aesthetic-rules.md` R1 to R4, Q2 to Q5; Vincentwei1021/anything2explainer `reference/lessons.md`.

### F-A13: Pacing norms as numbers (shot length, energy curve, one earned stillness, accent share)
- **Category:** direction / pipeline
- **What it is:** A table of norms the author measured on professional launch films: median shot about 1.5 s, a new visual beat about every 0.7 s (calm default about 1 s), first frame already moving, first readable word near 0.4 s, product on screen by about 3 s unless a problem act earns the wait, two energy peaks with a designed lull near 65 percent and the biggest peak near 82 percent, low-energy stretches under 4 s, one earned stillness of about 1.0 to 1.6 s on the key claim followed by the biggest spike, accent colour about 5 percent of pixels, end card about 2 s with a 0.6 to 1.3 s hold and at most 6 percent creep, repeated reveals about 40 percent faster the second time.
- **Why it is good:** It gives storyboards and reviews numbers to check instead of feel; "spend stillness once" is particularly useful. Caveat: the source films are not named in what I read and the numbers are the author's claim.
- **Adopt?** Maybe: yes as a reference table, no as pass/fail gates.
- **Where it goes:** `skills/motion-director/references/storyboard.md` (a "sanity numbers" footnote) and `skills/motion-review/references/rubric.md` (pacing row).
- **Effort:** S
- **Source:** Leonxlnx/cinetic, `references/craft-rules.md` §1 and the at-a-glance table.

### F-A14: Off-by-one traps checklist for frame-driven animation
- **Category:** QA / pipeline
- **What it is:** Bugs with root causes from real rework, almost all frame arithmetic: `fadeIn(0)` returns 0 so the first frame of a shot is empty (start soft at 25 to 57 percent); a faded exit that leaves 40 to 57 percent opacity on its last frame pops at a hard cut (use `1 - (n/N)^1.5`); first elements of a shot should start on the shot's first frame, not wait for the caption start (otherwise an empty beat at group boundaries); an element rendered twice (one steady, one glitching) hides the effect; do not wrap an already-ramping component in a second fade; keyframe tables must start with an off-screen value at shot start or the element parks on screen early; slide-ins from below travelling more than about 120 px cross the caption band; do not change words after frame numbers are hard-coded; check how many frames the last beat has left before giving it a long animation.
- **Why it is good:** Each item causes a visible defect that stills at the wrong frame miss, and all apply to Remotion directly.
- **Adopt?** Yes.
- **Where it goes:** `skills/remotion-studio/references/determinism.md` (new "Frame arithmetic traps"), comments in `studio/src/lib/motion.ts`, and a "freeze words before building" rule in `skills/motion-studio/references/voice.md`.
- **Effort:** S
- **Source:** Vincentwei1021/anything2explainer, `reference/lessons.md` and `agent-build-rules.md` (https://github.com/Vincentwei1021/anything2explainer).

### F-A15: Silence and restraint as sound recipes (one soft sound per text fragment, dropouts spotlight a claim)
- **Category:** sound
- **What it is:** House sound style from frame-measured films: one soft sound per text fragment, near-silence while it is read, a big hit only for the one reveal, the lockup is a stop-down plus one clean element, no pitch climbing in a stacked lockup. Spotlight with silence instead of effects: cut a statement card 3 to 12 frames into a 12 to 24 frame hole in the music and bring the beat back about 17 frames later, or give a key claim a 2 to 4 beat bass and kick dropout and land the next visual event on the returning downbeat; mute the sub 12 to 18 frames before the hardest cut and release it on the cut. A calm film can be mastered effects-only at about -18 LUFS.
- **Why it is good:** A concrete alternative to "add more SFX", which is how films get busy. Evidence: documented, with a warning rule in the score script; the underlying measurements are the author's.
- **Adopt?** Yes (as recipes).
- **Where it goes:** `skills/motion-studio/references/audio.md` (new "Spotlight with silence" and "calm profile") and `prompts/50-sound-design.md`.
- **Effort:** S
- **Source:** Leonxlnx/cinetic README ("Sound") and `references/craft-rules.md` §1 item 11.

### F-A16: Rhythm and type-sync recipes (shooting on 3s then 1s, trailer bumper, karaoke fill, weight pump)
- **Category:** typography / rhythm
- **What it is:** Four small, distinctive recipes. (1) Frame-rate shift: a mover steps every 3 frames (about 69 px per step, a different pose each step) and switches in one frame to every-frame motion with hard overshoot and stretch, so the change of cadence is the highlight; under 30 px per step it reads as dropped frames, and any tween on the switch kills it. (2) Trailer bumper: three framings of 9 frames each, zero transitions, each pushing in 1 to 4 percent so it is not a slideshow, then 6 frames of pure black, then the title. (3) Karaoke fill: each word fills left to right with a soft edge at speaking rate, current word in accent, finished word in ink, a pointer underline on the active word; word times come from the voice, gaps of 4 to 10 frames for breath. (4) Font-weight pump: a variable-font weight envelope on the beat (about 250 to 900), glyphs set in slots laid out at the heaviest weight so the line never reflows; beats must be spaced wider than the decay window.
- **Why it is good:** All four are cheap, deterministic and look authored rather than templated. Evidence: documented with Remotion demos; I did not see their output, and the author says parameters were tuned on placeholder material.
- **Adopt?** Maybe: karaoke fill and weight pump yes (they suit voice-led films and type hooks); frame-rate shift and bumper as optional spices.
- **Where it goes:** `prompts/63-kinetic-type-hook.md` (treatment list), `skills/motion-studio/references/motion.md`, and `studio/src/lib/WordStagger.tsx` / `Captions.tsx` (a word-fill mode).
- **Effort:** M
- **Source:** Vincentwei1021/video-shotcraft cards `rhythm/sakuga-timing-shift.md`, `rhythm/trailer-grammar-moves.md`, `typography/type-rhythm-sync.md`.

### F-A17: Shot-card library as vocabulary, and a random draw to avoid repeating yourself
- **Category:** prompting / direction
- **What it is:** Two libraries organise motion moves as named cards with intent, core motion, a parameter table with "what happens if you go wrong", known pitfalls and a reference implementation (124 cards in 10 categories in one; 273 techniques in 14 in the other). One also draws techniques with a script, weighted by format and energy (about one per 3.5 s), so two films do not share the same fade-up, push-in and end card; each technique has a variant that respects the ban list.
- **Why it is good:** Named cards give precise prompts ("crash zoom with impact stop on the key card") and the draw counters the model's habit of picking the familiar option. Evidence: card quality is high where I read it (failure thresholds in the parameters); the draw's effect on final taste is only claimed. The 14k stars figure is from the gallery data, not checked.
- **Adopt?** Maybe. Reading and adapting individual cards: yes. Vendoring the libraries: no (licence, size, Chinese-language cards, and a house look). A tiny draw helper that picks 3 to 5 moves from our own vocabulary: cheap and worth trying.
- **Where it goes:** `skills/motion-director/references/vocabulary.md` (named moves in a parameter-and-pitfall format); optional `tools/draw-moves.mjs`; `prompts/21-find-inspiration-prompt-motion.md` can point to the card gallery as a second source.
- **Effort:** M
- **Source:** Vincentwei1021/video-shotcraft (https://github.com/Vincentwei1021/video-shotcraft); Leonxlnx/cinetic `scripts/pick.py` as described in its README.

### F-A18: Build the world from real data (long-form cinematic piece)
- **Category:** direction / pipeline
- **What it is:** A 5 minute film rendered entirely by a WebGL program: real terrain (SRTM relief at 38 m, exaggerated 3 times vertically), coastlines from public map data, the actual sun azimuth for the date staged behind the key hill, a painterly look from a Kuwahara filter over the frame plus canvas weave, grain and 2.35:1 letterbox, offline TTS narration whose beats time every shot, synthesised sound, resumable chunked render.
- **Why it is good:** It shows what "directed from data" looks like and that a research-heavy piece can be made without generated imagery. Evidence: finished film with MP4 and subtitles in the repo; I did not watch it, and the gallery says it was viewed on X, not GitHub.
- **Adopt?** Maybe, for a future documentary-style piece only. It is heavy (WebGL, about 1.7 s per frame on software rendering) and out of scope for product films.
- **Where it goes:** `skills/motion-studio/references/three-d.md` ("real-data worlds" and the filter idea) and a note in `skills/motion-studio/references/direction.md`.
- **Effort:** L
- **Source:** WinterArc21/Battle-of-Austerlitz-Film, README (https://github.com/WinterArc21/Battle-of-Austerlitz-Film). Credit: WinterArc21.

---

## Prompt patterns worth keeping

Structure only, in my own words. Fill the brackets.

1. **Fixed-output style brief** (from the 15-styles repo, one prompt per film). Sections in order: role (director, designer, engineer and sound designer of one piece); bar (award-shortlist quality, a plain templated result is a fail, named benchmark studios); style; fixed output (size, fps, exact length in frames, loudness and peak targets, file name); suggested technical route with permission to choose a better one if justified in a sentence; creative seed with a story in 3 to 5 beats and a 3 to 4 colour palette; signature features that make the style recognisable and must not be removed; sound brief; latitude clause (may change concept and copy but must stay canonical and hit the signature features). Then a second model reviews with a rubric and the notes go back for a second pass. Credit: Vincentwei1021, mg-styles-15 `prompts/05-cel-boil.md`.
2. **Delegation guide for parallel agents.** Canvas and safe zones; the helper API, one line per helper; style rules (look, colour, motion, readability); a performance budget per frame; "pure function of t, no carried state, seeded randomness only"; ownership ("edit only your file, report shared bugs"); a self-check command that renders a labelled sheet at N times. Credit: JohnHeibel, PDoomVideo `ANIMATION_GUIDE.md`.
3. **Constrain the medium, free the content.** "Only [JavaScript-drawn brush strokes / vanilla Canvas at 160x90 with a 32-colour palette / one HTML file], no video model, no source images; you choose the milestones and the symbolism." State the banned list explicitly (gradients, rotation, blur, antialiasing for pixel art). Credit: gallery prompts as summarised in opusvideo/awesome-claude-video guides (Pixel Wizard, Rainbow Road, Life of Opus).
4. **One persistent element morph loop.** Provide 8 to 12 UI states and a track near 120 BPM; one continuously morphing element on a neutral canvas; every state change caused by a visible cursor; a banned list (bounce easing, particles, glow, chrome gradients, mismatched icons, dead time); a bar-by-bar state sequence; everything computed from `seek(t)`; render four subframes per frame and blend; one still per beat before the full pass; last frame, including cursor velocity, equals the first. Credit: @twoclipping via opusvideo/awesome-claude-video `IMPLEMENTATION_GUIDES.md` (original post not opened).
5. **Reference-lock for a character.** Study the sheet, write a character bible, extract the palette by script, lock silhouette features across every style, pass a turnaround and expression lineup before continuing; score every shot on identity, emotion, joke, composition, scale, depth, lighting, polish and phone readability to at least 8 of 10; deliver a twice-concatenated loop check. Credit: @pradeepXkapoor via the same guide (Pip case).
6. **Plan-first, then a short checkpoint cut.** A storyboard line per shot with frame range, beat, visuals, motion, hero element; one pilot group built first and shown as a 30 second cut; consult the user at a fixed small number of checkpoints (four in the source). Credit: Vincentwei1021, anything2explainer README.
7. **Constraint-for-sync brief for talking-head to B-roll.** Keep original audio, subtitles and duration unchanged; shrink the speaker to a corner overlay that does not cover captions; replace the main picture with line-art B-roll per spoken concept, cut at subtitle boundaries; verify every boundary, overlay position, audio preservation and exact duration; export under a new filename. Credit: @AxtonLiu via opusvideo guides.
8. **Measure-first debugging prompt.** "This move [pauses/snaps] around [time]. Do not try another fix. Build a debug overlay that plots value and velocity over the move, show me where velocity is zero, then fix the cause." Credit: RapidEye article (pattern, not their wording).
9. **Independent verification critic.** "You did not build this. Artifact: [path]. Previous report: [path]. For every item in its top fixes mark FIXED, PARTLY or STILL PRESENT with timestamps, then list new defects (glitch frames, overlaps, clipped text, odd in-between frames). End with SHIP or ONE MORE PASS, at most three fixes." Credit: echris6, motion-video-kit `critic-prompts.md`.
10. **Idea before style.** "Write the Idea (8 words max), the Device (one object carried through every shot), the Grammar (a rule the form obeys). Run the ownership test: could a competitor's film say this? Only then choose techniques." Credit: Leonxlnx, cinetic.

## Rejected or weak

- **opusvideo/awesome-claude-video, main README listings.** Most cases are a link plus one line ("go all out", "modern slick punchy"); only the IMPLEMENTATION_GUIDES cases carry usable method. Mined for patterns 3, 4, 5, 7; the rest is a showcase.
- **OfficeChai roundup (web).** In my fetch only about half of the ten items state any method; timings are self-reported and unverified; a hype index, not a source.
- **MindStudio "Claude Motion" article (web).** Describes a product workflow (palette from a screenshot, comment on an element) in the author's words; no prompts or code; I could not verify its claims about model, plan or a gallery. Weak.
- **Remotion "Claude Code getting started" (web).** Setup steps only (`npx remotion skills add`); no technique. We already have it.
- **video-talkcraft and video-shotcraft workbench, JianYing export, social publishing.** A CapCut-style editor and China-market export; not our workflow. Only the one-round-then-ask review rule and the contact-sheet token saving were kept.
- **video-shotcraft "Ink Press" template mode.** A fixed product-promo template; templated looks are what we avoid. The recipe cards are useful, the template is not.
- **motionmaxxing (Tejashmakwana).** Per the gallery data its samples were generated with GPT, not Claude; not opened. Out of scope.
- **Remotion trailer (remotion-dev).** Human-made, pre-Claude; polish reference only, no method.
- **iart-ai/motion-skills.** A catalogue of 19 packs for an outside product; the README's deliver-and-verify loop is something we already do; I did not open individual packs.
- **Not read in depth in this pass:** Barty-Bart/motion-graphics, digitalsamba/claude-code-video-toolkit, naveen-annam brand film, meetmati-ai MATI-teaser, latent-spaces/brag (already vendored under `third_party/`), heygen-com/hyperframes core. I have no evidence from them. The brand-film and toolkit repos may be worth a source read for transition and voice-over code.
- **cinetic's hard bans taken literally** (no serif, no italic, no cream, no orange, no purple). The author's house style; we need the mechanism (lint plus reviewer), not these bans.
- **Unverified claims in this report:** "14k stars" and "124 cards" come from the gallery data and README; "28 professional films", "eight films" and all pacing numbers are the authors' own measurements of films I cannot see; the evaluation tables in cinetic are self-run. Hyperframes viewer links and all videos were not opened.
