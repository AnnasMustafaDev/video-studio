# Motion

Every animation answers one question: what does it communicate? Hierarchy, story, feedback or a state change. If you cannot say it in a sentence, cut it.

## Easing and springs

- Closed-form spring for entrances: damping ratio ζ 0.8 to 0.9, ω about 9 (0.5 to 0.7 s). At most a tiny overshoot. No bouncy easing.
- GSAP names that match: `expo.out` for entrances (0.5 s), `power2.in` for exits (0.26 s), `power3.inOut` for rules and wipes.
- Enter moving, leave accelerating. Exits are faster than entrances.
- Stagger 40 to 80 ms between items, or put each item on its spoken word.

```js
function spring(z, w) { // normalised so it ends exactly at 1
  const wd = w * Math.sqrt(1 - z * z);
  const raw = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  const end = raw(1);
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : raw(t) / end);
}
const tw = (t, a, b, ease) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
```

## Kinetic type

- Word enter: rise 0.42 em out of an 8 px blur, opacity 0 → 1, 0.5 s `expo.out`, starting 60 ms before the spoken word.
- Caption exit (content swap): opacity 0, y −14 px, blur 6 px, 0.26 s `power2.in`; the next caption starts right after.
- A reference line under a number fades up 0.25 s after the last word.
- Hook lines stack (each phrase on its own line); the last word of the hook can carry the accent.
- Never put `will-change` on text the camera scales (blurry text).

## Camera (for screen content)

- **Keys with holds**: a list of `{t, scale, focusX, focusY, ease}`. Between two moves there is always a hold. The camera only moves when a spoken word motivates it; never idle drift.
- **Screen-recorder zoom**: zoom the content inside a fixed window frame (frame stays, content scales), focus point in recorded CSS pixels, clamp so no edge shows.
- **Interpolate zoom in log space** (`exp(lerp(log a, log b, u))`) so the speed feels constant.
- One named move per shot: push in to the composer, pull back to the conversation. Never zoom in and straight back out.
- Typical scales: 1.0 whole screen, 1.4 to 1.6 a panel or table, 1.8 to 2.1 a button or field.
- Keys must stay in time order; when hold times derive from word timings, clamp with `Math.max(previous)`.
- Update the camera at the start of each frame: overlays (spotlight, cursor, labels) are projected from it.

## Spotlight

- Dim everything but the region (box-shadow `0 0 0 3000px rgba(dark, 0.42)`), 3 px accent outline, radius 12, padding 8 px.
- Rects in recorded CSS px, mapped through the camera every frame.
- **Liquid move**: when the spotlight jumps from one row to the next, the edge in the direction of travel leads (0.30 s) and the trailing edge follows (0.42 s, starting 0.1 s later), so the highlight stretches and settles.
- Fade in 0.3 s; when a spot hands over to the next one directly, glide instead of blinking.

## Cursor

- SVG arrow with a soft drop shadow, constant screen size.
- Appears 1.15 s before the click, glides in 0.9 s with `inOut`, tilts up to 12° toward its travel direction and straightens on arrival.
- Press: scale −15 % for about 80 ms at the click; an accent ring expands from 0.3× to 1.3× and fades over 0.5 s.
- Leaves 0.3 to 0.55 s after the click. Keep it inside the frame at every zoom and off the key text of the final state.
- Every UI change after a click happens 80 to 150 ms after the press.

## Transitions with meaning

| Transition | Use it for | Recipe |
|---|---|---|
| Flood and contract | A change of world (problem → solution, product → end card) | A circle clip grows from the last element (a full stop, a document) past the corners in 0.35 to 0.5 s; the next scene is underneath |
| Shared element | Continuity: the thing named becomes the next scene | A file card scales into the full document; a chain lifts away while the window rises in its place |
| Rise and settle | Bringing in the main surface | translateY 160 px → 0 and scale 0.94 → 1 on a spring |
| Content swap with blur | Caption or label changes | exit blur 6 px in 0.26 s, enter from 8 px blur |
| Hard cut on the beat | Contrast, energy | Only on a downbeat, hidden in a motion peak; max three per film |

Banned: cross-dissolves between unrelated shots, wipes and star transitions, zooms that go in and straight out.

## Pacing

- Hold important frames: a number or the CTA needs 1.5 to 2 s of stillness.
- Alternate long and short beats so it breathes; cut on the beat grid of the music.
- Reserve showpieces (a big reveal, a flood) for two or three moments.

## Motion blur

Render 4 subframes per output frame centred on the frame time and average them:
`ffmpeg ... -vf "tmix=frames=4,select='not(mod(n+1\,4))',setpts=N/(60*TB)"` with the page seeked at `t + (j − 1.5)/(fps·4)`.

## Gotchas

- Never set opacity or filter on a `preserve-3d` element; fade a wrapper instead.
- Text inside a morphing container needs its own enter and exit timing or old and new text overlap.
- A seek-based renderer must not depend on state carried between frames. Compute everything from `t`.
