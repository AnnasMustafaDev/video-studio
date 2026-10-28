# 12 · Build one scene

| | |
|---|---|
| **Purpose** | Implement only scene 1, at full quality, and prove it with rendered frames before anything else is built. |
| **Use when** | The storyboard is approved. |
| **Stage** | Staged prompt 3 of 4. Implementation, first scene. |
| **Inputs you must fill in** | None in the original. Studio additions: `[slug]`, `[CompId]`, `[fps]`, `[width]x[height]`. |
| **Expected output** | Scene 1 in code, composition registered, stills rendered and inspected, visible issues fixed. Remaining scenes untouched. |
| **Why this exists** | A written five-line plan and an attached example scene are cheap checks before code. Evidence: the golden-scene idea is only claimed (one Reddit post, standard few-shot principle); the plan-first step is only claimed by two posters. Findings F-C1, F-C7. |
| **Next prompt** | `13-quality-review.md` on scene 1, then `14-build-next-scene.md`. |

Source: notes §6, prompt 3, verbatim.

## Prompt

```text
Implement only scene 1 in Remotion using the approved storyboard. Focus on composition, typography, timing and motion quality. Use reusable components and frame-based animation. Start the preview, render representative frames and inspect the actual output if your tools support it. Fix visible issues before proceeding. Do not build the remaining scenes yet.
```

## Studio additions

```text
Storyboard: projects/[yyyy-mm-dd]-[slug]/storyboard.md.
Code: studio/src/videos/[slug]/scenes/Scene01.tsx and studio/src/videos/[slug]/[Name].tsx (the composition). Register [CompId] in studio/src/Root.tsx at [width]x[height], [fps] fps, with the full duration from the storyboard (later scenes can be placeholders of the right length).
Take every colour, font, spacing, easing and timing default from studio/src/lib/tokens.ts and existing components in studio/src/lib/. If you need a new reusable piece, put it in studio/src/lib/ and note it.
Check: npm run stills -- [CompId] [the scene-1 frames from the storyboard] in studio/. Open each image and describe what you see. Check clipping, safe margins, alignment, font loaded, focal point, and that motion is mid-ease at transition midpoints. If you could not view the images, say so.
Plan check before code (five lines, then wait only if the scene is risky): what you will build, what you will not touch, the tokens and lib components you will reuse, the one thing most likely to go wrong, and which stills prove it. If a fresh agent is cheap here, have it list the five weakest decisions of that plan first.
Golden scene: if an approved scene from an earlier video of the same type exists (see the golden scenes list at the end of studio/DESIGN_SYSTEM.md), read it and build this scene in the same structure (beat mapping, stagger, entrance style), changing only the content, and list what you copied. Once this scene passes prompt 13 it becomes the golden scene for scenes 2 to N.
Stop after scene 1.
```

Source: golden-scene wording after u/Sangkwun and plan-first after u/TheHol1day (r/ClaudeAI); our wording.
