// Subtitles from build/timeline.json: node tools/srt.mjs [field=text|de|...] [out=out/name_<field>.srt]
// Each cue runs from the line start to its end + 0.25 s (or the next line). Dash separators become commas.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const R = new URL('../', import.meta.url);
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split('=')));
const field = args.field ?? 'text';
const tl = JSON.parse(readFileSync(new URL('build/timeline.json', R), 'utf8'));
const out = fileURLToPath(new URL(args.out ?? `out/subtitles_${field}.srt`, R));
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const cues = tl.lines
  .map((l, i) => ({ a: l.at, b: Math.min(l.end + 0.25, tl.lines[i + 1]?.at ?? Infinity), text: (l[field] ?? '').replace(/\s[–—]\s/g, ', ') }))
  .filter((c) => c.text);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, cues.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.text}\n`).join('\n'));
console.log(JSON.stringify({ status: 'success', result: out, metadata: { cues: cues.length } }));
