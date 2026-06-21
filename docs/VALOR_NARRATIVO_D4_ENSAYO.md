# Valor narrativo — D4 Ensayo Traducción de Saberes

> **Versión:** 2026-06-20  
> **Compañeros:** `data/ensayo-traduccion-index.json` · `docs/Ensayo Traducción de Saberes/README.md`  
> **Criterio:** misma matriz que `docs/VALOR_NARRATIVO_PAPELERA.md` (valor · unicidad · destino · prioridad)

---

## 1. Diagnóstico: el problema no es el contenido, son las rutas

| Problema | Evidencia | Impacto IA |
|---|---|---|
| **Triplicación** | `docs/Ensayo…` + `docs/Estado del Arte/Ensayo…` + `docs/Estado del Arte/Proyectos/Ensayo…` | Edición en copia equivocada |
| **Confusión de género** | `articulo_etnografico` vive dentro de carpeta «Ensayo Traducción» | El artículo Huracán se pierde dentro del marco teórico |
| **Canónico vs borrador** | `.pages` (mar 17) vs `.docx` (abr 19) sin regla explícita | Riesgo de publicar borrador |
| **Typo persistente** | `etnografía audiovisaul` en 3 espejos | Rutas rotas en admin.html |
| **D4 ausente del grafo** | `casos.json` tiene 6 casos; ninguno es D4 | Deuda B8 + nota admin |
| **Texto no publicado** | Artículo ~18.4k chars; v2 solo tiene resumen | Valor narrativo atrapado en disco |

**Decisión 2026-06-20:** árbol canónico = `docs/Ensayo Traducción de Saberes/` con subcarpetas `textos-canonicos/` y `_archivo-borradores/`.

---

## 2. Inventario de textos canónicos

### 2.1 `articulo_etnografico.docx` — **VALOR CRÍTICO (P0)**

| Campo | Valor |
|---|---|
| Título | La máquina de fabricar enemigos |
| Subtítulo | Inteligencia policial, montaje y vida cotidiana mapuche |
| Alcance | Etnografía de la vigilancia estatal en el Wallmapu (2015–2026) |
| Fecha | Marzo 2026 |
| Caracteres | ~18.439 |
| Canónico | `textos-canonicos/articulo_etnografico.docx` |
| Borrador | `_archivo-borradores/articulo_etnografico.borrador-2026-03-17.pages` |

**Tesis del artículo:** lectura antropológica (no jurídica) del archivo documental reunido en diciembre 2018 que anticipó la condena de enero 2026 en Operación Huracán.

**Secciones (I–VIII):**

| § | Título | Valor narrativo |
|---|---|---|
| I | El paisaje antes de la tormenta: Ercilla, 2015 | Territorio Temucuicui + Orden Grl. 2371 como acto invisible |
| II | La arquitectura del montaje: etnografía del organigrama | Taussig — organigrama como ficción vs red de lealtades |
| III | Antorcha: el software que nunca existió | Performatividad técnica; Oxygen vs ficción |
| IV | El cuerpo vigilado | Vigilancia como paisaje, no anomalía (CIPER 220 GB) |
| V | Los nombres detrás de los números | Víctimas, racismo institucional |
| VI | Catrillanca: el punto donde la estructura mata | Puente territorial-seguridad |
| VII | Wallmapu, 2026: después del veredicto | Cierre sin punto final para comunidades |
| VIII | Nota metodológica: el archivo como campo | Metodología contra-archivo |

**¿Único vs `web/`?** Sí. `contra-archivo-v2.html#eje-1` tiene ~3 párrafos; el grafo describe el artículo pero **no publica el texto**.

**Destino editorial:**

1. **Corto plazo:** entrada en `tesis.html` con passkey o resumen extendido
2. **Medio:** HTML `web/articulo-fabricar-enemigos.html` enlazado desde `#eje-1`
3. **Grafo:** nodo existente «La máquina de fabricar enemigos» → URL del manuscrito

**Relación con otras dimensiones:**

- **D5 La Negra:** fuente primaria del dossier 2018
- **Eje I v2:** narrativa ya alineada; falta el cuerpo
- **Ficha C05** (Michillanca): mismo aparato de seguridad, otro caso

---

### 2.2 `etnografia-audiovisual-traduciendo-saberes` — **VALOR ALTO (P1)**

| Formato | Ruta canónica | Notas |
|---|---|---|
| DOCX | `textos-canonicos/etnografia-audiovisual-traduciendo-saberes.docx` | Fuente editable |
| PDF | `textos-canonicos/etnografia-audiovisual-traduciendo-saberes.pdf` | Export mar 2026 |

Ensayo metodológico sobre etnografía audiovisual como traducción de saberes. Complementa D3 (etnografía corporativa SURA) y Eje IV (Metodología) en v2.

**Destino:** `tesis.html` · categoría `ensayo` · enlace desde `#eje-4`.

---

### 2.3 Ensayo teórico (README + papelera v1 §03) — **VALOR ALTO (P0)**

No es un archivo suelto en `textos-canonicos/` sino el **marco argumentativo** distribuido en:

| Fuente | Contenido |
|---|---|
| `Estado del Arte/Ensayo Traducción de Saberes/README.md` | 4 argumentos + tabla normativa + epistemicidio |
| `_papelera…/EA_contra-archivo-v1` §03 | Misma tesis + casos SURA/OIT expandidos |
| `data/contenido-ramas-rescatado.json` | Parcial (conclusiones cruzan con ensayo) |

**Destino:** `data/narrativa-rescatada.json` → clave `ensayo_argumentos` (pendiente B8).

---

## 3. Corpus de soporte (valor por subcarpeta)

| Subcarpeta | Archivos | Valor | Uso |
|---|---|---|---|
| `Marco Teórico/Pensamiento Decolonial/` | 25 | Alto | Grafo v2 nodo «Biblioteca decolonial» — Quijano, Mignolo, Walsh, Dussel… |
| `Marco Teórico/Resistencia Cultural/` | 8 | Alto | Scott, Butler, Fanon → nodos seguridad/territorio |
| `Bibliografía/Bibliografía del tiempo/` | 18 | Medio | Metodología temporal; Eje IV |
| `Marco de Referencia/…/Wallmapu/` | 12+ | Alto | Evidencia territorial Ainil Levfü; enlaza D5 |
| `Estado del Arte/Articulos Académicos/` | 12 | Medio | IIRSA, conflictos mineros — contexto extractivo |
| `Metodologías/` | 4 | Medio | Arguedas, etnografía DB |
| `Fotos Ensayo/` | 9 | Alto | Campo Wallmapu (Weke, Kolinir) — material visual no indexado |
| `Producción Colaborativa/` | 2 | Medio | Michillanca + QR (renombrar `.png.png`) |

**Regla:** PDFs y JPG **no van a GitHub Pages**; se indexan en JSON con ruta local y `estado: investigador`.

---

## 4. Espejos y duplicados — qué hacer

| Ruta espejo | Estado | Acción |
|---|---|---|
| `docs/Estado del Arte/Ensayo Traducción de Saberes/` | Subset duplicado | No editar; eliminar tras verificar paridad |
| `docs/Estado del Arte/Proyectos/Ensayo Traducción de Saberes/` | Subset duplicado | Idem |
| `Ensayo Traducción de Saberes/contra-archivo.html` (raíz) | HTML v1 embebido (~1.5 MB) | Ya superseded por `web/contra-archivo-v2.html` |
| `Estado del Arte/Ensayo…/contra-archivo.html` | Copia git-tracked | Mantener solo README en git |
| `docs/Estado del Arte/Referencias/articulo_etnografico_Q1.pdf` | Export Q1 | Verificar si es derivado del docx canónico |

---

## 5. Matriz de rescate D4

| ID | Bloque | Prioridad | Destino | Esfuerzo |
|---|---|---|---|---|
| D4-R1 | Artículo etnográfico completo | **P0** | `tesis.html` o HTML dedicado | M |
| D4-R2 | Ensayo teórico (4 argumentos) | **P0** | `narrativa-rescatada.json` + v2#eje-4 | S |
| D4-R3 | Etnografía audiovisual doc/pdf | **P1** | `tesis.html` | S |
| D4-R4 | Fotos Ensayo (9 JPG) | **P2** | `archivo.html` galería investigador | M |
| D4-R5 | Caso D4 en `casos.json` | **P1** | 7º caso · actualizar tests | M |
| D4-R6 | Eliminar espejos `docs/Estado del Arte/*` | **P3** | Limpieza disco | S |
| D4-R7 | Renombrar QR `.png.png` | **P3** | Producción Colaborativa | S |

---

## 6. Rutas IA propuestas

```
Biblioteca (tesis.html)
├── ensayo-traduccion-teorico     → README + narrativa rescatada (futuro)
├── articulo-etnografico-huracan  → textos-canonicos/articulo_etnografico.docx
└── etnografia-audiovisual        → textos-canonicos/*.pdf

Contra-archivo v2
├── #eje-1  ← articulo (Seguridad)
├── #eje-4  ← ensayo teórico (Metodología)
└── grafo   ← nodo biblioteca decolonial → Marco Teórico/

Archivo (archivo.html)
└── entrada D4 ensayo (pendiente archivo-index.json)

Admin / investigador
└── docs/Ensayo Traducción de Saberes/README.md
```

### Nav transversal sugerida

| Desde | Hacia | Label |
|---|---|---|
| `landing.html` | `contra-archivo-v2.html#eje-1` | Seguridad · Huracán |
| `archivo.html` | `tesis.html#articulo-etnografico` | Artículo 2026 |
| `contra-archivo-v2` grafo | `docs/…/README.md` | Fuente D4 (privado) |

---

## 7. Propuesta caso D4 para `casos.json` (borrador)

> No implementado — tests exigen `casos.length === 6`. Al agregar, actualizar `tests/dataValidation.test.js`.

```json
{
  "id": "ensayo-traduccion-saberes",
  "titulo": "Ensayo: Traducción de Saberes — Mistranslation como régimen",
  "dimension": "D4",
  "etica": "Testimonio mapuche bajo vigilancia; saber comunitario no traducible al código penal",
  "institucional": "Ley 19.974, Orden 2371, UIOE; marcos normativos (19.628, OIT 169) como artefactos Riles",
  "material": "Organigramas, infografías 2018, veredicto 2026; territorio Wallmapu",
  "friccion": { "intensidad": 0.88, "tipo": "epistemologica" }
}
```

Caso **meta-metodológico**: articula los otros casos como fallas de traducción entre registros.

---

## 8. Impacto en deudas IA

| Deuda | Cómo cierra D4 |
|---|---|
| **B4** | Ensayo teórico + protocolo enlazan fichas C01–C04 |
| **B8** | Artículo + ensayo-args son piezas P0 pendientes |
| Admin D4 ausente grafo | D4-R5 |
| `tesis.html` ensayo `disponible: false` | D4-R1 + D4-R3 activan entradas |

---

## 9. Referencias cruzadas

| Recurso | Rol |
|---|---|
| `data/ensayo-traduccion-index.json` | Catálogo machine-readable D4 |
| `Estado del Arte/Ensayo…/README.md` | Resumen teórico en git |
| `docs/VALOR_NARRATIVO_PAPELERA.md` | §03 ensayo-args (fuente paralela) |
| `web/contra-archivo-v2.html` | Superficie destino Eje I y IV |
| `vault/casos/C05-michillanca…` | Caso empírico relacionado (seguridad) |