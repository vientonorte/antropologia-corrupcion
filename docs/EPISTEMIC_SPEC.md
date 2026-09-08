# EPISTEMIC_SPEC v0 — Contra-Archivo

**Estado:** congelado descriptivo. No es un motor nuevo.
**Contra:** commit `b9c607e` (`main`, 2026-09-07, merge PR #230).
**Fecha de congelación:** 2026-09-08.
**Qué es:** reconstrucción de cómo el instrumento **ya** llega a una cifra o una etiqueta.
**Qué no es:** Friction Score v1, ontología CLAIM, buscador nuevo, ni constitución política.

Principio v0:

> Primero debemos ser capaces de explicar exactamente cómo Contra-Archivo llega a una afirmación. Después podemos decidir cómo hacerlo mejor.

Si el código y este documento divergen, **gana el código**. Se actualiza este archivo. No se “arregla” el número público en el mismo ciclo.

---

## 1. Jerarquía de verdad (v0)

Cuando dos textos discrepan, el orden vigente es:

| Rango | Artefacto | Rol |
|---|---|---|
| 1 | `src/*.js` + `web/lib/*.js` | implementación |
| 2 | `data/*.json` | valores publicados (casos, fuentes, citas) |
| 3 | `tests/*.js` | contrato reproducible |
| 4 | `README.md` | visión pública |
| 5 | `SECURITY.md` / `PIPELINE.md` / `CONTRIBUTING.md` | operación |
| 6 | `HANDOFF.md` | backlog — **puede estar desfasado** |
| 7 | `CLAUDE.md`, vault, Estado del Arte, ensayos | laboratorio / archivo |

`HANDOFF.md` se declara a sí mismo fuente operativa y está fechado **2026-05-07**. El corpus editorial avanzó el 5–7 sep 2026 (PRs #227–#230). Hasta que HANDOFF se reescriba contra `main`, **no manda** sobre P0 epistemológico.

`docs/DOCUMENTATION_SYSTEM.md` está citado en README y HANDOFF y **no existe** en `b9c607e`. Es un puntero roto, no un mapa vigente.

---

## 2. Objetos que el sistema ya tiene

Definiciones v0 = lo que el código y los JSON usan hoy. No se introducen tipos nuevos.

### Caso

Registro en `data/casos.json` → `casos[]`.
Identidad: `id` (slug). Narrativa etnográfica con tres capas (`etica`, `institucional`, `material`), `friccion`, `actores`, `instituciones`, `nodos`, `conexiones`, `tags`.

Un caso **no** es una acusación. Tampoco es una afirmación auditada. Es un contenedor narrativo.

Hay 7 casos en el corpus de referencia (`_meta.nota_casos`, 2026-06-28).

### Capa

Tres regímenes de verdad, irreductibles entre sí (`README.md`, `casos.json._meta.capas`):

- ética — testimonio, memoria, voces (`#c8a96e`)
- institucional — registro oficial, clasificación (`#4a7fa5`)
- material — territorio, evidencia física (`#7a9e6e`)

### Fricción (caso)

Objeto `caso.friccion` en JSON:

- `tipo`, `subtipo`, `intensidad` (0.0–1.0), `estado`, `descripcion`, `tension_central`, `sin_resolver`

El motor **no resuelve** contradicciones. Las cuantifica (`src/frictionEngine.js` encabezado).

### Fuente / registro

Filas en `data/fuentes-oficiales.json`, `data/fuentes-config.json`, `data/bcn-legislativo.json`, normalizadas por `src/sourceNormalizers.js` y catalogadas por `web/lib/sourceRegistry.js`.

Campos v0 relevantes: `id`, `fuente`, `titulo`, `url`, `keywords`, `verificado`, `official_score`, `evidencia_tipo`, `tipo_friccion`, `published_at` / `fecha`.

### Nodo de grafo

`caso.nodos[]` y/o nodos derivados en `buildGraph()`. Pueden llevar `fuente_id` y `fecha_evidencia`. Eso es **provenance implícita**, no un modelo CLAIM.

### Cita editorial

Filas en `data/*-citas.json` (ATTAC, Zuboff, Gramsci, Clave A, stub Salazar). Disciplina vigente en PRs #227–#230: no inventar citas; material incompleto o clínico fuera de `data/`.

### Hecho / inferencia / acusación

v0 **no** tiene tipos distintos en el schema. El copy público mezcla los tres. Esa ausencia queda registrada abajo como deuda epistemológica, no como feature.

---

## 3. Fórmula actual del motor de caso

Archivo: `src/frictionEngine.js`.
Funciones: `extractKeywords` → `keywordOverlap` / `detectMarkers` → `auditLayerPair` → `auditCaseFriction` → `calculateFrictionIntensity` → `buildGraph`.
Tests: `tests/frictionEngine.test.js`.

### 3.1 Keywords de una capa

`extractKeywords(capa)` concatena `keywords`, `clasificaciones`, `titulo` y `descripcion`, normaliza (`normalizeStr`: minúsculas, sin tildes, sin puntuación) y **parte por espacios**. El resultado es un bag de tokens, no frases.

### 3.2 Overlap entre dos capas

```
overlap = |intersección| / max(|A|, |B|)
overlapScore (par) = 1 − min(overlap × 8, 1)
```

El factor `8` satura rápido: con overlap ≥ 0.125, `baseScore` del caso vale **0**.

### 3.3 Marcadores

`FRICTION_MARKERS`: pares `{ a, b, tipo, peso }` con `tipo ∈ {politica, semantica, tecnica}` (`FRICTION_TYPES`, frozen).

Un marcador dispara si el token `a` está en una capa y el token `b` en la otra, o al revés (`detectMarkers`). `maxPeso` = máximo `peso` disparado en el par; 0 si ninguno.

**Comportamiento v0:** `k.includes(normalizeStr(marker.a))` se evalúa sobre **tokens**. Un marcador multi-palabra (`proceso administrativo`, `custodia transnacional`) no coincide con un token suelto. Queda documentado; no se “arregla” en v0.

### 3.4 Intensidad de un par

```
si maxPeso > 0:  pairIntensity = overlapScore × 0.4 + maxPeso × 0.6
si no:           pairIntensity = overlapScore × 0.7
```

Pares: `etica_institucional`, `etica_material`, `institucional_material`.

### 3.5 Intensidad calculada del caso

`auditCaseFriction`:

```
avgOverlap  = media de overlap de los 3 pares
baseScore   = 1 − min(avgOverlap × 8, 1)
markerScore = máximo maxPeso de los 3 pares
si markerScore > 0: calculatedIntensity = baseScore × 0.4 + markerScore × 0.6
si no:              calculatedIntensity = baseScore × 0.7
clamp [0.05, 1.0], 3 decimales
```

`calculateFrictionIntensity` = `auditCaseFriction(...).calculatedIntensity`.

### 3.6 Override JSON (esto es el 0.82)

`buildGraph` (`src/frictionEngine.js`):

```
explicitIntensity = caso.friccion.intensidad
intensity         = explicitIntensity ?? calculatedIntensity
audit.source      = explicitIntensity != null ? 'json' : 'engine'
audit.deltaFromCalculated = explicitIntensity − calculatedIntensity  (0 si no hay JSON)
```

El número que el grafo usa como `node.intensidad` es **el JSON cuando existe**. El motor se calcula igual y se guarda al lado.

El panel (`src/nodeRenderer.js` `_renderAudit`) ya distingue:

- `source === 'json'` → «Valor publicado en el caso»
- si no → «Valor calculado por el motor»
- si `|delta| ≥ 0.02` → nota de divergencia

Eso es honestidad de UI **en el grafo**. No es el mismo score que muestra la búsqueda preliminar del home.

### 3.7 Tipo de fricción

`detectFrictionType`: si `caso.friccion.tipo` existe, **se respeta**. Si no, gana el tipo con mayor suma de `peso` de marcadores. Subtipo = JSON o `null`.

`FRICTION_TYPES` solo conoce `politica | semantica | tecnica`. El JSON publica también `juridica` y `epistemologica`. El filtro del grafo live solo ofrece tres botones. Los tipos extra pasan como etiqueta editorial.

---

## 4. Reconstrucción SURA (caso de prueba v0)

Caso: `sura-gobernanza-datos` en `data/casos.json`.
README tabla «Campos de investigación»: 0.82.
JSON: `"friccion.intensidad": 0.82`, `"tipo": "politica"`.

Medición contra `b9c607e` (Node, `auditCaseFriction` + `buildGraph`):

| Campo | Valor | Origen |
|---|---:|---|
| `explicitIntensity` | 0.82 | JSON |
| `audit.source` | `json` | `buildGraph` |
| `calculatedIntensity` | 0.432 | motor |
| `deltaFromCalculated` | 0.388 | JSON − motor |
| `effectiveIntensity` / `node.intensidad` | 0.82 | override |
| `avgOverlap` | 0.299 | motor |
| `baseScore` | 0 | saturación `overlap × 8` |
| `markerScore` | 0.72 | marcador `autonomía ↔ regulación` |
| par dominante | `etica_institucional` | motor |
| índice Zuboff (hermano) | 0.271 · nivel medio | `calculateZuboffIndex` |

Por qué el motor da 0.432 y no 0.82:

```
baseScore = 0  (overlap 0.299 × 8 > 1)
calculatedIntensity = 0 × 0.4 + 0.72 × 0.6 = 0.432
```

El 0.82 público **no se reconstruye** desde keywords + marcadores. Se publica. El 0.82 de `FRICTION_MARKERS` (`opacidad ↔ transparencia`, peso 0.82) es **otro objeto**: peso de un marcador, no intensidad del caso SURA.

El mismo patrón vale para los 7 casos: todos tienen `source: json`.

| Caso | JSON | Motor | Δ |
|---|---:|---:|---:|
| `sura-gobernanza-datos` | 0.82 | 0.432 | 0.388 |
| `la-negra-territorio-mapuche` | 0.94 | 0.540 | 0.400 |
| `periodismo-datos-chile` | 0.71 | 0.420 | 0.290 |
| `oit169-consulta-previa` | 0.89 | 0.510 | 0.380 |
| `banca-roles-opacidad-digital` | 0.73 | 0.050 | 0.680 |
| `michillanca-extractivismo-ley-anti` | 0.91 | 0.050 | 0.860 |
| `ensayo-traduccion-saberes` | 0.88 | 0.050 | 0.830 |

`0.05` es el piso del clamp cuando no hay marcadores y `baseScore` ya saturó a 0.

v0 no corrige estos deltas. Los vuelve reproducibles.

---

## 5. Otros regímenes de cuantificación (instrumentos hermanos)

No son el Friction Score del caso. No se unifican en v0.

| Régimen | Dónde | Qué mide | Relación con fricción de caso |
|---|---|---|---|
| Intensidad de caso | `friccion.intensidad` / `buildGraph` | cifra publicada o calculada del caso | este spec §3 |
| Fricción registro↔caso | `explainRecordFriction` | score entre un registro de búsqueda y un caso | **otra fórmula** |
| Score de búsqueda | `searchEngine.js` `SEARCH_SCORE_WEIGHTS` | 0.5 overlap + 0.3 marker + 0.2 tipo | envuelve `explainRecordFriction` |
| Ohm social `I = V/R` | copy live del instrumento | metáfora de campo | no entra al cálculo de `calculatedIntensity` |
| Índice Zuboff | `calculateZuboffIndex` en el mismo archivo | 5 dimensiones 0–1, umbrales 0.2/0.4/0.6 | hermano; SURA 0.271 ≠ 0.82 |
| Entropía / campo | `src/fieldPhysics.js`, `src/socialField.js` | simulación visual | hermano |
| `peso_friccion` de nodo | `caso.nodos[].peso_friccion` | editorial por nodo | no se deriva del motor |
| `official_score` | registros de fuente | “confianza” del registro | no es fricción |

### Fórmula registro↔caso (`explainRecordFriction`)

```
overlapScore = 1 − min(overlap × 6, 1)     // factor 6, no 8
tipoPenalty  = 0.30 si tipo_friccion == caso.friccion.tipo
             = 0.15 si == subtipo
             = 0    si no
score = 0.5·overlapScore + 0.3·maxPeso + 0.2·tipoPenalty
clamp [0.05, 1.0]
sin caso → score 0.5
```

Pesos duplicados en `SEARCH_SCORE_WEIGHTS = { overlap: 0.5, marker: 0.3, tipo: 0.2 }`.

El home live (2026-09-08) mostró, entre otros:

- ejemplo Diario Financiero **0.78 SIN VERIFICAR**
- búsqueda «SURA» → 1 resultado **0.39 SIN VERIFICAR**

Esos números salen de **esta** fórmula (o de un overlay de titulares), no de `caso.friccion.intensidad`. Mezclarlos con el 0.82 de SURA es un error de lectura.

### `SIN VERIFICAR`

`src/searchEngine.js` `renderSearchCard`: pill «Verificado» solo si `reg.verificado === true`. Cualquier otro valor (false, ausente) renderiza **«Sin verificar»**.

No significa “fricción no demostrada”. Significa “el registro no trae `verificado: true`”. El live «0 operativas» es cobertura de fuentes (corpus curado, no scraping en vivo), otra variable otra vez.

---

## 6. Gramática que v0 exige al copy (sin cambiar el schema)

Hasta que exista un tipo CLAIM, el texto público debe poder etiquetarse así. Si no se puede, el estado es **NO DETERMINADO**.

| Etiqueta | Uso v0 |
|---|---|
| HECHO | el documento X registra Y |
| EVIDENCIA | fragmento, URL, fecha, `fuente_id` |
| DISCREPANCIA | diferencia entre dos registros o entre capa y registro |
| HIPÓTESIS | la discrepancia podría indicar Z |
| INFERENCIA | paso no observado que el analista introduce |
| ACUSACIÓN | un actor cometió corrupción — **el motor no puede decidir esto** |
| CONTRADICCIÓN | dos afirmaciones incompatibles, ambas con fuente |
| INSUFICIENTE | no hay evidencia bastante |
| NO DEMOSTRADO | se buscó y no se sostuvo |
| SIN VERIFICAR | flag de registro, ver §5 |

Ningún algoritmo decide que una persona es corrupta. Eso ya está en `CLAUDE.md` (reglas duras) y se conserva.

---

## 7. Quién puede cambiar un número

v0, de hecho (no de política inventada):

| Cambio | Dónde | Quién | Cómo se revierte |
|---|---|---|---|
| `friccion.intensidad` de un caso | `data/casos.json` | quien mergea a `main` | git revert / PR |
| keywords / capas | el mismo JSON | igual | igual |
| fórmula, markers, pesos 0.4/0.6/0.7, clamp | `src/frictionEngine.js` | igual + tests | igual |
| `verificado` de un registro | JSON de fuentes | igual | igual |
| copy live | `web/` | igual | igual |

No hay workflow de revisión humana distinto del PR. Terraza (`web/terraza/`, `CLAUDE.md`) es laboratorio: ingestión, OCR, GT, commit local. **No** es quien publica la intensidad del caso hasta que un humano mergea JSON.

Separación v0 que el corpus ya practica y este spec congela:

```
OCR / extracción  ≠  editorial / interpretación  ≠  epistemología / validación
```

El pipeline no determina la verdad.

---

## 8. Registro de contradicciones conocidas (v0)

Clasificación pedida por el brief. No se “arreglan” aquí.

| Id | Clase | Qué |
|---|---|---|
| C1 | DECISIÓN EDITORIAL | Los 7 casos publican `intensidad` JSON; el motor nunca gana. |
| C2 | DEUDA EPISTEMOLÓGICA | El 0.82 SURA no es output del motor (Δ 0.388). |
| C3 | DEUDA DE DATOS | `baseScore = 0` en los 7 casos: el término de overlap no contribuye. |
| C4 | BUG / DEUDA DE DATOS | Marcadores multi-palabra vs tokens (`detectMarkers`). |
| C5 | DEUDA DE DATOS | `friccion.tipo` = `juridica` / `epistemologica` fuera de `FRICTION_TYPES`. |
| C6 | DEUDA DOCUMENTAL | HANDOFF 2026-05-07 vs PRs #227–#230. |
| C7 | DEUDA DOCUMENTAL | `docs/DOCUMENTATION_SYSTEM.md` 404. |
| C8 | DEUDA DOCUMENTAL | `CLAUDE.md` live = `vientonorte.github.io`; canónico FO = `vientonorte.io`. |
| C9 | DEUDA UX | Home muestra 0.78 / 0.39 SIN VERIFICAR sin decir que no es `caso.friccion`. |
| C10 | DEUDA UX | Búsqueda preliminar «SURA» no recupera el caso `sura-gobernanza-datos`. |
| C11 | DEUDA EPISTEMOLÓGICA | Tesis live: «la institución traduce; la traducción falla» + evidencia que solo ilustra la tesis. |
| C12 | DEUDA ARQUITECTÓNICA | Varios lenguajes de cuantificación en el mismo archivo (`frictionEngine.js` + Zuboff). |
| C13 | HISTÓRICO | P0 de HANDOFF («dossier de actor», «Admin APIs») no es el cuello de botella de reproducibilidad. |
| C14 | DECISIÓN METODOLÓGICA | Salazar = `[]`; citas no inventadas (PR #227). Conservar. |

---

## 9. Riesgos epistemológicos

1. **Metáfora cuantificada.** Un decimal con dos cifras parece medición. En v0, para el caso, es sobre todo un valor editorial.
2. **Máquina que confirma la tesis.** Si el copy parte de “la traducción falla” y el overlay de prensa solo emite fricción alta SIN VERIFICAR, el archivo no puede falsarse.
3. **Numeral viajero.** 0.82 es intensidad SURA, peso de un marker, y cifra de README. No son el mismo objeto.
4. **Acusación por proximidad.** Vincular un titular a un caso etnográfico (`caso vinculado`) no prueba el caso ni el titular.
5. **Terraza + Claude Vision.** El laboratorio puede producir códigos GT. Publicarlos como hecho sin revisión humana viola la separación §7.

La feature epistemológica de v0 no es “tener razón”. Es poder decir: **SÍ / NO / NO SÉ / CONTRADICCIÓN / INFERENCIA / HIPÓTESIS / INSUFICIENTE / NO DEMOSTRADO**.

---

## 10. Definition of Done de este documento

v0 está cerrado si:

- [x] cada objeto principal tiene definición anclada a código o JSON
- [x] la fórmula de caso está nombrada con funciones reales
- [x] el override JSON está documentado (`source`, `deltaFromCalculated`)
- [x] SURA se reconstruye (0.82 json vs 0.432 engine)
- [x] los regímenes hermanos están separados
- [x] tipos de fricción extra están registrados, no “normalizados”
- [x] `SIN VERIFICAR` está explicado
- [x] hecho / inferencia / acusación se distinguen en gramática, no en schema nuevo
- [x] contradicciones conocidas están listadas
- [x] no se inventó un algoritmo nuevo

Pendiente de test (mismo ciclo, sin cambiar fórmula): congelar SURA `source=json`, `calculatedIntensity≈0.432`, `explicitIntensity=0.82` en `tests/frictionEngine.test.js`.

---

## 11. Después de v0 (REAM, no este ciclo)

Orden, no catálogo:

1. CLAIM (afirmación con fuente; el caso deja de ser el átomo)
2. PROVENANCE (`fuente_id` / passage ya embrionarios en nodos)
3. EVIDENCE vs INFERENCE vs HYPOTHESIS en schema
4. CONTRADICTION visible, incluida la del propio archivo
5. Friction Engine **v1** — solo entonces, y solo si el override JSON deja de ser silencioso
6. Knowledge Graph con relación citada
7. Terraza como laboratorio (Research OS), no como oráculo
8. Búsqueda epistemológica pública

Fuera de este ciclo: nuevo buscador, nueva IA, nueva Terraza, nuevo Friction Score, reorganización `/00-governance`…`/07-archive`, “reemplazar Google”.

Google, si aparece, es el sistema que se quiere volver **prescindible** en Chile. No el producto a copiar.

---

## 12. Las dos obras (marco, no backlog)

```
VIENTO NORTE
    ├── Motor epistemológico  → ¿cómo sabemos?
    └── Contra-Archivo        → ¿qué permanece?
```

v0 solo hace una cosa: que Contra-Archivo pueda ser contradicho con su propio motor. Sin eso, la segunda obra no sostiene la primera.
