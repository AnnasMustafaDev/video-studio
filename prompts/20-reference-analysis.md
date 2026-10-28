# 20 · Reference analysis

| | |
|---|---|
| **Purpose** | Break a reference video down like a motion designer (10 points) and plan how to capture its principles without copying it. |
| **Use when** | You saw a reel, ad, Dribbble shot or YouTube intro and want something with that feel. |
| **Stage** | Creative direction, before or instead of `10-creative-directions.md`. |
| **Inputs you must fill in** | `[the reference: file, frames or link]`, `[what to keep]`, `[what to change]`, `[your topic or product]`. |
| **Expected output** | A 10-point breakdown with facts separated from interpretations, a feasibility verdict (Remotion vs external assets or tools), and an implementation plan. No full implementation. |
| **Next prompt** | `11-storyboard.md` (the plan is your direction). If you want options on top, `10-creative-directions.md`. |

Source: notes §7, verbatim.

## Prompt

```text
Analyse the supplied motion-graphics reference as a motion designer.

Break down:
1. Composition and visual hierarchy.
2. Typography, font characteristics, spacing and text treatment.
3. Color palette, contrast, textures and lighting.
4. The movement of each major element.
5. Timing, pacing, easing and staggered animation.
6. Scene transitions and continuity.
7. Depth, camera movement and layering.
8. Sound effects and their relationship to visual events.
9. Which design choices create the premium look.
10. Which aspects can be recreated in Remotion and which require external assets or specialist tools.
Separate observable facts from uncertain interpretations.

Create an implementation plan that captures the reference's underlying design principles without unnecessarily copying its branding or exact creative expression.

Do not write the full implementation until the breakdown is complete.
```

From the notes: a reference gives more information than adjectives, but still say what to preserve and what to change. References that depend on complex 3D, custom footage or advanced compositing may not be reproducible in Remotion.

## Studio additions

```text
Reference: [file path, frames or link]. Keep: [what to keep]. Change: [what to change]. Our subject: [topic or product].
Claude cannot watch a video file directly. If the reference is a video, extract frames first (for example ffmpeg -i [ref.mp4] -vf fps=4 projects/[yyyy-mm-dd]-[slug]/ref/%04d.png) and analyse the frames; estimate timings from frame numbers and say they are estimates. If there is no audio access, mark point 8 as unknown rather than guessing.
Give timings in seconds and frames. For point 10 name the engine per element: Remotion, motion-studio, After Effects or Blender.
Do not reuse the reference's logo, brand colours, exact copy or characters.
Write the breakdown and plan to projects/[yyyy-mm-dd]-[slug]/directions.md.
```
