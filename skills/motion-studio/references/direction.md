# Direction: brief, story, script, captions

## Brief (infer first, ask once)

Check the brief against the 10 ingredients (purpose, format, art direction, composition, typography with exact text, movement, timing, transitions, audio, quality constraints; see [workflow.md](workflow.md)). Then, for a product film, also collect:

Collect or infer in one pass:

- Product, what it does in one line, who it is for.
- **The one thing the viewer must remember.**
- Proof: 1 to 3 real numbers, a customer, a before/after. Never invent them.
- Call to action: one action, a real URL or in-app path.
- Format: 16:9 (site, YouTube, decks), 9:16 (Reels, Shorts, TikTok), 4:5 (LinkedIn feed), 1:1.
- Length: ads 15 to 20 s, launch films 30 to 45 s, feature films and explainers 45 to 75 s.
- Language of voice and subtitles. Brand assets: logo, colours, type, existing videos.

If a URL or a running app is available, use it: real screenshots and real copy beat invented ones.

Before designing, write one line: *"Reading this as: <video kind> for <audience>, <tone>, leaning toward <visual family>."*

## Story structures

**Feature film / product demo (45 to 70 s)**
1. Hook (0 to 4 s): a felt moment from the viewer's week. A clock creeping past 16:40 on a Friday; "Four hours. Every week. The same steps."
2. Problem (5 to 9 s): what it costs today, shown with objects, not adjectives.
3. Concept (6 to 9 s): the idea in one picture (a chain of steps, a before/after).
4. Product (20 to 30 s): the real UI doing the job, in the order a user would. Zoom on what the voice names.
5. Proof (8 to 12 s): the real result with its numbers and references.
6. Promise + CTA (6 to 9 s): two or three words of value, the product name, one action. Hold 2 s or more.

**Launch film (30 to 45 s):** hook, problem, reveal (name + one showpiece), product tour, proof, range (optional), CTA.

**Ad (15 to 20 s):** hook, one product moment, proof, CTA.

## Hooks that work

- A concrete moment: a time, a place, a small pain ("16:40, Friday. The business case is due Monday.").
- A question the viewer answers in their head ("Meeting in German? Spanish? Japanese?"), rolling variations with the voice.
- A bold, specific claim with a number the product can prove.

Do not open on the logo, a feature list, or a generic "Introducing…".

## Script rules

- Write for the ear: short sentences, one idea each, 2.2 to 2.8 words per second.
- One line per beat in `script.json`; each line becomes its own voice clip so pauses are authored, not accidental.
- One-word lines are risky for speech recognition ("Fast." was heard as "Vast"); prefer "And fast."
- Every claim must be true for the product as it ships today.
- Subtitle translation in a second language goes in the same file (`de` field); formal register where the culture expects it.

## Captions (on-screen text)

- One caption per beat, **max 5 words**, max 2 lines. The voice can say more than the caption.
- Each word rises on its spoken word (word times from Whisper).
- One accent word per caption, in the accent colour or bold of the same family.
- A number caption gets a small reference line under it in mono ("Calculated by the workflow, investment 8,500 EUR").
- Left-align captions to the content's edge. Centred captions that build word by word look lopsided because hidden words still take space.
- No em dashes; no section numbering ("01 / Capabilities"); no decorative eyebrows on every scene.

## Proof and data honesty

- Use numbers the product really produced (a recorded run, a real report).
- When a visual needs "different results" or "more" without real data, use relative bars or skeleton lines and say they are illustrative.
- Write down which visuals are illustrative and hand that list over with the video.

## Call to action

- One action, one label, one place (a URL or an in-app path like "Settings › Exports").
- On screen for at least 2 seconds, still.
- The last frame is a clean end card: name, one-line promise, CTA, brand mark.

## Concept triple: Idea, Device, Grammar

Before any directions, fill an inventory of real specifics (product facts, real UI, real numbers). A concept is then three sentences:

- **Idea:** what the viewer should believe, 8 words or fewer.
- **Device:** one object that carries the idea through every shot (a dot handed from shot to shot that ends as the mark).
- **Grammar:** a rule the form obeys (opens and closes on the same tick; every change is caused by the cursor).

Write three concepts through different lenses, then kill weak ones with four tests: **ownership** (is it about this product), **deletion** (remove the device; does the film still work? then it is decoration), **specificity** (could only this product say it), **competitor** (could a rival's film say the same). Only then choose techniques. Cheap tells to avoid are in [banned-effects.md](banned-effects.md).
Why: stops "three looks, no idea", which the three-directions step can still produce. Evidence: doc-level with four worked concepts (F-A11); the strength of the resulting films is only claimed. Extra fields in `directions.md` and `brief.md`, not a new stage.

## Precedent-based taste rules

Rules that earned a place by being sent back in review live in [gotchas.md](gotchas.md) (section "Taste precedents"): each has the rule, the case that produced it, and a self-check. Add new ones in that form (rule, case, check question), merge duplicates with `learnings.md`.
Why: they pre-empt review rounds. Evidence: first-hand, one author's projects (F-A12).

## Pacing norms (reference numbers, not pass/fail gates)

Measured by one author on professional launch films; the films are not named in what we read, so treat them as sanity numbers for storyboards and reviews. Evidence: the author's claim (F-A13).

| Norm | Number |
|---|---|
| Median shot | about 1.5 s; new visual beat about every 0.7 s (calm default about 1 s) |
| Opening | first frame already moving; first readable word near 0.4 s; product on screen by about 3 s unless a problem act earns the wait |
| Energy curve | two peaks: a designed lull near 65 percent, the biggest peak near 82 percent; no low-energy stretch over 4 s |
| Earned stillness | one hold of about 1.0 to 1.6 s on the key claim, then the biggest spike. Spend stillness once |
| Accent | about 5 percent of pixels |
| End card | about 2 s total: 0.6 to 1.3 s hold, at most 6 percent creep |
| Repeats | a repeated reveal runs about 40 percent faster the second time |

Voice-led films follow the voice, not these numbers; use them to spot a storyboard that is flat or all peaks.

## Hook patterns beyond the felt moment

**A story with a breaking point.** For explainers, data stories and kinetic hooks: a small physical story where one quantity builds over N steps and fails visibly at step N (five glasses fill with risk, the last overflows). Write it as numbered steps with a state change at each, start calm, then a sudden failure with a clear visual change. Constraints that stop over-building: a single screen, loopable, minimal interface, input to visible transformation to output.
Why: two builders independently found it the one pattern that reliably gave an interesting result. Evidence: only claimed (F-C10); fits our "felt human moment" lesson.

**Real assets over synthesised UI.** For a product walkthrough composite a real screen recording or import the real component, with code-made cursor, callouts and zooms; draw UI from scratch only for abstract diagrams. Feed real screenshots and brand images and animate and layer them.
Why: commenters report fully synthetic UI looks fake and generated SVG looks generic; rendering the app's own components is fine. Evidence: opinion of several builders (F-C11); the HTML engine already does this via `capture.md`.

## Music-led films: beat map first

For films without a voice-over the first deliverable is the beat map: BPM, total beats, how many beats before its drop the song starts, and the structure as beat ranges ("beats 0 to 6: setup; beat 12, the drop: zoom lands"). The drop is the structural anchor; a quiet breakdown carries the hold scene. Rule: "no dead time", not "always moving": the page never empties between beats, and the beat is not a license for constant motion. Voice-led films do not use this; the voice sets the pace. Details: [audio.md](audio.md).
Why: makes sync a property of the plan. Evidence: consistent across four films (F-B8), sync quality not verified.

## Brief skeleton and start gate

The brief carries, as fixed headings: inputs, direction (with Banned list), structure, build, gotchas, start gate. Template: `~/.claude/skills/motion-director/templates/brief.md`. The start gate is in [golden-scene.md](golden-scene.md).
