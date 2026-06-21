# Integración de fuentes: oficial + académica

## Objetivo
Unificar las fuentes del buscador en un esquema canónico para que la UX pueda diferenciar evidencia **oficial** y **académica** sin romper el score de fricción.

## Catálogo dinámico
- Archivo: `data/fuentes-config.json`
- Campos por fuente:
  - `id`
  - `label`
  - `icon`
  - `color`
  - `tipo` (`oficial` | `academica` | `periodistica`)
  - `estado` (`mvp` | `fase-2`) — pipeline DevOps
  - `activa` — si la fuente participa del corpus público actual
  - `endpoint`, `url_base`, `normalizador`, `prioridad`, `criticidad`

### UI pública — Bases consultadas

El sitio consume `fuentes-config.json` vía `CADataLoader` y calcula readiness Scrum en `web/lib/sourceRegistry.js`. Panel y badges: ver [`BASES_CONSULTADAS.md`](BASES_CONSULTADAS.md).

## Esquema canónico de registro
- `id`
- `fuente`
- `titulo`
- `fecha`
- `url`
- `institucion`
- `materia`
- `keywords`
- `capa_oficial`
- `friccion_con`
- `tipo_friccion`
- `tags`
- `published_at`
- `fetched_at`
- `verificado`
- `official_score`
- `evidencia_tipo`
- `estado_verificacion` (BCN: `curado-manual`, `derivado-ley-vigente`, …)
- `etapa_actual` (BCN: etapa legislativa)

## Normalizadores implementados
Archivo: `src/sourceNormalizers.js`

- `normalizeScieloRecord(raw)`
- `normalizeDiarioOficialRecord(raw)`
- `normalizeAnySourceRecord(raw)`

## Criterios de calidad
1. Cada registro debe tener `fuente`, `titulo` y `fecha`.
2. `evidencia_tipo` debe coincidir con el tipo definido en `fuentes-config.json`.
3. Si hay fecha de publicación y fecha de carga, usar `published_at` y `fetched_at` para trazabilidad.
4. `official_score` debe expresarse en escala `0..1`.
