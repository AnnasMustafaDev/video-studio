#!/usr/bin/env node
// Print one prompt-motion.com entry: title, tags, type, author, model, effort, date, URL and the full prompt.
//
//   node show.mjs <url-or-slug> [--json]
import { CREDIT_LINE, SITE, fetchText, formatEntry, parseEntry } from './lib.mjs';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
if (!target || args.includes('--help') || args.includes('-h')) {
  console.log('usage: node show.mjs <https://prompt-motion.com/<slug> | slug> [--json]');
  process.exit(target ? 0 : 1);
}

try {
  const url = new URL(target.startsWith('http') ? target : `/${target.replace(/^\//, '')}`, SITE);
  const entry = parseEntry(await fetchText(url.href), url.href);
  if (args.includes('--json')) console.log(JSON.stringify({ credit: CREDIT_LINE, ...entry }, null, 2));
  else console.log(`${formatEntry(entry)}\n\n${CREDIT_LINE}`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1; // not process.exit(): it can abort while fetch sockets close on Windows
}
