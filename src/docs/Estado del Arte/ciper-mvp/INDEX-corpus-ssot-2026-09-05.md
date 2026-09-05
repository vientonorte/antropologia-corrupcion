# INDEX corpus SSOT — antropologia-corrupcion

**Fecha:** 2026-09-05 (rev Clave B Gramsci fiel)  
**Skill:** `/vn-agent` → `lectura-clave-b`  
**Layout canónico (Decider):** `src/` · `data/` · `web/` · docs de investigación en **`src/docs/Estado del Arte/`**  
**Live:** https://vientonorte.io/antropologia-corrupcion/corpus-citas.html  
**GitHub:** https://github.com/vientonorte/antropologia-corrupcion

## Árbol relevante

| Path | Rol |
|------|-----|
| `src/docs/Estado del Arte/` | Docs + capturas (Citas Attac, Citas Gramsci, Citas Salazar, CIPER, fichas, bujo-ro, lectura-clave-b) |
| `src/docs/Estado del Arte/ciper-mvp/` | Plan CIPER + INDEX + assets Bullet Ro 113 |
| `src/assets/` | Assets web (hoy `hero.png`) |
| `data/` | Editorial JSON del corpus |
| `web/corpus-citas.html` | UI Clave A/B |

## Editorial `data/`

| Archivo | n | Notas |
|---------|---|-------|
| `zuboff-citas.json` | 10 | ok · ids 1001+ |
| `attac-citas.json` | 14 | ok · fotos 21 en Citas Attac · ids 2001+ |
| `gramsci-citas.json` | **3** | ids 3001–3003 · texto fiel a marcador (no paráfrasis) · leyenda IMG_1210 |
| `libros-clave-b.json` | 8 | `gramsci-reforma` = en-curso · `salazar-acumulacion` = pendiente |
| `inbox-clave-a/…113…json` | 1 | plan CIPER |
| `salazar-citas.json` | **NO** | gap · carpeta `Citas Salazar/` vacía (solo README) · loader ya hace fetch 404→[] |

## Capturas en Estado del Arte

| Carpeta | n imgs | JSON |
|---------|--------|------|
| `…/Citas Attac/` | 21 | 14 editorial |
| `…/Citas Gramsci/` | 4 HEIC (IMG_1210.jpg es HEIC disfrazado) | 3 citas + 1 portada-leyenda |
| `…/Citas Salazar/` | 0 | — |

## Leyenda Gramsci (IMG_1210 · override Clave B)

| Color post-it | Etiqueta Rö | Categoría JSON |
|---|---|---|
| 🟦 Azul | REFLEXIÓN | `reflexion` (igual al estándar) |
| 🟩 Verde | CONCEPTO CLAVE | `concepto_clave` (**override**: estándar = persona_interes) |
| 🟥 Rosa | PROCESO CULTURAL | `proceso_cultural` (expansión) |

Pestaña azul en margen p.5: **NO DATO** (tab sin fragmento marcado).

## Siguiente CIPER MVP

1. ~~Clave B → Gramsci (capturas ya en carpeta).~~ **Hecho** (3 citas fieles; portada = leyenda).
2. Rö: fotos Salazar → `…/Citas Salazar/` o chat.
3. Merge `data/salazar-citas.json` + update `libros-clave-b.json`.
4. Smoke corpus-citas · PR · ship solo con ok.
