# Contra-Archivo — Antropología y Corrupción

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://vientonorte.github.io/antropologia-corrupcion/)
[![Tests](https://github.com/vientonorte/antropologia-corrupcion/actions/workflows/qa.yml/badge.svg)](https://github.com/vientonorte/antropologia-corrupcion/actions/workflows/qa.yml)
[![Lighthouse](https://img.shields.io/badge/lighthouse-passing-brightgreen)](https://github.com/vientonorte/antropologia-corrupcion/actions/workflows/lighthouse.yml)

**Instrumento cualitativo de análisis multi-situado** para cuantificar tensiones de *mistranslation* institucional entre regímenes de verdad éticos, institucionales y materiales.

> *La institución traduce. La traducción falla. El fallo es el sistema.*

**[Ver el Contra-Archivo →](https://vientonorte.github.io/antropologia-corrupcion/)**

---

## Qué es este repositorio

Este repositorio contiene dos contextos técnicos distintos y documentados por separado:

1. **Raíz del repo** — sitio estático y páginas complementarias en **HTML5 + CSS3 + Vanilla JS**, sin build step ni dependencias externas.
2. **`terraza/`** — app admin privada con stack independiente. Su documento canónico es [`CLAUDE.md`](CLAUDE.md).

Este `README.md` es la **fuente de verdad pública** para la visión del proyecto, el alcance del sitio estático y la estructura general del repositorio.

## Sistema documental

| Tema | Documento canónico |
|---|---|
| Visión pública del proyecto | [`README.md`](README.md) |
| Estado operativo y backlog | [`HANDOFF.md`](HANDOFF.md) |
| Cómo contribuir | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Seguridad y privacidad | [`SECURITY.md`](SECURITY.md) |
| CI/CD y workflows | [`PIPELINE.md`](PIPELINE.md) |
| Contexto privado de `terraza/` | [`CLAUDE.md`](CLAUDE.md) |
| Mapa editorial y triage completo de `.md` | [`docs/DOCUMENTATION_SYSTEM.md`](docs/DOCUMENTATION_SYSTEM.md) |
| **Inventario de contenidos / arquitectura de información** | [`docs/INVENTARIO_CONTENIDOS_IA.md`](docs/INVENTARIO_CONTENIDOS_IA.md) · [`data/ia-inventario.json`](data/ia-inventario.json) |

## Tesis e instrumento

El proyecto trabaja sobre tres capas irreductibles:

| Capa | Régimen de verdad | Color |
|---|---|---|
| Ética | Testimonio situado, memoria, voces | `#c8a96e` |
| Institucional | Registro oficial, clasificación, distorsión normativa | `#4a7fa5` |
| Material | Territorio, evidencia física, densidad histórica | `#7a9e6e` |

La fricción entre capas se expresa como intensidad `0.0 → 1.0` y como tipo `política`, `semántica` o `técnica`.

## Sitio estático en la raíz

### Secciones activas

- `#hero`
- `#instrumento`
- `#campos`
- `#tensiones`
- `#grafo`
- `#campo-social`
- `#buscador`
- `#triage`
- `#protocolo`

### Arquitectura pública

```text
index.html
styles.css
styles/graph.css
src/main.js
src/frictionEngine.js
src/graph.js
src/fieldPhysics.js
src/socialField.js
src/nodeRenderer.js
src/searchEngine.js
data/casos.json
data/fuentes-oficiales.json
data/bcn-legislativo.json
data/huella-digital-publica.json
```

### Stack público

- HTML5 + CSS3 + Vanilla JS
- SVG para el grafo force-directed
- Canvas2D para simulaciones físicas y termodinámicas
- GitHub Pages sobre `main`
- **Cero dependencias externas en la raíz**

## Campos de investigación

| Campo | Año | Fricción |
|---|---:|---:|
| SURA Investments: Gobernanza de Datos | 2024 | 0.82 |
| La Negra — Territorio Mapuche-Huilliche | 2023 | 0.94 |
| Periodismo de Datos (CIPER Chile) | 2023 | 0.71 |
| OIT 169 — Consulta Previa | 2022 | 0.89 |

## Desarrollo local

```sh
python3 -m http.server 4321
# o
npx serve .
```

Validación principal del repositorio:

```sh
node tests/runner.js
```

## Regla editorial del repositorio

- Si cambia la visión pública, actualizar primero `README.md`.
- Si cambia el estado real del trabajo, actualizar primero `HANDOFF.md`.
- Si cambia el flujo de colaboración, actualizar primero `CONTRIBUTING.md`.
- Si cambia la superficie de riesgo o reporte, actualizar primero `SECURITY.md`.
- Si cambia un workflow o branch protection, actualizar primero `PIPELINE.md`.
- Si cambia `terraza/`, actualizar primero `CLAUDE.md`.

## Contribuir

¿Te interesa contribuir? Revisa [`CONTRIBUTING.md`](CONTRIBUTING.md).

Condiciones no negociables:

- solo fuentes públicas oficiales chilenas verificables
- no datos personales identificables
- no leaks, filtraciones ni documentos confidenciales
- no dependencias externas en la raíz del proyecto

## Seguridad y privacidad

Este repositorio solo publica datos de fuentes oficiales y casos etnográficos anonimizados. Si detectas un problema, sigue [`SECURITY.md`](SECURITY.md).

## Citación académica

```bibtex
@phdthesis{vientonorte2026,
  author = {Colectivo Viento Norte},
  title = {Contra-Archivo: Antropología y Corrupción. Instrumento cualitativo de análisis multi-situado para cuantificar tensiones de mistranslation institucional},
  school = {Universidad de Chile},
  year = {2026},
  type = {Tesis Doctoral},
  department = {Antropología},
  url = {https://vientonorte.github.io/antropologia-corrupcion/}
}
```

Formato APA y metadatos adicionales: [`CITATION.cff`](CITATION.cff).

## Licencia

Este proyecto está bajo **CC BY-NC-SA 4.0**. Ver [`LICENSE`](LICENSE).

---

Colectivo Viento Norte · [@vientonorte](https://github.com/vientonorte)
