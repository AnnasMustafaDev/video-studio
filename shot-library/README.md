# Shot library

51 motion shots, curated and rewritten from the 124 recipe cards of [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) by Vincent Wei (Apache-2.0). Each entry says what the shot does, when to use it and when not to, how long it runs in beats, what to specify in the storyboard, how to build it in our Remotion project and in the HTML engine, and whether it fits our house rules.

Open [`index.html`](index.html) in a browser to browse: filter by category, difficulty and taste verdict, search, jump between "pairs well with" shots, and open each shot's live preview.

## Use it in the storyboard stage

1. Write the brief and pick a direction first (`prompts/10`). The library never replaces direction.
2. For each scene in the storyboard (`prompts/11`), ask "which shot is this?" with `prompts/17-pick-shots-from-library.md` or the `shot-library` skill. They search `cards.json`, propose two or three shots per scene, and write the chosen shot id plus its parameters into the scene's row of `storyboard.md`.
3. Watch the **Preview** of every shot you intend to use. Upstream previews are real renders, not our look. We link them, we do not copy them.
4. Build the scene (`prompts/12`) with the "build in remotion" or "build in the html engine" note, reusing `studio/src/lib` or `skills/motion-studio/template/comp/engine.js`. For tuned numbers read the upstream card and demo named in the entry.
5. Before approving a shot, read its **taste verdict**.

## What is in here

| File | What it is |
|---|---|
| `cards.json` | The data: one object per shot (id, name, category, what it does, use and avoid, duration in beats and seconds, parameters, build notes for both engines, upstream card and demo paths, preview links, difficulty, taste verdict, pairs). Also the list of skipped upstream cards with reasons |
| `index.html` | A self-contained viewer with the data inlined and escaped. Works offline from a file. Light and dark, readable down to 375 px |
| `build-index.mjs` | `node shot-library/build-index.mjs` re-inlines `cards.json` into `index.html` after you edit the data |

## Reading a card

- **Beats.** One beat is 0.5 s (120 bpm), 15 frames at 30 fps. Scale to the real tempo of the track. Durations are our reading of the upstream card, not a promise.
- **Difficulty.** `easy`: a few tweens on our components. `medium`: custom layout or a measured screenshot. `hard`: custom SVG, masks, 3D or a lot of tuning.
- **Taste verdict**, judged against our rules (`studio/DESIGN_SYSTEM.md`): no plain templated looks, one accent, no glow, particle or lens-flare effects, deterministic frames, overshoot only from `springs.settle`, nothing flying across the frame, holds of 1.5 s.
  - **Fits our studio**: use as written.
  - **Adapt first**: a good idea, but change what the note says (usually fonts, colour, overshoot, glow).
  - **Breaks our rules**: do not use unless the chosen direction asks for it; the note says what to keep.
- Upstream paths are relative to this repo (`third_party/video-shotcraft/...`). The upstream demos are branded "video-shotcraft", need the shared helpers in `demos/_fixtures/` and are tuned on placeholder content: treat their numbers as a starting point.

## What was skipped, and why

73 cards are not in the library (listed in `cards.json` under `skipped` and at the bottom of the viewer). Judged from upstream's index summaries and card titles, not from full card text:

| Why | Cards |
|---|---|
| Glow, neon, light-flare or particle look | 16 |
| Flies, tumbles or orbits across the frame, or needs heavy 3D | 22 |
| A gimmick, retro or decorative effect | 18 |
| Overlaps a card we kept | 10 |
| Tied to one product or too niche | 7 |

If a skipped card turns out to be what a video needs, open its upstream card in `third_party/video-shotcraft` (only some are vendored) or the [live gallery](https://vincentwei1021.github.io/video-shotcraft/) and add an entry to `cards.json`.

## Licence and credit

The entries in `cards.json` and the viewer are our own words and structure, with credit to the upstream card on every entry. The ideas, parameter values and demos come from video-shotcraft (Copyright Vincent Wei, Apache-2.0). The unmodified upstream subset, the licence and the notice are in [`third_party/video-shotcraft/`](../third_party/video-shotcraft/) (`LICENSE`, `NOTICE.md`, `UPSTREAM.md`). Remotion has its own licence.
