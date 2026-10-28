# Direction B: "Set in type"

**One-line idea:** the whole workflow is typeset on one Swiss grid, and each word turns into the thing it names: "frame" becomes the frame, "Storyboard" cuts itself into panels, and "the code" flips over to read "rendered frames".

No pictures, no UI, no camera journey. The page is the set, a change of scale does the camera's job, and the story is the studio's real copy.

## Why it fits the audience

- **Developers and creators on a GitHub page** read before they watch. Here the reading is the show: every beat is one real line from the repo (README, CLAUDE.md, skill names), so the video *is* the pitch and doesn't need a caption under it.
- **Muted autoplay:** nothing depends on sound. Every idea arrives as text plus a typographic action. Sound only adds weight to what already reads.
- **Phone:** a README video plays about 360 px wide on a phone, roughly 0.19x of 1920. So there is one line of large type per beat, at least 120 px on the 1920 master (about 23 px on a phone), supporting text at least 64 px, and nothing small that carries meaning. Big type at big scale is the most phone-proof format there is.
- **Shows the craft without bragging:** precise baselines, optical tracking and beat-locked timing are hard to fake. Visitors who make motion graphics will see the discipline the studio promises ("Judge rendered frames, not code").

## Visual language

| | |
|---|---|
| Background ("paper") | `#F2F1EC` (the studio's `text` token, used here as paper) |
| Ink | `#0D0E10` (studio `bg` token, used here as ink) |
| Accent (the only one) | `#5B8CFF` (studio `accent`). Used for exactly one element per beat: the frame outline, the picked direction, the active index numeral, the word "rendered frames". Never for small text (contrast on paper is about 2.9:1) |
| Support | `#9A9CA1` for secondary lines and index numerals; grid hairlines in ink at 8 % opacity |

- **Type:** Inter (variable, `wght` 300 to 800, self-hosted woff2) for everything set in words; JetBrains Mono 500 only for the skill names, because they are code identifiers. Display 220 px / -0.04 em; headline 132 px / -0.035 em; supporting 64 px / -0.01 em; index numerals 64 px in tabular figures. Left-aligned, ragged right, never centred, except the end card, which sits on the same left column.
- **Grid:** 12 columns, 96 px outer margins, 24 px gutters, 8 px baseline grid. The column hairlines are actually drawn (2 px, ink at 8 %) and stay on screen the whole film. They are the "set". Every word lands on a baseline and a column edge, and that is checked on stills.
- **Texture:** none, apart from the hairlines. Flat paper, no grain, gradient, glow, blur, particles or shadow.
- **Depth:** flat, with one exception: a single type plane flips in 3D at 14.5 s (CSS perspective 1600 px). That is the only 3D in the film, and the type itself does it.
- **Light:** none. It's print.

## Structure: tempo and grid

**120 BPM = one beat every 0.5 s = 15 frames at 30 fps.** 20 s = 40 beats = 10 bars of 4. Every entrance starts on a beat or a half-beat (frame multiples of 7.5, rounded to 7/8 alternately). Every cut and flip lands on a beat. Holds last at least 2 beats (1 s), so a 15 fps GIF still reads.

| Bars | Time | Beat | Purpose |
|---|---|---|---|
| 1-2 | 0.0-4.0 | Hook: "Motion graphics" then "Every frame rendered from code." | What it is |
| 3-6 | 4.0-12.0 | The workflow, one stage per 2 to 4 beats: Direction, Storyboard, One scene, Review, The rest | How it works |
| 7 | 12.0-14.0 | The skills, typeset as a list | What you install |
| 8-8.5 | 14.0-17.0 | The rule, with the flip | Why it is good |
| 9-10 | 17.0-20.0 | End card, then back to the empty grid (seamless loop) | Name + loop |

Pacing: a new event every 2 beats in bars 1 to 6. The skills list in bar 7 speeds up to one name per half-beat. Bar 8 slows down for the flip, with a 3-beat hold after it. Bars 9 and 10 are the longest hold in the film.

## Camera language

There is no virtual camera. Scale changes inside a fixed frame stand in for it:
- **Push in** = a word or panel scaling up while the grid stays put (used once, in "One scene", 1.0 to 3.2x over 12 frames, `bezier(0.16, 1, 0.3, 1)`).
- **Truck** = a whole line sliding horizontally along its baseline (the hook, and the exit of the workflow section).
- The grid hairlines never move. They are the tripod, and they make every other move measurable.

Easing: entrances use expo-out `bezier(0.16, 1, 0.3, 1)`, 9 to 12 frames. Exits use ease-in `bezier(0.7, 0, 0.84, 0)`, 6 to 8 frames. The flip uses ease-in-out `bezier(0.65, 0, 0.35, 1)`, 15 frames. Springs only on single-word landings: stiffness 180, damping 22, overshoot under 2 %. Type should never wobble. Per-character stagger is 1 frame, per-word stagger 3 frames. Nothing is linear.

## Transitions

Every change is either a **shared element** (a word turns into the next scene) or a **hard cut on the beat**. There are no crossfades and no generic wipes.
1. "frame" → its bounding box → a flood to the full 16:9 outline (shared element).
2. Direction → the picked weight slides to the index column (shared element, position match).
3. Storyboard panels → the third panel pushes in to become "One scene" (shared element).
4. "The rest" cascade → hard cut on bar 7's downbeat to the skill list.
5. Skill list → collapses onto one baseline, which becomes the hinge of the flip plane (shape match).
6. End card → the type masks down into its baselines and leaves the bare grid, which matches frame 0 (loop).

## Typography and exact on-screen text

Every on-screen string, in order. The text is quoted or tightly paraphrased from `README.md` and `CLAUDE.md`. There are no numbers apart from the workflow index numerals 1 to 5, which match the README's numbered steps.

1. `Motion graphics`
2. `Every frame rendered from code.`
3. `1` · `Direction` · `Three directions. Pick one.`
4. `2` · `Storyboard` · `A timed scene table.`
5. `3` · `One scene` · `Build it. Render stills. Look at them.`
6. `4` · `Review` · `Top five defects.`
7. `5` · `The rest`
8. `Skills` (label) · `motion-director` · `remotion-studio` · `motion-studio` · `motion-review` · `prompt-motion-search`
9. `Judged on` · front of plane: `the code` · back of plane: `rendered frames.`
10. `Video Studio` · `Motion graphics and animated videos with Claude Code.`

Sentence case throughout. The exceptions are "Video Studio" (the product name) and the skill identifiers, which stay lowercase exactly as you type them.

## Sound direction

- **Bed:** a minimal 120 BPM pulse: a dry, muted kick on each bar's downbeat and a soft closed tick on the off-beats from bar 3 to bar 7. No melody until the end card. Mixed to -14 LUFS / -1 dBTP.
- **Hits** (from the storyboard hits table later): a paper slide (a short filtered noise sweep peaking on landing) on each line truck. One tick per skill name, five ticks rising a semitone each. One low wooden "thock" when the flip lands on the back face. A single sustained piano or Rhodes chord under the end card, cut dead on the loop frame.
- **Silence as accent:** the beat before the flip (b30) drops the off-beat ticks, so the flip lands in space.
- There is no voice. The film has to work completely muted, and the sound is a bonus.

## Mini scene table

Beats are numbered from b1 (frame 0). "Col" means grid column, 1 to 12.

| Time | Shot | Motion | Text | Transition out |
|---|---|---|---|---|
| 0.0-4.0 (b1-8) | Paper and grid. One line at a time, cols 2-11 | b1: "Motion" rises out of a baseline mask, 220 px, 1-frame character stagger, 10 f expo-out. b3: "graphics" trucks in from the right on the same baseline, tracking easing from +40 % to -4 % as it lands on b4. b5: both words truck out left (ease-in, 8 f). "Every frame rendered from code." sets word by word at 132 px, 3-frame word stagger. b7: the letters of "frame" mask down out of their own box, leaving its bounding rectangle as a 2 px accent outline | `Motion graphics` / `Every frame rendered from code.` | Shared element: the empty accent box floods to a full-frame 16:9 outline with 96 px inset (b8, 12 f expo-out). The other words exit ease-in 6 f |
| 4.0-6.0 (b9-12) | Inside the accent frame: index column (col 1) plus a stage area (cols 3-12) | b9: "1" (accent) and "Direction" land together. b10: "Direction" duplicates into three copies that fan into cols 3-5, 7-9 and 11-12 at weights 300, 500 and 800 (cascade, 3 f). b11: the 300 and 800 copies mask out. The 500 copy stays, and its underline draws in accent | `1` `Direction` / `Three directions. Pick one.` | Position match: the picked "Direction" shrinks to 64 px and slides into the index list under "1", now grey (b12) |
| 6.0-8.0 (b13-16) | Stage area, one word | b13: "Storyboard" at 220 px. b14: six vertical masks slice it into six panels with 24 px gutters, each offset up or down by alternating 16 px, then they align (2 f stagger) | `2` `Storyboard` / `A timed scene table.` | The panels hold for b15-16. Then panels 1, 2, 4, 5 and 6 drop 40 px and fade (ease-in 8 f) |
| 8.0-10.0 (b17-20) | Push into panel 3 | b17: panel 3 scales 1.0 to 3.2x until its edges meet the frame outline (12 f expo-out). Inside it, "One scene" is set at 132 px | `3` `One scene` / `Build it. Render stills. Look at them.` | Hard cut on b21 |
| 10.0-12.0 (b21-24) | Index column fills; stage area | b21: "Review" at 132 px, and an accent rule draws under it left to right (10 f). Five short ink dashes cascade down beside it (2 f each) as list markers. b23: "The rest" sets five times down the column at 64 px, 2-frame cascade, accelerating: the visual for "one at a time" | `4` `Review` / `Top five defects.` / `5` `The rest` | Hard cut on the b25 downbeat. The accent frame outline drops away in the same cut |
| 12.0-14.0 (b25-28) | Open grid, mono list in cols 3-10 | "Skills" label (64 px grey) on b25. Five names set one per half-beat (b25.5 to b27.5), 72 px mono, each rising through its baseline mask over 6 f. Hold b28 | `Skills` / `motion-director` / `remotion-studio` / `motion-studio` / `motion-review` / `prompt-motion-search` | Shape match: all five lines squash into one baseline (scaleY to 0 toward the line, 8 f ease-in). The baseline stays as a 2 px ink rule, which becomes the hinge |
| 14.0-17.0 (b29-34) | Two-line statement. 3D type plane hinged on the rule | b29: "Judged on" lands above the rule. b30: "the code" lands on a plane below it (silence). b31: the plane rotates 180° around the rule's X axis (15 f ease-in-out, perspective 1600 px). At 90° the plane is a hairline. The back face reads "rendered frames." in accent, 132 px. b32-34: hold | `Judged on` / `the code` → `rendered frames.` | The rule draws out to the right (ease-in 8 f), and the lines truck left off the frame |
| 17.0-20.0 (b35-40) | End card, cols 2-10 | b35: "Video Studio" at 220 px, 600 weight, rises through a baseline mask. b36: the supporting line at 64 px. Hold b36-38 (1.5 s). b39: both lines mask down into their baselines (ease-in 8 f) | `Video Studio` / `Motion graphics and animated videos with Claude Code.` | Loop: by b40 only the grid hairlines are left on the paper, identical to frame 0 |

## What makes it NOT look AI-generated

- **Real copy, real names:** every word comes from the repo. There are no "unleash", "reimagine" or invented stats.
- **A visible, consistent system:** one grid and one baseline unit. The hairlines are always present, so any misalignment would show, and that is exactly why it has to be perfect. Generic AI motion floats things in the centre. This sits on columns.
- **Asymmetric, left-aligned layouts** with a real index column. No centred hero text on a gradient.
- **Every word does one specific thing** tied to its meaning (box, panels, push, flip), never a stock "fade up and blur in".
- **Beat-locked timing with deliberate holds** and one silent beat, not uniform, constant easing.
- **Flat paper with one accent used sparingly:** no glow, bloom, particles, grain, lens flare, glassmorphism or purple gradient.
- **Typographic craft in the details:** tracking that changes with size, tabular numerals, the underline finishing 6 frames after its word, and variable weight used as a meaning (three directions = three weights).

## Risks and how to handle them

| Risk | Handling |
|---|---|
| Too much reading in 20 s, especially on a phone | One line of focus per beat, with supporting lines of 5 words or fewer. Every line holds for at least 2 beats. Check a phone-size contact sheet at 360 px wide before approval |
| A light paper rectangle looks harsh in GitHub dark mode | Make it a deliberate print look, with a 96 px inset frame so it reads as a page. Alternatively, make an inverted dark variant from the same tokens (swap paper and ink) and pick after stills. That is a one-variable change |
| Hairlines and thin type alias or band in the GIF | The GIF is at 960 px width, hairlines are 2 px on the master (1 px in the GIF), the lightest weight on screen is 300 and only at 132 px or above, and the palette is limited to 4 colours plus anti-aliasing. The MP4 stays the quality master |
| Word-after-word monotony | Each stage has a different typographic action (fan, slice, push, rule plus cascade, list, flip). The motion review checks the repetition flags |
| Fonts don't load in headless render | Self-host the woff2 files and gate rendering on `document.fonts.ready` |
| The flip looks cheap (perspective distortion, jagged edge at 90°) | Moderate perspective (1600 px), and at 90° the plane is 2 frames of hairline at most. `backface-visibility: hidden` with two faces, checked on stills at f 457 to 467 |
| The accent blue on paper is low-contrast | The accent is only used at 132 px and above, or for 2 px or thicker shapes. Never for running text |
| Ends abruptly on autoplay | Built as a loop: the last frame equals the first frame |

## Effort in the HTML engine

- **DOM + CSS transforms**, driven by one pure `render(frame)` function (deterministic, no CSS transitions or timers). Text is split into per-character spans with measured advances (canvas `measureText` for the tracking and box positions). Masks use `clip-path: inset()`. The "frame" box is the measured bounding rect of the word. The panel slicing is 6 clones of the word, each clipped to one slice.
- **Flip:** CSS 3D (`perspective`, `rotateX`, two faces). **three.js is not needed**, and adding it would be decoration.
- No canvas, no external assets beyond two font files, and audio from the hits table.
- **Estimate:** about 1.5 days to build plus 0.5 days for QA (still checks for baselines and alignment, a phone sheet, sync). This is about the lowest-risk of the possible directions: no 3D scene, no captures.

## Three key frames

**K1, 3.67 s (frame 110, b8 mid-flood).** Paper `#F2F1EC`, 12 grey hairline columns. On the baseline at y = 560 px, from x = 192: "Every" and "rendered from code." in ink Inter 600, 132 px, with "Every" already 40 % faded and sliding left. Where "frame" was, there is no text, only a 2 px accent rectangle (the word's own box, about 330 x 100 px) caught mid-flood. Its top-left corner has travelled about halfway toward the 96 px inset, so it reads as a tall blue box growing out of the gap in the sentence. Nothing else is on screen.

**K2, 7.5 s (frame 225, b16 hold).** A 2 px accent outline, inset 96 px on all sides. In the left index column (x = 192): "1" in grey with "Direction" in grey 64 px beside it, and below it "2" in accent. In the stage area (cols 3-12), "Storyboard" at 220 px ink, cut into six equal vertical slices separated by 24 px paper gutters. All six are aligned on one baseline at y = 600, so the word is still legible through the cuts, like a contact strip. Below it, at 64 px grey, "A timed scene table." on baseline y = 720.

**K3, 15.25 s (frame 457, b31 mid-flip).** No frame outline. The grid hairlines are visible. "Judged on" in ink 132 px sits on a baseline at y = 470, cols 2-7. Just below it, a horizontal 2 px ink rule runs from x = 192 to x = 1300 (the hinge). The plane under the rule is rotated about 70° on X: the word "the code" is foreshortened to a squat strip about 30 px tall, leaning back away from the viewer, with its letters compressed vertically and slightly wider at the bottom edge (perspective). The rest of the frame is empty paper. Two frames later the plane is a hairline, and ten frames later it reads "rendered frames." upright in accent.
