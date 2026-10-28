#!/usr/bin/env node
// Install the personal skills from this repo into ~/.claude/skills/, plus the vendored third-party
// skills in third_party/<project>/skills/ (copied from upstream, never edited here; see UPSTREAM.md).
//
//   node tools/install-skills.mjs              install every folder in skills/ and third_party/*/skills/
//   node tools/install-skills.mjs --dry-run    show what would happen, change nothing
//   node tools/install-skills.mjs motion-review remotion-studio    only these skills
//
// An existing installed skill that differs is moved to ~/.claude/skills/.backup/<name>-<UTC timestamp>/
// first, then replaced by a fresh copy (so files deleted in the repo disappear from the install too).
// An installed skill identical to the repo copy is left alone.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('usage: node tools/install-skills.mjs [--dry-run] [skill-name ...]');
  process.exit(0);
}
const dryRun = args.includes('--dry-run');
const only = args.filter((a) => !a.startsWith('--'));

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(REPO, 'skills');
const THIRD = join(REPO, 'third_party');
const DEST = join(homedir(), '.claude', 'skills');
const BACKUP = join(DEST, '.backup');
const SKIP = new Set(['node_modules', '.git', '.DS_Store', '__pycache__']);
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'); // 20261022T103000Z

function files(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...files(p, base));
    else out.push(relative(base, p).replace(/\\/g, '/'));
  }
  return out.sort();
}

function digest(dir) {
  const h = createHash('sha256');
  for (const f of files(dir)) h.update(f).update('\0').update(readFileSync(join(dir, f))).update('\0');
  return h.digest('hex');
}

if (!existsSync(SRC)) {
  console.error(`No skills/ folder at ${SRC}`);
  process.exit(1);
}
const dirs = (dir) => readdirSync(dir).filter((n) => !n.startsWith('.') && statSync(join(dir, n)).isDirectory());

// name -> { from, source }: personal skills first, then third_party/<project>/skills/<name>
const sources = new Map();
for (const name of dirs(SRC)) sources.set(name, { from: join(SRC, name), source: 'skills' });
if (existsSync(THIRD)) {
  for (const project of dirs(THIRD)) {
    const root = join(THIRD, project, 'skills');
    if (!existsSync(root)) continue;
    for (const name of dirs(root)) {
      const source = `third_party/${project}`;
      if (sources.has(name)) {
        console.error(`Skill name clash: "${name}" is in both ${sources.get(name).source} and ${source}. Rename one.`);
        process.exit(1);
      }
      sources.set(name, { from: join(root, name), source });
    }
  }
}
const skills = [...sources.keys()];
const unknown = only.filter((n) => !sources.has(n));
if (unknown.length) {
  console.error(`Unknown skill(s): ${unknown.join(', ')}. Available: ${skills.join(', ')}`);
  process.exit(1);
}
const selected = only.length ? only : skills;

console.log(`${dryRun ? '[dry run] ' : ''}Installing ${selected.length} skill(s) from ${REPO} (skills/, third_party/*/skills/)`);
console.log(`  into ${DEST}\n`);
if (!dryRun) mkdirSync(DEST, { recursive: true });

const report = [];
for (const name of selected) {
  const { from, source } = sources.get(name);
  const to = join(DEST, name);
  if (!existsSync(join(from, 'SKILL.md'))) {
    console.log(`  skip      ${name}  (no SKILL.md, from ${source})`);
    report.push({ name, action: 'skipped', reason: 'no SKILL.md' });
    continue;
  }
  const count = files(from).length;
  let action = 'install';
  let backup = null;
  if (existsSync(to)) {
    if (digest(from) === digest(to)) {
      console.log(`  same      ${name}  (${count} files, from ${source}, already up to date)`);
      report.push({ name, source, action: 'unchanged', files: count });
      continue;
    }
    action = 'update';
    backup = join(BACKUP, `${name}-${stamp}`);
    if (!dryRun) {
      mkdirSync(BACKUP, { recursive: true });
      renameSync(to, backup);
    }
  }
  if (!dryRun) cpSync(from, to, { recursive: true, filter: (p) => !SKIP.has(p.split(/[\\/]/).pop()) });
  console.log(`  ${action.padEnd(9)} ${name}  (${count} files, from ${source})${backup ? `\n            previous version backed up to ${backup}` : ''}`);
  report.push({ name, source, action, files: count, backup });
}

const changed = report.filter((r) => r.action === 'install' || r.action === 'update').length;
console.log(`\n${dryRun ? '[dry run] would change' : 'Changed'} ${changed} of ${report.length}; ${report.filter((r) => r.action === 'unchanged').length} unchanged.`);
if (!dryRun && changed) console.log('Start a new Claude Code session (or reload skills) to pick up the changes.');
