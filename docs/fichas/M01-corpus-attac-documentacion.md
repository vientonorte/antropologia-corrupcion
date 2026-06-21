# M01 · Corpus ATTAC — documentación metodológica

> **Tipo:** Ficha metodológica / dossier documental (no es ficha de caso analítico cerrado).
> **Estado:** publicable
> **Corpus vivo:** `data/attac-citas.json` · interfaz `zuboff-archivo.html`
> **Dossier fuente:** `Estado del Arte/Citas Attac/`

---

## Nota de método

ATTAC (Association pour la Taxation des Transactions financières et pour l'Action Citoyenne) se incorpora al contra-archivo como **corpus de citas** y evidencia sobre circuitos financieros transnacionales, Tasa Tobin y concentración de capital. No es una tesis propia del proyecto: es **archivo de fuentes** que alimenta el caso SURA Investments y la cadena AFP → custodia global.

Esta ficha documenta el protocolo de captura, nombrado y publicación del corpus. Las citas editables viven en JSON; las fichas por captura viven en `Estado del Arte/Citas Attac/`.

## Relevancia analítica

1. Opacidad de circuitos financieros transnacionales (FECU, CMF, custodia JP Morgan).
2. Mistraducción entre marco regulatorio nacional (DL 3.500, CMF) y acumulación aberrante (Salazar, 2003; Harvey, 2003).
3. Nodos extractivos globales como contrapunto a territorios en disputa (casos Michillanca, La Negra, OIT 169).

## Artefactos publicados

| Artefacto | Ruta | Rol |
|-----------|------|-----|
| Citas JSON | `data/attac-citas.json` | Fuente machine-readable (ids 2001+) |
| Taxonomía | `data/corpus-categorias.json` | Categorías ATTAC + Zuboff |
| Interfaz | `zuboff-archivo.html` | Exploración, filtro, export |
| Fichas captura | `Estado del Arte/Citas Attac/*.md` | Protocolo Clave B por página |
| README dossier | `Estado del Arte/Citas Attac/README.md` | Cadena de custodia |

## Protocolo de captura (resumen)

1. Solo fuentes oficiales ATTAC verificadas.
2. URL y fecha de acceso documentadas.
3. Sin alteración de capturas; hash SHA-256 cuando aplique.
4. Cada captura → ficha `.md` con capa (ética / institucional / material) y fricción.

## Vínculos

- Caso grafo: `sura-gobernanza-datos`
- Fichas: C01 (núcleo/margen), C02 (pensiones/archivo)
- Corpus hermano: M02 (Zuboff)

## Apertura

Si ATTAC produce una tesis analítica propia (no solo citas), debe constituir una **ficha de caso separada** — ver `docs/skills/PUBLICO_INVESTIGADOR_END_TO_END.md` §9.