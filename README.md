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
index.html              ← Landing + 6 secciones narrativas + grafo SVG
├── styles.css           ← Design tokens + layout (tema oscuro)
├── styles/graph.css     ← Estilos del grafo force-directed
├── src/
│   ├── main.js          ← Orquestador: carga → render → controles
│   ├── frictionEngine.js← Motor de fricción epistemológica (0.0→1.0)
│   ├── graph.js         ← Grafo SVG force-directed (Fruchterman-Reingold)
│   └── nodeRenderer.js  ← Panel lateral detalle (3 capas + fricción)
├── data/
│   └── casos.json       ← Base de datos: 4 casos × 3 capas × fricción
├── admin.html           ← Panel CMS interno (Admin/Consultor)
└── contra-archivo-v2.html ← Variante visual "Negra Colorá"
```

## Stack

- **Zero dependencias** — HTML5 + CSS3 + Vanilla JS
- **Grafo:** SVG force-directed (Fruchterman-Reingold adaptado)
- **Motor:** Cálculo de fricción por overlap semántico + marcadores
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

## Licencia

Tesis doctoral en Antropología — Chile, 2025.

---

Rodrigo Gaete · [@vientonorte](https://github.com/vientonorte)
