# Instrumento — freeze (Contra-Archivo)

**Fecha:** 2026-09-12

## Qué es

El instrumento público del Contra-Archivo cuantifica **fricción epistemológica** entre tres capas de verdad (ética · institucional · material) para hacer explorables las mistranslations institucionales. No emite veredicto ni acusación algorítmica.

## Dos motores, no mezclar

| Módulo | Rol | No es |
|---|---|---|
| `src/frictionEngine.js` | Intensidad / tipo de fricción por caso (JSON gana si existe) | Ley de Ohm; corriente informal |
| `src/socialField.js` | Metáfora de campo Ohm `I = V / R` (+ entropía S) | Sustituto de las métricas 0.82 / 0.94 del frictionEngine |

**Regla:** `frictionEngine ≠ Ohm socialField I=V/R`. No reportar intensidad de caso como «corriente» ni al revés.

## Freeze operativo

- Capas y tipos (`politica` / `semantica` / `tecnica`) estables en el sitio público.
- Cambios de fórmula o umbrales requieren nota en HANDOFF + tests (`tests/frictionEngine.test.js`).
- Cap V / material USO RESERVADO permanece fuera del silo público.

## Enlaces

- Spine: [`web/tesis-spine.html`](../web/tesis-spine.html)
- README § Tesis e instrumento
- Preguntas E1/E2/E3 en el spine
