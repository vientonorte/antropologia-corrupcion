---
# ── IDENTIFICACIÓN ──────────────────────────────────────────────────────────
id: "SLUG-UNICO"           # snake-case, único en casos.json
titulo: "Título del caso"
anio: 2024
estado: "borrador"          # borrador | en-proceso | publicable | archivado

# ── ACTORES E INSTITUCIONES ──────────────────────────────────────────────────
actores:
  - "Actor 1"
  - "Actor 2"
instituciones:
  - "Institución 1"

# ── CAPAS DE VERDAD ──────────────────────────────────────────────────────────
etica_titulo: "Subtítulo capa ética"
etica_descripcion: ""
etica_voces:
  - ""
etica_documentos_ref:
  - ""
etica_keywords:
  - ""
etica_color: "#c8a96e"

institucional_titulo: "Subtítulo capa institucional"
institucional_descripcion: ""
institucional_documentos:
  - ""
institucional_clasificaciones:
  - ""
institucional_keywords:
  - ""
institucional_color: "#4a7fa5"

material_titulo: "Subtítulo capa material"
material_descripcion: ""
material_evidencias:
  - ""
material_keywords:
  - ""
material_color: "#7a9e6e"

# ── FRICCIÓN ─────────────────────────────────────────────────────────────────
friccion_tipo: "politica"          # politica | economica | juridica | simbolica
friccion_subtipo: "semantica"      # semantica | practica | normativa | territorial
friccion_intensidad: 0.75          # 0.0 → 1.0
friccion_estado: "abierta"         # abierta | latente | cerrada
friccion_descripcion: ""
friccion_tension_central: ""
friccion_sin_resolver: true

# ── GRAFOS: ENTROPÍA Y MAGNETISMO ────────────────────────────────────────────
# Cada nodo alimenta fieldPhysics.js (magnetismo) y socialField.js (entropía)
nodos:
  - id: "nodo-1"
    capa: "etica"               # etica | institucional | material
    tipo: "actor"               # actor | dispositivo | norma | territorio | evento
    peso_friccion: 0.80         # carga coulombiana para fieldPhysics (magnetismo)
    entropia_calor: 0.60        # calor inicial para socialField (entropía)
    masa_poder: 0.50            # curva el espacio legal en socialField
    fuente_id: "ref-documento"
    fecha_evidencia: "YYYY-MM-DD"
    descripcion: ""
  - id: "nodo-2"
    capa: "institucional"
    tipo: "norma"
    peso_friccion: 0.70
    entropia_calor: 0.40
    masa_poder: 0.65
    fuente_id: "ref-ley"
    fecha_evidencia: "YYYY-MM-DD"
    descripcion: ""

# Relaciones entre nodos (alimentan edges del grafo)
relaciones:
  - source: "nodo-1"
    target: "nodo-2"
    tipo: "criminalizó"         # verbo activo que nombra la relación
    peso: 0.80
    friccion: 0.75
    descripcion: ""

# ── GROUNDED THEORY ──────────────────────────────────────────────────────────
# Rellenar en el cuerpo del documento (sección ## Codificación)

# ── CONEXIONES CON OTRAS FICHAS ──────────────────────────────────────────────
conexiones:
  - "id-otro-caso"

tags:
  - ""

# ── FUENTES ──────────────────────────────────────────────────────────────────
fuentes_primarias:
  - ""
fuentes_secundarias:
  - ""
---

# {{titulo}}

> **Estado:** {{estado}} · **Año:** {{anio}}
> **Tipo de fricción:** {{friccion_tipo}} / {{friccion_subtipo}} · **Intensidad:** {{friccion_intensidad}}

---

## Nota de método

*Describir brevemente el tipo de fuentes, el alcance de las afirmaciones y la posición del investigador respecto al caso.*

---

## Descripción del caso

*Hecho documentado.* 

---

## Capa ética — {{etica_titulo}}

*Experiencia vivida, testimonios, voces situadas.*

---

## Capa institucional — {{institucional_titulo}}

*Regímenes de clasificación, documentos oficiales, normativa aplicada.*

---

## Capa material — {{material_titulo}}

*Territorio, evidencia física, densidad histórica.*

---

## Fricción central

**Tensión:** {{friccion_tension_central}}

*Descripción de la fricción epistemológica y por qué permanece sin resolver.*

---

## Codificación GT

### Open coding

- `código-emergente-1` — descripción breve
- `código-emergente-2` — descripción breve

### Axial coding

*Relaciones entre códigos: qué habilita qué, qué tensiona qué.*

### Selective coding

> **Categoría central:** *enunciar en una frase la estructura que organiza todos los demás códigos.*

---

## Dimensiones D1–D7

| Dim. | Eje | Contenido para este caso |
|------|-----|--------------------------|
| D1 | Actor/Sujeto | |
| D2 | Régimen de verdad | |
| D3 | Normativa | |
| D4 | Mecanismo de fricción | |
| D5 | Temporalidad | |
| D6 | Escala territorial | |
| D7 | Archivo disponible | |

---

## Anchors teóricos

- [CITA PENDIENTE] — autor, obra, año, página

---

## Vínculos con otras fichas

- [[SLUG-OTRO-CASO]] — cómo se relacionan

---

## Definition of Done

- [ ] Open / axial / selective coding completos
- [ ] Mapeo D1–D7 completo
- [ ] Anchor teórico citado con referencia exacta
- [ ] Fuentes primarias y secundarias listadas
- [ ] Sitio de fricción identificado
- [ ] Nodos y relaciones declarados en frontmatter (alimentan grafos)
- [ ] Apertura analítica (no conclusión cerrada)
- [ ] Vínculos con otras fichas
