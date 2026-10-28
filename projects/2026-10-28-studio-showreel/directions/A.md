# Direction A: "One take"

Spatial, camera-led. A refinement of the draft in `../storyboard.md`; same message, same 20 s, same 120 BPM grid.

## One-line idea

The typed brief is the first object in one continuous 3D world, and the camera never cuts: it pulls back from the line onto a storyboard wall, pushes into one card, cranes down onto the timeline it becomes, and watches that timeline stand up as the contact sheet of this very film, which collapses into the logo.

## Why it fits the audience

- **Developers and creators on a GitHub page judge by "is this real".** Everything on screen is the film's own material: the brief that describes it, its own storyboard cards, its own waveform, its own frame numbers, its own rendered frames on the contact sheet. Nothing is a placeholder, so it doubles as proof that the pipeline works.
- **Muted autoplay.** The story is carried by four stage words (`Direct`, `Design`, `Animate`, `Review`) and by the camera path, not by sound. Frame 0 already shows a readable sentence, so the hook works before anything moves.
- **Phone.** One focal point per beat, display type at 132 px (about 27 px on a 390 px wide phone), no reading inside thumbnails required. The continuous camera reads at small size better than fast cutting, because the eye never has to re-find the subject.
- **It shows the one thing a README screenshot cannot:** that the studio thinks in shots, transitions and timing, not just in pretty frames.

## Visual language

| Element | Decision |
|---|---|
| Palette | Background `#0D0E10` (token `bg`), card surface `#16181C` (`surface`), raised `#1E2126`, ink `#F2F1EC` (`text`), muted `#9A9CA1`, faint lines `rgba(242,241,236,0.10)`. **One accent: `#5B8CFF`** (`accent`), used only for the caret, the accent word and rule, the Hits track, the review check marks and the final dot. Never as a fill larger than the dot. |
| Type | Inter Tight 600 for display (132 px, -3.5 % tracking, line height 1.02), 500 for labels. JetBrains Mono 500 only for the typed brief, timecodes and frame counters. Sentence case everywhere. |
| Texture | Matte. Cards are flat paper-like planes, 1 px `line` border, 12 px radius, no bevel, no thickness, no specular. A 48 px grid on the wall and floor at 6 % opacity gives scale and parallax cues. Optional 2 % static grain, seeded, identical every frame (no boiling). |
| Depth | Fog (linear, background colour) so far cards fall off into the dark; one soft contact shadow under every card (baked blur, not real-time shadow maps); depth of field only on the out-of-focus card rows, never on text. |
| Light | One soft key from top left (unlit `MeshBasicMaterial` for card faces with `toneMapped: false`, so UI greys stay true; the light only shapes the shadows and the floor gradient). No glow, no bloom, no particles, no lens flares, no light rays. |
| World | One persistent set: a wall plane (storyboard wall, later the contact sheet sits in front of it) and a floor plane (timeline lies on it). Cards are pinned to the wall, never floating in a void. Every object stays in the world once placed. |

## Structure (120 BPM: beat 0.5 s, bar 2 s, 10 bars, 40 beats)

| Bars | Time | Beat | Purpose |
|---|---|---|---|
| 1 to 1.25 | 0.0 to 2.5 | 1 to 5 | **Hook.** Readable brief at frame 0, last four words type on beats 2 to 5 |
| 1.25 to 3.25 | 2.5 to 6.5 | 6 to 13 | **Direct.** Pull-back reveal: the line is card one of a storyboard wall; truck across the wall |
| 3.25 to 5.25 | 6.5 to 10.5 | 14 to 21 | **Design.** Push into one card until it is the frame; kinetic type plays inside it |
| 5.25 to 7.5 | 10.5 to 15.0 | 22 to 30 | **Animate.** The three lines become timeline tracks on the floor; crane down and track the playhead |
| 7.5 to 8.75 | 15.0 to 17.5 | 31 to 35 | **Review.** Tracks stand up into contact-sheet rows of this film; orbit and rack focus |
| 8.75 to 10 | 17.5 to 20.0 | 36 to 40 | **Payoff.** Check marks merge into one accent dot, wordmark resolves, 1.0 s hold = poster |

Pacing: no hard cuts at all; five motivated transitions, each landing on a downbeat (3.0 is replaced by the reveal at 2.5 to 3.5; 7.0, 11.0, 15.0, 18.0). Holds: 6.0 to 6.5 (the camera "chooses" the card), 8.5 to 10.5 (reading time for the statement, under a 2 % push), 19.0 to 20.0 (poster).

## Camera language

One world, one camera, 35° vertical FOV. Rules: **one named move per shot**, keyed with expo in/out, a real hold or a landing between moves, never reversing direction inside a move, zoom and dolly distance interpolated in log space so speed feels constant. No idle drift and no handheld noise.

| Shot | Move | Motivation |
|---|---|---|
| 0.0 to 2.5 | **Locked off**, then a 3 % log push-in from 0.5 s | Lets the hook be read; the push says "something is coming" |
| 2.5 to 3.5 | **Dolly out** about x6 (from close-up 6 units to wide 20 units) with a **12° tilt down to up** settling onto the wall plane | Answers "where is this line?": it is written on a card, on a wall |
| 3.5 to 6.0 | **Truck right** along the wall, 6° yaw toward the travel, rows parallax at different depths | Surveying the board: the work is planned, many shots |
| 6.0 to 6.5 | **Hold** on the kinetic-type card | The choice is visible before it is acted on |
| 6.5 to 7.0 | **Push in** (log zoom) into that card; card edges flood past the frame corners on 7.0 | We enter the shot we just chose |
| 7.0 to 10.5 | **Flat, 2D**: 2 % push; one 1.5° roll settle at 7.0 (residual from the push) | Inside the frame there is no 3D: the content owns the screen |
| 10.5 to 11.0 | **Tilt down 60°** as the tracks lay down on the floor | Follows the bars as they fall |
| 11.0 to 15.0 | **Crane down** to the timeline, then **track left to right** locked to the playhead | The camera rides the playhead: time is the subject |
| 15.0 to 17.5 | **Orbit 20°** (left to right) around the rising contact sheet with a **rack focus** from the front row to the whole sheet | Inspecting the result from another angle, as a reviewer would |
| 17.5 to 18.0 | **Settle to flat-on**, centred, locked | The world collapses to the brand; nothing should move but the dot |

## Transitions (each a specific match)

| Time | From | To | What is shared |
|---|---|---|---|
| 2.5 to 3.5 | The typed brief line, full frame | Card one, top-left of the wall | **Same text, same baseline.** The line never re-renders: it is the card's first text row all along. The caret stops blinking on 3.0 and stays as a solid accent block on the card |
| 6.5 to 7.0 | The kinetic-type card on the wall | Full-frame Design shot | **Card border = frame edge.** The card is 16:9; its border scales past the corners exactly on 7.0. Its contents (`Motion should`) are already on it, so the first word is already in place when the frame is filled |
| 10.5 to 11.0 | Three lines of type | Three timeline tracks + the Hits track | **Each line becomes the bar of its own height.** Glyphs squash vertically to their x-height and fuse into a rounded bar on their own baseline: `Motion should` becomes Type, `explain,` (accent) becomes the accent **Hits** track, `not decorate.` becomes Camera, the accent rule becomes the thin Audio waveform track. Bars then hinge back to lie on the floor |
| 15.0 | Four timeline tracks lying flat | Four rows of the contact sheet standing up | **Track = row.** Each track hinges 90° up on its far edge; its keyframe diamonds become the thumbnail positions of that row |
| 17.5 to 18.0 | Four accent check marks, one per row | One accent dot, centre | **Shared element.** The checks slide to centre along arcs, merge, and the merged shape rounds into the dot on 18.0 |

No crossfades, no wipes, no whip pans.

## Typography and exact on-screen text

Only these strings appear. Sentence case. No em dashes. No other words.

| Time | Text | Style |
|---|---|---|
| 0.0 to 3.5 | `> 20 s showreel, one accent, every frame from code` | JetBrains Mono 500, 64 px, ink; `>` in muted; caret block in accent. Frame 0 shows `> 20 s showreel, one accent,` plus caret; `every`, `frame`, `from`, `code` type on 0.5, 1.0, 1.5, 2.0 |
| 3.5 to 6.5 | `Direct` / `brief, directions, storyboard` | Display 132 px, left at 120 px margin, lower third; mono 44 px muted below |
| 3.5 to 6.5 | Card timecodes, one per card: `00:00.0`, `00:02.5`, `00:03.5`, `00:06.5`, `00:10.5`, `00:15.0`, `00:17.5`, `00:18.5` | Mono 28 px faint on each card; the real start of the scene each card shows (one card per scene in the table below) (decorative, not meant to be read on phone) |
| 7.0 to 10.5 | `Design` (label, top left) / `Motion should` / `explain,` / `not decorate.` | Label mono 44 px muted; statement display 132 px, `explain,` in accent with a 6 px accent rule drawing under it 8.0 to 8.5 |
| 11.0 to 15.0 | `Animate` / `springs, camera, sound on the beat`; track labels `Type`, `Camera`, `Audio`, `Hits`; counter `frame 0660` to `frame 0900` | Display + mono as above; track labels mono 28 px muted; the counter shows the real current frame at 60 fps |
| 15.0 to 17.5 | `Review` / `every frame, looked at` | Display + mono as above |
| 18.5 to 20.0 | `Video Studio` / `Motion graphics, made in code with Claude` | Wordmark Inter Tight 600, 132 px, centred; mono 44 px muted below. Only centred text in the film |

## Sound direction

Synthesised bed at 120 BPM: soft kick on every beat, sub pulse on bars, an airy pad that opens at 7.0 and a riser into 18.0; silence for the first half beat (0.0 to 0.25) so the first key tick is the first sound. All accents from the hits table only. Master -14 LUFS / -1 dBTP. Since most viewers are muted, nothing depends on sound; sound only confirms what the picture already says.

| Time | Event | Sound |
|---|---|---|
| 0.5, 1.0, 1.5, 2.0 | `every`, `frame`, `from`, `code` type | one key tick per character, grouped on the beat |
| 2.5 to 3.5 | dolly out | low air whoosh, peak at 3.0 |
| 3.5 to 5.0 | cards flip in, 3 per beat | soft paper ticks |
| 6.0 | camera holds on the chosen card | silence of the kick for one beat |
| 6.5 to 7.0 | push in | whoosh, peak at 7.0 |
| 7.0 / 7.5 / 8.0 | three lines land | low tick each; brighter tick on `explain,` |
| 10.5 to 11.0 | lines squash to bars | reversed swell into 11.0 |
| 11.5 to 14.5, every beat | keyframes lock | crisp lock tick x7 |
| 15.0 | tracks stand up | short whoosh, peak at 15.0 |
| 15.5 / 16.0 / 16.5 / 17.0 | contact rows land with checks | soft tick x4 |
| 17.5 to 18.0 | checks merge | riser into 18.0 |
| 18.0 | dot lands | soft low hit |
| 18.5 | wordmark resolves | quiet airy shimmer, then the bed ends on 19.0 and the hold is room tone |

## Scene table

| # | Time | Shot | Camera move | Text | Transition out |
|---|---|---|---|---|---|
| 1 | 0.0 to 2.5 | Close-up of the brief line on black, caret in accent | Locked, 3 % log push from 0.5 | `> 20 s showreel, one accent, every frame from code` | Dolly out reveals the line is printed on a card |
| 2 | 2.5 to 3.5 | Card one surrounded by the dark wall, other cards flipping in | Dolly out x6 + 12° tilt onto the wall plane | (line stays on card one) | Continuous into the truck |
| 3 | 3.5 to 6.5 | 2x4 storyboard wall, eight cards, each a live miniature of one scene of this film | Truck right with 6° yaw, hold 6.0 to 6.5 on the kinetic-type card | `Direct` / `brief, directions, storyboard` | Push in: card border floods the frame on 7.0 |
| 4 | 6.5 to 10.5 | Full-frame kinetic type | Flat; 2 % push, 1.5° roll settle | `Design` / `Motion should` / `explain,` / `not decorate.` | Lines squash into bars and lie down on the floor |
| 5 | 10.5 to 15.0 | 3D timeline at 60° on the floor: Type, Camera, Audio, Hits; diamonds lock on beats; waveform of the real bed | Tilt down, crane down, track with the playhead | `Animate` / `springs, camera, sound on the beat`; `frame 0660` to `frame 0900` | Tracks hinge up 90° into rows on 15.0 |
| 6 | 15.0 to 17.5 | Contact sheet of this film's own rendered frames, 4 rows, accent check per row | Orbit 20° with rack focus front row to sheet | `Review` / `every frame, looked at` | Checks slide together into one dot |
| 7 | 17.5 to 18.5 | Accent dot alone in the centre | Settle to flat-on, locked | none | Dot opens a mask for the wordmark |
| 8 | 18.5 to 20.0 | End card, poster frame from 19.0 | Locked | `Video Studio` / `Motion graphics, made in code with Claude` | none (hold 1.0 s) |

## What makes it NOT look AI-generated

- **Self-reference instead of stock content.** Cards are this film's own scenes, the waveform is its own bed, the counter is its own frame number, the contact sheet is its own frames (rendered in a first pass and fed back in). Generated showreels fill screens with generic dashboards and fake code.
- **Restraint.** One accent, matte surfaces, no glow, no particles, no floating cards in a void, no "neon on black" sheen.
- **Cinematography with intent.** Each move is named, starts from a hold or a landing, and has a reason stated above. The camera never drifts. Generated 3D pieces drift continuously and orbit for nothing.
- **Asymmetry and a grid.** Left-aligned type on a 12-column grid with 120 px margins; centred only once, at the end.
- **Edit on the music.** Every land, lock and transition on a beat of a known 120 BPM grid, with the hits table as the only SFX source.
- **No unearned text.** No buzzwords, no "AI-powered", no numbers that are not true of this film.

## Risks and how to handle them

| Risk | Handling |
|---|---|
| Cards in 3D read as cheap "UI on slabs" (the studio's own `three-d.md` warns about this) | Zero thickness, no bevel, unlit faces, contact shadows, pinned to a wall plane. The Design scene is deliberately flat 2D. If the first rendered still of scene 3 looks like a template, drop the yaw to 0° and keep only the truck |
| Constant camera motion tires the eye or blurs on phone | Real holds at 6.0, 8.5 to 10.5 and 19.0 to 20.0; no move faster than one screen width per 0.5 s; motion blur off (it smears type); check a phone-size contact sheet |
| Small text unreadable on phone | Only display (132 px) and mono sublines (44 px) carry meaning; 28 px timecodes and track labels are texture. Review at 390 px width |
| Contact sheet needs frames of the film that contains it | Two-pass render: pass 1 renders scenes 1 to 5 with a placeholder sheet, thumbnails are extracted from pass 1, pass 2 renders the final. Thumbnails of scene 6 itself are excluded, which keeps it honest and avoids recursion |
| Text-to-bars squash looks mushy | Build bars as separate geometry that cross over on one frame where glyph height equals bar height; test that single transition first |
| Too many ideas for 20 s | If the review says it is crowded, cut the orbit in scene 6 to a locked shot and keep the rack focus only |
| Headless WebGL rendering differs from preview | Render with `preserveDrawingBuffer: true`, headless Edge `--use-angle=d3d11 --ignore-gpu-blocklist`, update the camera first each frame so DOM text does not lag |

## Effort: HTML engine with three.js

- Engine: `motion-studio` HTML engine (no voice-over; the beat grid replaces word times), three.js for the world, DOM for all text above the canvas, every frame a pure function of t.
- Scene graph: one wall plane, one floor plane, 8 card planes with canvas textures (each card's miniature drawn by the same 2D draw functions used full-frame), a timeline group (4 track meshes, diamonds, waveform line), a contact-sheet group (reused track meshes plus thumbnail textures), one dot.
- Camera: one keyed path (about 10 keys) with expo in/out and log-space distance; DOM labels projected from it.
- Rough size: scene 1 + 2 (hook and reveal) as the first build and review round; then the wall and push; then Design (largely 2D, fastest); then timeline; then the two-pass contact sheet and end card. Five build rounds plus review rounds; the transition at 10.5 and the two-pass sheet are the costly parts. No external assets, no footage, no Blender needed.

## Key frames

**K1, 0.0 s (frame 0, the hook).** Black `#0D0E10` with a barely visible 48 px grid. One line of JetBrains Mono, 64 px, ink, left-aligned at x = 120 px, vertically centred slightly above the middle (y about 500): `> 20 s showreel, one accent,` with the `>` in muted grey, followed by a solid accent-blue caret block (about 36 x 64 px). Right half of the frame is empty. Nothing else.

**K2, 5.0 s (mid truck across the wall).** Camera about 20 units from a dark wall, yawed 6° so the wall recedes to the right. Two rows of four 16:9 cards (dark `#16181C`, thin light border, rounded corners), with the second and third columns in focus, far right cards softened by fog. Card one (top left, partly leaving frame on the left) still shows the brief line and accent caret. The visible cards show tiny live scenes: a big word, a three-line statement with one blue word, a bar-track timeline, a grid of thumbnails, a centred wordmark, each with a small mono timecode in its top-left corner. Soft shadow under each card on the wall. Lower left, over the dark wall area and outside the cards: `Direct` in 132 px Inter Tight, and below it `brief, directions, storyboard` in 44 px mono grey.

**K3, 19.5 s (poster, last frame).** Flat-on, no perspective, background `#0D0E10` with the grid faded out. Centred: `Video Studio` in Inter Tight 600, 132 px, ink. Directly above the wordmark's cap height, centred, a single accent-blue dot about 24 px across. Below the wordmark, 40 px gap, `Motion graphics, made in code with Claude` in JetBrains Mono 44 px muted grey. Nothing else in the frame; large even negative space on all sides.
