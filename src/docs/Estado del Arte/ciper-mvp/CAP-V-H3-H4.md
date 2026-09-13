# Cap V · H3–H4 (prosa mínima, sin PII) · 2026-09-11

**Fuente:** informe de práctica/simulación etnográfica Cap V  
Doc: https://docs.google.com/document/d/1qZiVblvxUFPKjTsTvfxFl_rCTT7OJ4IDVPW16ckxrUo/edit  
**Uso:** cuerpo de tesis / INDEX. **No LinkedIn.** Sin PII de clientes ni nombres de asesores.

## H3 — Norma / arquitectura / práctica (separación BD)

Pregunta: ¿qué institución necesita separar bases mientras opera como si el dato fuera continuo?

HECHO de campo (rol UX Lead / Associate Digital Strategy, Wealth Management, 2023–2026): la **marca SURA** pide continuidad; los **dominios AFP Capital vs Investments** piden discontinuidad. El diseño trabaja cuando norma e infraestructura no coinciden.

NO DATO: Optimus / Mosto. Salesforce visto en sesiones = reclamo de sync CRM (claim VN), **no** implementación de migración AFP. FO PR#250 = capa de mercado, no el dossier de separación.

HIPÓTESIS de hilo (Cap III): el mandato/autorización es *boundary object* entre negocio, datos y compliance — análogo a cómo el catastro traduce territorio. No se declara aquí que el afiliado «es» el comunero.

## H4 — Privacy by design situada

Privacy by design = flujos que **no reintroducen** la continuidad AFP–Investments. El drama de definición («el mismo cliente») es semántica institucional, no veredicto.

Cronología BD + despido art. 161: documentada en Antecedents (disco). Finiquito Drive = NO DATO. Carta AFP Cyber membrete = NO DATO.

Audios UX asesores (7 m4a): inventario Cap V campo 1; sin transcripción pública; sin PII.

## Estatuto NO DATO (analítico)

La ausencia de metadato, folio o secreto corporativo/penal **no se rellena** con el buscador. El buscador muestra huella **pública ya curada** (JSON, URL 200). Si no hay documento, el estado es NO DATO / INSUFICIENTE. Eso *es* el dato de opacidad.

`live_in_search` sigue `false`. Transparencia Chile 403 no se «supera» con Gephi.

## Hardware

Gemini asume W11+RTX. Esta máquina de trabajo = **Mac M5**. Pipeline GPU/Gephi/Three.js = PARK. Local = JSON + grafo existente + Ollama si hace falta.
