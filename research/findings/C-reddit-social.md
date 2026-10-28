# C: Reddit and TikTok/Instagram findings

Slice: `research/gallery/reddit.json` (17 items) and `research/gallery/instagram_tiktok.json` (12 items). Goal: new workflow methods, process rules and prompt patterns, judged against what the studio already does (staged prompts 00 to 70, `motion-director` with its Round 0 plan review, `motion-review`, `remotion-studio`, `motion-studio`, `learnings.md` read at the start of every build, `studio/DESIGN_SYSTEM.md` with safe areas, vignette, grain and approved transitions).

## How this was checked, and what could not be

- The `reddit.sentinel-team.org` mirror now returns "Page Not Found" for every post id, so it was not usable. The post text and comment trees were read instead from the public Pushshift-style archive `api.pullpush.io` (read-only), for 16 of the 17 posts. Vote counts below are the archive's snapshot and are often lower than the gallery's figures (the archive caught them early). The r/webdev GSAP post (`1tmnq4o`) was not in the archive, so it is unread.
- Gallery id mapping is partly wrong: `1sya1rc` is actually the "Can Claude make those slick demo videos" question (the gallery lists it as Tarun122's app-launch post and files the question under `1sw2dtm`); `1sw2dtm` is an unrelated Three.js life-sim post. Tarun122's "app launch animation" post was not located. Nothing below depends on the wrong mapping.
- The GitHub repo `RinDig/Animation-Workflow` was read through `gh api` (README, three skills, starter `CLAUDE.md`, style guide, visual philosophy, spec template). Nothing from it was run.
- No video was watched by anyone, including me. "Shown" below means the method is written out in a source I read or the repo exists; it does not mean the result was seen. "Only claimed" means the post asserts it.
- TikTok and Instagram: none of the 12 pages could be opened (JS and login walls), and 3 have no URL at all. Everything about the MOTION.md brand file, beat-synced cuts and the After Effects MCP comes from a one-line caption in the gallery file, not from the video. I treated those as leads, not findings, and put them under "Rejected or weak" with what to test if wanted.
- Everything fetched was treated as data. One comment tried to sell a "Tier-4 proxy provider" and another advertised a product; neither was followed.

---

## Findings, ranked by value

### F-C1: Reference scene as a working example, not a description
- **Category:** prompting
- **What it is:** Instead of describing a scene in words, paste one finished, well-built scene (real code, with its beat mapping, staggered delays, perspective flips and string-slice typewriter) into the prompt and ask for the new scene "in the same structure". The author's own gloss: show Claude a working component and it follows the pattern instead of inventing one.
- **Why it is good:** The poster saw text-only prompts produce generic fades, slide-ups and scales, and the reference-scene version produce beat-synced timing, 3D flips and cleaner easing. A separate high-engagement post (about 275 votes, but flagged by commenters as a vendor pitch) reaches the same conclusion for scripts: three hand-written examples beat describing the tone. A reader of the thread had to ask what a "reference scene" was, which suggests the idea is not widely practised. Strength: only claimed (0 votes, no video, 4 comments), but it is the standard few-shot principle and costs almost nothing to test.
- **Adopt?** Yes. New: the studio promotes finished pieces into `studio/src/lib/` after the fact (prompt 31) but never tells the builder to use one approved scene as the template for the next. Already covered: componentize and the design system. Add a "golden scene" rule: after scene 1 passes review, it is the reference for scenes 2 to N and for the next video of the same type.
- **Where it goes:** `skills/remotion-studio/references/phases.md` (build phase: "attach the golden scene"), `prompts/14-build-next-scene.md` (Studio additions: point at `studio/src/videos/<slug>/scenes/Scene01.tsx`), and a short "golden scenes" list at the end of `studio/DESIGN_SYSTEM.md`.
- **Effort:** S
- **Source:** u/Sangkwun, https://www.reddit.com/r/ClaudeAI/comments/1sbbwwu/ ; tone variant: u/Mullikaparatha, https://www.reddit.com/r/ClaudeAI/comments/1stutgf/ (treat claims with caution).

### F-C2: Regression guard per iteration (commit, diff, before/after stills) plus a decision log
- **Category:** process
- **What it is:** After every change request on a scene, commit it and read the diff, because an "improvement" sometimes removes something that was already right. The same author lists the failure modes that make this necessary: a scene rebuilt from scratch on day two, a few broken builds that had to be rolled back, and not trusting the model to keep context across 50+ scene changes.
- **Why it is good:** It is the most honest process write-up in the set ("about 100 prompts, not 1", a creative-direction doc of roughly 30 iterations before any code). Replies from other builders confirm the same pattern (a 3-day product-demo build where removing one scene shifted all later timing). Strength: shown as experience, not as a measured result. Votes were low (0), so reception is not a signal.
- **Adopt?** Yes. New: `CLAUDE.md` says "commit locally" but nothing asks for a checkpoint after each approved scene or for reading the diff after each revision. Already covered: the paper trail in `projects/<slug>/` and judging renders, not code. Add: one local commit per approved scene; on every revision pass, show `git diff --stat` and name anything that changed outside the request; re-render the previous approved stills of that scene and compare. Log decisions ("scene 3 hold is 45 f because of the voice line") in `notes.md` so a long session does not depend on memory. Local commits only, per the studio rule: no pushing.
- **Where it goes:** `skills/remotion-studio/references/phases.md` (build loop), `prompts/15-fix-defect.md` and `prompts/16-revision-feedback.md` (Studio additions: diff check and before/after stills), `CLAUDE.md` rule 6.
- **Effort:** S
- **Source:** u/TheHol1day, https://www.reddit.com/r/ClaudeAI/comments/1tbcoft/ ; u/darrirl comment on https://www.reddit.com/r/ClaudeAI/comments/1stutgf/ .

### F-C3: Let the picture lead the voice slightly
- **Category:** sound (sync)
- **What it is:** When a visual is tied to a spoken phrase, start it a fraction of a second before the word, because people expect light to arrive before sound. The commenter suggests about 250 ms for text that accompanies a phrase.
- **Why it is good:** It targets the commonest tell of voice-led work: captions and cuts that land exactly on the word feel late. Strength: only claimed (one comment, no demonstration), but it matches how real editors treat J-cuts and anticipation, and our own hits-table method makes it cheap to test. Do not take 250 ms on faith: for a hard cut or a caption, 80 to 150 ms (2 to 5 frames at 30 fps) is a more usual starting range; a slow reveal can lead by more.
- **Adopt?** Maybe, as a measured experiment. New: `learnings.md` states that cuts land on spoken words, but gives no lead or lag convention (the sound notes only record that SFX peaks run 6 to 14 ms late). Run one A/B on the next narrated film (picture at word onset versus onset minus 4 frames), pick by eye on the phone sheet, then record the number.
- **Where it goes:** `skills/motion-studio/references/audio.md` (a "lead" parameter in the hits table), `prompts/60-voiceover-film.md`, `skills/motion-studio/references/learnings.md` (after the test).
- **Effort:** S
- **Source:** u/Possible-Tone-7627, comment on https://www.reddit.com/r/ClaudeAI/comments/1tn9tyy/ (post by u/Silver-Range-8108).

### F-C4: QA loop that compares the render with a reference clip
- **Category:** QA/review
- **What it is:** Before delivery the pipeline compares its output with a reference clip and fixes the gaps it finds. The author says this reference-clip check was the biggest quality improvement; frames are sampled at a fixed rate and given to Claude together with the timestamped transcript so it can tell what happens when.
- **Why it is good:** The post had about 34 to 52 votes and two commenters picked the QA loop out as the part that matters; one adds that an agent which rejects its own bad output stabilised their quality (that comment links to the commenter's own product, so discount it). Strength: described, not demonstrated; the demo link may be dead per a commenter.
- **Adopt?** Yes, narrowly. New: `motion-review` scores a render against a rubric and the storyboard, never against an exemplar. Already covered: prompt 20 (reference analysis) and contact sheets. Add an optional input to `motion-review`: a contact sheet of the reference (or of our own approved golden scene) at the same timestamps, so the reviewer states "in what way does ours fall short of this", not just scores in a vacuum. Not applicable: talking-head cutting with silence detection (we do not edit raw footage).
- **Where it goes:** `skills/motion-review/SKILL.md` (Inputs: optional reference sheet) and `skills/motion-review/references/rubric.md`; `prompts/13-quality-review.md` (Studio additions).
- **Effort:** S
- **Source:** u/cowanscorp, https://www.reddit.com/r/SideProject/comments/1t6wzy5/ .

### F-C5: Vary tension and pacing; keep the polish checklist, drop the dogma
- **Category:** direction / transitions
- **What it is:** The most-read polish list (five rules: crossfade every cut, one expo-out curve everywhere, film grain and vignette, targeted SFX on chapter cuts only, cut scenes that do not earn their place within about 3 seconds) paired with its own best criticism: AI motion has "terrible pacing", a single even easing gives a bouncy, tensionless ride, with no sharp cuts or short fades. The poster agreed and added hard cuts by hand.
- **Why it is good:** The criticism is more useful than the list. Both the 64-vote polish post and two separate comments (on a 30 s launch video and on the 97-vote lower-thirds post, which was heavily criticised as generic and likely to look dated) describe the same fault: even rhythm and long fades. Strength: the fault is widely reported; the fix is judgement, not a recipe.
- **Adopt?** Maybe, as a review criterion, not as a rule. Already covered: we have vignette and grain, an approved easing set, "overlap exits with entrances" and "a different typographic action per scene" in `learnings.md`, which already argue against one reused curve. New and worth adding: (a) a pacing check in `motion-review` ("name the one hard cut and the one fast fade; if every transition has the same duration, flag it"), (b) the "does this scene earn its place in 3 seconds" cut test in `motion-director`'s plan review, (c) "SFX only on structural moments" as an explicit sound rule. Reject "crossfade every cut" and "one easing everywhere" as written, since they produce exactly the look commenters mock.
- **Where it goes:** `skills/motion-review/references/rubric.md` (pacing dimension), `skills/motion-director/references/director-review.md` (earns-its-place test), `skills/motion-studio/references/audio.md` (SFX restraint line).
- **Effort:** S
- **Source:** u/Top_Commission_8567, https://www.reddit.com/r/ClaudeAI/comments/1tik0qe/ ; critics u/kylecito (same thread and https://www.reddit.com/r/ClaudeAI/comments/1t51k8s/ ) and u/Historical_Moose_468 and others at https://www.reddit.com/r/ClaudeAI/comments/1tn9tyy/ .

### F-C6: Measurable acceptance criteria, and a project glossary for vague words
- **Category:** prompting
- **What it is:** Two linked rules. First, state outcomes and thresholds ("keep headroom under 20 percent") instead of CSS values, because exact values were misread and broke things. Second, never ask for "punchier" or "make it better" without first defining the word in motion terms for this video (frames, px, curve), because the model knows React but not what "punchy" means.
- **Why it is good:** Two independent posters hit the same wall (the edited-footage pipeline and the 50-second launch film), and both list "make it better" as the thing that did not work. Strength: only claimed, but consistent.
- **Adopt?** Yes, as a small addition. Already covered: `prompts/41-vocabulary-cheatsheet.md` already tells Claude to translate "smooth, premium, pop, cinematic" into values and say its translation. New: write the translations down once per video, in `brief.md`, as a glossary ("punchy = entrances at most 10 frames, one scale event per scene, hard cut into the next") so the same word means the same thing in round 3 as in round 1; and let revision prompts cite acceptance criteria that can be checked on a still ("title block no closer than 120 px to any edge", "focal point alone for at least 45 frames").
- **Where it goes:** `skills/motion-director/templates/` (brief template gets a "Glossary" block), `prompts/16-revision-feedback.md` (output: acceptance criteria per change), `prompts/40-brief-template.md`.
- **Effort:** S
- **Source:** u/FerretVirtual8466, https://www.reddit.com/r/ClaudeAI/comments/1ry69qi/ ; u/TheHol1day, https://www.reddit.com/r/ClaudeAI/comments/1tbcoft/ .

### F-C7: Plan critic as a gate before the expensive step, and "explain the plan before coding"
- **Category:** QA/review
- **What it is:** A separate critic agent reviews the editorial plan before anything renders ("most bad renders come from bad plans, not bad execution"); the launch-film author adds a step where Claude explains its plan in words before writing code.
- **Why it is good:** The idea of reviewing a plan before spending render time is sound and was reached independently by two posters. Strength: only claimed; no numbers.
- **Adopt?** Mostly already done. We already run a strict director review of the storyboard (Round 0, `motion-director`) and a scored review after scene 1. What is missing is a lightweight check at the build step itself: before coding scene N, the builder states in five lines what it will build and what it will leave untouched, and (for a risky scene) a fresh subagent that did not write the plan lists the five weakest decisions. Keep it optional so it does not slow simple scenes.
- **Where it goes:** `prompts/12-build-one-scene.md` and `prompts/14-build-next-scene.md` (Studio additions: "state the plan first"), `skills/remotion-studio/references/phases.md`.
- **Effort:** S
- **Source:** u/FerretVirtual8466, https://www.reddit.com/r/ClaudeAI/comments/1ry69qi/ ; u/TheHol1day, https://www.reddit.com/r/ClaudeAI/comments/1tbcoft/ .

### F-C8: Audit the studio by tracing a different kind of video through it
- **Category:** process
- **What it is:** To test the whole system, describe a completely different type of video than any made so far and trace what the setup would actually do, step by step. The author found half of what they thought was built existed only in documents, and that the system would have produced a cyberpunk-styled yoga tutorial.
- **Why it is good:** It tests the failure our own repo risks most: many skills, prompts and learnings that promise things, and one house style that may bleed into every job. Strength: only claimed (2 votes), but the method is cheap and the result is a concrete list.
- **Adopt?** Yes, once. New: nothing like it exists; `prompts/70-post-mortem.md` reviews one finished video, not the system. Run it with two unlike briefs (a warm 9:16 recipe reel and a dense data explainer), with a fresh agent tracing each from `CLAUDE.md` to a rendered storyboard, listing every place a doc promises a tool, path or component that does not exist and every default (colour, type, motion) that leaked in from earlier work.
- **Where it goes:** new `prompts/71-system-audit.md` plus a line in `prompts/INDEX.md`; findings into `research/findings/` or `notes.md`.
- **Effort:** M
- **Source:** u/FerretVirtual8466, https://www.reddit.com/r/ClaudeAI/comments/1ry69qi/ .

### F-C9: Additions to our scene spec from the Animation-Workflow repo
- **Category:** pipeline/tooling
- **What it is:** The repo (read in full) structures a video as: a spec per video with an overview, a colour-flow table (section, time, dominant colour, mood), per-scene blocks (narration, frame-range visuals, components, notes) and a list of placeholder locations where real footage will replace animation; a style guide with enforced minimum type sizes; a "visual philosophy" file with a density scale (sparse, medium, dense) and named anti-patterns (motion sickness, effect soup, dead air, distraction); and a component registry whose core components enforce the style guide by construction (a text variant cannot be set below its minimum size) with a promote-to-core rule.
- **Why it is good:** Strength: shown, because the files exist and are consistent, and the author reports over ten minutes of script-aligned animation in about an hour (a claim, 6 votes). Most of it we already have in stronger form (tokens, `DESIGN_SYSTEM.md`, safe areas tuned for 9:16, storyboard template with hits table, prompt 31). The registry's rule "check the registry before building; core components enforce the style guide" is already how `remotion-studio` is written.
- **Adopt?** Partly. Not new: spec per scene, style guide, component registry, promote-to-core, deterministic frames. New and cheap: (a) a colour-flow table and a "real footage goes here" placeholder list in the storyboard template; (b) a density tag per scene (sparse, medium, dense) so dense scenes are rare and deliberate; (c) the anti-pattern list as review flags, especially "dead air: a static screen under the voice"; (d) make minimum sizes unavoidable by clamping inside the text components rather than only documenting them (check `studio/src/lib` first; our type scale may already do this). Not adopted: its fixed 1920x1080-only sizes and purple/blue "colour psychology" table, which pull toward a stock look.
- **Where it goes:** `skills/motion-director/templates/storyboard.md`, `skills/motion-review/references/rubric.md`, `studio/DESIGN_SYSTEM.md` (clamp note).
- **Effort:** S to M
- **Source:** u/VanCliefMedia (repo RinDig/Animation-Workflow), https://www.reddit.com/r/ClaudeAI/comments/1qyseq3/ and https://github.com/RinDig/Animation-Workflow (read via `gh api`, not run).

### F-C10: "A story with a breaking point" for explainers and data visuals
- **Category:** prompting / direction
- **What it is:** Ask for a small physical story where something builds up and then fails visibly ("five glasses fill with risk, the last overflows"), and describe it as steps with a state change at each step: start calm, increase one thing over N steps, then a sudden failure with a clear visual change. Add constraints that stop over-building: a single screen, no scrolling, loopable, minimal interface, and input to visible transformation to output.
- **Why it is good:** The thread's author and one commenter, working independently, both found this the one pattern that reliably gave interesting output. Strength: only claimed (3 votes), no sample shown, but it fits a hook-first approach and our existing "felt human moment as hook" lesson.
- **Adopt?** Yes as a prompt pattern for explainers, data stories and kinetic hooks. Already covered: hook thinking in `learnings.md`. New: the explicit "build-up, visible failure, mapped to numbered steps" skeleton and the minimal-screen constraint.
- **Where it goes:** `prompts/63-kinetic-type-hook.md`, `prompts/62-data-visualization.md` (Studio additions), `skills/motion-director/references/directions.md` (hook options).
- **Effort:** S
- **Source:** u/SadNose6889 and commenter u/AmberMonsoon_, https://www.reddit.com/r/ClaudeAI/comments/1t4ffsu/ .

### F-C11: Real screen recordings and real assets over synthesised UI
- **Category:** direction
- **What it is:** For product walkthroughs, composite real screen recordings (with code-made cursor, callouts and zooms) rather than redrawing the whole interface, and when stuck on generic graphics, feed real screenshots and brand images and let Claude only animate and layer them.
- **Why it is good:** Three separate commenters say fully synthetic UI looks fake and that generated SVG graphics look generic. Strength: opinion from several people, no test. Also a counter-signal: one builder rendered the app's own components in the film and was happy with it, so "synthetic" is fine when it is the real code.
- **Adopt?** Already adopted in part. `motion-studio` has screen capture (numbered JPEG frames, cursor, spotlight). Gap: the Remotion engine docs do not say the same. Add one rule to `remotion-studio`: for any product, import the real component or a real capture; draw UI from scratch only for abstract diagrams.
- **Where it goes:** `skills/remotion-studio/references/phases.md` and `prompts/61-product-ui-demo.md`.
- **Effort:** S
- **Source:** u/MoonLabsApp and others at https://www.reddit.com/r/ClaudeAI/comments/1sya1rc/ ; u/EvolvinAI29 at https://www.reddit.com/r/ClaudeAI/comments/1t6cvgv/ ; u/Tarun122 at https://www.reddit.com/r/ClaudeAI/comments/1t51k8s/ .

### F-C12: Web-embed delivery checklist
- **Category:** pipeline/tooling
- **What it is:** First-hand fixes for a short landing-page loop that played in Chrome but showed black in Safari: use the H.264 High profile, add `-tune grain` so dark fades do not band, rename the file on re-export so Safari forgets a cached failure, use `preload="metadata"`, and check the size in the network panel (the final file was about 700 KB).
- **Why it is good:** Concrete and checkable. Strength: shown by the author's own debugging (4 hours, 19 commits). I would not accept the diagnosis as written: "Safari hates Baseline" is doubtful; the usual causes of a black Safari video are the pixel format (needs `yuv420p`), a missing `-movflags +faststart`, and serving without byte-range support, and our own notes already cover range requests for the player.
- **Adopt?** Yes as a short checklist, with the doubtful claim replaced by the standard set. Not covered today: `delivery.md` is about review and ffprobe checks, not embedding on a web page. Checklist: H.264 High, `yuv420p`, `+faststart`, muted `playsinline` autoplay, `preload="metadata"`, new filename per export, `-tune grain` only for dark gradients, size budget.
- **Where it goes:** `skills/remotion-studio/references/delivery.md` and `prompts/53-final-render-delivery.md` ("if embedding on a web page").
- **Effort:** S
- **Source:** u/Vitalic7, https://www.reddit.com/r/ClaudeAI/comments/1sq0xcz/ .

### F-C13: Captions on cut audio need their own chunking
- **Category:** typography / pipeline
- **What it is:** Off-the-shelf caption pages split on natural pauses in speech. After cutting between takes the pauses vanish, and one run put 188 words on a single caption page for about 2 seconds. The fix was custom chunking logic.
- **Why it is good:** A precise, easily reproduced failure. Strength: described by the author, not shown.
- **Adopt?** Maybe. It only bites when we caption edited or concatenated voice (several generated lines joined, trimmed takes). Our line-by-line Kokoro generation sidesteps it, but a Remotion caption component fed by Whisper times could hit it. Rule to add: chunk by maximum words (about 3 to 6), maximum on-screen time and sentence boundary, never by pause alone; and run a test with a deliberately pause-free input.
- **Where it goes:** `prompts/51-captions-subtitles.md` (Studio additions) and `studio/src/lib` caption component notes.
- **Effort:** S
- **Source:** u/FerretVirtual8466, https://www.reddit.com/r/ClaudeAI/comments/1ry69qi/ .

### F-C14: Hold the box when text types in
- **Category:** typography
- **What it is:** For a typewriter effect, render the full text invisibly to fix the container height and overlay the typed characters on top, so the card does not jump as lines wrap.
- **Why it is good:** A one-line, well-known layout trick, reported as the fix after the poster saw the card moving. Strength: shown in the post text; tiny.
- **Adopt?** Maybe. `DESIGN_SYSTEM.md` currently bans typewriter cursors outright as a decoration, so this only matters if a brief asks for typed text (a prompt box, a terminal). If we build a typed-text component, build it this way.
- **Where it goes:** a note under the typography components in `studio/DESIGN_SYSTEM.md`, or in `skills/motion-studio/references/learnings.md` (Typesetting).
- **Effort:** S
- **Source:** u/Tarun122, https://www.reddit.com/r/ClaudeAI/comments/1t51k8s/ .

---

## Prompt patterns worth keeping

Skeletons in my own words; adapt the brackets.

1. **Golden scene.** "Here is an approved scene. Build scene [N] in the same structure (beat mapping, stagger, entrance style), changing only the content, and list what you copied." Credit: u/Sangkwun (1sbbwwu).
2. **Few-shot voice.** "Here are three scripts I wrote. Write the new script so it matches their voice, sentence length and level of hype." Credit: u/Mullikaparatha (1stutgf); use with caution, the thread was suspected of being promotional.
3. **Plan first.** "Before any code, tell me in five lines what you will build for scene [N], what you will not touch, and the one thing most likely to go wrong." Credit: u/TheHol1day (1tbcoft).
4. **Define the word.** "For this video, 'punchier' means: [frame counts, scale event, cut type]. Apply it to scene [N] only and show the diff." Credit: u/TheHol1day (1tbcoft).
5. **Outcome, not values.** "Result must satisfy: [measurable condition on a still]. Choose the implementation yourself and tell me which values you picked." Credit: u/FerretVirtual8466 (1ry69qi).
6. **Breaking point.** "Show [N] steps where [one quantity] builds; at step [N] it fails with a visible change. Single screen, loopable, minimal interface; input, visible transformation, output." Credit: u/SadNose6889 and u/AmberMonsoon_ (1t4ffsu).
7. **Critic before render.** "You did not write this plan. List its five weakest decisions and the cheapest way to check each before we render." Credit: idea from u/FerretVirtual8466 (1ry69qi); wording ours, matches our director review.
8. **Visual lead.** "Start each visual [3 to 6] frames before the spoken word onset; give me a table of word, onset, visual start." Credit: idea from u/Possible-Tone-7627 (1tn9tyy); frame range ours, to be tested.
9. **Explicit safe zones in the prompt.** Name pixel margins for the format and minimum type sizes, then "research the topic and write a five-scene script before any code". The source used 150 px top, 170 px bottom, 60 px sides at 1080x1920; our own tokens keep 220 and 380 px free at 9:16, which is more cautious, so keep ours. Credit: u/EvolvinAI29 (1t6cvgv).
10. **System trace.** "Describe a video type we have never made. Trace, step by step, what this studio would do. List every place the docs promise something that does not exist, and every default that would leak in." Credit: u/FerretVirtual8466 (1ry69qi).

## Rejected or weak

- **"Crossfade every cut" and "one easing curve everywhere" as laws** (u/Top_Commission_8567, 1tik0qe). The thread's own critics say this yields even, bouncy, tensionless motion; our `learnings.md` already says a single entrance curve becomes a template. Kept only as defaults, see F-C5.
- **Reusable lower thirds and intros for a channel** (u/Silver-Range-8108, 1tn9tyy, 97 votes). The top comments (58, 19, 15, 12 votes) call it generic, likely to look dated within months, and note the video itself had problems unrelated to the graphics. The reusable-component idea is already how the studio works; the look is what not to copy. The useful part is the criticism: shared components keep consistency only if the visual language is distinctive in the first place.
- **Tutorial-video factory with face swap and AI narration** (u/Mullikaparatha, 1stutgf, 266 votes). Top comments call the author a shill for the vendor, and viewers say they dislike AI narration. Cost claims ($2 to 4 a video) are unverified. Only the few-shot tone tip is kept (F-C1).
- **Claude Design explainer for under a dollar** (u/gnurpreet_, 1tfiv70). The audio-first method (script, TTS, speech-to-text timestamps, then animation) is exactly what `motion-studio` already does with Kokoro and Whisper, so it is not new. The thread's critics say the output has a recognisable "Claude Design" look (italic serif everywhere) and one asks about sourcing. Not adopted.
- **HyperFrames announcement** (u/Miguel07Alm, 1snkiti; author works at the vendor). The engine claim that plain HTML is easier for an agent than a React tree is the vendor's view. Comments report mixed results (a Sonnet attempt failed, an Opus attempt did not match a competing JSON renderer). We already have our own HTML engine in `motion-studio` and the pinned third-party `brag`. No change.
- **R/webdev GSAP replacement of a 3.4 MB video** (u/LordVein05, 160 votes). Not found in the archive, so unread; Claude involvement was already unconfirmed in the gallery. It is about web page embedding, not video output. Skipped.
- **Plain "first AI video in 10 minutes" posts** (1t6cvgv, 1t51k8s). Useful only for the safe-zone and typewriter points above; the "10 minutes" framing is the genre the 100-prompts post argues is mostly fiction.
- **Talking-head editing pipeline details** (silence detection plus LLM cut choice, ButterCut). Interesting but it solves a problem we do not have (we generate, we do not cut raw footage).
- **All TikTok and Instagram items.** None could be opened; every description is a caption or search snippet, three have no URL, and the two Instagram mindset accounts are format references with no claim of Claude authorship. The reach numbers (about 23.9K and 9.5K likes) say the hook "a skill replaces your editor" travels; they say nothing about quality. Leads only, worth testing only if wanted, each as a one-day experiment:
  - A brand-token file (`MOTION.md`) that `CLAUDE.md` points to: we already have `studio/DESIGN_SYSTEM.md` and `tokens.ts` doing this; no gain expected.
  - Beat-synced cuts from the music: already covered in `learnings.md` (scenes as whole beats, hits table) and by `motion-studio`.
  - After Effects through an MCP: the studio rule is to say so and use After Effects only when a shot needs compositing; an MCP is untested here and would be a separate evaluation.
  - A free browser converter from HyperFrames HTML to MP4: irrelevant, since our engines render to MP4 themselves.

## Top eight, in order

1. F-C1 Golden reference scene instead of a text-only description.
2. F-C2 Commit, diff and before/after stills on every revision, plus a decision log.
3. F-C3 Let visuals lead the voice by a few frames (test it, do not take 250 ms on faith).
4. F-C4 Compare the render with a reference sheet in `motion-review`.
5. F-C5 Pacing and tension variance as a review criterion, not "one easing everywhere".
6. F-C6 Measurable acceptance criteria and a per-video glossary for vague words.
7. F-C7 Explain-the-plan-first and optional fresh-critic gate in the build step.
8. F-C8 System audit by tracing an unlike video through the studio.
