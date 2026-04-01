# QUICK WINS → PRODUCCIÓN
## Contra-Archivo · Antropología de la Corrupción
> **Fecha:** 1 abril 2026 · Sprint 18  
> **Método:** Design Sprint (comprimido) + Scrum  
> **Deploy:** https://vientonorte.github.io/antropologia-corrupcion/  
> **Scope:** Inventory → Prioritize → Ship

---

## RESUMEN EJECUTIVO

| Dimensión | Estado actual | Quick wins | Impacto |
|-----------|--------------|------------|---------|
| **UI/UX (index.html)** | 7.2/10 Nielsen · 17 sprints | 8 items | Alto — visibilidad pública |
| **Contenido (7 dimensiones)** | 38/64 archivos presentes | 6 items | Medio — completar vacíos |
| **Documentación** | README + Admin CMS | 4 items | Alto — credibilidad académica |
| **Repo / DevOps** | 8.8 GB · 25 ramas | 5 items | Crítico — salud del repo |
| **Ramas rescatables** | 2 quick wins identificados | 2 items | Medio — fixes ya escritos |

**Total quick wins: 25 items → 5 sprints estimados**

---

## MÉTODO: DESIGN SPRINT COMPRIMIDO

```
DÍA 1 — MAP     ← Este documento (inventario + mapa de oportunidades)
DÍA 2 — SKETCH  ← Wireframes de mejoras UI (no necesarios: ya hay diseño activo)
DÍA 3 — DECIDE  ← Priorización MoSCoW abajo
DÍA 4 — BUILD   ← Sprints 18–22
DÍA 5 — TEST    ← Playwright QA + revisión académica
```

---

## BACKLOG PRIORIZADO (MoSCoW + Effort/Impact)

### 🔴 MUST — Bloqueantes o de riesgo crítico

| # | Quick Win | Área | Esfuerzo | Impacto | Sprint |
|---|-----------|------|----------|---------|--------|
| M1 | **Mover datos sensibles fuera del repo** (Terapia/, ZOOM Financiero/, SD/, Mila/, B/) | Seguridad | S | 🚨 CRÍTICO | 18 |
| M2 | **Eliminar triplicado Ensayo** (528 MB × 3 copias) + mover Estrategia Gaona a Drive | Repo | M | CRÍTICO | 18 |
| M3 | **Merge rama QA** (`copilot/unificar-rama-qa-en-produccion`) — memory leak fix graph.js, Safari backdrop-filter, destroy() handlers | Code | M | ALTO | 18 |
| M4 | **Limpiar 17+ ramas muertas** en 3 repos | DevOps | S | ALTO | 18 |
| M5 | **Meta OG + favicon** — compartir en redes sin preview roto | UI | S | ALTO | 18 |

### 🟡 SHOULD — Mejoran producción significativamente

| # | Quick Win | Área | Esfuerzo | Impacto | Sprint |
|---|-----------|------|----------|---------|--------|
| S1 | **Crear La Negra/README.md** — D5 es la dimensión con más archivos sin indexar (20 archivos, 0 README) | Doc | M | ALTO | 19 |
| S2 | **Print CSS** — versión imprimible para comité de tesis (ocultar vizs, mostrar datos, tipografía serif) | UI | S | ALTO | 19 |
| S3 | **Accessibility audit WCAG 2.1 AA** — color contrast en `.muted` (#6b7280 sobre #0c0c0c = 4.1:1, borderline), alt text en infografías, aria-live en viz | A11y | M | ALTO | 19 |
| S4 | **5to caso en casos.json** — D4 "Ensayo: Traducción de Saberes" como nodo del grafo (requiere definir 3 capas con investigador) | Data | M | ALTO | 19 |
| S5 | **Externalizar CSS inline** — los 1,790 líneas de `<style>` en index.html a archivo externo (mejor caching, separation of concerns) | Code | S | MEDIO | 19 |
| S6 | **Consolidar versiones HTML** — definir canónica entre contra-archivo.html y contra-archivo-v2.html, archivar la otra | Doc | S | MEDIO | 19 |

### 🟢 COULD — Mejoran experiencia pero no bloquean

| # | Quick Win | Área | Esfuerzo | Impacto | Sprint |
|---|-----------|------|----------|---------|--------|
| C1 | **Modo claro/oscuro toggle** — comité de tesis puede preferir fondo claro para lectura | UI | M | MEDIO | 20 |
| C2 | **Export PDF del análisis** — botón que genera PDF del caso seleccionado con las 3 capas + fricción | UI | L | MEDIO | 20 |
| C3 | **Búsqueda por keyword** — filtrar en tensiones/grafo por término (ya hay keywords por capa) | UI | M | MEDIO | 20 |
| C4 | **Animación de transición entre tensiones** — fade/slide al cambiar caso (actualmente es swap abrupto) | UI | S | BAJO | 20 |
| C5 | **Tooltips en grafo** — hover muestra nombre del nodo + fricción sin abrir panel | UI | S | MEDIO | 20 |
| C6 | **Renombrar archivos con typos** — "audiovisaul" → "audiovisual", doble extensión .png.png | Doc | S | BAJO | 20 |
| C7 | **Subir imagen faltante** — "Distribución de títulos de merced en Región de los Ríos.png" (vacío D2) | Content | S | BAJO | 20 |

### ⚪ WON'T (this sprint cycle) — Backlog futuro

| # | Item | Razón de postponer |
|---|------|--------------------|
| W1 | Migración a framework (Astro/11ty) | Over-engineering para el scope actual |
| W2 | Backend CMS real (Supabase/Firebase) | admin.html estático cumple el propósito |
| W3 | i18n (EN/ES) | Tesis es en español por naturaleza |
| W4 | PWA offline | GitHub Pages ya es suficientemente rápido |
| W5 | Merge cadena de ramas de contenido (donde-quedamos, transform-narrative) | Contenido ya reescrito en main — divergencia irreconciliable |

---

## SPRINT 18 — PLAN DETALLADO (MUST items)

### Sprint Goal
> Asegurar el repositorio (datos sensibles fuera, peso reducido de 8.8 GB a <500 MB), integrar fixes de calidad pendientes en ramas, y preparar la base para compartir públicamente.

### Definition of Done (DoD)
- [ ] Deploy funcional en GitHub Pages sin errores de console
- [ ] Repo < 1 GB
- [ ] 0 datos personales sensibles en el repo
- [ ] 0 ramas muertas
- [ ] Meta OG visible en Twitter/LinkedIn/WhatsApp preview

### Tareas

#### M1 — Mover datos sensibles (🚨 URGENTE)
```
Estado del Arte/Proyectos/Terapia/     → Google Drive privado
Estado del Arte/Proyectos/ZOOM Financiero/ → Google Drive privado  
Estado del Arte/Proyectos/SD/          → Google Drive privado
Estado del Arte/Proyectos/Mila/        → Google Drive privado
Estado del Arte/Proyectos/B/           → Google Drive privado
```
**Verificar:** ¿El repo es público? → `gh repo view --json isPrivate`
**Si es público:** Actuar AHORA. Estos datos incluyen informes clínicos y financieros.

#### M2 — Reducir peso del repo
```bash
# Eliminar triplicados (528 MB)
rm -rf "Estado del Arte/Ensayo Traducción de Saberes/"
rm -rf "Estado del Arte/Proyectos/Ensayo Traducción de Saberes/"
# Mantener solo: root/Ensayo Traducción de Saberes/

# Mover masivos a Drive (7+ GB)
# Estado del Arte/Proyectos/Estrategia Gaona/ → Drive
# Estado del Arte/Proyectos/ESPE/ → Drive  
# Estado del Arte/Proyectos/Foto Retrato Karina/ → Drive
# Estado del Arte/Proyectos/Fotografías/ → Drive

# Actualizar .gitignore
echo "Estado del Arte/Proyectos/" >> .gitignore
```

#### M3 — Merge rama QA
```bash
git fetch origin
git checkout -b qa-rebase origin/copilot/unificar-rama-qa-en-produccion
git rebase origin/main  # 6 conflictos esperados
# Fixes incluidos:
#   - graph.js: DOM cache con Maps (memory leak fix)
#   - nodeRenderer.js: destroy() + ESC handler cleanup
#   - styles/graph.css: -webkit-backdrop-filter (Safari)
#   - admin.html: HTML roto <th>Estado</span></th>
#   - contra-archivo-v2.html: skip-link + fieldPhysics.js faltante
git checkout main && git merge --no-ff qa-rebase -m "feat: merge QA — memory leak fixes, Safari compat, HTML fixes"
git push origin main
```

#### M4 — Limpieza de ramas
```bash
# antropologia-corrupcion: 10 ramas → delete
git push origin --delete \
  copilot/deploy-grado-changes-to-production \
  copilot/improve-ui-ux-for-graph \
  copilot/prospeccion-llevar-cambios \
  feature/friction-graph-system \
  copilot/mejoras-grafo-accesibilidad-ui \
  copilot/aplica-cambios-mejora-contenidos \
  copilot/card-sorting-content-nodes \
  copilot/refactor-counter-archive-interface \
  copilot/hypothesis-p3-friction-interface \
  copilot/se-publicaron-los-cambios

# table-ro: 9 ramas → delete
# 29092020: 2 ramas → delete
```

#### M5 — Meta OG + favicon
```html
<!-- Agregar al <head> de index.html -->
<meta property="og:title" content="Contra-Archivo — Antropología y Corrupción">
<meta property="og:description" content="Instrumento cualitativo de análisis multi-situado. La mistranslation institucional en Chile medida en 4 campos etnográficos.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://vientonorte.github.io/antropologia-corrupcion/">
<meta property="og:image" content="https://vientonorte.github.io/antropologia-corrupcion/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⊘</text></svg>">
```
**Nota:** Crear `og-image.png` (1200×630) con el título de la tesis y el diagrama de 3 capas.

---

## SPRINT 19 — PLAN RESUMIDO (SHOULD items)

### Sprint Goal
> Completar la documentación académica (D5 README, consolidar HTMLs), mejorar accesibilidad para defensa de tesis (print CSS), y preparar el 5to caso para el grafo.

| Task | Story Points |
|------|-------------|
| S1 — La Negra README.md | 3 |
| S2 — Print CSS | 2 |
| S3 — Accessibility fixes | 3 |
| S4 — 5to caso (requiere PO) | 5 |
| S5 — Externalizar CSS | 2 |
| S6 — Consolidar HTMLs | 1 |
| **Total** | **16 SP** |

---

## MAPA DE ARCHIVOS → PRODUCCIÓN

### Listos para producción (✅ ship as-is)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| index.html | 2,756 | ✅ Sprint 17 · 7.2/10 Nielsen |
| admin.html | ~2,400 | ✅ CMS funcional · 7 dimensiones |
| src/frictionEngine.js | ~300 | ✅ Motor estable |
| src/graph.js | ~500 | ⚠️ Memory leak (fix en rama QA) |
| src/nodeRenderer.js | ~400 | ⚠️ ESC handler leak (fix en rama QA) |
| src/fieldPhysics.js | ~300 | ✅ Canvas estable |
| src/socialField.js | ~250 | ✅ Termodinámica funcional |
| src/main.js | ~300 | ✅ Orquestador |
| data/casos.json | ~400 | ✅ 4 casos completos (falta 5to) |
| styles.css | ~200 | ✅ Tokens + layout |
| styles/graph.css | ~150 | ⚠️ Falta -webkit-backdrop-filter (fix en rama QA) |
| README.md | ~500 | ✅ Documentación completa |

### Requieren decisión del investigador (⏳)
| Archivo | Decisión pendiente |
|---------|-------------------|
| contra-archivo-v2.html | ¿Es la versión canónica o un experimento? |
| Ensayo Trad. Saberes/contra-archivo.html | ¿Duplicado de root o variante? |
| docs/ (3 archivos) | ¿Eliminar mirror? GitHub Pages usa /root |

### No listos para producción (❌)
| Carpeta | Problema | Acción |
|---------|----------|--------|
| _papelera_duplicados/ | 4 HTML deprecated con prefix EA_ | Eliminar |
| Estado del Arte/Proyectos/ | 8 GB de binarios + datos sensibles | Mover a Drive |
| docs/ | Mirror desactualizado | Eliminar tras confirmar Pages config |

---

## MÉTRICAS DE ÉXITO (Definition of Ready para defensa)

### UX/UI
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] 0 console errors en producción
- [ ] Print CSS funcional para comité
- [ ] Meta OG preview correcto en 3 redes sociales
- [ ] Mobile-first responsive (ya implementado Sprint 16)

### Contenido
- [ ] 5 casos en el grafo (actualmente 4)
- [ ] 7/7 dimensiones con README.md documentación
- [ ] 0 archivos vacíos referenciados
- [ ] 0 typos en nombres de archivos

### Repo
- [ ] < 500 MB (actualmente 8.8 GB)
- [ ] 0 datos sensibles comprometidos
- [ ] < 5 ramas activas (actualmente 25)
- [ ] Changelog actualizado en admin.html

### Documentación
- [ ] README.md con arquitectura actualizada post-cleanup
- [ ] INVENTARIO_CARD_SORTING_MVP.md actualizado
- [ ] Cada dimensión (D1–D7) con README propio
- [ ] .gitignore protege binarios > 10 MB

---

## SCRUM CEREMONIES SUGERIDAS

| Ceremonia | Frecuencia | Formato |
|-----------|-----------|---------|
| **Sprint Planning** | Inicio de cada sprint | Revisar este backlog, seleccionar items |
| **Daily Standup** | Cada sesión de trabajo | ¿Qué hice? ¿Qué haré? ¿Bloqueantes? |
| **Sprint Review** | Al cerrar sprint | Deploy check + actualizar changelog en admin.html |
| **Retrospectiva** | Cada 2 sprints | ¿Qué funcionó? ¿Qué mejorar? |

### Velocidad histórica (basada en Sprints 0–17)
- **Sprint promedio:** ~4-6 items completados por sesión
- **Items más lentos:** Simulaciones JS (Sprint 9: socialField, 763 líneas)
- **Items más rápidos:** Config/doc (Sprint 1: .gitignore + .nojekyll)
- **Riesgo recurrente:** VS Code formatter corruption (`?.` → `? .`)

---

## PRÓXIMA ACCIÓN INMEDIATA

**¿Ejecutamos Sprint 18 ahora?** Los MUST items (M1–M5) son:
1. 🚨 Mover datos sensibles → requiere acceso a Finder/Drive
2. Eliminar triplicados → requiere confirmar qué copias son canónicas
3. Merge rama QA → 6 conflictos de rebase
4. Limpieza de ramas → 21 deletes (requiere confirmación)
5. Meta OG → patch rápido a index.html

Items M3 (merge QA) y M5 (OG tags) son ejecutables sin decisión humana.
