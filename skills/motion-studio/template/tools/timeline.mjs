// Builds build/timeline.json: scenes on bar lines, every voice line snapped to
// the beat grid with authored gaps, word times absolute.
// Inputs: script.json, audio/vo/durations.json, audio/vo/words.json.
// Without voice files it estimates durations (draft mode) so design can start early.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const R = new URL('../', import.meta.url);
const read = (p, fallback) => (existsSync(new URL(p, R)) ? JSON.parse(readFileSync(new URL(p, R), 'utf8')) : fallback);
const script = read('script.json');
const durs = read('audio/vo/durations.json', {});
const words = read('audio/vo/words.json', {});
const BEAT = 60 / script.bpm;
const BAR = BEAT * 4;
const snapUp = (t, grid) => Math.ceil(t / grid - 1e-6) * grid;
const DEF = { minBars: 2, lead: 1, gaps: [], tail: 1 };
const estimate = (text) => +(0.25 + text.split(/\s+/).length * 0.36).toFixed(3);

const order = [...new Set(script.lines.map((l) => l.scene))];
const scenes = [];
const lines = [];
const drafted = [];
let t = 0;
for (const name of order) {
  const p = { ...DEF, ...(script.scenes?.[name] ?? {}) };
  const start = t;
  let cur = start + p.lead * BEAT;
  script.lines.filter((l) => l.scene === name).forEach((l, i) => {
    const at = snapUp(cur, BEAT / 2);
    const dur = durs[l.id] ?? estimate(l.text);
    if (durs[l.id] == null) drafted.push(l.id);
    const w = (words[l.id]?.words ?? []).map((x) => ({ w: x.w, a: +(at + x.a).toFixed(3), b: +(at + x.b).toFixed(3) }));
    lines.push({ ...l, at: +at.toFixed(3), end: +(at + dur).toFixed(3), words: w });
    cur = at + dur + (p.gaps[i] ?? 1) * BEAT;
  });
  const lastEnd = lines[lines.length - 1].end;
  const end = Math.max(start + p.minBars * BAR, snapUp(lastEnd + p.tail * BEAT, BAR));
  scenes.push({ id: name, start: +start.toFixed(3), end: +end.toFixed(3), bars: Math.round((end - start) / BAR) });
  t = end;
}
const out = { bpm: script.bpm, beat: BEAT, bar: BAR, duration: +t.toFixed(3), scenes, lines };
mkdirSync(new URL('build/', R), { recursive: true });
writeFileSync(new URL('build/timeline.json', R), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ status: 'success', result: { duration: out.duration, scenes: scenes.map((s) => `${s.id} ${s.start}-${s.end} (${s.bars} bars)`) }, metadata: { estimated: drafted } }, null, 1));
