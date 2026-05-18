---
name: lectura-clave-b
description: Analiza fotos de páginas de libros académicos anotados con marcadores de color y extrae citas estructuradas según Clave B del protocolo bujo-ro. Genera JSON listo para archivar en zuboff-archivo.html o cualquier archivo de citas del corpus. Activar cuando Rö suba foto de libro subrayado/marcado y pida extraer citas, analizar anotaciones o aplicar Clave B.
---

# lectura-clave-b v1.0 — Extracción de citas con Clave B

## Activación

Aplicar cuando Rö envíe:
- Foto de página de libro académico con marcadores de color visibles.
- Petición de "aplicar Clave B", "extraer citas", "analizar anotaciones del libro".
- Upload en zuboff-archivo.html u otro archivo de citas del corpus.

---

## Clave B (referencia completa)

| Color marcador | Categoría | Código JSON |
|---|---|---|
| 🟥 Rosa fucsia | Concepto clave | `"concepto_clave"` |
| ⬛ Gris | Investigar | `"investigar"` |
| 🟨 Amarillo | Referencia | `"referencia"` |
| 🟩 Verde | Persona de interés / Investigar | `"persona_interes"` |
| 🟦 Azul claro | Reflexiones | `"reflexion"` |
| 🟧 Naranja salmón | Compartir | `"compartir"` |

Tolerancia: los tonos varían por marca y desgaste; priorizar el color dominante.

---

## Protocolo de análisis

### Paso 1 — Identificar soporte
- Confirmar que es libro impreso (no cuaderno, no post-it).
- Si es Bullet Ro → usar `bujo-ro`, no este skill.

### Paso 2 — Detectar fragmentos marcados
- Escanear la imagen por zonas con color de marcador.
- Si hay superposición de colores, registrar el más externo o el dominante.
- Si el fragmento es ilegible → marcarlo como `[ilegible]`.

### Paso 3 — Extraer texto
- Transcribir el fragmento marcado de forma fiel.
- Incluir suficiente contexto para que la cita sea comprensible sola.
- No corregir el texto del libro; sí corregir OCR obvio.

### Paso 4 — Mapear a Clave B
- Asignar `categoria` según la tabla anterior.
- En caso de ambigüedad, elegir la categoría más restrictiva (concepto_clave > referencia).

### Paso 5 — Inferir página
- Si la página es visible en la imagen → registrar número exacto.
- Si no → `null`.

### Paso 6 — Inferir libro (si no se declara)
- Buscar pistas en la imagen: tipografía, encabezado de página, pie de página.
- Si no hay pistas → `"libro_no_identificado"`.

---

## Output obligatorio

Devolver **siempre** un JSON array, aunque haya una sola cita:

```json
[
  {
    "libro": "La era del capitalismo de la vigilancia",
    "autor": "Zuboff",
    "pagina": 23,
    "texto": "La conexión digital es hoy un medio para satisfacer los fines comerciales de otros.",
    "color": "red",
    "categoria": "concepto_clave",
    "contexto": "Zuboff describe el modelo extractivo como parasítico y autorreferencial.",
    "notas_clave_b": "Concepto central: conexión como instrumento. Aplica a caso AFP/datos."
  }
]
```

Campos obligatorios: `libro`, `pagina`, `texto`, `color`, `categoria`.
Campos opcionales: `autor`, `contexto`, `notas_clave_b`.

---

## Integración con zuboff-archivo.html

El JSON generado es compatible directamente con el formato `zuboffCitations` del archivo.
El campo `color` usa los valores: `red | yellow | pink | green | blue | orange`.
Mapeo Clave B → color HTML:

| Categoría Clave B | color en HTML |
|---|---|
| concepto_clave | `red` |
| referencia | `yellow` |
| investigar / persona_interes | `green` |
| reflexion | `blue` |
| compartir | `orange` |

---

## Integración con frictionEngine.js

Cuando una cita de Clave B contiene un par semántico relevante para el instrumento de fricción:
- Identificar los dos términos en tensión (ej: "consentimiento" vs "proceso administrativo").
- Sugerir un `FRICTION_MARKER` provisional con tipo y peso estimado.
- Marcar como `[PENDIENTE CALIBRACIÓN]` hasta que Rö valide.

---

## Anti-patrones

- ❌ No inventar texto que no aparece en la imagen.
- ❌ No reinterpretar la cita; solo transcribir y categorizar.
- ❌ No asumir categoría sin evidencia cromática visible.
- ❌ No psicologizar las anotaciones de Rö.

---

## Notas de mantenimiento

- Versión: **v1.0** · creada 2026-05-18.
- Complementa `bujo-ro` v1.2 (Clave B) — no lo reemplaza.
- La integración con `friccion-calibrator` (pendiente de crear) extenderá el Paso 6.
