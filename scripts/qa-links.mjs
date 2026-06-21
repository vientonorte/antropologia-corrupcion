#!/usr/bin/env node
/**
 * QA de enlaces — antropologia-corrupcion
 * Uso:
 *   node scripts/qa-links.mjs --local
 *   node scripts/qa-links.mjs --base=https://vientonorte.github.io/antropologia-corrupcion
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCAL = process.argv.includes('--local');
const DEPLOYED = process.argv.includes('--deployed');
const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1]
  || 'https://vientonorte.github.io/antropologia-corrupcion';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = DEPLOYED ? ROOT : path.join(ROOT, 'web');

const SEED_PATHS = [
  '/',
  '/landing.html',
  '/index.html',
  '/buscador.html',
  '/archivo.html',
  '/tesis.html',
  '/contra-archivo.html',
  '/contra-archivo-v2.html',
  '/zuboff-archivo.html',
  '/zuboff-citas.html',
  '/citas-attac.html',
  '/login.html',
  '/privado-login.html',
  '/manifest.json',
  '/data/archivo-index.json',
  '/data/zuboff-citas.json',
  '/data/attac-citas.json',
  '/data/corpus-categorias.json',
  '/styles/shared.css',
  '/styles/graph.css',
  '/img/evidencia-reservada.svg',
  '/src/frictionEngine.js',
  '/shared-shell.js',
  '/js/lectura-clave-b.js',
];

const HREF_RE = /(?:href|src)=["']([^"'#]+)["']/gi;
const META_REFRESH_RE = /http-equiv=["']refresh["'][^>]*content=["'][^;"']*;\s*url=([^"'>\s]+)/gi;
const FETCH_JSON_RE = /fetch(?:Json)?\s*\(\s*['"`]([^'"`]+)['"`]/g;

function normalizeInternal(raw, pageUrl) {
  if (!raw || raw.startsWith('data:') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return null;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (raw.startsWith(BASE)) return raw.split('#')[0].split('?')[0];
    return raw.split('#')[0].split('?')[0];
  }
  const basePath = new URL(pageUrl).pathname.replace(/\/[^/]*$/, '/');
  const joined = raw.startsWith('/') ? raw : path.posix.join(basePath, raw);
  const rel = joined.replace(/^\/antropologia-corrupcion/, '') || '/';
  return `${BASE}${rel.startsWith('/') ? rel : `/${rel}`}`.split('#')[0].split('?')[0];
}

function urlToLocalPath(url) {
  let rel = url.replace(BASE, '').replace(/^\//, '');
  if (!rel) rel = 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const htmlRoot = DEPLOYED ? ROOT : path.join(ROOT, 'web');
  const alwaysRoot = ['data/', 'img/', 'xml/', 'src/', 'manifest.json'];
  if (alwaysRoot.some((p) => rel === p || rel.startsWith(p))) {
    return path.join(ROOT, rel);
  }
  if (rel === 'shared-shell.js') {
    const webShell = path.join(ROOT, 'web', rel);
    if (!DEPLOYED && fs.existsSync(webShell)) return webShell;
    return path.join(ROOT, rel);
  }
  if (rel === 'terraza/index.html') {
    const gateway = path.join(ROOT, 'web', 'terraza-gateway.html');
    if (!DEPLOYED && fs.existsSync(gateway)) return gateway;
    const deployedTerraza = path.join(ROOT, 'terraza', 'index.html');
    if (fs.existsSync(deployedTerraza)) return deployedTerraza;
  }
  const deployedPath = path.join(ROOT, rel);
  const webPath = path.join(htmlRoot, rel);
  if (fs.existsSync(webPath)) return webPath;
  if (fs.existsSync(deployedPath)) return deployedPath;
  return DEPLOYED ? deployedPath : webPath;
}

function collectLocalHtmlPaths() {
  const out = [];
  function walk(dir, prefix = '') {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory() && ent.name !== 'terraza') walk(full, rel);
      else if (ent.isFile() && /\.(html|json|js|css|svg)$/i.test(ent.name)) out.push(`/${rel.replace(/\\/g, '/')}`);
    }
  }
  walk(WEB);
  return out;
}

function readLocal(url) {
  const filePath = urlToLocalPath(url);
  if (!fs.existsSync(filePath)) {
    return { url, status: 404, body: '', filePath };
  }
  const body = fs.readFileSync(filePath, 'utf8');
  return { url, status: 200, body, filePath };
}

async function fetchWithStatus(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: { 'User-Agent': 'vn-link-qa/1.0' } });
    clearTimeout(timer);
    const body = res.status < 400 ? await res.text().catch(() => '') : '';
    return { url, status: res.status, location: res.headers.get('location'), body };
  } catch (e) {
    clearTimeout(timer);
    return { url, status: 0, error: e.message, body: '' };
  }
}

function extractLinks(html, pageUrl) {
  const links = new Set();
  let m;
  const re = new RegExp(HREF_RE.source, 'gi');
  while ((m = re.exec(html))) {
    const n = normalizeInternal(m[1], pageUrl);
    if (n) links.add(n);
  }
  const refreshRe = new RegExp(META_REFRESH_RE.source, 'gi');
  while ((m = refreshRe.exec(html))) {
    const n = normalizeInternal(m[1], pageUrl);
    if (n) links.add(n);
  }
  while ((m = FETCH_JSON_RE.exec(html))) {
    const n = normalizeInternal(m[1], pageUrl);
    if (n) links.add(n);
  }
  return [...links];
}

function scanLocalStale() {
  const localStale = [];
  function scanFile(filePath, content) {
    const rel = filePath.replace(WEB, '').replace(/\\/g, '/');
    const allowRedirect = rel.includes('zuboff-citas.html') || rel.includes('citas-attac.html')
      || rel.includes('archivo-index.json') || rel.includes('ia-inventario.json');
    if (/zuboff-citas\.html/i.test(content) && !allowRedirect && !rel.includes('zuboff-citas')) {
      localStale.push({ file: rel || '/', issue: 'zuboff-citas.html (usar zuboff-archivo.html)' });
    }
    if (/citas-attac\.html/i.test(content) && !allowRedirect && !rel.includes('citas-attac')) {
      localStale.push({ file: rel || '/', issue: 'citas-attac.html (usar zuboff-archivo.html)' });
    }
    if (/Estado%20del%20Arte\/Citas%20Attac/i.test(content)) {
      localStale.push({ file: rel || '/', issue: 'enlace legacy ATTAC en GitHub (usar zuboff-archivo.html)' });
    }
  }
  function walkScan(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === 'terraza' || ent.name.startsWith('.')) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walkScan(full);
      else if (/\.(html|js|json)$/i.test(ent.name)) scanFile(full, fs.readFileSync(full, 'utf8'));
    }
  }
  walkScan(WEB);
  walkScan(path.join(ROOT, 'data'));
  return localStale;
}

async function main() {
  const seeds = new Set(SEED_PATHS.map((p) => `${BASE}${p === '/' ? '/' : p}`));
  for (const p of collectLocalHtmlPaths()) seeds.add(`${BASE}${p}`);

  const queue = [...seeds];
  const seen = new Set();
  const internalBroken = [];
  const staleRefs = [];
  let checked = 0;
  let ok = 0;

  const load = LOCAL || DEPLOYED ? readLocal : fetchWithStatus;

  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    if (!url.startsWith(BASE)) continue;

    checked += 1;
    const r = await load(url);
    if (r.status === 200) ok += 1;
    else internalBroken.push({ url, status: r.status, filePath: r.filePath });

    if (r.status !== 200 || !r.body || !/\.html?$/i.test(url)) continue;

    for (const link of extractLinks(r.body, url)) {
      if (!link.startsWith(BASE)) continue;
      if (!seen.has(link)) queue.push(link);
      if (/zuboff-citas\.html|citas-attac\.html/.test(link) && !/zuboff-citas|citas-attac/.test(url)) {
        staleRefs.push({ page: url, link });
      }
    }
  }

  const localStale = DEPLOYED ? [] : scanLocalStale();
  const redirectStubs = [];
  for (const stub of ['zuboff-citas.html', 'citas-attac.html']) {
    const url = `${BASE}/${stub}`;
    const r = await load(url);
    const ok = r.status === 200 && /url=zuboff-archivo\.html/i.test(r.body || '');
    redirectStubs.push({ file: stub, status: r.status, ok });
    if (!ok && !internalBroken.some((b) => b.url === url)) {
      internalBroken.push({ url, status: r.status, issue: 'redirect stub inválido' });
    }
  }

  const report = {
    mode: DEPLOYED ? 'deployed' : LOCAL ? 'local' : 'live',
    base: BASE,
    checked,
    ok,
    internalBroken,
    staleLiveLinks: staleRefs,
    localStalePatterns: localStale,
    redirectStubs,
  };

  console.log(JSON.stringify(report, null, 2));
  const fail = internalBroken.length > 0 || localStale.length > 0;
  process.exit(fail ? 1 : 0);
}

main();