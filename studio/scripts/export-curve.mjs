// Dumps a motion curve (value over time) to JSON so it can be plotted instead of guessed at.
//
//   node scripts/export-curve.mjs buoyant                       -> out/curves/buoyant.json
//   node scripts/export-curve.mjs exitRamp --frames 12 --out out/curves/exit.json
//   node scripts/export-curve.mjs --list
//
// JSON shape (CurveFile in src/lib/curves.ts):
//   { "name": "buoyant", "fps": 30, "unit": "progress", "startFrame": 0, "values": [0, 0.07, ...] }
// Feed it to `node ../skills/motion-review/tools/inspect.mjs plot <file>`.
// Also prints the longest zero-velocity run strictly inside the move: more than 2 frames reads as a stall.
//
// Node 22.13+/24 loads the .ts file directly (type stripping); curves.ts has no imports on purpose.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
// Node warns that curves.ts has no "type" in package.json; that file is not ours to change.
process.emitWarning = () => {};
const { exportableCurves, longestStall, sampleCurve } = await import(
  "../src/lib/curves.ts"
);

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const root = resolve(import.meta.dirname, "..");
const fps = Number(flag("fps", 30));
const frames = Number(flag("frames", 36));
const table = exportableCurves(fps, frames);

if (args.includes("--list") || args.length === 0) {
  console.log(`Curves: ${Object.keys(table).join(", ")}`);
  process.exit(args.length === 0 ? 1 : 0);
}

const name = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!name || !(name in table)) {
  console.error(`Unknown curve "${name}". Curves: ${Object.keys(table).join(", ")}`);
  process.exit(1);
}

// Samples a few frames past the move (--count overrides). speedCurve is a 4 s table.
const count = Number(flag("count", name === "speedCurve" ? 126 : frames + 6));
const unit = name === "buoyant" || name === "cubicOut" ? "progress" : "px";
const file = sampleCurve(table[name], { name, fps, unit, count });

const out = resolve(root, flag("out", join("out", "curves", `${name}.json`)));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(file));
console.log(`${name}: ${count} frames at ${fps} fps -> ${out}`);
console.log(`first ${file.values[0].toFixed(3)}, last ${file.values.at(-1).toFixed(3)}, longest mid-move stall ${longestStall(name === "speedCurve" ? file.values : file.values.slice(0, frames + 1))} frames`);
