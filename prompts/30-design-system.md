# 30 · Design system and component library

| | |
|---|---|
| **Purpose** | Build or extend a small, consistent library of reusable motion components and the `DESIGN_SYSTEM.md` that governs them. |
| **Use when** | After the first good video; when starting a series (channel, product, brand); when scenes keep re-implementing the same title or caption. |
| **Stage** | System building, outside the per-video loop. Feeds every later video. |
| **Inputs you must fill in** | None in the original. Studio additions: `[brand or series name]`, optional `[palette]`, `[fonts]`. |
| **Expected output** | Components with parameters, central tokens, an example composition, `DESIGN_SYSTEM.md` with usage guidance. |
| **Next prompt** | `31-componentize-project.md` after each finished video; `00-master-workflow.md` for the next video. |

Source: notes §8, verbatim.

Components the notes list: animated title and subtitle reveals; lower thirds and captions; staggered word and character animations; animated statistics and charts; shape masks and transitions; background systems, grids and textures; audio cue helpers; a consistent typography and colour system. `DESIGN_SYSTEM.md` holds palette, fonts, spacing rules, motion principles, transitions and examples of approved components.

## Prompt

```text
Review this project and create a reusable motion-design component library.

First identify the visual patterns that occur repeatedly. Design reusable components for titles, subtitles, captions, text reveals, statistics, diagrams, backgrounds, and scene transitions.

Create a consistent design system with typography, color tokens, spacing, easing conventions, timing defaults, and safe margins.

Each component should expose sensible parameters for content, duration, delay, color, size, and movement where appropriate.

Create a short example composition demonstrating the components. Document how to reuse them and when each component is appropriate.

Avoid building a large collection of effects without a consistent design language. Prioritize a small set of high-quality, composable components.
```

## Studio additions

```text
Library lives in studio/src/lib/, tokens in studio/src/lib/tokens.ts, rules in studio/DESIGN_SYSTEM.md. Extend what exists; do not create a parallel system. Series or brand: [name]. Palette: [palette or "keep tokens"]. Fonts: [fonts or "keep tokens"].
DESIGN_SYSTEM.md sections: palette (with contrast notes), type scale per format (16:9, 9:16, 1:1), spacing and safe margins per format, easing and spring presets with names, timing defaults (enter, exit, stagger, hold), approved transitions and when to use each, banned list, and a table of components with props and one-line "use when".
Example composition id: LibraryShowcase (register in studio/src/Root.tsx). Verify with npm run stills -- LibraryShowcase [frames] and look at the images.
Components must be deterministic (useCurrentFrame relative to their Sequence) and take timing in frames.
```
