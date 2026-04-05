# Sprint 19 — Buscador de Fricción Institucional

**Sprint Goal:** Integrar un buscador que conecte el contra-archivo con fuentes oficiales chilenas para medir el nivel de fricción entre registro institucional y realidad documentada.

**Duración:** 2 semanas  
**Inicio:** 2 abril 2026  
**Equipo:** 1 dev (Claude) + 1 PO (Rodrigo)

---

## Product Backlog Items

### US-19.1 — Dataset de fuentes oficiales ✅
**Como** investigador, **quiero** un dataset curado de registros oficiales chilenos (lobby, transparencia, leyes, SEIA, ComprasPúblicas, CMF) vinculados a los 4 casos del contra-archivo, **para** medir la fricción entre la capa oficial y las capas ética/material.

**Criterios de aceptación:**
- [x] JSON con al menos 15 registros de 6 fuentes distintas
- [x] Cada registro vinculado a un caso existente en `casos.json`
- [x] Incluye campo `capa_oficial` que documenta la traducción institucional
- [x] Incluye tipo de fricción (política/semántica/técnica)
- [x] Validado con `node --check`

**Archivos:** `data/fuentes-oficiales.json` (17 registros, 6 fuentes)

---

### US-19.2 — Motor de búsqueda con score de fricción ✅
**Como** usuario del contra-archivo, **quiero** buscar registros oficiales y ver su score de fricción contra los casos, **para** entender cómo la institución traduce (y distorsiona) la realidad documentada.

**Criterios de aceptación:**
- [x] Módulo `searchEngine.js` con búsqueda por texto libre
- [x] Filtros por fuente, caso vinculado y tipo de fricción
- [x] Score de fricción calculado: `0.5*(1-overlap) + 0.3*marker + 0.2*tipo`
- [x] Estadísticas agregadas (total resultados, fricción promedio, desglose por fuente)
- [x] Desglose del score por componente y tasa de activación de marcadores
- [x] Zero dependencies (vanilla JS, compatible ES5+)
- [x] Syntax check OK

**Archivos:** `src/searchEngine.js`

---

### US-19.3 — UI del buscador integrada en index.html ✅
**Como** visitante del sitio, **quiero** una sección visual de búsqueda con tarjetas de resultado, **para** explorar la fricción institucional de forma intuitiva.

**Criterios de aceptación:**
- [x] Sección "Buscador de Fricción Institucional" (#buscador) entre Entropía y Protocolo
- [x] Barra de búsqueda con input y 3 filtros (fuente, caso, tipo)
- [x] Tarjetas de resultado con: fuente, fecha, título, capa oficial, score bar, tags, link
- [x] Panel de estadísticas con conteos, barras por fuente y breakdown por componente
- [x] Navegación actualizada (top nav + bottom nav mobile)
- [x] Secciones renumeradas (protocolo: 07, archivo: 08)
- [x] Responsive (mobile-first grid)
- [x] Lazy-init via IntersectionObserver
- [x] Fuentes base inline + capa BCN cargada desde JSON externo
- [x] Print CSS compatibility

**Archivos:** `index.html` (CSS + HTML + inline JS)

---

## Definición de Done
- [ ] Deploy a GitHub Pages
- [ ] Smoke test en Chrome + Safari mobile
- [x] README actualizado
- [ ] Sin regresiones en grafo/entropía

### US-19.4 — Ingesta mínima BCN Tramitación ✅
**Como** investigador, **quiero** una capa legislativa mínima normalizada desde BCN, **para** medir fricción con trazas verificables del expediente parlamentario y no solo con corpus narrativo.

**Criterios de aceptación:**
- [x] Esquema `contra-archivo/bcn-legislativo` definido
- [x] Dataset BCN ampliado con 5 registros: 3 boletines + 2 trazas históricas derivadas
- [x] Normalización a registros del buscador vía `normalizeBcnDataset()`
- [x] Filtro `BCN Tramitación` visible en UI
- [x] Datos BCN integrados vía `data/bcn-legislativo.json`

**Archivos:** `data/bcn-legislativo.json`, `src/searchEngine.js`, `index.html`

## Fuentes Oficiales Integradas

| Fuente | Registros | Casos vinculados |
|--------|-----------|-----------------|
| InfoLobby (Ley 20.730) | 3 | SURA, La Negra, OIT169 |
| Transparencia (Ley 20.285) | 3 | SURA, La Negra, Periodismo |
| LeyChile (BCN) | 5 | Todos los casos |
| SEIA (SEA) | 2 | OIT169, La Negra |
| ComprasPúblicas | 2 | La Negra, Periodismo |
| CMF | 2 | SURA |
| BCN Tramitación | 5 | SURA, OIT169, Periodismo, La Negra |
| **Total** | **22** | **4 casos** |

## Modelo de Fricción

```
Score = 0.5 * (1 - keyword_overlap) + 0.3 * marker_match + 0.2 * tipo_penalty

- keyword_overlap: Jaccard entre keywords del registro oficial y keywords combinados 
  de las 3 capas (ética + institucional + material) del caso vinculado
- marker_match: activación de FRICTION_MARKERS del frictionEngine (pares de keywords 
  que señalan fricción alta cuando coexisten en capas distintas)
- tipo_penalty: bonus de 0.3 si tipo de fricción del registro = tipo del caso
```

## Arquitectura

```
index.html
  └─ <section id="buscador">
       ├─ input#se-search-input
       ├─ select#se-filter-fuente / caso / tipo  
       ├─ div#se-stats-panel
       └─ div#se-results (grid de .se-card)

src/searchEngine.js
  ├─ FrictionSearchEngine(opts)
  │   ├─ .search({ query, fuente, caso, tipo })
  │   └─ .getStats(results)
  ├─ computeFrictionScore(registro, caso)
  ├─ normalizeBcnDataset(dataset)
  ├─ renderSearchCard(result)
  ├─ renderSearchStats(stats)
  └─ initSearchUI(opts) → wires DOM

data/fuentes-oficiales.json
  └─ 17 registros × 6 fuentes oficiales chilenas
data/bcn-legislativo.json
  └─ 5 registros BCN × esquema ampliado con urgencias, comisión, autores, indicaciones y trazabilidad
```

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| VS Code formatter corrompe `?.` → `? .` | Alta | Escanear `? .` y `? ?` + validar con `node --check` |
| Apertura por `file://` no carga BCN JSON | Media | Usar servidor local o GitHub Pages |
| Score de fricción no discrimina bien | Baja | Markers explícitos + amplificación de overlap bajo |
