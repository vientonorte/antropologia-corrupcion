# Contra-Archivo — Instrucciones de contexto para Copilot

> Este archivo es la fuente de verdad del proyecto. Léelo completo antes de sugerir cualquier cambio.
> Rama principal y única de trabajo: `main`. No crear branches salvo que se indique explícitamente.

---

## 1. Qué es este proyecto

**Contra-Archivo: Antropología y Corrupción** es una tesis doctoral interactiva (Chile, 2026) que construye un instrumento crítico para medir la **mistranslation institucional** — el fallo sistemático de las instituciones para traducir entre tres regímenes de verdad incompatibles:

- **Ética** `#c8a96e` — Testimonio situado, memoria vivida, voces
- **Institucional** `#4a7fa5` — Registro oficial, clasificación, distorsión normativa
- **Material** `#7a9e6e` — Territorio, evidencia física, densidad histórica

Tesis central: *"La institución traduce. La traducción falla. El fallo es el sistema."*

---

## 2. Stack técnico — CERO dependencias externas

- **HTML5 + CSS3 + Vanilla JS** — sin frameworks, sin npm, sin build step
- **SVG** para el grafo de fuerza (Fruchterman-Reingold custom)
- **Canvas 2D** para simulaciones físicas (campo de potencial, entropía)
- **Servidor**: `python3 -m http.server 4321` (o `npx serve .`)
- **Deploy**: GitHub Pages, rama `main`, raíz del repo

**No instalar dependencias. No usar D3. No introducir bundlers.**

---

## 3. Arquitectura de archivos

```
index.html                  ← entrada principal (no partir en componentes)
styles.css / styles/graph.css
src/
  main.js                   ← orquestador: carga datos, inicializa módulos
  frictionEngine.js         ← cálculo de fricción (0.0→1.0), marcadores semánticos
  graph.js                  ← grafo SVG Fruchterman-Reingold + filtros
  fieldPhysics.js           ← Canvas2D campo Coulomb + partículas
  socialField.js            ← Canvas2D modelo termodinámico (80 agentes, entropía)
  nodeRenderer.js           ← panel lateral 3 capas + fricción
  searchEngine.js           ← búsqueda híbrida, auditoría de score, facetas
data/
  casos.json                ← 4 casos × 3 capas × fricción
  fuentes-oficiales.json    ← 19 registros × 7 fuentes, friction-scored
  bcn-legislativo.json      ← 5 registros legislativos + trazabilidad parlamentaria
```

---

## 4. Datos: esquema y estado actual

### `data/casos.json` — 4 casos etnográficos

| id | Título | Intensidad |
|---|---|---|
| `sura-gobernanza-datos` | SURA Investments: Gobernanza de Datos y Separación AFP | 0.82 |
| `la-negra-territorio-mapuche` | La Negra — Memoria, Territorio y Resistencia Mapuche-Huilliche | 0.94 |
| `periodismo-datos-chile` | Periodismo de Datos y la Corrupción como Mistranslation | 0.71 |
| `oit169-consulta-previa` | OIT 169: La Consulta Previa como Dispositivo de Neutralización | 0.89 |

### `data/fuentes-oficiales.json` — 19 registros (7 fuentes)

Fuentes: `infolobby`, `transparencia`, `leychile`, `seia`, `compraspublicas`, `cmf`, `etnografia-directa`

**Registro más reciente (07-04-2026):**
- `fecu-liquidez-sura-corredora-2026` — FECU CMF Corredora SURA, 5 índices diarios, cadena JP Morgan documentada

**Fórmula de score de fricción:**
```
score = 0.5 * (1 - overlap_keywords) + 0.3 * marker_match + 0.2 * tipo_penalty
```

### `src/frictionEngine.js` — Marcadores semánticos activos (17 total)

Incluyen marcadores específicos de capital financiero (desde 07-04-2026):
- `trabajador ↔ cartera de custodia` (peso 0.91)
- `custodia transnacional ↔ regulación` (peso 0.86)
- `rescates fondos mutuos ↔ cumplimiento normativo` (peso 0.84)
- `consentimiento ↔ liquidez como semáforo` (peso 0.87)
- `opacidad ↔ patrimonio depurado` (peso 0.80)

---

## 5. Marco teórico del proyecto

Cualquier sugerencia de código, datos o texto debe ser coherente con estos marcos:

### Autores centrales

**Gabriel Salazar** (Premio Nacional Historia, Chile)
- *Historia de la acumulación capitalista en Chile* (LOM, 2003) — "acumulación aberrante": el capitalismo chileno opera con capital mercantil-financiero dominante, no industrial
- *Mercaderes, empresarios y capitalistas* (Sudamericana, 2009) — "capital golondrina": flujos nor-occidentales que ingresan en boom y se retiran en crisis, dejando el sector productivo dañado y el financiero más concentrado
- Concepto clave aplicado al proyecto: **el circuito FECU es evidencia de acumulación aberrante** — Cotizante (DL 3.500) → AFP → Corredora SURA → custodia JP Morgan → mercados internacionales nor-occidentales

**David Harvey**
- *The New Imperialism* (Oxford UP, 2003) — "accumulation by dispossession": los circuitos financieros como forma contemporánea de acumulación primitiva; el cierre de bancos chicos es centralización de capital, no fallo de mercado

**Varoufakis, Y.** — *The Global Minotaur* (Zed Books, 2011): EEUU como centro de reciclaje de excedentes; Wall Street como aspiradora de capital periférico. SURA como "señor feudal digital" que extrae renta de la obligatoriedad

**Minsky, H.** — *Stabilizing an Unstable Economy* (1986/2008): las crisis financieras son endógenas; el crédito crea inestabilidad estructural. Aplica a: volatilidad del índice de intermediación (+279% en un día, FECU 31-03-2026)

**Marx (El Capital, Libro I, cap. XXIII-XXIV)**: distinción acumulación / centralización. El cierre de bancos chicos post-2008 (465 en EEUU, 2008-2012, FDIC) = centralización, no acumulación nueva

**Dussel, Quijano, Gramsci, Mignolo** — marco decolonial: la regulación institucional como dispositivo de captura hegemónica; los datos institucionales como ficción que naturaliza la extracción

### El mecanismo central (2008 → Chile actual)

La crisis de 2008 replicó el patrón de 1982-83 chileno (documentado por Salazar):
1. Crisis de liquidez → bancos chicos no sobreviven el credit crunch
2. Activos vendidos a precio de quema a grandes conglomerados (JPMorgan absorbió Bear Stearns + WaMu)
3. Socialización de pérdidas / privatización de ganancias
4. Reguladores validan: "consolidación prudencial"
5. Resultado: mayor concentración + mayor flujo hacia centros nor-occidentales

**La FECU de Corredora SURA (07-04-2026) documenta el estado actual de ese circuito:**
- Todo verde en semáforos CMF
- JP Morgan nombrado como co-custodio de cartera (nota 3 de explicación oficial)
- Volatilidad de 279% absorbida por el sistema de control de variación sin activar alertas
- Trabajadores/afiliados: sin acceso interpretativo al documento

---

## 6. Convenciones de desarrollo

### Rama de trabajo
**Usar siempre `main`.** No crear branches para cambios de datos o features de la tesis. Solo crear branch si se indica explícitamente para experimentos mayores de arquitectura.

### Commits
Formato: `tipo(scope): descripción en español`
- Tipos: `feat`, `fix`, `docs`, `data`, `ux`, `refactor`
- Ejemplos: `feat(data): agregar registro FECU CMF`, `fix(graph): corregir zoom en móvil`

### Al editar `data/*.json`
- Mantener el schema existente (ver `_meta` en cada archivo)
- Nuevos registros en `fuentes-oficiales.json`: incluir siempre `id`, `fuente`, `titulo`, `fecha`, `keywords`, `capa_oficial`, `friccion_con`, `tipo_friccion`, `tags`
- El campo `capa_oficial` debe describir el mecanismo de mistranslation, no solo el contenido
- `capa_etica` es opcional pero recomendado para registros de etnografía directa

### Al editar `src/frictionEngine.js`
- Los marcadores en `FRICTION_MARKERS` deben tener par `a/b` que represente tensión real entre capas
- `peso` entre 0.60 y 0.95
- Agrupar por tipo: semánticos, políticos, técnicos, financiero-institucionales

### Al editar `index.html`
- No partir en múltiples archivos HTML
- Las secciones siguen el orden narrativo: `#hero → #instrumento → #campos → #tensiones → #grafo → #campo-social → #buscador → #triage → #protocolo`
- Dark theme: mantener tokens CSS `--color-etica`, `--color-institucional`, `--color-material`

### Al editar módulos `src/*.js`
- ES5+ compatible (sin módulos ESM nativos en los scripts cargados desde HTML)
- No introducir `import`/`export` a nivel de módulo si rompe la carga directa con `<script>`
- Las funciones públicas de cada módulo se exponen en el objeto global (`window.GraphModule`, etc.)

---

## 7. Secciones de la aplicación

| Sección | ID | Descripción |
|---|---|---|
| Hero | `#hero` | Tesis central + metro de fricción |
| Instrumento | `#instrumento` | Descomposición 3 capas |
| Campos | `#campos` | 4 campos etnográficos |
| Tensiones | `#tensiones` | Explorador de fricción por campo |
| Grafo | `#grafo` | Red SVG fuerza-dirigida |
| Campo Social | `#campo-social` | Simulación termodinámica de entropía institucional |
| Buscador | `#buscador` | Motor de búsqueda híbrida + score auditable + CSV |
| Triage | `#triage` | Dashboard comparativo de cobertura entre casos |
| Protocolo | `#protocolo` | Protocolo de auditoría y notas al pie |

---

## 8. Qué NO hacer

- No instalar npm, yarn, ni ningún package manager
- No usar D3.js, React, Vue, ni ningún framework
- No crear ramas sin indicación explícita
- No resolver la fricción entre capas (el instrumento la expone, no la cierra)
- No añadir lógica de login, autenticación, ni base de datos
- No modificar la paleta de colores sin razón teórica justificada
- No agregar datos que no sean de fuentes oficiales chilenas verificables o etnografía directa documentada
- No traducir los textos al inglés (el proyecto es en español)
