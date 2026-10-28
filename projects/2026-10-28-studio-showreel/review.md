# Studio showreel: review log

## Round 0 (plumbing only, 2026-10-28)

Scope was cut mid-build: the user now wants the full staged process (three directions, pick one), so only the scaffold, engine, player, audio pipeline and scene 1 exist. Scenes 2 to 6 show a plain slate (scene name, time range, "not built yet"). No creative review rounds yet.

What was checked, by looking:

- Preview stills at 0, 0.52, 0.75, 1.1, 1.6, 2.1, 2.4, 2.9, 5, 19.98 s (`film/shots/preview_sheet.png`). Frame 0 shows the finished first half of the brief with the accent caret; words type on the beats 0.5 / 1.0 / 1.5 / 2.0; the 4 % dolly-in from 1.0 s is visible by 2.4 s; caret blinks after typing; Inter Tight and JetBrains Mono load before the first paint (no fallback font in any still). Renderer reported no page errors or 4xx.
- Player in a browser pane: Space plays with sound (clock = `audio/mix.wav` currentTime), scene markers jump (Animate marker landed at frame 0661), M mutes, L loops, the 16:9 stage letterboxes in a narrow pane. Fixed: marker buttons inherited the accent button style; now plain ticks with labels.
- Audio: `node tools/sound.mjs` gives -14.2 LUFS integrated, -1.3 dBFS true peak. SFX peaks measured in `audio/sfx.wav` against the hits table: whoosh, card, land, lock, swell, riser, low hit and shimmer land 6 to 14 ms after their cue (pass is 40 ms). Key ticks are dense (45 ms apart), so a peak search window catches the neighbour; not a timing error.

Not checked yet (no scenes to check): transitions, strips across cuts, frame-difference pops, phone sheet, 3D shots.
