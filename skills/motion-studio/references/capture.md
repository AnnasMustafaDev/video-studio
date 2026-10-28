# Capturing a real app

## Browser for filming

- Use a dedicated browser profile (e.g. Edge or Chrome with `--user-data-dir=<project>/.browser-profile --remote-debugging-port=9222`) and attach with playwright-core `chromium.connectOverCDP('http://127.0.0.1:9222')`.
- The user signs in themselves in that window. Never type passwords, never copy cookies or tokens from their everyday profile.
- Headless browsers often lose single-sign-on sessions; film in a visible window with anti-occlusion flags (`--disable-backgrounding-occluded-windows --disable-renderer-backgrounding`).
- Fix the viewport (e.g. 1600×900 CSS at device scale 1.5 → 2400×1350 pixels) so zooms stay sharp.

## Use demo data

- Create demo records that are clearly fictional and visible only to you (private scope) on shared systems.
- Prefer a real end-to-end run (real numbers the product computed) over mocked screens.

## Recording

- Capture frames with CDP `Page.startScreencast` (JPEG, quality 90) or timed screenshots, saving `frames/NNNNN.jpg` and `frames.json` `[{file, t}]` in source seconds.
- Drive the UI with scripts so takes are repeatable: type into editors via their API (e.g. Monaco `executeEdits`, not `setValue`, so app state updates), click real buttons, wait for real network results.
- Record markers (`markers.json`) for important moments: click times, typing start and end, result visible.
- Take still PNGs of every clean state you might need (lists, dialogs, results, scrolled positions).

## Pieces

Crop UI pieces from the stills (cards, dialogs, bubbles, tables) as PNGs with rounded-corner alpha (Pillow `rounded_rectangle` mask). Store their CSS boxes in `pieces.json`. Use them as overlays that appear on the beat (a sent bubble, a lifted card), never as 3D slabs.

## Mapping coordinates

- Keep every coordinate in recorded CSS pixels (the 1600×900 space). The engine maps them through the camera (scale, translate) to stage pixels, so spotlights, cursor targets and pieces stay aligned at any zoom.
- Verify a box once by drawing it on the still (contact sheet) before animating to it.

## Time remapping

The voice sets the pace, not the recording. Split the take into segments and map each to its voice window (`[outStart, outEnd, srcStart, srcEnd]`): compress typing, hold on the result, and land the send click exactly on its word.
