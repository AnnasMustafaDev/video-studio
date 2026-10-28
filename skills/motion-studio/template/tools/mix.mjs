// Soundtrack: music bed (music.mjs) + voice lines at their timeline times +
// SFX placed by their peak from the composition's cue sheet, voice-ducked,
// loudness-normalised. Needs build/comp_timing.json (render.mjs writes it).
// Usage: node tools/mix.mjs [--lufs -14] [--music 0.5]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : def);
const LUFS = Number(opt('--lufs', -14));
const MUSIC = Number(opt('--music', 0.5));

const timing = JSON.parse(readFileSync(join(ROOT, 'build', 'comp_timing.json'), 'utf8'));
const DUR = timing.duration;
const A = join(ROOT, 'audio');
if (!existsSync(join(A, 'music.wav'))) {
  console.log(JSON.stringify({ status: 'error', error: 'audio/music.wav is missing: run node tools/music.mjs first' }));
  process.exit(1);
}
const SFX = join(A, 'sfx');
mkdirSync(SFX, { recursive: true });
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd: A, stdio: 'inherit' });

// sfx, each with its peak offset so the cue lands exactly on the visual hit
const PEAK = { whoosh: 0.42, pop: 0.0, tick: 0.0 };
// whoosh: pink noise through a band-pass sweeping up to the peak and back down
ff(['-f', 'lavfi', '-i', 'anoisesrc=c=pink:a=0.6:d=0.75:r=48000',
  '-af', "bandpass=f=900:w=1.2,volume='0.08+0.92*exp(-pow((t-0.42)/0.16,2))':eval=frame,highpass=f=180,lowpass=f=5200,afade=t=out:st=0.55:d=0.2,volume=0.9", 'sfx/whoosh.wav']);
// pop: soft rounded blip, quick upward pitch, no click at the start
ff(['-f', 'lavfi', '-i', 'aevalsrc=0.55*sin(2*PI*(380+900*t)*t)*(1-exp(-900*t))*exp(-26*t):s=48000:d=0.25', '-af', 'lowpass=f=4000', 'sfx/pop.wav']);
// tick: UI click, two short partials
ff(['-f', 'lavfi', '-i', 'aevalsrc=0.45*(sin(2*PI*2100*t)+0.5*sin(2*PI*3400*t))*exp(-90*t):s=48000:d=0.08', 'sfx/tick.wav']);

const inputs = ['-i', 'music.wav'];
const idx = () => inputs.length / 2 - 1;
let fc = '';
const vo = [];
const voLines = timing.lines.filter((l) => existsSync(join(A, 'vo', `${l.id}.wav`)));
if (!voLines.length) {
  console.log(JSON.stringify({ status: 'error', error: 'no voice clips in audio/vo: run python tools/vo.py first' }));
  process.exit(1);
}
for (const l of voLines) {
  inputs.push('-i', `vo/${l.id}.wav`);
  const ms = Math.round(l.at * 1000);
  fc += `[${idx()}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay=${ms}|${ms}[v${vo.length}];`;
  vo.push(`[v${vo.length}]`);
}
fc += `${vo.join('')}amix=inputs=${vo.length}:normalize=0,apad=whole_dur=${(DUR + 0.5).toFixed(2)},asplit=2[vomix][vokey];`;

const fx = [];
for (const name of Object.keys(PEAK)) {
  const mine = (timing.sfx ?? []).filter((c) => c.name === name);
  if (!mine.length) continue;
  inputs.push('-i', `sfx/${name}.wav`);
  fc += `[${idx()}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=${mine.length}${mine.map((_, i) => `[${name}${i}]`).join('')};`;
  mine.forEach((c, i) => {
    const ms = Math.max(0, Math.round((c.at - PEAK[name]) * 1000));
    fc += `[${name}${i}]volume=${c.vol},adelay=${ms}|${ms}[e${fx.length}];`;
    fx.push(`[e${fx.length}]`);
  });
}
fc += `[0:a]volume=${MUSIC}[mus];[mus][vokey]sidechaincompress=threshold=0.025:ratio=5:attack=30:release=420[duck];`;
if (fx.length) fc += `${fx.join('')}amix=inputs=${fx.length}:normalize=0[sfx];`;
fc += `[vomix][duck]${fx.length ? '[sfx]' : ''}amix=inputs=${fx.length ? 3 : 2}:normalize=0,atrim=0:${DUR.toFixed(3)},afade=t=out:st=${(DUR - 1.2).toFixed(2)}:d=1.2,loudnorm=I=${LUFS}:TP=-1:LRA=11[out]`;
ff([...inputs, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', 'mix.wav']);
console.log(JSON.stringify({ status: 'success', result: join(A, 'mix.wav'), metadata: { duration: DUR, lufsTarget: LUFS, vo: vo.length, sfx: fx.length } }));
