# Citas Gramsci

**Rol:** capturas físicas (foto de página marcada) para pipeline Clave B.  
**Obra:** Gramsci, A. *Para la reforma moral e intelectual* (introducción Antonio A. Santucci).  
**Flujo TUI:** `scripts/ingest-tui-img.sh --book gramsci <foto>` → esta carpeta → `lectura-clave-b` → **una** fila en `data/gramsci-citas.json`.  
**No:** OPSEC / casos privados en MVP público CIPER 10%.  
**Actualizado:** 2026-09-05

## Inventario

| Archivo | Tipo real | Página | Uso |
|---------|-----------|--------|-----|
| `IMG_1210.jpg` | HEIC disfrazado de jpg | portada | Leyenda Clave B de **este** volumen (no es cita) |
| `IMG_1211.heic` | HEIC | 3 | Duplicado de ángulo de 1212 (no fila extra) |
| `IMG_1212.heic` | HEIC | 3 | Evidencia rosa «procesos culturales» (no fila extra) |
| `IMG_1213.heic` | HEIC | 5 | **Cita editorial id 3001** · verde concepto_clave |

## Leyenda local (override, no genera JSON)

- Azul → Reflexión
- Verde → Concepto clave
- Rosa → Proceso cultural
