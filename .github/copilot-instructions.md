# Copilot Instructions — Contra-Archivo

> Contexto persistente para GitHub Copilot.
> Copilot lee este archivo automáticamente en VS Code y GitHub.

---

## 1. Proyecto

**Contra-Archivo** es un instrumento cualitativo de análisis multi-situado que cuantifica tensiones de *mistranslation* institucional entre tres regímenes de verdad: ético, institucional y material.

Tesis doctoral en Antropología (Chile, 2026). Autor: Rodrigo Gaete (@vientonorte).

Sitio publicado en GitHub Pages: `https://vientonorte.github.io/antropologia-corrupcion/`

---

## 2. Branching

- **Usar siempre `main`** para todo desarrollo. No crear ramas auxiliares para tareas regulares.
- **Única excepción:** experimentos mayores de arquitectura que requieran aislamiento explícito.
- Deploy: GitHub Pages desde rama `main`, raíz `/`.

---

## 3. Marco teórico

El sistema opera con estas referencias teóricas — cualquier sugerencia de código debe ser coherente con ellas:

| Autor | Concepto clave | Uso en el proyecto |
|-------|---------------|--------------------|
| **Lydia Salazar** | Acumulación aberrante, capital golondrina | Modelo de cómo el capital financiero (AFP, SURA) traduce vidas en instrumentos sin consentimiento |
| **David Harvey** | Accumulation by dispossession | El despojo territorial mapuche-huilliche como lógica estructural, no como excepción |
| **Hyman Minsky** | Inestabilidad endógena | La corrupción no es un bug del sistema institucional, es un feature emergente |
| **Cadena JP Morgan / FECU / 2008** | Opacidad financiera sistémica | Referencia concreta para la capa material del caso SURA y gobernanza de datos |

La **fricción** es el concepto central: diferencia irreductible entre capas de verdad. El motor **NO resuelve** contradicciones — las cuantifica y clasifica para hacerlas explorables.

---

## 4. Restricciones técnicas

### Stack obligatorio
- **Zero dependencias externas** — HTML5 + CSS3 + Vanilla JS
- Grafo SVG force-directed (Fruchterman-Reingold implementado desde cero)
- Campos de física y campo social en Canvas2D
- Buscador híbrido Jaccard + marcadores semánticos
- Archivos JS cargados como `<script>` clásico (no ESM nativo)

### Prohibido
- ❌ `npm install` — no hay `package.json` ni node_modules
- ❌ D3.js — el grafo ya está implementado sin D3
- ❌ React, Vue, Svelte, Angular, ni ningún framework
- ❌ `import`/`export` ESM nativo — los scripts se cargan con `<script>` tags
- ❌ TypeScript — solo JavaScript vanilla
- ❌ Bundlers (webpack, vite, rollup, esbuild, parcel)
- ❌ CSS preprocessors (Sass, Less, PostCSS)

### Servir localmente
```sh
npx serve .
```
No funciona como `file://` porque la capa BCN se carga desde JSON externo via `fetch`.

### Precaución con formatters
El formatter de VS Code rompe `?.` → `? .` y `??` → `? ?` en JS inline.
El proyecto incluye `.vscode/settings.json` con `formatOnSave: false`.
Validar módulos editados con `node --check` antes de commit.
Buscar corrupción: `grep -nE "\? \\.|\? \?" index.html src/*.js`

---

## 5. Arquitectura de archivos

```
index.html                 ← Landing + secciones narrativas + grafo SVG + campo social + buscador + triage
├── styles.css              ← Design tokens + layout (tema oscuro)
├── styles/graph.css        ← Tokens del grafo force-directed
├── src/
│   ├── main.js             ← Orquestador: carga datos, coordina módulos
│   ├── frictionEngine.js   ← Motor de fricción epistemológica (0.0→1.0)
│   ├── fieldPhysics.js     ← Campo Coulomb: grid O(1), streamlines, partículas
│   ├── graph.js            ← Grafo SVG (Fruchterman-Reingold, listeners pasivos)
│   ├── nodeRenderer.js     ← Panel lateral detalle (3 capas + fricción)
│   ├── searchEngine.js     ← Buscador: score auditable + stats + BCN
│   └── socialField.js      ← Termodinámica social: 80 agentes, entropía Shannon
├── data/
│   ├── casos.json          ← 4 campos × 3 capas × fricción
│   ├── fuentes-oficiales.json ← 18 registros (6 fuentes: InfoLobby, Transparencia, LeyChile, SEIA, CMF, ComprasPublicas)
│   └── bcn-legislativo.json   ← 5 boletines con trazabilidad parlamentaria
├── contra-archivo-v2.html  ← Página contra-archivo (carga src/main.js como módulo)
├── admin.html              ← Panel CMS interno
└── .vscode/settings.json   ← Protección contra formatter
```

`index.html` tiene CSS y JS inline extensos (~3300 líneas). `contra-archivo-v2.html` carga `src/main.js`. Cambios grandes deben hacerse por bloques pequeños y validar sintaxis cada vez.

---

## 6. Esquema de datos

### casos.json — 4 registros

Cada caso tiene esta estructura obligatoria:

```jsonc
{
  "id": "string",           // slug único
  "titulo": "string",
  "anio": 2024,             // número
  "actores": ["..."],
  "instituciones": ["..."],
  "etica": {                // CAPA 1 — testimonio situado
    "titulo": "string",
    "descripcion": "string",
    "voces": ["..."],
    "documentos_ref": ["..."],
    "keywords": ["..."],
    "color": "#c8a96e"      // SIEMPRE dorado
  },
  "institucional": {        // CAPA 2 — registro oficial
    "titulo": "string",
    "descripcion": "string",
    "documentos": ["..."],
    "clasificaciones": ["..."],
    "keywords": ["..."],
    "color": "#4a7fa5"      // SIEMPRE azul
  },
  "material": {             // CAPA 3 — territorio/evidencia
    "titulo": "string",
    "descripcion": "string",
    "evidencias": ["..."],
    "keywords": ["..."],
    "color": "#7a9e6e"      // SIEMPRE verde
  },
  "friccion": {
    "tipo": "politica|semantica|tecnica",
    "subtipo": "politica|semantica|tecnica",
    "intensidad": 0.82,     // 0.0 → 1.0
    "estado": "abierta",    // SIEMPRE "abierta" — la fricción no se cierra
    "descripcion": "string",
    "tension_central": "string — la pregunta que no tiene respuesta",
    "sin_resolver": true    // SIEMPRE true
  },
  "conexiones": ["id-otro-caso"],
  "tags": ["..."]
}
```

**Casos actuales:** `sura-gobernanza-datos` (0.82), `la-negra-territorio-mapuche` (0.94), `periodismo-datos-chile` (0.71), `oit169-consulta-previa` (0.89).

### fuentes-oficiales.json — 18 registros

Campos obligatorios por registro:
```jsonc
{
  "id": "string",
  "fuente": "infolobby|transparencia|leychile|seia|compraspublicas|cmf",
  "titulo": "string",
  "fecha": "YYYY-MM-DD",
  "url": "string",
  "institucion": "string",
  "keywords": ["..."],
  "capa_oficial": "etica|institucional|material",
  "friccion_con": "id-del-caso",
  "tipo_friccion": "semantica|politica|tecnica",
  "tags": ["..."]
}
```

### bcn-legislativo.json — 5 boletines

Campos adicionales sobre fuentes-oficiales: `boletin`, `tipo_registro`, `fecha_ingreso`, `etapa_actual`, `camara_origen`, `comision_actual`, `urgencias`, `indicaciones_total`, `indicaciones_clave`, `etapas_irregulares`, `alertas_friccion`, `trazabilidad`, `estado_verificacion`.

**Total de registros del buscador: 23** (18 fuentes + 5 BCN).

---

## 7. Marcadores semánticos de fricción

El motor usa 13 pares de keywords que indican fricción alta cuando coexisten en capas distintas:

| Par A | Par B | Tipo | Peso |
|-------|-------|------|------|
| consentimiento | proceso administrativo | semántica | 0.90 |
| consulta | trámite | semántica | 0.85 |
| territorio | catastro | semántica | 0.88 |
| memoria | clasificación | semántica | 0.75 |
| autonomía | regulación | semántica | 0.72 |
| testimonio | resolución | política | 0.80 |
| soberanía | CONADI | política | 0.90 |
| resistencia | admisibilidad | política | 0.85 |
| fuente | registro | política | 0.70 |
| evidencia | dato | técnica | 0.65 |
| deforestación | uso productivo | técnica | 0.88 |
| opacidad | transparencia | técnica | 0.82 |
| whistleblower | proceso regular | técnica | 0.78 |

Al agregar un marcador nuevo, respetar el formato `{ a, b, tipo, peso }` en `FRICTION_MARKERS` de `frictionEngine.js`.

---

## 8. Fórmula de score del buscador

```
score = 0.5 × (1 - overlap) + 0.3 × markerMatch + 0.2 × typePenalty
```

Pesos definidos en `SEARCH_SCORE_WEIGHTS` de `searchEngine.js`:
- `overlap`: 0.5 — distancia semántica (Jaccard invertido)
- `marker`: 0.3 — presencia de marcadores de fricción
- `tipo`: 0.2 — afinidad por tipo de fricción

---

## 9. Colores — NO modificar

| Token | Hex | Uso |
|-------|-----|-----|
| `--ca-color-etica` | `#c8a96e` | Dorado — testimonio situado |
| `--ca-color-institucional` | `#4a7fa5` | Azul — registro oficial |
| `--ca-color-material` | `#7a9e6e` | Verde — territorio/evidencia |
| `--ca-friction-low` | `#4a7fa5` | Fricción baja |
| `--ca-friction-mid` | `#b8922e` | Fricción media |
| `--ca-friction-high` | `#c8a96e` | Fricción alta |
| `--ca-friction-critical` | `#e8c47a` | Fricción crítica |

Definidos en `styles/graph.css :root` y replicados en `graph.js _frictionColor()`.

---

## 10. Qué NO hacer

Copilot **NO** debe sugerir ni ejecutar ninguna de estas acciones:

1. **No resolver la fricción** — la fricción entre capas es constitutiva, no es un error a corregir. `sin_resolver: true` siempre.
2. **No traducir al inglés** — todo el contenido narrativo, teórico y de datos está en español. Los comentarios de código pueden estar en español o inglés.
3. **No cambiar los colores** de capas o fricción — están calibrados semánticamente y vinculados a la identidad visual del instrumento.
4. **No sugerir `npm install`**, `yarn add`, `pnpm add` ni gestores de paquetes.
5. **No sugerir `import`/`export`** ES modules — los scripts usan `<script>` tags clásicos con `'use strict'`.
6. **No agregar D3, Three.js, p5.js** ni ninguna librería de visualización — todo está implementado desde cero.
7. **No refactorizar el JS inline de `index.html`** a módulos externos sin instrucción explícita — el HTML concentra lógica por diseño y se migra gradualmente.
8. **No cambiar `formatOnSave`** ni activar formatters automáticos — corrompen operadores opcionales.
9. **No crear ramas** sin necesidad — trabajar siempre en `main`.
10. **No simplificar el modelo teórico** — la complejidad es intencional. Tres capas, tres tipos de fricción, intensidad continua.
11. **No eliminar la capa ética** ni subsumirla en la institucional — son regímenes de verdad incompatibles por diseño.
12. **No convertir los registros del buscador en mocks o stubs** — son datos reales de fuentes oficiales chilenas.

---

## 11. Convenciones de código

- `'use strict'` al inicio de cada archivo JS.
- Variables con `var` en searchEngine.js (por compatibilidad con script tags), `const`/`let` en módulos más recientes.
- Funciones de normalización: `normalizeStr()` en frictionEngine.js, `_seNormalize()` en searchEngine.js — misma lógica (lowercase, sin tildes, sin puntuación).
- Sanitización HTML: `_escHtml()` para cualquier output de usuario a innerHTML.
- XSS: todo contenido dinámico pasa por escape antes de inyección DOM.
- Comentarios de sección con `/* ─── NOMBRE ─── */`.
- Listeners de eventos con `{ passive: true }` donde sea posible.
- Archivos de datos en `data/` como JSON plano, sin TypeScript interfaces.

---

## 12. Verificación antes de commit

```sh
# 1. Validar sintaxis de módulos editados
node --check src/frictionEngine.js
node --check src/searchEngine.js

# 2. Buscar corrupción de operadores opcionales
grep -nE "\? \\.|\? \?" index.html src/*.js

# 3. Si se editó JS inline de index.html, extraer y validar
# (extraer bloque <script> a /tmp y correr node --check)
```
