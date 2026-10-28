# 40 · Brief template (the 10 ingredients)

| | |
|---|---|
| **Purpose** | Write a brief that specifies the decisions that make a video feel intentional, using the 10 ingredients as a checklist. |
| **Use when** | Every new video. Fill it in, then paste it after `00-master-workflow.md`. |
| **Stage** | Briefing, right before Phase 1. |
| **Inputs you must fill in** | Every `[placeholder]` below. Leave a line as "your call" if you genuinely do not mind; Claude will document its assumption. |
| **Expected output** | A complete brief you can paste. Saved copy in `projects/[yyyy-mm-dd]-[slug]/brief.md`. |
| **Next prompt** | `00-master-workflow.md` (paste brief under it), then `10` or `11`. |

Source: the 10 ingredients and the weak/strong example are from notes §3. "You don't have to specify every pixel. You do need to specify the decisions that make the video feel intentional."

## Prompt (fill-in brief)

```text
BRIEF: [working title]

1. Purpose: [what the video must achieve: product launch, explainer, brand identity, educational, social post]. Audience: [who]. The one thing they must remember: [message]. Desired reaction: [feeling or action].

2. Format: [16:9 1920x1080 | 9:16 1080x1920 | 1:1 1080x1080 | 4:5 1080x1350], [30|60] fps, [duration] seconds. Platform: [YouTube | Reels | Shorts | LinkedIn | site | deck]. Muted autoplay: [yes/no].

3. Art direction: [aesthetic in a few words], references: [links or files]. Palette: [background], [text], [one accent], contrast [high/soft]. Materials and texture: [flat | grain | glass | paper | none]. Atmosphere: [calm, tense, playful, precise...].

4. Composition: [centred hero object | left-aligned type | split screen | full-bleed UI], negative space [where], layers [foreground / midground / background], safe margins [px].

5. Typography: typeface [family], weights [e.g. 700 headline, 400 body], size hierarchy [headline / sub / label in px], line breaks [where], tracking [tight/normal/wide], alignment [left/centre]. Exact on-screen text, in order:
   - "[text 1]"
   - "[text 2]"

6. Movement: [what moves], direction [from/to], distance [px or % of frame], speed [fast/slow, or frames], trigger [on cut, on beat, on word, after previous element]. Easing: [ease-out | spring with subtle overshoot | no linear unless intentional].

7. Timing: scene list with durations [s], delays, holds (numbers and CTA hold at least 1.5 to 2 s), overlaps, reveal times, ending [what the last frame shows and for how long].

8. Transitions: [cut | match cut | mask reveal | wipe | zoom | morph | camera move] between [scene a] and [scene b], and why it supports the story.

9. Audio: music mood [mood, tempo], sound effects [which, on which visual event], voice-over [yes/no, script file], rhythmic accents [where], silence [where].

10. Quality constraints: no clipped text, broken layouts, random decoration, accidental overlaps, inconsistent fonts or unreviewed final renders. Also: [your extras, e.g. no em dashes on screen, real numbers only].

Storyboard the sequence before coding it.
```

## Weak vs strong (notes §3, verbatim)

**Weak prompt:**

> Make a really cool futuristic animation for an AI startup. Make it cinematic, smooth, premium, with nice transitions and glowing effects.

**Why it fails:** it doesn't define the composition, pacing, typography, visual hierarchy, scene order or actual motion. Claude has to invent everything, often producing generic-looking results.

**Strong prompt:**

> Design a 12-second premium product-launch animation for an AI developer tool. Use a near-black background, off-white typography and one electric-blue accent. Begin with an abstract grid assembling into a precise geometric mark. At 2.5 seconds, transition into a close-up of a code editor, with selected lines revealing in a staggered sequence. At 6 seconds, transform the code into a clean system diagram. End with the headline "BUILD WHAT'S NEXT" and a small product URL. Use restrained camera movement, purposeful easing, subtle depth, precise alignment and a sound effect synchronized to the main reveal. Keep each scene visually distinct but stylistically consistent. Storyboard the sequence before coding it.

**Why it works:** Claude has a defined visual system, a sequence of events, concrete timing and a clear ending.

### How the strong prompt maps to the 10 ingredients

| Ingredient | In the strong prompt | Why it helps |
|---|---|---|
| 1 Purpose | "product-launch animation for an AI developer tool" | Sets audience and tone in one phrase. |
| 2 Format | "12-second" (aspect and fps still missing: add them) | Duration fixes the pacing budget. |
| 3 Art direction | near-black, off-white, one electric-blue accent | A closed palette stops random colour. |
| 4 Composition | "close-up of a code editor", "precise alignment" | Tells Claude where the eye goes. |
| 5 Typography | off-white type, exact headline "BUILD WHAT'S NEXT" | Exact text removes invented copy. |
| 6 Movement | grid assembling, staggered line reveals, code transforming | Names what moves and how, not only the end state. |
| 7 Timing | 2.5 s and 6 s marks, a clear ending | Concrete beats replace "smooth". |
| 8 Transitions | code transforms into a diagram (a morph, motivated) | Continuity instead of decorative wipes. |
| 9 Audio | one SFX synced to the main reveal | Sound placed on a visual event. |
| 10 Quality | restrained camera, distinct but consistent scenes, storyboard first | Guards against over-animation and one-shotting. |
