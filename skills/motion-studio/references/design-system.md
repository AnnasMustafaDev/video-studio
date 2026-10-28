# A reusable motion-design system

Once a film works, don't start from scratch. Keep a small set of high-quality, composable pieces and one written set of rules, instead of a large collection of effects.

## Where things live

- **Remotion work:** the shared system is `{{VIDEO_STUDIO}}\studio\DESIGN_SYSTEM.md`, tokens in `studio/src/lib/tokens.ts`, components in `studio/src/lib/`. Use and extend those (see `remotion-studio`).
- **HTML engine:** tokens at the top of `comp/style.css` (CSS custom properties), helpers in `comp/engine.js` (captions, camera, spotlight, cursor, springs, player). A helper that proves itself in a film is ported back into `template/comp/engine.js` of this skill (in the repo), with a learnings line.

## What the system defines

| Area | Decide once |
|---|---|
| Colour tokens | background (dark + light), ink, muted, surface, one accent (+ darker accent for text on light), optional signal colour with a meaning |
| Typography | one family + one mono; display / caption / body / meta sizes at 1080p; weights; tracking; line heights |
| Spacing | a 4 or 8 px scale, safe margins (72 px brand bug, 120 px important text at 16:9; platform zones at 9:16) |
| Shape | one radius scale (e.g. 16 surfaces, 12 highlights, pill), one shadow tinted to the background, one icon stroke |
| Easing | named presets: enter (spring ζ 0.85 ω 9 / `expo.out` 0.5 s), exit (`power2.in` 0.26 s), wipe (`power3.inOut`) |
| Timing defaults | stagger 60 ms, word lead 60 ms, holds (numbers and CTA ≥ 1.5 to 2 s), transition lengths |
| Components | title + subtitle reveal, caption band, lower third, staggered words, stat / number with reference line, simple chart, mask and flood transitions, background (grid, radial light, texture), end card, audio cue helper (hits) |

Each component exposes content, duration, delay, colour, size and movement as parameters, and has one line on when to use it.

## Building one (prompt shape)

Identify the patterns that repeat across the films, design a small library for them (titles, subtitles, captions, text reveals, stats, diagrams, backgrounds, transitions), set the tokens, make a short example composition that shows every component, and document reuse. Prefer a few excellent pieces over many effects without a shared language. The human-facing prompt is in `prompts/` (see `prompts/INDEX.md`, design system prompt).

## Frame ramp: a video-native spec

Web design specs make agents build slides (cards, pills, panels). Keep the brand atoms (colours, type family) and re-express scale for the frame: **sizes in percent of frame width (vw)**, so the same ramp holds at 1920 wide and at 1080 wide.

| Role | Size (of frame width) | At 1920 |
|---|---|---|
| Wordmark | about 30 vw | about 576 px |
| Display / hook line | about 14 vw | about 270 px |
| Claim | 6 to 9 vw | 115 to 173 px |
| Stat numeral | about 18 vw | about 345 px |
| Caption (existing) | about 3.8 to 4.2 vw | 72 to 80 px at 1080p tall, check width |
| **Text floor** | 1.4 vw | about 27 px; only chrome labels (mono meta) may go below |

- Safe area is also in vw; platform zones at 9:16 stay as in design.md (top 220 px, bottom 380 px).
- Named easings and durations come from the tokens, not from the scene.
- **One accent per frame:** the accent marks the one thing that matters in the frame (the active step, the number, the CTA). Two accent marks in a frame need a reason; accent area is about 5 percent of pixels.
- Motto: atoms are sacred, composition is free, numbers come from the script.

Why: a ramp that cannot collapse into a web layout, and a testable form of our "one accent" rule. Evidence: shown as the source of real launch compositions, reasoning from a handoff doc (F-A5); the exact numbers are that project's, so tune them against our tokens before treating them as law. The Remotion side lives in `studio/src/lib/tokens.ts` and `studio/DESIGN_SYSTEM.md` (owned by the studio code owner); this file is the rule.

## Clamp inside components

Minimum sizes are enforced by construction: a text component clamps to the floor instead of only documenting it. Check `studio/src/lib` first; the type scale may already do this.
