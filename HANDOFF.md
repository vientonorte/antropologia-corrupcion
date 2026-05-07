# Handoff Operativo — Contra-Archivo

> **Fuente de verdad operativa del repositorio.** Si cambia el estado real del trabajo, este es el documento que se actualiza primero.

## Actualización vigente

- **Fecha:** 2026-05-07
- **Rama permanente:** `main`
- **Validación base verificada:** `node tests/runner.js`
- **Mapa documental vigente:** [`docs/DOCUMENTATION_SYSTEM.md`](docs/DOCUMENTATION_SYSTEM.md)

## Estado actual

### 1. Raíz del repositorio

- Sitio estático desplegado en GitHub Pages.
- Buscador, grafo, campo social y triage activos sin dependencias externas.
- Los documentos canónicos públicos son `README.md`, `CONTRIBUTING.md`, `SECURITY.md` y `PIPELINE.md`.

### 2. `terraza/`

- El contexto privado del admin se documenta en [`CLAUDE.md`](CLAUDE.md).
- El backlog técnico de `terraza/` no debe mezclarse con la arquitectura pública en `README.md`.

## Prioridades abiertas

| Prioridad | Área | Ítem |
|---|---|---|
| P0 | Producto | Dossier de actor expandible (feature D) |
| P0 | `terraza/` | Robustecer Admin APIs: retry/circuit + feedback operativo |
| P1 | `terraza/` | Cierre técnico con lint/tests/build existentes |
| P1 | CI/CD | Mejorar observabilidad y salidas de QA |
| P2 | Documentación | Mantener sincronía entre documentos canónicos y archivos auxiliares |

## Decisiones vigentes

1. **Una fuente de verdad por tema**: `README`, `HANDOFF`, `CONTRIBUTING`, `SECURITY`, `PIPELINE`.
2. **Separación explícita de contextos**: la raíz estática y `terraza/` se documentan por separado.
3. **Documentos históricos no mandan**: `DESIGN_SPRINT.md`, `BEST_PRACTICES.md` y materiales equivalentes quedan como archivo, no como instrucción vigente.
4. **Documentación auxiliar subordinada**: ningún `.md` de apoyo debe contradecir a los documentos canónicos.

## Runbook breve

### Validación mínima

```sh
cd /home/runner/work/antropologia-corrupcion/antropologia-corrupcion
node tests/runner.js
```

### Smoke local del sitio estático

```sh
cd /home/runner/work/antropologia-corrupcion/antropologia-corrupcion
python3 -m http.server 4321
```

### Dónde actualizar primero

- visión pública → `README.md`
- estado y backlog → `HANDOFF.md`
- contribución → `CONTRIBUTING.md`
- seguridad → `SECURITY.md`
- CI/CD → `PIPELINE.md`
- admin privado → `CLAUDE.md`

## Riesgos activos

- El historial del repositorio sigue siendo pesado por materiales de investigación ya versionados.
- Lighthouse puede degradarse sin bloquear `QA Gate`; revisar `PIPELINE.md` cuando cambien métricas o umbrales.
- La documentación de sprint puede envejecer rápido si no se conserva como archivo explícito.

## Historial y archivo

- cambios históricos de producto → [`CHANGELOG.md`](CHANGELOG.md)
- decisiones de deprecación → [`DEPRECATIONS.md`](DEPRECATIONS.md)
- diseño sprint histórico → [`DESIGN_SPRINT.md`](DESIGN_SPRINT.md)
- snapshot de hardening del repo público → [`BEST_PRACTICES.md`](BEST_PRACTICES.md)

