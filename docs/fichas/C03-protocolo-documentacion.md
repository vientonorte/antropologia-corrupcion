# C03 · Protocolo de buenas prácticas de documentación

> **Tipo:** Ficha metodológica / protocolo operativo. No es ficha de caso.
> **Propósito:** Operacionalizar el límite público/privado del contra-archivo, para que material clasificable como confidencial no transite hacia capas públicas sin control explícito.
> **Estado:** Borrador para integración a `docs/`.
> **Alcance:** Todo el repositorio y cualquier material derivado de él.
> **Relación:** Complementa `SECURITY.md` y `CONTRIBUTING.md`; no los reemplaza.

---

## 1. Por qué existe este protocolo

El contra-archivo trabaja con material de orígenes heterogéneos: registro público, observación de campo, fuentes de terceros y bases internas. El proceso de documentación detectó que ese material puede transitar entre capas —de privado a público— sin un control explícito que lo clasifique y lo filtre. Cuando eso ocurre, la exposición no es un error puntual: es una propiedad del flujo de trabajo mientras no exista un gate.

Este protocolo fija ese gate. No es una recomendación: es la condición para versionar y publicar.

## 2. Regla de oro — la visibilidad real de un repositorio

Tres hechos técnicos que el protocolo asume como punto de partida:

1. **Un repositorio público de GitHub es legible por cualquiera, archivo por archivo.** No requiere autenticación. El gating de la capa de aplicación (passkey, freemium) protege la *app*, no los *archivos* del repo.
2. **El historial de git conserva todo lo versionado.** Borrar un archivo no elimina su contenido del historial: lo que se commiteó una vez, queda, recuperable.
3. **El control se ejerce *antes* del commit, no después.** No existe "publicar y después corregir". El único momento de control es previo a versionar.

Corolario: **el material clasificado Confidencial no se commitea nunca** —ni en repo público, ni privado, ni en una rama—. Vive fuera del control de versiones.

## 3. Clasificación del material — tres niveles

Todo insumo se clasifica antes de entrar al repositorio.

| Nivel | Qué es | Dónde puede vivir |
|---|---|---|
| **Público (P)** | Registro público verificable: normativa, diarios oficiales, reportes regulatorios, prensa, literatura, datos abiertos. | Repo público. Versionable. Publicable. |
| **Restringido (R)** | Investigación en progreso, borradores, análisis no decantado, observación propia aún sin resolver. | Solo capa privada (passkey). No público. |
| **Confidencial (C)** | Material interno de una organización, de terceros identificables, no público, o sujeto a obligación de reserva. | Fuera del control de versiones. No se commitea. |

Regla de duda: si no se puede clasificar con certeza, se trata como **Confidencial** hasta resolverlo. La incertidumbre nunca se resuelve a favor de la exposición.

## 4. Separación de fuentes por afirmación

Cada afirmación documentada lleva la clase de su fuente: *registro público* / *observación* / *inferencia* —consistente con el estándar etnográfico: hecho documentado / hipótesis / inferencia—.

De ahí la regla: **una afirmación que solo se sostiene en una fuente Confidencial no es publicable.** Si el mismo hecho existe en registro público, se re-documenta desde esa fuente y se cita esa. Si no existe en registro público, no entra a la capa pública —ni anonimizado—.

La anonimización transforma *cómo se nombra* un hecho; no transforma *de dónde proviene*. Un hecho de origen confidencial sigue siendo confidencial aunque se le quiten los nombres.

## 5. Protocolo de anonimización

Aplica solo a material que migra de Restringido a Público y cuya fuente es legítimamente publicable.

- **Identificadores directos:** eliminar nombres de personas, organizaciones, sistemas internos, productos, URLs internas, credenciales, rutas, identificadores de cuentas o archivos.
- **Identificadores indirectos:** eliminar combinaciones de rol + contexto + fecha que re-identifiquen aunque no se nombre. Un cargo poco frecuente en un proyecto específico identifica tanto como un nombre.
- **Generalización:** reemplazar el particular por la categoría estructural ("una administradora", "un conglomerado regional", "el sistema previsional").
- **Sujetos:** las personas no entran. El contra-archivo documenta dispositivos e instituciones, no individuos no públicos.
- **Verificación cruzada:** confirmar que el texto anonimizado, leído por alguien del sector, no reconstruya trivialmente el original.

## 6. Disclaimer obligatorio

**Capa privada (Restringido):**
> *Material de investigación en curso. Clasificación: Restringido. No citar ni redistribuir. Contiene análisis no decantado e hipótesis sujetas a verificación.*

**Capa pública (material anonimizado):**
> *Análisis estructural basado en registro público. Las generalizaciones no constituyen imputación a personas u organizaciones determinadas. Clasificación: Público.*

## 7. Gate de pre-publicación (Definition of Done)

Ningún material pasa a una capa consultable sin completar esta lista. Es binaria: un solo "no" detiene la publicación.

- [ ] Toda afirmación tiene fuente identificada y clasificada (P/R/C).
- [ ] Ninguna afirmación depende de una fuente Confidencial.
- [ ] No hay nombres de personas no públicas.
- [ ] No hay nombres de organizaciones, sistemas, productos ni credenciales internas.
- [ ] No hay identificadores indirectos que re-identifiquen (rol + contexto + fecha).
- [ ] El material no deriva de `casos.json` ni de otra base clasificada Confidencial.
- [ ] Si migró de Restringido a Público, pasó el protocolo de anonimización (§5).
- [ ] Lleva disclaimer (§6).
- [ ] Si toca a un tercero identificable o a una organización determinada: revisión legal previa.

## 8. Procedimiento ante una fuga detectada

Si se detecta material Confidencial ya versionado o publicado:

1. **No borrar unilateralmente.** El historial de git lo conserva igual, y la eliminación de material en un contexto de conflicto puede leerse como destrucción de evidencia.
2. **Escalar a revisión legal** antes de cualquier acción sobre el contenido.
3. **Documentar** qué se detectó, dónde y cuándo, en un registro interno, no público.
4. La decisión sobre qué hacer con lo expuesto —purga de historial, retiro, declaración— la toma la revisión legal, no el flujo de trabajo.

## 9. Responsabilidad

La clasificación inicial y la ejecución del gate son responsabilidad de quien aporta el material. La duda se escala; no se resuelve por defecto a favor de publicar.

## 10. Síntesis operativa

El contra-archivo puede ser radical en su análisis y conservador en su manejo de datos sin contradicción: lo primero es la fuerza del trabajo; lo segundo es lo que lo mantiene en pie. La opacidad que el contra-archivo estudia no se combate exponiendo material sin control: se combate documentando estructura, con método, sobre fuentes que resisten el escrutinio.

---

## Codificación (Grounded Theory)

**Open coding** — códigos emergentes del protocolo:

- clasificación preventiva (P/R/C)
- gate de pre-publicación
- anonimización estructural
- separación fuente-afirmación
- duda clasificatoria
- irreversibilidad del commit
- opacidad estudiada / opacidad reproducida (tensión)
- responsabilidad de quien aporta
- disclaimer como marcador de capa

**Axial coding** — relaciones entre códigos. La *clasificación preventiva* habilita el *gate de pre-publicación*, y este produce la *separación fuente-afirmación*: tres códigos que forman un solo eje, el del control de flujo entre capas. Un segundo eje vincula la *irreversibilidad del commit* con la *duda clasificatoria*: donde el historial de git no permite rectificar, la duda no puede resolverse a favor de la exposición. Un tercer eje sitúa la tensión entre *opacidad estudiada* (el objeto de análisis) y *opacidad reproducida* (el riesgo del proceso): el contra-archivo estudia dispositivos opacos y debe cuidar no reproducir esa opacidad al exponer material sin control.

**Selective coding** — categoría central: *el gate como dispositivo de rendición de cuentas interna*. El protocolo no es una recomendación ética externa al proceso de investigación; es la forma que toma la responsabilidad cuando el objeto de estudio —corrupción, opacidad, mistranslation— exige que el método no reproduzca aquello que critica. La categoría central no es una restricción. Es una arquitectura de confianza.

## Dimensiones D1–D7

Mapeo dimensional del protocolo (aplicado a sí mismo como objeto metodológico):

| Dim. | Eje | Pregunta analítica | Lectura |
|---|---|---|---|
| D1 | Jurisdicción / soberanía | ¿Bajo qué régimen se decide la exposición? | Responsabilidad del investigador + revisión legal cuando aplique. |
| D2 | Localización infraestructural | ¿Dónde reside el material antes de publicarse? | Clasificación preventiva: C fuera de VCS, R en capa privada, P en público. |
| D3 | Atribución de acceso | ¿Quién decide qué se publica? | La responsabilidad es de quien aporta; la duda se escala. |
| D4 | Régimen archivístico | ¿Qué se retiene, por cuánto, por qué mandato? | Git retiene todo: el gate opera *antes* del commit, no después. |
| D5 | Clasificación del material | ¿En qué categorías se ordena el material? | P/R/C: tres niveles que corresponden a capas de exposición. |
| D6 | Fricción inter-capas | Distancia entre lo registrado, lo vivido y lo evidenciado. | Máxima en la anonimización: la fuente confidencial no es publicable aunque se generalice. |
| D7 | Visibilidad / opacidad | ¿Es el protocolo auditable desde fuera? | Sí: el gate de pre-publicación es una checklist pública en este documento. |

## Sitio de fricción / mistraducción

El sitio de fricción central del protocolo es la **anonimización**. El acto de anonimizar puede leerse como un gesto de protección —quitar nombres para no exponer sujetos— y también como un gesto de transformación que oculta la procedencia del hecho. El protocolo resuelve esa tensión por la vía de la restricción: la anonimización no convierte una fuente Confidencial en una fuente Pública; solo la re-nombra. Si un hecho no existe en registro público, no entra a la capa pública —ni anonimizado—.

Ahí está la mistraducción, en el sentido que el contra-archivo le da al término: "anonimización" en el discurso de la investigación responsable puede sonar como si resolviera el problema de la confidencialidad, pero el protocolo rechaza esa lectura. La anonimización transforma *cómo se nombra*; no transforma *de dónde proviene*. Un hecho de origen confidencial sigue siendo confidencial aunque se le quiten los nombres. El protocolo hace visible esa distancia.

## Apertura analítica

El protocolo opera como gate, pero no resuelve el problema mayor: ¿qué hacer cuando el hecho estructuralmente relevante —el que debería documentarse— solo existe en forma confidencial? El protocolo responde: no se publica. Pero esa respuesta abre una tensión no resuelta: si los hechos más relevantes para documentar la opacidad institucional son precisamente aquellos que la institución clasifica como confidenciales, entonces el contra-archivo está construido sobre una contradicción: documenta lo que puede, no lo que importa.

Esa contradicción no se resuelve en este protocolo. Se reconoce. Y se deja como el sitio donde el método debe seguir trabajando: cómo documentar estructura sin exponer sujetos, cómo hacer visible la opacidad sin reproducirla, cómo construir un archivo crítico que no sea, él mismo, un dispositivo de captura.

## Vínculos con otras fichas

- [C01 — El núcleo y el margen](C01-nucleo-margen.md): El protocolo C.03 opera la misma distinción que C.01 formula como concepto: la opacidad como propiedad de diseño, no como falla. El protocolo no busca "transparentar" el proceso de investigación; busca hacer auditable el gate que controla el flujo entre capas.
- [C02 — La cuenta y el núcleo](C02-sistema-pensiones-archivo.md): El mandato de clasificar preventivamente (P/R/C) antes de versionar reproduce, a escala metodológica, el problema que C.02 documenta a escala institucional: la clasificación no es neutra; es el acto que decide qué es visible y qué no lo es.

## Referencias

- Bowker, G. C. & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences*. Cambridge, MA: MIT Press.
- Stoler, A. L. (2002). "Colonial Archives and the Arts of Governance." *Archival Science*, 2(1-2), 87-109.
- Taussig, M. (1999). *Defacement: Public Secrecy and the Labor of the Negative*. Stanford: Stanford University Press.

**Registro normativo y metodológico citado:**

- Chile — Ley N° 21.719 sobre protección de datos personales.
- American Anthropological Association (2012). *Principles of Professional Responsibility*. [Ética de investigación con sujetos humanos]
- GitHub (2024). *Security best practices for repositories*. [Control de versiones y visibilidad de archivos]

---

## Definition of Done

- [x] Open / axial / selective coding completos ✅
- [x] Mapeo D1–D7 completo ✅
- [x] Anchor teórico citado con referencia ✅
- [x] Sitio de fricción identificado ✅
- [ ] Apertura analítica (no conclusión cerrada) ✅
- [x] Vínculos con otras fichas ✅
- [ ] Integración al flujo de trabajo del repositorio ☐ pendiente
- [ ] Validación en práctica (aplicación a casos reales) ☐ pendiente

