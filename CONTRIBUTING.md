# Guía de Contribución

Gracias por tu interés en contribuir a **Contra-Archivo: Antropología y Corrupción**. Este documento proporciona pautas para contribuir a este proyecto de investigación doctoral.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Contribución](#proceso-de-contribución)
- [Guías de Estilo](#guías-de-estilo)
- [Consideraciones Éticas](#consideraciones-éticas)
- [Licencia](#licencia)

## Código de Conducta

Este proyecto adhiere a un Código de Conducta. Al participar, se espera que lo cumplas. Lee [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) para más detalles.

## ¿Cómo puedo contribuir?

### Reportar Bugs

Antes de crear un bug report, por favor verifica que no exista ya un issue similar. Cuando crees un bug report, incluye tantos detalles como sea posible:

- **Título descriptivo** que identifique claramente el problema
- **Pasos exactos para reproducir** el problema
- **Comportamiento esperado** vs. **comportamiento actual**
- **Screenshots** si es relevante (especialmente para issues de UI)
- **Navegador y versión** (si es un problema de renderizado)
- **Contexto adicional** sobre el problema

### Sugerir Mejoras

Las sugerencias de mejora son bienvenidas. Para proponer una mejora:

1. Verifica que no exista ya un issue similar
2. Crea un issue con el tag `enhancement`
3. Explica claramente:
   - **Qué problema resuelve** la mejora
   - **Cómo lo resolvería** (si tienes una propuesta específica)
   - **Por qué es importante** para el instrumento de investigación

### Contribuir con Datos

**IMPORTANTE**: Este repositorio solo acepta datos de **fuentes públicas oficiales**.

#### Datos aceptables:

- Registros de InfoLobby (audiencias de lobby)
- Documentos de Transparencia Activa (Chile)
- Registros CMF (Comisión para el Mercado Financiero)
- Proyectos SEIA (Sistema de Evaluación de Impacto Ambiental)
- Leyes y decretos de LeyChile
- Tramitación legislativa BCN
- Licitaciones de ComprasPublicas
- Datos SII (solo públicos)

#### Datos NO aceptables:

- Testimonios identificables de personas
- Documentos internos de instituciones
- Información personal (RUT, direcciones, teléfonos)
- Datos sin fuente pública verificable
- Filtraciones o leaks

#### Proceso para añadir datos:

1. Verifica que la fuente sea pública y oficial
2. Agrega el registro a `data/fuentes-oficiales.json` siguiendo el schema existente
3. Incluye todos los campos requeridos:
   - `id`: único, formato kebab-case
   - `fuente`: debe estar en la lista validada (ver `tests/dataValidation.test.js`)
   - `titulo`: descriptivo
   - `fecha`: ISO 8601 (YYYY-MM-DD)
   - `keywords`: array de términos clave
   - `capa_oficial`: descripción de la mistranslation institucional
   - `friccion_con`: debe corresponder a un caso existente en `data/casos.json`
   - `tipo_friccion`: `politica`, `semantica` o `tecnica`
4. Ejecuta las validaciones: `node tests/runner.js`
5. Abre un PR con el tag `data`

### Contribuir con Código

#### Antes de empezar:

1. Lee las **instrucciones completas** en `.github/copilot-instructions.md`
2. Familiarízate con la arquitectura del proyecto (ver README.md)
3. Verifica que tu propuesta no esté ya implementada o en desarrollo
4. Abre un issue para discutir cambios grandes antes de implementarlos

#### Stack técnico:

- **HTML5 + CSS3 + Vanilla JavaScript** — CERO dependencias externas
- **Sin frameworks**: No D3, no React, no Vue, no build tools
- Excepto `/terraza`: Next.js 15 + TypeScript (admin privado)

#### Flujo de trabajo:

1. Fork el repositorio
2. Crea una rama desde `main`: `git checkout -b tipo/descripcion-breve`
   - Tipos: `feat`, `fix`, `docs`, `data`, `ux`, `refactor`
3. Haz tus cambios siguiendo las guías de estilo
4. Ejecuta los tests: `node tests/runner.js`
5. Ejecuta validaciones HTML si modificaste archivos HTML
6. Commit con mensajes descriptivos (ver sección de Commits)
7. Push a tu fork
8. Abre un Pull Request contra `main`

## Proceso de Contribución

### Pull Requests

#### Checklist antes de abrir un PR:

- [ ] Los tests pasan (`node tests/runner.js`)
- [ ] El código sigue las guías de estilo
- [ ] Añadiste tests si creaste nueva funcionalidad
- [ ] Actualizaste la documentación si es necesario
- [ ] El PR tiene un título descriptivo
- [ ] La descripción del PR explica QUÉ cambia y POR QUÉ
- [ ] Verificaste que no expones datos sensibles
- [ ] Los commits están bien formateados

#### Revisión de PRs:

- Los mantenedores revisarán tu PR lo antes posible
- Puede haber solicitudes de cambios o mejoras
- Una vez aprobado, un mantenedor hará merge
- Las ramas se eliminan automáticamente después del merge (ver `.github/workflows/branch-cleanup.yml`)

#### PRs que serán rechazados:

- PRs que introduzcan dependencias externas al proyecto principal (excepto `/terraza`)
- PRs que expongan datos sensibles o información privada
- PRs sin tests para funcionalidad nueva
- PRs que rompan tests existentes sin justificación
- PRs que no sigan las guías de estilo
- PRs con commits mal formateados o sin descripción

## Guías de Estilo

### JavaScript

- **ES5+ compatible** (sin ESM en el proyecto principal)
- **Sin dependencias externas** (salvo terraza/)
- **Nombres descriptivos**: `calculateFrictionScore()` no `calcFS()`
- **Comentarios**: Solo cuando añaden claridad conceptual, no obviedades
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones**: camelCase
- **Clases**: PascalCase

Ejemplo:
```javascript
const FRICTION_THRESHOLD = 0.7;

function calculateFrictionScore(nodeA, nodeB) {
  // Mide distancia epistemológica entre dos nodos
  const overlap = getKeywordOverlap(nodeA.keywords, nodeB.keywords);
  const markerMatch = checkFrictionMarkers(nodeA, nodeB);
  return 0.5 * (1 - overlap) + 0.3 * markerMatch;
}
```

### CSS

- **Mobile-first**: queries `@media (min-width: ...)`
- **Tokens CSS**: usa variables CSS definidas en `styles/shared.css`
- **BEM naming**: `.component__element--modifier`
- **No selectores genéricos** en bloques `<style>` inline (ver `tests/htmlLint.test.js`)

### HTML

- **Semántico**: usa `<nav>`, `<section>`, `<article>`, `<aside>` apropiadamente
- **Accesibilidad**: 
  - Todos los inputs tienen `<label>` asociado
  - Botones con `aria-label` descriptivo
  - Navegación con `aria-current="page"`
  - Skip link presente
- **Cache-busting**: CSS/JS con `?v=YYYYMMDD` en sync (ver memories)

### Tests

- Ubicación: `tests/` 
- Ejecutar: `node tests/runner.js`
- Nombrar: `<modulo>.test.js`
- Mínimo 80% de cobertura en nueva funcionalidad crítica

### Commits

Formato: `tipo(scope): descripción en español`

Tipos válidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `data`: Añadir o modificar datos
- `ux`: Mejoras de experiencia de usuario
- `refactor`: Refactorización sin cambio de funcionalidad
- `test`: Añadir o modificar tests
- `ci`: Cambios en CI/CD

Ejemplos:
```
feat(graph): añadir filtro por tipo de fricción
fix(searchEngine): corregir score en keywords vacías
data(fuentes): añadir 3 registros SEIA 2024
docs(README): actualizar sección de arquitectura
ux(mobile): mejorar navegación en pantallas pequeñas
```

**NO** hacer:
- Commits genéricos: "fix bug", "update files"
- Commits con múltiples features sin relación
- Commits que rompen la build
- Commits con datos sensibles

## Consideraciones Éticas

Este proyecto investiga corrupción institucional en Chile. Es fundamental mantener estándares éticos rigurosos:

### Protección de Participantes

- **Nunca** incluyas nombres reales de participantes etnográficos
- **Nunca** incluyas información identificable de personas
- Los casos tienen nombres genéricos o institucionales ("La Negra", "SURA", "OIT 169")
- Los testimonios están agregados y anonimizados

### Fuentes de Datos

- **Solo** datos de fuentes públicas oficiales verificables
- **Siempre** cita la fuente con URL si está disponible
- **Nunca** uses leaks, filtraciones o documentos confidenciales
- Si tienes duda sobre si un dato es público, pregunta antes de añadirlo

### Crítica Institucional Fundamentada

- Las críticas a instituciones deben estar respaldadas por evidencia
- Distingue entre análisis crítico (bienvenido) y difamación (inaceptable)
- El marco teórico es académico (Harvey, Salazar, Dussel, Gramsci, Mignolo)
- La "mistranslation" es un concepto analítico, no un juicio moral simplista

### Soberanía de Conocimiento

- Respeta los conocimientos territoriales de comunidades indígenas
- El caso "La Negra" trata sobre territorio Mapuche-Huilliche con respeto
- Convenio OIT 169 es analizado desde perspectiva decolonial
- No extractivismo de conocimiento: los datos sirven al análisis crítico, no al sensacionalismo

## Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International**.

Esto significa:
- Tu trabajo será acreditado
- Puede ser usado para fines académicos y educativos
- No puede ser usado comercialmente
- Derivados deben compartir la misma licencia

Ver [LICENSE](LICENSE) para detalles completos.

## Preguntas

¿Tienes preguntas sobre cómo contribuir?

- Abre un issue con el tag `question`
- Contacta al equipo: **contribuciones@vientonorte.cl**
- Lee la documentación completa en [README.md](README.md) y [HANDOFF.md](HANDOFF.md)

## Recursos Adicionales

- [README.md](README.md) — Descripción del proyecto y arquitectura
- [HANDOFF.md](HANDOFF.md) — Estado operativo y roadmap
- [PIPELINE.md](PIPELINE.md) — CI/CD y workflows
- [DESIGN_SPRINT.md](DESIGN_SPRINT.md) — Feature map y diseño de producto
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — Instrucciones técnicas completas

---

Gracias por contribuir a la investigación crítica sobre corrupción institucional. Tu trabajo ayuda a hacer visible la mistranslation sistemática entre regímenes de verdad.

**Colectivo Viento Norte** · [@vientonorte](https://github.com/vientonorte)
