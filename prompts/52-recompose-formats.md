# 52 · Recompose for 9:16 and 1:1

| | |
|---|---|
| **Purpose** | Make vertical (9:16) and square (1:1) versions composed for their own frame, not cropped from the 16:9 master. |
| **Use when** | The 16:9 master is approved and the video also goes to Reels, Shorts, TikTok, Instagram or LinkedIn feed. |
| **Stage** | Finishing, after the master is locked (and after `50`/`51`), before `53`. |
| **Inputs you must fill in** | `[CompId]` of the master, `[target formats]`, `[platforms]`, `[anything to cut or shorten for the short version]`. |
| **Expected output** | A layout plan per format, new compositions sharing scenes and timing with the master, platform-safe text, stills of every scene per format. |
| **Next prompt** | `13-quality-review.md` on each new format, then `53-final-render-delivery.md`. |

## Prompt

```text
Create [9:16 1080x1920] and [1:1 1080x1080] versions of [CompId]. Compose each for its own frame. Do not centre-crop or letterbox the 16:9 master.

1. Plan first, per format and per scene: where the focal element goes, how the type re-flows (line breaks change, sizes go up for phone viewing), what moves from side-by-side to stacked, what gets cut because it does not fit, and how camera moves and transitions change direction (a horizontal wipe may become vertical). Show me the plan and wait.
2. Platform safe areas: for 9:16 keep text out of the top ~220 px and bottom ~380 px (platform UI), and away from the right edge where buttons sit. For 1:1 and 4:5 keep a generous margin; captions above, visual below often works.
3. Hook: frame 0 and the first second must carry the message on their own; feeds autoplay muted. If the master opens slowly, propose a tighter opening for these formats.
4. Length: [same length | shorten to N s by cutting X]. Keep audio in sync; re-cut the music at bar lines if shortening.
5. Share, don't fork: scenes take the format as a prop (or read width/height from useVideoConfig) and use per-format layout tokens, so a later copy change updates every format.
6. Render stills of every scene's settled state and each transition midpoint in each format and inspect them for clipping, cramped type and elements under platform UI.
```

## Studio additions

```text
Register [CompId]-9x16 and [CompId]-1x1 in studio/src/Root.tsx next to the master, same fps. Per-format layout values belong in studio/src/lib/tokens.ts (or a layout map in the video folder if one-off). Stills: npm run stills -- [CompId]-9x16 [frames] and the same for 1x1. If you could not view them, say so.
```
