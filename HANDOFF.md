# Handoff Operativo — Contra-Archivo

Fecha: 2026-04-06
Rama: `main`
Estado git al cierre: limpio (`main...origin/main`)

## 1) Alcance entregado

Se cerraron tres líneas de implementación en la experiencia publicada:

- Mobile UX del grafo:
  - Estado de foco visible en móvil.
  - Acción rápida `Limpiar foco` en la toolbar del grafo.
  - Ajustes responsive para controles (sticky, targets táctiles más grandes, leyenda adaptada, altura del grafo).
- Auditabilidad del score en buscador:
  - Fuente de cálculo visible por resultado (`frictionEngine.explainRecordFriction`).
  - Pesos del score visibles (distancia 50%, marcador 30%, tipo 20%).
- Exportación CSV:
  - Buscador: exporta resultados filtrados desde panel de stats.
  - Triage: exporta modelo comparativo y permite abrir el caso prioritario en buscador.

## 2) Archivos clave tocados

- `index.html`
  - UI del grafo móvil (hint, estado, botón de reset).
  - Helpers de triage CSV (`triageCsvEscape`, `downloadTriageCsv`, `exportTriageModelCsv`).
  - Wiring de botones de triage (`#triage-export-csv`, `#triage-open-priority`).
  - Sincronización del estado de foco del grafo (`setGraphFocusMessage`).
- `src/searchEngine.js`
  - Constante `SEARCH_SCORE_WEIGHTS`.
  - Enriquecimiento de auditoría (`source`, `weights`).
  - Exportación CSV de resultados (`exportCurrentResultsCSV`).
  - Botón de export en stats (`data-se-export="results"`).
- `README.md`
  - Estado actualizado y registro de changelog reciente.

## 3) Commits relevantes

- `6c565d8` — feat: mejorar UX móvil del grafo y exportes auditables
- `7bd83d4` — docs: actualizar logs de mejoras mobile y auditabilidad

## 4) Verificación ejecutada

- Chequeo de sintaxis JS en `src/searchEngine.js` con `node --check`.
- Extracción + chequeo de sintaxis del bloque `<script>` inline de `index.html`.
- Búsqueda de corrupción de operadores (`? .` y `? ?`) en archivos editados.
- Diagnóstico de editor: sin errores en `index.html` y `src/searchEngine.js`.

## 5) Riesgos conocidos

- El formatter puede corromper `?.` y `??` en este repo si se fuerza formato sobre JS/HTML inline.
- `index.html` concentra CSS y JS inline extensos; cambios grandes deben hacerse por bloques pequeños y validar sintaxis cada vez.

## 6) Runbook de continuidad

1. Levantar sitio local por HTTP:
   - `npx serve .`
2. Verificar smoke manual:
   - Grafo: tocar nodo, validar foco visible, usar `Limpiar foco`.
   - Buscador: ejecutar búsqueda, abrir detalle de score, exportar CSV.
   - Triage: exportar CSV y abrir caso prioritario en buscador.
3. Antes de commit:
   - Buscar corrupción: `grep -nE "\? \\.|\? \?" index.html src/*.js`
   - `node --check` a módulos editados.
   - Si se tocó script inline: extraer bloque y validar con `node --check`.

## 7) Próximos pasos sugeridos

- Añadir tests de regresión mínima para export CSV (columnas y orden esperados).
- Separar progresivamente CSS/JS inline de `index.html` a módulos dedicados para reducir riesgo operativo.
- Incorporar descarga CSV con nombre contextual (filtros activos + fecha) en buscador.
