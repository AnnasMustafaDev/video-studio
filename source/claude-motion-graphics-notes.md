# How to create genuinely good motion graphics and animated videos with Claude

Source notes as received on 2026-10-22. Everything in `guide/index.html`, `prompts/` and `skills/` must cover this file. The "Remotion +2"-style citation markers from the original paste are dropped; the resources they pointed to are listed in section 12.

The biggest secret is that people getting impressive results usually aren't just typing "make me a cinematic video" into Claude. They're using Claude as a motion designer, creative director, animator, and developer, with a workflow that lets them inspect and improve the actual video.

The most useful technique to learn is Claude Code + Remotion + Remotion Agent Skills. Remotion is a framework that creates videos from React code, rendering animations frame by frame. Claude writes the code, Remotion previews and renders the video, and you direct the creative decisions. Remotion officially supports this workflow with Claude Code and other coding agents.

I'll walk you through the tools, prompts, terminology, setup, and iteration process I'd use to get professional-looking results.

## 1. First, understand the workflow people are using

1. Creative direction: choose a visual reference, style, story and mood.
2. Script and storyboard: define scenes, timings, layouts, transitions and audio.
3. Claude Code + Remotion: build the animation from reusable components and timed sequences.
4. Preview, inspect and revise: catch visual defects, refine movement, adjust timing and improve sound.
5. Render the final video: export the finished MP4 in the right resolution and frame rate.

This is the key difference between a generic AI-generated animation and a carefully directed motion-graphics piece: you control the design, timing, and revisions instead of accepting the first output.

Remotion's official beginner workflow explicitly supports creating videos through prompts, previewing them in Remotion Studio, and refining them through follow-up instructions.

### Which tool should you use for which job?

- **Remotion — your main tool.** Best for kinetic typography, animated diagrams, UI demos, product launches, data visualizations, explainers, subtitles and repeatable video templates. (Official Remotion documentation)
- **Adobe After Effects — for detailed visual finishing.** Useful for complex compositing, bespoke effects, intricate shape animation, particle effects and hands-on artistic control.
- **Blender — for real 3D.** Use when you need detailed 3D product shots, realistic materials, complex lighting, camera movement or simulated environments.

You don't need all three to get started. For your first serious attempt, I'd stick to Claude Code and Remotion. Add other tools only when the visual you want requires them.

## 2. Install the right skills in Claude Code

A skill is a set of instructions and workflows that teaches a coding agent how to handle a particular task consistently. It's different from a single prompt: the guidance can be reused across many projects.

Remotion provides official agent skills for creation, markup, rendering, captions, maps, and more. Its `remotion-best-practices` skill combines the other Remotion guidance.

### Step 1 — Set up a project

Install Node.js first if it isn't already installed. Then run these commands in your terminal:

```
npx create-video@latest --yes --blank motion-studio
cd motion-studio
npx remotion skills add
npm run dev
```

These are based on Remotion's official project-creation workflow.

### Step 2 — Open a second terminal

In the same project folder, start Claude Code:

```
cd motion-studio
claude
```

Keep the development server running in the first terminal so you can preview your changes in Remotion Studio.

### Step 3 — Check that the skills are available

Ask Claude:

```
Inspect this project and identify the Remotion agent skills
available to you.

Read the relevant skill instructions before creating anything.
Tell me which workflows you will use for:
- Creative planning
- Animation and typography
- Scene transitions
- Audio
- Previewing and rendering
- Quality assurance

Do not build the video yet.
```

This establishes whether Claude can see the relevant guidance before you commit to a large generation task.

You can also install the official Claude Code plugin from Remotion's marketplace if you want its packaged workflow and skills:

```
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

Restart Claude Code after installing the plugin. The plugin is documented by Remotion.

## 3. The most important skill: learn to describe motion, not just appearance

**Weak prompt:** "Make a really cool futuristic animation for an AI startup. Make it cinematic, smooth, premium, with nice transitions and glowing effects."

Why it fails: it doesn't define the composition, pacing, typography, visual hierarchy, scene order or actual motion. Claude has to invent everything, often producing generic-looking results.

**Stronger prompt:** "Design a 12-second premium product-launch animation for an AI developer tool. Use a near-black background, off-white typography and one electric-blue accent. Begin with an abstract grid assembling into a precise geometric mark. At 2.5 seconds, transition into a close-up of a code editor, with selected lines revealing in a staggered sequence. At 6 seconds, transform the code into a clean system diagram. End with the headline "BUILD WHAT'S NEXT" and a small product URL. Use restrained camera movement, purposeful easing, subtle depth, precise alignment and a sound effect synchronized to the main reveal. Keep each scene visually distinct but stylistically consistent. Storyboard the sequence before coding it."

Why it works: Claude has a defined visual system, a sequence of events, concrete timing and a clear ending.

Remotion's own guidance similarly encourages creating a project through structured prompts and iterating on the preview rather than treating the initial generation as the finished product.

### The 10 ingredients of a professional motion-graphics prompt

Use these as a checklist whenever you brief Claude.

1. **Purpose** — What is the video supposed to achieve? Product launch, explainer, brand identity, educational video, social post?
2. **Format** — 16:9 for YouTube, 9:16 for Reels, or 1:1 for square content. Specify resolution, frame rate and duration.
3. **Art direction** — Describe the aesthetic, reference styles, palette, contrast, materials, textures and atmosphere.
4. **Composition** — Where are the elements? Centered hero object, left-aligned typography, negative space, foreground/background layers?
5. **Typography** — Typeface, weight, size hierarchy, line breaks, tracking, alignment and exact on-screen text.
6. **Movement** — What moves, in which direction, how far, at what speed, and what triggers the movement?
7. **Timing** — Specify scene durations, delays, holds, overlaps, reveal times and ending.
8. **Transitions** — Cut, match cut, mask reveal, wipe, zoom, morph, or camera move. Use transitions that support the story.
9. **Audio** — Music mood, sound effects, voiceover, rhythmic accents and silence. State where audio events occur.
10. **Quality constraints** — No clipped text, broken layouts, random decoration, accidental overlaps, inconsistent fonts or unreviewed final renders.

You don't have to specify every pixel. You do need to specify the decisions that make the video feel intentional.

## 4. Learn the vocabulary that makes Claude much better at animation

You don't need to become an expert in After Effects or write complex React code yourself. But knowing these terms lets you direct Claude much more precisely.

- **Kinetic typography** — Text itself becomes the animation: words slide, scale, split, rotate, reveal or change emphasis. Use this for high-impact hooks, title sequences and product statements. Prompt terms: word-by-word reveal, staggered text, per-character animation, masked reveal, tracking expansion.
- **Easing and spring physics** — Easing controls acceleration and deceleration. A spring adds a physically inspired response, potentially with overshoot. This is one of the biggest differences between robotic movement and polished motion. Prompt terms: ease-out, cubic-bezier, spring animation, subtle overshoot, settling motion, no linear movement unless intentional.
- **Staging and visual hierarchy** — Staging determines what the viewer notices first. Hierarchy controls which element has the greatest visual importance. Don't animate everything equally. Prompt terms: single focal point, negative space, foreground midground background, parallax, asymmetric composition, controlled visual hierarchy.
- **Transitions and match cuts** — A transition connects scenes. A match cut uses a shared shape, position, motion or idea to make the change feel continuous. Prompt terms: match cut, shape morph, directional wipe, camera-driven transition, overlapping transition, motivated cut.
- **Lighting, texture and depth** — These help flat graphics feel tactile or cinematic. Use them selectively; excessive glow, blur and grain can make a design look cheap rather than premium. Prompt terms: rim lighting, soft bloom, ambient occlusion, subtle film grain, depth of field, specular highlights.

### One particularly important technical rule

Remotion animations should be driven by the current frame and the video configuration, rather than depending on real-time browser animation timers. Its documentation explains how `useCurrentFrame()`, `interpolate()` and `spring()` support frame-controlled animation and help avoid rendering inconsistencies.

You can ask Claude to enforce that directly:

```
Use deterministic, frame-based animation throughout Remotion.

Use useCurrentFrame(), interpolate(), spring(), and
useVideoConfig() where appropriate.

Do not rely on CSS transitions, requestAnimationFrame,
wall-clock timers, or random values that can vary between renders.

Ensure every animation produces the same output when the
same frame is rendered repeatedly.
```

That is a technical constraint, not just a stylistic preference.

## 5. The master prompt I would use with Claude Code

This is the prompt I'd save and reuse for your own projects. It instructs Claude to work like a small motion-design studio, not just a code generator.

### Motion Graphics Director — Master Workflow

Act as a senior motion designer, creative director, animator, sound designer, and Remotion engineer.

Your goal is to produce a polished, production-ready motion-graphics video, not a generic AI-generated animation.

**Phase 1 — Understand and plan.** Before writing code:
1. Identify the purpose, target audience, platform, duration, aspect ratio, message, and intended emotional response.
2. If a critical requirement is missing, ask concise clarifying questions. Otherwise, make sensible creative assumptions and document them.
3. Define the visual direction: palette, typography, composition, texture, lighting, depth, movement, and reference aesthetic.
4. Create a storyboard with timestamps, scene purpose, on-screen text, visual composition, movement, transitions, and audio cues.
5. Define a consistent design system that can be reused across all scenes.
6. Identify which assets should be created in code and which require genuine images, video, or audio files.

Do not begin full implementation until the storyboard and art direction are coherent.

**Phase 2 — Design for quality.** Use professional motion-design principles:
- Strong visual hierarchy and intentional negative space.
- Consistent typography, spacing, colors, and alignment.
- Purposeful movement with appropriate easing and duration.
- A clear focal point in every scene.
- Controlled staggered reveals and layered motion.
- Meaningful transitions that connect the story.
- Subtle depth, texture, lighting, and effects only where justified.
- Sound design synchronized with important visual events.
- Readable text, safe margins, and composition appropriate to the target platform.

Avoid generic templates, excessive glow, random particles, constant movement, unnecessary transitions, and decoration without a purpose.

**Phase 3 — Implement in Remotion.**
1. Inspect the existing project and available Remotion skills before editing.
2. Use the official Remotion best-practices guidance.
3. Build reusable components and separate scene components.
4. Centralize design tokens, timing values, typography, and colors.
5. Use deterministic frame-based animations.
6. Keep all scene durations and transitions synchronized with the final composition.
7. Use real assets when required and preserve their aspect ratios.
8. Ensure audio timing and visual timing are coordinated.
9. Keep the implementation maintainable and easy to revise.

Do not rewrite working project infrastructure unnecessarily.

**Phase 4 — Render, inspect, and improve.** Do not treat successful compilation as proof of visual quality.
1. Start the Remotion preview.
2. Render an initial version or representative scene.
3. Inspect actual rendered frames, including scene boundaries, text-heavy sections, complex transitions, and the final frame.
4. Check for clipping, overflow, poor alignment, inconsistent typography, awkward pacing, flicker, incorrect timing, and visual discontinuities.
5. Fix the problems found.
6. Re-render and inspect the revised result.
7. Repeat until the critical defects are resolved or explain any remaining limitations.

If visual inspection tools are unavailable, tell me instead of claiming the video was visually verified.

**Phase 5 — Final delivery.** Render the final video at the specified resolution and frame rate. Report:
- The output file and its location.
- Duration, resolution, and frame rate.
- Assets and fonts used.
- Any missing assets or licensing concerns.
- What was checked during quality assurance.
- Any remaining limitations.

Work in stages. Prioritize creative quality, visual consistency, deterministic rendering, and verified output over adding more effects.

Start with Phase 1 and present the proposed creative direction and storyboard before implementing the full video.

**How to use it:** Save it in your project instructions or paste it at the start of a new video project. Then provide your specific brief, reference images, script, and desired outcome. It is a reusable workflow, not a guarantee that every video will be good without review.

Remotion's agent skills provide the technical guidance, while this master prompt adds a creative-production process and explicit quality checks.

## 6. Don't ask Claude to make the entire video in one shot

This is one of the most important workflow improvements you can make. Use a sequence of smaller prompts. Each stage has a different purpose.

**Prompt 1 — Creative direction:** "I want a 20-second premium motion-graphics video about [topic]. Generate three genuinely different creative directions. For each, describe the visual language, palette, typography, pacing, animation style, transitions, and audio direction. Explain which direction is strongest and why. Do not write code yet."

**Prompt 2 — Storyboard:** "Turn the chosen direction into a storyboard with timestamps and a clear narrative arc. For every scene, specify the first frame, final frame, focal point, exact text, animation, easing, transition, and audio cues. Include the purpose of each scene and how it connects to the next. Flag any scene that is visually repetitive."

**Prompt 3 — Build one scene:** "Implement only scene 1 in Remotion using the approved storyboard. Focus on composition, typography, timing and motion quality. Use reusable components and frame-based animation. Start the preview, render representative frames and inspect the actual output if your tools support it. Fix visible issues before proceeding. Do not build the remaining scenes yet."

**Prompt 4 — Visual quality review:** "Act as a strict motion-design director reviewing the rendered output. Evaluate typography, hierarchy, spacing, timing, easing, transitions, visual consistency, pacing, and sound synchronization. Identify the five most consequential defects. Give specific corrections, then implement the highest-impact fixes and render again. Do not add new effects unless they solve a real problem."

Why this works: you separate creative decisions from implementation, and implementation from quality assurance. This is also consistent with the iterative preview-and-revise workflow shown in Remotion's documentation and practitioner examples.

## 7. How to use visual references properly

If you see a video on Instagram, YouTube, Dribbble or Pinterest that you want to recreate, don't just tell Claude to "make something like this." Give Claude the reference and ask it to analyse the design.

```
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

A reference gives Claude more information than abstract adjectives alone. However, you should still specify what you want to preserve and what you want to change. A reference may be difficult to reproduce exactly if it depends on complex 3D rendering, custom footage, or advanced compositing.

## 8. Make a reusable motion-design system

Once you create a good video, don't start from scratch every time. Ask Claude to create a small library of reusable components, such as:

- Animated title and subtitle reveals.
- Lower thirds and captions.
- Staggered word and character animations.
- Animated statistics and charts.
- Shape masks and transitions.
- Background systems, grids and textures.
- Audio cue helpers.
- A consistent typography and color system.

Then maintain a `DESIGN_SYSTEM.md` file containing your palette, fonts, spacing rules, motion principles, transitions, and examples of approved components.

```
Review this project and create a reusable motion-design component library.

First identify the visual patterns that occur repeatedly. Design reusable components for titles, subtitles, captions, text reveals, statistics, diagrams, backgrounds, and scene transitions.

Create a consistent design system with typography, color tokens, spacing, easing conventions, timing defaults, and safe margins.

Each component should expose sensible parameters for content, duration, delay, color, size, and movement where appropriate.

Create a short example composition demonstrating the components. Document how to reuse them and when each component is appropriate.

Avoid building a large collection of effects without a consistent design language. Prioritize a small set of high-quality, composable components.
```

This is particularly valuable if you intend to create many videos for a product, YouTube channel, startup or social media brand. Community examples also describe using component libraries and style guides to improve consistency across longer projects.

## 9. What should you learn to get the most out of Claude?

You don't need to master every animation tool. Learn these in this order.

- **Level 1 — Visual design fundamentals.** Typography, contrast, composition, alignment, spacing, color theory and negative space. These determine whether a scene looks designed or improvised. Goal: look at a reference and explain why it works.
- **Level 2 — Motion design.** Easing, anticipation, follow-through, overshoot, stagger, timing, staging, continuity and the classic principles of animation. Goal: describe precisely how an element should move, not merely where it should end up.
- **Level 3 — Storyboarding and editing.** How to establish a visual hook, build information progressively, control pacing, use match cuts, and create a clear ending. Goal: make a 15-second video feel like a coherent piece rather than a collection of unrelated effects.
- **Level 4 — Remotion and React basics.** Components, props, frame-based animation, interpolations, sequences, transitions, asset handling and rendering. You don't need to become a full-time frontend developer. Goal: understand enough of the generated code to request targeted improvements and debug failures.
- **Level 5 — Sound design and finishing.** Layer ambience, music, impacts, whooshes and short accents. Understand audio levels, synchronization, licensing and export settings. Goal: make the sound feel integrated with the animation, not added as an afterthought.

## 10. A practical 7-day learning plan

| Day | Project | Main skill |
|---|---|---|
| 1 | 5-second animated title | Typography and composition |
| 2 | Kinetic typography sequence | Timing, easing and stagger |
| 3 | Animated product UI demo | Layout and scene choreography |
| 4 | Data visualization | Visual hierarchy and information design |
| 5 | 15-second product teaser | Storyboarding and transitions |
| 6 | Sound-designed version | Audio synchronization and pacing |
| 7 | Recreate a reference style | Art direction, iteration and QA |

For every project, save the prompt, storyboard, rendered version and notes on what you changed. Your goal is to build a repeatable production process, not to find one magic prompt.

## 11. What about model choice and your Claude subscription?

Start with the strongest coding-capable model available in your account for the first complex project. Model availability and subscription usage limits can change, so don't assume that one model automatically produces better motion graphics.

For this workflow, these factors are usually more important than model choice alone:
1. Whether Claude has the relevant Remotion skills and documentation.
2. Whether you provide a coherent visual reference and storyboard.
3. Whether the project uses reusable components and consistent design rules.
4. Whether you actually preview, inspect and revise the rendered output.
5. Whether you know enough about motion design to judge the result.

A more capable model may write better code or make better creative decisions, but it cannot compensate fully for a vague brief or a missing review process.

## 12. The resources to bookmark

- **Remotion — official documentation** (https://www.remotion.dev/docs/): the core resource for project setup, animation, audio, transitions, rendering and AI-assisted video creation. Read the AI workflow guide (https://www.remotion.dev/docs/ai/) · Start your first video.
- **Remotion Agent Skills** (https://www.remotion.dev/docs/ai/skills): official guidance for teaching coding agents the framework's best practices.
- **Practical tutorial: Claude Code + Remotion**: a step-by-step example of using scene planning, prompts and iterative rendering.
- **Community motion-graphics skill**: an additional open-source skill with example compositions and a render-inspect-fix workflow. Treat this as third-party guidance and review its code and license before using it.

The official docs are the best source for current API behavior. Tutorials and community projects are useful for creative techniques and workflow ideas, but verify their instructions against the current framework version.

## Final recommendation

1. Set up Claude Code with the official Remotion skills.
2. Create one excellent 10–15-second video using a reference, storyboard and scene-by-scene implementation.
3. Turn the best components and visual rules into a reusable motion-design system.

The single most valuable habit is to judge the rendered video, not the code or Claude's description of it. A technically correct implementation can still have poor typography, awkward pacing or weak art direction. Previewing and fixing those issues is what turns a quick AI-generated draft into polished work.
