# CHANGELOG

## [2026-04-19] Mejoras de sesiones — navegación unificada y UX

| 2026-04-19 | Mejoras de sesiones: navegación, responsive, PWA, skeleton loading |
|------------|-------------------------------------------------------------------|
|            | Navegación unificada en las 5 páginas producto (landing, buscador, login, privado, tesis): enlaces consistentes a Buscador, Instrumento, Biblioteca, Acceder. |
|            | login.html: añadido site-header, favicon, manifest.json, diseño responsive para móvil (media query 480px). |
|            | landing.html y buscador.html: añadido enlace a Biblioteca en navegación + manifest.json. |
|            | privado.html: añadido manifest.json. |
|            | tesis.html: skeleton loading para grid de publicaciones. |
|            | DESIGN_SPRINT.md: actualizado mapa de features A→Ñ al estado real (13 de 14 features implementadas). |
|            | DEPRECATIONS.md: actualizado de 16 a 18 ramas deprecadas (todas mergeadas en main). |

## [2026-04-19] Consolidación de ramas — unificación en `main`

| 2026-04-19 | Consolidación de 16 ramas paralelas en `main` |
|------------|------------------------------------------------|
|            | Se auditaron y deprecaron 16 ramas (`claude/*` y `copilot/*`) generadas por procesos automatizados. |
|            | Verificación: `git branch -r --merged origin/main` confirmó que todas estaban 100% integradas. |
|            | Sin pérdida de trabajo: ninguna rama contenía código original no mergeado en `main`. |
|            | Documentación de deprecación: ver `DEPRECATIONS.md`. |
|            | Resultado: repositorio con rama única `main` (protegida), limpia y estable. |

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
