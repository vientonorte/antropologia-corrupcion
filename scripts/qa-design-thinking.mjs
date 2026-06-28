#!/usr/bin/env node
/**
 * QA Design Thinking — por funcionalidad y viaje de usuario
 *
 *   node scripts/qa-design-thinking.mjs --local
 *   node scripts/qa-design-thinking.mjs --protocol   # imprime pasos manuales
 *   node scripts/qa-design-thinking.mjs --base=https://vientonorte.github.io/antropologia-corrupcion
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HTML_HEURISTICS } from './qa-live.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL = process.argv.includes('--local') || !process.argv.some((a) => a.startsWith('--base='));
const PROTOCOL = process.argv.includes('--protocol');
const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1]
  || 'https://vientonorte.github.io/antropologia-corrupcion';

const journeys = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'qa-journeys.json'), 'utf8'));

const BASE_PAGE_RULES = [
  { id: 'lang-es', test: (h) => /<html[^>]+lang=["']es["']/i.test(h), hint: 'idioma español' },
  { id: 'viewport', test: (h) => /name=["']viewport["']/i.test(h), hint: 'viewport móvil' },
  { id: 'no-vault', test: (h) => !/vault\/|acab\/DOCS/i.test(h), hint: 'sin rutas sensibles' },
];

const REDIRECT_PAGE_RULES = [
  { id: 'has-target', test: (h, target) => target && h.includes(target), hint: 'destino redirect declarado' },
  { id: 'noscript-fallback', test: (h) => /<noscript>|<a href=/i.test(h), hint: 'fallback sin JS' },
];

const REDIRECT_TARGETS = {
  'login.html': 'privado-login.html',
  'zuboff-archivo.html': 'corpus-citas.html',
  'zuboff-citas.html': 'corpus-citas.html',
  'citas-attac.html': 'corpus-citas.html',
  'archivo-lecturas.html': 'corpus-citas.html',
  'articulo-fabricar-enemigos.html': 'leer.html#articulo-etnografico',
  'Poemarios/index.html': 'poemas.html',
};

function readLocal(rel) {
  if (!rel) return null;
  const tries = new Set([
    path.join(ROOT, rel),
    path.join(ROOT, 'web', rel),
    rel.startsWith('web/') ? path.join(ROOT, rel) : null,
    rel.startsWith('data/') || rel.startsWith('src/') ? path.join(ROOT, rel) : null,
  ]);
  for (const p of tries) {
    if (p && fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}

function resolveContent(ref) {
  if (ref.page) return { kind: 'page', path: ref.page, body: readLocal(ref.page) };
  if (ref.file) {
    const rel = ref.file.replace(/^web\//, '');
    const body = readLocal(ref.file) || readLocal(rel) || readLocal(`web/${rel}`);
    return { kind: 'file', path: ref.file, body };
  }
  return { kind: 'unknown', path: '?', body: null };
}

function runPageHeuristics(page, body) {
  const issues = [];
  if (!body) {
    issues.push({ rule: 'file-missing', hint: 'página no encontrada en disco' });
    return issues;
  }

  const isRedirect = Object.prototype.hasOwnProperty.call(REDIRECT_TARGETS, page);
  if (isRedirect) {
    for (const r of REDIRECT_PAGE_RULES) {
      if (!r.test(body, REDIRECT_TARGETS[page])) {
        issues.push({ rule: r.id, hint: r.hint });
      }
    }
    return issues;
  }

  if (page !== '404.html' && !/http-equiv=["']refresh/i.test(body)) {
    for (const r of BASE_PAGE_RULES) {
      if (!r.test(body)) issues.push({ rule: r.id, hint: r.hint });
    }
  }

  const specific = HTML_HEURISTICS[page];
  if (specific) {
    for (const r of specific) {
      if (!r.test(body)) issues.push({ rule: r.id, hint: r.hint });
    }
  }

  return issues;
}

function runCircuitCheck(check) {
  const content = resolveContent(check);
  if (!content.body) {
    return { pass: false, detail: `archivo no encontrado: ${content.path}` };
  }

  if (check.must_not_contain && content.body.includes(check.must_not_contain)) {
    return { pass: false, detail: `contiene prohibido: ${check.must_not_contain}` };
  }

  if (check.before) {
    const idxNeedle = content.body.indexOf(check.needle);
    const idxBefore = content.body.indexOf(check.before);
    if (idxNeedle === -1) return { pass: false, detail: `falta ${check.needle}` };
    if (idxBefore === -1) return { pass: false, detail: `falta ancla ${check.before}` };
    if (idxNeedle > idxBefore) {
      return { pass: false, detail: `${check.needle} debe aparecer antes de ${check.before}` };
    }
    return { pass: true, detail: 'orden OK' };
  }

  if (!content.body.includes(check.needle)) {
    return { pass: false, detail: `falta: ${check.needle}` };
  }
  return { pass: true, detail: 'OK' };
}

function auditJourney(journey) {
  const entry = {
    id: journey.id,
    title: journey.title,
    taxonomy: journey.taxonomy,
    persona: journey.persona,
    empathizar: journey.empatizar,
    definir: journey.definir,
    pages: [],
    circuit: [],
    pass: true,
  };

  const seenPages = {};
  for (const page of journey.pages) {
    if (seenPages[page]) continue;
    seenPages[page] = true;
    const body = readLocal(page);
    const issues = runPageHeuristics(page, body);
    const pageOk = issues.length === 0;
    if (!pageOk) entry.pass = false;
    entry.pages.push({ page, pass: pageOk, issues });
  }

  for (const check of journey.circuit || []) {
    const result = runCircuitCheck(check);
    if (!result.pass) entry.pass = false;
    entry.circuit.push({
      label: check.label,
      pass: result.pass,
      detail: result.detail,
    });
  }

  return entry;
}

function auditCrossNav() {
  const shell = readLocal('shared-shell.js');
  return (journeys.cross_nav || []).map((link) => {
    const body = readLocal(link.from);
    const inPage = !!(body && body.includes(link.needle));
    const usesShell = !!(body && /shared-shell\.js/i.test(body));
    const inShell = !!(shell && shell.includes(link.needle));
    const pass = inPage || (usesShell && inShell);
    return {
      ...link,
      pass,
      via: inPage ? 'page' : usesShell && inShell ? 'shell' : 'missing',
    };
  });
}

function printProtocol() {
  console.log('═'.repeat(64));
  console.log('QA Design Thinking — protocolo manual por viaje');
  console.log('Base:', LOCAL ? '(archivos locales)' : BASE);
  console.log('═'.repeat(64));

  for (const p of journeys.personas) {
    console.log(`\n▸ Persona: ${p.label}`);
    console.log(`  Objetivo: ${p.goal}`);
  }

  for (const j of journeys.journeys) {
    const persona = journeys.personas.find((p) => p.id === j.persona);
    console.log(`\n[${j.id}] ${j.title} (${j.duration_min} min)`);
    console.log(`  Taxonomía: ${j.taxonomy} · Persona: ${persona?.label || j.persona}`);
    console.log(`  Empatizar: ${j.empatizar}`);
    console.log(`  Definir: ${j.definir}`);
    console.log('  Testear:');
    (j.manual || []).forEach((step, i) => console.log(`    ${i + 1}. ${step}`));
  }

  console.log('\n── Gates automatizados ──');
  console.log('  node scripts/qa-design-thinking.mjs --local');
  console.log('  node tests/runner.js');
  console.log('  node scripts/qa-live.mjs --local');
  console.log('');
}

async function main() {
  if (PROTOCOL) {
    printProtocol();
    process.exit(0);
  }

  const report = {
    mode: LOCAL ? 'local' : 'live',
    base: BASE,
    framework: 'design-thinking',
    timestamp: new Date().toISOString(),
    journeys: [],
    cross_nav: [],
    by_taxonomy: {},
    summary: {},
  };

  for (const journey of journeys.journeys) {
    const result = auditJourney(journey);
    report.journeys.push(result);
    if (!report.by_taxonomy[journey.taxonomy]) {
      report.by_taxonomy[journey.taxonomy] = { total: 0, pass: 0 };
    }
    report.by_taxonomy[journey.taxonomy].total += 1;
    if (result.pass) report.by_taxonomy[journey.taxonomy].pass += 1;
  }

  report.cross_nav = auditCrossNav();
  const crossFails = report.cross_nav.filter((l) => !l.pass).length;
  const journeyFails = report.journeys.filter((j) => !j.pass).length;

  report.summary = {
    pass: journeyFails === 0 && crossFails === 0,
    journeys_total: report.journeys.length,
    journeys_pass: report.journeys.length - journeyFails,
    journeys_fail: journeyFails,
    cross_nav_fail: crossFails,
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.pass ? 0 : 1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();