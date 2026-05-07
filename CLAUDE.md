# Contra-archivo · Terraza Admin

> Documento canónico del contexto privado `terraza/`. No usar este archivo para documentar la arquitectura pública de la raíz del repositorio.

## Contexto del proyecto

App admin **privada** para alimentar el contra-archivo doctoral de Rö (antropología de la corrupción). La terraza recibe capturas (screenshots, fotos de documentos, PDFs), las analiza con Claude API según el tag asignado, y persiste resultados versionados en un **repo privado** de GitHub. El sitio público (`vientonorte/antropologia-corrupcion`) consume solo el grafo agregado/anonimizado.

**Usuaria única**: Rö (admin). No hay multi-tenant, no hay roles. Pero la calidad del código debe ser doctoral-grade: auditable, testeable, accesible.

---

## Estado actual del proyecto (2026-05-05)

### Implementado y merged en `main`

| Commit | Feature | Estado |
|--------|---------|--------|
| C1 | Bootstrap Next.js 15 + TypeScript + Tailwind | ✅ |
| C2 | Toolchain: Vitest + Playwright + ESLint + Prettier | ✅ |
| C3 | Auth scaffold: passkey (WebAuthn) + session + middleware | ✅ |
| C4 | SQLite: schema + credentials + challenges + sessions | ✅ |
| C5 | Upload: FileDropzone + UploadForm + API `/corpus/upload` | ✅ |
| C6 | Claude Vision: 3 prompts (semántico, GT, mistranslation) + API `/corpus/analyze` | ✅ |
| C7 | Corpus browser: CaptureCard + AnalysisPanel + APIs list/update | ✅ |
| C8 | Audit HTML/a11y: skip link, nav semántico, login wired, WCAG 2.2 tabs/dropzone | ✅ |
| C9 | Sync simple-git: corpus-writer, commit-queue, APIs commit/sync-status, CommitQueue UI | ✅ |
| C10 | CommitQueue UI — cola de commits en corpus page (cola colapsable) | ✅ |
| C11 | Kanban GT (`/codificacion`) — drag-and-drop HTML5 nativo | ✅ |
| C12 | Preview force graph d3 (`/grafo`) + export consolidado | ✅ |

### Completado

F1 ✅ · F2 ✅ · F3 ✅ · F4 ✅ — todos los commits mergeados en `main`. Ver git log para detalle.

---

## Marco teórico que el código debe respetar

- Cuatro casos etnográficos (definir en `lib/corpus/cases.ts` como enum).
- "Mistranslation" como fricción entre **regímenes de verdad** (jurídico, mediático, institucional, testimonial).
- Codificación Grounded Theory: open → axial → selective.
- Cada captura es un nodo potencial del force graph d3-force ya construido en el sitio público.

---

## Stack obligatorio

- **Next.js 15** (App Router, RSC, Server Actions).
- **TypeScript estricto** (`"strict": true`, sin `any` salvo justificación en comentario).
- **Tailwind v4** + tokens propios en `src/tokens/`. NO instalar shadcn — construimos atomic-design puro.
- **Radix Primitives** como base de accesibilidad.
- **@simplewebauthn/server + browser** para passkey.
- **better-sqlite3** para drafts locales y queue de commits.
- **simple-git** para escribir al working tree del repo privado clonado.
- **@anthropic-ai/sdk** server-side. Modelo: `claude-sonnet-4-7` (vision habilitado).
- **Zustand** (UI state) + **TanStack Query** (data fetching).
- **Vitest** + **Playwright** para tests.
- **Bunny Fonts** (Newsreader + Inter + JetBrains Mono) — privacy-friendly.

---

## Buenas prácticas para IAs colaboradoras

Esta sección es obligatoria para cualquier agente (Claude Code, Copilot, Cursor u otro) que trabaje en este repositorio.

### Antes de escribir código

1. **Lee este archivo completo** antes de proponer cualquier cambio.
2. **Verifica el estado actual** con `git log --oneline -10` y `git status`.
3. **Revisa la sección "Estado actual"** arriba — no reimplementes lo que ya existe.
4. Si la tarea es ambigua, **propón un plan primero** y espera aprobación.

### Invariantes de calidad

```bash
# Siempre debe pasar antes de hacer commit:
npx tsc --noEmit          # TypeScript estricto sin errores
npx eslint src            # Sin warnings
```

- **Nunca** usar `any` sin un comentario `// eslint-disable-next-line @typescript-eslint/no-explicit-any` explicando por qué.
- **Nunca** hacer `as unknown as X` sin justificación en comentario.
- **Nunca** eliminar tipos estrictos para hacer pasar la build.

### Atomic Design — regla de oro

```
atoms → molecules → organisms → templates → pages
```

- Un **átomo** no importa moléculas ni organismos.
- Una **molécula** no importa organismos.
- La **lógica de negocio** va en `lib/`, nunca en componentes.
- Los **componentes** solo reciben props y llaman funciones de `lib/`.

### Accesibilidad — no negociable (WCAG 2.2 AA)

Cada componente interactivo debe tener:
- `<label>` asociado a todo input/textarea/select (no placeholder como label).
- `aria-label` o `aria-labelledby` en controles sin texto visible.
- `role` correcto en elementos no-semánticos interactivos (`role="button"`, `role="tablist"`, etc.).
- `tabIndex` gestionado: roving tabindex en grupos, `-1` en elementos no alcanzables.
- Keyboard handler para Enter/Space en `role="button"` divs.
- `aria-live="polite"` en mensajes de estado async (guardado, error, carga).
- `role="alert"` en mensajes de error.
- `aria-current="page"` en links de navegación activos.

**Skip link obligatorio**: el root layout ya tiene `<a href="#main-content">`. El `<main>` admin ya tiene `id="main-content"`.

### HTML semántico

- Usar `<nav>` para navegación, no `<div>`.
- Usar `<article>` para tarjetas de contenido autónomo.
- Usar `<aside>` para sidebars.
- Jerarquía de headings: H1 por página, H2 para secciones, H3 para subsecciones.
- No usar tablas para layout.
- SVGs decorativos llevan `aria-hidden="true"`.

### API routes

Toda API route debe:
1. Verificar sesión con `getSession()` primero (salvo rutas `/api/auth/*`).
2. Validar input con Zod antes de acceder a la base de datos.
3. Verificar que el `userId` del recurso coincide con el `session.userId` (ownership check).
4. Devolver errores en formato `{ error: string }` con status HTTP correcto.

### Base de datos

- Las queries usan `Record<string, unknown>` con assertions explícitas (patrón establecido).
- **Nunca** construir SQL concatenando strings — usar `db.prepare()` con placeholders.
- Los campos JSON (tags, codes, mistranslations) se almacenan como strings y se parsean al leer.

### Commits

- Commits atómicos: un commit = una feature o un fix.
- Formato: `tipo(scope): descripción en español`
  - `feat(corpus): ...`
  - `fix(a11y): ...`
  - `chore(db): ...`
- Incluir siempre al final: `https://claude.ai/code/session_<ID>`

### Lo que NO hay que hacer

- No instalar shadcn ni component libraries pesadas.
- No meter secretos en el repo (usar `.env.local`).
- No hacer push automático al repo del corpus.
- No mezclar lógica de negocio en componentes UI.
- No usar `any` ni `as` sin justificar.
- No subir el directorio `corpus-repo/` (gitignored).
- No crear archivos `.md` de documentación salvo que se pidan explícitamente.
- No refactorizar código que funciona si no es parte de la tarea.
- No añadir manejo de errores para casos imposibles.

---

## Atomic Design — estructura no negociable

```
terraza/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/
│   │   │   ├── corpus/          ✅ implementado
│   │   │   ├── upload/          ✅ implementado
│   │   │   ├── codificacion/    ✅ Kanban GT (C11)
│   │   │   └── grafo/           ✅ force graph preview (C12)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── atoms/         Button, Spinner  ✅
│   │   ├── molecules/     FileDropzone, UploadForm  ✅
│   │   ├── organisms/     CaptureCard, AnalysisPanel  ✅
│   │   └── templates/     (pendiente)
│   ├── lib/
│   │   ├── claude/        client + analyze + 3 prompts  ✅
│   │   ├── db/            schema + migrations + queries  ✅
│   │   ├── git/           simple-git + commit-queue + polling  ✅
│   │   ├── auth/          passkey + session  ✅
│   │   └── corpus/        schemas Zod + cases  ✅
│   └── middleware.ts       ✅
├── tests/
│   └── (pendiente — ningún test escrito aún)
└── scripts/
    └── check-contrast.ts  (pendiente)
```

---

## Contrato de datos del corpus

Cada captura genera un directorio en el repo privado:

```
corpus/<caso-slug>/<YYYY-MM-DD>-<slug>/
  ├── source.{png|jpg|pdf}
  ├── metadata.json       # validado contra Zod schema
  ├── transcription.md
  ├── analysis.md
  ├── codes.json          # GT codes estructurados
  └── mistranslations.json
```

`metadata.json` — schema mínimo:

```ts
{
  id: string;              // uuid v4
  caso: 1 | 2 | 3 | 4;
  fecha_captura: string;   // ISO 8601
  fecha_evento: string | null;
  fuente_tipo: 'documento_oficial' | 'prensa' | 'testimonio' | 'red_social' | 'archivo_propio' | 'otro';
  regimen_verdad_origen: 'juridico' | 'mediatico' | 'institucional' | 'testimonial';
  tags: string[];
  estado_codificacion: 'pendiente' | 'open' | 'axial' | 'selective' | 'verificado';
  hash_source: string;     // sha256 de la imagen original
}
```

---

## Flujo de sync con GitHub Desktop

1. Usuaria sube captura en la UI.
2. App copia el archivo a `corpus-repo/corpus/<caso>/<fecha>-<slug>/source.ext`.
3. App ejecuta análisis con Claude API según tag elegido.
4. Resultado se escribe a `transcription.md`, `analysis.md`, `codes.json`, etc.
5. Usuaria revisa y aprueba en la UI.
6. App ejecuta `git add` + `git commit` **localmente** (no push).
7. Usuaria abre GitHub Desktop, ve el commit pendiente, hace push.
8. App detecta el push via polling `git log origin/main` y marca draft como `synced`.

**No usar tokens de GitHub en el server.** El push siempre es manual vía Desktop.

---

## Mensajes de commit del corpus

```
corpus(caso-N): añade captura YYYY-MM-DD-slug

- Régimen origen: <jurídico|mediático|...>
- Tag análisis: <semantico|gt|mistranslation|todo>
- Códigos open: N | axial: N | selective: N
```

---

## Variables de entorno (`.env.local`)

```
ANTHROPIC_API_KEY=
DATABASE_PATH=./data/terraza.db
CORPUS_REPO_PATH=/Users/ro/Documents/contra-archivo-corpus
GIT_USER_NAME=Rö
GIT_USER_EMAIL=<definir>
PASSKEY_RP_ID=localhost
PASSKEY_RP_NAME=Contra-archivo Terraza
NEXTAUTH_URL=http://localhost:3000
```

---

## Roadmap

- **F1** ✅: Scaffold + auth passkey + UI shell + SQLite + design tokens.
- **F2** ✅: Upload + integración Claude Vision + tres prompts especializados + edición inline.
- **F3** ✅: Sync con repo privado vía simple-git + cola de commits + detección de push.
- **F4** ✅: Kanban GT + export consolidado + preview del force graph.
