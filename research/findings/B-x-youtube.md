# Findings B: X and YouTube items

Slice: the X and YouTube items in `research/gallery/x_youtube_web.json`, the web write-ups next to them, and `projects/2026-10-28-studio-showreel/inspiration.md`. Written 2026-10-29.

## How this was gathered, and what is not verified

- Read in full on prompt-motion.com (via `prompt-motion-search` `show.mjs` / `search.mjs`, 1 req/s, about 14 page fetches, no `/api/`): @twoclipping (UI-morph 5cba86, photo print 221cab, 3D fly-over d89be5), @ultimaxbt (orange dot bbebf5, food craving 2ddf1e), @rossaxbt (3085b7), @LexnLin (038035), @lukasersil (0ed38e), @Ror_Fly (9950f1).
- Also fetched: the RapidEye article, the Remotion Claude Code docs page, and videohighlight AI summaries for the two Remotion YouTube videos.
- **No video was watched.** Every claim about "what the result looked like" comes from the prompt text, captions and the earlier gallery notes. Where a finding says "shown in a finished film" it means the author posted a finished film with that prompt; I did not see it. Prompt text states intent; whether the film fully achieved it is unverified.
- @donaldjewkes (12 h unattended music video) is not on prompt-motion (search returned nothing); only secondary articles exist, and the gallery notes two different status URLs. Unverified, nothing adopted from it beyond a weak "long brief" note.
- Nate Herk (YouTube 7jHXoPGnA4c): the openclawdatabase page I tried did not hold his summary, so his claims (transcribe first, reference video turned into a skill, screenshot self-review) stay at "only claimed, second-hand, from the gallery JSON".
- The Remotion docs page is only a setup page (create-video, `npx remotion skills add`, `npm run dev`, agent in a second terminal). No prompting or QA advice there; nothing new for us.
- The three "viral showreel" one-liners (@shneural, @himanshutwtxs, @stephanlivera, @ajith_io, @lukasersil) are one paragraph prompts; their quality came from model and effort, so they yield no technique.
- Fetched content was treated as data. No code from it was run. All prompt skeletons below are my own paraphrase; short quoted phrases are credited.
- Everything is "adopt as a technique", never as a copy of anyone's film. Credit the author whenever a rule from here is cited in a brief.

What the studio already does (so not repeated as new): beat grid and hits table as shared module, closed-form springs and sum-of-springs, log-space zoom and speed-curve camera, flood overscale, shared-element transitions, 4-subframe motion blur, single-frame pop scan, contact and phone sheets, -14 LUFS with limiter, sidechain ducking, SVG per-character type, loop-frame-0 rule, banned-defaults list, staged brief/direction/storyboard/one scene gate.

---

## Findings (ranked by value)

### F-B1: The tagged brief skeleton with an ask-first `<inputs>` block and a `<start>` gate
- **Category**: prompting, process
- **What it is**: Every strong @twoclipping, @ultimaxbt and @rossaxbt prompt is split into fixed tags: inputs (what to ask the user for, with defaults if skipped), direction (look plus a Banned list), structure (beat map or timed scenes), build (numbered engineering rules), gotchas (known failure modes), start (what to show before any code). The last tag is the gate: show the beat map and 4 to 8 named stills first, then build.
- **Why it is good**: It turns "a film" into a contract the model cannot quietly reinterpret, and it puts the approval stop where it is cheapest (before code). The gotchas tag front-loads defects that otherwise cost a render round each. Strength: the same skeleton recurs in five independent finished films by two authors; strong pattern evidence, quality of results not independently checked.
- **Adopt?**: Yes. It maps one-to-one onto our 10 ingredients plus staged gate, but our prompts lack two parts: a per-film gotchas block and a stills-to-show list in the start gate.
- **Where it goes**: `prompts/40-brief-template.md` (add `Gotchas` and `Start gate` fields), `prompts/12-build-one-scene.md` (stills named by scene), `skills/motion-director/references` brief template; one paragraph in `skills/motion-studio/references/workflow.md`.
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-221cab and https://prompt-motion.com/ultimaxbt-bbebf5 (zero @twoclipping, ultima @ultimaxbt)

### F-B2: Negative constraints as the quality lever (a banned list per film, in the direction tag)
- **Category**: direction, prompting
- **What it is**: The prompts spend as many words on what must not appear as on what must. The photo-print film bans crossfades, blur-ins, brightness "developing", 3D flips, particles, glows, holds over 1 s and "anything that looks like a template"; the UI loop bans bouncy easing, gradients on chrome, mismatched icon strokes and dead time. The ban list is written for the specific film, not generic.
- **Why it is good**: Bans remove the model's defaults (fade, glow, particle burst), which is exactly where "AI look" comes from. Our `design.md` has a global ban list but the per-film list is not a required brief field. Strength: shown in finished films by two authors; the causal claim ("bans keep it premium") is the gallery's reading, not proven.
- **Adopt?**: Yes. Fits "no plain templated looks".
- **Where it goes**: `prompts/40-brief-template.md` (mandatory "Banned for this film" line, seeded from `design.md`); `skills/motion-review/references/rubric.md` (reviewer checks each film's own ban list, not only the global one).
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-221cab, https://prompt-motion.com/twoclipping-5cba86 (zero @twoclipping)

### F-B3: "Every scene is made out of the previous one" as a hard structural rule, with an explicit morph vocabulary
- **Category**: transitions, direction
- **What it is**: One continuous take, zero cuts or fades: text rises out of a mask line, an icon pops from zero on a spring, bars draw across, a page pushes in, a black shape floods the frame and contracts into the next scene, a circle becomes a square becomes a bento, a button carries its label into the next page, a lime flood carries a copy of the bubble's words. The brief lists each hand-off as "A becomes B".
- **Why it is good**: Writing every transition as a named shared element in the structure tag is what removes crossfade defaults, and a hand-off list is checkable in a contact sheet (does frame N-1 contain the thing frame N grows from?). We already have shared-element transitions as a concept; this adds the discipline: the storyboard transition column must be "X becomes Y", never "cut" or "fade". Strength: shown in two finished films (photo print, food craving); the studio's own inspiration file already adopted the idea as rule 2.
- **Adopt?**: Yes, as a storyboard rule for UI and product pieces; maybe for type pieces where our learnings say a hard cut onto a set page is fine.
- **Where it goes**: `skills/motion-director` storyboard transition column rule; `skills/motion-studio/references/vocabulary.md` (add the morph vocabulary: iris, accordion squeeze, flood-and-contract, bezel grows out of screen edge, mat grows from photo edge, text rises from mask line); `skills/motion-review/references/rubric.md` (transition check: name the carried element).
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-221cab, https://prompt-motion.com/ultimaxbt-2ddf1e (zero, ultima)

### F-B4: Camera driven by an integrated speed curve with a target table, verified by optical flow
- **Category**: camera, QA/review
- **What it is**: Instead of position keys, the 3D fly-over prompt gives a table of speed as a share of cruise at timestamps (0 at 0 s, 0.5 by 0.6 s, 1.0 by 1.6 s, held 0.94 to 1.1, easing to 0.12 at 8.3 s) and integrates it into position; zoom runs in log space; the rise and dive are separate eased passes that pin an edge of the page to a fixed screen line. The check: measure a quick 30 fps preview with optical flow and require that the speed never dips and the zoom never turns into zoom-in during the flight.
- **Why it is good**: Our learnings already have the integrated smoothstep speed curve; what is new is (a) the speed table as the brief's camera language and (b) optical flow as an automated test for "no surges, no stops", a defect that stills and contact sheets cannot show. Strength: described precisely in the prompt, the film was posted; flow-test results not shown.
- **Adopt?**: Yes for the flow check (cheap, ffmpeg or OpenCV on a 30 fps draft, personal repo). The speed-table brief format: yes, for any glide shot.
- **Where it goes**: `skills/motion-studio/references/review.md` (new "camera continuity check": per-frame mean flow magnitude plot, flag dips and sign changes) plus a small tool next to `skills/motion-review/tools`; `skills/motion-studio/references/motion.md` camera section (speed table format).
- **Effort**: M
- **Source**: https://prompt-motion.com/twoclipping-d89be5 (zero @twoclipping)

### F-B5: Measure, do not guess: velocity-over-time plot as the first debugging step for motion bugs
- **Category**: QA/review, process
- **What it is**: A real production write-up: five plausible fixes for a card that stalled and snapped on exit all failed; plotting position and velocity against time showed velocity hitting zero for about 16 percent of the duration, because a bob wave only covered the rise phase, not the element's whole lifetime. Fix: scope the wave to the full lifetime; the curve became continuous.
- **Why it is good**: We review by stills, which cannot see a velocity dip. A tiny debug overlay or script that samples a scene's animated values per frame and plots them catches stalls, kinks and false overshoots in seconds. Strength: one author's account of a real 13-scene, 20-render project; the 30 s versus 1 h comparison is self-reported.
- **Adopt?**: Yes.
- **Where it goes**: `skills/remotion-studio/references/inspect-render.md` and `skills/motion-studio/references/qa.md` ("motion bug: plot value over frames before changing code"); `prompts/15-fix-defect.md` (first step for motion defects); optional `studio/src/lib` debug helper that sums springs to a curve (also serves the "graph drawn from the same function" idea).
- **Effort**: S for the rule, M for a reusable plot helper
- **Source**: https://rapideye-seo-tools.pages.dev/blog/building-our-launch-video-with-claude/ (Samuel Parks, RapidEye)

### F-B6: Per-scene tuning page with a slider for every number, render only when it looks right
- **Category**: pipeline/tooling, process
- **What it is**: Each scene was built as a small web page where every numeric value (size, spread, gravity, easing, per-logo scale) had a slider; the author tuned live and asked for a render only when happy. One scene with a count slider produced 8, 30, 80 and 200 item variants of the same physics for four different cuts.
- **Why it is good**: It moves taste decisions from prompt rounds to direct manipulation and makes density variants free. In Remotion this is a props schema plus the Studio's props panel (zod `schema`), which is the same idea natively. Strength: written up by the author of a finished launch video; only one source.
- **Adopt?**: Yes for Remotion (zod schema on scene components; no new tooling). Maybe for the HTML engine (a tiny `?tune` panel in the player).
- **Where it goes**: `skills/remotion-studio/references/phases.md` (build step: expose tunables via schema, record the final values in `timing.ts`); `studio/DESIGN_SYSTEM.md` note; HTML player option in `skills/motion-studio/template`.
- **Effort**: M
- **Source**: https://rapideye-seo-tools.pages.dev/blog/building-our-launch-video-with-claude/ (Samuel Parks)

### F-B7: Webpage to 3D fly-over pipeline: capture the live page as separate layers, rebuild as textured quads
- **Category**: pipeline/tooling, camera
- **What it is**: Open the target page in headless Chromium at 1440 px and device scale 2, scroll once so lazy content loads, tag lift-able elements with a data attribute, screenshot the page with them hidden and each piece alone on transparency, store their page positions as JSON. A WebGL2 page then draws the page as a floor quad and each piece as its own quad at its own height with fake shadows (same picture flattened to one colour, offset and blurred by height) and a per-pixel depth of field whose blur radius follows distance from focus (different constants in front and behind, capped).
- **Why it is good**: It is a repeatable way to make a site "launch film" from real pixels, avoiding fake div UIs, and it uses the same layered-capture idea as our `capture.md`. Gotchas in the prompt are practical: fade pieces into the haze colour before cutting to transparent, keep lifts to 20 to 40 px, lock the page layout first because any height change shifts everything after it. Strength: precise prompt, film posted; I did not see it.
- **Adopt?**: Maybe. The capture-by-layer step is directly reusable for the HTML engine; the full 3D fly-over conflicts with our learning that faux-3D UI and tilted pages were rejected, and `design.md` bans tilted pages and DoF on UI. Treat as an optional "site showcase" recipe, with the fly-over only if a brief asks for it.
- **Where it goes**: `skills/motion-studio/references/capture.md` (new section "Website layer capture") and `skills/motion-studio/references/three-d.md` (link, with the taste caveat); a candidate `prompts/64-site-flyover.md` later.
- **Effort**: L
- **Source**: https://prompt-motion.com/twoclipping-d89be5 (zero @twoclipping)

### F-B8: Beat map first: "something happens on every beat", BPM, bar count, and the song's drop as a structural anchor
- **Category**: direction, sound
- **What it is**: The briefs fix BPM and total beats (120 BPM, 7 bars or 54 beats; 130 BPM, 32 beats), start the song a stated number of beats before its drop (12 beats before), and write the structure as beat ranges. The zoom lands on the drop, a quiet breakdown carries the hold scene, the opening word returns on the beat when the loop restarts. The first deliverable shown to the user is the beat map.
- **Why it is good**: It makes sync a property of the plan rather than a late edit; our hits-table practice already supports it but the storyboard template does not ask for beats-first on music-led films. Strength: consistent across four films; sync quality not verified by me.
- **Adopt?**: Yes for music-led pieces (showreels, loops), not for voice-led films (voice sets the pace there). Counter-rule from our learnings stays: the page never empties between beats, and "something on every beat" must not become constant motion; use it as "no dead time", not "always moving".
- **Where it goes**: `prompts/11-storyboard.md` (optional beat-map table: beat, bar, event, sound), `skills/motion-director` storyboard section, `skills/motion-studio/references/audio.md` (drop anchoring).
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-5cba86, https://prompt-motion.com/ultimaxbt-2ddf1e (zero, ultima)

### F-B9: Perfect-loop discipline: last frame equals first, including cursor position and speed
- **Category**: direction, QA/review
- **What it is**: Two films end by returning the same objects to the opening state (wordmark returns to the dot, orange dot goes back through halftone, graph and toggle). The gotchas call out the loop stutter causes: cursor position and cursor speed must match at the seam, accent, cursor and type identical in first and last frame.
- **Why it is good**: We already note "end by re-setting the opening word in its exact frame-0 position". The new part is the checklist (cursor speed, not only position) and the loop test: diff last frame against first and render a loop-twice draft. Strength: stated in the prompts; films posted; seam quality not verified.
- **Adopt?**: Yes for social loops and the showreel.
- **Where it goes**: `skills/motion-studio/references/qa.md` (loop checklist plus an ffmpeg frame-diff of frame N-1 to frame 0 and a double-length preview); `prompts/52-recompose-formats.md` note for loop pieces.
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-5cba86, https://prompt-motion.com/ultimaxbt-bbebf5

### F-B10: One thread object + curve drawn from the motion function (proof, not illustration)
- **Category**: direction
- **What it is**: A single dot is the connective element through a UI toggle, a letter, a spring graph, a growing shape and the end card; the graph is traced by the same spring function that moves the dot, and the circle, rotating square and pill are states of one shape that keeps its position. Motion not attached to something already on screen is banned.
- **Why it is good**: It gives a 15 to 20 s multi-technique piece a spine, and the curve-from-same-function rule makes technique demos self-proving. Already captured in the studio showreel inspiration (rules 1 and 5), so value now is making it a reusable component and a showreel-brief default. Strength: shown in a finished film; rule already adopted in our brief.
- **Adopt?**: Yes (already adopted for the showreel; extend to the library).
- **Where it goes**: `studio/src/lib` candidate component `ThreadDot` plus `SpringGraph` that takes the same spring config as the mover (documented in `studio/DESIGN_SYSTEM.md`); `prompts/63-kinetic-type-hook.md` note.
- **Effort**: M
- **Source**: https://prompt-motion.com/ultimaxbt-bbebf5 (ultima @ultimaxbt)

### F-B11: Voice pipeline details: multiple full takes, per-line regeneration, pause shortening, onset-aligned segment-wise Whisper
- **Category**: sound, pipeline/tooling
- **What it is**: Four full-script takes for the user to choose from; a bad line is regenerated 4 times and the best one spliced in; pauses over 0.28 s shortened to 0.2 s; phrase levels pulled 85 percent toward the median using gain changes only inside pauses; word timing from splitting the read at pauses of 100 ms or more, transcribing each segment separately, and aligning each segment's first word to the measured onset (a single Whisper pass is said to place words up to half a second late). Music ducked with a 3-band sidechain (lows 30, mids 85, air 55 percent, 0.3 s hold, 50 ms look-ahead, 0.5 s release) and the voice checked at about 9 dB above music between 300 Hz and 4 kHz per phrase.
- **Why it is good**: Our `voice.md` has Kokoro with 3 to 4 cast samples and plain faster-whisper, and learnings record Whisper misheard one-word lines. Segment-wise alignment to measured onset and the per-phrase voice-to-music ratio check are measurable improvements. Strength: described precisely in a finished film's prompt; the "half a second late" figure is the author's claim and I did not test it.
- **Adopt?**: Yes for the alignment trick and the ratio check; maybe for the 3-band ducker (our single sidechain works; try only if a mix sounds muddy). The ElevenLabs part: no (we use local Kokoro, no API keys).
- **Where it goes**: `skills/motion-studio/references/voice.md` (segment-wise Whisper with onset anchoring; per-line regeneration; pause normalisation) and `references/audio.md` (voice-over-music ratio check per phrase).
- **Effort**: M
- **Source**: https://prompt-motion.com/rossaxbt-3085b7 (testarossa @rossaxbt)

### F-B12: Eight motion-blur subframes for fast moves, plus "slow the move down" as the alternative
- **Category**: pipeline/tooling, QA/review
- **What it is**: Two authors independently found that 4 subframes leave ghost copies on fast moves; they render 8 subframes (the fly-over uses 16 across 0.7 of a frame, a shutter angle below 360 degrees) and slow the move down if ghosting remains.
- **Why it is good**: Our engine and `motion.md` standardise on 4 subframes. For flood transitions, wipes and drags, 4 is the likely cause of visible stepping. Making subframe count and shutter fraction per-shot parameters (8 for fast moves, 4 elsewhere) costs render time only where needed. Strength: stated in three prompts as a known gotcha; I did not measure our own output.
- **Adopt?**: Yes, as a per-shot override and a QA step: zoom into a fast-move frame pair and look for ghost steps.
- **Where it goes**: `skills/motion-studio/references/motion.md` (blur section) and `skills/motion-studio/references/engine.md` (render options); `studio` Remotion equivalent (render the same frame at sub-offsets and blend, documented in `skills/remotion-studio/references/inspect-render.md`).
- **Effort**: S
- **Source**: https://prompt-motion.com/ultimaxbt-2ddf1e, https://prompt-motion.com/twoclipping-d89be5

### F-B13: A catalogue of render and layout gotchas worth encoding as checks
- **Category**: QA/review, pipeline/tooling
- **What it is**: Concrete, tested-by-failure lessons from the prompts: `will-change` on anything scaled by the camera makes text blurry; a child with `visibility: visible` shows through a hidden parent (use `inherit`); a flood needs about 0.3 to 0.35 s and must overscale past all corners or half the screen changes in one frame; set z-index on every layer so cards do not float above a flood; keep typed text on fixed lines so the camera never follows a wrapping cursor; text that swaps inside a morphing shape needs its own mask and its own enter/exit timing; a 0.05 s fade reads as a pop (fades at least 0.3 s unless intentional); a highlight box behind a word reads as a Windows text selection; if the camera resets to 1.0 at a hand-off the zoom snaps (start the next scene at the zoom the last ended on); looped footage should be re-encoded all-intra (`-g 1`) and seeked by blob URL because simple static servers cannot range-seek; fading cards out through transparency shows what is behind them, so fade into the haze colour first.
- **Why it is good**: Each item is a defect we either already hit (flood overscale, camera reset) or will. Several are new for us: `will-change` blur, visibility inherit, the highlight-box tell, minimum fade length, all-intra footage. Strength: failure-derived, from finished films; the two already in learnings corroborate their credibility.
- **Adopt?**: Yes.
- **Where it goes**: `skills/motion-studio/references/learnings.md` (technique lines, credited as external); `skills/motion-studio/references/qa.md` pre-draft checklist; `skills/motion-review/references/rubric.md` (min fade length, selection-box tell).
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-221cab, https://prompt-motion.com/rossaxbt-3085b7, https://prompt-motion.com/twoclipping-d89be5

### F-B14: Tell the user up front what can only be previewed vs rendered (capability honesty clause)
- **Category**: process, prompting
- **What it is**: The fly-over prompt includes an instruction for the case where the agent cannot run code on the user's machine: say immediately that only a live preview is possible and that the MP4 needs Claude Code. The `<start>` tags likewise require stills before render.
- **Why it is good**: It matches our "if you could not look, say so" rule and extends it to render capability. Cheap and prevents a false "done". Strength: only claimed in a prompt; not observed.
- **Adopt?**: Yes, one line.
- **Where it goes**: `skills/remotion-studio/SKILL.md` and `skills/motion-studio/SKILL.md` golden rules ("say at the start what you cannot render or view"); `prompts/00-master-workflow.md`.
- **Effort**: S
- **Source**: https://prompt-motion.com/twoclipping-d89be5

### F-B15: Staged asset pipeline for long explainers (foundations, art direction file, storyboard file, asset spec, batch assets, motion primitives, then scenes)
- **Category**: process, pipeline/tooling
- **What it is**: A nine-phase Remotion explainer workflow: write ground rules to a markdown file; define art direction vocabulary ("what does clean mean") in a file; approved timeline becomes a storyboard file; inventory assets before generating; generate assets by category; define reusable motion primitives first; assemble; then generate scene code one scene at a time on larger projects.
- **Why it is good**: Matches our flow, with two additions: an asset specification step before any asset exists, and motion primitives defined before scenes (our `studio/src/lib` plus `learnings.md` already cover primitives, but per-film "primitives" are not an explicit stage). Strength: AI summary of a YouTube video I did not watch, channel inferred; low confidence.
- **Adopt?**: Maybe. Add the asset-spec step to the plan stage; the rest we already have.
- **Where it goes**: `skills/remotion-studio/references/phases.md` (Design phase: asset spec table + per-film motion primitives list).
- **Effort**: S
- **Source**: https://www.youtube.com/watch?v=xAUifztpib8 (channel inferred as AndyNocode, via https://videohighlight.com/v/xAUifztpib8 summary)

### F-B16: Transparent-background renders for overlays and stingers (alpha export)
- **Category**: pipeline/tooling
- **What it is**: Two sources render Remotion output with alpha: a Remotion tutorial for lower thirds and subscribe animations into Final Cut, Premiere or CapCut, and the RapidEye pipeline (4K 60 fps transparent ProRes 4444 into After Effects as a layer).
- **Why it is good**: Lets us use the studio library as an overlay generator (lower thirds, stingers, titles) over live footage, a use the repo does not document. Strength: claimed by two sources; neither verified by watching.
- **Adopt?**: Maybe. Only if overlays for external editors become a use case; a short recipe is enough (Remotion `--codec=prores --prores-profile=4444` with pixel format yuva444p10le, or VP9/WebM alpha).
- **Where it goes**: `skills/remotion-studio/references/delivery.md` (one "alpha export" section, to be verified by a test render before relying on the flags).
- **Effort**: S
- **Source**: https://www.youtube.com/watch?v=kXmY6yQa5q4 (channel inferred as Pouya Eti, via videohighlight summary); https://rapideye-seo-tools.pages.dev/blog/building-our-launch-video-with-claude/ (Samuel Parks)

### F-B17: Liquid glass by cloning the scene behind each glass element and displacing it (not backdrop-filter)
- **Category**: typography, pipeline/tooling (material look)
- **What it is**: Each glass control holds its own clone of the scene behind it, filtered with an SVG displacement map derived from a rounded-rect distance field, run through three displacement filters at slightly different scales for chromatic edges, plus a rim light; goo effects use blur plus an alpha threshold composited back on top. The prompt records that `backdrop-filter: url()` misreads displacement maps in Chromium.
- **Why it is good**: It is the only reproducible recipe I found for the glass look inside a deterministic page. Strength: precise technique in two films' prompts. However it is a trend look, adds a lot of per-element cost, and adds gradients and glow that clash with our flat, one-accent taste.
- **Adopt?**: No for the default look; keep as a documented recipe only if a brief asks for it.
- **Where it goes**: if ever, `skills/motion-studio/references/design.md` as "optional material: glass (not default)".
- **Effort**: L
- **Source**: https://prompt-motion.com/twoclipping-221cab (zero @twoclipping)

### F-B18: Reference video to brief, with a "take techniques, change the design" rule
- **Category**: prompting, process
- **What it is**: The engraving-style ad prompt attaches a reference video and asks the model to study smoothness, timing, shot durations, fonts and elements, borrow techniques, but change the overall design so it looks done from its own taste; research brand assets first; bans "beige artsy" and eyebrow labels. A YouTube summary adds a similar idea (turn a reference video into a reusable skill).
- **Why it is good**: The split "techniques yes, design no" is a clean wording for `prompts/20-reference-analysis.md`, which already says no copying. The "no eyebrow labels" ban matches our taste. Strength: the prompt is a short checklist, the film posted; the skill-from-reference claim is second-hand.
- **Adopt?**: Maybe. Mostly already covered; add the shot-duration measurement and the wording.
- **Where it goes**: `prompts/20-reference-analysis.md` (measure shot durations per scene, state what is borrowed vs changed).
- **Effort**: S
- **Source**: https://prompt-motion.com/lexnlin-038035 (Leon Lin @LexnLin); https://www.youtube.com/watch?v=7jHXoPGnA4c (Nate Herk, unverified)

---

## Prompt patterns worth keeping

_These skeletons are paraphrased structure in our own words, not quotations from the sources; credits name where each idea came from._


Skeletons in my own words; adapt to Remotion and our tokens; credit the author if a pattern is cited in a brief.

1. **Tagged brief** (zero, ultima, testarossa): `<inputs>` what to ask the user for, with defaults if skipped; `<direction>` look, type, cursor, one accent, then `Banned:`; `<structure>` timed or beat-ranged scenes; `<build>` numbered engineering rules; `<gotchas>` known failures; `<start>` ask for inputs, then show the beat map and N named stills before the full build.
2. **Ban list line**: Banned: crossfades, blur-ins, [x], [y], holds longer than 1 s, anything that looks like a template. Write it per film, seeded with our global bans.
3. **Beat map header**: [BPM] BPM, [N] beats, start the song [k] beats before its drop. Beats 0-6: [event]. Beat 12 (the drop): [event]. Last frame equals first frame. (zero, ultima)
4. **Hand-off line per scene**: Scene N is made out of scene N-1: [outgoing object] becomes [incoming object]; it carries [label/words/colour]; no fade, no cut. (twoclipping, ultimaxbt)
5. **Camera rule block**: One eased move per scene. Never zoom in and straight back out. Each scene starts at the zoom the last one ended on. Zoom in log space. Camera speed comes from one curve: [t: share of cruise] table, integrated into position. (ultima, zero, testarossa)
6. **Flood rule**: A flood overscales past the farthest corner and takes about 0.3 to 0.35 s; set z-index so nothing floats above it. (zero, ultima)
7. **Shot timing grid for a long glide**: list `start-end: what the camera and each lifted element does, with values` as in the fly-over structure, then a stills list at named timestamps (0, 1.6, 2.5, 5, 6.5, 9.3, 11 s) to check before render. (zero)
8. **Sound placement rule**: One SFX per event, placed by its measured peak; typed text gets one key sound per letter; click on each image change; music starts on a downbeat; loudnorm to -14 LUFS. (testarossa, ultima; our rule is to synthesise SFX, keep that, the placement logic is what carries over)
9. **Pre-show QA clause**: Before showing anything: contact sheet of stills, scan frame differences for single-frame pops (only the intended fast runs may jump), check voice-to-music level per phrase. (testarossa)
10. **Debug-by-plot clause** (RapidEye): If a motion looks wrong, plot the value over time and show me the curve before proposing a fix.
11. **Honest capability clause** (zero): If you cannot run code or view images here, say so first; do not describe results you have not seen.
12. **Reference clause** (Leon Lin): Study the reference for smoothness, timing, shot durations, fonts and elements. Borrow techniques, change the design so it looks like our own.

## Rejected or weak

- Viral one-line showreel prompts (shneural, himanshutwtxs, stephanlivera, ajith_io, lukasersil, leonabboud): quality came from model and effort; the words give no technique. Only use: lukasersil's phrase about a reel being "meticulously art-directed" as a reminder of the failure mode, already in our inspiration notes.
- @donaldjewkes 12-hour music video, @IterIntellectus, @kimmonismus, @achxvi, @joshaeeee, @prathoshap: only second-hand article blurbs, no prompts available; speed and duration claims unverified. The one transferable idea (style snippet of the creator's own footage as reference) is in F-B18.
- Gradient-emphasis word with glow, Apple-Intelligence-style iridescent conic glow, liquid glass as default (rossaxbt, ultimaxbt, twoclipping): violate one accent, no glows, no gradients; see F-B17.
- Downloaded Mixkit SFX instead of synthesised: licensing and consistency trade-off; our synthesised cues from the hits table are fine, only the placement-by-peak rule transfers.
- ElevenLabs voice with emotion tags: needs API keys, cloud; we use local Kokoro. The note that a "warmly" opener can sound whispered and "excited" can sound fake is only relevant if we change TTS.
- Negroni recipe (Ror_Fly): the prompt is two sentences; the idea (ingredients and measures appear as they go in) is a normal explainer pattern we already cover. No new technique.
- Nate Herk "free skills" and the 105 GB sizzle reel: footage-editing workflow, unverified, outside our motion-graphics scope.
- Remotion docs page and the official beginner video: setup only, we already have it.
- "Something happens on every beat" as a universal rule: valid only for music-led loops; for product films it contradicts our restraint rule.
- Claude Motion coverage (MindStudio), OfficeChai roundup: indexes, no technique.
