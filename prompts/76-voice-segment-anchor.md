# 76 · Voice segment anchor (experimental, A/B before trusting)

| | |
|---|---|
| **Purpose** | Get word times that do not drift late, and decide by eye whether visuals should lead the voice by a few frames. |
| **Use when** | A narrated film (`60`) where captions or cuts feel late, or Whisper misheard short lines. Run the A/B once, then record the result. |
| **Stage** | Voice and sync, inside the motion-studio engine pipeline. |
| **Inputs you must fill in** | `[voice file]`, `[script]`, `[fps]`. |
| **Expected output** | Word times anchored to measured onsets, a hits table with a lead column, two draft stills sheets (lead 0 and lead 4 frames), and a recorded decision. |
| **Why this exists** | Segment-wise alignment is said to fix words placed up to half a second late; picture-leads-sound is an editor's convention. Evidence: only claimed. The alignment is described precisely in a finished film's prompt (not tested by us); the lead number comes from one comment and is untested. Findings F-B11, F-C3. **To be A/B tested.** |
| **Next prompt** | `60-voiceover-film.md`, then `50` and `51`. |

## Prompt

```text
Improve the timing of [voice file] for [slug].

Part 1, alignment. Split the voice read at pauses of 100 ms or more. Transcribe each segment separately (local faster-whisper, no cloud), then anchor each segment's first word to the measured onset of that segment instead of trusting one long pass. Report any segment whose first word moved by more than 80 ms versus a single pass. Shorten pauses over 0.28 s to 0.2 s only if the script wants it faster. Freeze the words before frame numbers are hard-coded.
Part 2, lead test (A/B). Produce a hits table with columns: word, onset (s), visual start (frames). Build two drafts of the same two scenes: visual start = onset, and visual start = onset minus 4 frames. For a slow reveal try a bigger lead. Render phone-size sheets of both. Do not claim a winner without looking; if you cannot view images, say so.
Part 3, mix check. Measure the voice against the music per phrase between 300 Hz and 4 kHz; the voice should sit clearly above (the source's figure is about 9 dB). Report phrases that fail.
Record the winning lead in frames and the alignment finding in projects/[yyyy-mm-dd]-[slug]/notes.md, and propose a one-line learning for skills/motion-studio/references/learnings.md. Do not apply it to the skill without my approval.
```

## Studio additions

```text
Engine details: skills/motion-studio/references/voice.md and audio.md. Local Kokoro stays the voice; do not add cloud TTS. Sources: segment alignment and ratio check after @rossaxbt on prompt-motion.com; picture-leads-voice idea after a comment by u/Possible-Tone-7627 (r/ClaudeAI). Our wording; treat both numbers as hypotheses.
```
