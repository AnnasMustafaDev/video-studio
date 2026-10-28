"""Voice-over: one Kokoro clip per line of script.json, trimmed and mastered
(48 kHz mono). Word times come from words.py. Supports voice blends such as
"am_michael:0.5+bm_george:0.5".

Usage: python tools/vo.py [--voice af_heart] [--speed 0.96] [--only h1,r2]
       python tools/vo.py --casting h1,h2,r2 --voices af_heart,bm_george,am_michael
         -> audio/casting/<voice>.wav, the chosen lines read by each voice
Needs: pip install kokoro==0.9.4 soundfile (Python 3.12), ffmpeg on PATH.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ("highpass=f=80,"
          "deesser=i=0.35,"
          "acompressor=threshold=0.125:ratio=3:attack=12:release=180:makeup=1.6,"
          "equalizer=f=3200:t=q:w=1.1:g=2,"
          "equalizer=f=220:t=q:w=1.0:g=-1.5,"
          "aecho=0.8:0.5:22|37:0.06|0.04,"
          "alimiter=limit=0.89")


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--voice", default=None)
    p.add_argument("--speed", type=float, default=None)
    p.add_argument("--out", default=str(ROOT / "audio" / "vo"))
    p.add_argument("--only", default="")
    p.add_argument("--casting", default="", help="comma-separated line ids to read with each voice")
    p.add_argument("--voices", default="af_heart,bm_george,am_michael,am_michael:0.5+bm_george:0.5")
    a = p.parse_args()

    os.environ.setdefault("HF_HUB_OFFLINE", "1")
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline

    script = json.loads((ROOT / "script.json").read_text(encoding="utf-8"))
    pipes = {}

    def voice_tensor(pipe, spec):
        if "+" not in spec and ":" not in spec:
            return spec
        mix = None
        for part in spec.split("+"):
            name, w = part.split(":")
            t = pipe.load_voice(name) * float(w)
            mix = t if mix is None else mix + t
        return mix

    def say(text, spec, speed, out: Path):
        lang = spec.split(":")[0].split("+")[0][0]
        if lang not in pipes:
            pipes[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
        pipe = pipes[lang]
        chunks = [aud for _, _, aud in pipe(text, voice=voice_tensor(pipe, spec), speed=speed)]
        wav = np.concatenate([c.numpy() if hasattr(c, "numpy") else c for c in chunks])
        out.parent.mkdir(parents=True, exist_ok=True)
        raw = out.with_suffix(".raw.wav")
        sf.write(raw, wav, 24000)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse," + MASTER,
                        "-ar", "48000", "-ac", "1", str(out)], check=True)
        raw.unlink()
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                                   capture_output=True, text=True).stdout)
        return round(dur, 3)

    v = script["voice"]
    if a.casting:
        ids = a.casting.split(",")
        lines = [l for l in script["lines"] if l["id"] in ids]
        text = " ".join(l["text"] for l in lines)
        res = {}
        for spec in a.voices.split(","):
            try:
                res[spec] = say(text, spec, a.speed or v["speed"], ROOT / "audio" / "casting" / f"{spec.replace(':', '').replace('+', '_')}.wav")
            except Exception as e:  # voice file missing offline etc.
                res[spec] = f"failed: {e}"
        print(json.dumps({"status": "success", "result": res}))
        return 0

    only = set(filter(None, a.only.split(",")))
    out = Path(a.out)
    dpath = out / "durations.json"
    durs = json.loads(dpath.read_text()) if dpath.exists() else {}
    for line in script["lines"]:
        if only and line["id"] not in only:
            continue
        durs[line["id"]] = say(line["text"], a.voice or v["voice"], a.speed or v["speed"], out / f"{line['id']}.wav")
        print(f"- {line['id']} {durs[line['id']]}s", file=sys.stderr)
    dpath.write_text(json.dumps(durs, indent=2))
    print(json.dumps({"status": "success", "result": durs, "metadata": {"total": round(sum(durs.values()), 2)}}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
