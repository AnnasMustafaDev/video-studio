// Renders comp/index.html frame by frame (headless Edge/Chromium) into ffmpeg.
//   node tools/render.mjs preview 0,4.2,13.1 [subs=de]       -> shots/preview_*.png + shots/preview_sheet.png
//   node tools/render.mjs video out/work/v.mp4 [blur=4] [fps=60] [subs=de] [from-to]
//   node tools/render.mjs timing                              -> build/comp_timing.json
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { handler, ROOT } from './serve.mjs';

const [mode, arg, ...rest] = process.argv.slice(2);
if (!mode || mode === '--help') {
  console.log('render.mjs preview <t,...> [subs=de] | video <out.mp4> [blur=4] [fps=60] [subs=de] [from-to] | timing');
  process.exit(mode ? 0 : 1);
}
const fail = (error, details) => {
  console.log(JSON.stringify({ status: 'error', error, details }));
  process.exit(1);
};
const opts = Object.fromEntries(rest.filter((r) => r.includes('=')).map((r) => r.split('=')));
const range = rest.find((r) => /^[\d.]+-[\d.]+$/.test(r))?.split('-').map(Number);

const server = createServer(handler).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const channel = process.env.BROWSER_CHANNEL ?? 'msedge';
const browser = await chromium.launch({ channel, headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const problems = [];
page.on('pageerror', (e) => problems.push(`[page] ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`[console] ${m.text()}`));
page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('.wav') && problems.push(`[${r.status()}] ${r.url()}`));
await page.goto(`http://127.0.0.1:${server.address().port}/comp/index.html?render=1&subs=${opts.subs ?? ''}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 }).catch(() => fail('Composition did not get ready', problems));
const timing = await page.evaluate(() => window.__timing);
mkdirSync(join(ROOT, 'build'), { recursive: true });
writeFileSync(join(ROOT, 'build', 'comp_timing.json'), JSON.stringify(timing, null, 1));

let result;
try {
  if (mode === 'preview') {
    mkdirSync(join(ROOT, 'shots'), { recursive: true });
    const files = [];
    for (const t of arg.split(',').map(Number)) {
      await page.evaluate((x) => window.__seek(x), t);
      const f = join(ROOT, 'shots', `preview_${String(t).replace('.', '_')}.png`);
      await page.screenshot({ path: f });
      files.push(f);
    }
    const list = join(ROOT, 'shots', 'preview_list.txt');
    writeFileSync(list, files.map((f) => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
    const sheet = join(ROOT, 'shots', 'preview_sheet.png');
    const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=640:-1,tile=3x${Math.ceil(files.length / 3)}`, '-frames:v', '1', sheet]);
    result = { sheet: ff.status === 0 ? sheet : null, previews: files.length };
  } else if (mode === 'video') {
    const fps = Number(opts.fps ?? 60);
    const sub = Math.max(1, Math.round(Number(opts.blur ?? 1)));
    const [from, to] = range ?? [0, timing.duration];
    const out = resolve(ROOT, arg);
    mkdirSync(dirname(out), { recursive: true });
    const blend = sub > 1 ? ['-vf', `tmix=frames=${sub},select='not(mod(n+1\\,${sub}))',setpts=N/(${fps}*TB)`] : [];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-c:v', 'mjpeg', '-i', '-',
      ...blend, '-r', String(fps), '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const exited = new Promise((r) => ff.on('close', r));
    let pipeErr = null;
    ff.stdin.on('error', (e) => { pipeErr = e; });
    const n = Math.round((to - from) * fps);
    const t0 = Date.now();
    for (let k = 0; k < n && !pipeErr; k++) {
      for (let j = 0; j < sub && !pipeErr; j++) {
        const t = Math.max(0, from + k / fps + (j - (sub - 1) / 2) / (fps * sub));
        await page.evaluate((x) => window.__seek(x), t);
        const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      if (k % 300 === 0) process.stderr.write(`  frame ${k}/${n} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
    ff.stdin.end();
    const code = await exited;
    if (pipeErr || code !== 0) fail(`ffmpeg failed (exit ${code})`, pipeErr?.message);
    result = { video: out, frames: n, subframes: sub, fps, seconds: (Date.now() - t0) / 1000 };
  } else {
    result = { timing: join(ROOT, 'build', 'comp_timing.json') };
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify({ status: 'success', result, metadata: { duration: timing.duration, problems } }));
