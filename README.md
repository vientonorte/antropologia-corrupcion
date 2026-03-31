# Contra-Archivo — Antropología y Corrupción

**Instrumento cualitativo de análisis multi-situado** para cuantificar tensiones de *mistranslation* institucional entre tres regímenes de verdad: ético, institucional y material.

> *La institución traduce. La traducción falla. El fallo es el sistema.*

**[Ver el Contra-Archivo →](https://vientonorte.github.io/antropologia-corrupcion/)**

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
index.html                ← Landing + 7 secciones narrativas + grafo SVG + campo social
├── styles.css             ← Design tokens + layout (tema oscuro)
├── styles/graph.css       ← Estilos del grafo force-directed
├── src/
│   ├── frictionEngine.js  ← Motor de fricción epistemológica (0.0→1.0)
│   ├── fieldPhysics.js    ← Campo de física: potencial Coulomb, streamlines, partículas
│   ├── graph.js           ← Grafo SVG force-directed (Fruchterman-Reingold optimizado)
│   ├── nodeRenderer.js    ← Panel lateral detalle (3 capas + fricción)
│   └── socialField.js     ← Motor de entropía social (termodinámica de la corrupción)
├── data/
│   └── casos.json         ← Base de datos: 4 casos × 3 capas × fricción
├── admin.html             ← Panel CMS interno (Admin/Consultor)
└── .vscode/settings.json  ← Protección contra formatter (formatOnSave: false)
```

## Módulos del sistema

### frictionEngine.js
Motor de cálculo de fricción epistemológica. Mide la distancia entre regímenes de verdad (ético, institucional, material) por overlap semántico + marcadores explícitos. Produce un grafo de nodos y aristas ponderadas por intensidad de fricción.

### fieldPhysics.js  
Campo de física visual superpuesto al grafo. Renderiza en Canvas2D:
- **Potencial Coulomb** — cada nodo emite un campo proporcional a su fricción
- **Streamlines** — líneas de flujo que siguen el gradiente del potencial
- **Partículas de energía** — partículas que se mueven por el campo con masa y velocidad

### graph.js
Grafo SVG force-directed con simulación Fruchterman-Reingold optimizada. Soporta filtrado por capa (ética/institucional/material) y tipo de fricción. Integra `FrictionField` como overlay canvas.

### socialField.js — Simulación Termodinámica
Modela la corrupción institucional como un sistema termodinámico:

| Concepto | Fórmula | Implementación |
|----------|---------|----------------|
| **Ley de Ohm Social** | `I = V / R` | V=necesidad ciudadana, R=integridad institucional, I=corriente informal |
| **Masa de poder** | `g(r) = G·M / r²` | Campo gravitacional que curva el espacio legal |
| **Entropía global** | `S = f(txn_corruptas, calor)` | Cada soborno reduce fricción local pero incrementa desorden sistémico |
| **Colapso térmico** | `S ≥ 0.85` | Muerte térmica: toda transacción requiere soborno |

Visualiza en tiempo real: 80 agentes brownianos (ciudadanos), halos de poder, flujos de corriente, anillos de saturación, sparkline de entropía, y alertas de colapso.

### nodeRenderer.js
Panel de detalle por nodo: muestra las 3 capas de información (ética, institucional, material) con indicadores de fricción.

## Navegación

- **Desktop:** Barra superior fija con links a cada sección
- **Mobile (≤768px):** Bottom navigation bar sticky con scroll tracking activo — la sección visible se resalta automáticamente

## Stack

- **Zero dependencias** — HTML5 + CSS3 + Vanilla JS
- **Grafo:** SVG force-directed (Fruchterman-Reingold adaptado)
- **Campos de física:** Canvas2D (potencial Coulomb + partículas)
- **Campo social:** Canvas2D (termodinámica + agentes brownianos)
- **Deploy:** GitHub Pages (rama `main`, raíz `/`)

## Instrumento de 3 capas

| Capa | Régimen de verdad | Color |
|------|-------------------|-------|
| ◎ Ética | Testimonio situado, memoria corporal, voces | `#c8a96e` |
| ▣ Institucional | Registro, clasificación, documentos | `#4a7fa5` |
| ◈ Material | Territorio, evidencia física, datos | `#7a9e6e` |

La **fricción** entre capas se mide como intensidad (0.0→1.0) y se clasifica en tipo: *Política* (¿quién define?), *Semántica* (¿qué significa?) o *Técnica* (¿qué miden los datos?).

## Desarrollo local

Abrir `index.html` en cualquier navegador. No requiere build, bundler ni servidor.

```sh
# opcionalmente, con live server
npx serve .
```

> **⚠️ Nota:** El formatter de VS Code rompe `?.` → `? .` en el script inline. El proyecto incluye `.vscode/settings.json` con `formatOnSave: false` para prevenir esto. Si usas otra extensión (Prettier, Beautify), desactívala para este workspace.

## Licencia

Tesis doctoral en Antropología — Chile, 2025.

---

Rodrigo Gaete · [@vientonorte](https://github.com/vientonorte)
