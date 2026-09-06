#!/usr/bin/env node
/**
 * Merge de export corpus-citas JSON → data/clave-a-citas.json
 * Solo clave A / source_type bujo. No OCR. No inventa texto.
 *
 *   node scripts/merge-clave-a-export.mjs [export.json]
 *   node scripts/merge-clave-a-export.mjs --dry-run ~/Downloads/corpus-citas-2026-09-06.json
 *
 * Default: el corpus-citas-*.json más reciente en ~/Downloads
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data/clave-a-citas.json');
const DRY = process.argv.includes('--dry-run');
const CLINICAL = ['paranoia', 'disociación', 'disociacion', 'kit tlp', 'anakaren'];

function latestDownload() {
  const dir = join(homedir(), 'Downloads');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((n) => /^corpus-citas-.*\.json$/i.test(n))
    .map((n) => join(dir, n))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return files[0] || null;
}

const args = process.argv.slice(2).filter((a) => a !== '--dry-run');
const src = args[0] || latestDownload();
if (!src || !existsSync(src)) {
  console.error('NO DATO: pasá un JSON de Exportar (corpus-citas-YYYY-MM-DD.json)');
  console.error('  node scripts/merge-clave-a-export.mjs ~/Downloads/corpus-citas-….json');
  process.exit(2);
}

function asList(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.citas)) return raw.citas;
  return [];
}

function isClaveA(c) {
  return c?.clave === 'A' || c?.source_type === 'bujo';
}

function complete(c) {
  const fields = ['text', 'color', 'category'];
  if (!fields.every((k) => String(c?.[k] ?? '').trim())) return false;
  if (c.pageNo === undefined || c.pageNo === null || c.pageNo === '') return false;
  return Number.isFinite(Number(c.pageNo));
}

function clinical(c) {
  const blob = JSON.stringify(c).toLowerCase();
  return CLINICAL.some((w) => blob.includes(w));
}

const incoming = asList(JSON.parse(readFileSync(src, 'utf8')));
const existing = existsSync(OUT) ? asList(JSON.parse(readFileSync(OUT, 'utf8'))) : [];
const byId = new Map(existing.map((c) => [Number(c.id), c]));
let nextId = existing.reduce((m, c) => Math.max(m, Number(c.id) || 0), 3999) + 1;
if (nextId < 4001) nextId = 4001;

let added = 0;
let skipped = 0;
for (const c of incoming) {
  if (!isClaveA(c)) {
    skipped += 1;
    continue;
  }
  if (!complete(c) || !String(c.text || '').trim()) {
    console.warn('SKIP incompleto', c.id || '(sin id)');
    skipped += 1;
    continue;
  }
  if (clinical(c)) {
    console.warn('SKIP clínico', c.id || '(sin id)');
    skipped += 1;
    continue;
  }
  const item = {
    id: Number(c.id) || nextId,
    bookTitle: c.bookTitle || 'Bullet Ro',
    author: c.author || 'Rö',
    pageNo: Number(c.pageNo),
    text: String(c.text).trim(),
    color: c.color,
    category: c.category,
    notes: c.notes || c.notas || '',
    source_type: 'bujo',
    source_session: c.source_session || new Date().toISOString().slice(0, 10),
    clave: 'A',
    timestamp: c.timestamp || new Date().toISOString(),
  };
  if (!Number(c.id)) nextId += 1;
  if (byId.has(item.id)) {
    skipped += 1;
    continue;
  }
  byId.set(item.id, item);
  added += 1;
}

const out = [...byId.values()].sort((a, b) => a.id - b.id);
if (DRY) {
  console.log(`DRY src=${src} incoming=${incoming.length} add=${added} skip=${skipped} out=${out.length}`);
  process.exit(0);
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`OK merge ${src} → data/clave-a-citas.json add=${added} skip=${skipped} n=${out.length}`);
