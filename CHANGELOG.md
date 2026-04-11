# CHANGELOG

## [2026-04-09] Fix crítico: rutas absolutas en scripts y manifest para GitHub Pages

| 2026-04-09 | Fix crítico: rutas absolutas en scripts y manifest para GitHub Pages |
|------------|-----------------------------------------------------------------------------------|
|            | Se cambiaron todas las rutas de scripts JS y manifest en `index.html` a absolutas (`/antropologia-corrupcion/...`). |
|            | Motivo: los recursos no cargaban en producción por rutas relativas, rompiendo el grafo y módulos JS. |
|            | Validado: sin errores de sintaxis, checklist QA superado. |

## [2026-04-09] Fix QA defensivo: inicialización robusta del grafo

- Se añadió verificación para abortar y mostrar error visible si los datos del grafo (`CASOS`) no están listos al inicializar.
- Overlay de loading ahora se oculta y da feedback inmediato si hay error de datos.
- Validado en producción: deploy exitoso (ver captura de Actions, todos los workflows verdes).
