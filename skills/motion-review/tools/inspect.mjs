#!/usr/bin/env node
// Engine-agnostic visual QA for any rendered video or folder of stills (Remotion, HTML engine, anything).
// Needs ffmpeg + ffprobe on PATH. Prints one JSON object on stdout; exit 0 on success, 1 on error.
//
//   node inspect.mjs sheet  <video> [--every 0.5] [--from 0] [--to end] [--cols 4] [--rows 4] [--out dir]
//        -> <out>/contact_pN.png (labelled frames) + <out>/phone_pN.png (same pages at half size)
//   node inspect.mjs tile   <dir-with-pngs> [--cols 3] [--rows 4] [--out dir]
//        -> contact + phone pages from stills you already rendered (e.g. Remotion stills)
//   node inspect.mjs strip  <video> <a> <b> [--n 8] [--name cut1] [--out dir]
//        -> <out>/strip_<name>.png: n frames across a transition, in one row
//   node inspect.mjs poster <video> <t> [--out dir]
//        -> <out>/poster.png (full resolution frame from the ENCODED file)
//   node inspect.mjs probe  <video> [--expect 1920x1080@60] [--duration 15] [--loudness] [--out dir]
//        -> stream facts, pass/fail checks, first/last frame of the encoded file, optional LUFS / true peak
//   node inspect.mjs sync   <video|audio> <hits.json> [--tol 40] [--out dir]
//        -> per hit: offset of the nearest sound onset (ms) + <out>/sync_wave.png (waveform, red line per hit)
//        hits.json: [{"t": 2.5, "label": "logo lands"}], [[2.5, "logo lands"]], {"fps":30,"hits":[{"frame":75,...}]}
//        or the HTML engine's build/comp_timing.json ({"sfx":[{"name","at"}]})
//   node inspect.mjs forensics <video> [--qa qa.json] [--w 256] [--out dir]
//        -> measured defects on the ENCODED file: still holds / frozen time, one-frame pops and flashes, ghost (blended) frames
//           at cuts, judder (duplicate frames inside motion, irregular timestamps), banding, loop-seam match, hard-cut shot lengths.
//           Writes forensics.json, forensics.md, flagged_contact.png (one labelled frame per finding). qa.json declares intent:
//           {"loop":true,"holds":[{"from":3,"to":4.6,"reason":"..."}],"flashes":[{"t":5.1,"reason":"..."}],"cuts":[...],"ghosts":[...],"pops":[...],"ignore":["banding"]}
//   node inspect.mjs flow     <video> [--fps 30] [--cruise <frame-widths/s>] [--out dir]
//        -> global motion speed (frame-widths per second, incl. zoom) and zoom rate per frame, speed dips and zoom reversals, flow.png + flow.json
//   node inspect.mjs plot     <data.json|csv> --out plot.png [--fps 30] [--deriv] [--title t]
//        -> value-over-time plot (and with --deriv its velocity) for any exported motion curve; flags velocity stalls
//   node inspect.mjs compare  <video> <reference-image|sheet|video> [--cols 4 --rows 3] [--times 1,3,5] [--n 6] [--out dir]
//        -> compare.png: reference tiles over our frames at matched times, plus a palette/luma drift number per pair
//
// Default --out is "<video dir>/qa/<video name>/" (or "<dir>/qa/" for tile).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';

const [cmd, ...args] = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) flags[key] = true;
    else { flags[key] = next; i++; }
  } else pos.push(args[i]);
}

const done = (result, metadata = {}) => { console.log(JSON.stringify({ status: 'success', result, metadata }, null, 1)); process.exit(0); };
const fail = (error, details) => { console.log(JSON.stringify({ status: 'error', error, details })); process.exit(1); };

if (!cmd || cmd === '--help' || cmd === 'help') {
  console.log('usage: inspect.mjs sheet|tile|strip|poster|probe|sync|forensics|flow|plot|compare ... (see header of this file)');
  process.exit(cmd ? 0 : 1);
}

const run = (bin, argv) => {
  const r = spawnSync(bin, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) fail(`${bin} not runnable (is it on PATH?)`, r.error.message);
  return r;
};
const ff = (argv) => {
  const r = run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv]);
  if (r.status !== 0) fail('ffmpeg failed', r.stderr.split('\n').filter((l) => l && !l.startsWith('Fontconfig')).slice(-6).join('\n'));
  return r;
};

// A real font file keeps drawtext independent of fontconfig (missing on many Windows ffmpeg builds).
const FONT = [
  'C:/Windows/Fonts/consola.ttf', 'C:/Windows/Fonts/arial.ttf',
  '/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Menlo.ttc',
  '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', '/usr/share/fonts/TTF/DejaVuSansMono.ttf',
].find((f) => existsSync(f));
const esc = (s) => String(s).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/%/g, '\\%');
const label = (text, size) =>
  `drawtext=${FONT ? `fontfile='${esc(FONT)}':` : ''}text='${esc(text)}':x=8:y=8:fontsize=${size}:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=5`;

function probe(file) {
  const r = run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
  if (r.status !== 0) fail(`ffprobe could not read ${file}`, r.stderr.trim());
  const j = JSON.parse(r.stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  const a = j.streams.find((s) => s.codec_type === 'audio');
  if (!v) fail(`${file} has no video stream`);
  const [n, d] = (v.avg_frame_rate || v.r_frame_rate || '0/1').split('/').map(Number);
  return {
    file, width: v.width, height: v.height, fps: d ? Math.round((n / d) * 1000) / 1000 : 0,
    duration: Number(j.format.duration ?? v.duration ?? 0), frames: Number(v.nb_frames ?? 0) || null,
    vcodec: v.codec_name, profile: v.profile ?? null, pix_fmt: v.pix_fmt,
    audio: a ? { codec: a.codec_name, sample_rate: Number(a.sample_rate), channels: a.channels } : null,
    size_mb: Math.round((Number(j.format.size ?? 0) / 1048576) * 100) / 100,
    faststart_hint: 'check with: ffprobe -v trace <file> 2>&1 | findstr/grep "moov" (moov before mdat = faststart)',
  };
}

const defaultOut = (file, isDir = false) => (isDir ? join(resolve(file), 'qa') : join(dirname(resolve(file)), 'qa', basename(file, extname(file))));
const outDir = (file, isDir) => { const o = resolve(flags.out ?? defaultOut(file, isDir)); mkdirSync(o, { recursive: true }); return o; };
const frameAt = (file, t, dest, width, text) =>
  ff(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `scale=${width}:-2${text ? ',' + label(text, Math.max(12, Math.round(width / 26))) : ''}`, dest]);

// Tile labelled PNGs into pages: contact_pN.png at full tile width, phone_pN.png at half.
function pages(pngs, out, cols, rows, prefix = '') {
  const per = cols * rows;
  const made = { contact: [], phone: [] };
  for (let p = 0; p * per < pngs.length; p++) {
    const chunk = pngs.slice(p * per, (p + 1) * per);
    const list = join(out, `_list_${p}.txt`);
    writeFileSync(list, chunk.map((f) => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
    const r = Math.ceil(chunk.length / cols);
    const contact = join(out, `${prefix}contact_p${p + 1}.png`);
    const phone = join(out, `${prefix}phone_p${p + 1}.png`);
    ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', `tile=${cols}x${r}:padding=6:margin=6:color=0x202020`, '-frames:v', '1', contact]);
    ff(['-i', contact, '-vf', 'scale=iw/2:-2', phone]);
    rmSync(list);
    made.contact.push(contact);
    made.phone.push(phone);
  }
  return made;
}

if (cmd === 'probe') {
  const file = pos[0] ?? fail('probe needs <video>');
  const info = probe(file);
  const checks = [];
  if (flags.expect) {
    const m = /^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(flags.expect) ?? fail('--expect must look like 1920x1080@60');
    checks.push({ check: 'resolution', want: `${m[1]}x${m[2]}`, got: `${info.width}x${info.height}`, pass: info.width === +m[1] && info.height === +m[2] });
    if (m[3]) checks.push({ check: 'fps', want: +m[3], got: info.fps, pass: Math.abs(info.fps - +m[3]) < 0.01 });
  }
  if (flags.duration) checks.push({ check: 'duration', want: +flags.duration, got: info.duration, pass: Math.abs(info.duration - +flags.duration) <= 1 / (info.fps || 30) + 0.05 });
  checks.push({ check: 'pix_fmt yuv420p (plays everywhere)', got: info.pix_fmt, pass: info.pix_fmt === 'yuv420p' });
  checks.push({ check: 'audio stream present', got: info.audio?.codec ?? 'none', pass: !!info.audio, note: 'fail is fine only for a deliberately silent video' });
  const out = outDir(file);
  const first = join(out, 'encoded_first.png');
  const last = join(out, 'encoded_last.png');
  frameAt(file, 0, first, info.width);
  frameAt(file, Math.max(0, info.duration - 1 / (info.fps || 30) - 0.02), last, info.width);
  let loudness = null;
  if (flags.loudness && info.audio) {
    const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
    const tail = r.stderr.slice(r.stderr.lastIndexOf('Summary'));
    const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(tail)?.[1]);
    const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(tail)?.[1]);
    loudness = { integrated_lufs: I, true_peak_dbtp: TP };
    checks.push({ check: 'loudness -14 LUFS ±1 (web/social)', got: I, pass: Math.abs(I + 14) <= 1, note: '-16 is right for presentations' });
    checks.push({ check: 'true peak <= -1 dBTP', got: TP, pass: TP <= -1 });
  }
  done({ ...info, loudness, checks, all_pass: checks.every((c) => c.pass), first_frame: first, last_frame: last },
    { next: 'Open encoded_first.png and encoded_last.png: they prove the ENCODED file, not the stills, looks right.' });
}

if (cmd === 'sheet') {
  const file = pos[0] ?? fail('sheet needs <video>');
  const info = probe(file);
  const every = Number(flags.every ?? (info.duration > 40 ? 1 : 0.5));
  const from = Number(flags.from ?? 0);
  const to = Math.min(info.duration, Number(flags.to ?? info.duration));
  const cols = Number(flags.cols ?? (info.width >= info.height ? 4 : 6));
  const rows = Number(flags.rows ?? 4);
  const tileW = info.width >= info.height ? 480 : 300;
  const out = outDir(file);
  const tmp = join(out, '_frames');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const pngs = [];
  for (let t = from, i = 0; t < to - 1e-6; t = from + ++i * every) {
    const f = join(tmp, `f${String(i).padStart(4, '0')}.png`);
    frameAt(file, t.toFixed(3), f, tileW, `${t.toFixed(2)}s  f${Math.round(t * info.fps)}`);
    pngs.push(f);
  }
  const made = pages(pngs, out, cols, rows);
  rmSync(tmp, { recursive: true, force: true });
  done({ ...made, frames: pngs.length, every, from, to }, { look: 'Open EVERY contact page and EVERY phone page before scoring. Anything unreadable on a phone page fails readability.' });
}

if (cmd === 'tile') {
  const dir = pos[0] ?? fail('tile needs <dir>');
  const pngs0 = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f) && !/^(contact|phone|strip|poster|sync)/i.test(f) && !/sheet/i.test(f)).sort();
  if (!pngs0.length) fail(`no stills in ${dir}`);
  const out = outDir(dir, true);
  const tmp = join(out, '_frames');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const pngs = pngs0.map((f, i) => {
    const dest = join(tmp, `f${String(i).padStart(4, '0')}.png`);
    ff(['-i', join(dir, f), '-vf', `scale=480:-2,${label(basename(f, extname(f)), 18)}`, dest]);
    return dest;
  });
  const made = pages(pngs, out, Number(flags.cols ?? 3), Number(flags.rows ?? 4));
  rmSync(tmp, { recursive: true, force: true });
  done({ ...made, stills: pngs0.length });
}

if (cmd === 'strip') {
  const [file, a, b] = pos;
  if (!file || a === undefined || b === undefined) fail('strip needs <video> <a> <b>');
  const info = probe(file);
  const n = Number(flags.n ?? 8);
  const out = outDir(file);
  const tmp = join(out, '_strip');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const tileW = info.width >= info.height ? 360 : 220;
  const pngs = [];
  for (let i = 0; i < n; i++) {
    const t = Number(a) + ((Number(b) - Number(a)) * i) / Math.max(1, n - 1);
    const f = join(tmp, `s${i}.png`);
    frameAt(file, t.toFixed(3), f, tileW, `${t.toFixed(2)}s`);
    pngs.push(f);
  }
  const list = join(tmp, 'list.txt');
  writeFileSync(list, pngs.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
  const dest = join(out, `strip_${flags.name ?? `${a}-${b}`}.png`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', `tile=${n}x1:padding=4:color=0x202020`, '-frames:v', '1', dest]);
  rmSync(tmp, { recursive: true, force: true });
  done({ strip: dest, from: +a, to: +b, frames: n }, { look: 'A cut must open on the new image, never on a blank or a full-frame flash; a whip shows both shots on screen.' });
}

if (cmd === 'poster') {
  const [file, t] = pos;
  if (!file || t === undefined) fail('poster needs <video> <t>');
  const info = probe(file);
  const dest = join(outDir(file), flags.name ? `${flags.name}.png` : 'poster.png');
  frameAt(file, t, dest, info.width);
  done({ poster: dest, t: +t });
}

if (cmd === 'sync') {
  // hits.json: [{ "t": 2.5, "label": "logo lands" }, ...] or [[2.5, "logo lands"], ...] (seconds)
  const [file, hitsFile] = pos;
  if (!file || !hitsFile) fail('sync needs <video|audio> <hits.json>');
  const { readFileSync } = await import('node:fs');
  const raw = JSON.parse(readFileSync(hitsFile, 'utf8'));
  // Also reads the HTML engine's build/comp_timing.json ({ sfx: [{ name, at }] }) and Remotion hits exported as JSON.
  const list = Array.isArray(raw) ? raw : raw.hits ?? raw.sfx ?? [];
  const hits = list.map((h) => (Array.isArray(h) ? { t: +h[0], label: String(h[1] ?? '') } : { t: +(h.t ?? h.at ?? h.time ?? (h.frame !== undefined && raw.fps ? h.frame / raw.fps : NaN)), label: String(h.label ?? h.name ?? h.sfx ?? '') })).filter((h) => Number.isFinite(h.t));
  if (!hits.length) fail('no hits in file');
  const tol = Number(flags.tol ?? 40);
  const win = 0.15;
  const results = hits.map((h) => {
    const start = Math.max(0, h.t - win);
    const r = run('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(start), '-t', String(win * 2), '-i', file, '-vn',
      '-af', 'aresample=48000,asetnsamples=n=480:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level', '-f', 'null', '-']);
    const times = [...r.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1]);
    const peaks = [...r.stderr.matchAll(/Peak_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -200 : +m[1]));
    if (!peaks.length) return { ...h, offset_ms: null, pass: false, note: 'no audio in window' };
    let best = 0;
    for (let i = 1; i < peaks.length; i++) if (peaks[i] > peaks[best]) best = i;
    let onset = best; // walk back to where the hit starts (within 6 dB of its peak)
    while (onset > 0 && peaks[onset - 1] >= peaks[best] - 6) onset--;
    const offset = Math.round((start + (times[onset] ?? onset * 0.01) - h.t) * 1000);
    return { ...h, peak_db: peaks[best], offset_ms: offset, pass: Math.abs(offset) <= tol };
  });
  const info = probe(file).duration;
  const out = outDir(file);
  const W = Math.min(4000, Math.max(1200, Math.round(info * 100)));
  const marks = hits.map((h) => `drawbox=x=${Math.round((h.t / info) * W)}:y=0:w=2:h=240:color=red@0.9:t=fill`).join(',');
  const wave = join(out, 'sync_wave.png');
  ff(['-i', file, '-filter_complex', `[0:a]aformat=channel_layouts=mono,showwavespic=s=${W}x240:colors=0x9ad0ff${marks ? ',' + marks : ''}`, '-frames:v', '1', wave]);
  // beat-hit cap: full-frame / camera-layer impacts at most 3 per film, at least 16 beats apart (mark them "scope":"full" in hits.json; pass --bpm)
  const rawList = list.filter((h) => !Array.isArray(h));
  const full = hits.filter((h, i) => rawList[i] && (rawList[i].scope === 'full' || rawList[i].full === true)).map((h) => h.t).sort((a, b) => a - b);
  let fullCap = null;
  if (full.length) {
    const beat = flags.bpm ? 60 / Number(flags.bpm) : null;
    const gaps = full.slice(1).map((t, i) => t - full[i]);
    fullCap = { count: full.length, max_allowed: 3, count_ok: full.length <= 3, min_gap_s: gaps.length ? Math.round(Math.min(...gaps) * 100) / 100 : null, min_gap_beats: beat && gaps.length ? Math.round((Math.min(...gaps) / beat) * 10) / 10 : 'pass --bpm to count beats', gap_ok: beat && gaps.length ? Math.min(...gaps) / beat >= 16 : null };
  }
  done({ hits: results, wave, tolerance_ms: tol, all_pass: results.every((r) => r.pass), full_frame_hits: fullCap },
    { note: 'Onset of the loudest 10 ms event within ±150 ms of each hit (positive = sound late). Voice or music can be louder than a soft SFX: read failures against sync_wave.png (red lines = hits) before acting.' });
}

await import('./analysis.mjs').then((m) => m.main({ cmd, flags, pos, helpers: { run, ff, probe, outDir, frameAt, pages, label, esc, FONT, done, fail } }));
fail(`unknown command ${cmd}`);
