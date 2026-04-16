# Etnografía Digital SURA Investments — Capturas y Citas ATTAC

Esta carpeta reúne las capturas de pantalla y citas provenientes de **ATTAC** (Association pour la Taxation des Transactions financières et pour l'Action Citoyenne) utilizadas como evidencia en la tesis doctoral *Contra-Archivo: Antropología y Corrupción*.

---

## Relevancia teórica

ATTAC es una red internacional fundada en 1998 que propone la **Tasa Tobin** (impuesto a transacciones financieras) y denuncia los mecanismos de evasión y concentración del capital financiero globalizado. Sus publicaciones, informes y posicionamientos constituyen fuentes primarias para documentar:

1. **La opacidad de los circuitos financieros transnacionales** — directamente vinculada al caso SURA Investments y la cadena de custodia AFP → Corredora SURA → JP Morgan documentada en las FECU de la CMF.
2. **La mistranslation institucional** — cómo los marcos regulatorios nacionales (DL 3.500, normativa CMF) fallan en traducir las dinámicas de acumulación descritas por Salazar (*acumulación aberrante*) y Harvey (*accumulation by dispossession*).
3. **El papel de los custodios globales** — ATTAC documenta cómo entidades como JP Morgan operan como nodos de un circuito de extracción de valor desde la periferia hacia centros nor-occidentales.

---

## Estructura de carpetas

```
Etnografía Digital SURA - ATTAC/
├── README.md               ← este archivo
├── capturas/               ← capturas de pantalla (PNG/JPG)
│   └── .gitkeep
└── citas/                  ← transcripciones y fichas de citas
    └── .gitkeep
```

### `capturas/`

Capturas de pantalla de publicaciones, informes, comunicados y análisis de ATTAC relevantes al caso SURA Investments. Cada captura debe seguir la convención de nombrado:

```
YYYY-MM-DD_attac_[tema-breve].png
```

**Ejemplos:**
- `2026-04-15_attac_tasa-tobin-flujos-transnacionales.png`
- `2026-04-10_attac_custodia-global-jp-morgan.png`
- `2026-03-28_attac_concentracion-financiera-latam.png`

### `citas/`

Fichas de citas textuales extraídas de las capturas, en formato Markdown. Cada ficha debe incluir:

- **Fuente**: URL o referencia bibliográfica completa de ATTAC
- **Fecha de publicación**: fecha original del material
- **Fecha de captura**: fecha en que se realizó la captura de pantalla
- **Cita textual**: transcripción exacta del fragmento relevante
- **Capa de análisis**: Ética / Institucional / Material
- **Fricción con**: descripción del mecanismo de mistranslation que la cita evidencia
- **Captura asociada**: nombre del archivo PNG/JPG correspondiente

---

## Protocolo de captura

1. **Verificar la fuente**: solo capturas de sitios oficiales de ATTAC (attac.org, attac-france.org, redes oficiales verificadas).
2. **Incluir URL visible**: la barra de direcciones del navegador debe ser visible en la captura cuando sea posible.
3. **Fecha y hora**: la captura debe mostrar o documentar la fecha y hora de acceso.
4. **No alterar**: las capturas no deben ser editadas, recortadas ni alteradas. Si se requiere resaltar un fragmento, usar una ficha de cita separada.
5. **Cadena de custodia digital**: registrar hash SHA-256 del archivo para garantizar integridad.

---

## Conexión con el caso SURA Investments

Las capturas de ATTAC complementan la evidencia institucional documentada en:

- `data/fuentes-oficiales.json` — registros FECU CMF, InfoLobby, transparencia
- `data/casos.json` — caso `sura-gobernanza-datos` (fricción 0.82)
- `img/` — capturas de evidencia corporativa directa
- `Etnografía Audiovisual/` — diseño metodológico general

### Marcadores de fricción relevantes (de `src/frictionEngine.js`)

| Marcador | Peso |
|---|---|
| `trabajador ↔ cartera de custodia` | 0.91 |
| `custodia transnacional ↔ regulación` | 0.86 |
| `rescates fondos mutuos ↔ cumplimiento normativo` | 0.84 |
| `consentimiento ↔ liquidez como semáforo` | 0.87 |
| `opacidad ↔ patrimonio depurado` | 0.80 |

---

## Referencias teóricas vinculadas

- **Salazar, G.** (2003). *Historia de la acumulación capitalista en Chile*. LOM Ediciones.
- **Harvey, D.** (2003). *The New Imperialism*. Oxford University Press.
- **Varoufakis, Y.** (2011). *The Global Minotaur*. Zed Books.
- **Minsky, H.** (1986/2008). *Stabilizing an Unstable Economy*. McGraw-Hill.
- **ATTAC** (2024-2026). Publicaciones sobre regulación financiera y justicia fiscal. [attac.org](https://attac.org)

---

*Carpeta creada como parte de la etnografía digital del caso SURA Investments — Contra-Archivo: Antropología y Corrupción (Chile, 2026).*
