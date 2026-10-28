# Brief: <title>

Date: <yyyy-mm-dd> · Slug: <slug> · Engine: Remotion (studio/) | HTML engine (motion-studio)

Reading this as: <kind of video> for <audience>, <tone>, leaning toward <visual family>.

| # | Ingredient | Decision | Source |
|---|---|---|---|
| 1 | Purpose (goal, audience, the one thing to remember, feeling) | | user / assumed |
| 2 | Format (ratio, px, fps, duration, platform) | | |
| 3 | Art direction (aesthetic, palette hex + roles, contrast, texture, atmosphere) | | |
| 4 | Composition (grid, alignment, layers, negative space) | | |
| 5 | Typography (families, weights, scale, tracking, exact text) | | |
| 6 | Movement (what, direction, distance, speed, trigger) | | |
| 7 | Timing (scene lengths, holds, overlaps, ending) | | |
| 8 | Transitions (which, why) | | |
| 9 | Audio (music mood + bpm, SFX, voice, silence) | | |
| 10 | Quality constraints (never: clipped text, overlaps, random decoration, mixed fonts, unreviewed render) | | |

## Tagged skeleton (the contract the builder works from)

**inputs:** what to ask the user for, with the default used if skipped.

**direction:**
- Idea (8 words or fewer): 
- Device (one object carried through every shot): 
- Grammar (a rule the form obeys): 
- Look, type, cursor, the one accent: 
- **Banned for this film** (seeded from `~/.claude/skills/motion-studio/references/banned-effects.md`, plus 3 to 6 film-specific bans; the reviewer checks each): 

**structure:** beat map (music-led: BPM, total beats, beats before the drop, ranges) or line-to-visual map (voice-led), as timed scenes. Every transition reads "X becomes Y".

**build:** numbered engineering rules (deterministic frames, tokens, camera rule: one eased move per scene, each scene starts at the previous end zoom).

**gotchas:** the lines from `~/.claude/skills/motion-studio/references/gotchas.md` that apply to this film.

**start (gate):** before any code, show the beat map or line-to-visual map and N named stills (4 to 8, scene and timestamp). If you cannot run code or view images, say so first.

**glossary and acceptance:** `glossary.md` (vague words in motion terms) and `acceptance.md` (measurable criteria), templates beside this file.

## Assets
| Asset | Real / code-made | Path or "missing" | Licence |
|---|---|---|---|

## Proof and claims
Real numbers with source, or "none: data visuals are illustrative".

## Call to action
One action, one label, one place.

## Open questions (only critical ones)
