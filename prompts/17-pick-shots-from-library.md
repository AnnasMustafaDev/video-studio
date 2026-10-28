# 17 · Pick shots from the library

| | |
|---|---|
| **Purpose** | Choose and parameterise a concrete shot for every scene of a storyboard from the curated shot library, instead of inventing each move from scratch. |
| **Use when** | A direction is chosen and you are writing or tightening the storyboard, or you are asking "which shot should I use for X?". |
| **Stage** | Staged prompt 2 of 4, an add-on to the storyboard step. Run it between `11` and `12`, or inside `11`. |
| **Inputs you must fill in** | The brief and chosen direction (or `projects/[yyyy-mm-dd]-[slug]/storyboard.md`), the engine (`remotion` or `html`), the tempo in bpm if there is music, and any shots you already like. |
| **Expected output** | For each scene: the chosen shot id, one alternative, the parameters filled in with real values (words, targets, frames or seconds), the taste verdict and what you changed because of it, and the preview links to watch before building. Written into `storyboard.md`. |
| **Next prompt** | Approve or edit, then `12-build-one-scene.md`. Review the plan with `13-quality-review.md` if it has not been reviewed yet. |

## Prompt

```text
Work from the storyboard of [project folder or pasted storyboard] and the chosen direction [direction name]. Open {{VIDEO_STUDIO}}\shot-library\cards.json (browsable at shot-library/index.html). For every scene that needs a motion move, pick one shot from the library that serves the scene's purpose. Do not pick a shot because it looks impressive; pick it because it does the job of that scene. Give a primary choice and one alternative, and say why.
```

## Studio additions

```text
Engine: [remotion | html]. Tempo: [bpm, or "no music"]. Format: [16:9 | 9:16 | 1:1]. Shots I already like: [ids or "none"].

Rules for the pick:
1. Search cards.json by what the scene must do (category, "use when", words from the scene's purpose), then read the full entry: parameters, taste verdict, build note for my engine.
2. Never pick a shot whose taste verdict is "Breaks our rules" unless the direction explicitly asks for it. For "Adapt first", list the exact changes you will make.
3. One technique is the star once per film. Do not pick the same idea twice (two reveals, two flashes, two camera slams). At most three transition types in the whole video.
4. Check the pairing: look at "pairs well with" for the neighbouring scenes, and do not stack two time effects or two heavy camera moves in adjacent scenes.
5. Convert beats to frames or seconds: 1 beat in the library is 0.5 s at 120 bpm; rescale to [bpm]. Scene lengths must still add up to the composition length.
6. Fill in every parameter the shot lists with a real value (exact text, target element, start and end, easing, hold). No placeholders.
7. List the Preview link of each chosen shot so I can watch it. Note that previews are upstream videos, not our look.

Add to each scene row of storyboard.md: "shot: [id] (alt: [id])", the filled-in parameters, "taste: [verdict] / [changes]", and a "preview" link. Then give me a summary table (scene, shot, verdict, difficulty) and flag the one or two riskiest picks. Do not build anything yet.
```
