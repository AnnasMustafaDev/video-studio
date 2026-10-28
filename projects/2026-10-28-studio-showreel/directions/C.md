# Direction C: "The stack"

**One-line idea:** the whole film is one machined object: a stack of picture frames held in aluminium. A single accent-blue tab, the playhead, moves through the stack, and each idea of the studio (direct, build, review, sound) is the same object lit and framed a different way. "Every frame is a function of time" becomes something you could hold in your hand.

Angle: object / system led, shot like a product launch film. There is no camera journey through a pipeline and no type-only film. The object carries the meaning, and the text stays small and supporting.

## Why it fits the audience

- **Developers and creators on a GitHub README.** They distrust hype and respect craft. A precise, quiet product film says "this was made carefully" without claiming anything. The object is a literal model of how the studio works: a video is an ordered stack of frames, and the playhead picks one. Developers get the idea before they read the words.
- **Muted autoplay.** Every beat reads with no sound. The meaning lives in what the object does (it stacks, fans out, slides one plate forward, collapses). Sound is an extra layer and never carries the meaning. The README GIF has no audio at all.
- **Phone.** One large object, centred on a plain seamless background, still reads when shown 360 px wide. There are only four short lines of on-screen text, each at h1 size (96 px on 1080) or larger, and never two lines on screen at once. The plates show pictures, not paragraphs, so there is no small UI to read.

## Visual language

- **On screen most of the time:** one object on a seamless cyclorama with no horizon line. The object is a row of thin 16:9 plates standing on edge like index cards in a drawer. Each plate is a printed picture inside a bead-blasted dark aluminium frame, about 3 mm deep at world scale. A single anodised accent-blue tab clips onto the top edge of one plate: the playhead.
- **Palette (studio tokens, one accent):**

| Role | Hex | Where |
|---|---|---|
| Background / cyc | `#0D0E10`, rising to `#16181C` where the key light lands | Seamless floor-to-wall sweep |
| Object metal | `#1E2126` base; highlights come from the light, not from paint | Plate frames |
| Ink | `#F2F1EC` | All text lines |
| Muted ink | `#9A9CA1` | Mono engraving, end-card subline |
| Accent | `#5B8CFF` | The playhead tab only (plus the smaller flag tab in shot 5, which is the same part). The only other blue in the film is one hairline under the repo name on the end card |

- **Materials:** bead-blasted aluminium (metalness 1, roughness about 0.45, so highlights are broad and soft and never look like chrome). A satin anodised tab with the same roughness and a blue base colour. Flat matte picture inserts that are unlit and not tone mapped, so real studio frames keep their true colours. No glass, no transmission, and no reflections of the pictures in the floor.
- **Lighting:** a product photography setup.
  - One large soft key from the top left, behind the camera.
  - One hard, narrow rim light from behind right that draws a single bright line along the top edges of the stack.
  - A weak fill.
  - A soft contact shadow under the stack, nothing else.
  - The lights never move. The camera and the object move, so highlights travel across the metal as in a real turntable shot.
- **Depth:** shallow depth of field in the macro shots only (shots 1, 4 and 5). Focus distance is keyed per shot and only animated once, in the rack focus in shot 5. The background stays dark so the text always has a clean zone.
- **Texture:** extremely fine, static, seeded noise on the cyc to stop gradient banding in the MP4 and GIF. No film grain on the object.

## Structure and tempo

**96 BPM, 4/4. One bar = 2.5 s = 75 frames at 30 fps. 8 bars = 20.0 s.** Every cut, settle and text entry lands on a beat. Big moves start on beat 1 of a bar and settle by beat 3, so beat 4 is a hold.

| Bar | Time | Beat | Purpose |
|---|---|---|---|
| 1 | 0.0 to 2.5 | Hook: in black, a line of light moves along one edge | Curiosity and a premium signal in the first second |
| 2 | 2.5 to 5.0 | Reveal: the edge belongs to a frame, and behind it is a stack | State the idea |
| 3 | 5.0 to 7.5 | Direct: the stack fans open, and each plate is a storyboard panel | Planning |
| 4 | 7.5 to 10.0 | Build: the playhead plate slides out toward the lens and plays | Code renders pictures |
| 5 | 10.0 to 12.5 | Review: rack focus along the stack, and one plate gets flagged | Judged on frames |
| 6 | 12.5 to 15.0 | Sound: seen from above, the plates' top edges form a waveform, and the tab steps on the hits | Sound planned to the frame |
| 7 | 15.0 to 17.5 | Payoff: the stack closes into one block, and the front plate plays the finished showcase | It all becomes one video |
| 8 | 17.5 to 20.0 | End card | Name and promise |

**Pacing:** 8 shots in 20 s, about 3.5 cuts per 10 s. That is deliberately slow for a showreel. The energy comes from the object moving precisely, not from cutting. The film speeds up once: in bar 6 the tab steps on every eighth note.

## Camera language

- A real lens on what behaves like a motion-control rig: 35 mm equivalent for wides, 85 to 100 mm equivalent for macros (a long lens with low distortion and a compressed stack).
- **One named move per shot, then a hold:** push in, truck, crane or rack focus. No continuous floating drift, no handheld shake, no orbiting for its own sake.
- Camera moves ease in and out on a critically damped spring, and the camera never overshoots. A plate may overshoot slightly as it settles in its slot (2 to 3 percent, one settle).
- In wides the camera sits slightly below the top edge of the stack (a hero angle of about 8 degrees). It is directly overhead only in bar 6.

## Transitions

The object motivates every transition. There are no wipes or flashes.

- **Match on the edge:** bar 1 does not cut to bar 2; the macro pulls back into the reveal.
- **Object-driven cut:** in bar 3 the fanning plates swing past the lens. The cut happens on the frame where a dark metal frame edge fills the screen, hidden inside it.
- **Shared element:** the plate that slides forward in bar 4 is the same plate the camera racks to in bar 5.
- **Hard cut on beat 1** from the side view into the overhead in bar 6. It is the only plain cut in the film, so it reads as a change of mode.
- **Plate as curtain:** in bar 7 the stack closes and the front plate fills the frame. The end card appears as the block slides away into the dark.

## Typography and exact on-screen text

- **Fonts:** Inter Tight 600 for lines (studio `font.sans`) and JetBrains Mono 500 for the engraving (`font.mono`). Sentence case throughout.
- **Placement:** lines sit in the dark negative space to the right of or below the object, left-aligned, never over a picture insert.
- **Entry:** a masked rise of 24 px over 12 frames, ease-out (cubic-bezier 0.22, 1, 0.36, 1), with words staggered by 3 frames.
- **Exit:** opacity only, over 8 frames, so text never competes with the next move. One line on screen at a time.
- **The engraving is part of the object, not an overlay:** it is lit with the object and moves with it.

Exact text, in order. Nothing else appears on screen.

| Where | Text | Style |
|---|---|---|
| Engraved on the lower edge of the playhead plate's frame | `f(t)` | Mono, muted ink, physical engraving |
| Bar 2 line | Every frame is a function of time. | h1, 96 px |
| Bar 3 line | Direct it. | h1 |
| Bar 4 line | Build it. | h1 |
| Bar 5 line | Review it. | h1 |
| Bar 6 | (no line; the picture is the statement) | |
| Bar 7 | (no line) | |
| Bar 8 title | video-studio | Display, 132 px, Inter Tight 600, lowercase as the repo name is spelled |
| Bar 8 subline | Motion graphics, made in code with Claude Code. | Body, 44 px, muted ink |

There are no numbers anywhere on screen. The pictures on the plates are real:

- stills rendered from `LibraryShowcase`
- a real storyboard table from this repo's `projects/`
- a real contact sheet from `npm run stills`

Nothing is mocked up to look like output it is not.

## Sound direction

- **Bed:** minimal and warm, at 96 BPM. A soft, muted pulse on the eighths (felted piano or a rounded synth pluck), with a sub that enters in bar 2. No drops, and no risers longer than one bar.
- **SFX palette, all small and mechanical:**
  - a dry aluminium tick when the tab clips on or steps
  - a felt-damped slide when plates move in their slots
  - a low wooden clack when the stack closes

  They are generated with ffmpeg like the rest of the studio SFX.
- **Hits (draft, to be expanded into the storyboard's hits table):**

| Time | Sound | Picture |
|---|---|---|
| 0.0 | Room tone only | Black |
| 0.8 | Tick | Light catches the engraving |
| 2.5 | Sub in | The stack is revealed |
| 3.75 | Tick | Tab clips onto the front plate |
| 5.0 | Three soft slides, staggered | The fan opens |
| 7.5 | One long slide | Plate slides out |
| 10.0 | Tick | Tab hops to the flagged plate |
| 12.5 to 15.0 | A tick on each eighth note | Tab steps along the waveform |
| 15.0 to 15.6 | Accelerating slides | The stack closes |
| 15.625 | Clack (beat 2 of bar 7) | The block is closed |
| 17.5 | One pluck, then the bed rings out | End card |
| 19.5 to 20.0 | Silence | Final hold |

- **Silence as accent:** the bed drops out for one beat right before the clack in bar 7.
- **Loudness:** -14 LUFS, -1 dBTP. The film must work fully muted.

## Mini scene table

| # | Time | Shot | Camera move | Text | Transition out |
|---|---|---|---|---|---|
| 1 | 0.0 to 2.5 | Black. The rim light draws one thin bright line along the top edge of a single plate, left to right, as the plate rotates 6 degrees on its vertical axis. At 0.8 s the engraving `f(t)` catches the light. | Macro, 100 mm equivalent, locked. The object rotates, not the camera | `f(t)` (engraved) | No cut: the camera starts pulling back on 2.5 |
| 2 | 2.5 to 5.0 | The plate turns out to be a framed picture (a still from the showcase). Behind it, plates slide in along depth one after another into a stack of about forty, each settling with a small overshoot. On beat 3 the playhead tab clips onto the front plate. | Pull out from macro to a three-quarter medium, settling by beat 3 | Every frame is a function of time. | The line fades. On 5.0 the stack starts to fan |
| 3 | 5.0 to 7.5 | The stack fans open around its bottom edge like a deck of cards. Each plate now shows one storyboard panel, reading as a sequence from left to right. | Truck right along the fan, ending as one plate swings across the lens | Direct it. | Cut hidden inside a passing dark frame edge |
| 4 | 7.5 to 10.0 | The stack is closed again, seen from the side. The plate with the playhead tab slides out of the stack toward the lens, and its picture plays real rendered frames from the studio. | Slow push in at 85 mm, holding from beat 3 | Build it. | Shared element: the same plate, now seen from behind the stack |
| 5 | 10.0 to 12.5 | Looking down the length of the stack, with the pictures facing the lens one behind another (a contact sheet in depth). Focus racks from the front plate to one plate halfway back. The tab hops to it, and a second, smaller tab flips up on it: the flagged frame. | Locked. Rack focus from front to middle on beat 1, then hold | Review it. | Hard cut on 12.5 |
| 6 | 12.5 to 15.0 | Overhead. The plates now have different heights, so their top edges trace a waveform across the frame. The tab steps from plate to plate on each eighth note and lands on the tall plates exactly on the hits. | Locked overhead with a very slow crane down (5 percent of the frame) | (none) | The plates drop back to equal height on 15.0. Cut on the move |
| 7 | 15.0 to 17.5 | Front three-quarter view. The stack closes into one solid block with an accelerating slide and a clack. The front plate fills most of the frame and plays the finished showcase. | Push in until the front plate is about 70 percent of the frame width, then hold | (none) | The block slides away to frame left into the dark, opening up negative space |
| 8 | 17.5 to 20.0 | End card. The object sits small at the far left in the dark, with the title and subline on the right. The accent hairline under the title draws in from left to right. The last 1.2 s are held still. | Locked | video-studio / Motion graphics, made in code with Claude Code. | End. It can loop, because the last frame is dark enough to return to frame 1 |

## Why it will not look AI-generated

- **One object, one lighting setup and one material system for 20 s.** AI-looking films change worlds every two seconds; this one commits.
- **Restrained metal:** rough aluminium with broad, soft highlights. No chrome, glass or neon edges, no glow, particles or lens flares, and no floating dust.
- **Real content on the plates:** actual studio renders, a real storyboard and a real contact sheet, not generated "dashboard" imagery.
- **Mechanical truth:** plates move like physical things in slots. They slide and settle once, and never float or bob. The tab clicks into discrete positions, and the sound comes from the same physical vocabulary.
- **Composition with holds:** every shot ends on a still beat, and the camera never wanders.
- **Small, exact type in sentence case:** few words, no gradient fills, no 3D text.

## Risks and how to handle them

| Risk | Why | Handling |
|---|---|---|
| three.js metal looks like plastic | Physically based metal needs an environment to reflect. Without one it renders flat grey | Give it a studio environment for reflections (RoomEnvironment through PMREM, or a small custom softbox environment of two white rectangles). Use roughness 0.4 to 0.5 so imperfect reflections do not show. Check stills at 100 percent before adding motion |
| Soft and contact shadows look cheap or jagged | Real-time shadow maps band and stair-step | Bake a static, blurred contact-shadow texture under the stack, since its footprint is known in each shot. Add one PCF-soft directional shadow at a high map resolution. No shadow on the cyc wall |
| Depth of field looks like a blur filter | Post-process depth of field in three.js smears edges and leaves halos against the background | Use it only in shots 1, 4 and 5, and keep it mild. Keep the background out of focus through dark lighting rather than blur. Text lives in the DOM and is never blurred |
| Edges never catch the light | Box geometry has knife-sharp edges with no highlight, which reads as CG | Use rounded-box geometry with a small bevel radius and enough segments. The rim line in shot 1 depends on this, so test it first |
| Picture inserts turn grey | ACES tone mapping and scene lighting wash out images | Make inserts unlit materials with tone mapping off and anisotropy at maximum, and use textures at native resolution |
| Forty plates with real textures cost too much | Many large textures per frame | Plates far from the camera use small mipmapped thumbnails. Only the hero plate gets a full-resolution still or frame sequence |
| Frames are not reproducible | Renders must be frame-exact | Everything is a function of the frame: no clocks, no rAF animation, seeded noise only. The camera is set at the start of each frame |
| It still looks like a 3D tech demo | Even well-lit three.js can look synthetic in macro | Build shot 1 alone first (the hardest macro) and treat it as a gate. If it fails a strict still review, say so plainly. Then either render the hero plate in Blender as a still or turntable sequence and composite it in, or fall back to a flatter orthographic version of the same object (plates as 2D cards with painted light) |

**Engine:** two options.

- Remotion with `@remotion/three` (React Three Fiber). It is not yet in `studio/package.json`, so it is a new dependency to vet first.
- The motion-studio HTML engine with plain three.js, which already has 3D guidance (`skills/motion-studio/references/three-d.md`).

There is no voice-over, so Remotion is the more natural home.

## Effort

High for a 20 s piece:

- about one day to build and light the object and get shot 1 through its gate
- one to two days for the other seven shots, sound and formats

External assets:

- real studio stills and frame sequences (renderable today from `studio/`)
- a storyboard capture
- a contact sheet

No footage and no stock. Blender is needed only if the shot 1 gate fails.

## Three key frames

1. **1.0 s (shot 1, macro).** 16:9, near-black. A single plate seen almost edge-on, filling the frame diagonally from lower left to upper right, about 6 degrees off parallel to the lens. Only its top edge and a sliver of its face are lit. A 2 px bright line along the bevel runs from the left edge of the frame to about 60 percent across, fading to dark where the light has not yet reached. Below the lit edge, about one third in from the right of the frame border, the engraving `f(t)` is in sharp focus. Everything more than 3 cm behind the focal plane is soft. No text overlay, and nothing blue yet.

2. **9.0 s (shot 4, build).** Side three-quarter view from the right, with the camera slightly below the top edge. The closed stack runs from frame centre back to the upper left and recedes into darkness, its top edges catching the rim light as a row of fine bright lines. One plate has slid out about half its width toward the lens and sits in focus in the right third of the frame. Its insert shows a real frame of the showcase in full colour. The accent-blue playhead tab is clipped onto its top edge, the only coloured object in the frame. In the dark lower left, left-aligned, is the line "Build it." in off-white h1.

3. **13.8 s (shot 6, sound).** Straight overhead. The plates appear as thin dark-metal lines with bright top bevels, laid side by side across the full width of the frame. Their lengths vary, so their ends trace a waveform with a few clear peaks. The blue tab sits on one of the tallest peaks, about two thirds of the way across. The cyc is an even, flat dark around them, with a soft contact shadow under each plate. No text. The composition is one horizontal band centred vertically, with generous dark space above and below.
