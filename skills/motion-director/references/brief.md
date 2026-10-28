# The brief: 10 ingredients

A professional brief decides what makes the video feel intentional. It does not specify every pixel. Fill each ingredient; where the user did not say, infer and mark it `(assumed)`. Ask one concise round of questions only for what is critical and cannot be inferred (usually: purpose, platform, real assets, exact claims).

| # | Ingredient | Decide | Example |
|---|---|---|---|
| 1 | **Purpose** | What the video must achieve and the one thing the viewer remembers. Audience, emotional response | Launch teaser for developers; remember "it writes the diagram for you"; feel: precise, confident |
| 2 | **Format** | Aspect ratio, resolution, frame rate, duration, platform | 16:9 1920×1080 @ 30 fps, 12 s, YouTube + site hero; 9:16 cut for Shorts |
| 3 | **Art direction** | Aesthetic, reference styles, palette (with hex), contrast, materials, texture, atmosphere | Near-black `#0B0D10`, off-white `#EDEBE6`, one electric-blue accent `#3D7BFF`; flat, editorial, faint grain |
| 4 | **Composition** | Where things sit: centred hero, left-aligned type, negative space, foreground / midground / background | Left-aligned type on a 12-col grid, hero object right third, generous negative space |
| 5 | **Typography** | Typeface, weights, size hierarchy, line breaks, tracking, alignment, **exact on-screen text** | Inter Display 800 for heads at 140 px, -0.03 em; JetBrains Mono 500 for meta; "BUILD WHAT'S NEXT" |
| 6 | **Movement** | What moves, direction, distance, speed, trigger | Code lines rise 24 px from 8 px blur, staggered 60 ms, triggered on the beat |
| 7 | **Timing** | Scene durations, delays, holds, overlaps, reveal times, ending | Scene 1 0-2.5 s, scene 2 2.5-6 s, end card from 9.5 s and holds 2.5 s |
| 8 | **Transitions** | Cut, match cut, mask reveal, wipe, zoom, morph, camera move, and why each supports the story | Grid lines become the editor gutter (match cut); code collapses into diagram nodes (morph) |
| 9 | **Audio** | Music mood and tempo, SFX, voice-over, rhythmic accents, silence; where audio events occur | 100 bpm minimal pulse; soft impact on the logo lock at 2.4 s; silence under the final line |
| 10 | **Quality constraints** | What must never happen | No clipped text, broken layouts, random decoration, accidental overlaps, inconsistent fonts, unreviewed final render |

Before writing the brief, write one line: *"Reading this as: <kind of video> for <audience>, <tone>, leaning toward <visual family>."*

## Weak versus strong

Weak: "Make a really cool futuristic animation for an AI startup. Cinematic, smooth, premium, nice transitions and glowing effects." No composition, pacing, typography, hierarchy, scene order or motion: the builder invents everything and the result is generic.

Strong (shape to aim for): "A 12-second premium launch animation for an AI developer tool. Near-black background, off-white type, one electric-blue accent. An abstract grid assembles into a precise geometric mark. At 2.5 s, transition into a close-up of a code editor; selected lines reveal in a staggered sequence. At 6 s, the code transforms into a clean system diagram. End on 'BUILD WHAT'S NEXT' and a small product URL. Restrained camera, purposeful easing, subtle depth, precise alignment, one sound effect synced to the main reveal. Scenes visually distinct, stylistically consistent. Storyboard before code."

It works because it has a visual system, a sequence of events, concrete timing and a clear ending.

## Also capture

- **Assets:** which must be real (logo, screenshots, footage, voice, music) and whether they exist yet; which can be made in code. Licences for fonts and music.
- **Proof:** real numbers with their source. None? Then the visuals that imply data are marked illustrative.
- **Call to action:** one action, one label, one place.
- **Engine:** Remotion (default: type, UI, diagrams, data, explainers, templates), the motion-studio HTML engine (every cut on a spoken word of a voice-over), or flag After Effects / Blender for compositing or real 3D.

## The tagged skeleton, banned list, glossary

The 10 ingredients stay the checklist. The written brief is laid out as fixed tags so the builder cannot quietly reinterpret it: **inputs** (what to ask the user, with defaults), **direction** (concept triple, look, and a **Banned for this film** line), **structure** (beat map or timed scenes, every hand-off written "X becomes Y"), **build** (numbered engineering rules), **gotchas** (lines from `motion-studio/references/gotchas.md` that apply) and **start** (the gate: beat map and 4 to 8 named stills before any code). Template: [../templates/brief.md](../templates/brief.md).
Why: it turns a film into a contract and puts the approval stop before code; the same skeleton recurs in five finished films by two authors (evidence: pattern shown, result quality not checked). Credit the author when a rule from the research is cited in a brief.

- **Banned list:** seed from `motion-studio/references/banned-effects.md`, add 3 to 6 bans specific to this direction. Why: bans remove the model's defaults (fade, glow, particle burst). Evidence: shown in finished films.
- **Glossary and acceptance criteria:** define "punchy", "premium", "smooth" in frames and px once ([../templates/glossary.md](../templates/glossary.md)); state measurable outcomes ([../templates/acceptance.md](../templates/acceptance.md)). Why: "make it better" fails; exact CSS values were misread. Evidence: claimed by two builders.
- **Reference clause:** study a reference for smoothness, timing, shot durations, fonts and elements; borrow techniques and change the design so it looks like our own. Measure shot durations per scene and say what is borrowed versus changed.
