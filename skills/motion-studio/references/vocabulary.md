# Vocabulary → recipes in this engine

The director's vocabulary (definitions and prompt terms) is in `~/.claude/skills/motion-director/references/vocabulary.md`. This table turns each term into what you write in `comp/main.js`. Details in [motion.md](motion.md).

| Term | Recipe here |
|---|---|
| Word-by-word reveal / staggered text | One GSAP tween per word on the `master` timeline at `W(line, i) - 0.06`: rise 0.42 em out of 8 px blur, `expo.out` 0.5 s |
| Per-character animation | Split into spans only for a hero line; stagger 20 to 35 ms; never for captions |
| Masked reveal | Parent `overflow: hidden`, child `yPercent: 105 → 0`, 0.9 s; or `clip-path: inset()` driven by `tw()` |
| Tracking expansion | `letterSpacing` from -0.03 em to 0.02 em over 1.2 s, `power2.out`, on a short headline only |
| Ease-out / cubic-bezier | `tw(t, a, b, 'out')` or GSAP `power3.out`; exits `power2.in`, faster than entrances |
| Spring, subtle overshoot, settling | Closed-form `spring(ζ 0.8 to 0.9, ω ≈ 9)`; overshoot below 3 %; a value with several targets = sum of springs |
| No linear unless intentional | Linear only for progress, tickers, the music-driven clock |
| Single focal point | Spotlight dim (0.4) on the rest, accent outline on the region; the caption names it |
| Foreground / midground / background, parallax | Separate layers with different camera factors (bg 0.3, mid 0.6, fg 1.0) on a push; static radial light behind the stage |
| Match cut | Shared element: the object named becomes the next scene's surface (scale and position matched across the cut) |
| Shape morph | One container whose size, radius and colour interpolate; content swaps with blur; text has its own enter/exit |
| Directional wipe | Only when motivated by a moving element; `clip-path` driven by that element's position |
| Camera-driven transition | Camera key: push into an element until it fills the frame, cut to the next scene at that scale |
| Overlapping transition | Next scene starts entering 0.1 to 0.2 s before the previous one finishes leaving |
| Flood | Circle `clip-path` grows from the last thing looked at, radius ≥ distance to the farthest corner |
| Rim lighting, soft bloom | Sparingly on hero objects only, never on UI; a static radial light, never one that follows |
| Film grain | Seeded noise per frame index (never `Math.random`), opacity ≤ 0.04, applied after motion-blur averaging |
| Depth of field | Not on UI. Only on non-UI objects in a three.js scene ([three-d.md](three-d.md)) |
| Hold | A camera key with no change for ≥ 1.5 s on numbers and the CTA |

Deterministic rule for everything above: computed from `t` only. No CSS transitions, timers, `requestAnimationFrame` or `Math.random`.
