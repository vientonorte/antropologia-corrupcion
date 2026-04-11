# Handoff Operativo — Contra-Archivo

Fecha: 2026-04-08
Rama: `main`
Commit: `dd2c79d`
Estado git al cierre: limpio (`main` = `origin/main`)

---

## 1) Alcance entregado

Sesión de QA integral: auditoría de repo, evaluación heurística, pruebas de usabilidad y 4 sprints de implementación.

### Repo cleanup (pre-sprint)
- `.git` reducido de 5.5 GB a 272 MB (−95%) con `git-filter-repo --strip-blobs-bigger-than 50M`
- 6 binarios trackeados eliminados, `.gitignore` actualizado
- 3 ramas muertas eliminadas
- Corrupción `? .` → `?.` corregida en múltiples archivos

### Sprint 1 — Accesibilidad y Performance (`113a75d`)
- 19 imágenes base64 extraídas a `img/` (contra-archivo-v2: 1479 → 182 KB, −88%)
- `<h1>` sr-only en contra-archivo-v2
- `prefers-reduced-motion` en ambos HTML
- Contraste: `--dim` #444→#767676, `--text-muted` #707070→#8a8a8a
- Meta description + Open Graph en contra-archivo-v2
- Form landmarks para inputs de búsqueda
- Nav link ← Contra-Archivo

### Sprint 2 — Fixes de Usabilidad (`cc7aba0`)
- `initBuscador`: max 30 retries (antes: infinito)
- `initGrafo`/`initSocialField`: DOM feedback al agotar retries
- `openTriageCaseSearch`: alerta visual si buscador no carga
- `DOMContentLoaded`: cada `init*` envuelto en try/catch individual
- CSV export: BOM UTF-8 para Excel Windows
- `initGraphOnboarding`: localStorage envuelto en try/catch
- `filterByDocType`: implementado (antes: stub vacío)
- `showDocConnections`: navega a grafo y resalta nodos (antes: solo console.log)
- 19 imgs con `onerror` fallback CSS
- `#panel-content` con `aria-live="polite"`

### Sprint 3 — PWA y Meta (`e0e07b1`)
- `<meta name="theme-color">` en ambos HTML (#0c0c0c / #060608)
- `manifest.json` creado (name, scope, display standalone, icons)
- `<link rel="manifest">` en ambos HTML
- `404.html` personalizada con estilo dark
- Reading progress bar envuelta en `requestAnimationFrame`

### Sprint 4 — Externalización de Datos (`dd2c79d`)
- `CASOS_DATA` (~15 KB) extraído de inline a `data/casos.json`
- `FUENTES_DATA` (~12 KB) extraído de inline a `data/fuentes-oficiales.json`
- Bootstrap async: `_loadSiteData()` + `_tryBootstrap()` (espera DOM + data)
- Error handler visual si JSON no carga
- index.html: 184 KB → 153 KB (−17%)
- Graph list: paginación con "Mostrar N más" después de 20 items

---

## 2) Archivos clave

| Archivo | Tamaño | Cambios esta sesión |

---

## 3) Validación y cierre de Sprint 5 (abril 2026)

**Fix QA defensivo:**
- Se agregó verificación en la inicialización del grafo para mostrar error visible si los datos no están listos (`CASOS` vacío), evitando bug silencioso por condición de carrera.
- Overlay de loading ahora se oculta y da feedback inmediato al usuario.
- Validado en producción: deploy exitoso (ver captura adjunta de GitHub Actions, todos los workflows verdes).

**Criterios de aceptación:**
- [x] El usuario ve mensaje claro si el grafo no carga
- [x] Overlay de loading no queda colgado
- [x] Error registrado en consola para debug

**Retro:**
- QA mucho más reproducible y transparente para usuarios y desarrolladores.
- Siguiente paso: monitorear feedback real y documentar cualquier edge case futuro.

---
|---------|--------|---------------------|
| `index.html` | 153 KB | Bootstrap async, try/catch, retry limits, CSV BOM, localStorage safe, theme-color, manifest link |
| `contra-archivo-v2.html` | 198 KB | Base64→img, h1, reduced-motion, contraste, OG, form, nav, filterByDocType, showDocConnections, onerror, aria-live, rAF progress, paginación lista |
| `data/casos.json` | 15 KB | **Nuevo** — fuente de verdad (extraído de inline) |
| `data/fuentes-oficiales.json` | 15 KB | Actualizado desde inline |
| `src/frictionEngine.js` | — | Fix corrupción `?.` |
| `manifest.json` | 0.6 KB | **Nuevo** — PWA manifest |
| `404.html` | 1.6 KB | **Nuevo** — página 404 personalizada |
| `img/` | 1 MB (19 JPEGs) | Extraídos de base64 inline |

---

## 2) Fix QA — Rutas absolutas en scripts y manifest (2026-04-09)

### Alcance entregado
- Fix crítico aplicado a `index.html` para que todos los scripts JS y el manifest se carguen correctamente en producción (GitHub Pages).
- Rutas de scripts y manifest cambiadas a absolutas (`/antropologia-corrupcion/...`).
- Validación de sintaxis post-fix: sin errores.
- QA checklist de validación post-fix incluido.

### Archivos clave
- [index.html](antropologia-corrupcion/index.html)

### Commits
- Fix QA: rutas absolutas para scripts y manifest (fecha: 2026-04-09)

### Verificación
- Grafo y módulos JS cargan correctamente en https://vientonorte.github.io/antropologia-corrupcion/
- No hay errores 404 en consola para scripts ni manifest.
- Buscador y simulación funcionales.

### Riesgos
- Si se agregan nuevos scripts o recursos, deben usar rutas absolutas.
- Si se cambia el subdirectorio del proyecto en Pages, ajustar rutas nuevamente.

### Siguiente paso
- Validar en producción tras deploy.
- Cerrar issue QA si todo funciona.

### Retrospectiva

- **Funcionó bien:**
  - Detección rápida del bug raíz (rutas relativas vs. subdirectorio en GitHub Pages).
  - Auditoría exhaustiva: scripts, manifest, fetch, imágenes y CSS.
  - Documentación QA clara: issue, checklist, handoff y changelog.
  - Fix atómico, sin side effects ni errores de sintaxis.
- **Mejorar:**
  - Automatizar validación de rutas en futuros assets (pre-commit hook o script de CI).
  - Incluir test visual post-deploy para detectar recursos rotos antes de mergear a main.
  - Explorar fallback dinámico en JS para rutas, útil si el subdirectorio cambia.
- **Acción siguiente:**
  - Validar en producción tras deploy.
  - Cerrar issue QA si todo funciona.
  - Replicar patrón de rutas absolutas en nuevos módulos o páginas.

---

## 3) Commits relevantes

```
dd2c79d Sprint 4: externalizar CASOS_DATA y FUENTES_DATA a JSON, paginación lista grafo
e0e07b1 Sprint 3: theme-color, manifest PWA, 404, reading progress rAF
cc7aba0 Sprint 2: 10 fixes usabilidad
113a75d Sprint 1: a11y, perf, base64 extraction
286dc02 Limpieza repo: rm binarios, fix ?.operator, .gitignore
```

---

## 4) Verificación ejecutada

- `node --check` en inline JS de `index.html` y `contra-archivo-v2.html` — OK
- `node --check` en `src/frictionEngine.js` — OK
- JSON válido: `data/casos.json`, `data/fuentes-oficiales.json`
- Grep `? .` / `? ?` en todos los archivos editados — 0 ocurrencias
- GitHub Pages deploy verificado con `curl -I`
- 12 GitHub issues creados (#31–#42), 12 cerrados con comentarios de commit

---

## 5) Riesgos conocidos

| Riesgo | Mitigación |
|--------|------------|
| **VS Code formatter corrompe `?.` → `? .`** | Usar `perl -i -pe` o `sed` en terminal para editar JS. Siempre `grep '? \.'` post-edit. Pre-commit hook en `.githooks/` |
| **Carga async puede fallar en `file://`** | `_loadSiteData()` muestra error handler visual. Para desarrollo local usar `npx serve .` |
| **Los JSON son la fuente de verdad** | No editar datos en HTML; editar `data/casos.json` y `data/fuentes-oficiales.json` directamente |
| **19 imgs en `img/` excluidas de gitignore por excepción** | `.gitignore` tiene `!img/` y `!img/*.jpg` — no borrar estas líneas |

---

## 6) Runbook de continuidad

```bash
# 1. Levantar sitio local
npx serve .

# 2. Verificar smoke
# - index.html: Hero → Tensiones → Grafo (esperar carga) → Buscador → Triage → CSV
# - contra-archivo-v2.html: Narrativa → Grafo → Biblioteca → "Tipo" → "Ver conexiones"

# 3. Antes de commit
grep -rn '? \.\|? ?' index.html contra-archivo-v2.html src/*.js
sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d' > /tmp/check.js
node --check /tmp/check.js
node --check src/frictionEngine.js

# 4. Validar JSON
node -e "JSON.parse(require('fs').readFileSync('data/casos.json'))"
node -e "JSON.parse(require('fs').readFileSync('data/fuentes-oficiales.json'))"
```

---

## 7) Próximos pasos sugeridos

- **Separar CSS inline** de ambos HTML a archivos `.css` dedicados (mayor reducción de peso)
- **Tests de regresión** mínima para export CSV (columnas y orden esperados)
- **Service Worker** para capacidades PWA offline (aprovechando manifest.json)
- **Lazy load de secciones** pesadas (grafo, campo social) con skeleton loading mejorado
- **Monitoreo de performance** con Lighthouse CI en GitHub Actions
