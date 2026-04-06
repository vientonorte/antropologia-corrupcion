# Contra-Archivo — Antropología y Corrupción

**Instrumento cualitativo de análisis multi-situado** para cuantificar tensiones de *mistranslation* institucional entre tres regímenes de verdad: ético, institucional y material.

> *La institución traduce. La traducción falla. El fallo es el sistema.*

**[Ver el Contra-Archivo →](https://vientonorte.github.io/antropologia-corrupcion/)**

## Estado actual

- Sitio publicado en GitHub Pages con 9 secciones narrativas activas
- Buscador de Fricción Institucional desplegado y navegable en la sección `#buscador`
- Grafo, campo social y buscador conviven sin dependencias externas ni build step
- Buscador ampliado con desglose auditable del score y una capa BCN cargada desde JSON externo
- Nuevo panel `#triage` para comparar cobertura por fuente, gaps y fricción media entre casos
- Mobile UX del grafo reforzada con estado de foco visible y acción rápida de limpieza de contexto
- Exportación CSV activa en buscador y triage para auditoría y análisis fuera del sitio
- Riesgo abierto: historial del repo inflado por artefactos de investigación pesados ya versionados

Handoff operativo actualizado: ver `HANDOFF.md`.

---

## Campos de investigación

| Campo | Año | Fricción | Tipo |
|-------|-----|----------|------|
| SURA Investments: Gobernanza de Datos | 2024 | 0.82 | Política · Semántica |
| La Negra — Territorio Mapuche-Huilliche | 2023 | 0.94 | Política · Semántica |
| Periodismo de Datos (CIPER Chile) | 2023 | 0.71 | Semántica · Técnica |
| OIT 169 — Consulta Previa | 2022 | 0.89 | Política · Semántica |

## Arquitectura

```
index.html                ← Landing + 7 secciones narrativas + grafo SVG + campo social (3327 líneas)
├── styles.css             ← Design tokens + layout (tema oscuro)
├── styles/graph.css       ← Estilos del grafo force-directed
├── src/
│   ├── main.js            ← Orquestador: carga datos, coordina módulos, manejo de estado
│   ├── frictionEngine.js  ← Motor de fricción epistemológica (0.0→1.0)
│   ├── fieldPhysics.js    ← Campo Coulomb: grid O(1), streamlines, 120 partículas batched
│   ├── graph.js           ← Grafo SVG force-directed (Fruchterman-Reingold, listeners pasivos)
│   ├── nodeRenderer.js    ← Panel lateral detalle (3 capas + fricción)
│   ├── searchEngine.js    ← Buscador híbrido: score auditable + stats componentizadas + BCN
│   └── socialField.js     ← Termodinámica social: 80 agentes, entropía Shannon, fases
├── data/
│   ├── casos.json         ← Base de datos: 4 campos × 3 capas × fricción
│   ├── fuentes-oficiales.json ← 6 fuentes (InfoLobby, Transparencia, LeyChile, SEIA, CMF, ComprasPublicas)
│   └── bcn-legislativo.json ← Dataset BCN con boletines y trazas históricas legislativas
├── admin.html             ← Panel CMS interno (Admin/Consultor)
└── .vscode/settings.json  ← Protección contra formatter (formatOnSave: false)
```

## Módulos del sistema

### main.js — Orquestador
Coordina la carga y comunicación entre módulos:
1. `loadCasos()` — fetch async de `casos.json`
2. `setupGraphDOM()` — inyecta toolbar + canvas + panel en el DOM
3. `waitForModules()` — espera `frictionEngine`, `FrictionGraph`, `NodeRenderer`, `FrictionField`
4. Estado global: `STATE = {mode, activeLayer, graph, renderer, data}`
5. Progressive enhancement — modo grafo se superpone al narrativo sin romper HTML

### frictionEngine.js
Motor de cálculo de fricción epistemológica. Mide la distancia entre regímenes de verdad (ético, institucional, material) por overlap semántico + marcadores explícitos. Produce un grafo de nodos y aristas ponderadas por intensidad de fricción.

### fieldPhysics.js  
Campo de física visual superpuesto al grafo. Renderiza en Canvas2D:
- **Potencial Coulomb** — cada nodo emite un campo proporcional a su fricción
- **Streamlines** — líneas de flujo que siguen el gradiente del potencial
- **Partículas de energía** — partículas que se mueven por el campo con masa y velocidad

### graph.js
Grafo SVG force-directed con simulación Fruchterman-Reingold implementada desde cero (zero dependencias, sin D3). Soporta filtrado por capa (ética/institucional/material) y tipo de fricción. Integra `FrictionField` como overlay canvas.

Fuerzas: $F_{\text{rep}} = k^2 / d$ · $F_{\text{attr}} = (d - d_{\text{target}}) / d \times \alpha$ · Gravedad central: $0.06 \times \alpha \times (\text{center} - \text{pos})$

### socialField.js — Simulación Termodinámica
Modela la corrupción institucional como un sistema termodinámico:

| Concepto | Fórmula | Implementación |
|----------|---------|----------------|
| **Ley de Ohm Social** | $I = V / R$ | $V$ = necesidad ciudadana, $R$ = integridad institucional, $I$ = corriente informal |
| **Masa de poder** | $g(r) = G \cdot M / r^2$ | Campo gravitacional que curva el espacio legal (soft radius 200px) |
| **Entropía Shannon** | $S = 0.6 \cdot H(Q) + 0.4 \cdot \max(\rho, \delta)$ | $H$ = Shannon sobre distribución de calor, $\rho$ = corrupt-ratio, $\delta$ = integrity-loss |
| **Fases del sistema** | `ORDEN → TRANSICIÓN → MUERTE TÉRMICA → COLAPSO` | Grid recto → ondulado → ruido de partículas |
| **Colapso térmico** | $S \geq 0.85$ | Muerte térmica: toda transacción requiere soborno |

Visualiza en tiempo real: 80 agentes brownianos (ciudadanos), halos de poder, flujos de corriente, anillos de saturación, sparkline de entropía, y alertas de colapso.

### nodeRenderer.js
Panel de detalle por nodo: muestra las 3 capas de información (ética, institucional, material) con indicadores de fricción. Confronta sin resolver — 3 verdades permanecen abiertas simultáneamente.

### searchEngine.js — Buscador de fricción
Motor de búsqueda híbrido que cruza texto libre con marcadores epistemológicos de fricción. Reutiliza el mismo helper auditable del motor de fricción para evitar deriva entre grafo y buscador, muestra desglose por componentes (overlap, marcador, tipo) e integra una séptima fuente BCN cargada desde `data/bcn-legislativo.json`, con campos de urgencia, comisión, autores, indicaciones y trazabilidad parlamentaria.

Capacidades activas del buscador:
- Sugerencias de consulta construidas desde casos y registros normalizados
- Facetas dinámicas visibles según resultados emergentes (fuente, tipo de fricción y caso vinculado)
- Selección de resultados con sincronía hacia el grafo para resaltar el caso relacionado
- Explicación expandible por tarjeta con relevancia textual, componentes del score, keywords compartidas y marcadores activados
- Fuente de cálculo y pesos del score visibles por resultado para trazabilidad metodológica
- Exportación CSV de resultados filtrados desde el panel de estadísticas

### triage comparativo — Prioridad investigativa
Panel comparativo que cruza los mismos registros oficiales del buscador con los 4 casos del contra-archivo para visualizar: cobertura por fuente, vacíos documentales, fricción oficial media, tasa de marcadores activos y tipo dominante por caso. Incluye acceso directo desde cada tarjeta hacia el buscador filtrado por caso para pasar de comparación macro a inspección de registros concretos.

## Navegación

- **Desktop:** Barra superior fija con links a cada sección
- **Mobile (≤768px):** Bottom navigation bar sticky con scroll tracking activo — la sección visible se resalta automáticamente

## Stack

- **Zero dependencias** — HTML5 + CSS3 + Vanilla JS
- **Grafo:** SVG force-directed (Fruchterman-Reingold adaptado)
- **Campos de física:** Canvas2D (potencial Coulomb + partículas)
- **Campo social:** Canvas2D (termodinámica + agentes brownianos)
- **Buscador:** Motor de fricción híbrido (Jaccard + marcadores semánticos)
- **Deploy:** GitHub Pages (rama `main`, raíz `/`)

## Optimizaciones de rendimiento

### fieldPhysics.js — Campo de física

| Técnica | Implementación |
|---------|----------------|
| **Grid O(1)** | `_potentialGrid` Float32Array indexada `grid[gy * gw + gx]` con interpolación bilineal. Reemplaza cálculo O(N+L) por celda |
| **Render por lotes** | 2 pasadas: (1) todas las curvas streamline en un solo path, (2) todas las flechas en un solo path. Reduce draw calls |
| **Colores planos** | Links sin gradiente — `stroke-width = max(1, weight × 4)` |
| **Partículas optimizadas** | 120 partículas con opacidad normalizada por corrección gamma (`pow(norm, 0.6)`) |

Constantes clave: `GRID_RESOLUTION: 6` px/celda · `PARTICLE_COUNT: 120` · `STREAMLINES_PER_NODE: 8` · `FIELD_MAX_OPACITY: 0.35`

### socialField.js — Campo termodinámico

| Técnica | Implementación |
|---------|----------------|
| **Agentes por lotes** | 80 agentes simulados en pasada única. Estado cacheado en `Map(id → state)` |
| **DOM dirigido** | Flag `_metricsBuilt` — métricas HTML solo se recalculan en cambios de visibilidad |
| **Anti race-condition** | `cancelAnimationFrame(this.animFrame)` previene loops de animación duplicados |
| **IntersectionObserver** | Pausa animación fuera de viewport |
| **Caché termodinámica** | Por nodo: `{powerMass, integrity, heat, currentFlow, corruptCount, temperature}` |

### graph.js — Grafo SVG

| Técnica | Implementación |
|---------|----------------|
| **Listeners pasivos** | `{ passive: true }` en `mousemove`, `wheel`, `touchend` |
| **Mapas cacheados** | `_nodeElMap` + `_linkElMap` → O(1) por id. Sin queries DOM repetidas |
| **Capas cacheadas** | `_layerCircles` — array pre-computado `{el, capa}` sincronizado en pasada única |
| **Drag compartido** | Un solo `_onMouseMove` + `_onMouseUp` (no N closures por nodo) |

### searchEngine.js — Buscador de fricción

Motor de búsqueda híbrido friction-scored:

1. **Match de texto** — normalización de keywords + presencia de tokens
2. **Similitud Jaccard** — sobre keywords del caso
3. **Marcadores de fricción** — 12 pares semánticos predefinidos (ej. "consentimiento" ↔ "proceso administrativo", peso 0.65–0.9)
4. **Bonus por tipo** — fricción política / semántica / técnica

Sprint UX/UI actual del buscador:
- Autocomplete vía `datalist` para acelerar consultas exploratorias
- Facetas dinámicas que permiten refinar sin reformular manualmente la búsqueda
- Tarjetas seleccionables con puente directo buscador → grafo
- Modo audit-ready por resultado para hacer legible por qué rankea cada registro

Herramienta comparativa activa:
- Dashboard `#triage` con KPIs globales, tarjetas por caso y tabla resumen
- Cobertura comparada sobre 7 fuentes integradas
- Detección de gaps por caso y priorización por fricción media + faltantes
- Botón `Abrir en buscador` para inspección inmediata del caso priorizado
- Toolbar con `Exportar CSV` y `Abrir caso prioritario` para pasar de triage a inspección sin pasos intermedios

$$\text{score} = 0.5 \times (1 - \text{overlap}) + 0.3 \times \text{markerMatch} + 0.2 \times \text{typePenalty}$$

7 fuentes integradas: BCN Tramitación · InfoLobby · Transparencia · LeyChile · SEIA · ComprasPublicas · CMF

## Seguridad

- **XSS fix** — `showFallbackError()` escapa `<` y `>` en `err.message` antes de inyectar en `innerHTML`
- **Sanitización** — String-based `_escHtml()` en outputs de búsqueda
- **Sin eval/innerHTML dinámico** — Todo contenido del usuario pasa por escape

## Accesibilidad

| Feature | Implementación |
|---------|----------------|
| **Skip link** | `.skip-link` oculto → visible en `:focus` → salta a `#instrumento` |
| **aria-labels** | Cada botón, toolbar y control con `aria-label` descriptivo |
| **aria-pressed** | Toggles actualizan estado `aria-pressed` dinámicamente |
| **role="toolbar"** | Controles del grafo con `role="toolbar"` + `aria-labelledby` |
| **aria-live** | Regiones de métricas con `role="status"` + `aria-live="polite"` |
| **focus-visible** | `outline: 2px solid var(--etica)` en foco por teclado |
| **HTML semántico** | `<section>`, `<nav>`, `<main>`, `<aside>`, `<button>` |
| **sr-only labels** | Labels ocultos para lectores de pantalla en inputs |

## Instrumento de 3 capas

| Capa | Régimen de verdad | Color |
|------|-------------------|-------|
| ◎ Ética | Testimonio situado, memoria corporal, voces | `#c8a96e` |
| ▣ Institucional | Registro, clasificación, documentos | `#4a7fa5` |
| ◈ Material | Territorio, evidencia física, datos | `#7a9e6e` |

La **fricción** entre capas se mide como intensidad (0.0→1.0) y se clasifica en tipo: *Política* (¿quién define?), *Semántica* (¿qué significa?) o *Técnica* (¿qué miden los datos?).

## Desarrollo local

Servir el proyecto por HTTP local. No requiere build ni bundler, pero la capa BCN ahora se carga desde JSON externo y no se hidrata en `file://`.

```sh
# servidor estático mínimo
npx serve .
```

> **⚠️ Nota:** El formatter de VS Code rompe `?.` → `? .` y `??` → `? ?` en JS. El proyecto incluye `.vscode/settings.json` con `formatOnSave: false` para prevenir esto. Si usas otra extensión (Prettier, Beautify), desactívala para este workspace y valida los módulos con `node --check`.

## Changelog reciente

| Commit | Tipo | Descripción |
|--------|------|-------------|
| `6c565d8` | feat | UX móvil del grafo con estado de foco + limpieza rápida, score auditable con fuente/pesos visibles y exportación CSV en buscador/triage |
| `2c2eeac` | feat | Panel de triaje comparativo: cobertura por fuente, gaps, fricción media y acceso directo al buscador por caso |
| `6bf5a23` | feat | Buscador automagizado Sprint 1: facetas dinámicas, detalle expandible por resultado y sincronía resultado → grafo |
| `0db9a3a` | docs | Actualización Sprint 19: documentación + dataset legislativo BCN (`data/bcn-legislativo.json`) |
| `872a3df` | feat | Actualización UI del grafo y mejoras en interacción de Contra-Archivo v2 |
| `2b4a33b` | fix | Refactor del motor/render/buscador para estabilizar scoring y consistencia de fricción |
| `141d5bc` | fix | Ajuste responsive del grafo en mobile (min-height a 480px) |
| `cc58b8b` | docs | Actualización de changelog y commits recientes en README |
| `03a9d41` | docs | Contra-archivo standalone, documentación campos etnográficos y materiales de investigación |
| `9f8fe98` | docs | Documentación completa: arquitectura, rendimiento, seguridad, accesibilidad y changelog |
| `6cb1289` | fix | Eliminar frame-skip en render methods (`clearRect` borra cada frame y hace desaparecer capas) |
| `63fa073` | feat | Buscador de fricción, narrativa Gödel y evidencia AFP integrados en el sitio |

## Licencia

Tesis doctoral en Antropología — Chile, 2026.

---

Rodrigo Gaete · [@vientonorte](https://github.com/vientonorte)
