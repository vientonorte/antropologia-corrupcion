# Arquitectura de investigacion y navegacion

## 1) Objetivo
Este documento define la arquitectura de investigacion del Contra-Archivo y su traduccion a rutas de navegacion.
La regla de diseno es simple: no cerrar la friccion entre capas, sino volverla legible y auditable.

## 2) Principios
- Coherencia teorica: etica, institucional y material se exponen como capas en tension.
- Progresion por profundidad: onboarding publico -> exploracion avanzada -> instrumento -> espacio privado.
- Privacy by design: el espacio privado requiere autenticacion y no se expone como contenido publico.
- Trazabilidad: cada ruta tiene proposito, perfil y salida clara.

## 3) Mapa de rutas
- landing.html: entrada publica y onboarding rapido.
- buscador.html: exploracion avanzada por categorias, filtros y friccion.
- index.html: instrumento principal de tesis (lectura integral).
- tesis.html: biblioteca y apoyo documental.
- login.html: puerta de acceso al espacio privado.
- privado.html: trabajo interno de investigacion (solo sesion valida).
- admin.html: superficie restringida y no indexable.

## 4) Journeys priorizados
### Journey A: visitante publico
1. Entra a landing.html
2. Ejecuta busqueda rapida
3. Si requiere profundidad, pasa a buscador.html o index.html
4. Si requiere material reservado, pasa a login.html

### Journey B: investigacion publica avanzada
1. Entra a buscador.html
2. Filtra por categoria, fuente, anio y friccion
3. Contrasta hallazgos con index.html
4. Revisa soporte teorico en tesis.html

### Journey C: investigacion privada
1. Entra a login.html
2. Autentica passkey
3. Entra a privado.html
4. Puede volver a index.html, buscador.html o tesis.html sin perder contexto narrativo

## 5) Card sorting operativo (navegacion)
Cluster 1: Descubrir
- Inicio publico (landing.html)
- Buscador avanzado (buscador.html)

Cluster 2: Comprender
- Instrumento (index.html)
- Tesis (tesis.html)

Cluster 3: Profundizar con control
- Acceso privado (login.html)
- Espacio privado (privado.html)

Regla de orden en menu global:
1. Inicio publico
2. Buscador avanzado
3. Instrumento
4. Tesis
5. Acceso privado
6. Contra-Archivo

## 6) Riesgos UX detectados y control
- Riesgo: confusion entre landing y buscador avanzado.
  - Control: labels explicitos en menu global y footer.
- Riesgo: salto directo a privado sin contexto de acceso.
  - Control: acceso privado via login.html como puerta unica.
- Riesgo: dead-end en rutas de profundidad.
  - Control: enlaces cruzados entre buscador, instrumento y tesis.

## 7) Criterios de aceptacion
- La navegacion global usa labels consistentes en todas las paginas con shell unificado.
- Todo usuario puede identificar diferencia entre onboarding y busqueda avanzada.
- El acceso a privado pasa por login (aunque privado mantenga guardas de sesion).
- No se agregan dependencias, frameworks ni backend.

## 8) Referencias internas
- .github/copilot-instructions.md
- docs/Estado del Arte/README.md
