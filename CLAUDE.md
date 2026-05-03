# Contra-archivo · Terraza Admin

## Contexto del proyecto

App admin **privada** para alimentar el contra-archivo doctoral de Rö (antropología de la corrupción). La terraza recibe capturas (screenshots, fotos de documentos, PDFs), las analiza con Claude API según el tag asignado, y persiste resultados versionados en un **repo privado** de GitHub. El sitio público (`vientonorte/antropologia-corrupcion`) consume solo el grafo agregado/anonimizado.

**Usuaria única**: Rö (admin). No hay multi-tenant, no hay roles. Pero la calidad del código debe ser doctoral-grade: auditable, testeable, accesible.

## Marco teórico que el código debe respetar

- Cuatro casos etnográficos (definir en `lib/corpus/cases.ts` como enum).
- "Mistranslation" como fricción entre **regímenes de verdad** (jurídico, mediático, institucional, testimonial).
- Codificación Grounded Theory: open → axial → selective.
- Cada captura es un nodo potencial del force graph d3-force ya construido en el sitio público.

## Stack obligatorio

- **Next.js 15** (App Router, RSC, Server Actions).
- **TypeScript estricto** (`"strict": true`, sin `any` salvo justificación en comentario).
- **Tailwind v4** + tokens propios en `src/tokens/`. NO instalar shadcn — construimos atomic-design puro.
- **Radix Primitives** como base de accesibilidad.
- **next-auth v5** + `@simplewebauthn/server` para passkey.
- **better-sqlite3** para drafts locales y queue de commits.
- **simple-git** para escribir al working tree del repo privado clonado.
- **@anthropic-ai/sdk** server-side. Modelo: `claude-sonnet-4-7` (vision habilitado).
- **Zustand** (UI state) + **TanStack Query** (data fetching).
- **Vitest** + **Playwright** para tests.
- **Bunny Fonts** (Newsreader + Inter + JetBrains Mono) — privacy-friendly.

## Atomic Design — estructura no negociable

```
terraza/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/
│   │   │   ├── corpus/
│   │   │   ├── upload/
│   │   │   ├── codificacion/
│   │   │   └── grafo/
│   │   ├── _dev/components/
│   │   ├── api/auth/[...nextauth]/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── tokens/        # solo design tokens (TS exports)
│   │   ├── atoms/         # Button, Input, Tag, Icon, Badge, Spinner, Label
│   │   ├── molecules/     # FileDropzone, CaseSelector, CodeChip, TagPicker
│   │   ├── organisms/     # CaptureCard, AnalysisPanel, GTKanban, CommitQueue
│   │   ├── templates/     # AdminShell, CorpusLayout
│   │   └── pages/         # composiciones finales
│   ├── lib/
│   │   ├── claude/        # client + 3 prompts (semantico, gt, mistranslation)
│   │   ├── db/            # SQLite schema + migrations + queries
│   │   ├── git/           # escritura al repo clonado + commits locales sin push
│   │   ├── auth/          # passkey logic
│   │   └── corpus/        # schemas Zod, slugify, builders de metadata
│   └── middleware.ts
├── public/
├── scripts/
│   └── check-contrast.ts  # verificación WCAG AA
├── tests/
│   ├── atoms/
│   ├── molecules/
│   ├── lib/
│   ├── e2e/
│   └── setup.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.json
├── .prettierrc
├── .env.example
└── .gitignore
```

**Regla de oro atomic**: un átomo no importa moléculas. Una molécula no importa organismos. Si un componente necesita lógica de negocio, va en `lib/`, no dentro del componente.

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
  id: string;              // uuid v7
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

## Flujo de sync con GitHub Desktop

1. Usuaria sube captura en la UI.
1. App copia el archivo a `corpus-repo/corpus/<caso>/<fecha>-<slug>/source.ext` (working tree del repo privado).
1. App ejecuta análisis con Claude API según tag elegido.
1. Resultado se escribe a `transcription.md`, `analysis.md`, `codes.json`, etc., en la misma carpeta.
1. Usuaria revisa y aprueba en la UI.
1. App ejecuta `git add` + `git commit` **localmente** con mensaje semántico (no push).
1. Usuaria abre GitHub Desktop, ve el commit pendiente, hace push con su passkey.
1. App detecta el push via polling de `git log origin/main` y marca el draft como `synced` en SQLite.

**No usar tokens de GitHub en el server.** El push siempre es manual vía Desktop.

## Mensajes de commit — convención

```
corpus(caso-N): añade captura YYYY-MM-DD-slug

- Régimen origen: <jurídico|mediático|...>
- Tag análisis: <semantico|gt|mistranslation|todo>
- Códigos open: N | axial: N | selective: N
```

## Accesibilidad — WCAG 2.2 AA

- Contraste verificado en todos los pares de tokens (script en `scripts/check-contrast.ts`).
- Todo input tiene `<label>` asociado (no placeholders como labels).
- Foco visible custom (`outline` de 2px, color accent, offset 2px).
- Navegación por teclado completa, skip-link al `main`.
- Respeto a `prefers-reduced-motion`.
- Anuncios ARIA en operaciones async (upload, análisis, commit).

## Calidad — DoD por feature

- TypeScript sin errores ni warnings.
- Tests unitarios de la lógica en `lib/`.
- Test e2e Playwright del happy path.
- Verificación manual con teclado + lector de pantalla.
- README de la feature en `docs/features/<nombre>.md` (ADR ligero).

## Lo que NO hay que hacer

- No instalar shadcn ni component libraries pesadas.
- No meter secretos en el repo (usar `.env.local`).
- No hacer push automático al repo del corpus.
- No mezclar lógica de negocio en componentes UI.
- No usar `any` ni `as` sin justificar.
- No subir el directorio `corpus-repo/` (gitignored).

## Variables de entorno (`.env.local`)

```
ANTHROPIC_API_KEY=
AUTH_SECRET=
CORPUS_REPO_PATH=/Users/ro/Documents/contra-archivo-corpus
GIT_USER_NAME=Rö
GIT_USER_EMAIL=<definir>
PASSKEY_RP_ID=localhost
PASSKEY_RP_NAME=Contra-archivo Terraza
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generado en setup>
```

## Roadmap

- **F1**: Scaffold + auth passkey + UI shell + SQLite + design tokens.
- **F2**: Upload + integración Claude Vision + tres prompts especializados + edición inline.
- **F3**: Sync con repo privado vía simple-git + cola de commits + detección de push.
- **F4**: Kanban GT + export consolidado + preview del force graph.

## Convenciones de trabajo con Claude Code

- Antes de escribir código: proponer plan, esperar aprobación.
- Cambios grandes: hacerlos en commits atómicos con mensajes claros.
- Tests primero cuando sea posible (TDD ligero en `lib/`).
- Después de cada feature: actualizar este `CLAUDE.md` si cambian las reglas.
