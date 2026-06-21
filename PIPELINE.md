# Pipeline CI/CD — Contra-Archivo

> Este documento es la **fuente de verdad** para workflows, validaciones y reglas de automatización del repositorio.

## Resumen

- rama permanente: `main`
- despliegue público: GitHub Pages
- validación principal local: `node tests/runner.js`
- limpieza automática de ramas merged: activa

## Workflows activos

| Workflow | Archivo | Trigger principal | Función |
|---|---|---|---|
| QA pipeline | `.github/workflows/qa.yml` | `pull_request` a `main` | tests, integridad de datos, Lighthouse y `QA Gate` |
| Deploy Pages | `.github/workflows/deploy.yml` | `push` a `main` | test suite + despliegue del sitio público |
| Lighthouse dedicado | `.github/workflows/lighthouse.yml` | `pull_request` con cambios web | auditoría de performance/a11y/SEO |
| CodeQL | `.github/workflows/codeql.yml` | `push`, `pull_request`, `schedule` | análisis de seguridad y calidad |
| Branch cleanup | `.github/workflows/branch-cleanup.yml` | PR cerrado / manual | elimina ramas merged y audita ramas obsoletas |
| Copilot setup | `.github/workflows/copilot-setup-steps.yml` | cambios en el workflow / manual | prepara el entorno del agente |

## QA en PRs

`qa.yml` consolida los checks que deben mirarse primero en cada PR:

1. **Tests unitarios** (incluye gate C03 vía `publishGate.test.js`)
2. **Integridad de datos**
3. **Lighthouse CI**
4. **QA Gate** como resultado consolidado

### Comportamiento importante

- Si **tests** o **data-integrity** fallan, el `QA Gate` falla.
- Si **Lighthouse** falla, el `QA Gate` puede seguir en success y tratarlo como advertencia.
- Existe además un workflow `lighthouse.yml` separado para inspección específica de cambios web.

## Deploy a GitHub Pages

`deploy.yml` corre sobre `main` y hace:

1. `node tests/runner.js`
2. `rsync web/ .` — `web/` es la fuente de verdad del sitio (HTML, CSS, `shared-shell.js`)
3. exclusión de `web/`, `Estado del Arte/`, `Ensayo Traducción de Saberes/` y `docs/` del artefacto público
4. deploy a GitHub Pages

**Regla:** no mantener espejos HTML en la raíz del repo; editar siempre en `web/`.

## Seguridad automatizada

- **CodeQL** corre en `push`, `pull_request` y en cron semanal.
- **Dependabot** y otras medidas complementarias se describen en [`BEST_PRACTICES.md`](BEST_PRACTICES.md) como snapshot histórico de hardening.

## Política de ramas

- `main` es la rama estable y permanente.
- Cuando exista una rama temporal para un PR, debe eliminarse tras el merge.
- `branch-cleanup.yml` automatiza esa limpieza.

## Validación local recomendada

```sh
cd /home/runner/work/antropologia-corrupcion/antropologia-corrupcion
node tests/runner.js
```

Para cambios en `terraza/`, además de lo anterior, seguir las validaciones indicadas en [`CLAUDE.md`](CLAUDE.md).

## Branch protection recomendada

- requerir PR antes de merge
- requerir status checks obligatorios
- mantener ramas actualizadas antes de merge
- eliminar automáticamente ramas merged
- no permitir bypass arbitrario de las reglas
