# Handoff Operativo — Contra-Archivo

> **Fuente de verdad operativa del repositorio.** Si cambia el estado real del trabajo, este es el documento que se actualiza primero.

## Actualización vigente

- **Fecha:** 2026-09-13 (America/Santiago) — merge PR #235
- **Rama:** `main` (desde `ca/wallmapu-spine-v17`)
- **Validación base:** `node tests/runner.js`
- **Mapa documental:** [`docs/DOCUMENTATION_SYSTEM.md`](docs/DOCUMENTATION_SYSTEM.md)
- **Spine público:** [`web/tesis-spine.html`](web/tesis-spine.html)
- **SSOT tesis (repo):** [`docs/TESIS-SSOT.md`](docs/TESIS-SSOT.md)
- **Instrumento:** [`docs/INSTRUMENTO.md`](docs/INSTRUMENTO.md)
- **SSOT epistemológica:** [`docs/EPISTEMIC_SPEC.md`](docs/EPISTEMIC_SPEC.md) (v0; el código gana si hay divergencia)

## Ship — INDEX v17

- **Canónico:** INDEX-TESIS-CANONICO-v17 (Drive)
- **URL:** https://drive.google.com/file/d/1zFdRslilykRO3FgPcmoGeg7ZMKJcG6Ww/view
- **fileId:** `1zFdRslilykRO3FgPcmoGeg7ZMKJcG6Ww`
- **Título de tesis:** Etnografía de estado · La máquina de hacer dinero
- **Silo público:** Contra-Archivo
- **Satélite propio:** Wallmapu · inteligencia policial, montaje y vida cotidiana (Gaete Gaona, 2026)
- **APA satélite:** https://docs.google.com/document/d/1BoYAFUbEFNl8bn3J78hJvJCkMdrautaQyXVXxYiL-J8/edit (`1BoYAFUbEFNl8bn3J78hJvJCkMdrautaQyXVXxYiL-J8`)
- **Atribución:** «La máquina de fabricar enemigos» = artículo periodístico original; **byline = NO DATO** (≠ título propio / ≠ título de tesis)

## Estado actual

### 1. Raíz del repositorio

- Sitio estático desplegado en GitHub Pages.
- Buscador, grafo, campo social y triage activos sin dependencias externas.
- Mirror web del satélite: `web/articulo-fabricar-enemigos.html` (filename estable) → `leer.html#articulo-etnografico`.
- Spine ligero + HANDOFF alineados a INDEX v17 (2026-09-12).

### 2. `terraza/`

- El contexto privado del admin se documenta en [`CLAUDE.md`](CLAUDE.md).
- El backlog técnico de `terraza/` no debe mezclarse con la arquitectura pública en `README.md`.

## Pendientes (2026-09-12)

| Prioridad | Ítem |
|---|---|
| P0 | **Byline** periodista de «La máquina de fabricar enemigos» = **NO DATO** (no inventar) |
| P0 | **Diego Zúñiga:** consent + paráfrasis; confirmar video extractivismo Drive `1sWrHfd0qzS7aktkKk588aMjHw26DK8Sz` |
| P0 | Libro **Rati** para «La Oficina» |
| P0 | **Cap V** H3–H4 privado (USO RESERVADO / no publicar); citar Estrategia Gaona textual |
| P0 | Inventario acceso real 11 fuentes MVP (ver `docs/INVENTARIO_FUENTES_MVP.md`) — no conectar |
| P1 | Alinear body satélite APA si aún muestra título viejo en intro (Drive title ya Wallmapu) |
| P1 | Cap III engrossment local vs cuerpo Drive — decidir re-merge |
| P1 | Tests contrato SURA json/engine + inventario 11 ids |
| P2 | Dossier de actor expandible (feature D) · terraza Admin APIs |

El backlog de 2026-05-07 (dossier + Admin APIs como P0) queda **histórico**. Ver EPISTEMIC_SPEC §8 C13.

## Decisiones vigentes (locked)

1. Silo público = **Contra-Archivo**; tesis = **Etnografía de estado · La máquina de hacer dinero**.
2. Satélite propio ≠ titular periodístico; byline periodístico = NO DATO.
3. `frictionEngine` ≠ Ohm `socialField` `I=V/R` — no mezclar (ver `docs/INSTRUMENTO.md`).
4. No Cap V USO RESERVADO en público; no inventar byline; no Vercel `--prod`.
5. Una fuente de verdad por tema: `README`, `HANDOFF`, `CONTRIBUTING`, `SECURITY`, `PIPELINE`.

## Runbook breve

```sh
cd /workspace/antropologia-corrupcion
node tests/runner.js
python3 -m http.server 4321
```

### Dónde actualizar primero

- visión pública → `README.md`
- cómo se calcula una cifra de fricción → `docs/EPISTEMIC_SPEC.md`
- acceso real de fuentes MVP → `docs/INVENTARIO_FUENTES_MVP.md`
- estado y backlog → `HANDOFF.md`
- spine tesis → `web/tesis-spine.html` + `docs/TESIS-SSOT.md`
- contribución → `CONTRIBUTING.md`
- seguridad → `SECURITY.md`
- CI/CD → `PIPELINE.md`
- admin privado → `CLAUDE.md`

## Riesgos activos

- Historial del repo pesado por materiales de investigación versionados.
- Lighthouse puede degradarse sin bloquear `QA Gate`.
- Confundir título periodístico con satélite propio o con título de tesis.

## Historial y archivo

- cambios históricos de producto → [`CHANGELOG.md`](CHANGELOG.md)
- decisiones de deprecación → [`DEPRECATIONS.md`](DEPRECATIONS.md)
- diseño sprint histórico → [`DESIGN_SPRINT.md`](DESIGN_SPRINT.md)
