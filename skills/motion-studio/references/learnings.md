# Learnings log

Technique only: no client, product or app names. Newest at the bottom of each section. Append after every project.

## Direction and taste

- Constant camera movement reads as cheap and AI-made. Move only with a reason (a reveal, a focus shift), then settle and hold while the viewer reads.
- Faux-3D UI (bevelled buttons, tilted screen slabs, clearcoat, depth of field on UI) was rejected. Flat, crisp UI with a caption per beat and quiet springs was preferred.
- A felt human moment as hook (a clock past a deadline, a question the viewer answers in their head) beats an abstract statistic.
- An emotional palette shift (problem dark, solution light, end card in brand colour) structures a film without any text.
- The reference reels that convinced were restrained: one device, one caption swapping with the voice, one slow push. Craft added on top of that (real motion blur, shared-element transitions, liquid spotlight, physical cursor) is what makes it better, not more effects.
- A plain coding agent with no video skill already makes acceptable short promos; a skill earns its place with a look, a workflow, footage handling and quality bars.

## Process

- Review in an HTML player with the real mix, not MP4s. Render once, on approval. A 68 s film at 60 fps with 4 subframes takes about 12 minutes; a live reload takes seconds.
- Write the plan as a scene table first (time, line, caption, visual, motion, transition, sound), then build.
- Look at contact sheets yourself before every handover: they caught overflowing captions, a flood too small to cover the corners, overlays one frame late, labels at the wrong node.
- Designing before the voice exists is possible with estimated word times; swap in measured times later without changing the composition.

## Motion

- Strong motion prompts and plans name: inputs, direction, structure (beat map), build method, gotchas, a banned list, and a review step with about four stills before rendering.
- Springs as closed-form step responses; a value with several targets is the sum of one spring per change.
- Log-space zoom; one named move per shot; never zoom in and straight back out.
- Flood-and-contract transitions must overscale past the farthest corner: radius ≥ distance from the origin point to the farthest corner, or the edge shows.
- A flood that starts from the element the viewer is looking at (a full stop, a document) feels motivated; from the centre it feels like a wipe.
- The liquid spotlight (leading edge fast, trailing edge slow) makes row-to-row focus feel physical.
- Camera keys must be monotonic in time; hold times derived from word timings need `Math.max` against the previous key.
- Update the camera before projecting any overlay.
- Centre-aligned captions that build word by word look lopsided; left-align.
- Cursor: hover/press feedback and a ring on click; the UI reacts 80 to 150 ms after the press.
- Films without a voice-over time against the beat grid: scenes as whole beats in `script.json`, a hits table as a plain ES module shared by the page and the sound tool, so cues and picture cannot drift.
- Speed-curve camera: interpolate speed between knots with smoothstep and integrate analytically (integral of smoothstep is x^3 - x^4/2); position stays a pure function of t, a move never reverses when all speeds are >= 0, and hand-overs keep their speed.

## Voice

- Kokoro (local) sounded natural where cloud TTS sounded robotic. `af_heart` at 0.94 to 0.98 speed is a safe default; always offer 3 to 4 cast samples.
- Voices missing from the local cache fail with `HF_HUB_OFFLINE=1`; download before going offline.
- An Application Control policy blocked msgpack's native DLL on first import; retry worked; fallback `MSGPACK_PUREPYTHON=1`.
- Line-by-line generation lets pauses be authored on the beat grid.
- faster-whisper with `initial_prompt` hallucinated repeated transcripts; run it plain. One-word lines get misheard; rewrite them.

## Music and sound

- A bed synthesised in an OfflineAudioContext on the film's own beat grid lands every scene change on a bar line with zero editing.
- Arrangement mirrors the story: breakdown under the question, riser into the payoff, impact on the result and on the logo.
- Duck with a sidechain keyed by the voice bus.
- Synthesised whoosh, pop and click are enough; place by peak.
- Synthesise bed and SFX as two stems in OfflineAudioContext (32-bit float WAV, seeded noise), then gain + a 4x-oversampled limiter at -1.3 dBFS, re-measured in a loop: single-pass and even two-pass loudnorm fell back to dynamic mode on a short, peaky 20 s mix and landed at -14.6.
- Place SFX by peak and verify by measuring the peak in the SFX stem around each cue; 6 to 14 ms late is normal for attack ramps.

## Rendering and tooling

- Headless Edge renders WebGL with `--use-angle=d3d11 --ignore-gpu-blocklist`; `preserveDrawingBuffer: true`.
- Absolutely centre an oversized scaled stage; grid centring overflows to one side.
- Audio playback in the review player needs HTTP range support in the static server.
- Windows: write files from Node or Python (PowerShell 5.1 mangles UTF-8); long bash heredocs with backticks and quotes can break, so put edit scripts in files.
- Footage as numbered JPEG frames + `frames.json`; pre-warm images for smooth live playback; await `decode()` only when rendering.
- Review player buttons added with a generic `#bar button` rule leak that style into later buttons (scene markers); scope control styles by class.
- Put a background grid inside the camera-scaled frame, not on the stage, so a dolly scales it with the content and a later hand-off to a texture of the same frame matches.

## Data honesty

- Invented figures on "example" documents were caught in review. Use relative bars or skeleton lines for illustrative visuals, and keep real numbers for the proof, each with its reference line.

## Typesetting in the HTML engine (kinetic type on a grid)

- Set type as SVG `<text>`, one element per character, x from the measured prefix width (`getComputedTextLength` of `text.slice(0, i)`) plus `i * tracking`. Baselines are exact (`y` is the baseline), kerning survives per-character motion, and tracking can be animated per frame.
- Measure with the renderer that draws (an off-screen SVG text), not canvas widths; canvas `measureText` glyph bounds are still right for ink boxes (a word's box hugging its ascender and baseline matched SVG to the pixel).
- Baseline masks: wrap each line in a `<clipPath>` rect in user space; move glyphs inside, keep the clip still. Put the transform on the clipped group when the mask must travel with the line (a word shrinking into an index).
- A variable font with an `opsz` axis (Inter variable "opsz" file) switches to its display cut automatically at headline sizes; morphing `font-weight` per frame needs a re-layout per weight (cache measurements by weight).
- Check a long headline's measured width against the grid before designing around it; break onto two baselines rather than shrink below the type scale.
- Flipping a plane 180 degrees about a hinge rule moves it to the other side of the rule: whatever sits there must move out in step (same easing), or hinge the plane on the side that is free.
- CSS 3D plane at exactly 90 degrees is a hairline only when `perspective-origin` sits on the hinge line.
- A hard cut must land on a page that is already set; entrance animations on the cut frame read as a blank flash.
- Short 8-frame ease-in collapses read as cuts; use a softer ease-in when the viewer must see things converge (shape-match transitions).
- Detect single-frame pops by comparing each frame with both neighbours and the neighbours with each other (decode at 320x180 grey with ffmpeg); a pop differs from both while they agree.

## Player

- Do not use the audio element as the only clock: browsers (embedded panes, autoplay policy, buffering) can pause it on their own and the picture freezes. Run a wall clock, re-anchor it to `audio.currentTime` each tick while the audio is playing, and re-seat the audio when it drifts more than about 0.25 s.

## Sound

- Measure SFX timing in the SFX stem, not the full mix: onset finders on the mix pick the louder neighbour or the bed for dense hits (2 frames apart) and report false failures.
- A loop film ends its sustained chord with a ~12 ms fade on the last sample instead of a long fade-out, so the loop point is a clean cut back to the first downbeat.

## Richness without breaking a strict grid (kinetic type)

- "Clean and correct" kinetic type was scored plain (4/10) by an independent reviewer. What lifted it, staying on the grid: one extreme scale event (a word pushed 3x to bleed off the page), a solid accent flood instead of hairline-only accent, a push that overfills the frame and then stays as an 8 % ink texture under the next scene, a whole-page push with the grid held still, and never letting the page empty between beats.
- Overlap every exit with the next entrance by 4 to 6 frames, and keep one persistent anchor (an index column) across scene changes; a page that clears between beats reads as slides.
- Give each scene a different typographic action; one entrance curve reused for every title becomes a template.
- A solid flood that opens again from the centre (an evenodd path whose paper hole shrinks to a point, then grows back to a 2 px frame) is a colour event and a transition in one.
- When cutting a word into panels, cut at the midpoint between neighbouring letters' ink, not at even widths, or each panel shows slivers of its neighbours.
- Variable font: when re-laying out at a new weight, set `font-weight` on the glyphs too; changing only the measurement leaves the rendered weight unchanged.
- Measure numerals with the same `font-variant-numeric: tabular-nums` they are drawn with, or right-aligned index numerals drift.
- A loop can start on a set frame: end by re-setting the opening word in its exact frame-0 position, so muted autoplay never opens on bare paper.
- Encode QA drafts from mjpeg frames with `scale=out_range=tv,format=yuv420p` and `-color_range tv`; otherwise ffmpeg writes full-range yuvj420p.

## Real-time product metal (three.js)

- Metal with metalness 1 renders flat black without something to reflect. Bake a small studio environment through PMREM (one key softbox, one narrow rim strip, a weak fill, a dim warm floor) and put RectAreaLights at the same positions so direct highlights and reflections agree. A dark base colour (around `#4b5059`) still reads as dark anodised aluminium once it has something to reflect.
- A large key lights a rough face at every angle; a smaller, brighter key gives a highlight that rolls on and off the face as the object turns, which is what sells "lit metal" in motion.
- Rounded bevels alone give a soft, wide band. A diamond-cut chamfer (bevel brighter, roughness about 0.2, found in the shader from the object-space normal) draws the thin line of light that reads as machined. Keep faces and side walls bead-blasted.
- ExtrudeGeometry faces are triangulated in long slivers; smoothing normals across the bevel tilts their edge vertices and streaks the face. Force face normals flat after creasing.
- Low-frequency variation in a tiled roughness map shows up as stripes on large flat faces under a soft key. Keep the roughness map a fine, even tooth.
- Engrave by baking the engraving into the part's own normal and colour maps (one plate-wide texture), not a decal plane: a decal never matches the base surface and shows as a rectangle.
- A rough surface needs about 20 degrees of turntable rotation, not 6, for its highlight to visibly travel.
- Unlit picture inserts: write them with alpha 0 into a half-float target and let the post pass skip tone mapping where alpha is 0. The same flag paints a cyc in exact hex colours and lets the clear colour match the cyc, so the void never shows at frame edges.
- Single-pass golden-angle bokeh (clamp the circle of samples behind the centre to twice the centre's) gives depth of field with no halos on silhouettes. Drive the circle from focal length squared over distance with a per-shot aperture; a rack across a deep arrangement needs a deliberately large aperture to read.
- Unlit inserts do not fog; dim them by hand with the same near/far, and start the fog just behind the shot's subject so the subject is never dimmed.
- Many thin parallel edges (a stack of 40 plates seen from the side) alias into moire even at 2x supersampling plus MSAA; sub-frame motion blur in the final render softens it, but frame such views so the ridges are not tiny.
- An edge-on row of plates in perspective shows faces at the frame edges; an orthographic camera for that one shot turns every plate into a clean bar (an elevation drawing) and reads as a deliberate change of mode.
- Supersampled 4K MSAA plus bokeh runs at about 14 fps in headless Edge; 1x plus MSAA about 29 fps. Use 1x for live review and 2x for stills and renders.

## Drafts and QA

- x264 drafts can show frame-difference spikes on static shots (encoder keyframes, low-motion quantisation); confirm a suspected pop on rendered PNGs before fixing anything.
- three.js films: before `__ready`, draw one frame of every shot (e.g. every 1.25 s) so shader compiles and texture uploads happen during load; otherwise the first play-through stalls ~0.5 s at each new shot. Also copy the latest player (wall clock re-anchored to audio) into every new film instead of an older template copy.

## External techniques adopted (research round, 2026-10-29)

Credited as external and evidence-labelled; full rules and the reasons are in the reference files named in brackets. None of these was verified on our own renders yet: confirm on the next film and edit the line.

### Direction and taste

- A concept is an Idea (8 words or fewer), a Device (one object through every shot) and a Grammar (a rule the form obeys), then killed or kept by ownership, deletion, specificity and competitor tests. [direction.md; doc-level]
- Every scene is made out of the previous one: the storyboard transition column says "X becomes Y", never "cut" or "fade" (UI and product pieces). [transitions.md; shown in two films]
- Write the banned list per film, seeded from the global bans, and have the reviewer check it. [banned-effects.md; shown]
- Spend stillness once: one earned hold of about 1.0 to 1.6 s on the key claim, then the biggest spike. [direction.md; author's measurement]
- Copy arrives as 1 to 4 word fragments, about 15 to 25 words per 30 s; copy on more than about 65 percent of frames reads as a subtitle film. [design.md; author's measurement]

### Process

- After scene 1 passes review it is the golden scene: build scenes 2 to N from its source, changing only content. [golden-scene.md; claimed]
- One local commit per approved scene, read the diff on every revision, keep a decision log. [golden-scene.md; first-hand]
- Define vague words per film in motion terms (frames, px, curve) and state outcomes as thresholds checkable on a still. [golden-scene.md; claimed]

### Motion

- When a move pauses or snaps, plot value and velocity before changing code; a bob wave spanning only the rise phase left 16 percent of a move at zero velocity. [motion.md; first-hand article]
- Velocity-matched cut: exit ends at 25 to 40 px/frame at 60 fps, entry starts 30 to 55 and decays about 0.93 per frame. [transitions.md; author's measurement]
- A light-leak must wash out the old picture (brightness up, contrast down) or it reads as a sticker; impact elements (flash, shake, stamp) share one frame. [transitions.md; doc-level]
- Fast moves leave ghost copies at 4 motion-blur subframes; use 8 or slow the move. [gotchas.md; claimed in three prompts]
- A fade under 0.3 s reads as a pop; a highlight box behind a word reads as a text selection; `visibility: visible` on a child shows through a hidden parent. [gotchas.md; failure-derived]

### Sound

- Derive cue times from the animation's own spring constants so retiming the picture retimes the sound. [audio.md; documented]
- At most 3 full-frame beat hits per film, at least 16 beats apart; the rest only on the hero element. [audio.md; user-complaint-derived]
- Spotlight a claim with a silence hole in the music instead of an effect. [audio.md; documented]
- Whisper per segment split at pauses of 100 ms or more, first word anchored to the measured onset. [voice.md; claimed]
- To test: picture leading the voice by 2 to 5 frames (80 to 150 ms). [audio.md; one comment, untested]
