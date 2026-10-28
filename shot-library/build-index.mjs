#!/usr/bin/env node
// Inlines cards.json into index.html so the viewer works offline from a file:// URL.
//   node shot-library/build-index.mjs
// Run it after every edit to cards.json. The data sits in <script type="application/json" id="data">.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(dir, 'cards.json'), 'utf8'));
// Escape everything that could end the script element or confuse a parser.
const json = JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .split(String.fromCharCode(0x2028)).join('\\u2028')
  .split(String.fromCharCode(0x2029)).join('\\u2029');

const file = join(dir, 'index.html');
const html = readFileSync(file, 'utf8');
const re = /(<script type="application\/json" id="data">)[\s\S]*?(<\/script>)/;
if (!re.test(html)) throw new Error('data script element not found in index.html');
writeFileSync(file, html.replace(re, (_, open, close) => open + json + close));
console.log(`Inlined ${data.cards.length} cards (${(json.length / 1024).toFixed(0)} KB) into shot-library/index.html`);
