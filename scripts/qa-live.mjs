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
  '/lib/corpusStats.js',
  '/components/molecules/hero-entry-paths.js',
  '/components/organisms/friction-demo.js',
  '/styles/molecules/bases-consultadas.css',
  '/styles/molecules/hero-entry-paths.css',
  '/styles/molecules/corpus-stats.css',
  '/styles/organisms/friction-demo.css',
  '/data/fuentes-config.json',
  '/terraza/',
  '/404.html',
  '/leer.html',
  '/archivo.html',
  '/tesis.html',
  '/corpus-citas.html',
  '/privado-login.html',
  '/articulo-fabricar-enemigos.html',
  '/Poemarios/poemas.html',
  '/Poemarios/trabajo-en-sura.html',
  '/terraza-gateway.html',
  '/xml/sitemap.xml',
];

/** Invariantes HTML por página (heurísticas de producto) */
export const HTML_HEURISTICS = {
  'index.html': [
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'home canónica, no redirect' },
    { id: 'grafo-boot', test: (h) => /graphBootstrap\.js|graphChunk\.js/i.test(h), hint: 'monta Grafo B' },
    { id: 'json-surfaces', test: (h) => /siteSurface\.js/i.test(h), hint: 'superficies desde JSON' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
    { id: 'main-landmark', test: (h) => /id=["']main-content["']|id=["']main["']/i.test(h), hint: 'skip link / landmark' },
    { id: 'no-private-paths', test: (h) => !/vault\/|acab\/DOCS/i.test(h), hint: 'sin rutas privadas' },
    { id: 'no-landing', test: (h) => !/landing\.html/i.test(h), hint: 'sin landing obsoleta' },
    { id: 'canonical', test: (h) => /rel=["']canonical["']/i.test(h), hint: 'SEO canonical' },
    { id: 'viewport', test: (h) => /name=["']viewport["']/i.test(h), hint: 'mobile viewport' },
    { id: 'bases-consultadas', test: (h) => /sourceRegistry\.js/i.test(h) && /basesConsultadas\.js/i.test(h), hint: 'estados fuentes onboarding' },
    { id: 'bases-css', test: (h) => /bases-consultadas\.css/i.test(h), hint: 'estilos bases consultadas' },
    { id: 'hero-paths', test: (h) => /hero-entry-paths\.js/i.test(h) && /ca-hero-entry-paths/i.test(h), hint: 'rutas grafo/leer/buscar' },
    { id: 'friction-demo', test: (h) => /friction-demo\.js/i.test(h) && /ca-friction-demo/i.test(h), hint: 'demo fricción precargada' },
    { id: 'corpus-stats', test: (h) => /corpusStats\.js/i.test(h) && /ca-corpus-stats/i.test(h), hint: 'métricas corpus' },
    { id: 'no-json-copy', test: (h) => !/archivo-index\.json/i.test(h), hint: 'copy público sin nombres JSON' },
    { id: 'hero-title', test: (h) => /Contra-archivo/i.test(h) && !/¿Quién es\?/i.test(h), hint: 'H1 portal, no FAQ identidad' },
    { id: 'funnel-hint', test: (h) => /hero-search__hint/i.test(h) && /buscador\.html/i.test(h), hint: 'hint embudo búsqueda avanzada' },
    { id: 'demo-before-search', test: (h) => {
      const demo = h.indexOf('ca-friction-demo');
      const search = h.indexOf('hero-search');
      return demo !== -1 && search !== -1 && demo < search;
    }, hint: 'demo fricción antes del input (DT)' },
    { id: 'onboarding-funnel', test: (h) => /onboarding-search\.js/i.test(h), hint: 'búsqueda preliminar' },
  ],
  'buscador.html': [
    { id: 'huella-lib', test: (h) => /huellaDigital\.js/i.test(h), hint: 'circuito huella' },
    { id: 'buscador-boot', test: (h) => /buscador-boot\.js/i.test(h), hint: 'boot deep-links' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'página real, no stub' },
    { id: 'bases-panel', test: (h) => /basesConsultadasPanel/i.test(h) && /sourceRegistry\.js/i.test(h), hint: 'panel bases consultadas' },
    { id: 'bases-css', test: (h) => /bases-consultadas\.css/i.test(h), hint: 'estilos bases consultadas' },
    { id: 'bases-strip', test: (h) => /ca-buscador-bases-strip/i.test(h), hint: 'strip fuentes sobre el pliegue' },
    { id: 'corpus-stats', test: (h) => /corpusStats\.js/i.test(h) && /ca-buscador-corpus-stats/i.test(h), hint: 'métricas corpus buscador' },
    { id: 'epistemic-legend', test: (h) => /ca-epistemic--hecho/i.test(h), hint: 'leyenda epistémica resultados' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h) && /#main-content/i.test(h), hint: 'accesibilidad skip link' },
  ],
  'contra-archivo-v2.html': [
    { id: 'instrumento-boot', test: (h) => /instrumento-boot\.js/i.test(h), hint: 'instrumento grafo' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'no redirect' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h) && /#main-content/i.test(h), hint: 'accesibilidad' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
  ],
  'contra-archivo.html': [
    { id: 'narrative-renderer', test: (h) => /narrativeRenderer\.js/i.test(h), hint: 'narrativa JSON' },
    { id: 'no-meta-refresh', test: (h) => !/http-equiv=["']refresh/i.test(h), hint: 'no redirect' },
    { id: 'bridge-leer', test: (h) => /leer\.html/i.test(h), hint: 'puente a leer canónico' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h), hint: 'accesibilidad' },
  ],
  'leer.html': [
    { id: 'leer-boot', test: (h) => /leer-boot\.js/i.test(h), hint: 'boot narrativa' },
    { id: 'narrative-renderer', test: (h) => /narrativeRenderer\.js/i.test(h), hint: 'renderer JSON' },
    { id: 'epistemic-badge', test: (h) => /epistemic-badge/i.test(h), hint: 'badges epistémicos' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h) && /#main-content/i.test(h), hint: 'accesibilidad' },
    { id: 'canonical', test: (h) => /rel=["']canonical["']/i.test(h), hint: 'SEO' },
    { id: 'no-json-copy', test: (h) => !/narrativa-rescatada\.json/i.test(h), hint: 'copy sin nombre JSON' },
  ],
  'archivo.html': [
    { id: 'archivo-index', test: (h) => /archivo-index\.json/i.test(h), hint: 'índice editorial' },
    { id: 'corpus-link', test: (h) => /corpus-citas\.html/i.test(h), hint: 'enlace corpus' },
    { id: 'estado-legend', test: (h) => /estado-legend/i.test(h), hint: 'leyenda estados' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h) && /#main-content/i.test(h), hint: 'accesibilidad' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
  ],
  'tesis.html': [
    { id: 'biblioteca-loader', test: (h) => /bibliotecaLoader\.js/i.test(h), hint: 'catálogo dinámico' },
    { id: 'passkey-gate', test: (h) => /passkey\.js/i.test(h) && /privado-login\.html/i.test(h), hint: 'acceso protegido' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h) && /#main-content/i.test(h), hint: 'accesibilidad' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
  ],
  'corpus-citas.html': [
    { id: 'corpus-store', test: (h) => /corpusCitasStore\.js/i.test(h), hint: 'store unificado' },
    { id: 'zuboff-data', test: (h) => /zuboff-citas\.json/i.test(h), hint: 'corpus Zuboff' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav móvil' },
    { id: 'privado-link', test: (h) => /privado-login\.html/i.test(h), hint: 'puente investigador' },
  ],
  'privado-login.html': [
    { id: 'passkey-lib', test: (h) => /passkey\.js/i.test(h), hint: 'WebAuthn' },
    { id: 'aria-live', test: (h) => /aria-live/i.test(h), hint: 'estado accesible' },
    { id: 'main-landmark', test: (h) => /id=["']main-content["']/i.test(h), hint: 'landmark' },
    { id: 'skip-access', test: (h) => /skip-to-content|skip-link/i.test(h), hint: 'skip link' },
    { id: 'public-nav', test: (h) => /buscador\.html/i.test(h), hint: 'salida a público' },
  ],
  '404.html': [
    { id: 'recovery-index', test: (h) => /index\.html/i.test(h), hint: 'recuperación inicio' },
    { id: 'recovery-buscador', test: (h) => /buscador\.html/i.test(h), hint: 'recuperación buscador' },
    { id: 'recovery-login', test: (h) => /privado-login\.html/i.test(h), hint: 'recuperación acceso' },
    { id: 'shared-shell', test: (h) => /shared-shell\.js/i.test(h), hint: 'nav unificada' },
  ],
  'Poemarios/poemas.html': [
    { id: 'main-landmark', test: (h) => /id=["']main-content["']/i.test(h), hint: 'landmark' },
    { id: 'skip-link', test: (h) => /skip-link/i.test(h), hint: 'accesibilidad' },
    { id: 'archivo-link', test: (h) => /archivo\.html|index\.html/i.test(h), hint: 'navegación archivo/inicio' },
  ],
  'login.html': [
    { id: 'redirect-privado', test: (h) => /privado-login\.html/i.test(h), hint: 'consolidación login' },
  ],
  'zuboff-archivo.html': [
    { id: 'redirect-corpus', test: (h) => /corpus-citas\.html/i.test(h), hint: 'redirect corpus' },
  ],
  'citas-attac.html': [
    { id: 'redirect-corpus', test: (h) => /corpus-citas\.html/i.test(h), hint: 'redirect corpus' },
  ],
  'archivo-lecturas.html': [
    { id: 'redirect-corpus', test: (h) => /corpus-citas\.html/i.test(h), hint: 'redirect corpus' },
  ],
  'articulo-fabricar-enemigos.html': [
    { id: 'redirect-leer', test: (h) => /leer\.html#articulo-etnografico/i.test(h), hint: 'artículo en leer' },
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