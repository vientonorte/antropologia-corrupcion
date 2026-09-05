# INDEX corpus SSOT — antropologia-corrupcion

**Fecha:** 2026-09-05 (rev rutas)  
**Skill:** `/vn-agent` → `docs-vn`  
**Layout canónico (Decider):** `src/` · `data/` · `web/` · docs de investigación en **`src/docs/Estado del Arte/`**  
**Live:** https://vientonorte.io/antropologia-corrupcion/corpus-citas.html  
**GitHub:** https://github.com/vientonorte/antropologia-corrupcion

## Árbol relevante

| Path | Rol |
|------|-----|
| `src/docs/Estado del Arte/` | Docs + capturas (Citas Attac, Citas Gramsci, CIPER, fichas, bujo-ro, lectura-clave-b) |
| `src/docs/Estado del Arte/ciper-mvp/` | Plan CIPER + INDEX + assets Bullet Ro 113 |
| `src/assets/` | Assets web (hoy `hero.png`) |
| `data/` | Editorial JSON del corpus |
| `web/corpus-citas.html` | UI Clave A/B |

## Editorial `data/`

| Archivo | n | Notas |
|---------|---|-------|
| `zuboff-citas.json` | 10 | ok |
| `attac-citas.json` | 14 | ok · fotos 21 en Citas Attac |
| `libros-clave-b.json` | 8 | `salazar-acumulacion` + `gramsci-reforma` = pendiente |
| `inbox-clave-a/…113…json` | 1 | plan CIPER |
| `gramsci-citas.json` | **NO** | gap · 4 capturas físicas |
| `salazar-citas.json` | **NO** | gap · **no hay carpeta Citas Salazar** |

## Capturas en Estado del Arte

| Carpeta | n imgs | JSON |
|---------|--------|------|
| `…/Citas Attac/` | 21 | 14 editorial |
| `…/Citas Gramsci/` | 4 (1 jpg + 3 heic) | 0 |
| Citas Salazar | **NO DATO** | — |

## Siguiente CIPER MVP

1. Clave B → Gramsci (capturas ya en carpeta).
2. Rö: carpeta/fotos Salazar → `…/Citas Salazar/` o chat.
3. Merge `data/*-citas.json` + update `libros-clave-b.json`.
4. Smoke corpus-citas · PR `gh` · ship solo con ok.
