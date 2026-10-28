# Formats and delivery

| Format | Size | Use | Notes |
|---|---|---|---|
| 16:9 | 1920×1080, 60 fps | site, YouTube, decks, sales | master |
| 9:16 | 1080×1920, 30 fps | Reels, Shorts, TikTok | text out of top 220 px and bottom 380 px; bigger type; hook in the first second |
| 4:5 | 1080×1350, 30 fps | LinkedIn and Instagram feed | the strongest feed format |
| 1:1 | 1080×1080 | feeds | caption above, device below, tighter |

- Compose each format as its own stage (own layout and camera keys). Never centre-crop the master.
- Muted autoplay shows the opening seconds instead of the thumbnail: frame 0 must already carry the message (title card), and burned-in captions matter more than voice for feed formats.

## Subtitles

- Optional burned-in subtitles: bottom, 30 px, 66 % black box, 0.12 s fades, the line's text from `script.json` (`de` etc.), shown from line start to line end + 0.25 s.
- Always also deliver `.srt` files (`node tools/srt.mjs`), one per language.
- No em or en dashes as separators in subtitle text; use a comma or a colon.

## Files

- `out/<Name>_<VO-lang>_1080p60.mp4`, `out/<Name>_<VO-lang>_<SUB-lang>-subs_1080p60.mp4`, `out/<Name>_<lang>.srt`.
- H.264 high, CRF 15, yuv420p, AAC 256 kb/s, `+faststart`.
- Keep a poster frame PNG (the end card or the hook) for thumbnails: `node ~/.claude/skills/motion-review/tools/inspect.mjs poster <mp4> <t>` takes it from the encoded file.
- For social posts, write a short post text that adds what the video can't (context, a link), never the full script again.
