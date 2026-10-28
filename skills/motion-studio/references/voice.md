# Voice-over

## Engine: Kokoro-82M, local and free

- Model `hexgrad/Kokoro-82M` from the Hugging Face cache, `pip install kokoro==0.9.4 soundfile` (Python 3.12 venv). Run with `HF_HUB_OFFLINE=1` once voices are cached.
- English voices that sound natural: `af_heart` (warm, default), `am_michael`, `am_fenrir`, `am_puck`, `am_eric`, `am_onyx`, British `bm_george`, `bm_fable`, `bm_lewis`. Voices missing from the cache fail offline; download first.
- Blends: `"am_michael:0.5+bm_george:0.5"` averages voice tensors.
- Speed 0.94 to 0.98 for product films; slower reads more premium than faster.
- Cloud TTS voices were judged "too robotic" next to Kokoro for this kind of film.

## Casting

Generate the hook and the proof lines with 3 or 4 voices (`python tools/vo.py --casting h1,h2,r2 --voices af_heart,bm_george,am_michael`) and let the user choose by ear. Never pick silently.

## Line by line

- One clip per script line. Pauses are authored in the timeline, so each line is placed on the beat grid with intent.
- Trim silence at both ends (`silenceremove` forward and reversed), then master:

```
highpass=f=80, deesser=i=0.35,
acompressor=threshold=0.125:ratio=3:attack=12:release=180:makeup=1.6,
equalizer=f=3200:t=q:w=1.1:g=2, equalizer=f=220:t=q:w=1.0:g=-1.5,
aecho=0.8:0.5:22|37:0.06|0.04, alimiter=limit=0.89      → 48 kHz mono
```

- Regenerate single lines with `--only id1,id2`; durations merge into `audio/vo/durations.json`.

## Word times

- `python tools/words.py` runs faster-whisper (`base.en` for English, `small` for other languages) with `word_timestamps=True` and writes `audio/vo/words.json` `{id: {heard, words:[{w,a,b}]}}`.
- Decode the WAV with ffmpeg to float32 PCM and pass the array; this avoids PyAV version issues.
- **Do not pass `initial_prompt`**: it caused hallucinated, repeated transcripts.
- Compare `heard` with the script: a mismatch means the pronunciation is off or the word is ambiguous. Rewrite the line ("Fast." → "And fast.") rather than trust a wrong anchor.

## Delivery

- Accent and register: match the audience (neutral international English for B2B; formal second person in German subtitles).
- Numbers are spoken in full ("one hundred ninety-eight percent") and shown as digits.
- Product names: test pronunciation early; spell phonetically in the TTS text if needed while the caption keeps the real spelling.

## Windows gotchas

- An Application Control policy can block msgpack's native DLL on first import; a retry worked. Fallback: `MSGPACK_PUREPYTHON=1`.
- Run Python tools with `-I` when reading untrusted downloaded files.

## Onset-anchored word times (segment-wise Whisper)

A single Whisper pass over a long read can place words late (the source claims up to half a second). When a line has internal pauses, or the sync check shows drift:

1. Split the clip at pauses of **100 ms or more** (silence detection).
2. Run Whisper on each segment separately.
3. Anchor each segment's first word to the **measured onset** of that segment (first frame above the noise floor), then keep Whisper's relative times inside it.

One clip per line already acts as segmentation; the onset anchor is the part to add. Check the result by comparing the visual change against the waveform (`inspect.mjs sync`).
Why: measurable improvement over a single pass. Evidence: precise in a finished film's prompt; the half-second figure is the author's claim and untested here (F-B11).

Other voice hygiene (optional, claimed): regenerate a bad line several times and splice the best (`--only`); shorten pauses over 0.28 s to 0.2 s; pull phrase levels toward the median with gain changes only inside pauses.

## Freeze the words before building

Hard-coded frame numbers break when words change. Lock `script.json` (the words) and re-run `words.py` before cutting any scene to word times; if a word changes later, re-derive times, never nudge frames by hand.
Why: a word change shifts every number after it. Evidence: failure-derived (F-A14).
