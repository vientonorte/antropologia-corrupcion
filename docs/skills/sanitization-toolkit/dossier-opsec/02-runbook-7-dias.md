# RUNBOOK OPSEC · 7 DÍAS

**Sujeto:** Rodrigo Gaete Gaona (Rö)
**Versión:** V1 · 2026-05-15
**Clasificación:** CONFIDENCIAL · solo sujeto + asesoría legal
**Objetivo:** ejecutar capas 1 y 4 de protección, iniciar pipeline de sanitización, contactar asesoría legal, abrir interlocución con INDH y CIPER.

---

## Día 0 · HOY (2026-05-15)

### Mañana (1 h)

- [ ] Backup completo de Mac, iPhone, iPad a disco externo cifrado.
- [ ] Activar Advanced Data Protection en iCloud (Ajustes → Apple ID → iCloud → Protección de datos avanzada).
- [ ] Verificar 2FA activo en: Apple ID, GitHub, ProtonMail, Gmail, LinkedIn, ADP List.

### Tarde (45 min)

- [ ] **Apple Legacy Contact** · iPhone: Ajustes → tu nombre → Acceso a la cuenta y herencia digital → Contacto heredado → añadir dos contactos. Verificar sincronización en Mac y iPad.
- [ ] Confirmar con cada Legacy Contact que recibió y guardó la clave de acceso.

### Noche (30 min)

- [ ] Correr `inventory_phase_0.py` sobre `antropologia-corrupcion`. Guardar `inventario.csv`. Revisar top-10 PII.

**DoD día 0:** ADP activado · 2 Legacy Contacts confirmados · inventario corrido.

---

## Día 1 · 2026-05-16

### Mañana (2 h)

- [ ] **Identificar asesoría legal DDHH internacional.** Tres mails iniciales:
  - Observatorio Ciudadano Chile · `contacto@observatorio.cl`
  - CEJIL · `cejil@cejil.org`
  - Front Line Defenders · `info@frontlinedefenders.org`
- [ ] Adjuntar TM V2 cifrado con PGP o link Proton Drive con caducidad 7 días.

### Tarde (1 h)

- [ ] Comprar YubiKey 5C NFC (Falabella · Mercado Libre · Amazon directo). Costo aprox. CLP 70.000.
- [ ] Mientras llega: configurar 2FA app (Authy / 1Password) como fallback en cuentas críticas.

### Noche (1 h)

- [ ] Editar lista `NAMES_KNOWN` en `inventory_phase_0.py` con nombres adicionales del corpus.
- [ ] Re-correr inventario con lista ampliada.

**DoD día 1:** 3 mails enviados · YubiKey ordenada · inventario refinado.

---

## Día 2 · 2026-05-17

### Mañana (2 h)

- [ ] **Sobre sellado #1 · A.R.G.** Imprimir, firmar a mano, sellar. Contenido:
  - Carta de instrucciones (template incluido al final del runbook).
  - Runbook resumido de 1 página.
  - Hoja en blanco para fragmento Shamir futuro.
- [ ] Coordinar entrega presencial o correo certificado.

### Tarde (1.5 h)

- [ ] **Sobre sellado #2 · familiar directo o pareja.** Mismo contenido.
- [ ] Si no hay tercera confianza, este punto se difiere a día 3.

### Noche (45 min)

- [ ] Borrador de carta a CIPER (template incluido). Revisar y dejar listo para envío día 4.

**DoD día 2:** 1-2 sobres físicos preparados · borrador CIPER listo.

---

## Día 3 · 2026-05-18

### Mañana (2 h)

- [ ] **Conversación con terapeuta** sobre el protocolo (no para validación emocional; para que esté en el loop si la carga aumenta).
- [ ] Revisar respuestas de asesoría legal recibidas. Si hay disponibilidad de llamada, agendar para día 4 o 5.

### Tarde (2 h)

- [ ] **Fase 1 del pipeline · diccionario maestro:**
  - Correr `dictionary_phase_1.py` (entregado en este sprint).
  - Output: `diccionario_maestro.json` cifrado.
  - Guardar copia en disco externo cifrado, no en iCloud.

### Noche (45 min)

- [ ] **Sobre sellado #3 · abogado/a** (si ya tienes uno) o queda pendiente hasta contratar.

**DoD día 3:** terapeuta en loop · diccionario maestro generado · sobre #3 según disponibilidad.

---

## Día 4 · 2026-05-19

### Mañana (1.5 h)

- [ ] **Carta formal a INDH** · enviar versión final (template incluido).
- [ ] Adjuntar CV breve + alcance del corpus (sin contenido sensible).
- [ ] Solicitar reunión presencial o videollamada para evaluación de caso.

### Tarde (2 h)

- [ ] **Carta a CIPER** · enviar versión final.
- [ ] Coordinar reunión de 30 min para protocolo de continuidad.

### Noche (1 h)

- [ ] Configurar warrant canary en sitio personal (rgaonadiseno.com o similar). Texto inicial:

> "Esta declaración se actualiza cada 30 días. Última actualización: 2026-05-19. Confirmo que (a) no he sido contactado por agencias estatales o privadas con orden de entrega de material o silencio; (b) mantengo control efectivo de mis cuentas y dispositivos; (c) cualquier comunicación de mi parte que contradiga estos puntos debe considerarse coaccionada."

**DoD día 4:** INDH contactado · CIPER contactado · warrant canary publicado.

---

## Día 5 · 2026-05-20

### Mañana (2 h)

- [ ] Llamada con asesoría legal (si está agendada).
- [ ] Tomar notas: estatuto whistleblower, exposición civil/penal, medidas cautelares posibles.

### Tarde (3 h)

- [ ] **Auditoría de cuentas críticas:**
  - Apple ID · sesiones activas, dispositivos autorizados.
  - GitHub · tokens activos, OAuth apps autorizadas, sesiones.
  - ProtonMail / Gmail · forwarders, filtros, sesiones.
  - LinkedIn · seguidores y conexiones sospechosas.
  - Redes sociales · seguidores recientes, mensajes directos no leídos.
- [ ] Revocar accesos no reconocidos.

**DoD día 5:** llamada legal completada · auditoría de cuentas hecha.

---

## Día 6 · 2026-05-21

### Mañana (2 h)

- [ ] **Comenzar Fase 2 del pipeline · texto:**
  - Correr `text_processing_phase_2.py` (a entregar después del diccionario).
  - Output: archivos `.md` y `.txt` con tokens.

### Tarde (2 h)

- [ ] **Sanitización manual de las 10 fichas con mayor PII** (según inventario del día 0-1).
- [ ] QA visual: leer cada ficha post-procesamiento, confirmar 0 PII residual.

### Noche (1 h)

- [ ] Actualizar warrant canary con fecha del día.

**DoD día 6:** 10 fichas más críticas sanitizadas · QA visual completo.

---

## Día 7 · 2026-05-22

### Mañana (1 h)

- [ ] **Retrospectiva del sprint OpSec:**
  - ¿Qué se cumplió?
  - ¿Qué quedó pendiente?
  - ¿Qué cambió de prioridad?
- [ ] Documentar en `dossier-opsec/retro-sprint-1.md`.

### Tarde (2 h)

- [ ] Definir siguiente sprint:
  - Capa 2 · DMS técnico (VPS + check-in passkey + cron).
  - Capa 3 · Paquete cifrado Shamir 2-de-3.
  - Continuación Fase 2 del pipeline (imágenes, PDFs, video, audio).
  - Contratación de asesoría legal (basado en respuestas recibidas).

### Noche

- [ ] Descanso. La carga acumulada es alta.

**DoD día 7:** retro escrita · siguiente sprint planificado.

---

## Templates incluidos

### Template A · Carta para sobre sellado físico

```
Para: [Nombre de la persona de confianza]
De: Rodrigo Gaete Gaona (Rö)
Fecha: 2026-05-15
Asunto: Protocolo de continuidad de investigación

Si recibes este sobre con instrucción de abrirlo, es porque:
(a) he fallecido, o
(b) llevo más de 14 días sin contacto y sin acceso a mis dispositivos,
o (c) tú lo abres por instrucción explícita mía.

Solicito que ejecutes lo siguiente:

1. Notifica a CIPER Chile (contacto@ciperchile.cl, +56 2 [pendiente])
   mencionando el código de verificación: [CÓDIGO ÚNICO POR DESTINATARIO].

2. Notifica al INDH (Instituto Nacional de Derechos Humanos) Chile
   (oficina central +56 2 [pendiente] · denuncias@indh.cl).

3. Si tienes el fragmento Shamir, espera a que los otros dos custodios
   te contacten. Necesitan dos fragmentos para abrir el paquete cifrado.

4. Mi investigación pública vive en:
   https://github.com/vientonorte/antropologia-corrupcion
   https://vientonorte.github.io/antropologia-corrupcion

5. Mis fuentes vivas requieren protección. NO publicar nombres, números
   ni ubicaciones identificables sin sanitización previa. El paquete
   cifrado contiene la versión sanitizada lista para continuidad
   académica/periodística.

Contactos primarios (en orden):
- [Nombre terapeuta] — terapeuta cognitivo-conductual
- [Nombre abogado/a] — asesoría legal DDHH
- [Nombre pareja]
- [Nombre familia: hermano + tel]

Mi voluntad explícita es que esta investigación continúe.
No es un trabajo personal: es un contra-archivo público de prácticas
estructurales documentadas con fuentes verificables.

Firmado:
Rodrigo Gaete Gaona — Rö
RUT [pendiente]
Email: gaete.gaona@gmail.com
```

### Template B · Runbook de 1 página (anexo al sobre)

```
Si activas este protocolo, sigue estos pasos en orden:

1. Comunica al menos a UNO de los otros dos custodios que abriste tu sobre.
2. Contacta a CIPER y al INDH usando el código de verificación.
3. NO publiques contenido del paquete cifrado en redes sociales.
4. NO contactes a fuentes vivas mencionadas sin asesoría legal previa.
5. Si recibes contacto sospechoso después de activar, documenta y reporta.

Esquema general del paquete cifrado:
- TM V2 (este documento, versión sanitizada).
- Corpus sanitizado del contra-archivo.
- Manifiesto de fuentes vivas con criterios de protección.
- Archivo de observación DDHH 2019.
- Instrucciones para CIPER e INDH.
- Hash SHA-256 de cada componente para verificación de integridad.
```

### Template C · Mail a asesoría legal

```
Asunto: Solicitud de evaluación de caso · investigador DDHH en Chile

Estimado/a [Nombre o equipo],

Soy Rodrigo Gaete Gaona, investigador independiente. Trabajo desde 2024
en un contra-archivo público sobre prácticas estructurales de corrupción
en Chile, con foco en mistraducción institucional. El proyecto vive en:
https://vientonorte.github.io/antropologia-corrupcion

Por la naturaleza del trabajo y por antecedentes personales que adjunto
en documento confidencial, requiero asesoría legal especializada en:

1. Protección de datos (Ley 21.719 + estándares internacionales).
2. Whistleblowing y protección de denunciantes (Ley 21.643).
3. OIT 169 y derechos de pueblos indígenas.
4. Libertad de expresión e información (CIDH, Article 19).
5. Protección integral de defensores DDHH en riesgo.

Adjunto Threat Model V2 cifrado con PGP. Mi clave pública:
[PUBLICAR KEY POST-GENERACIÓN]

Quedo atento a su disponibilidad para una primera reunión.

Saludos,
Rodrigo Gaete Gaona
gaete.gaona@gmail.com
+56 [teléfono]
```

---

## Indicadores de éxito al cierre del sprint (día 7)

| Indicador | Meta | Medición |
|---|---|---|
| ADP iCloud | Activo | Verificable en Ajustes |
| Apple Legacy Contacts | 2+ confirmados | Confirmación recibida |
| Sobres físicos entregados | 2-3 | Comprobante de entrega |
| Asesoría legal contactada | 3+ orgs | Mails enviados con acuse |
| INDH contactado | 1 carta enviada | Acuse de recepción |
| CIPER contactado | 1 carta enviada | Acuse de recepción |
| Inventario PII completo | 100% del corpus | inventario.csv generado |
| Diccionario maestro | Generado y cifrado | Hash SHA-256 registrado |
| Fichas críticas sanitizadas | 10/10 top PII | QA dual completado |
| Warrant canary | Publicado | URL pública accesible |

---

**Fin del runbook.**
