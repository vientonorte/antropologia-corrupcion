# INDEX corpus SSOT — antropologia-corrupcion

**Fecha:** 2026-09-05 (1 cita Gramsci + ingest TUI)  
**Skill:** `/vn-agent` → `lectura-clave-b`  
**Layout canónico (Decider):** `src/` · `data/` · `web/` · capturas en **`src/docs/Estado del Arte/`**  
**Live:** https://vientonorte.io/antropologia-corrupcion/corpus-citas.html  
**GitHub:** https://github.com/vientonorte/antropologia-corrupcion  
**Ingest TUI:** `scripts/ingest-tui-img.sh --book <id> <img>`

## Árbol relevante

| Path | Rol |
|------|-----|
| `src/docs/Estado del Arte/Citas <Libro>/` | Fotos Clave B (SSOT captura) |
| `src/docs/Estado del Arte/ciper-mvp/assets/inbox-clave-a/` | Fotos Clave A |
| `src/docs/Estado del Arte/_inbox/` | TUI sin libro asignado |
| `data/*-citas.json` | Editorial (una fila = una cita) |
| `web/corpus-citas.html` | UI Clave A/B |

## Editorial `data/`

| Archivo | n | Notas |
|---------|---|-------|
| `zuboff-citas.json` | 10 | ok · ids 1001+ |
| `attac-citas.json` | 14 | ok · ids 2001+ |
| `gramsci-citas.json` | **1** | id 3001 · p.5 concepto_clave · capturas 4 en carpeta |
| `libros-clave-b.json` | 8 | `gramsci-reforma` = en-curso · `salazar-acumulacion` = pendiente |
| `inbox-clave-a/…113…json` | 1 | plan CIPER |
| `salazar-citas.json` | **NO** | gap · carpeta vacía · loader 404→[] |

## Capturas

| Carpeta | n imgs | JSON |
|---------|--------|------|
| `Citas Attac/` | 21 | 14 editorial |
| `Citas Gramsci/` | 4 HEIC | **1** cita |
| `Citas Salazar/` | 0 | — |

## Siguiente CIPER MVP

1. Rö: fotos Salazar → TUI o `ingest-tui-img.sh --book salazar`.
2. `lectura-clave-b` → `data/salazar-citas.json`.
3. Smoke corpus-citas · PR · ship solo con ok.
