# 75 · Music-led beat map

| | |
|---|---|
| **Purpose** | Plan a music-driven piece beats-first, so sync is a property of the plan and the loop closes. |
| **Use when** | Showreels, loops and reels where the track sets the pace. Not for voice-led films (use `60`). |
| **Stage** | Storyboard variant, between `40`/`00` and `11`. |
| **Inputs you must fill in** | `[track file or "compose one"]`, `[BPM]`, `[total beats or bars]`, `[beats before the drop the song starts]`, `[loop: yes/no]`. |
| **Expected output** | A beat map table shown to you before any code, grid acceptance numbers, and a loop plan. |
| **Why this exists** | Four finished films were planned in beat ranges with the song's drop as an anchor, and a measured grid-acceptance step exists in a public repo. Evidence: shown in finished films for the beat map; sync quality not verified by us; the acceptance numbers are the author's claim. Findings F-B8, F-B9, F-A9. |
| **Next prompt** | `11-storyboard.md` (use the beat map as its time axis), then `12`. |

## Prompt

```text
Plan [slug] as a music-led piece. Show me only the beat map first; no code.

1. Grid: [BPM] BPM, [N] beats ([bars] bars). If the track is not ours, detect the beats, fit a straight line to the beat times by least squares, report the residual (accept up to about 15 ms), and check half-time and double-time against where the kicks land. Keep float seconds until the last step into frames.
2. Beat map table: beat or beat range, bar, event on screen, sound. The song starts [k] beats before its drop; the biggest visual event lands on the drop; a quiet breakdown carries any hold.
3. Rule "no dead time": the page is never empty between beats, but it is not constantly moving either. Only one element moves on most beats; full-frame or camera impacts at most 3 in the whole film, at least 16 beats apart.
4. Loop (if yes): the last frame equals the first, including accent, type and cursor position AND cursor velocity. The opening word or object returns on the beat when the loop restarts. Plan a loop-twice draft and a first-vs-last frame diff.
5. After render, measure cut error against the grid (target 3 frames or less) and report any cut that misses.
```

## Studio additions

```text
Save the table to projects/[yyyy-mm-dd]-[slug]/storyboard.md. Use studio/src/lib/Sfx.tsx and a cues.ts derived from the beat constants (see 50). Sources: beat-map structure after @twoclipping and @ultimaxbt on prompt-motion.com; grid method and impact cap after Vincentwei1021's video-shotcraft (music-beat-sync.md). Our wording.
```
