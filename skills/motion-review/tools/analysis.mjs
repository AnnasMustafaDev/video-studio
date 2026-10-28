// Measurement subcommands for inspect.mjs: forensics, flow, plot, compare. ffmpeg + Node only.
// Loaded by inspect.mjs; do not run directly.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- shared helpers
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r2 = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

/** Decode a video to raw gray frames: one Uint8Array per frame. */
function decodeGray(H, file, w, h, { fps, extraVf = '' } = {}) {
  const vf = `${fps ? `fps=${fps},` : ''}scale=${w}:${h}:flags=area,format=gray${extraVf}`;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-an', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
    { maxBuffer: 1.9e9 });
  if (r.error) H.fail('ffmpeg not runnable', r.error.message);
  if (r.status !== 0) H.fail('ffmpeg decode failed', String(r.stderr).slice(-400));
  const buf = r.stdout, size = w * h, n = Math.floor(buf.length / size), frames = [];
  for (let i = 0; i < n; i++) frames.push(new Uint8Array(buf.buffer, buf.byteOffset + i * size, size));
  return frames;
}

// ---------------------------------------------------------------- tiny PNG writer + plot canvas
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function writePng(file, W, Hh, rgb) {
  const raw = Buffer.alloc((W * 3 + 1) * Hh);
  for (let y = 0; y < Hh; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(rgb.buffer, rgb.byteOffset + y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(Hh, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

/**
 * Stacked-panel line plot. panels: [{ title, unit, series:[{name,color,y:[]}], hlines:[{y,label,color}], bands:[{x0,x1,color}] }]
 * x is seconds (x[i]). Raster by Node, text by ffmpeg drawtext.
 */
function plotPanels(H, dest, { x, panels, xmax, marks = [], title }) {
  const W = 1280, PH = 300, TOP = 36, L = 70, R = 20, Hh = TOP + panels.length * PH + 24;
  const img = new Uint8Array(W * Hh * 3);
  const px = (X, Y, c, a = 1) => { X |= 0; Y |= 0; if (X < 0 || Y < 0 || X >= W || Y >= Hh) return; const o = (Y * W + X) * 3; for (let k = 0; k < 3; k++) img[o + k] = img[o + k] * (1 - a) + c[k] * a; };
  const rect = (x0, y0, x1, y1, c, a = 1) => { for (let Y = Math.max(0, y0 | 0); Y <= Math.min(Hh - 1, y1 | 0); Y++) for (let X = Math.max(0, x0 | 0); X <= Math.min(W - 1, x1 | 0); X++) px(X, Y, c, a); };
  const line = (x0, y0, x1, y1, c, th = 1, a = 1) => { const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) || 1; for (let i = 0; i <= n; i++) { const X = x0 + ((x1 - x0) * i) / n, Y = y0 + ((y1 - y0) * i) / n; for (let a1 = 0; a1 < th; a1++) for (let b = 0; b < th; b++) px(X + a1 - (th >> 1), Y + b - (th >> 1), c, a); } };
  const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  rect(0, 0, W, Hh, hex(0x14161a));
  const texts = [];
  if (title) texts.push({ x: L, y: 8, s: title, size: 18, color: 'white' });
  const gx = (t) => L + (t / xmax) * (W - L - R);
  panels.forEach((p, pi) => {
    const y0 = TOP + pi * PH + 10, y1 = TOP + (pi + 1) * PH - 30;
    const vals = p.series.flatMap((s) => s.y.filter(Number.isFinite)).concat((p.hlines ?? []).map((h) => h.y));
    let lo = Math.min(0, ...vals), hi = Math.max(1e-9, ...vals);
    if (p.symmetric) { const m = Math.max(Math.abs(lo), Math.abs(hi)); lo = -m; hi = m; }
    if (p.lo !== undefined) lo = p.lo;
    const pad = (hi - lo) * 0.08; hi += pad; if (lo < 0) lo -= pad;
    const gy = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
    rect(L, y0, W - R, y1, hex(0x1c1f25));
    for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; line(L, gy(v), W - R, gy(v), hex(0x2c3038)); texts.push({ x: 6, y: gy(v) - 7, s: (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)), size: 13, color: '0x9aa4b2' }); }
    const step = xmax > 60 ? 10 : xmax > 20 ? 5 : xmax > 8 ? 2 : 1;
    for (let t = 0; t <= xmax + 1e-6; t += step) { line(gx(t), y0, gx(t), y1, hex(0x2c3038)); texts.push({ x: gx(t) - 8, y: y1 + 4, s: `${t}s`, size: 13, color: '0x9aa4b2' }); }
    if (lo < 0) line(L, gy(0), W - R, gy(0), hex(0x56606e), 1);
    (p.bands ?? []).forEach((b) => rect(gx(b.x0), y0, Math.max(gx(b.x0) + 2, gx(b.x1)), y1, hex(b.color ?? 0xff4040), 0.28));
    marks.forEach((t) => line(gx(t), y0, gx(t), y1, hex(0x7a8696), 1, 0.7));
    (p.hlines ?? []).forEach((h) => { line(L, gy(h.y), W - R, gy(h.y), hex(h.color ?? 0xf0c040), 1, 0.9); texts.push({ x: W - R - 170, y: gy(h.y) - 16, s: h.label, size: 13, color: '0xf0c040' }); });
    p.series.forEach((s, si) => {
      let prev = null;
      s.y.forEach((v, i) => { if (!Number.isFinite(v)) { prev = null; return; } const X = gx(x[i]), Y = gy(v); if (prev) line(prev[0], prev[1], X, Y, hex(s.color ?? 0x62b0ff), 2); prev = [X, Y]; });
      texts.push({ x: L + 8 + si * 200, y: y0 + 4, s: s.name + (p.unit ? ` (${p.unit})` : ''), size: 14, color: '0xffffff' });
    });
    if (p.title) texts.push({ x: L + 8, y: y0 + 22, s: p.title, size: 13, color: '0x9aa4b2' });
  });
  const base = dest.replace(/\.png$/i, '') + '._base.png';
  writePng(base, W, Hh, img);
  const font = H.FONT ? `fontfile='${H.esc(H.FONT)}':` : '';
  const vf = texts.map((t) => `drawtext=${font}text='${H.esc(t.s)}':x=${Math.round(t.x)}:y=${Math.round(t.y)}:fontsize=${t.size}:fontcolor=${t.color}`).join(',');
  H.ff(['-i', base, '-vf', vf || 'null', '-frames:v', '1', dest]);
  rmSync(base, { force: true });
}

// ---------------------------------------------------------------- forensics
function loadQa(H, path) {
  if (!path) return {};
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch (e) { return H.fail(`could not read --qa ${path}`, e.message); }
}
const inRange = (t, list, pad = 0.12) => (list ?? []).find((d) => (d.from !== undefined ? t >= d.from - pad && t <= d.to + pad : Math.abs(t - (d.t ?? d)) <= pad));

function forensics(H, { flags, pos }) {
  const file = pos[0] ?? H.fail('forensics needs <video>');
  const info = H.probe(file);
  const qa = loadQa(H, flags.qa);
  const fps = info.fps || 30;
  const w = even(Number(flags.w ?? 256)), h = even((w * info.height) / info.width);
  const T = (i) => i / fps;
  const out = H.outDir(file);
  const frames = decodeGray(H, file, w, h);
  const N = frames.length;
  if (N < 8) H.fail('video has too few frames to analyse', `${N} frames`);
  const size = w * h;
  const mad = (a, b) => { let s = 0; for (let i = 0; i < size; i++) s += Math.abs(a[i] - b[i]); return s / size; };
  const luma = frames.map((f) => { let s = 0; for (let i = 0; i < size; i++) s += f[i]; return s / size; });
  const d = new Float64Array(N); // d[i] = |frame i - frame i-1|
  for (let i = 1; i < N; i++) d[i] = mad(frames[i], frames[i - 1]);
  const d2 = new Float64Array(N); // |frame i+1 - frame i-1|
  for (let i = 1; i < N - 1; i++) d2[i] = mad(frames[i + 1], frames[i - 1]);

  const findings = [];
  const declared = [];
  const add = (type, t0, t1, msg, extra = {}, declList) => {
    const hit = declList && (inRange(t0, declList) ?? inRange(t1, declList));
    const rec = { type, t: r2(t0), to: r2(t1), frame: Math.round(t0 * fps), msg, ...extra };
    if (hit || (qa.ignore ?? []).includes(type)) declared.push({ ...rec, reason: hit?.reason ?? 'ignored in qa.json' });
    else findings.push(rec);
  };

  // hard cuts (classified first so they are not reported as pops)
  const cutFrames = new Set();
  for (let i = 1; i < N; i++) {
    const nb = Math.max(d[i - 1] || 0, d[i + 1] || 0, 1);
    if (d[i] >= 10 && d[i] >= 4 * nb) cutFrames.add(i);
  }
  const cutList = [...cutFrames];
  const shotLens = []; let last = 0;
  for (const c of [...cutList, N]) { shotLens.push((c - last) / fps); last = c; }

  // still holds / frozen time
  const STILL = Number(qa.thresholds?.still ?? 0.35), MINHOLD = Number(qa.thresholds?.min_hold_s ?? 0.6);
  let stillFrames = 0, longest = null;
  for (let i = 1; i < N;) {
    if (d[i] >= STILL) { i++; continue; }
    let j = i; while (j + 1 < N && d[j + 1] < STILL) j++;
    const dur = (j - i + 2) / fps;
    if (dur >= MINHOLD) {
      stillFrames += j - i + 1;
      const rec = { from: T(i - 1), to: T(j), dur };
      if (!longest || dur > longest.dur) longest = rec;
      const long = dur >= 1.6;
      // a long hold is only a defect if it was not intended: severity medium, the reviewer decides (end cards need 1.5 s+)
      add('still_hold', rec.from, rec.to, `${r2(dur)} s with almost no pixel change (mean change < ${STILL}/255)${long ? ': longer than one earned stillness (1.0 to 1.6 s)' : ''}`, { dur: r2(dur), severity: long ? 'medium' : 'info' }, qa.holds);
    }
    i = j + 1;
  }

  // pops (a frame that differs from both neighbours while the neighbours match each other) and flashes
  const flashFrames = [];
  for (let i = 2; i < N - 2; i++) {
    const m = Math.min(d[i], d[i + 1]);
    if (m >= 2 && d2[i] < 0.35 * m && !cutFrames.has(i) && !cutFrames.has(i + 1)) {
      const lumaJump = Math.abs(luma[i] - (luma[i - 1] + luma[i + 1]) / 2);
      if (lumaJump >= 25) { flashFrames.push(i); add('flash', T(i), T(i), `one-frame ${luma[i] > luma[i - 1] ? 'white/bright' : 'dark'} flash (luma ${r2(luma[i - 1], 0)} -> ${r2(luma[i], 0)} -> ${r2(luma[i + 1], 0)})`, { severity: 'high' }, qa.flashes); }
      else add('pop', T(i), T(i), `frame ${i} differs from both neighbours (${r2(d[i])}/${r2(d[i + 1])}) but frames ${i - 1} and ${i + 1} match (${r2(d2[i])}): a one-frame glitch`, { severity: 'high' }, qa.pops);
    }
  }
  // multi-frame flashes at cuts: brightness spike of 1..3 frames that returns
  for (let i = 2; i < N - 4; i++) {
    for (const k of [2, 3]) {
      const a = luma[i - 1], b = luma[i + k];
      if (Math.abs(a - b) < 15 && Math.min(...Array.from({ length: k }, (_, q) => luma[i + q])) - Math.max(a, b) >= 45 && !flashFrames.some((f) => Math.abs(f - i) <= k + 1)) {
        flashFrames.push(i); add('flash', T(i), T(i + k - 1), `${k}-frame bright flash (luma ${r2(a, 0)} -> ${r2(luma[i], 0)} -> ${r2(b, 0)}); structural flashes are limited to two per film`, { severity: 'medium' }, qa.flashes);
      }
    }
  }

  // ghost frames: one blended frame between two stable images (cut with a 1-frame cross-dissolve)
  const blendFit = (G, A, B) => {
    let num = 0, den = 0;
    for (let q = 0; q < size; q += 3) { const dd = A[q] - B[q]; num += (G[q] - B[q]) * dd; den += dd * dd; }
    const alpha = den ? Math.min(1, Math.max(0, num / den)) : 0.5;
    let res = 0; for (let q = 0; q < size; q += 3) res += Math.abs(G[q] - (alpha * A[q] + (1 - alpha) * B[q]));
    return { alpha, res: res / (size / 3) };
  };
  const ghostFrames = [];
  for (let i = 2; i < N - 2; i++) {
    if (d[i] > 4 && d[i + 1] > 4 && d[i - 1] < d[i] / 4 && d[i + 2] < d[i] / 4 && d2[i] > 6) {
      const A = frames[i - 1], B = frames[i + 1], G = frames[i];
      const { alpha, res } = blendFit(G, A, B);
      const toA = mad(G, A), toB = mad(G, B);
      if (alpha > 0.12 && alpha < 0.88 && res < 0.45 * Math.min(toA, toB)) { ghostFrames.push(i); add('ghost', T(i), T(i), `frame ${i} is a ${Math.round(alpha * 100)}/${Math.round((1 - alpha) * 100)} blend of the shots on either side (double exposure for one frame); cut cleanly or dissolve over 6+ frames`, { severity: 'high' }, qa.ghosts); }
    }
  }

  // judder: duplicated frames inside motion, irregular timestamps
  const dupes = [];
  for (let i = 4; i < N - 4; i++) {
    const win = []; for (let k = -4; k <= 4; k++) if (k && i + k > 0) win.push(d[i + k]);
    const med = median(win);
    if (d[i] < 0.12 * med && med > 1.2 && !cutFrames.has(i)) dupes.push(i);
  }
  let judder = null;
  {
    const moving = Array.from({ length: N }, (_, i) => d[i] > 1.2).filter(Boolean).length;
    if (dupes.length >= 3) {
      const gaps = dupes.slice(1).map((v, i) => v - dupes[i]);
      const per = median(gaps);
      const regular = gaps.length >= 3 && gaps.filter((g) => Math.abs(g - per) <= 1).length >= 0.7 * gaps.length;
      judder = { duplicate_frames_in_motion: dupes.length, moving_frames: moving, share_pct: r2((100 * dupes.length) / Math.max(1, moving), 1), regular_spacing_frames: regular ? per : null, first_at_s: r2(T(dupes[0])), frames: dupes.slice(0, 12) };
      if (dupes.length / Math.max(1, moving) > 0.02) add('judder', T(dupes[0]), T(dupes[dupes.length - 1]), `${dupes.length} repeated frames inside moving stretches ${regular ? `(regularly every ${per} frames: an fps-conversion cadence)` : '(irregular: one-frame stalls in the motion)'}: reads as judder; check fps conversion, duplicated render frames or a spring/easing that stops for a frame`, { severity: 'medium' }, qa.judder);
    }
    const pk = H.run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', file]);
    const pts = pk.stdout.split(/\r?\n/).filter((l) => l.trim()).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (pts.length > 4) {
      const dts = pts.slice(1).map((v, i) => v - pts[i]);
      const md = median(dts), bad = dts.filter((x) => Math.abs(x - md) > md * 0.25).length;
      if (bad > 0) add('judder', 0, info.duration, `${bad} frame intervals deviate more than 25% from ${r2(md * 1000, 1)} ms (variable frame timing)`, { severity: 'medium' }, qa.judder);
    }
  }

  // banding: staircases of 1-level steps over long runs in smooth gradients, sampled once per second at 960 px
  let banding = { sampled: 0, worst_share_pct: 0, worst_t: null };
  if (!(qa.ignore ?? []).includes('banding')) {
    const bw = 960, bh = even((bw * info.height) / info.width), every = Number(flags['band-every'] ?? 1);
    const bf = decodeGray(H, file, bw, bh, { fps: 1 / every });
    bf.forEach((f, k) => {
      let stair = 0;
      for (let y = 0; y < bh; y += 3) {
        const runs = []; let x = 0;
        while (x < bw) { let e = x; const v = f[y * bw + x]; while (e + 1 < bw && f[y * bw + e + 1] === v) e++; runs.push({ v, len: e - x + 1 }); x = e + 1; }
        let k0 = 0;
        for (let q = 1; q <= runs.length; q++) {
          const ok = q < runs.length && Math.abs(runs[q].v - runs[q - 1].v) === 1 && runs[q].len >= 10 && (q - 1 === k0 || Math.sign(runs[q].v - runs[q - 1].v) === Math.sign(runs[q - 1].v - runs[q - 2].v));
          if (!ok) { if (q - k0 >= 4) for (let z = k0; z < q; z++) stair += runs[z].len; k0 = q; }
        }
      }
      const share = (100 * stair) / (bw * Math.ceil(bh / 3));
      banding.sampled++;
      if (share > banding.worst_share_pct) { banding.worst_share_pct = r2(share, 1); banding.worst_t = r2(k * every); }
    });
    if (banding.worst_share_pct >= 8) add('banding', banding.worst_t, banding.worst_t, `staircase gradient steps cover ${banding.worst_share_pct}% of the frame (first/worst at ${banding.worst_t}s): add 1 to 2% grain/dither or render 10-bit then dither`, { severity: banding.worst_share_pct >= 20 ? 'high' : 'medium' }, qa.banding);
  }

  // loop seam
  const seam = mad(frames[N - 1], frames[0]);
  const stepEnd = d[N - 1], stepStart = d[1];
  const seamNorm = seam / Math.max(0.8, (stepEnd + stepStart) / 2);
  const loop = { declared: !!qa.loop, last_to_first_diff: r2(seam), typical_end_step: r2(stepEnd), typical_start_step: r2(stepStart), seam_ratio: r2(seamNorm), closes: seamNorm <= 2.2 };
  if (qa.loop && !loop.closes) add('loop_seam', info.duration, info.duration, `declared loop but last->first frame difference (${loop.last_to_first_diff}) is ${loop.seam_ratio}x a normal frame step: the loop visibly jumps`, { severity: 'high' });
  if (!qa.loop) loop.note = loop.closes ? 'would loop cleanly if used as a loop' : 'not a loop (not declared)';

  // first-frame and last-frame stillness
  if (d[1] < STILL && d[2] < STILL && d[3] < STILL) add('slow_open', 0, T(3), 'first 4 frames do not move: the film starts dead (first frame should already be moving or a finished frame that moves within 0.2 s)', { severity: 'medium' }, qa.holds);

  // contact strip of every finding
  const sorted = [...findings].sort((a, b) => ({ high: 0, medium: 1, info: 2 }[a.severity ?? 'info'] - { high: 0, medium: 1, info: 2 }[b.severity ?? 'info']) || a.t - b.t);
  const flagged = [];
  const tmp = join(out, '_flag');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  sorted.filter((f) => f.type !== 'judder' || f.t > 0).slice(0, 24).forEach((f, k) => {
    const dest = join(tmp, `g${String(k).padStart(2, '0')}.png`);
    H.frameAt(file, Math.min(info.duration - 0.01, f.type === 'still_hold' ? (f.t + f.to) / 2 : f.t + 1e-3), dest, info.width >= info.height ? 480 : 300, `${f.type} ${f.t}s f${f.frame}`);
    flagged.push(dest);
  });
  let strip = null;
  if (flagged.length) { strip = H.pages(flagged, out, info.width >= info.height ? 4 : 6, 6, 'flagged_').contact; }
  rmSync(tmp, { recursive: true, force: true });

  const counts = {}; findings.forEach((f) => { counts[f.type] = (counts[f.type] ?? 0) + 1; });
  const report = {
    video: file, duration_s: r2(info.duration), fps, frames: N, analysed_at: `${w}x${h} gray`,
    verdict: findings.some((f) => f.severity === 'high') ? 'DEFECTS FOUND' : findings.some((f) => f.severity === 'medium') ? 'CHECK THESE' : 'CLEAN (measured)',
    counts, still_share_pct: r2((100 * stillFrames) / N, 1), longest_still: longest ? { from: r2(longest.from), to: r2(longest.to), dur: r2(longest.dur) } : null,
    hard_cuts: { count: cutList.length, at_s: cutList.map((c) => r2(T(c))), median_shot_s: r2(median(shotLens)), shortest_s: r2(Math.min(...shotLens)), longest_s: r2(Math.max(...shotLens)) },
    flashes_total: flashFrames.length, judder, banding, loop, findings: sorted, declared_by_qa_json: declared, flagged_contact: strip,
  };
  writeFileSync(join(out, 'forensics.json'), JSON.stringify(report, null, 1));
  const md = [`# Forensics: ${basename(file)}`, '', `${report.duration_s}s, ${fps} fps, ${N} frames. Verdict: **${report.verdict}**. Still share ${report.still_share_pct}%, ${cutList.length} hard cuts (median shot ${report.hard_cuts.median_shot_s}s).`, '',
    ...(sorted.length ? sorted.map((f) => `- [${f.severity ?? 'info'}] ${f.type} ${f.t}s${f.to !== f.t ? `-${f.to}s` : ''} (f${f.frame}): ${f.msg}`) : ['- no measured defects']), '',
    ...(declared.length ? ['Declared in qa.json (not counted):', ...declared.map((f) => `- ${f.type} ${f.t}s: ${f.reason}`)] : [])].join('\n');
  writeFileSync(join(out, 'forensics.md'), md);
  H.done({ ...report, findings: sorted.slice(0, 40), report_md: join(out, 'forensics.md'), report_json: join(out, 'forensics.json') },
    { look: 'Open flagged_contact_p1.png and look at each flagged frame: the measurement says where to look, your eyes decide if it is a defect. Heuristics: still_hold may be an intended hold (declare it in qa.json with a reason); banding is a suspect score, confirm on the poster frame.' });
}

// ---------------------------------------------------------------- flow (global affine Lucas-Kanade)
function boxBlur(src, w, h) {
  const o = new Float32Array(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) { s += src[Y * w + X]; c++; } }
    o[y * w + x] = s / c;
  }
  return o;
}
function down2(src, w, h) {
  const nw = w >> 1, nh = h >> 1, o = new Float32Array(nw * nh);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) o[y * nw + x] = (src[2 * y * w + 2 * x] + src[2 * y * w + 2 * x + 1] + src[(2 * y + 1) * w + 2 * x] + src[(2 * y + 1) * w + 2 * x + 1]) / 4;
  return o;
}
const bil = (img, w, h, x, y) => {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), fx = x - x0, fy = y - y0;
  return (img[y0 * w + x0] * (1 - fx) + img[y0 * w + x1] * fx) * (1 - fy) + (img[y1 * w + x0] * (1 - fx) + img[y1 * w + x1] * fx) * fy;
};
function solve3(A, b) { // Gaussian elimination, 3x3
  const M = [[A[0], A[1], A[2], b[0]], [A[3], A[4], A[5], b[1]], [A[6], A[7], A[8], b[2]]];
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-9) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < 3; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = [0, 0, 0];
  for (let r = 2; r >= 0; r--) { let s = M[r][3]; for (let k = r + 1; k < 3; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}
/** Content moves from prev to cur by u(p) = (tx + s*(x-cx), ty + s*(y-cy)). Returns {tx,ty,s} in base-level pixels and a textureless flag. */
function globalMotion(pyrPrev, pyrCur) {
  let tx = 0, ty = 0, s = 0, tex = 0;
  for (let L = pyrPrev.length - 1; L >= 0; L--) {
    const { img: P, w, h } = pyrPrev[L], C = pyrCur[L].img, cx = (w - 1) / 2, cy = (h - 1) / 2;
    for (let it = 0; it < 4; it++) {
      const A = new Float64Array(9), B = new Float64Array(3); let n = 0, wsum = 0;
      for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
        const ux = tx + s * (x - cx), uy = ty + s * (y - cy);
        const c = bil(C, w, h, x + ux, y + uy); if (Number.isNaN(c)) continue;
        const Ix = (P[y * w + x + 1] - P[y * w + x - 1]) / 2, Iy = (P[(y + 1) * w + x] - P[(y - 1) * w + x]) / 2;
        const It = c - P[y * w + x]; // residual under the current estimate
        const wgt = 1 / (1 + (It / 12) ** 2);
        const g = [Ix, Iy, Ix * (x - cx) + Iy * (y - cy)];
        for (let a = 0; a < 3; a++) { B[a] -= wgt * g[a] * It; for (let b = 0; b < 3; b++) A[a * 3 + b] += wgt * g[a] * g[b]; }
        n++; wsum += wgt * (Ix * Ix + Iy * Iy);
      }
      tex = wsum / Math.max(1, n);
      A[0] += 1e-3; A[4] += 1e-3; A[8] += 1e-1;
      const dlt = solve3(A, B);
      if (!dlt) break;
      tx += dlt[0]; ty += dlt[1]; s += dlt[2];
      if (Math.hypot(dlt[0], dlt[1]) < 0.01 && Math.abs(dlt[2]) < 1e-5) break;
    }
    if (L > 0) { tx *= 2; ty *= 2; }
  }
  // how much of the frame difference the global model explains (low = local animation, not camera)
  const P0 = pyrPrev[0], C0 = pyrCur[0].img, cx0 = (P0.w - 1) / 2, cy0 = (P0.h - 1) / 2;
  let raw = 0, res = 0, cnt = 0;
  for (let y = 2; y < P0.h - 2; y++) for (let x = 2; x < P0.w - 2; x++) {
    const c = bil(C0, P0.w, P0.h, x + tx + s * (x - cx0), y + ty + s * (y - cy0)); if (Number.isNaN(c)) continue;
    raw += Math.abs(C0[y * P0.w + x] - P0.img[y * P0.w + x]); res += Math.abs(c - P0.img[y * P0.w + x]); cnt++;
  }
  return { tx, ty, s, tex, raw: raw / Math.max(1, cnt), explained: raw > 0 ? 1 - res / raw : 1 };
}

function flow(H, { flags, pos }) {
  const file = pos[0] ?? H.fail('flow needs <video>');
  const info = H.probe(file);
  const fps = Number(flags.fps ?? 30);
  const w = 160, h = even((w * info.height) / info.width);
  const out = H.outDir(file);
  const frames = decodeGray(H, file, w, h, { fps });
  const N = frames.length;
  if (N < 6) H.fail('too few frames for flow', `${N}`);
  const pyr = frames.map((f) => { const l0 = boxBlur(Float32Array.from(f), w, h), l1 = down2(l0, w, h), l2 = down2(boxBlur(l1, w >> 1, h >> 1), w >> 1, h >> 1); return [{ img: l0, w, h }, { img: l1, w: w >> 1, h: h >> 1 }, { img: l2, w: w >> 2, h: h >> 2 }]; });
  const dmean = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
  const speed = new Array(N).fill(NaN), zoom = new Array(N).fill(NaN), panx = new Array(N).fill(NaN), pany = new Array(N).fill(NaN), cuts = [];
  let local = 0;
  const R2 = Math.hypot(w / 2, h / 2);
  for (let i = 1; i < N; i++) {
    const dd = dmean(frames[i], frames[i - 1]);
    if (dd > 14) { cuts.push(i); continue; } // hard cut: no global motion exists across it
    const m = globalMotion(pyr[i - 1], pyr[i]);
    if (m.tex < 0.02) continue; // textureless: motion not measurable
    if (m.raw > 1.5 && m.explained < 0.45) { local++; continue; } // the frame changed by local animation, not a camera move
    const cornerRms = Math.sqrt(m.tx * m.tx + m.ty * m.ty + (m.s * R2) ** 2);
    speed[i] = (cornerRms / w) * fps; // frame widths per second
    zoom[i] = m.s * fps * 100; // percent scale per second
    panx[i] = (m.tx / w) * fps; pany[i] = (m.ty / w) * fps;
  }
  const sm = (a, k = 2) => a.map((_, i) => { const v = []; for (let q = -k; q <= k; q++) if (Number.isFinite(a[i + q])) v.push(a[i + q]); return v.length >= k ? median(v) : NaN; });
  const S = sm(speed), Z = sm(zoom);
  const fin = S.filter(Number.isFinite);
  const peak = fin.length ? [...fin].sort((a, b) => a - b)[Math.floor(fin.length * 0.9)] : 0;
  const cruise = Number(flags.cruise ?? (median(fin.filter((v) => v >= 0.5 * peak)) || peak));
  const win = Math.round(Number(flags['dip-window'] ?? 1.5) * fps), maxDip = Number(flags['dip-max'] ?? 1.5) * fps;

  // dips: sustained slowdown to under half of the nearer neighbouring peak while the camera is clearly moving
  const dips = []; let run = null;
  const isDip = (i) => {
    if (!Number.isFinite(S[i]) || cuts.some((c) => Math.abs(c - i) <= 2)) return false;
    let L = 0, Rr = 0;
    for (let q = 1; q <= win; q++) { if (Number.isFinite(S[i - q])) L = Math.max(L, S[i - q]); if (Number.isFinite(S[i + q])) Rr = Math.max(Rr, S[i + q]); }
    const nb = Math.min(L, Rr);
    return nb > 0.3 * cruise && nb > 0.02 && S[i] < 0.5 * nb;
  };
  for (let i = 0; i < N; i++) {
    if (isDip(i)) { if (!run) run = { a: i, b: i }; else run.b = i; }
    else if (run) { if (run.b - run.a + 1 >= 2 && run.b - run.a + 1 <= maxDip) dips.push(run); run = null; }
  }
  if (run && run.b - run.a + 1 >= 2 && run.b - run.a + 1 <= maxDip) dips.push(run);
  const dipOut = dips.map((r) => ({ from_s: r2(r.a / fps), to_s: r2(r.b / fps), min_share_of_cruise: r2(Math.min(...S.slice(r.a, r.b + 1)) / cruise) }));

  // zoom reversals: zoom rate changes sign with at least 3 %/s of real zoom on both sides for 4+ frames
  const reversals = []; let sign = 0, signStart = 0, lastI = 0;
  const ZT = Number(flags['zoom-threshold'] ?? 3);
  for (let i = 0; i < N; i++) {
    const z = Z[i]; if (!Number.isFinite(z) || Math.abs(z) < ZT) continue;
    const sg = Math.sign(z);
    if (sign && i - lastI > 6) sign = 0; // gap of unmeasurable frames: not a reversal
    lastI = i;
    if (sign && sg !== sign) {
      const len = (a, b) => { let c = 0; for (let q = a; q < b; q++) if (Math.sign(Z[q]) === sign && Math.abs(Z[q]) >= ZT) c++; return c; };
      let after = 0; for (let q = i; q < Math.min(N, i + 12); q++) if (Math.sign(Z[q]) === sg && Math.abs(Z[q]) >= ZT) after++;
      if (len(signStart, i) >= 4 && after >= 4 && !cuts.some((c) => Math.abs(c - i) <= 3)) reversals.push({ at_s: r2(i / fps), from: sign > 0 ? 'zoom in' : 'zoom out', to: sg > 0 ? 'zoom in' : 'zoom out' });
      signStart = i;
    }
    if (!sign || sg !== sign) signStart = i;
    sign = sg;
  }

  const x = Array.from({ length: N }, (_, i) => i / fps), xmax = Math.ceil(N / fps);
  const dest = join(out, 'flow.png');
  plotPanels(H, dest, {
    x, xmax, marks: cuts.map((c) => c / fps), title: `${basename(file)}: global camera motion at ${fps} fps (grey lines = hard cuts, red = flagged)`,
    panels: [
      { title: 'speed, frame widths per second (translation + zoom, corner displacement)', series: [{ name: 'speed', y: S, color: 0x62b0ff }], hlines: [{ y: cruise, label: `cruise ${r2(cruise)}` }], bands: dips.map((r) => ({ x0: r.a / fps, x1: r.b / fps })) },
      { title: 'zoom rate, pct scale per second (positive = zooming in)', series: [{ name: 'zoom', y: Z, color: 0xe08a3c }], symmetric: true, hlines: [{ y: ZT, label: `+${ZT}` }, { y: -ZT, label: `-${ZT}` }], bands: reversals.map((r) => ({ x0: r.at_s - 0.1, x1: r.at_s + 0.1 })) },
    ],
  });
  writeFileSync(join(out, 'flow.json'), JSON.stringify({ fps, cruise, t: x, speed: S, zoom_pct_per_s: Z, pan_x: panx, pan_y: pany, cuts }));
  H.done({ plot: dest, data: join(out, 'flow.json'), fps, frames: N, cruise_frame_widths_per_s: r2(cruise), measured_frames_pct: r2((100 * fin.length) / N, 0), local_animation_frames_skipped: local, large_changes_excluded_as_cuts: cuts.map((c) => r2(c / fps)), speed_dips: dipOut, zoom_reversals: reversals,
    verdict: dips.length || reversals.length ? 'CAMERA CONTINUITY ISSUES' : 'no speed dips or zoom reversals' },
    { look: 'Open flow.png. A smooth glide is one hump (or a plateau) with no notch; a notch between two humps is a speed dip. Global estimate: moving UI inside a static camera also registers, so read dips against the picture. Hard cuts are excluded.' });
}

// ---------------------------------------------------------------- plot
function parseSeries(H, file, fps) {
  const txt = readFileSync(file, 'utf8');
  let t = null, series = [];
  const toT = (n) => Array.from({ length: n }, (_, i) => (fps ? i / fps : i));
  if (/\.csv$/i.test(file) || !/^\s*[[{]/.test(txt)) {
    const rows = txt.split(/\r?\n/).filter((l) => l.trim()).map((l) => l.split(/[,;\t]/).map((c) => c.trim()));
    const head = rows[0].every((c) => !Number.isFinite(Number(c))) ? rows.shift() : null;
    const cols = rows[0].length;
    if (cols === 1) { series = [{ name: head?.[0] ?? 'value', y: rows.map((r) => Number(r[0])) }]; t = toT(rows.length); }
    else { t = rows.map((r) => Number(r[0])); for (let c = 1; c < cols; c++) series.push({ name: head?.[c] ?? `col${c}`, y: rows.map((r) => Number(r[c])) }); }
    if (cols > 1 && head && /frame/i.test(head[0]) && fps) t = t.map((v) => v / fps);
  } else {
    const j = JSON.parse(txt);
    if (Array.isArray(j) && typeof j[0] === 'number') { series = [{ name: 'value', y: j }]; t = toT(j.length); }
    else if (Array.isArray(j) && Array.isArray(j[0])) { t = j.map((p) => p[0]); series = [{ name: 'value', y: j.map((p) => p[1]) }]; if (fps && j.every((p, i) => p[0] === i)) t = t.map((v) => v / fps); }
    else if (Array.isArray(j) && typeof j[0] === 'object') {
      const k = Object.keys(j[0]), tk = k.find((s) => /^(t|time|frame|x)$/i.test(s)) ?? k[0];
      t = j.map((o) => Number(o[tk])); if (/frame/i.test(tk) && fps) t = t.map((v) => v / fps);
      for (const key of k.filter((s) => s !== tk)) series.push({ name: key, y: j.map((o) => Number(o[key])) });
    } else if (j && typeof j === 'object') {
      const tk = ['t', 'time', 'frames', 'frame', 'x'].find((s) => Array.isArray(j[s]));
      if (tk) { t = j[tk].map(Number); if (/frame/.test(tk) && fps) t = t.map((v) => v / fps); }
      for (const [key, v] of Object.entries(j)) if (key !== tk && Array.isArray(v) && typeof v[0] === 'number') series.push({ name: key, y: v });
      if (!t) t = toT(series[0]?.y.length ?? 0);
    }
  }
  if (!series.length) H.fail('plot: no numeric series found', 'accepted: [numbers], [[x,y]], [{t,..}], {t:[],name:[]}, csv with header');
  series.forEach((s, i) => { s.color = [0x62b0ff, 0xe08a3c, 0x7fd18b, 0xd77ad0, 0xf0c040][i % 5]; });
  return { t, series };
}
function plot(H, { flags, pos }) {
  const file = pos[0] ?? H.fail('plot needs <data.json|csv>');
  const fps = flags.fps ? Number(flags.fps) : null;
  const { t, series } = parseSeries(H, file, fps);
  const dest = resolve(typeof flags.out === 'string' ? flags.out : join(resolve(file, '..'), `${basename(file, extname(file))}_plot.png`));
  mkdirSync(resolve(dest, '..'), { recursive: true });
  const xmax = Math.max(1, Math.ceil(Math.max(...t) * 10) / 10);
  const stalls = [];
  const panels = [{ title: flags.title ?? 'value over time', series, unit: flags.unit }];
  if (flags.deriv) {
    const vel = series.map((s) => ({ ...s, name: `d/dt ${s.name}`, y: s.y.map((v, i) => (i && t[i] !== t[i - 1] ? (v - s.y[i - 1]) / (t[i] - t[i - 1]) : NaN)) }));
    panels.push({ title: 'velocity (first difference per second); flat zero mid-curve = a hold, or a stall bug if unintended', series: vel, symmetric: true });
    vel.forEach((vs, si) => {
      const y = series[si].y, vmax = Math.max(...vs.y.filter(Number.isFinite).map(Math.abs), 1e-9), total = Math.abs(y[y.length - 1] - y[0]);
      let a = null;
      for (let i = 1; i <= y.length; i++) {
        const still = i < y.length && Math.abs(vs.y[i]) < 0.02 * vmax;
        const midMove = i < y.length && Math.abs(y[i] - y[0]) > 0.03 * total && Math.abs(y[y.length - 1] - y[i]) > 0.03 * total;
        if (still && midMove) { if (a === null) a = i; } else if (a !== null) { if (t[i - 1] - t[a] >= 0.08 * xmax || i - a >= 4) stalls.push({ series: series[si].name, from: r2(t[a]), to: r2(t[i - 1]) }); a = null; }
      }
    });
    panels[1].bands = stalls.map((s) => ({ x0: s.from, x1: s.to }));
  }
  plotPanels(H, dest, { x: t, xmax, panels, title: basename(file) });
  const summary = series.map((s) => ({ series: s.name, n: s.y.length, min: r2(Math.min(...s.y)), max: r2(Math.max(...s.y)), start: r2(s.y[0]), end: r2(s.y[s.y.length - 1]) }));
  H.done({ plot: dest, series: summary, stalls: flags.deriv ? stalls : 'run with --deriv to detect mid-move velocity stalls' },
    { look: 'Motion bug rule: plot the value over frames before changing code. A stall is velocity at zero while the value still has distance to travel; a kink is a velocity jump.' });
}

// ---------------------------------------------------------------- compare
function colourGrid(H, png) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', png, '-vf', 'scale=8:6:flags=area,format=rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 });
  return r.status === 0 ? [...r.stdout] : null;
}
function compare(H, { flags, pos }) {
  const [file, ref] = pos;
  if (!file || !ref || !existsSync(ref)) H.fail('compare needs <video> <reference-image-or-sheet-or-video>');
  const info = H.probe(file);
  const out = H.outDir(file);
  const tmp = join(out, '_cmp');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const tw = info.width >= info.height ? 480 : 300, th = even((tw * info.height) / info.width);
  const fit = `scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2:color=0x202020`;
  const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(ref);
  const cols = Number(flags.cols ?? 1), rows = Number(flags.rows ?? 1);
  const n = Number(flags.n ?? (isVideo ? 6 : cols * rows > 1 ? cols * rows : 6));
  const times = flags.times ? String(flags.times).split(',').map(Number) : Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * info.duration);
  const refTiles = [];
  if (isVideo) {
    const ri = H.probe(ref);
    times.forEach((t, i) => { const d = join(tmp, `r${i}.png`); H.ff(['-ss', String(Math.min(ri.duration - 0.05, (t / info.duration) * ri.duration)), '-i', ref, '-frames:v', '1', '-vf', fit, d]); refTiles.push(d); });
  } else if (cols * rows > 1) {
    const rinfo = H.run('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', ref]).stdout.trim().split('x').map(Number);
    const cw = Math.floor(rinfo[0] / cols), ch = Math.floor(rinfo[1] / rows);
    for (let i = 0; i < cols * rows; i++) { const d = join(tmp, `r${i}.png`); H.ff(['-i', ref, '-vf', `crop=${cw}:${ch}:${(i % cols) * cw}:${Math.floor(i / cols) * ch},${fit}`, '-frames:v', '1', d]); refTiles.push(d); }
  } else {
    const d = join(tmp, 'r0.png'); H.ff(['-i', ref, '-vf', fit, '-frames:v', '1', d]);
    times.forEach(() => refTiles.push(d));
  }
  const m = Math.min(times.length, refTiles.length);
  const ours = [], pairs = [];
  for (let i = 0; i < m; i++) {
    const d = join(tmp, `o${i}.png`);
    H.ff(['-ss', String(Math.min(info.duration - 0.03, times[i])), '-i', file, '-frames:v', '1', '-vf', `${fit},${H.label(`ours ${times[i].toFixed(2)}s`, 16)}`, d]);
    ours.push(d);
    const rl = join(tmp, `rl${i}.png`); H.ff(['-i', refTiles[i], '-vf', cols * rows > 1 && !isVideo ? 'null' : H.label(isVideo ? `ref ${i + 1}` : 'ref', 16), rl]); refTiles[i] = rl;
    const a = colourGrid(H, rl), b = colourGrid(H, d);
    if (a && b) {
      let mae = 0; for (let q = 0; q < a.length; q++) mae += Math.abs(a[q] - b[q]); mae /= a.length;
      const luma = (g) => { let s = 0; for (let q = 0; q < g.length; q += 3) s += 0.2126 * g[q] + 0.7152 * g[q + 1] + 0.0722 * g[q + 2]; return s / (g.length / 3); };
      pairs.push({ t: r2(times[i]), palette_diff_0_255: r2(mae, 1), luma_ref: r2(luma(a), 0), luma_ours: r2(luma(b), 0) });
    }
  }
  const per = Number(flags.per ?? 6), pages = [];
  for (let p = 0; p * per < m; p++) {
    const k = Math.min(per, m - p * per), lst = join(tmp, `l${p}.txt`);
    const seq = [...refTiles.slice(p * per, p * per + k), ...ours.slice(p * per, p * per + k)];
    writeFileSync(lst, seq.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));
    const dest = join(out, `compare_p${p + 1}.png`);
    H.ff(['-f', 'concat', '-safe', '0', '-i', lst, '-vf', `tile=${k}x2:padding=6:margin=6:color=0x202020`, '-frames:v', '1', dest]);
    pages.push(dest);
  }
  rmSync(tmp, { recursive: true, force: true });
  H.done({ pages, pairs, note: 'top row = reference, bottom row = ours at matched times' },
    { look: 'Open every page. For each pair state in what way ours falls short of (or beats) the reference: type scale, density, colour, motion blur, spacing, focal point. palette_diff is only a hint: a high number on a pair that you judge equal is not a defect.' });
}

export function main({ cmd, flags, pos, helpers: H }) {
  const ctx = { flags, pos };
  if (cmd === 'forensics') return forensics(H, ctx);
  if (cmd === 'flow') return flow(H, ctx);
  if (cmd === 'plot') return plot(H, ctx);
  if (cmd === 'compare') return compare(H, ctx);
}
