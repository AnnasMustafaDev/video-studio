// Regenerates the built-in sound cues in public/sfx/ with ffmpeg (must be on PATH).
// Usage: node scripts/make-sfx.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "public", "sfx");
mkdirSync(dir, { recursive: true });

const run = (args, out) => {
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      ...args,
      "-ar",
      "48000",
      "-ac",
      "1",
      join(dir, out),
    ],
    {
      stdio: "inherit",
    },
  );
  console.log(`wrote public/sfx/${out}`);
};

run(
  [
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=1800:duration=0.06",
    "-af",
    "afade=t=out:st=0:d=0.06,volume=0.6",
  ],
  "tick.wav",
);
run(
  [
    "-f",
    "lavfi",
    "-i",
    "anoisesrc=color=pink:duration=0.6:seed=7:amplitude=0.6",
    "-af",
    "highpass=f=400,lowpass=f=3500,afade=t=in:st=0:d=0.35:curve=qsin,afade=t=out:st=0.35:d=0.25,volume=0.5",
  ],
  "whoosh.wav",
);
run(
  [
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=110:duration=0.5",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=220:duration=0.5",
    "-filter_complex",
    "[0][1]amix=inputs=2,afade=t=out:st=0.02:d=0.45:curve=exp,volume=1.2",
  ],
  "thud.wav",
);
