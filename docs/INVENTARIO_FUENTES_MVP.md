# Inventario de acceso — fuentes MVP

**Qué es:** observación GET, 2026-09-08, contra `data/fuentes-config.json` (`estado: mvp`, `activa: true`).
**Qué no es:** conector, scraper, índice nuevo, ni Friction Score.
**Método:** un GET por URL documentada o de catálogo público. User-Agent de inventario. Sin login, sin ticket, sin escritura.
**Corpus local:** lo que el buscador ya carga (`fuentes-oficiales.json` + BCN). No se mezcla con “lo que existe en Chile”.

Machine-readable: [`data/fuentes-acceso.json`](../data/fuentes-acceso.json).

---

## Resumen

| Fuente | Config dice | Acceso real observado | Corpus local | ¿El buscador lo consulta live? |
|---|---|---|---:|---|
| BCN | `web` homepage | **API LOD** (SPARQL + JSON) **y** HTML | 5 | no |
| LeyChile | `web` leychile.cl | redirect a BCN SPA; LOD en datos.bcn.cl | 8 | no |
| InfoLobby | `web` infolobby.cl | HTML 200; API Ley Lobby **docs en mantenimiento** | 3 | no |
| SII | `web` sii.cl | HTML (redirect `homer.sii.cl`); **sin API pública vista** | 4 | no |
| Transparencia | `web` portaltransparencia.cl | portal **403** desde este entorno; CPLT HTML 200 | 7 | no |
| SEIA | `web` seia.sea.gob.cl | HTML buscador 200; **sin REST vista** | 2 | no |
| ComprasPúblicas | `web` mercadopublico.cl | **API REST (ticket)** + datos abiertos/OCDS HTML | 2 | no |
| CMF | `web` cmfchile.cl | HTML 200 + **API bancos (API key)** | 2 | no |
| Diario Oficial | `web` | HTML edición 200; PDF por edición | 1 | no |
| SciELO | `web` scielo.cl | **403 Cloudflare** (home y OAI) | 1 | no |
| CIPER | `rss` feed | **RSS XML 200 real**; 0 filas en índice | 0 | no (feed no entra a `allRecords`) |

**11/11** tienen sitio. **Ninguna** alimenta el buscador en tiempo de consulta.
**3** tienen máquina verificada **sin clave** en este probe: BCN SPARQL/JSON, CIPER RSS, (LeyChile vía BCN LOD).
**2** tienen API que **exige credencial** (Mercado Público ticket, CMF apikey) — no se pidió ni se usó.
**2** están bloqueadas o a medias desde este entorno (Transparencia 403, SciELO 403).
**1** API documentada caída (Ley Lobby `docs.html` = En Mantenimiento).

---

## Fuente a fuente

### 1. BCN (`bcn`)

| | |
|---|---|
| Config | `https://www.bcn.cl` · `metodo_acceso: web` |
| HTML | `https://www.bcn.cl/` → **200** text/html |
| Máquina | `https://datos.bcn.cl/` → 200 HTML. SPARQL `ASK { ?s ?p ?o }` → **200 JSON `boolean: true`**. Recurso `https://datos.bcn.cl/recurso/cl/ley/20730/datos.json` → **200 application/json** (RDF/JSON de la Ley 20.730) |
| PDF | no sondeado como canal primario |
| Corpus | 5 boletines en `data/bcn-legislativo.json` |
| Frecuencia | live LOD existe; el buscador no lo usa |
| Lectura | se **puede consultar** normas por URI/SPARQL. No se conectó. |

### 2. LeyChile (`leychile`)

| | |
|---|---|
| Config | `https://www.leychile.cl` |
| HTML | leychile.cl **200** redirige por JS a `https://www.bcn.cl/leychile` **200** SPA |
| Máquina | misma capa LOD que BCN. La ruta histórica `Consulta/legislacion_abierta_web_service` hoy sirve el SPA, no un WSDL. XML `obtxml` se reporta no autorizado en fuentes terceras; **NO DETERMINADO aquí** (no se forzó) |
| Corpus | 8 filas; URLs a menudo homepage |
| Lectura | el identificador de norma puede resolverse por `datos.bcn.cl/recurso/cl/ley/{n}/datos.json`. El buscador no lo hace. |

### 3. InfoLobby (`infolobby`)

| | |
|---|---|
| Config | `https://www.infolobby.cl` |
| HTML | infolobby.cl **200**. Plataforma oficial `https://www.leylobby.gob.cl/` **200** |
| Máquina | `https://www.leylobby.gob.cl/docs.html` → **«En Mantenimiento»**. API histórica de Ley 20.730 **no verificable hoy** |
| Corpus | 3 filas; `url` = homepage |
| Lectura | se puede **navegar** HTML. No hay API viva comprobada. Audiencia-id no está en el JSON local. |

### 4. SII (`sii`)

| | |
|---|---|
| Config | `https://www.sii.cl` |
| HTML | sii.cl **200** meta-refresh → `https://homer.sii.cl/` **200** portal |
| Máquina | **nada** en este probe (sin endpoint JSON/XML público en la home) |
| Corpus | 4 filas; `url` = homepage |
| Lectura | portal humano. Consultas RUT / sociedades no son API abierta. |

### 5. Transparencia (`transparencia`)

| | |
|---|---|
| Config | `https://www.portaltransparencia.cl` |
| HTML | portal **403 Forbidden** (este UA). `https://www.consejotransparencia.cl/` **200** |
| Máquina | no verificada (portal PDT bloqueado aquí) |
| Corpus | 7 filas |
| Lectura | el Consejo existe; el PDT no respondió. **NO DETERMINADO** si hay API SAI. Solicitudes Ley 20.285 = 20 días hábiles, no búsqueda. |

### 6. SEIA (`seia`)

| | |
|---|---|
| Config | `https://seia.sea.gob.cl` |
| HTML | **200** Drupal. `.../busqueda/buscarProyectoAction.php` **200** formulario |
| Máquina | **sin REST** en este probe |
| Corpus | 2 filas |
| Lectura | buscador HTML de expedientes. Conectar sería scrape o hallar un WS no visto. |

### 7. ComprasPúblicas (`compraspublicas`)

| | |
|---|---|
| Config | `https://www.mercadopublico.cl` |
| HTML | home redirige `/Home` **200**. Datos abiertos `https://datos-abiertos.chilecompra.cl/` **200** SPA. Docs API `https://api.mercadopublico.cl/` **200** HTML |
| Máquina | API REST `api.mercadopublico.cl/servicios/v1` — **ticket** (ClaveÚnica, cupo diario). OCDS/descargas del portal de datos: **sin ticket** según ChileCompra; no se descargó un dump |
| Corpus | 2 filas |
| Lectura | hay canal máquina. El buscador no lo usa. No se pidió ticket. |

### 8. CMF (`cmf`)

| | |
|---|---|
| Config | `https://www.cmfchile.cl` |
| HTML | **200** sitio institucional |
| Máquina | `https://api.cmfchile.cl/` **200** docs. Recursos **exigen `apikey`**. Cubre indicadores/reportes bancarios, **no** necesariamente sanciones ni FECU de un caso SURA |
| Corpus | 2 filas (sanción / NCG 461) con URL homepage |
| Lectura | API distinta del objeto etnográfico. HTML para resoluciones. No se pidió key. |

### 9. Diario Oficial (`diariooficial`)

| | |
|---|---|
| Config | `https://www.diariooficial.interior.gob.cl` |
| HTML | home **200**. `/edicionelectronica/` **200** |
| Máquina | no vista. Ediciones suelen ser **PDF** |
| Corpus | 1 fila |
| Lectura | HTML + PDF por edición. Sin índice máquina comprobado. |

### 10. SciELO (`scielo`)

| | |
|---|---|
| Config | `https://www.scielo.cl` |
| HTML | **403** Cloudflare (“Just a moment…”) |
| Máquina | OAI `.../oai/scielo-oai.php?verb=Identify` **403** igual |
| Corpus | 1 fila |
| Lectura | OAI existe de jure. **No verificable** desde este entorno. |

### 11. CIPER (`ciper`)

| | |
|---|---|
| Config | `https://www.ciperchile.cl/feed/` · `metodo_acceso: rss` |
| HTML | home **200** |
| Máquina | feed **200 application/xml**, RSS 2.0 real (~30 KB) |
| Corpus índice | **0** filas (`readiness: pipeline`) |
| Código aparte | `src/ciperFeed.js` proxy `allorigins` + `MOCK_ARTICLES`. Mock `.../sura-opacidad-regulatoria-cmf/` → **404** |
| Lectura | el RSS **sí existe**. El buscador **no lo indexa**. El mock **no es documento**. |

---

## Qué se puede / no se puede (gate de recuperación)

| Podemos hoy, sin conectar | No podemos hoy |
|---|---|
| Resolver una ley BCN por URI JSON | Buscar SURA en CMF/SII/InfoLobby live |
| Leer el RSS de CIPER | Meter CIPER en `allRecords` sin decisión editorial |
| Abrir HTML de SEIA, DO, SII, CMF | Afirmar API de Transparencia o SciELO desde este probe |
| Pedir ticket ChileCompra / key CMF (humano) | Usar esas APIs desde Pages sin secreto |
| Seguir filtrando 43 JSON | Decir “fuentes consultadas / no consultadas” por query |

Una búsqueda sigue **no** siendo un evento de archivo.

---

## Clasificación (brief §36)

| Id | Clase | Hecho |
|---|---|---|
| A1 | DEUDA ARQUITECTÓNICA | Config `metodo_acceso: web` oculta que BCN tiene LOD y CIPER tiene RSS |
| A2 | DEUDA DOCUMENTAL | `fuentes-config.json` `updated_at` 2026-05-07; endpoints = homepages |
| A3 | DEUDA EPISTEMOLÓGICA | CIPER mock 404 si el proxy falla |
| A4 | DEUDA DE DATOS | URLs locales a portada; no hay document-id |
| A5 | DEUDA UX | “10 operativas” = filas con URL, no = API viva |
| A6 | HISTÓRICO | API Ley Lobby documentada; `docs.html` en mantenimiento |
| A7 | DECISIÓN METODOLÓGICA | Este inventario no conecta nada |

---

## Fuera de alcance (fase-2 del config)

`repositorio-uai`, `repositorio-uchile`, `diario-financiero`, `google-scholar`, `google-news`: no sondeados. Diario Financiero **sí** está en el índice (3 filas) pese a `activa: false`.

---

## Siguiente (no este archivo)

1. Decidir, fuente a fuente, **curar URL real** de las filas ya publicadas (sin API).
2. Decidir si CIPER RSS entra al índice **después** de validación humana (nunca el mock).
3. Decidir si BCN LOD se usa para **resolver** `idNorma` ya curados, no para crawl.
4. Ticket ChileCompra / key CMF = Decider + secreto fuera del repo.

No Friction Score. No Google clone. No Terraza.
