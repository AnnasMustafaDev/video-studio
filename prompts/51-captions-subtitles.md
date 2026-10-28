# 51 · Captions and subtitles

| | |
|---|---|
| **Purpose** | Add readable burned-in captions and/or deliver `.srt` subtitle files, timed to the voice. |
| **Use when** | The video has voice-over or speech, or will autoplay muted in a feed (most social formats). |
| **Stage** | Finishing, after `50-sound-design.md` (voice timing must be final), before `52` and `53`. |
| **Inputs you must fill in** | `[CompId]`, `[VO or speech file]`, `[script text if available]`, `[languages]`, `[style: word-by-word highlight | line captions | subtitles only (.srt)]`, `[format(s)]`. |
| **Expected output** | Word-level timings, a caption track in the composition (if burned in), `.srt` per language, stills proving readability at the busiest frames. |
| **Next prompt** | `52-recompose-formats.md` or `53-final-render-delivery.md`. |

## Prompt

```text
Add captions to [CompId].

Source audio: [VO file]. Script: [script text or "transcribe"]. Languages: [languages]. Style: [word-by-word highlight | line captions | .srt only]. Formats: [16:9 | 9:16 | 1:1].

1. Timing: get word-level timestamps from the audio (transcription), then correct the words against the script so the spelling is exact. Report any place where the speech differs from the script.
2. Segmenting: break into caption pages of at most [2] lines and about [32] characters per line for 16:9 ([20 to 24] for 9:16). Break at natural phrase boundaries, never between an article and its noun or a number and its unit. Each page on screen at least 1 s; extend the last word by 0.2 to 0.3 s.
3. Style (burned in): one type family from the design system, high contrast (a soft dark box or strong shadow when the background is busy), positioned inside the safe area and never over the focal element. For word-by-word highlight, the active word changes colour or weight only; no bouncing words unless the brief asks for it. No em or en dashes as separators; use a comma or colon.
4. Check collisions: list the frames where captions overlap on-screen titles, lower thirds or UI and move or hide the caption for that beat.
5. Deliver .srt for every language, even if captions are burned in.
6. Render stills at the busiest frames and the longest caption page, in each format, and inspect them.
```

## Studio additions

```text
Use the Remotion captions skill in studio/.claude/skills/ and @remotion/captions (Caption type, createTikTokStyleCaptions for word-highlight pages). Store captions as JSON in studio/public/captions/[slug].[lang].json and the .srt files in projects/[yyyy-mm-dd]-[slug]/out/. If a local Whisper (faster-whisper) or @remotion/install-whisper-cpp is available use it; otherwise tell me and ask for the transcript.
Stills: npm run stills -- [CompId] [frames]. If you could not view them, say so.
```
