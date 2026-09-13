# Revisor metodológico · INDEX v13 × informe Cap V × Gemini

**Rol:** revisor (no Gemini). **Canon:** EPISTEMIC_SPEC v0 · código gana.  
**Fecha:** 2026-09-11. **No LinkedIn** el informe Cap V (el propio Doc lo prohíbe).

## Qué sostiene (HECHO)

- Dos obras = una tesis: motor = cómo sabemos; Contra-Archivo = qué permanece.
- Informe Cap V (Doc `1qZiVblvxUFPKjTsTvfxFl_rCTT7OJ4IDVPW16ckxrUo`): etnografía de archivo + observación retrospectiva; pregunta de separación BD AFP↔Investments; sin PII; Optimus/Mosto = NO DATO; Salesforce ≠ migración AFP; PR#250 = capa mercado.
- Hilo multi-situado **propuesto** (Marcus): mistranslation norma/arquitectura/práctica. Eso es HIPÓTESIS de diseño, no demostración empírica.
- NO DATO como regla de inventario es fortaleza.
- Motor ≠ veredicto. `frictionEngine` cuantifica capas. `socialField` I=V/R es **hermano**, no el 0.82.

## Dónde Gemini se pasa (no procede)

| Claim Gemini | Etiqueta | Evidencia |
|---|---|---|
| No hay disociación estructural entre violencia territorial y gobernanza AFP/SURA | INFERENCIA / juicio | Informe Cap V no demuestra Catrillanca. No unificar en un HECHO. |
| El buscador verifica huella estatal **en tiempo real** | FALSO | `live_in_search=false`. Filas JSON; Transparencia/SciELO Chile 403. |
| NO DATO se «resuelve» cruzando el buscador | FALSO | NO DATO permanece. El buscador no inventa el folio. |
| I=V/R = frictionEngine / «entropía del sistema» del 0.82 | FALSO | SPEC §5: hermanos. 0.82 = override JSON. |
| Gephi / NetworkX / Three.js / GPU | fuera de v0 | No está en el repo. Sería arquitectura nueva. |
| Scrum team + backlog completo = ship | no | VN = Design Sprint. P0 = no parecer más inteligente que el instrumento. |

La síntesis de cierre («dos caras de una misma ruina sistémica») es **juicio**. No es DoD de código ni de Cap VII.

## Sutura Campo 1 ↔ Campo 2 (respuesta al revisor)

No son dos casos por eclecticismo **si** el patrón es el mismo: registro que traduce mal (catastro/CONADI vs CRM/AFP).  
Eso se **muestra** con filas (Antorcha A01–A14; Cap V mandato/separación), no se **declara** como matriz unificada pensiones=despojo. Cloud capital maduro = NO DATO (OCR Varoufakis corta en p. 49).

## NO DATO como categoría analítica

Acuerdo con el revisor: el silencio es dato de opacidad.  
Desacuerdo con Gemini: el buscador **no** llena el silencio. Si no hay URL 200, la fila queda landing/search o INSUFICIENTE.

## Motor

Acuerdo: no homologar sociedad a física.  
Código: `audit.source=json|engine` ya se pinta en el grafo (`nodeRenderer._renderAudit`). El home aún puede mezclar 0.78/0.39 con 0.82 del caso — deuda UX, no v1.

## MVP que este equipo (uno) sí hace — vs PARK

### Shipped / ya existe (no rehacer)

- Grafo + auditoría json vs motor
- Buscador estático, 40 filas, `url_precision`, CIPER 2 live ≠ Huracán
- EPISTEMIC_SPEC v0 + tests de contrato SURA
- Informe Cap V (Doc interno)
- INDEX v13 local 11 MB (Drive 19 KB = vacío; no convertir)

### Sprint v0 (único, Design Sprint — no Scrum Gemini)

1. **Honesty UI:** home/buscador no vender 0.78/0.39 como 0.82 del caso. Mostrar `source`.
2. **Cap V:** H3–H4 prosa desde el informe **sin PII**; Optimus/Mosto NO DATO.
3. **Cap III:** chunks Varoufakis post p.49 (cloud capital) o H5b sigue NO DATO.
4. **S1.1:** URL 200 A01/A03/A05/A11 o INSUFICIENTE.

### PARK (Gemini backlog)

- Live GET a Transparencia/SII/CBR en query
- Friction Score v1 / F=w1…w6
- Three.js / Gephi / GPU
- Publicar informe Cap V en LinkedIn
- «Arma táctica» / veredicto de ruina sistémica en copy público

v1 del motor **solo** si el override JSON deja de ser silencioso. Eso ya está en el freeze «Qué opino».

---

## Decider 11-sep tarde · qué se aplicó

Rö avala el hilo Gemini **como HIPÓTESIS**: seguro obligatorio (Salazar → Zuboff/Varoufakis). AFP y despojo = misma matriz de extracción *en diseño*, no HECHO empírico.

NO DATO: estatuto analítico. El buscador **muestra** huella pública curada; **no** resuelve el vacío ni hace GET en vivo.

Aplicado en código: home/buscador etiquetan «fricción registro↔caso»; tesis I=V/R = hermano; Cap V H3–H4 en `CAP-V-H3-H4.md`; hilo en `HILO-SEGURO-OBLIGATORIO-CAP-III-V.md`.

PARK intacto: Gephi / Three.js / W11+RTX (esta caja es M5) / LinkedIn del informe / Friction Score v1.
