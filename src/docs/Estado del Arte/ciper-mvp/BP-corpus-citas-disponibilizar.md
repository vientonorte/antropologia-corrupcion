# Buenas prácticas — disponiblizar citas en corpus-citas.html

**Estado:** borrador 2026-09-05 (CIPER MVP). Gramsci editorial fiel (3 citas). Completar cuando entren capturas Salazar.

## Principios

1. **Evidencia primero.** Solo texto que aparece en foto/OCR revisado. Si no hay evidencia: `NO DATO`.
2. **Skill correcta por soporte.** Bullet Ro / post-it → Clave A (`bujo-ro`). Libro marcado → Clave B (`lectura-clave-b`).
3. **SSOT = repo iCloud** `antropologia-corrupcion`. Live lee `data/*.json`. Ediciones de investigadora viven en `localStorage` (`corpusCitas`) y no sustituyen el editorial.
4. **MVP público ≠ OPSEC.** Nada de casos privados en el pitch CIPER 10%.
5. **Humano importa.** OCR propone; Rö revisa antes de merge a `data/`.

## Flujo recomendado

```
foto (chat o inbox)
  → skill Clave A o B
  → JSON revisado en data/inbox-* 
  → merge a data/*-citas.json (o salazar-citas.json)
  → actualizar libros-clave-b.json (estado / capturas)
  → commit en branch (main protegido → PR)
  → smoke: corpus-citas.html → Resincronizar corpus
  → export JSON/CSV backup opcional
```

## Campos mínimos (compatible store)

`bookTitle`, `author`, `pageNo`, `text`, `color`, `category`, `notes`, `source_type`, `timestamp`.

Colores Clave B HTML: `red|yellow|pink|green|blue|orange`.

## Anti-patrones

- No inventar página/autor.
- No subir capturas OPSEC al MVP público.
- No tratar `localStorage` como backup canónico (exportar).
- No mezclar Clave A y B en el mismo registro sin `source_type` / `clave`.
