# Design Sprint Prompt — Contra-Archivo Sprint 20

## Instrucción Única de Design Sprint

> **Prompt para el agente de desarrollo:**
>
> Eres el Tech Lead y Scrum Master del proyecto *Contra-Archivo: Antropología y Corrupción*. Tu objetivo es ejecutar un Design Sprint de 5 fases que integre la narrativa Gödel–Fricción, la nueva evidencia AFP, y los artefactos pendientes de deploy. Aplica buenas prácticas de documentación Scrum en cada fase.

---

## Contexto del Proyecto

**Producto:** Instrumento cualitativo web (zero-dependency HTML5/CSS3/Vanilla JS) que cuantifica fricción epistemológica entre 3 regímenes de verdad (ética, institucional, material) en 4 campos etnográficos de Chile.

**Deploy:** GitHub Pages — `https://vientonorte.github.io/antropologia-corrupcion/`

**Stack:** HTML5 + CSS3 + Vanilla JS (ES5+, sin bundler, sin frameworks). 7 módulos JS: `frictionEngine`, `fieldPhysics`, `graph`, `nodeRenderer`, `socialField`, `searchEngine`, `main`.

**Modelos físicos:**
- Entropía Shannon: `S = 0.6·H(Q) + 0.4·max(ρ,δ)`
- Ley de Ohm Social: `I = V/R`
- Score de fricción buscador: `0.5*(1-overlap) + 0.3*marker + 0.2*tipo_penalty`
- **[NUEVO]** Incompletitud Institucional: `I(F) = 1 - |verdades expresables| / |verdades relevantes|`

**Ramas:**
- `main` — producción (GitHub Pages)
- `codex/mejora-el-artefacto-del-proyecto` — contenido académico (cronología del despojo, conclusiones)
- `copilot/donde-quedamos` — narrativa hipótesis P3, PDFs

---

## Fase 1 — ENTENDER (Map & Define)

### Product Backlog priorizado (MoSCoW)

| Prioridad | Item | Tipo | Estimación |
|---|---|---|---|
| **MUST** | Push buscador de fricción a producción | Deploy | 1 SP |
| **MUST** | Integrar narrativa Gödel al index.html (nueva sección 06) | Feature | 3 SP |
| **MUST** | Validar JSON fuentes-oficiales con nuevo registro AFP | QA | 1 SP |
| **SHOULD** | Añadir visualización del Triángulo de Imposibilidad | Feature | 5 SP |
| **SHOULD** | Merge contenido académico de ramas codex/copilot | Integration | 3 SP |
| **SHOULD** | Crear tests automatizados (node --check + lint) | QA | 2 SP |
| **COULD** | Internacionalizar a inglés (i18n) | Feature | 8 SP |
| **WON'T** | Migrar a framework (React/Svelte) | Refactor | ∞ |

### Definition of Done (DoD)

- [ ] Código sin `? .` ni `? ?` (verificar VS Code formatter corruption)
- [ ] `node --check` pasa en todos los .js
- [ ] HTML sin IDs duplicados
- [ ] Secciones numeradas secuencialmente 01-N
- [ ] Funcional en Safari, Chrome, Firefox (mobile + desktop)
- [ ] `git push origin main` exitoso
- [ ] Producción refleja los cambios (verificar GitHub Pages)

---

## Fase 2 — DIVERGIR (Sketch & Ideate)

### User Stories para Sprint 20

**US-01: Narrativa Gödel visible en producción**
```
COMO investigador doctoral
QUIERO ver la conexión entre los teoremas de incompletitud de Gödel y la fricción institucional en el sitio web
PARA fundamentar formalmente que la mistranslation es un límite estructural, no un error corregible
```
**Criterios de aceptación:**
- [ ] Nueva sección entre Entropía (05) y Buscador (06) — será sección 06, resto se renumera
- [ ] Incluye: analogía Gödel 1 → fricción, Gödel 2 → auto-auditoría, Halting → proceso/justicia
- [ ] Triángulo de Imposibilidad visible (SVG o CSS)
- [ ] Cita a Veritasium como puerta de entrada pedagógica
- [ ] La fórmula I(F) se renderiza legible

**US-02: Evidencia AFP integrada y navegable**
```
COMO usuario del buscador de fricción
QUIERO encontrar el registro de la reunión AFP/corredora cuando busco "segmentación" o "AFP"
PARA ver evidencia etnográfica directa junto a las fuentes oficiales
```
**Criterios de aceptación:**
- [ ] El registro `evidencia-afp-segmentacion-2026` aparece en el buscador
- [ ] Se distingue visualmente como "etnografía directa" (no fuente oficial)
- [ ] El campo `contexto_etnografico` se muestra completo en la card expandida
- [ ] La búsqueda "AFP" devuelve: lobby-sura-cmf-2024 + cmf-sancion-sura-2024 + evidencia-afp-2026

**US-03: Buscador en producción**
```
COMO visitante del sitio
QUIERO usar el buscador de fricción institucional
PARA explorar la distancia entre discurso oficial y realidad documentada
```
**Criterios de aceptación:**
- [ ] Sección visible en producción con los 18 registros
- [ ] Filtros por fuente, caso y tipo de fricción funcionan
- [ ] Stats panel muestra score promedio y distribución por fuente
- [ ] Responsive en mobile

---

## Fase 3 — DECIDIR (Storyboard & Prioritize)

### Sprint Goal

> **Hacer visible en producción la fundamentación formal (Gödel), la evidencia etnográfica nueva (AFP/corredora) y el buscador de fricción — todo en un único deploy coherente.**

### Arquitectura de secciones propuesta

```
01 — Instrumento .............. (existente)
02 — 4 Campos Etnográficos .... (existente)
03 — Tensiones por campo ...... (existente)
04 — Grafo de conexiones ...... (existente)
05 — Entropía institucional ... (existente)
06 — Incompletitud Gödeliana .. [NUEVO — narrativa física]
07 — Buscador de fricción ..... [NUEVO — pendiente deploy]
08 — Protocolo ................ (existente, renumerar)
09 — Contra-archivo abierto ... (existente, renumerar)
```

### Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| VS Code formatter corrompe `?.` → `? .` | Crítico — rompe todo JS | Editar vía `perl -i -pe` o terminal; pre-commit hook activo |
| Inline `<script>` con SyntaxError mata toda la página | Crítico | `node --check` obligatorio post-patch |
| GitHub Pages cache (5-10 min) | Bajo | Verificar con `?v=timestamp` |
| Merge de ramas codex/copilot genera conflictos | Medio | Posponer al Sprint 21; cherry-pick selectivo si es necesario |
| Sokal warning: uso metafórico de Gödel | Medio — credibilidad académica | Nota metodológica explícita en narrativa y en sección web |

---

## Fase 4 — PROTOTIPAR (Build)

### Tareas técnicas ordenadas

```
T-01  Validar JSON fuentes-oficiales.json (node -e "JSON.parse(...)")
T-02  Actualizar FUENTES_DATA inline en index.html con registro AFP
T-03  Crear HTML/CSS para sección 06 Incompletitud Gödeliana
T-04  Renumerar secciones 06→07 (Buscador), 07→08 (Protocolo), 08→09 (Archivo)
T-05  Actualizar navegación (links top + bottom mobile)
T-06  node --check en todos los .js y scripts inline
T-07  Grep antipatterns: "? ." y "? ?" en todos los archivos
T-08  Test manual: búsqueda "AFP" devuelve 3 resultados
T-09  Git add + commit + push
T-10  Verificar producción en GitHub Pages
```

### Checklist de documentación Scrum

- [ ] `SPRINT_20_GODEL.md` — Sprint planning + retrospective
- [ ] `NARRATIVA_GODEL_FRICCION.md` — Documento teórico completo
- [ ] `CHANGELOG.md` actualizado con Sprint 20
- [ ] `README.md` actualizado con nueva sección

---

## Fase 5 — VALIDAR (Test & Learn)

### Criterios de validación

**Funcional:**
- [ ] Todas las secciones cargan sin errores en consola
- [ ] El grafo SVG se renderiza con 4 nodos
- [ ] La entropía Shannon se actualiza en tiempo real
- [ ] El buscador devuelve resultados para queries: "territorio", "AFP", "lobby", "consulta"
- [ ] La evidencia AFP muestra badge "Etnografía directa"
- [ ] Los 7 scripts (.js) se cargan sin 404

**Contenido:**
- [ ] La narrativa Gödel incluye nota metodológica (contra Sokal)
- [ ] Las fórmulas se renderizan legiblemente
- [ ] Los 4 campos mapean a sentencias gödelianas

**Cross-browser:**
- [ ] Safari iOS ✓
- [ ] Chrome desktop ✓
- [ ] Firefox desktop ✓

### Métricas de éxito del Sprint

| Métrica | Target | Cómo medir |
|---|---|---|
| Secciones en producción | 9 | Contar en DOM |
| Registros en buscador | 18 | Contar cards |
| Errores JS consola | 0 | DevTools |
| Lighthouse Performance | > 80 | Lighthouse audit |
| Tiempo de deploy | < 10 min | Reloj |

---

## Inventario de Evidencia Actual

### Fuentes oficiales curadas (17 + 1)
| Fuente | Cantidad | Casos vinculados |
|---|---|---|
| InfoLobby | 3 | SURA, La Negra, OIT169 |
| Transparencia | 3 | SURA, Periodismo, La Negra |
| LeyChile/BCN | 5 | Transversal |
| SEIA | 2 | La Negra, OIT169 |
| ComprasPúblicas | 2 | La Negra, Periodismo |
| CMF | 2 | SURA |
| **Etnografía directa** | **1** | **SURA/AFP** |

### Documentos teóricos
- `NARRATIVA_GODEL_FRICCION.md` — Puente Gödel ↔ Fricción (180+ líneas)
- `SPRINT_19_BUSCADOR.md` — Documentación buscador
- `SPRINT_20_GODEL.md` — Este sprint

### Ramas pendientes de merge
- `codex/mejora-el-artefacto-del-proyecto` — Cronología del despojo, conclusiones
- `copilot/donde-quedamos` — Hipótesis P3, narración académica

---

## Comando de Ejecución

Para que un agente AI ejecute este sprint completo:

```
Ejecuta el Sprint 20 del Contra-Archivo según el Design Sprint documentado en 
docs/DESIGN_SPRINT_PROMPT.md. Sigue las 10 tareas técnicas de la Fase 4 en orden 
secuencial. Aplica la Definition of Done antes de hacer push. Reporta métricas de 
la Fase 5 al completar.

Restricciones técnicas:
- NO usar optional chaining (?.) — el formatter de VS Code lo corrompe
- NO usar nullish coalescing (??) — misma razón
- Verificar con node --check después de cada edición de JS
- Usar perl -i -pe para ediciones de JS si replace_string_in_file introduce ? .
- Testear búsqueda "AFP" y confirmar 3 resultados antes de push
```

---

*Sprint planificado: abril 2026*  
*Velocidad estimada: 13 SP (MUST) + 10 SP (SHOULD) = 23 SP total*  
*Recomendación: ejecutar MUST en Sprint 20, SHOULD en Sprint 21*
