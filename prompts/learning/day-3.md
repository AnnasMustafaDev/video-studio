# Day 3 · Animated product UI demo

| | |
|---|---|
| **Purpose** | Practise layout and scene choreography: guiding the eye through a real interface. |
| **Use when** | Day 3 of the 7-day plan. Main skill: layout and scene choreography. |
| **Stage** | Learning. A short run of `61-product-ui-demo.md`. |
| **Inputs you must fill in** | `[app, ideally one of your own]`, `[2 to 4 screenshots paths]`, `[the one action to show]`. |
| **Expected output** | Shot list, a 10 to 15 s demo with camera keys, focus and cursor, stills at each zoom, files in `learning/day-3/`. |
| **Next prompt** | `13-quality-review.md`, `70-post-mortem.md` (short), then `day-4.md`. |

## Prompt

```text
Learning day 3: an animated product UI demo, 10 to 15 seconds, 16:9, 30 fps. The goal is layout and scene choreography.

App: [app]. Screenshots: [paths]. The one action to show: [action].

1. Shot list (3 to 5 shots): for each, the screenshot, the focal region in screenshot pixels, the camera move (one named move, then a hold), what is dimmed, the cursor action, a caption of at most 5 words, and the transition to the next shot. Explain how each shot hands the viewer's eye to the next.
2. Build it with the real screenshots flat in a plain frame with one soft shadow. Camera as keyframes with holds; the cursor glides with ease-in-out, presses, and the UI changes 3 to 4 frames after the press. Never zoom in and straight back out.
3. Render stills at every hold and at the midpoint of every camera move. Check that focus outlines and cursor sit exactly on the UI they name at every zoom, and no screenshot edge shows.
4. Teach me: what choreography means here (order, overlap, where the eye goes) and one thing you would change with more time.
```

## Studio additions

```text
Composition Day3Demo in studio/src/videos/day-3/, screenshots in studio/public/day-3/. Stills: npm run stills -- Day3Demo [frames]. Save brief, prompt, shot list and notes to learning/day-3/. If you could not view the stills, say so.
```
