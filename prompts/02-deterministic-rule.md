# 02 · Deterministic, frame-based rule

| | |
|---|---|
| **Purpose** | Enforce the technical constraint that every frame renders identically every time. |
| **Use when** | Once per session before any implementation; again whenever you see flicker, frames that differ between preview and render, or code using CSS transitions, timers or `Math.random`. |
| **Stage** | Setup / guardrail. Pairs with phase 3 of the master workflow. |
| **Inputs you must fill in** | None. |
| **Expected output** | Acknowledgement, and on existing code an audit listing every violation with file and line, then fixes. |
| **Next prompt** | `00-master-workflow.md` (new video) or back to whichever build prompt you were on. |

Source: notes §4, verbatim. "That is a technical constraint, not just a stylistic preference."

## Prompt

```text
Use deterministic, frame-based animation throughout Remotion.

Use useCurrentFrame(), interpolate(), spring(), and
useVideoConfig() where appropriate.

Do not rely on CSS transitions, requestAnimationFrame,
wall-clock timers, or random values that can vary between renders.

Ensure every animation produces the same output when the
same frame is rendered repeatedly.
```

## Studio additions

```text
For randomness use Remotion's random("[seed]") with a fixed string seed per element. Clamp interpolate with extrapolateLeft/Right: "clamp" unless overshoot is intended. Fonts must be loaded before render (@remotion/google-fonts or delayRender/continueRender for local fonts) so frame 0 never shows a fallback font. Audit studio/src/videos/[slug]/ and studio/src/lib/ for setTimeout, setInterval, requestAnimationFrame, Date.now, Math.random, CSS transition/animation properties and useEffect-driven state that changes over time; list each with file:line and fix it. Prove it: render the same frame twice with npm run stills -- [CompId] [frame] and confirm the images match.
```
