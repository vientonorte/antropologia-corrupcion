# D4 · Ensayo Traducción de Saberes

> **Dimensión:** D4 (marco decolonial + etnografía del archivo)  
> **Árbol canónico (trabajo local):** `docs/Ensayo Traducción de Saberes/`  
> **Índice machine-readable:** `data/ensayo-traduccion-index.json`  
> **Auditoría de valor:** `docs/VALOR_NARRATIVO_D4_ENSAYO.md`  
> **README git público (resumen teórico):** `Estado del Arte/Ensayo Traducción de Saberes/README.md`

---

## Estructura reorganizada (2026-06-20)

```
docs/Ensayo Traducción de Saberes/
├── README.md                          ← este archivo
├── textos-canonicos/                  ← publicables / fuente de verdad editorial
│   ├── articulo_etnografico.docx      ← CANÓNICO (mar 2026, ~18.4k chars)
│   ├── etnografia-audiovisual-traduciendo-saberes.docx
│   └── etnografia-audiovisual-traduciendo-saberes.pdf
├── _archivo-borradores/               ← no publicar; conservar hasta export final
│   ├── articulo_etnografico.borrador-2026-03-17.pages
│   └── captura-articulo-2026-03-16.png
├── Marco Teórico/                     ← 36 PDFs (decolonial + resistencia)
├── Marco de Referencia/               ← 18 archivos (Wallmapu, normativa)
├── Bibliografía/                      ← 18 PDFs (tiempo, subjetividad)
├── Metodologías/                      ← 4 PDFs (Arguedas, etnografía DB)
├── Estado del Arte/                   ← 12 artículos académicos
├── Fotos Ensayo/                      ← 9 imágenes campo (JPG)
└── Producción Colaborativa/           ← Michillanca + QR interactivo
```

### Reglas de canonicidad

| Archivo | Rol | Versión canónica |
|---|---|---|
| `articulo_etnografico` | Artículo etnográfico «La máquina de fabricar enemigos» | **`.docx`** en `textos-canonicos/` |
| `articulo_etnografico.pages` | Borrador Pages (anterior al docx) | `_archivo-borradores/` — no usar |
| `etnografia audiovisaul…` | Typo histórico | Renombrado → `etnografia-audiovisual-traduciendo-saberes.*` |

### Espejos obsoletos (no editar)

Duplicados locales fuera del árbol canónico — marcar como `_deprecated` mentalmente:

- `docs/Estado del Arte/Ensayo Traducción de Saberes/` (subset)
- `docs/Estado del Arte/Proyectos/Ensayo Traducción de Saberes/` (subset)
- `Ensayo Traducción de Saberes/contra-archivo.html` (raíz, HTML v1 embebido)

---

## Dos piezas narrativas distintas en D4

| ID | Título | Valor | Ruta web propuesta |
|---|---|---|---|
| D4-T1 | **Ensayo teórico** — mistranslation institucionalizada | Alto (marco doctoral) | `contra-archivo-v2.html#eje-4` + `archivo.html` |
| D4-T2 | **Artículo etnográfico** — La máquina de fabricar enemigos | **Crítico** (texto completo no publicado) | `contra-archivo-v2.html#eje-1` → futuro `tesis.html` |

El artículo etnográfico **no** es el ensayo teórico: es la pieza empírica del Eje I (Seguridad / Operación Huracán) que el grafo de v2 ya referencia pero no enlaza al manuscrito.

---

## Rutas de integración

| Superficie | Enlace |
|---|---|
| Contra-archivo v2 · Leer | `#eje-1` (resumen) → artículo completo (pendiente HTML) |
| Contra-archivo v2 · Grafo | nodo `La máquina de fabricar enemigos` |
| Biblioteca | `tesis.html` · entrada `articulo-etnografico-huracan` (pendiente) |
| Archivo | `archivo.html` · entrada ensayo teórico (pendiente) |
| Privado | tab Tesis · Ensayo Traducción de Saberes |

---

## Estado rescate (2026-06-20)

- [x] Artículo publicado → `web/articulo-fabricar-enemigos.html`
- [x] Ensayo teórico → `data/narrativa-rescatada.json`
- [x] Caso D4 → `ensayo-traduccion-saberes` en `casos.json` (7 casos)
- [x] Espejos eliminados en `docs/Estado del Arte/*`

Pendiente: export PDF passkey en `tesis.html` · integrar `narrativa-rescatada.json` en v2 `#eje-4`