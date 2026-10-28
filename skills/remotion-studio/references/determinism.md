# Deterministic Remotion rules

Remotion renders frames out of order, in parallel tabs. Anything that depends on wall-clock time, render order or hidden state makes frames disagree, flicker or differ between preview and render. Every animation must produce the same image whenever the same frame is rendered. The official skill in `studio/.claude/skills/` is the API reference; these are the rules this studio enforces.

## Use

- `useCurrentFrame()` (local to the enclosing `<Sequence>`), `useVideoConfig()` for `fps`, `width`, `height`, `durationInFrames`.
- `interpolate(frame, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })`. Always clamp unless you want extrapolation.
- `spring({ frame, fps, config, delay, durationInFrames })` for entrances; use the presets in `tokens.ts`. Damping high (e.g. 200) for no overshoot; lower damping for a small, intentional overshoot.
- `Easing.bezier(...)` / `Easing.out(Easing.cubic)` for eased tweens; linear only when mechanical on purpose (progress bars, tickers).
- `<Sequence from durationInFrames premountFor>` and `<Series>`; `@remotion/transitions` `<TransitionSeries>` for scene transitions. Remember: transitions overlap scenes, so total duration = sum of sequences minus sum of transition lengths. Compute it, don't guess.
- `random('seed-string')` for any variation; same seed, same value.
- `staticFile()` for files in `studio/public/`; `<Img>`, and the video/audio components named in the official skill (this project ships `@remotion/media`), so frames wait for assets.
- Fonts through `@remotion/google-fonts` `loadFont()` or local fonts as the official fonts guide says, so text never renders in a fallback face on early frames.
- `delayRender` / `continueRender` only for genuinely async data, always with a timeout and error path.

## Never

- CSS `transition`, `animation`, `@keyframes`; `requestAnimationFrame`, `setTimeout`, `setInterval`; `Date.now()`, `performance.now()`; `Math.random()`.
- Animation state in `useState` / `useEffect` / refs that accumulates across frames.
- `<img>`, `<video>`, `<audio>` HTML tags for media in the composition.
- `will-change` on text that is scaled (blurry text).
- Hard-coded colours, font sizes, durations or easings in scenes: take them from `tokens.ts` / `timing.ts`.

## Timing as data

- `timing.ts` per video: scene starts and lengths in frames, derived once from the storyboard's seconds. Scenes read their offsets from it; nothing else hard-codes a frame number that another file depends on.
- `hits.ts`: `[{ frame, label, sfx, volume }]`, a one-to-one copy of the storyboard's hits table. The composition renders each SFX in a `<Sequence from={frame - peakOffset}>` so the sound's peak (not its start) lands on the hit. Export the same list as JSON (seconds) for `inspect.mjs sync`. No SFX anywhere else.
- Voice-over driven pieces: measure word times (Whisper) and store them as data; place changes ~0.1 s before the word. If every cut must land on spoken words with live HTML review, use the `motion-studio` HTML engine instead.

## Check before rendering

- `npm run lint` passes (eslint with the Remotion config catches several of the above).
- Render the same frame twice (two stills runs) when something looks unstable: identical images, or there is hidden state.
- Search the video folder for banned APIs: `Math.random`, `Date.now`, `setTimeout`, `requestAnimationFrame`, `transition:`, `@keyframes`.
