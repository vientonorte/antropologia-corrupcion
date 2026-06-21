# Valor narrativo — `_papelera_duplicados/`

> **Repositorio:** [vientonorte/antropologia-corrupcion](https://github.com/vientonorte/antropologia-corrupcion)  
> **Versión:** 2026-06-20 · **Compañero:** `data/ia-inventario.json` → `excluded_local[].narrative_valor`  
> **Relacionado:** `docs/INVENTARIO_CONTENIDOS_IA.md` §12 · `data/contenido-ramas-rescatado.json`

Auditoría de **contenido narrativo** en la papelera local (gitignored). Objetivo: identificar texto, marcos y dispositivos analíticos **únicos** que no están en `web/` ni ya rescatados en JSON, y proponer destino editorial.

---

## 1. Resumen ejecutivo

| Archivo | Valor narrativo | ¿Único vs `web/`? | Acción recomendada |
|---|---|---|---|
| `EA_contra-archivo-v1-DEPRECATED.html` | **ALTO** | Sí — tesis doctoral completa (§00–§12) | Extraer §00, §03, §10 a `data/narrativa-rescatada.json` |
| `EA_index.html` | **ALTO** | Sí — instrumento + protocolo C.01–C.04 | Integrar en `landing.html` o `contra-archivo-v2.html#leer` |
| `EA_admin.html` | **MEDIO** | Parcial — triage D1–D7 + notas gestión | Conservar notas en inventario; no publicar |
| `EA_contra-archivo-v2.html` | **BAJO** | No — snapshot obsoleto | Seguro borrar tras validar diff |

**Regla:** no eliminar la papelera hasta completar extracción de filas marcadas **RESCATAR**.

---

## 2. Ya rescatado (no duplicar)

`data/contenido-ramas-rescatado.json` (2026-04-01) contiene HTML de v1 §11–§12 y material La Negra, consumido en `privado.html` (tab Chat):

| Sección v1 | Clave JSON | Estado |
|---|---|---|
| §12 Conclusiones | `conclusiones` | Rescatado · anonimizado |
| §11 Investigador | `investigador` | Rescatado · **Colectivo Viento Norte** (v1 papelera tiene nombre real) |
| La Negra — cronología | `cronologia_despojo` | Rescatado |
| La Negra — intermediarios | `agentes_intermediarios` | Rescatado |
| Mejoras tesis | `mejoras_tesis` | Rescatado |

**Gap crítico:** lo que falta en producción no son las conclusiones sino el **marco de entrada** (presentación, protocolo, hipótesis P3, ensayo-args).

---

## 3. `EA_contra-archivo-v1-DEPRECATED.html` — narrativa doctoral

~1.607 líneas · snapshot 2026-05-18 · canónico actual: redirect `web/contra-archivo.html` → `index.html` (sin narrativa v1).

### 3.1 Mapa de secciones y valor

| § | Título | Valor | En `web/` | En JSON rescatado | Destino propuesto |
|---|---|---|---|---|---|
| 00 | Presentación del Proyecto Doctoral | **RESCATAR** | No | No | Público: `contra-archivo-v2.html#leer` (bloque «Marco») |
| 01 | Estado del Arte y Marco Teórico | Medio | Parcial (`zuboff`, fichas) | No | Enlazar desde archivo |
| 02 | Etnografía Audiovisual y Diseño | Medio | Parcial (PDF, poemarios) | No | Biblioteca / archivo |
| 03 | Ensayo Traducción de Saberes | **RESCATAR** | No (solo carpeta pesada) | No | `data/narrativa-rescatada.json` → ensayo-args |
| 04 | La Negra — Campo territorial | Alto | Parcial | Parcial (cronología, agentes) | Completar en v2 eje Territorio |
| 05 | Poemarios | Bajo | Sí (`web/Poemarios/`) | — | Ya publicado |
| 06–08 | Documentos · Visuales · Referencias | Bajo | Parcial | — | Hub archivo |
| P3 / 09 | Arquitectura e inventario 21 activos | Medio | No | No | Admin / docs internos |
| 10 | Hipótesis P3 — Interfaz de fricción | **RESCATAR** | No | No | Público: v2 modo Explorar + grafo |
| 11 | El Investigador | Bajo | No público | **Sí** (anonimizado) | Solo privado |
| 12 | Conclusiones | Bajo | No público | **Sí** | Solo privado |

### 3.2 Contenido único de alto valor

#### §00 Presentación
- Tesis explícita: corrupción = régimen de **mistranslation institucionalizada**
- **4 preguntas de investigación** (formulación doctoral canónica)
- **H1–H3** (hipótesis de trabajo)
- **Matriz de tensiones** Norma × Infraestructura × Territorio × Archivo (valores 1–4 por eje: datos, indígenas, periodismo)
- Índice general de materiales (tabla navegable)

*Ninguno de estos elementos aparece en `web/landing.html` ni en `web/contra-archivo-v2.html` (grep sin matches).*

#### §03 Ensayo — Núcleo argumentativo
- Abstract + 4 argumentos (Riles, Tsing, World Bank/TI, Derrida)
- Tabla marcos normativos (Ley 19.628, Convenio 169, etc.)
- Caja «Contribución teórica original» (4 bullets metodológicos)
- Epistemicidio / Rivera Cusicanqui en capa decolonial

#### §10 Hipótesis P3 — Interfaz de fricción
- Epígrafe operativo: *«La verdad emerge como fricción, no como síntesis»*
- Triada: Ética situada · Registro institucional · Materialidad histórica
- 3 zonas de fricción con casos anclados (SURA/AFP, títulos de merced, La Negra)
- Axioma: el contra-archivo **sostiene** tensiones, no las resuelve

**Relación con v2 actual:** `contra-archivo-v2.html` tiene 4 ejes narrativos (Seguridad, Finanzas, Territorio, Metodología) pero **no** articula la triada de regímenes ni el protocolo de intervención.

#### §11 — Advertencia de publicación
- Bio con **Rodrigo Gaete Gaona** y rol «UX Lead en SURA Investments»
- JSON rescatado ya anonimizó a **Colectivo Viento Norte** — usar solo versión JSON si se publica

---

## 4. `EA_index.html` — instrumento analítico (antiguo «index»)

~1.013 líneas · superseded por `web/index.html` / `web/landing.html`.

### 4.1 Hero y posicionamiento (único)

```
La institución traduce.
La traducción falla.
El fallo es el sistema.
```

- Meter de fricción epistemológica (4 campos)
- CTAs: instrumento · protocolo · tensiones
- Nav ancla: Instrumento → Campos → Tensiones → Grafo → **Protocolo** → Archivo

`landing.html` actual usa onboarding «¿Quién es?» y búsqueda; **no** expone esta línea programática ni el protocolo.

### 4.2 Secciones con valor único

| Sección | Contenido | Valor |
|---|---|---|
| §01 Instrumento | 3 capas (ética / institucional / material) como **instrumento cualitativo** | Alto — complementa B1 (index ≠ instrumento) |
| §02 Campos | 4 sitios etnográficos unificados | Medio — alinea con `casos.json` |
| §03 Tensiones | Fricción cuantificable + viewer | Alto — puente a grafo |
| §04 Grafo | Preview embebido | Bajo — v2 tiene grafo completo |
| **§05 Protocolo** | **C.01–C.04** + umbrales 0.25 / 0.50 / 0.70 / 0.90 | **CRÍTICO — no existe en ningún HTML de `web/`** |
| §06 Archivo | Grid D1–D7 con conteos | Medio — superseded por `archivo-index.json` |

### 4.3 Protocolo de buena traducción (extracto estructural)

| Código | Dimensión | Condición mínima |
|---|---|---|
| C.01 | Fricción política | Participación del sujeto en el vocabulario de traducción |
| C.02 | Fricción semántica | Glosario multi-capa sin asimilación |
| C.03 | Fricción técnica | Indicadores de **daño** en capa material |
| C.04 | Fricción irreductible | Registro explícito de lo incompensable si fricción > 0.85 |

**Output del instrumento:** el contra-archivo produce **legibilidad**, no acuerdos.

*Nota IA:* las fichas `docs/fichas/C01–C04` existen en markdown pero **no** están enlazadas desde la superficie pública ni indexadas en `archivo-index.json` (deuda B4).

---

## 5. `EA_admin.html` — valor operativo (no narrativo público)

~1.145 líneas · superseded por `web/admin.html` (R04, con `noindex` y guards).

### 5.1 Valor que conservar

| Tipo | Ejemplo | ¿Vigente? |
|---|---|---|
| Mapa D1–D7 con conteos | D4 Ensayo 18 archivos, D5 La Negra 20 | Parcial — verificar contra disco |
| Rutas físicas Estado del Arte / La Negra | PDFs leyes, infografías Catrillanca | Sí — útil para inventario |
| Notas ADMIN | PNG títulos merced ausente; ZIP 8GB; D4 sin nodo en `casos.json` | **Sí** — varias abiertas |
| Toggle Consultor/Admin | Oculta notas de gestión | Patrón UX reutilizable |

### 5.2 Notas ADMIN aún accionables

1. `Distribución de titulos de merced…png` referenciado en `casos.json` pero **no existe** en repo
2. Caso D4 (Ensayo) **ausente** del grafo en `casos.json`
3. Duplicados La Negra (`Orden Grl. 2371` ×2)
4. `La Negra/README.md` pendiente
5. Poemarios README promete `.txt` que no existe

**Destino:** migrar notas abiertas a `docs/INVENTARIO_CONTENIDOS_IA.md` o issues; no publicar `EA_admin.html`.

---

## 6. `EA_contra-archivo-v2.html` — sin valor narrativo incremental

Snapshot 2026-05-18 · ~2.505 líneas vs ~3.7k actuales en `web/contra-archivo-v2.html`.

- Narrativa de 4 ejes ya evolucionó en canónico
- Falta `socialField.js`, fixes grafo móvil, shell compartido
- **No extraer texto** — usar solo `git log` / diff local si hace falta historial

---

## 7. Matriz de rescate (prioridad)

| ID | Bloque | Fuente | Prioridad | Destino editorial | Esfuerzo |
|---|---|---|---|---|---|
| N1 | Presentación §00 (preguntas, H1–H3, matriz) | v1 | **P0** | `contra-archivo-v2.html#leer` | M |
| N2 | Protocolo C.01–C.04 + umbrales | `EA_index` §05 | **P0** | Nueva sección «Protocolo» en v2 o landing | M |
| N3 | Hipótesis P3 + triada + zonas | v1 §10 | **P1** | v2 modo Explorar + tooltips grafo | M |
| N4 | Ensayo-args (4 argumentos + contribución) | v1 §03 | **P1** | `data/narrativa-rescatada.json` | S |
| N5 | Hero «La institución traduce…» | `EA_index` | **P2** | `landing.html` hero alternativo / A-B | S |
| N6 | Grid D1–D7 narrativo | `EA_index` §06 | **P3** | Ya cubierto por `archivo.html` | — |
| N7 | Notas ADMIN abiertas | `EA_admin` | **P2** | Inventario / issues | S |
| N8 | Conclusiones + investigador | v1 §11–12 | — | **Hecho** (`contenido-ramas-rescatado.json`) | — |

---

## 8. Propuesta de artefacto JSON (pendiente)

Complemento de `contenido-ramas-rescatado.json`:

```json
{
  "fuente": "_papelera_duplicados/ + extracción 2026-06-20",
  "secciones": {
    "presentacion": { "origen": "EA_contra-archivo-v1 §00", "status": "pendiente" },
    "ensayo_argumentos": { "origen": "EA_contra-archivo-v1 §03", "status": "pendiente" },
    "hipotesis_p3_friccion": { "origen": "EA_contra-archivo-v1 §10", "status": "pendiente" },
    "protocolo_traduccion": { "origen": "EA_index §05", "status": "pendiente" },
    "hero_instrumento": { "origen": "EA_index §hero", "status": "pendiente" }
  }
}
```

Script de extracción sugerido: parsear secciones por `section-number` / `id="protocolo"` → HTML limpio sin scripts inline.

---

## 9. Impacto en arquitectura de información

| Deuda IA | Relación con valor narrativo |
|---|---|
| **B1** index ≠ instrumento | `EA_index` **es** el instrumento narrativo perdido; rescatar §01–§05 cierra la deuda |
| **B2** Dos navs | Protocolo podría vivir en v2 con `shared-shell.js` |
| **B4** Fichas C03/C04 sin indexar | Protocolo C.01–C.04 enlaza directamente con fichas markdown |
| Nav propuesta | Añadir «Protocolo» bajo Contra-archivo o sub-ancla `#protocolo` |

---

## 10. Criterios de borrado seguro

La papelera puede eliminarse localmente cuando:

- [ ] N1–N4 extraídos a JSON o integrados en `web/`
- [ ] Notas ADMIN N7 migradas
- [ ] Diff `EA_contra-archivo-v2` vs `web/` revisado (N/A narrativo)
- [ ] `data/ia-inventario.json` actualizado con `extracted: true`

Hasta entonces: **mantener** en `_papelera_duplicados/` (gitignored).

---

## 11. Referencias cruzadas

| Recurso | Rol |
|---|---|
| `data/contenido-ramas-rescatado.json` | Conclusiones, investigador, La Negra (privado) |
| `data/archivo-index.json` | Catálogo editorial publicable (6 entradas) |
| `data/casos.json` | 3 capas + grafo — falta nodo D4 |
| `docs/fichas/C01–C04` | Especificación formal del protocolo |
| `skills/QUICK_WINS_PRODUCCION.md` | Política de eliminación papelera |