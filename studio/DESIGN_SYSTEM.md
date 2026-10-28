# Design system

The rules every video in `studio/` follows. Values live in `src/lib/tokens.ts`; this file says how to use them. If a scene needs something this file does not allow, change the system on purpose (tokens + this file), never inline in one scene.

Reference composition: `LibraryShowcase` (1920x1080) and `Showcase-Vertical` (1080x1920) in `src/videos/library-showcase/`. Every rule below is visible there.

## Palette

One accent. Everything else is neutral.

| Token | Value | Use |
|---|---|---|
| `color.bg` | `#0D0E10` | Frame background |
| `color.surface` | `#16181C` | Cards, plates |
| `color.surfaceRaised` | `#1E2126` | Neutral bars, raised panels |
| `color.line` / `lineStrong` | off-white at 10 % / 22 % | Hairlines, grid, borders |
| `color.text` | `#F2F1EC` | Primary text |
| `color.textMuted` | `#9A9CA1` | Supporting text, labels |
| `color.textFaint` | `#5E6168` | Metadata, timecodes |
| `color.accent` | `#5B8CFF` | The focal point only |

Accent rules:

- At most one accented thing on screen at a time: one word, one bar, one number, one mark.
- Accent is never a background fill for large areas and never a glow.
- To re-brand a video, change `color.accent` (and only that) in a copy of the tokens.

## Fonts

Loaded with `@remotion/google-fonts` in `src/lib/fonts.ts` (rendering waits until they are ready).

- **Inter Tight** 400 / 500 / 600: everything people read. Headlines 600, body 400.
- **JetBrains Mono** 400 / 500: small labels, eyebrows, paths, timecodes.

No third family. No italics for emphasis: use the accent colour or weight.

## Type scale

Designed against the short side of the frame (1080 px), so the same scale works in 16:9, 9:16 and 1:1.

| Token | Size / line height | Use |
|---|---|---|
| `display` | 132 / 1.02, 600, -0.035em | One statement per scene, max 2 lines |
| `h1` | 96 / 1.05, 600 | Headlines, vertical titles |
| `h2` | 64 / 1.1, 600 | Section titles, card titles |
| `body` | 44 / 1.3, 400 | Supporting lines (minimum for anything important) |
| `caption` | 48 / 1.25 | Captions |
| `label` | 26 / 1.2, mono, +0.08em | Eyebrows, chart titles, metadata |

Text rules: sentence case everywhere (no Title Case, no ALL CAPS headlines). Break lines by hand with `\n` in `TitleReveal` so line breaks follow meaning. Never let text touch the safe margin; if it does, cut words before shrinking type.

## Spacing and safe margins

8 px grid: `space.xs 8 / s 16 / m 24 / l 40 / xl 64 / xxl 96`. Radii `8 / 16 / 28`.

Safe margins (`safeArea` in tokens, applied by `<SafeArea>` and `useSafeArea()`):

| Format | Size | Top | Right | Bottom | Left |
|---|---|---|---|---|---|
| 16:9 | 1920x1080 | 96 | 128 | 96 | 128 |
| 9:16 | 1080x1920 | 220 | 80 | 380 | 80 |
| 1:1 | 1080x1080 | 96 | 96 | 96 | 96 |

9:16 keeps the top 220 px and bottom 380 px free for the platform UI (profile, caption, buttons). Re-compose for the format; do not just scale the 16:9 layout (16:9 puts things side by side, 9:16 stacks them).

## Motion principles

1. **Frame-based only.** `useCurrentFrame()`, `interpolate()`, `spring()`, `useVideoConfig()`. No CSS transitions or animations, no `requestAnimationFrame`, no timers, no `Math.random()` (use `random(seed)` from `remotion`). The same frame must always render the same pixels.
2. **Springs, not linear.** Entrances use `springs.smooth` (no overshoot) or `ease.out`. Exits use `ease.in` and are faster than entrances (`timing.exit` 12 frames vs `timing.enter` 20). Linear is only for counters' clocks and constant drift (grid).
3. **Tiny overshoot, max.** `springs.settle` (about 1 % overshoot) is the only bouncy preset, for one element per scene. No elastic, no bounce.
4. **Hold.** After a reveal finishes, hold at least `timing.hold` (45 frames, 1.5 s) before the next thing moves or the scene leaves. The last scene holds still for its final second.
5. **One focal point.** Each moment has one thing to look at. Stage, do not stack: in the showcase the lower third leaves before the captions arrive.
6. **Stagger in reading order.** Words `timing.wordStagger` (3 f), characters `timing.charStagger` (1.5 f), lines and bars `timing.lineStagger` (5 f).
7. **Small distances.** Text travels 0.4 em or rises out of a mask; elements move 10-24 px. Nothing flies across the frame.
8. **Sound is placed, not sprayed.** One cue per event that deserves weight; whooshes start 3-4 frames before a cut.

## Transitions

Built on `@remotion/transitions` inside a `<TransitionSeries>`, always with `transitionTiming()` (spring, no overshoot, 15 frames). Approved presets (`presets` in `src/lib/transitions.tsx`):

| Preset | When |
|---|---|
| `presets.wipe(from, edgeColor?)` | Moving forward in a sequence. Hard edge, optional 3 px accent edge line; outgoing scene drifts 4 %. |
| `presets.fade()` | A change of topic. Let the incoming scene start its animation after the fade (delay >= 14) so text never ghosts over text. |
| `presets.circle([x, y])` | Into a detail, or a match cut: put the origin where the previous focal point was. |

Rules: at most three transition types per video. A hard cut is always allowed and often best. Total duration = sum of scenes - transitions x 15.

## Components

All in `src/lib/`, exported from `src/lib/index.ts`. Every component is frame-local (frame 0 = its parent `Sequence` start), and most take `delay` and `durationInFrames` (omit the latter to stay until the scene ends).

### `<Background>`: every scene

Flat colour, hairline grid or dot grid, optional vignette and seeded film grain (changes every 2 frames, `random()`-driven).

```tsx
<Background variant="grid" cell={80} grain grainAmount={0.06} drift={4} seed="intro" />
```

### `<SafeArea>`: layout box

Padded by the current format's safe margins; flex column.

```tsx
<SafeArea justify="center" align="flex-start" gap={space.xl}>...</SafeArea>
```

### `<TitleReveal>`: openers, chapter titles

Masked line-by-line reveal, optional mono eyebrow with accent tick, optional subtitle.

```tsx
<TitleReveal eyebrow="Chapter one" title={"A small motion system,\nbuilt to be reused."} subtitle="Supporting line." size="display" delay={6} />
```

### `<WordStagger>`: statements, hooks, supporting lines

Word-by-word rise and fade; `highlight` puts one word in the accent.

```tsx
<WordStagger text="Motion should explain, not decorate." highlight={["explain"]} size="display" delay={4} />
```

### `<CharStagger>`: one short word or phrase

Per-character masked reveal; lines break only between words. Not for sentences.

```tsx
<CharStagger text="Made in code." size="display" align="center" delay={14} />
```

### `<LowerThird>`: naming a person or source

Accent bar grows, name wipes in, role fades up; leaves on its own (default 3 s).

```tsx
<LowerThird name="Sam Rivera" role="Product designer" delay={8} durationInFrames={60} />
```

### `<Captions>`: word-timed subtitles

Takes `{text, startMs, endMs}[]` (times relative to the parent Sequence; Whisper output maps directly). Pages by word count and pauses; spoken words white, current word accent, upcoming dimmed.

```tsx
import words from "./captions.json";
<Captions captions={words} maxWordsPerPage={6} pauseMs={500} />
```

### `<StatCounter>`: one number that matters

Counts with ease-out, tabular figures, width reserved so nothing shifts.

```tsx
<StatCounter value={450} label="frames, every one rendered from code" delay={14} />
```

### `<BarChart>`: comparing a handful of values

Horizontal bars grow in order; one `highlight` bar in accent; values ride on bar ends. Five bars or fewer.

```tsx
<BarChart title="Scene length, seconds" data={[{ label: "Title", value: 3.3 }]} highlight={0} max={5} decimals={1} valueSuffix=" s" />
```

### `<ShapeMask>`: revealing an object inside a scene

Rectangle (from a side) or circle (from a point), spring-driven; `reverse` hides.

```tsx
<ShapeMask shape="circle" origin={[50, 50]} delay={10}><Logo /></ShapeMask>
```

### `presets`, `maskWipe`, `circleReveal`, `transitionTiming`: scene transitions

See Transitions above.

```tsx
<TransitionSeries.Transition presentation={presets.wipe("left", color.accent)} timing={transitionTiming()} />
```

### `<Sfx>` + `cues`: sound effects

`<Sequence from={at}>` + `<Audio>` from `@remotion/media`. Built-in cues are synthesised by `npm run sfx` (no licence issues): `tick` (something lands), `whoosh` (wipes), `thud` (the main reveal, once).

```tsx
<Sfx at={sceneStart(1) - 4} src={cues.whoosh} volume={0.3} />
```

### Hooks

`useInOut({delay, durationInFrames})` (enter/exit progress), `useStagger()`, `useSafeArea()`, `directionVector()`.

## Frame ramp, text floor, one accent per frame (video-native type)

The px `type` scale above is for reading text. For hero moments use the frame ramp in `tokens.ts`: sizes in percent of the composition WIDTH (vw), so a hero word can fill the frame instead of collapsing into a web layout. Evidence: a published launch-video spec (HeyGen frame spec); reasoning documented, numbers not independently checked.

| Step | vw | px at 1920 | Use |
|---|---|---|---|
| `wordmark` | 30 | 576 | One giant keyword, once per film |
| `stat` | 18 | 346 | A numeral that is the whole scene |
| `display` | 14 | 269 | One or two words |
| `claim` | 6.5 | 125 | A claim or fragment line (source says 6 to 9; 6.5 fits five words in the safe area) |
| `reading` | 3.2 | 61 | Reading text on a hero frame |
| `label` | 1.4 | 27 | Chrome labels: the text floor |

Text floor: nothing below `TEXT_FLOOR_VW` (1.4 vw, 27 px at 1920); `frameType()` enforces it. Accent: one accented thing per frame, a test you can run on any still. Atoms (colours, families) are sacred, composition is free, numbers come from the script.

```tsx
const t = useFrameType("stat");            // { fontSize, lineHeight, letterSpacing, fontWeight }
<div style={{ fontFamily: font.sans, ...t }}>30</div>
```

### `<FragmentChain>`: film copy as fragments (F-A2)

1 to 4 word fragments with a picture beat between them. `mode="build"`: fragments append to one held line, the newest in the accent, the line re-centres once per fragment (widths measured with a canvas, so the font must be loaded; `fonts.ts` blocks rendering until it is). `mode="replace"`: each leaves whole, the next takes the same centre. Budget: about 15 to 25 words per 30 s, 6 or fewer for a muted loop, at most 8 words on one frame, copy on at most about 65 % of frames. Check with `lintCopy()` or `node scripts/copy-lint.mjs "a|b|c" --seconds 11`. Evidence: numbers from one author's study of eight films (their claim); the discipline is good, taste evidence mixed.

```tsx
<FragmentChain fragments={["Move once.", "Land softly.", "Cut."]} mode="build" step="claim" framesPerFragment={26} delay={6} />
```

### `<GhostType>`: typed text with a locked box (F-C14)

The full text is always laid out; untyped characters are transparent, so lines never reflow and the card never jumps. No cursor (cursors stay out of the system). Use only when a brief calls for typed text (prompt box, terminal).

```tsx
<GhostType text="Same frame, same pixels." fontSize={t.fontSize} delay={30} maxWidth={1000} />
```

### `<Camera>` with `speedCurve` and `logZoom` (F-B4)

Camera speed is a table of shares of cruise speed over seconds, integrated into position, so it cannot surge or stop unless the table says so. Zoom runs in log space. Write the table in the storyboard as the camera language of a glide shot. Evidence: one precisely described prompt; the optical-flow check from it is not built.

```tsx
const cam = speedCurve([[0, 0], [0.5, 0.55], [1.1, 1], [2.2, 1], [3, 0.15], [3.3, 0]], { fps: 30, distance: 2600 });
<Camera x={cam.position(frame)} zoom={logZoom(p, 1, 1.35)}>...</Camera>
```

### `buoyant()`: a rising element that never freezes (F-A3)

Cubic ease-out plus a half-sine bob over the whole move; ends exactly at 1 with about 2 % overshoot, so it is the one bounce allowed: one element per scene. Check any move with `node scripts/export-curve.mjs buoyant` (prints the longest mid-move stall) and plot the JSON with `inspect.mjs plot`. Evidence: one production write-up; the constants are this studio's own.

```tsx
const rise = (1 - buoyant()(progress)) * 90;   // px, progress 0..1
```

## Transitions added

| Preset | When | Evidence |
|---|---|---|
| `velocityCut({ travel, frames })` + `velocityCutTiming(frames)` | Momentum should cross the edit: the outgoing scene accelerates (x1.15 per 60-fps frame) and is cut at its fastest frame; the incoming scene starts at the same speed (36 px per 60-fps frame, never above 60) and decays x0.93 per frame. Delay the incoming scene's entrances by `0.4 * frames`. Text must be under 20 px per frame when read. | Author-measured numbers, claimed |
| `occluderCut({ from })` + `occluderTiming(frames)` | A soft neutral band sweeps across and the hard cut happens at the midpoint, with a 28 px drag before and a settle after. | Author-tuned on placeholder material: a starting point |

Still at most three transition types per video. Line-carry, impact slam and light leak are not built: line-carry needs per-scene cooperation, and glows and leaks are outside this system.

## Frame arithmetic traps

Listed in the header of `src/lib/curves.ts`: `fadeIn(0)` is an empty frame, exit fades must reach 0 on the last frame, frame N is the first frame after an N-frame move, no double fades, keyframes start off-screen, freeze copy before hard-coding frames. Helpers: `softFade`, `exitOpacity`.

## Not in the system (on purpose)

Glows, lens flares, light leaks, particles, 3D tilts, typewriter cursors, elastic bounces, rainbow gradients. If a brief truly needs one, add it as a deliberate, documented component, not a one-off.

## Note on Studio editing

Library components are prop-driven: edit them through their props in code (or the Studio props panel of a composition). The Remotion skills' `Interactive.*` inline-keyframe style is for one-off scene markup; use it in scenes when you want timeline-editable keyframes.
