"""Word timestamps for every voice line (faster-whisper, word level) and a
pronunciation check against the script. Writes audio/vo/words.json:
{line_id: {"heard": str, "words": [{"w": str, "a": s, "b": s}]}}.
Needs a Python with faster-whisper. Model: script.json voice.whisper
(base.en for English, small for other languages). Never pass initial_prompt:
it made the model hallucinate repeated text.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
script = json.loads((ROOT / "script.json").read_text(encoding="utf-8"))
model = WhisperModel(script.get("voice", {}).get("whisper", "base.en"), device="cpu", compute_type="int8")
out = {}
for line in script["lines"]:
    wav = ROOT / "audio" / "vo" / f"{line['id']}.wav"
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    segs, _ = model.transcribe(np.frombuffer(pcm, dtype=np.float32), beam_size=5, word_timestamps=True)
    words = [{"w": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3)} for s in segs for w in (s.words or [])]
    out[line["id"]] = {"heard": " ".join(w["w"] for w in words), "words": words}
    print(f"{line['id']:3} {line['text']}\n    heard: {out[line['id']]['heard']}")
(ROOT / "audio" / "vo" / "words.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
