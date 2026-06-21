#!/usr/bin/env node
/**
 * Auditoría live post-deploy — heurísticas DevOps
 *
 * Uso:
 *   node scripts/qa-live.mjs
 *   node scripts/qa-live.mjs --base=https://vientonorte.github.io/antropologia-corrupcion
 *   node scripts/qa-live.mjs --local   # valida web/ sin red (pre-deploy)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCAL = process.argv.includes('--local');
const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1]
  || 'https://vientonorte.github.io/antropologia-corrupcion';
const MAX_MS = Number(process.argv.find((a) => a.startsWith('--timeout='))?.split('=')[1] || 8000);

/** Rutas críticas — 200 obligatorio */
export const CRITICAL_PATHS = [
  '/',
  '/index.html',
  '/buscador.html',
  '/contra-archivo-v2.html',
  '/contra-archivo.html',
  '/leer.html',
  '/archivo.html',
  '/manifest.json',
  '/shared-shell.js',
  '/styles/shared.css',
  '/styles/graph.css',
  '/data/archivo-index.json',
  '/data/narrativa-rescatada.json',
  '/src/graphBootstrap.js',
  '/src/frictionEngine.js',
  '/src/tokens.js',
  '/src/socialField.js',
  '/vendor/d3.min.js',
  '/lib/sourceRegistry.js',
  '/lib/basesConsultadas.js',
  '/lib/dataLoader.js',
  '/styles/molecules/bases-consultadas.css',
  '/data/fuentes-config.json',
  '/terraza/',
  '/404.html',
  '/xml/sitemap.xml',
];

/** Invariantes HTML por página (heurísticas de producto) */
export const HTML_HEURISTICS = {
  'index.html': [
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'home canónica, no redirect' },
    { id: 'grafo-boot', test: (h) => /graphBootstrap\.js/i.test(h), hint: 'monta Grafo B' },
    { id: 'json-surfaces', test: (h) => /siteSurface\.js/i.test(h), hint: 'superficies desde JSON' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
    { id: 'main-landmark', test: (h) => /id=["']main-content["']|id=["']main["']/i.test(h), hint: 'skip link / landmark' },
    { id: 'no-private-paths', test: (h) => !/vault\/|acab\/DOCS/i.test(h), hint: 'sin rutas privadas' },
    { id: 'no-landing', test: (h) => !/landing\.html/i.test(h), hint: 'sin landing obsoleta' },
    { id: 'canonical', test: (h) => /rel=["']canonical["']/i.test(h), hint: 'SEO canonical' },
    { id: 'viewport', test: (h) => /name=["']viewport["']/i.test(h), hint: 'mobile viewport' },
    { id: 'bases-consultadas', test: (h) => /sourceRegistry\.js/i.test(h) && /basesConsultadas\.js/i.test(h), hint: 'estados fuentes onboarding' },
    { id: 'bases-css', test: (h) => /bases-consultadas\.css/i.test(h), hint: 'estilos bases consultadas' },
  ],
  'buscador.html': [
    { id: 'huella-lib', test: (h) => /huellaDigital\.js/i.test(h), hint: 'circuito huella' },
    { id: 'buscador-boot', test: (h) => /buscador-boot\.js/i.test(h), hint: 'boot deep-links' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'página real, no stub' },
    { id: 'bases-panel', test: (h) => /basesConsultadasPanel/i.test(h) && /sourceRegistry\.js/i.test(h), hint: 'panel bases consultadas' },
    { id: 'bases-css', test: (h) => /bases-consultadas\.css/i.test(h), hint: 'estilos bases consultadas' },
  ],
  'contra-archivo-v2.html': [
    { id: 'instrumento-boot', test: (h) => /instrumento-boot\.js/i.test(h), hint: 'instrumento grafo' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'no redirect' },
  ],
  'contra-archivo.html': [
    { id: 'narrative-renderer', test: (h) => /narrativeRenderer\.js/i.test(h), hint: 'narrativa JSON' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'no redirect' },
  ],
};

/** Invariantes en assets JS */
export const JS_HEURISTICS = {
  'shared-shell.js': [
    { id: 'bottom-nav', test: (s) => /bottom-nav|ca-bottom-nav/i.test(s), hint: 'nav móvil' },
    { id: 'inject-nav', test: (s) => /inject|renderNav|site-nav/i.test(s), hint: 'inyección de shell' },
  ],
};

/** JSON esperado en data/ */
export const JSON_HEURISTICS = {
  'archivo-index.json': (data) => {
    const issues = [];
    const entries = data?.entries;
    if (!Array.isArray(entries) || entries.length === 0) issues.push('entries vacío');
    else {
      for (const e of entries) {
        if (!e.estado) issues.push(`entrada ${e.id || '?'} sin estado`);
      }
      const ids = entries.map((e) => e.id);
      if (!ids.includes('ficha-c03-protocolo-documentacion')) issues.push('falta ficha C03');
    }
    return issues;
  },
  'narrativa-rescatada.json': (data) => {
    const issues = [];
    if (!data?.presentacion_00) issues.push('falta presentacion_00 (N1)');
    if (!data?.protocolo_traduccion) issues.push('falta protocolo_traduccion (N2)');
    return issues;
  },
  'fuentes-config.json': (data) => {
    const issues = [];
    const sources = data?.sources;
    if (!Array.isArray(sources) || sources.length === 0) issues.push('sources vacío');
    else {
      const mvp = sources.filter((s) => s.estado === 'mvp' && s.activa !== false);
      if (mvp.length < 5) issues.push('pocas fuentes mvp activas');
      for (const s of sources) {
        if (!s.estado) issues.push(`fuente ${s.id || '?'} sin estado pipeline`);
      }
    }
    return issues;
  },
};

function localPathForUrl(url) {
  let rel = url.replace(BASE, '').replace(/^\//, '');
  if (!rel) rel = 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const webPath = path.join(ROOT, 'web', rel);
  const rootPath = path.join(ROOT, rel);
  if (['data/', 'img/', 'xml/', 'src/', 'styles/', 'js/', 'components/'].some((p) => rel.startsWith(p))) {
    return fs.existsSync(rootPath) ? rootPath : webPath;
  }
  if (rel === 'shared-shell.js') {
    return fs.existsSync(webPath) ? webPath : rootPath;
  }
  if (rel === 'terraza/index.html') {
    const gw = path.join(ROOT, 'web', 'terraza-gateway.html');
    if (fs.existsSync(gw)) return gw;
    return path.join(ROOT, 'terraza', 'index.html');
  }
  return fs.existsSync(webPath) ? webPath : rootPath;
}

async function loadResource(urlPath) {
  const url = `${BASE}${urlPath}`;
  if (LOCAL) {
    const filePath = localPathForUrl(url);
    if (!fs.existsSync(filePath)) {
      return { url, status: 404, body: '', ms: 0, filePath };
    }
    return { url, status: 200, body: fs.readFileSync(filePath, 'utf8'), ms: 0, filePath };
  }
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAX_MS);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: { 'User-Agent': 'vn-qa-live/1.0' } });
    const body = res.status < 400 ? await res.text().catch(() => '') : '';
    return { url, status: res.status, body, ms: Date.now() - t0, location: res.headers.get('location') };
  } catch (e) {
    return { url, status: 0, body: '', ms: Date.now() - t0, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

function pageNameFromPath(urlPath) {
  if (urlPath === '/' || urlPath === '') return 'index.html';
  const base = urlPath.replace(/^\//, '');
  return base.endsWith('/') ? `${base}index.html` : base;
}

function runHtmlHeuristics(page, body) {
  const rules = HTML_HEURISTICS[page];
  if (!rules) return [];
  return rules
    .filter((r) => !r.test(body))
    .map((r) => ({ page, rule: r.id, hint: r.hint }));
}

function runJsHeuristics(asset, body) {
  const rules = JS_HEURISTICS[asset];
  if (!rules) return [];
  return rules
    .filter((r) => !r.test(body))
    .map((r) => ({ asset, rule: r.id, hint: r.hint }));
}

async function auditManifest() {
  const r = await loadResource('/manifest.json');
  const issues = [];
  if (r.status !== 200) {
    issues.push({ check: 'manifest-status', detail: `HTTP ${r.status}` });
    return issues;
  }
  let data;
  try {
    data = JSON.parse(r.body);
  } catch {
    issues.push({ check: 'manifest-json', detail: 'JSON inválido' });
    return issues;
  }
  if (data.start_url !== '/antropologia-corrupcion/index.html') {
    issues.push({ check: 'manifest-start-url', detail: `esperado /antropologia-corrupcion/index.html, got ${data.start_url}` });
  }
  if (data.scope !== '/antropologia-corrupcion/') {
    issues.push({ check: 'manifest-scope', detail: `scope incorrecto: ${data.scope}` });
  }
  if (!data.display) issues.push({ check: 'manifest-display', detail: 'falta display' });
  return issues;
}

async function auditSitemap() {
  const r = await loadResource('/xml/sitemap.xml');
  const issues = [];
  if (r.status !== 200) {
    issues.push({ check: 'sitemap-status', detail: `HTTP ${r.status}` });
    return issues;
  }
  if (/landing\.html/i.test(r.body)) issues.push({ check: 'sitemap-landing', detail: 'contiene landing.html obsoleta' });
  if (!/index\.html/i.test(r.body)) issues.push({ check: 'sitemap-index', detail: 'falta index.html' });
  return issues;
}

async function main() {
  const report = {
    mode: LOCAL ? 'local' : 'live',
    base: BASE,
    timestamp: new Date().toISOString(),
    paths: { checked: 0, ok: 0, failures: [] },
    latency: { slow: [] },
    heuristics: { html: [], js: [], json: [], manifest: [], sitemap: [] },
    links: null,
  };

  for (const p of CRITICAL_PATHS) {
    report.paths.checked += 1;
    const r = await loadResource(p);
    if (r.status === 200) report.paths.ok += 1;
    else {
      report.paths.failures.push({ path: p, status: r.status, error: r.error, location: r.location });
    }
    if (!LOCAL && r.ms > 5000) {
      report.latency.slow.push({ path: p, ms: r.ms });
    }

    const page = pageNameFromPath(p);
    if (r.status === 200 && page.endsWith('.html')) {
      report.heuristics.html.push(...runHtmlHeuristics(page, r.body));
    }
    if (r.status === 200 && page.endsWith('.js')) {
      report.heuristics.js.push(...runJsHeuristics(page, r.body));
    }
    if (r.status === 200 && page.endsWith('.json') && JSON_HEURISTICS[page]) {
      try {
        const data = JSON.parse(r.body);
        for (const msg of JSON_HEURISTICS[page](data)) {
          report.heuristics.json.push({ file: page, detail: msg });
        }
      } catch {
        report.heuristics.json.push({ file: page, detail: 'JSON inválido' });
      }
    }
  }

  // shared-shell heuristics (path distinto a /src/)
  const shell = await loadResource('/shared-shell.js');
  if (shell.status === 200) {
    report.heuristics.js.push(...runJsHeuristics('shared-shell.js', shell.body));
  }

  report.heuristics.manifest = await auditManifest();
  report.heuristics.sitemap = await auditSitemap();

  // Reutilizar qa-links en modo live (crawl interno)
  if (!LOCAL) {
    const links = spawnSync(process.execPath, [
      path.join(ROOT, 'scripts', 'qa-links.mjs'),
      `--base=${BASE}`,
    ], { encoding: 'utf8', cwd: ROOT });
    try {
      const parsed = JSON.parse(links.stdout.trim());
      report.links = {
        checked: parsed.checked,
        ok: parsed.ok,
        broken: parsed.internalBroken?.length || 0,
        stale: parsed.staleLiveLinks?.length || 0,
      };
      if (parsed.internalBroken?.length) {
        report.paths.failures.push(...parsed.internalBroken.map((b) => ({
          path: b.url.replace(BASE, ''),
          status: b.status,
          source: 'qa-links',
        })));
      }
    } catch {
      report.links = { error: links.stderr || links.stdout || 'qa-links falló' };
    }
  }

  const heuristicFails =
    report.heuristics.html.length
    + report.heuristics.js.length
    + report.heuristics.json.length
    + report.heuristics.manifest.length
    + report.heuristics.sitemap.length;

  report.summary = {
    pass: report.paths.failures.length === 0 && heuristicFails === 0,
    pathFailures: report.paths.failures.length,
    heuristicFailures: heuristicFails,
    slowPaths: report.latency.slow.length,
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.summary.pass ? 0 : 1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();