// Scaffold a Motion Studio project: node <skill>/tools/new-project.mjs <dir>
// Copies the template (composition, review player, tools, script.json) into an
// empty or new folder. Then: cd <dir> && npm install && node tools/timeline.mjs && node tools/serve.mjs
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = process.argv[2];
if (!dir || dir === '--help') {
  console.log('usage: node new-project.mjs <dir>');
  process.exit(dir ? 0 : 1);
}
const target = resolve(dir);
if (existsSync(target) && readdirSync(target).length) {
  console.log(JSON.stringify({ status: 'error', error: `${target} is not empty; pick a new folder` }));
  process.exit(1);
}
const TEMPLATE = fileURLToPath(new URL('../template/', import.meta.url));
mkdirSync(target, { recursive: true });
cpSync(TEMPLATE, target, { recursive: true });
for (const d of ['audio/vo', 'build', 'footage', 'shots', 'out']) mkdirSync(join(target, d), { recursive: true });
console.log(JSON.stringify({
  status: 'success',
  result: target,
  next: ['npm install', 'node tools/timeline.mjs', 'node tools/serve.mjs  -> http://127.0.0.1:5199/comp/index.html'],
}));
