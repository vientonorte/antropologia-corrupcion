# Design Sprint — Contra-Archivo
## Antropología de la Corrupción · Colectivo Viento Norte
**Fecha:** 15 Abril 2026 · **Metodología:** Design Thinking + Sprint 5 días

---

## Los 5 Productos

```
PÚBLICO                          AUTH              PRIVADO
─────────────────────────────────────────────────────────────────
[P1 Landing]  →  [P2 Buscador]  →  [P3 Login]  →  [P4 Privado]
Huella Digital    Inteligente       Passkey          + [P5 Tesis]
```

---

## P1 — Buscador de Huella Digital (Landing pública)

**Qué es:** Página de entrada. Cualquier persona busca un actor público, institución o política y ve su huella digital cruzada en bases de datos chilenas.

**Problema que resuelve:** La huella digital de actores del Estado está dispersa en 6+ portales oficiales. Nadie la cruza. Nosotros sí.

**Usuario:** Periodista, investigador, ciudadano curioso.

### UX / Flujo
```
[Hero: "¿Quién es?" + campo de búsqueda grande]
         ↓
[Autosugest: sugiere nombres, instituciones, leyes]
         ↓
[Resultados: tarjetas con score de fricción por fuente]
         ↓
[CTA: "Ver análisis completo →" → requiere login P3]
```

### Componentes
- Hero con buscador centrado (una sola acción)
- Autosugest conectado a `fuentes-oficiales.json` + `casos.json`
- Resultado rápido: nombre, institución, fricción media, fuentes halladas
- Badge de fuente (InfoLobby / Transparencia / BCN / SEIA / CMF / ComprasPúblicas)
- CTA hacia login

### Qué reutilizamos del repo
- `src/searchEngine.js` → lógica de score ya implementada
- `data/fuentes-oficiales.json` → 6 fuentes oficiales
- Design tokens de `index.html` (dark, --etica, --inst, --mat, --crit)

### Criterios de aceptación
- [ ] Búsqueda funciona con texto libre
- [ ] Autosugest aparece con ≥2 caracteres
- [ ] Resultados muestran badge de fuente + fricción
- [ ] Mobile-first, sin dependencias externas

---

## P2 — Buscador Inteligente (5 categorías + autosugest)

**Qué es:** Segunda capa del buscador. Navega entre 5 categorías usando autosugestión. Funcionalidades **E · F · G · H · I**.

### Las 5 Categorías

| ID | Categoría | Fuente principal | Descripción |
|----|-----------|-----------------|-------------|
| **E** | Entidades públicas | Transparencia + SEIA | Instituciones, organismos, ministerios |
| **F** | Funcionarios y actores | InfoLobby + CMF | Personas, cargos, redes de influencia |
| **G** | Gestión de recursos | ComprasPúblicas + CMF | Contratos, licitaciones, inversiones |
| **H** | Historial normativo | BCN + LeyChile | Leyes, boletines, trazabilidad legislativa |
| **I** | Investigaciones | CIPER + casos.json | Periodismo de datos, casos documentados |

### UX / Flujo
```
[Barra de búsqueda]
[Tabs: E · F · G · H · I]  ← autosugest por categoría activa
         ↓
[Lista de resultados filtrada]
  - item 1: nombre / institución / fricción
  - item 2: ...
  - item 3: ...
  - item 4: ...
  - item 5:  [scroll → más]
         ↓
[Dossier de actor] → expandible, con timeline y conexiones
```

### Componentes
- Tabs de categoría (E-I) con indicador activo
- Autosugest consciente de la categoría seleccionada
- Lista de resultados paginada (máx 5 visibles, "ver más")
- Panel de dossier lateral: timeline + conexiones + fricción por capa
- Filtro por año

### Qué reutilizamos del repo
- `src/searchEngine.js` → score híbrido ya implementado
- `data/bcn-legislativo.json` → categoría H
- `data/fuentes-oficiales.json` → categorías E, F, G
- `data/casos.json` → categoría I

---

## P3 — Login con Passkey

**Qué es:** Autenticación sin contraseña usando WebAuthn API nativa del navegador.

**Por qué passkey:** El colectivo no quiere gestionar contraseñas. Passkey es biométrico (Face ID / huella dactilar) y phishing-resistant.

### Flujo
```
[Pantalla login limpia]
[Botón "Acceder con Passkey"]
         ↓
[WebAuthn API: navigator.credentials.get()]
         ↓
[Verificación local → sessionStorage flag]
         ↓
[Redirect → P4 Landing privada]
```

### Implementación técnica
```javascript
// Registro (primera vez)
navigator.credentials.create({ publicKey: { ... } })

// Login
navigator.credentials.get({ publicKey: { ... } })
// → verifica en localStorage/sessionStorage (MVP sin servidor)
// → Para producción: backend endpoint de verificación
```

### MVP vs Producción
- **MVP (estático):** desafío hardcodeado, verificación client-side, sessionStorage
- **Producción:** endpoint serverless (Cloudflare Workers / Netlify Functions) con verificación criptográfica real

### Criterios de aceptación
- [ ] Funciona en Chrome/Safari/Firefox modernos
- [ ] Fallback visible si el dispositivo no soporta passkey
- [ ] Redirect correcto post-auth
- [ ] No almacena contraseñas en ningún lado

---

## P4 — Landing Sitio Privado

**Qué es:** El espacio del colectivo. Solo accesible post-login. Concentra todas las herramientas avanzadas.

### Funcionalidades del sitio privado

#### Ñ — Buscador con Memoria Individual
```
Usuario busca → resultado guardado en IndexedDB (local, privado)
Historial personal de búsquedas → "tus huellas"
Patrones detectados → "has buscado X 3 veces relacionado con Y"
```
- `IndexedDB` para persistencia local (sin servidor)
- Timeline personal de búsquedas
- Etiquetas propias del usuario

#### Chat — ContraArchivo Bot
```
[Input: "¿Qué sé sobre SURA y territorios mapuche?"]
         ↓
[Bot responde con fragmentos de casos.json + fuentes]
[Cita documentos del archivo]
[Sugiere conexiones entre casos]
```
- Claude API (Anthropic) con contexto inyectado desde `casos.json`
- Prompt base: el colectivo como voz, no como bot genérico
- Cita siempre la fuente documental

#### Simulación — Gráfico, Campos y Fricción
Reutiliza los 4 motores existentes del repo:
```
frictionEngine.js  → calcula fricción epistemológica
graph.js           → visualiza red de nodos fuerza-dirigida
fieldPhysics.js    → campo Coulomb + streamlines + partículas
socialField.js     → termodinámica social (80 agentes, entropía Shannon)
```
- Vista unificada: grafo + campo físico superpuesto
- Parámetros ajustables en tiempo real (fricción, temperatura social)
- Export de configuración como JSON

#### Integración — Huella Digital de Políticas Públicas
```
Actor público → todas sus apariciones en:
  • InfoLobby (reuniones con lobbistas)
  • Transparencia (remuneraciones, viajes)
  • SEIA (proyectos ambientales aprobados/rechazados)
  • ComprasPúblicas (contratos asignados)
  • BCN (leyes firmadas, votaciones)
  • CMF (vínculos societarios)
```
- Vista de línea de tiempo unificada por actor
- Score de fricción agregado
- Conexiones con casos del archivo

#### Noticias — CIPER
```
[Feed de noticias CIPER Chile]
Filtradas por actores e instituciones en seguimiento
Cruzadas con casos del archivo
```
- RSS feed de CIPER parseado client-side
- Match automático con actores en seguimiento

#### Mis Seguimientos
```
[Lista de actores / instituciones / leyes marcadas]
[Alertas cuando aparecen en nuevas fuentes]
[Agrupados por caso de investigación]
```
- `localStorage` para persistencia
- Componente de badge: "nuevo dato disponible"
- Export de seguimientos como CSV

### Layout del sitio privado
```
┌─────────────────────────────────────────────────────┐
│  NAV: ContraArchivo [privado] · [mis seguimientos] · [salir]
├──────────────┬──────────────────────────────────────┤
│  SIDEBAR     │  ÁREA PRINCIPAL                       │
│  ─────────   │  ──────────────                       │
│  Buscador Ñ  │  [Tab activo: Simulación / Chat /     │
│  Seguimientos│   Noticias / Tesis / Integración]     │
│  Historial   │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

---

## P5 — Biblioteca de Tesis — Colectivo Viento Norte

**Qué es:** Acceso a las tesis completas del colectivo. Solo para miembros autenticados.

### Contenido
- Tesis doctoral completa en PDF (acceso stream, no descarga directa)
- Poemarios del colectivo (ya existe `Poemarios/`)
- Investigación La Negra (ya existe `La Negra/`)
- Documentos de trabajo internos

### UX
```
[Grid de publicaciones]
  - Portada + título + año + tipo
  - [Leer →] → viewer inline
  - [Descargar PDF] → solo para miembros con nivel "investigador"
```

### Niveles de acceso (para producción)
| Nivel | Qué puede hacer |
|-------|----------------|
| Visitante | Landing P1, búsqueda básica |
| Miembro | Todo P4, sin descarga de tesis |
| Investigador | Todo + descarga PDF |

---

## Features A → Ñ — Mapa completo

| # | Feature | Producto | Estado |
|---|---------|----------|--------|
| A | Archivo principal (hero + narrativa) | P1 | ✅ `index.html` + `contra-archivo-v2.html` |
| B | Buscador de texto libre | P1 | ✅ `searchEngine.js` + `landing.html` |
| C | Categorías × 5 en buscador | P2 | ✅ `buscador.html` (tabs E–I) |
| D | Dossier de actor expandible | P2 | 🔨 pendiente (panel lateral stub) |
| E | Categoría: Entidades públicas | P2 | ✅ `buscador.html` tab E |
| F | Categoría: Funcionarios / actores | P2 | ✅ `buscador.html` tab F |
| G | Categoría: Gestión de recursos | P2 | ✅ `buscador.html` tab G |
| H | Categoría: Historial normativo BCN | P2 | ✅ `buscador.html` tab H + `bcn-legislativo.json` |
| I | Categoría: Investigaciones CIPER | P2 | ✅ `buscador.html` tab I |
| J | Journey / conexiones entre casos | P2 + P4 | ✅ `graph.js` |
| K | — | — | — |
| L | Login con Passkey (WebAuthn) | P3 | ✅ `login.html` + `passkey.js` |
| M | Mis seguimientos | P4 | ✅ `privado.html` + `seguimientos.js` |
| N | Noticias CIPER integradas | P4 | ✅ `privado.html` + `ciperFeed.js` |
| Ñ | Buscador con memoria individual | P4 | ✅ `privado.html` + `memoria.js` (IndexedDB) |

---

## Qué ya existe y reutilizamos

| Archivo | Reutilizado en | Cómo |
|---------|---------------|------|
| `src/searchEngine.js` | P1, P2 | Score híbrido + stats |
| `src/frictionEngine.js` | P2, P4 | Motor de fricción |
| `src/graph.js` | P4 | Grafo SVG force-directed |
| `src/fieldPhysics.js` | P4 | Campo Coulomb + partículas |
| `src/socialField.js` | P4 | Termodinámica social |
| `data/casos.json` | P1, P2, P4, P5 | Fuente de verdad |
| `data/fuentes-oficiales.json` | P1, P2 | 6 fuentes oficiales |
| `data/bcn-legislativo.json` | P2 (cat. H) | Historial BCN |
| Design tokens dark | Todos | `--bg`, `--etica`, `--inst`, `--mat`, `--crit` |
| `Poemarios/` | P5 | Biblioteca tesis |
| `La Negra/` | P5 | Investigación completa |

---

## Sprint 5 días

### Día 1 — Empatizar + Definir (Lunes)
- [ ] Journey map: periodista buscando huella digital de funcionario
- [ ] Problem statements × 5 productos
- [ ] HMW (How Might We) × 5
- [ ] Definir usuarios: Periodista / Investigador / Ciudadano / Miembro VN
- **Entregable:** User story map en este doc

### Día 2 — Idear (Martes)
- [ ] Crazy 8s de P1 landing (8 variantes de hero)
- [ ] Flujo de autosugest P2 (5 categorías)
- [ ] Flujo de passkey P3 (estados: inicial / autenticando / error / éxito)
- [ ] Layout P4 privado (sidebar + área principal)
- **Entregable:** Wireframes en código (HTML esqueleto)

### Día 3 — Decidir + Prototipar (Miércoles)
- [ ] Construir `landing.html` (P1) — hero + buscador + autosugest
- [ ] Construir `buscador.html` (P2) — tabs E-I + lista + dossier
- [ ] Construir `login.html` (P3) — passkey UI
- **Entregable:** 3 páginas funcionales (sin lógica completa)

### Día 4 — Prototipar (Jueves)
- [ ] Construir `privado.html` (P4) — layout completo
- [ ] Conectar simulación: cargar `frictionEngine` + `graph` + `fieldPhysics`
- [ ] Implementar memoria individual (IndexedDB)
- [ ] Implementar mis seguimientos (localStorage)
- **Entregable:** Prototipo completo navegable

### Día 5 — Testear (Viernes)
- [ ] Test interno con 3 usuarios del colectivo
- [ ] Checklist: ¿La búsqueda encuentra lo que busca un periodista?
- [ ] Checklist: ¿El passkey funciona en todos los dispositivos?
- [ ] Checklist: ¿La simulación tiene sentido para alguien externo?
- [ ] Priorizar issues → backlog ordenado
- **Entregable:** Lista de ajustes + decisión de qué va a producción

---

## Decisiones técnicas

| Decisión | Opción elegida | Razón |
|----------|---------------|-------|
| Framework | **Ninguno** (vanilla JS) | Coherencia con repo actual, sin build step |
| Auth | **WebAuthn API nativa** | Sin contraseñas, biométrico, phishing-resistant |
| Memoria local | **IndexedDB** | Privacidad total (local), mayor capacidad que localStorage |
| Seguimientos | **localStorage** | Simple, sincrónico, suficiente para MVP |
| Chat bot | **Claude API (Anthropic)** | Contexto del archivo inyectado, cita fuentes |
| Feed CIPER | **RSS → fetch + parse** | Sin backend, CIPER tiene RSS público |
| Deploy | **GitHub Pages** (existente) | Sin cambiar infraestructura |
| CSS | **Design tokens existentes** | `--bg`, `--etica`, `--inst`, `--mat`, `--crit` |

---

## Modelo de acceso (freemium)

```
Sin login:
  - P1: Landing + búsqueda básica (resultados limitados a 3)
  - P2: Ver categorías, autosugest activo

Con login (Passkey):
  - P4: Todas las funcionalidades privadas
  - Ñ: Buscador con memoria
  - Chat bot
  - Simulación completa
  - Mis seguimientos ilimitados
  - Noticias CIPER filtradas

Nivel investigador (manual):
  - P5: Descarga PDFs tesis completas
```

---

## Arquitectura de páginas nueva

```
/
├── index.html              ← existe (narrativa + grafo + buscador actual)
├── landing.html            ← P1: buscador huella digital (NUEVO)
├── buscador.html           ← P2: buscador inteligente 5 categorías (NUEVO)
├── login.html              ← P3: passkey auth (NUEVO)
├── privado.html            ← P4: sitio privado (NUEVO)
├── tesis.html              ← P5: biblioteca tesis (NUEVO)
├── src/
│   ├── [existentes]
│   ├── passkey.js          ← WebAuthn wrapper (NUEVO)
│   ├── memoria.js          ← IndexedDB para búsquedas (NUEVO)
│   ├── seguimientos.js     ← localStorage tracker (NUEVO)
│   └── ciperFeed.js        ← RSS parser CIPER (NUEVO)
└── data/
    └── [existentes]
```

---

## Notas de diseño visual

- Mantener design tokens existentes: fondo `#0c0c0c`, tipografía sans + mono
- P1 landing: hero minimalista, buscador centrado, una sola acción
- P2 buscador: tabs compactos, resultados densos pero escaneables
- P3 login: pantalla limpia, instrucción clara del passkey, sin distractores
- P4 privado: sidebar fija, área principal con tabs, sensación de "sala de trabajo"
- P5 tesis: grid de publicaciones, tipografía generosa, lectura larga

---

*Diseño iniciado: 15/Abril/2026 · Cuaderno página 20 · Colectivo Viento Norte*
