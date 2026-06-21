#!/usr/bin/env node
/**
 * Auditoría evolutiva Atomic Design + DevOps E2E
 *
 *   node scripts/atomic-audit.mjs --local
 *   node scripts/atomic-audit.mjs   # incluye heurísticas live en superficies tier partial+
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL = process.argv.includes('--local');
const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1]
  || 'https://vientonorte.github.io/antropologia-corrupcion';

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function readWebPage(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function layerViolations() {
  const rules = [
    { layer: 'atoms', dir: 'web/components/atoms', forbidden: [/CAMolecules/i, /CAOrganisms/i, /components\/molecules/i, /components\/organisms/i] },
    { layer: 'molecules', dir: 'web/components/molecules', forbidden: [/CAOrganisms/i, /components\/organisms/i] },
  ];
  const violations = [];
  for (const rule of rules) {
    const abs = path.join(ROOT, rule.dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of fs.readdirSync(abs).filter((f) => f.endsWith('.js'))) {
      const content = fs.readFileSync(path.join(abs, file), 'utf8');
      for (const re of rule.forbidden) {
        if (re.test(content)) {
          violations.push({ layer: rule.layer, file: `${rule.dir}/${file}`, pattern: re.source });
        }
      }
    }
  }
  return violations;
}

function componentInventory(registry) {
  const missing = [];
  for (const [layer, items] of Object.entries(registry.components)) {
    for (const item of items) {
      if (item.js && !fileExists(item.js)) missing.push({ layer, id: item.id, path: item.js });
      if (item.css && !fileExists(item.css)) missing.push({ layer, id: item.id, path: item.css, kind: 'css' });
    }
  }
  return missing;
}

function surfaceAudit(registry) {
  const results = [];
  for (const s of registry.surfaces) {
    const html = readWebPage(s.path);
    const entry = {
      surface: s.surface,
      path: s.path,
      maturity: s.maturity,
      wave: s.wave,
      issues: [],
    };
    if (!html) {
      entry.issues.push('archivo HTML no encontrado');
      results.push(entry);
      continue;
    }
    if (s.maturity === 'partial' || s.maturity === 'full') {
      for (const script of s.required_scripts || []) {
        if (!html.includes(script)) entry.issues.push(`falta script ${script}`);
      }
      for (const style of s.required_styles || []) {
        if (style.endsWith('/')) {
          if (!html.includes(style.replace('styles/', 'styles/'))) {
            const prefix = style.split('/').filter(Boolean).pop();
            if (!html.includes(`styles/${prefix}/`) && !html.includes(style)) {
              entry.issues.push(`falta stylesheet ${style}`);
            }
          }
        } else if (!html.includes(style)) {
          entry.issues.push(`falta stylesheet ${style}`);
        }
      }
      if (s.boot && !html.includes(path.basename(s.boot))) {
        entry.issues.push(`falta boot ${s.boot}`);
      }
    }
    if (s.maturity === 'legacy') {
      const inlineStyle = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('').length;
      if (inlineStyle > 8000) entry.debt = `${inlineStyle} chars en <style> inline (wave ${s.wave})`;
    }
    results.push(entry);
  }
  return results;
}

function sprintProgress(registry) {
  const waves = registry.sprint.waves;
  const done = waves.filter((w) => w.status === 'done').length;
  const inProgress = waves.filter((w) => w.status === 'in_progress').length;
  const surfaces = registry.surfaces;
  const mature = surfaces.filter((s) => s.maturity === 'full').length;
  const partial = surfaces.filter((s) => s.maturity === 'partial').length;
  const legacy = surfaces.filter((s) => s.maturity === 'legacy').length;
  return {
    waves: { total: waves.length, done, in_progress: inProgress, pending: waves.length - done - inProgress },
    surfaces: { total: surfaces.length, full: mature, partial, legacy },
    evolution_pct: Math.round(((done + inProgress * 0.5) / waves.length) * 100),
  };
}

async function liveSurfaceScripts(registry) {
  if (LOCAL) return [];
  const partial = registry.surfaces.filter((s) => s.maturity === 'partial' || s.maturity === 'full');
  const failures = [];
  for (const s of partial) {
    const url = `${BASE}/${s.path.replace(/^web\//, '')}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'vn-atomic-audit/1.0' } });
      if (res.status !== 200) {
        failures.push({ surface: s.surface, url, status: res.status });
        continue;
      }
      const html = await res.text();
      for (const script of s.required_scripts || []) {
        if (!html.includes(script)) {
          failures.push({ surface: s.surface, url, missing: script });
        }
      }
    } catch (e) {
      failures.push({ surface: s.surface, url, error: e.message });
    }
  }
  return failures;
}

async function main() {
  const registry = readJson('data/atomic-registry.json');
  const report = {
    mode: LOCAL ? 'local' : 'live',
    base: BASE,
    timestamp: new Date().toISOString(),
    sprint: sprintProgress(registry),
    layer_violations: layerViolations(),
    missing_components: componentInventory(registry),
    surfaces: surfaceAudit(registry),
    live: LOCAL ? null : await liveSurfaceScripts(registry),
  };

  const surfaceFails = report.surfaces.filter((s) => (s.issues || []).length > 0).length;
  const legacyDebt = report.surfaces.filter((s) => s.debt).map((s) => ({ surface: s.surface, debt: s.debt }));
  const liveFails = (report.live || []).length;
  report.legacy_debt = legacyDebt;
  report.summary = {
    pass: report.layer_violations.length === 0
      && report.missing_components.length === 0
      && surfaceFails === 0
      && liveFails === 0,
    layer_violations: report.layer_violations.length,
    missing_components: report.missing_components.length,
    surface_failures: surfaceFails,
    legacy_debt_count: legacyDebt.length,
    live_failures: liveFails,
    evolution_pct: report.sprint.evolution_pct,
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.pass ? 0 : 1);
}

main();