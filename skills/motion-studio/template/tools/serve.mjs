// Review server: node tools/serve.mjs [port]  → http://127.0.0.1:5199/comp/index.html
// Serves only the folders the page needs, with HTTP range support (audio scrubbing).
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const SERVED = ['comp', 'build', 'audio', 'assets', 'footage', 'node_modules'].map((d) => join(ROOT, d) + sep).concat([join(ROOT, 'script.json')]);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

export function handler(req, res) {
  let p;
  try {
    p = normalize(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  } catch {
    return res.writeHead(400).end();
  }
  if (p === normalize(ROOT)) return res.writeHead(302, { Location: '/comp/index.html' }).end();
  if (!SERVED.some((d) => p === d || p.startsWith(d))) return res.writeHead(404).end();
  // audio that doesn't exist yet: 204, so the player falls back quietly (no console error)
  if (!existsSync(p) && /\.(wav|mp3)$/.test(p)) return res.writeHead(204).end();
  if (!existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
  const size = statSync(p).size;
  const type = TYPES[extname(p)] ?? 'application/octet-stream';
  if (req.method === 'HEAD') return res.writeHead(200, { 'Content-Type': type, 'Content-Length': size }).end();
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  if (range) {
    const a = range[1] ? Number(range[1]) : 0;
    const b = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
    return createReadStream(p, { start: a, end: b }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  createReadStream(p).pipe(res);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const port = Number(process.argv[2] ?? 5199);
  createServer(handler).listen(port, '127.0.0.1', () => console.log(`review player: http://127.0.0.1:${port}/comp/index.html`));
}
