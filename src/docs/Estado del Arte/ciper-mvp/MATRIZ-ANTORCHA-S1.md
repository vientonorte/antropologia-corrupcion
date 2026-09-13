# Matriz Antorcha — filas S0 (prep S1.1 · vie 12 sep 2026)

**Pipeline:** S0 kickoff 11 sep 07:00–09:00 · S1.1 12 sep 09:00–10:30  
**DoD S1.1:** §III Antorcha ↔ `periodismo-datos-chile` ↔ fuentes CIPER.  
**Gramática:** EPISTEMIC_SPEC v0 §6. El motor **no** decide ACUSACIÓN.  
**Caso:** `periodismo-datos-chile` · `friccion.tipo=semantica` · `subtipo=tecnica` · JSON 0.71 / motor 0.420 (Δ 0.290, `source=json`).  
**Tensión del caso:** «¿Puede el dato institucional ser evidencia de la corrupción que lo produjo?»  
**No:** SEO. No inventar citas. No conectar API. Bloque CIPER del día no se mueve.

Fuentes del arranque: `web/leer.html#articulo-etnografico` (`data/articulo-etnografico.json` §III `sec-iii`) · `docs/EPISTEMIC_SPEC.md` · `data/casos.json`.

**INDEX canónico (tesis, no satélite):** Drive/Word `INDEX-TESIS-CANONICO-v12-CapI-ensayo-figs.docx`  
id `1ShRkHlv2qn63K8Azz2tgzx-E-K65lS1l` · local `_tmp_tesis-cap1-img/` · 2026-09-10 12:09 CL.  
Casa de Antorcha en tesis = **Cap I** (párrafo OG 2371 / UIOE / Antorcha / patrón Jungla). Cap III H5 pide 1 pp «Antorcha ↔ tecnofeudal» — eso es **después** de S1.1, no sustituye las filas.  
Regla v12: no condensar Cap I. Docs nativos posteriores marcados DEPRECATED en Drive no pisan este Word.

---

## Columnas (contrato S1.1)

| Col | Campo |
|---|---|
| id | `A01`… |
| claim | una sola proposición, del artículo |
| etiqueta | HECHO / EVIDENCIA / DISCREPANCIA / HIPÓTESIS / INFERENCIA / ACUSACIÓN / CONTRADICCIÓN / INSUFICIENTE / NO DEMOSTRADO / SIN VERIFICAR |
| tipo_friccion | `semantica` · `tecnica` · `politica` (FRICTION_TYPES). JSON del caso también usa editorial `juridica`/`epistemologica` — no mezclar con el motor |
| caso | `periodismo-datos-chile` (hermano; no sustituye SURA–Michillanca) |
| fuente_ciper | URL o `fuente_id` **indexado**, o INSUFICIENTE |
| capa | ética / institucional / material |
| nota S1.1 | qué falta el viernes |

---

## Filas (definidas S0 — no saturadas)

| id | claim (del artículo, no parafraseo libre) | etiqueta S0 | tipo_friccion | capa | fuente_ciper hoy | nota S1.1 |
|---|---|---|---|---|---|---|
| A01 | El software «Antorcha», presentado por Alex Schmidt («El Profesor») como interceptador de WhatsApp, **nunca existió**. | HECHO (artículo + veredicto Huracán citados en el texto; folio judicial **no** está como fila de `fuentes-oficiales`) | semantica | institucional | INSUFICIENTE en índice | Pegar URL 200 del veredicto/cobertura CIPER Huracán. No usar mock SURA 404. |
| A02 | «Antorcha» operó como **nombre de una ficción técnica**: si alguien preguntaba cómo se habían obtenido los mensajes, la respuesta era «Antorcha». | HIPÓTESIS etnográfica (performatividad del nombre) anclada a HECHO A01 | semantica | ética↔institucional | INSUFICIENTE | Es el núcleo semántico: la palabra hace el trabajo del dato. |
| A03 | Lo usado fue **Oxygen Forensics**, software de extracción forense legítimo. | HECHO (artículo). Cadena de custodia del software = EVIDENCIA pendiente | tecnica | material | INSUFICIENTE | Derechos Digitales (Garay & Rogoff) está en referencias del artículo, no en el índice. |
| A04 | Compra con **21,5 millones de pesos** de gastos reservados autorizados por Villalobos. | HECHO en el artículo; monto = EVIDENCIA si hay documento; si no, SIN VERIFICAR como registro | tecnica | institucional | INSUFICIENTE | No acusar en el motor. Causa gastos reservados es **otra** causa (artículo: Villalobos no juzgado en Huracán). |
| A05 | Oxygen Forensics se usó **no para extraer datos sino para implantarlos**. | HECHO judicial en el relato del artículo (culpables por fabricar pruebas digitales, 9 ene 2026) | tecnica | material | INSUFICIENTE | Cruce con `tension_central` del caso: el dato es el montaje. |
| A06 | Invocar un «software» invoca autoridad casi mágica: si la máquina lo dice, debe ser verdad. | HIPÓTESIS (Taussig «sistema nervioso» / performatividad de la técnica) | semantica | ética | — | Ancla teórica; no es fila CIPER. |
| A07 | Los mensajes fabricados por la UIOE se difundieron en **televisión nacional el mismo día** de las detenciones. | HECHO mediático en el artículo | semantica | institucional | INSUFICIENTE | CIPER/Ahora Noticias en referencias; no hay `fuente_id`. |
| A08 | La credibilidad no vino del contenido (grotesco, incl. Huilcamán–Morales) sino del **aura tecnológica**; nadie preguntó si el programa era posible; la palabra «interceptación» hizo el trabajo. | INFERENCIA del artículo (lectura etnográfica) | semantica | ética | — | Distinguir de A07. El motor no «demuestra» el aura. |
| A09 | David Cid Aedo (2023) describe Huracán como montaje con policías, fiscales y las administraciones Bachelet y Piñera, extensión operativa de extractivismo y terratenientes del sur. | EVIDENCIA = libro citado. La tesis de Cid sobre administraciones = HIPÓTESIS de Cid, no HECHO del motor | politica | ética | — | Libro en referencias del artículo. No indexar como CIPER. |
| A10 | Ocho comuneros detenidos el **23 sep 2017** por mensajes que no enviaron, «interceptados» por un software que no existió. | HECHO (nómina en §V; Antorcha en §III) | politica | material | INSUFICIENTE | Nombres: no convertir la fila en ACUSACIÓN a las víctimas. |
| A11 | TOP Temuco, **9 ene 2026**: seis personas culpables de fabricar pruebas digitales para incriminar a comuneros mapuche. | HECHO (apertura del artículo). Sentencias individuales = EVIDENCIA pendiente de URL | politica | institucional | INSUFICIENTE | El Mostrador 9 ene 2026 está en referencias; no está en `fuentes-oficiales`. |
| A12 | Patrón Catrillanca (GoPro destruida, versión falsa) **repite** el patrón Antorcha: si la versión no se sostiene, se fabrica otra. | INFERENCIA (el propio artículo: «no es directa pero sí culturalmente significativa») | semantica | material | INSUFICIENTE (CIPER reconstruyó Catrillanca; no hay fila) | No unir Huracán y Jungla como el mismo expediente. |
| A13 | CIPER 2018–2022 (archivos secretos / chats de inteligencia / institución que se manda sola) es la **serie** que el artículo cita como capa periodística. | EVIDENCIA bibliográfica del artículo. En el índice live: **no hay esas filas**. | semantica | institucional | **DISCREPANCIA** | Las únicas filas `fuente=ciper` hoy son humedal Concepción (2026-09-05) y Radar (2026-09-07). No son Huracán. No sustituir. |
| A14 | Mock CIPER `…/sura-opacidad-regulatoria-cmf/` = **404**. No es documento. | NO DEMOSTRADO / no-documento (inventario 2026-09-08) | tecnica | institucional | `ciperFeed` MOCK | Queda fuera de la matriz de claims. |

---

## Qué no es una fila

- `ciper-humedal-concepcion-2026` y `ciper-radar-2026-09-07`: RSS live, `friccion_con=periodismo-datos-chile`, **otro objeto**. Sirven al caso como periodismo de datos *en general*, no como prueba de Antorcha.
- Intensidad 0.71 del caso: override JSON, no se reconstruye desde estas filas (EPISTEMIC_SPEC §4).
- ACUSACIÓN a Villalobos / UIOE / Schmidt: el artículo relata un veredicto. El motor no la decide. En S1.1 etiquetar HECHO judicial vs ACUSACIÓN.

---

## Orden de trabajo vie 12 (S1.1)

1. Abrir `leer.html#articulo-etnografico` → scroll `#sec-iii`.
2. Para A01, A03, A05, A11: una URL HTTP 200 no-homepage (CIPER u oficio judicial). Si no aparece, dejar INSUFICIENTE.
3. No mover A13 a «cubierto» con el RSS de septiembre 2026.
4. Cerrar con 1 frase: cómo Antorcha ilustra `subtipo=tecnica` dentro de `tipo=semantica` del caso.

Artículo satélite ≠ cuerpo de la tesis (TESIS-DOCTORAL-SSOT §0 y §7).
