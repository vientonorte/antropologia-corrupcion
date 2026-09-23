# M03 · Corpus Varoufakis — documentación metodológica

> **Tipo:** Ficha metodológica / dossier de lectura anotada (Clave B).  
> **Estado:** publicable como *archivo de citas*; no es ficha de caso C.0X.  
> **Obra:** Varoufakis, Y. (2023). *Tecnofeudalismo. El sigiloso sucesor del capitalismo*. Deusto (trad. Marta Valdivieso).  
> **Corpus vivo:** `data/varoufakis-citas.json` · capturas `src/docs/Estado del Arte/Citas Varoufakis/`

---

## Nota de método

El corpus registra citas extraídas del libro físico con protocolo **Clave B** (bujo-ro / `lectura-clave-b`). Cada fila JSON es un fragmento marcado; la foto vive en Estado del Arte; **no** se commitean los HEIC (~120 MB) salvo pedido explícito.

Esta ficha **no** reproduce la tesis de Varoufakis ni abre un C.0X. Documenta el archivo de citas como insumo del Contra-Archivo (método: previsión → plusvalía → dato-cloud → renta).

**Hecho de cobertura (21-sep-2026):** el lote `IMG_1461`–`IMG_1500` cubre prólogo + cap. 1 *El lamento de Hesíodo* + arranque del cap. 2 *Las metamorfosis del capitalismo* (pp. 19–49). El cap. 3 *El capital en la nube* (p. 67) y el cap. 4 *nubelistas* (p. 99) **no están en las fotos**. Cloud capital maduro = **NO DATO**.

`IMG_1485` era Bullet Ro J16 (Clave A), no libro. Destino: `src/docs/Estado del Arte/ciper-mvp/assets/inbox-clave-a/`.

## Relevancia analítica

- Dualidad **trabajo mercantil / trabajo experiencial** y **capital mercantil / capital de poder** (pp. 23–26) → plusvalía; cruza C.02 (la cuenta cotiza tiempo) y C.06 (el servidor como herramienta que obliga).
- «Libertad de perder» (pp. 31–32) → máscara de elección (Abrams en C.02: «elige AFP»).
- Tecnoestructura / Bretton Woods (pp. 45–49) → escala; **no** prueba folio AFP→forestal.
- Renta de acceso / nubelistas: **pendiente** de captura cap. 3–4.
- Inferencia *«señor feudal digital»* aplicada a un holding chileno **no** es cita de este lote. No usarla como si Varoufakis hubiera escrito el nombre.

## Artefactos

| Artefacto | Ruta | Rol |
|-----------|------|-----|
| Citas JSON | `data/varoufakis-citas.json` | Machine-readable (`var-001`…; n=23 al 21-sep) |
| Capturas | `src/docs/Estado del Arte/Citas Varoufakis/` | Fotos Clave B; HEIC local |
| Catálogo libros | `data/libros-clave-b.json` → `varoufakis-tecnofeudalismo` | Estado en-curso |
| Interfaz | corpus-citas / `zuboff-archivo.html` | Filtro por libro |
| Skill | `lectura-clave-b` · `docs/skills/lectura-clave-b.md` | Protocolo |

## Convención de ids

- **var-001–012:** ingest OCR 2026-09-11 (pp. 25–49, 7 fotos).
- **var-013–023:** Clave B 2026-09-21 (pp. 19–24, 27, 32, 37, 40, 48).
- Cloud capital / nubelistas: **sin id** hasta foto de cap. 3–4.

## Vínculos

- C.02 — cuenta previsional / archivo (dualidad mercantil vs experiencial).
- C.06 — máquina de hacer dinero (capital-cosa y capital-fuerza; nube = pendiente).
- M02 — Zuboff (capa económico-digital hermana; vigilancia ≠ tecnofeudal).
- M01 — ATTAC (circuitos; no sustituye Varoufakis).
- Bot CA: `docs/GROK-BOT-CA.md`. Silo CA ≠ FO `/servicios` ≠ Penji.

## Sitio de fricción (provisional)

Par semántico marcado: **trabajo mercantil** ↔ **trabajo experiencial**.  
`FRICTION_MARKER` = `[PENDIENTE CALIBRACIÓN]` — no calibrar `frictionEngine` con Ohm ni con cifra 0.82.

## Apertura

- Fotografiar cap. 3 p. 67+ y cap. 4 p. 99 antes de anclar renta de nube en C.06.
- No abrir C.0X nueva solo con la dualidad de la luz (p. 20).
- Tab 🟩 p. 46 «comparar c/ notas de Salazar» es nota de lector, no cita de Varoufakis.
