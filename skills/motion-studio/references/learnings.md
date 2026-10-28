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

## Rendering and tooling

- Headless Edge renders WebGL with `--use-angle=d3d11 --ignore-gpu-blocklist`; `preserveDrawingBuffer: true`.
- Absolutely centre an oversized scaled stage; grid centring overflows to one side.
- Audio playback in the review player needs HTTP range support in the static server.
- Windows: write files from Node or Python (PowerShell 5.1 mangles UTF-8); long bash heredocs with backticks and quotes can break, so put edit scripts in files.
- Footage as numbered JPEG frames + `frames.json`; pre-warm images for smooth live playback; await `decode()` only when rendering.

## Data honesty

- Invented figures on "example" documents were caught in review. Use relative bars or skeleton lines for illustrative visuals, and keep real numbers for the proof, each with its reference line.
