# DEPRECATIONS

## 2026-04-19 — Consolidación de ramas en `main`

**Decisión:** Todas las ramas de feature/fix generadas por procesos automatizados (Copilot y Claude) fueron auditadas y confirmadas como **completamente integradas en `main`** antes de su eliminación. Ninguna rama contenía trabajo pendiente o código no mergeado.

**Verificación:** `git branch -r --merged origin/main` confirmó que las 18 ramas listadas a continuación estaban 100% absorbidas en `main` al momento de la deprecación.

---

### Ramas eliminadas

| Rama | Último commit | Fecha | Estado |
|------|---------------|-------|--------|
| `claude/product-design-file-h1PzG` | Merge branch 'main' into claude/product-design-file-h1PzG | 2026-04-17 | ✅ Mergeada en main |
| `claude/review-framework-books-WGC9m` | fix(anonimización): eliminar iniciales RG de rutas y corregir links rotos de imágenes | 2026-04-16 | ✅ Mergeada en main |
| `copilot/add-contrario-archivo-wireframes` | feat(ux): agregar landing sitio privado (P4+P5) | 2026-04-16 | ✅ Mergeada en main |
| `copilot/add-github-actions-deploy` | feat(ci): add deploy.yml — automate GitHub Pages deployment on push to main | 2026-04-16 | ✅ Mergeada en main |
| `copilot/add-missing-changes-to-deploy` | fix(deploy): cache-bust JS ?v=20260419 + og:image en 5 páginas producto | 2026-04-19 | ✅ Mergeada en main |
| `copilot/analyze-test-coverage` | fix(tests): clean up passkey test - remove unused done param and redundant variable | 2026-04-17 | ✅ Mergeada en main |
| `copilot/atomic-design-ui-kit` | fix(a11y,perf): address review feedback — drawer will-change, aria-hidden, Escape key, focus management | 2026-04-18 | ✅ Mergeada en main |
| `copilot/explain-repository-structure` | Merge pull request #58 from vientonorte/copilot/qa-design-structure-update | 2026-04-17 | ✅ Mergeada en main |
| `copilot/fix-am-bios-display-issue` | fix(qa): address code review — regex escape, comment accuracy in htmlLint tests | 2026-04-19 | ✅ Mergeada en main |
| `copilot/fix-copilot-job-errors` | feat(ci): agregar copilot-setup-steps.yml para corregir errores de auth y referencia git | 2026-04-19 | ✅ Mergeada en main |
| `copilot/fix-production-discrepancies-mobile-desktop` | fix(css,cache): responsive nav mobile + cache-bust params actualizados a 20260418 | 2026-04-18 | ✅ Mergeada en main |
| `copilot/fix-production-issues` | fix(redirect): usar noscript en contra-archivo.html fallback | 2026-04-16 | ✅ Mergeada en main |
| `copilot/merge-sutil-changes-to-main` | Merge branch 'main' into copilot/merge-sutil-changes-to-main | 2026-04-19 | ✅ Mergeada en main |
| `copilot/qa-design-structure-update` | merge(main): resolver conflictos — tomar versiones de main + preservar shared.css extendido y tesis.html | 2026-04-17 | ✅ Mergeada en main |
| `copilot/revisar-rams-nuevo-front` | Merge pull request #56 from vientonorte/copilot/fix-production-issues | 2026-04-17 | ✅ Mergeada en main |
| `copilot/update-repo-add-screenshot-folder` | refactor(estructura): mover carpetas académicas a Estado del Arte/ y crear subcarpetas faltantes | 2026-04-16 | ✅ Mergeada en main |
| `copilot/fix-copilot-job-errors` | feat(ci): agregar copilot-setup-steps.yml para corregir errores de auth y referencia git | 2026-04-19 | ✅ Mergeada en main |
| `copilot/unify-branches-to-main` | docs: crear DEPRECATIONS.md y actualizar CHANGELOG.md | 2026-04-19 | ✅ Mergeada en main |
| `copilot/cleanup-remove-other-branches` | fix(ux): mejoras de sesiones — nav unificada, responsive, manifest, skeleton loading | 2026-04-19 | ✅ Mergeada en main |

---

### Rationale

El repositorio acumuló 18 ramas paralelas a lo largo del desarrollo iterativo de la tesis doctoral **Contra-Archivo: Antropología y Corrupción** (Chile, 2026). Estas ramas fueron generadas por agentes automatizados (GitHub Copilot y Claude) para trabajar en features, fixes y experimentos incrementales.

Al auditar el estado del repositorio:
- **Ninguna rama contenía código original** que no estuviera ya integrado en `main`
- Los merges se realizaron a través de Pull Requests documentados en GitHub
- La rama `copilot/merge-sutil-changes-to-main` (0 líneas de diff) fue la última en ser procesada antes de la consolidación

**La única rama activa es `main`** (protegida), que contiene el estado completo y estable del instrumento crítico.

---

*Fecha de consolidación: 2026-04-19*
*Rama de trabajo actual: `main` (única rama activa)*

---

## 2026-04-20 — Consolidación final de ramas + Pipeline CI/CD

**Decisión:** Auditoría completa de las 20 ramas remotas restantes. Todas confirmadas como **completamente integradas en `main`** (0 líneas de diff). Se implementa pipeline CI/CD de 3 agentes y auto-limpieza de ramas.

### Ramas a eliminar (20 total)

| Rama | Estado |
|------|--------|
| `ci/lighthouse-audit` | ✅ Contenido ya en main (lighthouse.yml + .lighthouserc.json) |
| `claude/product-design-file-h1PzG` | ✅ 0 diff con main |
| `claude/review-framework-books-WGC9m` | ✅ 0 diff con main |
| `copilot/add-contrario-archivo-wireframes` | ✅ 0 diff con main |
| `copilot/add-github-actions-deploy` | ✅ 0 diff con main |
| `copilot/add-missing-changes-to-deploy` | ✅ 0 diff con main |
| `copilot/analyze-test-coverage` | ✅ 0 diff con main |
| `copilot/atomic-design-ui-kit` | ✅ 0 diff con main |
| `copilot/audit-and-cleanup-repository` | ✅ Rama actual (se elimina post-merge) |
| `copilot/cleanup-remove-other-branches` | ✅ 0 diff con main |
| `copilot/explain-repository-structure` | ✅ 0 diff con main |
| `copilot/fix-am-bios-display-issue` | ✅ 0 diff con main |
| `copilot/fix-copilot-job-errors` | ✅ 0 diff con main |
| `copilot/fix-production-discrepancies-mobile-desktop` | ✅ 0 diff con main |
| `copilot/fix-production-issues` | ✅ 0 diff con main |
| `copilot/merge-sutil-changes-to-main` | ✅ 0 diff con main |
| `copilot/qa-design-structure-update` | ✅ 0 diff con main |
| `copilot/revisar-rams-nuevo-front` | ✅ 0 diff con main |
| `copilot/unify-branches-to-main` | ✅ 0 diff con main |
| `copilot/update-repo-add-screenshot-folder` | ✅ 0 diff con main |

### Cambios en workflows

| Acción | Archivo | Motivo |
|--------|---------|--------|
| ➕ Creado | `qa.yml` | Pipeline QA unificado (4 gates) para PRs |
| ➕ Creado | `branch-cleanup.yml` | Auto-eliminación de ramas post-merge |
| 🗑️ Eliminado | `ci.yml` | Redundante — tests cubiertos por `qa.yml` (PRs) y `deploy.yml` (push) |
| ✅ Mantenido | `deploy.yml` | Deploy a GitHub Pages en push a main |
| ✅ Mantenido | `lighthouse.yml` | Lighthouse CI en PRs (también en `qa.yml`) |
| ✅ Mantenido | `copilot-setup-steps.yml` | Setup del agente Copilot |

### Nuevo pipeline

```
VS Code (dev local) → PR → qa.yml (4 gates) → Copilot Agent (aprueba) → merge → deploy.yml → GitHub Pages
                                                                           └→ branch-cleanup.yml (elimina rama)
```

*Fecha: 2026-04-20*

---

## 2026-06-20 — Limpieza de espejos en raíz del repo

**Decisión:** Eliminar HTML y assets duplicados en la raíz que desactualizaban `web/` (fuente de verdad). El deploy ya promueve `web/` vía `rsync`; los espejos en raíz generaban confusión en Finder y riesgo de editar la copia incorrecta.

### Archivos eliminados de la raíz (git)

| Archivo / ruta | Motivo |
|---|---|
| `buscador.html`, `landing.html`, `contra-archivo-v2.html`, `tesis.html` | Espejos obsoletos de `web/` |
| `privado.html`, `privado-login.html`, `login.html`, `poemas.html` | Espejos obsoletos de `web/` |
| `Poemarios/poemas.html` | Canónico en `web/Poemarios/poemas.html` |
| `Ensayo Traducción de Saberes/contra-archivo.html` | v1 (~1.5 MB); canónico en `docs/…` y `web/contra-archivo-v2.html` |
| `styles.css` | Legacy; sitio usa `web/styles/shared.css` |
| `LICENSE 2` | Duplicado iCloud del `LICENSE` canónico |
| `shared-shell.js` (raíz) | Movido a `web/shared-shell.js` |

### Basura local eliminada (no versionada)

- `antropologia_corrupcion_context.zip`
- `recueda_SKILL_actualizado_2026-05-17 2.md`
- `.screenshot-review.png`

### Regla operativa

- Editar siempre en `web/` para páginas y shell.
- `_papelera_duplicados/` permanece gitignored hasta extracción completa (ver `docs/VALOR_NARRATIVO_PAPELERA.md`).

*Fecha: 2026-06-20*
