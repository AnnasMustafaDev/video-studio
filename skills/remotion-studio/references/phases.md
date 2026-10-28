# The five phases in this repo

`$VS` = `C:\Users\Annas Mustafa\Documents\me\video-studio`. Slug: lowercase-kebab (`launch-teaser`). Paper trail: `$VS\projects\<yyyy-mm-dd>-<slug>\`. Composition id: PascalCase of the slug (`LaunchTeaser`), plus a format suffix for extra ratios (`LaunchTeaser916`).

## Phase 1: understand and plan (no code)

1. Create the paper-trail folder. Follow the `motion-director` skill (or the staged prompts listed in `$VS\prompts\INDEX.md`):
   - `brief.md`: the 10 ingredients. Identify purpose, audience, platform, duration, aspect ratio, message, intended emotion. Ask concise questions only for critical gaps; otherwise assume and write the assumption down.
   - `reference.md` if a reference was given.
   - `directions.md`: three genuinely different directions, one recommended. **Stop for the user's pick.**
   - `storyboard.md`: scene table (first/last frame, focal point, exact text, animation, easing, transition, audio cue, purpose, link, repetition flag), hits table, design-system notes, assets, formats, build order.
   - `review.md` Round 0: director review of the plan, fixes applied. **Stop for approval.**
2. Identify which assets are made in code and which need real images, video, fonts or audio. Missing ones are listed, not faked.

If the user explicitly says "just build it", still write a short brief and storyboard (they take minutes) and say you skipped the approval stops at their request.

## Phase 2: design for quality

- Map every storyboard element to tokens in `studio/src/lib/tokens.ts` and components in `studio/src/lib/` (titles, text reveals, captions, lower thirds, stats/charts, masks/transitions, backgrounds, audio helpers). Note it in `storyboard.md` under design-system notes.
- New visual need? Prefer a parameter on an existing component. A genuinely new component gets a name, props (content, duration, delay, colour, size, movement) and a line in the notes; propose adding it to `src/lib/` and `DESIGN_SYSTEM.md` once it is approved in this video.
- Principles: clear hierarchy and negative space, one focal point per scene, consistent type/spacing/colour/alignment, purposeful easing and duration, controlled stagger and layering, meaningful transitions, depth/texture/light only where justified, sound synced to events, readable text in safe margins for the platform.

## Phase 3: implement in Remotion (scene 1 only first)

1. Inspect the project: `studio/src/Root.tsx`, `studio/src/videos/_template/`, `studio/src/lib/`, the official skills. Do not rewrite working infrastructure.
2. `studio/src/videos/<slug>/` = copy of `_template`. Inside: the composition, `scenes/Scene1.tsx...`, `timing.ts` (scene starts/durations in frames, derived from seconds once with `Math.round(s * fps)`), `hits.ts` (from the storyboard's hits table). Register the composition in `Root.tsx` with the brief's width, height, fps and `durationInFrames` computed from `timing.ts`.
3. Build **only scene 1** (or the scene the storyboard names as the quality probe). Focus on composition, typography, timing and motion quality.
4. `npm run lint` (eslint + tsc) must pass.
5. Go to Phase 4 for that scene. Only after it passes review, build the other scenes (optionally with parallel scene-builder subagents, one file each), then inspect the whole film.

## Phase 4: render, inspect, improve

See [inspect-render.md](inspect-render.md). Loop: stills, look, fix, independent review, fix top defects, re-render, until the stop rule. Successful compilation is not proof of visual quality.

## Phase 5: final delivery

See [delivery.md](delivery.md): render at the specified resolution and fps, normalise loudness, ffprobe, poster frame, report, learnings.

## Revisions after delivery

Small change (copy, colour, timing): edit, re-run stills for the affected frames plus scene boundaries, quick self-check, re-render, re-probe, update the report. Structural change: back to the storyboard first.
