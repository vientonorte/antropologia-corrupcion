# Bases consultadas — estados DevOps / Scrum

> Feature `5153ce9` · Sprint 2026-06-21 · Contra-archivo público

## Problema (Design Thinking — Empatizar)

El investigador veía nombres de fuentes (InfoLobby, BCN, Transparencia…) sin saber:

- si la fuente está **activa** en el pipeline o solo planificada (fase 2),
- cuántos **registros** hay por base,
- si un resultado está **verificado** o es derivado/curado manualmente.

Había tres vocabularios de estado desconectados en datos y cero superficie UI.

## Solución — Definir + Prototipar

Unificar lectura en un **registro de fuentes** (`CASourceRegistry`) y un **panel de confianza** (`CABasesConsultadas`) que traduce estados técnicos a señales legibles para el investigador.

### Capas de estado

| Capa | Origen | Campo | Valores |
|------|--------|-------|---------|
| Pipeline DevOps | `data/fuentes-config.json` | `estado` | `mvp`, `fase-2` |
| Activación | `data/fuentes-config.json` | `activa` | `true` / `false` |
| Verificación registro | `fuentes-oficiales.json`, BCN normalizado | `verificado`, `estado_verificacion` | `true`, `curado-manual`, `derivado-ley-vigente` |
| Etapa normativa | `bcn-legislativo.json` | `etapa_actual` | texto libre (tramitación, vigente…) |
| Confianza | registros | `official_score` | `0..1` |

### Readiness Scrum (calculado)

| Readiness | Condición |
|-----------|-----------|
| **Operativo** | Fuente activa, ≥2 registros, ≥50% verificados |
| **Cobertura parcial** | Fuente activa con registros, verificación <50% |
| **En pipeline** | MVP activa sin registros en corpus |
| **Planificado** | Fase 2 inactiva |
| **Inactivo** | `activa: false` (no fase 2) |

### Sprint checklist (4 criterios por fuente)

1. Registro DevOps (`fuentes-config.json`)
2. Fuente activa
3. Corpus cargado (≥1 registro)
4. Verificación ≥50%

---

## Arquitectura

```
data/fuentes-config.json ──┐
data/fuentes-oficiales.json├──► CADataLoader.loadCorpusBundle()
data/bcn-legislativo.json ─┘         │
                                     ▼
                            CASourceRegistry.buildSourceReport()
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
           CABasesConsultadas   buscadorAvanzado   huellaDigital
           (panel + chips)      (badges + filtros) (timeline pills)
```

### Archivos

| Archivo | Rol |
|---------|-----|
| `web/lib/sourceRegistry.js` | Agregación, readiness, sprint meta |
| `web/lib/basesConsultadas.js` | Render panel, chips, pills |
| `web/lib/dataLoader.js` | Fetch `fuentes-config.json` → `bundle.sourceConfig` |
| `web/styles/molecules/bases-consultadas.css` | Estilos panel y pills |
| `tests/sourceRegistry.test.js` | Tests unitarios (12 casos) |

### Superficies

| Página | Montaje | Elemento DOM |
|--------|---------|--------------|
| `index.html` | Chips compactos bajo buscador | `#search-sources` |
| `buscador.html` | Panel sidebar completo | `#basesConsultadasPanel` |
| Resultados (buscador + onboarding) | Pills por registro | `.ca-bases-pills` |
| Huella digital | Pills en timeline | `.ca-huella__event-badges` |

---

## API pública (browser)

### `window.CASourceRegistry`

```js
CASourceRegistry.buildSourceReport(sourceConfig, allRecords)
// → { meta, entries[], summary }

CASourceRegistry.getEntryById(report, 'bcn')
CASourceRegistry.resolveRecordState(record, entry)
CASourceRegistry.computeReadiness(configItem, recordStats)
```

### `window.CABasesConsultadas`

```js
CABasesConsultadas.buildFromBundle(bundle)
CABasesConsultadas.renderPanel(report, { onlyActivas, limit, compact })
CABasesConsultadas.renderCompactLine(report)
CABasesConsultadas.renderRecordBadges(record, report)
CABasesConsultadas.mountPanel('basesConsultadasPanel', report)
CABasesConsultadas.mountCompactLine('search-sources', report)
```

---

## QA — checklist manual

### Pre-deploy (local)

```bash
.node-portable/bin/node tests/runner.js          # 504+ tests
.node-portable/bin/node scripts/qa-live.mjs --local
.node-portable/bin/node scripts/qa-links.mjs --local
```

### Inicio (`index.html`)

- [ ] `#search-sources` muestra chips con punto de color (no texto estático)
- [ ] Chips incluyen conteo `(N)` cuando hay registros
- [ ] Búsqueda onboarding: tarjetas muestran pill Verificado cuando aplica

### Buscador (`buscador.html`)

- [ ] Sidebar: sección **Bases consultadas** con resumen operativas/con datos
- [ ] Cada fuente lista readiness + pipeline MVP/Fase 2 + sprint dots
- [ ] Filtros «Tipo de fuente» muestran readiness y conteo
- [ ] Filas de resultado incluyen pills de verificación
- [ ] Dossier expandido: bloque «Estado del registro»

### Huella digital

- [ ] Timeline: eventos BCN muestran `estado_verificacion` / etapa
- [ ] Registros verificados muestran pill verde

### Accesibilidad

- [ ] Panel tiene `role="region"` + `aria-label`
- [ ] Sprint dots tienen `title` y `aria-label` por criterio
- [ ] Pills no dependen solo de color (texto legible)

### Post-deploy (live)

```bash
node scripts/qa-live.mjs
node scripts/qa-links.mjs --base=https://vientonorte.github.io/antropologia-corrupcion
```

Verificar assets críticos 200:

- `/lib/sourceRegistry.js`
- `/lib/basesConsultadas.js`
- `/styles/molecules/bases-consultadas.css`
- `/data/fuentes-config.json`

---

## Criterios de aceptación (CMA)

| Criterio | Medida | Aceptación |
|----------|--------|------------|
| Visibilidad pipeline | Usuario ve estado MVP/fase-2 por fuente | Panel sidebar + chips onboarding |
| Confianza registro | Pills verificado/confianza en resultados | ≥1 pill en registros con `verificado` |
| Trazabilidad BCN | `estado_verificacion` visible | Timeline huella muestra pill |
| No scraping | Footer epistémico | Texto «corpus curado, no scraping en vivo» |
| Tests | `sourceRegistry.test.js` | 12 casos, suite total verde |

---

## Relación con Terraza (privado)

La Terraza admin (`web/terraza/src/lib/sources/registry.ts`) lee el mismo `data/fuentes-config.json` para health HTTP y cola de ingestión. El sitio público **no** hace health checks en vivo: solo refleja el corpus versionado en Git.

---

## Extender

1. Añadir fuente en `data/fuentes-config.json` (`estado`, `activa`, normalizador).
2. Ingestar registros con `verificado` y `official_score`.
3. Readiness se recalcula al cargar bundle — sin cambio de UI.
4. Para BCN: incluir `estado_verificacion` y `etapa_actual` en normalización.

**Ver también:** [`INTEGRACION_FUENTES.md`](INTEGRACION_FUENTES.md) · [`CATEGORIA_BUSCADOR.md`](CATEGORIA_BUSCADOR.md)