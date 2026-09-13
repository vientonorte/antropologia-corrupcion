#!/usr/bin/env node
/**
 * Asegura stubs editoriales: Salazar [] (no 404), clave-a array.
 * No inventa citas.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const DRY = process.argv.includes('--dry-run');

function loadArray(name) {
  const p = join(DATA, name);
  if (!existsSync(p)) return { path: p, data: null, missing: true };
  const raw = JSON.parse(readFileSync(p, 'utf8'));
  const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.citas) ? raw.citas : null;
  return { path: p, data: arr, missing: false };
}

let wrote = 0;
const salazar = loadArray('salazar-citas.json');
if (salazar.missing || !Array.isArray(salazar.data)) {
  if (DRY) {
    console.log('DRY would write data/salazar-citas.json []');
  } else {
    writeFileSync(salazar.path, '[]\n');
    console.log('OK wrote data/salazar-citas.json []');
  }
  wrote += 1;
} else {
  console.log(`OK data/salazar-citas.json n=${salazar.data.length}`);
}

const claveA = loadArray('clave-a-citas.json');
if (claveA.missing || !Array.isArray(claveA.data)) {
  if (DRY) {
    console.log('DRY would write data/clave-a-citas.json []');
  } else {
    writeFileSync(claveA.path, '[]\n');
    console.log('OK wrote data/clave-a-citas.json []');
  }
  wrote += 1;
} else {
  console.log(`OK data/clave-a-citas.json n=${claveA.data.length}`);
}

console.log(`ensure-editorial-stubs wrote=${wrote}`);
