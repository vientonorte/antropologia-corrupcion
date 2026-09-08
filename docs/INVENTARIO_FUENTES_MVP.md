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
| SciELO | `web` scielo.cl | **403 Cloudflare** (home y OAI); `scielo.conicyt.cl` catálogo **200** | 1 | no |
| CIPER | `rss` feed | **RSS XML 200 real**; 2 filas curadas (artículos live, no mock) | 2 | no (RSS no se consulta en query; filas estáticas) |

**11/11** tienen sitio. **Ninguna** alimenta el buscador en tiempo de consulta (sigue sin API).
**Filas publicadas:** URL HTTP 200 **no-homepage** (`url_precision` document\|landing\|search). Sin ticket ni key.
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
| Corpus | 5 boletines. Tres `historiadelaley/.../{12017,10526,13588}` **500** → URL viva = tramitación Senado del boletín. Dos ya eran `leychile/navegar` **200** |
| Frecuencia | live LOD existe; el buscador no lo usa |
| Lectura | se **puede consultar** normas por URI/SPARQL. No se conectó. |

### 2. LeyChile (`leychile`)

| | |
|---|---|
| Config | `https://www.leychile.cl` |
| HTML | leychile.cl **200** redirige por JS a `https://www.bcn.cl/leychile` **200** SPA |
| Máquina | misma capa LOD que BCN. La ruta histórica `Consulta/legislacion_abierta_web_service` hoy sirve el SPA, no un WSDL. XML `obtxml` se reporta no autorizado en fuentes terceras; **NO DETERMINADO aquí** (no se forzó) |
| Corpus | 8 filas; `leychile/navegar?idNorma=` **200** (document) |
| Lectura | el identificador de norma puede resolverse por `datos.bcn.cl/recurso/cl/ley/{n}/datos.json`. El buscador no lo hace. |

### 3. InfoLobby (`infolobby`)

| | |
|---|---|
| Config | `https://www.infolobby.cl` |
| HTML | infolobby.cl **200**. Plataforma oficial `https://www.leylobby.gob.cl/` **200** |
| Máquina | `https://www.leylobby.gob.cl/docs.html` → **«En Mantenimiento»**. API histórica de Ley 20.730 **no verificable hoy** |
| Corpus | 3 filas; `leylobby.gob.cl/visualizadores` **200** (landing; no folio de audiencia) |
| Lectura | se puede **navegar** HTML. No hay API viva comprobada. Audiencia-id no está en el JSON local. |

### 4. SII (`sii`)

| | |
|---|---|
| Config | `https://www.sii.cl` |
| HTML | sii.cl **200** meta-refresh → `https://homer.sii.cl/` **200** portal |
| Máquina | **nada** en este probe (sin endpoint JSON/XML público en la home) |
| Corpus | 4 filas; `servicios_online` / `reavaluo/2024` **200** (landing) |
| Lectura | portal humano. Consultas RUT / sociedades no son API abierta. |

### 5. Transparencia (`transparencia`)

| | |
|---|---|
| Config | `https://www.portaltransparencia.cl` |
| HTML | portal **403 Forbidden** (este UA). `https://www.consejotransparencia.cl/` **200** |
| Máquina | no verificada (portal PDT bloqueado aquí) |
| Corpus | 7 filas; `consejotransparencia.cl/transparencia_activa/` **200** (landing; PDT 403) |
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
| Corpus | 2 filas: NCG 461 PDF **200** (document); sanciones CMF landing **200** |
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
| HTML | `scielo.cl` **403** Cloudflare. `scielo.conicyt.cl/scielo.php?script=sci_alphabetic` **200** (landing usada) |
| Máquina | OAI `scielo.cl` **403**. No se sustituyó el título 2025 inventado por el artículo AFP 2016 |
| Corpus | 1 fila → catálogo alfabético CONICYT (landing, no documento) |
| Lectura | Chile 403. Landing 200 en conicyt. Sin folio. |

### 11. CIPER (`ciper`)

| | |
|---|---|
| Config | `https://www.ciperchile.cl/feed/` · `metodo_acceso: rss` |
| HTML | home **200** |
| Máquina | feed **200 application/xml**, RSS 2.0 real (~30 KB) |
| Corpus índice | **2** filas live (humedal Concepción 2026-09-05; Radar 2026-09-07). Mock SURA **no** entra |
| Código aparte | `src/ciperFeed.js` proxy `allorigins` + `MOCK_ARTICLES`. Mock `.../sura-opacidad-regulatoria-cmf/` → **404** |
| Lectura | RSS **sí existe**. Dos artículos del feed están en `allRecords`. El mock **no es documento**. |

---

## Qué se puede / no se puede (gate de recuperación)

| Podemos hoy, sin conectar | No podemos hoy |
|---|---|
| Resolver una ley BCN por URI JSON | Buscar SURA en CMF/SII/InfoLobby live |
| Leer el RSS de CIPER y citar 2 artículos 200 | Conectar el feed en tiempo de query |
| Abrir HTML de SEIA, DO, SII, CMF | Afirmar API de Transparencia o SciELO Chile (403) |
| Pedir ticket ChileCompra / key CMF (humano) | Usar esas APIs desde Pages sin secreto |
| Filtrar JSON con URL viva no-homepage | Decir “fuentes consultadas / no consultadas” por query |

Una búsqueda sigue **no** siendo un evento de archivo.

---

## Clasificación (brief §36)

| Id | Clase | Hecho |
|---|---|---|
| A1 | DEUDA ARQUITECTÓNICA | Config `metodo_acceso: web` oculta que BCN tiene LOD y CIPER tiene RSS |
| A2 | DEUDA DOCUMENTAL | `fuentes-config.json` `updated_at` 2026-05-07; endpoints = homepages |
| A3 | DEUDA EPISTEMOLÓGICA | CIPER mock 404 si el proxy falla |
| A4 | DEUDA DE DATOS | **Pagada en filas publicadas:** ya no apuntan a homepage. `url_precision` marca document/landing/search. Folio exacto sigue ausente donde no se halló. |
| A5 | DEUDA UX | “10 operativas” = filas con URL, no = API viva |
| A6 | HISTÓRICO | API Ley Lobby documentada; `docs.html` en mantenimiento |
| A7 | DECISIÓN METODOLÓGICA | Este inventario no conecta nada |

---

## Fuera de alcance (fase-2 del config)

`google-scholar`, `google-news`: siguen `activa: false` (sin filas).  
`repositorio-uai`, `repositorio-uchile`, `diario-financiero`: **activas** (filas publicadas con URL 200 search/landing).

---

## Siguiente (no este archivo)

1. ~~Curar URL real de las filas ya publicadas (sin API).~~ Hecho 2026-09-08.
2. CIPER: 2 filas RSS live en índice; mock sigue fuera. Conectar el feed en query = otra decisión.
3. Decidir si BCN LOD se usa para **resolver** `idNorma` ya curados, no para crawl.
4. Ticket ChileCompra / key CMF = Decider + secreto fuera del repo.

No Friction Score. No Google clone. No Terraza.
