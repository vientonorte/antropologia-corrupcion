# Revisión de ramas y plan de mejoras

Fecha de revisión: 2026-04-23 (UTC)

## 1) Inventario real de ramas

Se revisaron referencias locales y remotas del repositorio.

- Ramas locales detectadas: `work`
- Ramas remotas detectadas: ninguna (no hay `origin` configurado)
- Último commit en `work`: `a91c5b4` (2026-04-20)

**Conclusión:** hoy no existe un set de “todas las ramas” para comparar entre sí; el repositorio opera de facto en una única rama de trabajo.

## 2) Hallazgos técnicos que afectan la estrategia de ramas

### 2.1 Calidad de datos/tests

La suite de pruebas (`node tests/runner.js`) muestra 2 fallos de integridad de datos en `data/fuentes-oficiales.json`:

1. `fuente = "diario-financiero"` no está en el set permitido del test.
2. `friccion_con = "lobby-energetico-zonas-sacrificio"` no referencia un caso válido en `data/casos.json`.

Esto sugiere **deriva entre el esquema esperado por tests y los datos cargados**.

### 2.2 Riesgo de gobernanza Git

Con una sola rama activa:

- No hay aislamiento de cambios por feature/fix.
- No hay puerta de calidad por PR antes de integrar.
- Se dificulta auditar regresiones por temática (datos, UI, motor, narrativa).

## 3) Plan de mejoras propuesto

## Fase 0 (inmediata, 1-2 días)

1. **Formalizar estrategia de ramas mínima**
   - `main` (estable / deploy)
   - `develop` (integración)
   - `feature/*`, `fix/*`, `data/*` (trabajo acotado)
2. **Activar convención de PR**
   - Título semántico (`feat:`, `fix:`, `data:`, `docs:`)
   - Checklist de validación (tests, impacto en dataset, evidencia visual si aplica).
3. **Corregir los 2 fallos actuales de tests**
   - Unificar catálogo de `fuente` permitido.
   - Resolver referencia de `friccion_con` inválida.

## Fase 1 (corto plazo, 1 semana)

1. **CI en cada PR**
   - Ejecutar `node tests/runner.js` obligatoriamente.
   - Bloquear merge si fallan pruebas.
2. **Code owners ligeros por área**
   - `data/*` → revisión de consistencia semántica.
   - `src/*` y `*.html`/`styles/*` → revisión técnica/UI.
3. **Plantillas de issue/PR**
   - Bug de datos, mejora de UX, mejora de performance, investigación.

## Fase 2 (mediano plazo, 2-4 semanas)

1. **Contrato de datos versionado**
   - Definir esquema JSON explícito (campos obligatorios + enums únicos).
   - Añadir test de compatibilidad retroactiva por versión.
2. **Release cadence**
   - Tag mensual (`vYYYY.MM`) desde `main`.
   - Changelog orientado a investigación + técnica.
3. **Métricas de flujo Git**
   - Lead time PR, tasa de fallos de CI, ratio hotfix/release.

## 4) Backlog priorizado (sugerido)

1. `fix/data-fuentes-schema` (alto impacto, bajo esfuerzo)
2. `chore/branching-model` (alto impacto, bajo esfuerzo)
3. `ci/tests-runner` (alto impacto, esfuerzo medio)
4. `docs/pr-template-checklist` (impacto medio, bajo esfuerzo)
5. `refactor/data-contract-versioning` (alto impacto, esfuerzo medio/alto)

## 5) Resultado esperado

Con este plan, el repositorio pasa de un flujo “single branch” a un flujo auditable con integración controlada, reduciendo regresiones de datos y mejorando trazabilidad entre investigación, narrativa y código.
