// Word-budget check for on-screen copy (F-A2). Warns when copy exceeds about 15 to 25 words per 30 s.
//
//   node scripts/copy-lint.mjs "Move once.|Land softly.|Cut." --seconds 11.4 --visible 60
//
// Fragments are separated with |. --visible = frames each fragment stays on screen (default 60).
// --muted applies the stricter budget for silent loops. Exit code 1 when there are warnings.
process.emitWarning = () => {};
const { lintCopy } = await import("../src/lib/copy.ts");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const text = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!text) {
  console.error('Usage: node scripts/copy-lint.mjs "frag one|frag two" --seconds 11 [--fps 30] [--visible 60] [--muted]');
  process.exit(2);
}
const fps = Number(flag("fps", 30));
const seconds = Number(flag("seconds", 30));
const result = lintCopy({
  fragments: text.split("|").map((f) => f.trim()).filter(Boolean),
  durationInFrames: Math.round(seconds * fps),
  fps,
  visibleFrames: Number(flag("visible", 60)),
  muted: args.includes("--muted"),
});
console.log(`${result.words} words, budget ${result.allowedWords}, copy on ${Math.round(result.coverage * 100)} % of frames`);
result.warnings.forEach((w) => console.log(`WARN ${w}`));
process.exit(result.warnings.length ? 1 : 0);
