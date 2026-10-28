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

## Not in the system (on purpose)

Glows, lens flares, light leaks, particles, 3D tilts, typewriter cursors, elastic bounces, rainbow gradients. If a brief truly needs one, add it as a deliberate, documented component, not a one-off.

## Note on Studio editing

Library components are prop-driven: edit them through their props in code (or the Studio props panel of a composition). The Remotion skills' `Interactive.*` inline-keyframe style is for one-off scene markup; use it in scenes when you want timeline-editable keyframes.
