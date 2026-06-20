#!/usr/bin/env node
/**
 * Elimina copias accidentales de Finder ("archivo 2.ext") cuando existe el original.
 * Uso: node scripts/clean-finder-duplicates.mjs [--dry-run] [dir...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliArgs = process.argv.slice(2);
const DRY = cliArgs.includes('--dry-run');
const dirs = cliArgs.filter((a) => !a.startsWith('--'));
const TARGETS = dirs.length
  ? dirs.map((d) => path.resolve(ROOT, d))
  : [
      path.join(ROOT, 'docs/Estado del Arte'),
      path.join(ROOT, 'Estado del Arte'),
      path.join(ROOT, 'Ensayo Traducción de Saberes'),
    ];

const DUP_RE = /^(.+) ([2-9])(\.[^.]+)$/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

let removed = 0;
let kept = 0;

for (const base of TARGETS) {
  for (const file of walk(base)) {
    const baseName = path.basename(file);
    const m = baseName.match(DUP_RE);
    if (!m) continue;
    const original = path.join(path.dirname(file), `${m[1]}${m[3]}`);
    if (!fs.existsSync(original)) {
      kept += 1;
      continue;
    }
    if (DRY) {
      console.log(`[dry-run] delete ${path.relative(ROOT, file)}`);
    } else {
      fs.unlinkSync(file);
      console.log(`deleted ${path.relative(ROOT, file)}`);
    }
    removed += 1;
  }
}

console.log(JSON.stringify({ dryRun: DRY, removed, keptWithoutOriginal: kept }, null, 2));