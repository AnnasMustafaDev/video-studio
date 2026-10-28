// Composes the music bed in code (Web Audio OfflineAudioContext inside a
// headless browser) on the exact beat grid of build/timeline.json and writes
// audio/music.wav (48 kHz stereo). Arrangement comes from script.json "music":
// chords/roots per bar, intro scenes (soft kick only), breakdown scenes (no
// drums, dark pad), lift scene (riser before, impact on its downbeat, bright
// pad), endHit (impact on the last bar for the logo).
import { writeFileSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const R = new URL('../', import.meta.url);
const tl = JSON.parse(readFileSync(new URL('build/timeline.json', R), 'utf8'));
const script = JSON.parse(readFileSync(new URL('script.json', R), 'utf8'));
const MUSIC = { chords: null, roots: null, intro: [], breakdown: [], lift: null, endHit: true, ...(script.music ?? {}) };

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true });
const page = await browser.newPage();
const b64 = await page.evaluate(async ({ T, M }) => {
  const SR = 48000;
  const dur = T.duration + 2.5; // reverb tail after the last hit
  const ctx = new OfflineAudioContext(2, Math.ceil(dur * SR), SR);
  const beat = T.beat;
  const bar = T.bar;
  const sceneAt = Object.fromEntries(T.scenes.map((s) => [s.id, s]));
  const barOf = (t) => Math.round(t / bar);

  // master bus: gentle glue compression + a long, dark reverb send
  const master = ctx.createDynamicsCompressor();
  master.threshold.value = -14; master.ratio.value = 2.5; master.attack.value = 0.01; master.release.value = 0.2;
  master.connect(ctx.destination);
  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, SR * 2.6, SR);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = rnd() * Math.pow(1 - i / d.length, 3.2);
  }
  verb.buffer = ir;
  const verbIn = ctx.createGain(); verbIn.gain.value = 0.22;
  const verbLP = ctx.createBiquadFilter(); verbLP.type = 'lowpass'; verbLP.frequency.value = 3500;
  verbIn.connect(verb).connect(verbLP).connect(master);
  const bus = (g, send = 0) => {
    const n = ctx.createGain(); n.gain.value = g; n.connect(master);
    if (send) { const s = ctx.createGain(); s.gain.value = send; n.connect(s).connect(verbIn); }
    return n;
  };
  const noiseBuf = ctx.createBuffer(1, SR * 2, SR);
  { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd(); }

  const kickBus = bus(0.9), hatBus = bus(0.18, 0.1), clapBus = bus(0.35, 0.35), bassBus = bus(0.42), padBus = bus(0.22, 0.6), fxBus = bus(0.5, 0.5);

  function kick(t, v = 1) {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g).connect(kickBus); o.start(t); o.stop(t + 0.45);
  }
  function noiseHit(t, dst, { type = 'highpass', f = 7000, q = 0.7, d = 0.05, v = 1, a = 0.002 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 1 + rnd() * 0.05;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl).connect(g).connect(dst); s.start(t, Math.abs(rnd())); s.stop(t + d + 0.02);
  }
  const hat = (t, v = 1) => noiseHit(t, hatBus, { f: 8000, d: 0.045, v });
  const clap = (t) => { for (const o of [0, 0.011, 0.023]) noiseHit(t + o, clapBus, { type: 'bandpass', f: 1500, q: 1.2, d: 0.16, v: 0.8 }); };
  function bassNote(t, f, d) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f / 2;
    const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 6;
    fl.frequency.setValueAtTime(900, t); fl.frequency.exponentialRampToValueAtTime(180, t + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(fl); o2.connect(fl); fl.connect(g).connect(bassBus); o.start(t); o2.start(t); o.stop(t + d + 0.05); o2.stop(t + d + 0.05);
  }
  function pad(t, freqs, d, bright = 900) {
    const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = bright; fl.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.9); g.gain.setValueAtTime(0.16, t + d - 0.6); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.4);
    fl.connect(g).connect(padBus);
    for (const f of freqs) for (const det of [-7, 6]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
      o.connect(fl); o.start(t); o.stop(t + d + 0.5);
    }
  }
  function riser(t0, t1) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 2;
    fl.frequency.setValueAtTime(400, t0); fl.frequency.exponentialRampToValueAtTime(9000, t1);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.6, t1 - 0.02); g.gain.linearRampToValueAtTime(0.0001, t1 + 0.01);
    s.connect(fl).connect(g).connect(fxBus); s.start(t0); s.stop(t1 + 0.05);
  }
  function impact(t, v = 1) {
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.4);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g).connect(fxBus); o.start(t); o.stop(t + 1.9);
    noiseHit(t, fxBus, { type: 'lowpass', f: 1800, d: 0.9, v: 0.5 * v });
  }

  // default Am – F – C – G, one chord per bar
  const CH = M.chords ?? [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 261.63, 329.63], [196, 246.94, 293.66]];
  const ROOT = M.roots ?? [55, 43.65, 65.41, 49];
  const nBars = Math.round(T.duration / bar);
  const inScenes = (b, ids) => ids.some((id) => sceneAt[id] && b >= barOf(sceneAt[id].start) && b < barOf(sceneAt[id].end));
  const liftA = M.lift && sceneAt[M.lift] ? barOf(sceneAt[M.lift].start) : -1;
  const liftB = M.lift && sceneAt[M.lift] ? barOf(sceneAt[M.lift].end) : -1;
  const introEnd = Math.max(0, ...M.intro.filter((id) => sceneAt[id]).map((id) => barOf(sceneAt[id].end)));
  for (let b = 0; b < nBars; b++) {
    const t = b * bar; const ch = b % CH.length;
    const quiet = inScenes(b, M.breakdown); const lifted = b >= liftA && b < liftB;
    const lastBars = b >= nBars - 1;
    const full = b >= introEnd + 1; // groove builds one bar after the intro
    pad(t, CH[ch], bar, lifted ? 2600 : quiet ? 700 : 1300);
    for (let k = 0; k < 4; k++) {
      const tb = t + k * beat;
      if (!quiet && !lastBars) kick(tb, b < introEnd ? 0.75 : 1);
      if (b >= introEnd && !quiet && !lastBars) { hat(tb + beat / 2, 0.9); if (lifted || full) hat(tb + beat / 4, 0.35); hat(tb + 3 * beat / 4, 0.35); }
      if (full && !quiet && !lastBars && (k === 1 || k === 3)) clap(tb);
      if (full && !quiet && !lastBars) { bassNote(tb, ROOT[ch % ROOT.length] * 2, beat * 0.45); bassNote(tb + beat / 2, ROOT[ch % ROOT.length] * (k === 3 ? 3 : 2), beat * 0.4); }
    }
    if (b === 0) impact(t, 0.6);
  }
  if (liftA > 0) {
    riser(liftA * bar - bar, liftA * bar);
    impact(liftA * bar, 0.9);
  }
  if (M.endHit) impact(T.duration - bar, 1); // logo hit on the last bar's downbeat

  const buf = await ctx.startRendering();
  // 16-bit PCM WAV
  const n = buf.length, chs = 2, bytes = 44 + n * chs * 2;
  const dv = new DataView(new ArrayBuffer(bytes));
  const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, chs, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * chs * 2, true); dv.setUint16(32, chs * 2, true); dv.setUint16(34, 16, true);
  w(36, 'data'); dv.setUint32(40, n * chs * 2, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  let o = 44;
  for (let i = 0; i < n; i++) { for (const s of [L[i], Rr[i]]) { dv.setInt16(o, Math.max(-1, Math.min(1, s)) * 32767, true); o += 2; } }
  let bin = ''; const u8 = new Uint8Array(dv.buffer);
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}, { T: tl, M: MUSIC });
await browser.close();
writeFileSync(new URL('audio/music.wav', R), Buffer.from(b64, 'base64'));
console.log(JSON.stringify({ status: 'success', result: 'audio/music.wav', metadata: { seconds: tl.duration + 2.5 } }));
