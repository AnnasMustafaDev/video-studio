// Renders chosen frames of a composition to PNG and builds a contact sheet.
//
//   npm run stills -- <CompId> <frames>
//   npm run stills -- LibraryShowcase 0,45,99,170,449
//
// Output: out/stills/<CompId>/f<frame>.png and out/stills/<CompId>/contact-sheet.png
// The project is bundled once, then every frame is rendered from that bundle.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const [compId, framesArg] = process.argv.slice(2);
if (!compId || !framesArg) {
  console.error("Usage: npm run stills -- <CompId> <frame,frame,...>");
  process.exit(1);
}

const frames = framesArg
  .split(",")
  .map((f) => f.trim())
  .filter(Boolean)
  .map(Number);
if (frames.some((f) => !Number.isInteger(f) || f < 0)) {
  console.error(`Frames must be non-negative integers, got "${framesArg}"`);
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "out", "stills", compId);
const bundleDir = join(root, "out", ".stills-bundle");
mkdirSync(outDir, { recursive: true });

// Run the local Remotion CLI with the current Node binary: no shell, so paths with spaces are safe.
const cli = join(root, "node_modules", "@remotion", "cli", "remotion-cli.js");
const remotion = (args) =>
  execFileSync(process.execPath, [cli, ...args], {
    cwd: root,
    stdio: "inherit",
  });

console.log(`Bundling once into ${bundleDir}`);
rmSync(bundleDir, { recursive: true, force: true });
remotion(["bundle", "src/index.ts", `--out-dir=${bundleDir}`]);

const files = [];
for (const frame of frames) {
  const file = join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  console.log(`Frame ${frame} -> ${file}`);
  remotion([
    "still",
    bundleDir,
    compId,
    file,
    `--frame=${frame}`,
    "--image-format=png",
    "--log=warn",
  ]);
  files.push(file);
}

// Contact sheet: copy to a numbered sequence, then let ffmpeg tile it.
const seqDir = join(outDir, ".seq");
rmSync(seqDir, { recursive: true, force: true });
mkdirSync(seqDir);
files.forEach((f, i) =>
  copyFileSync(f, join(seqDir, `${String(i).padStart(3, "0")}.png`)),
);

const columns = Math.min(files.length, 4);
const rows = Math.ceil(files.length / columns);
const sheet = join(outDir, "contact-sheet.png");
execFileSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    join(seqDir, "%03d.png"),
    "-vf",
    `scale=640:-1,tile=${columns}x${rows}:padding=8:margin=8:color=0x333333`,
    "-frames:v",
    "1",
    sheet,
  ],
  { stdio: "inherit" },
);
rmSync(seqDir, { recursive: true, force: true });

if (existsSync(sheet)) {
  console.log(
    `\nContact sheet (left to right, top to bottom = frames ${frames.join(", ")}):\n${sheet}`,
  );
}
