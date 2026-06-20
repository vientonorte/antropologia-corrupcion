# Design Sprint — Proxy IA para zuboff-archivo (sin API key en browser)

**Producto:** [zuboff-archivo.html](https://vientonorte.github.io/antropologia-corrupcion/zuboff-archivo.html)  
**Repos:** `antropologia-corrupcion` + Worker compartido `table-ro/worker`  
**Skills en repo:** `docs/skills/lectura-clave-b.md`, `docs/skills/bujo-ro.md`  
**Fecha:** 20 junio 2026

---

## 0 · Pregunta que responde este sprint

> «¿Por qué pide *Ingresa tu API key primero* si el skill ya está en el repositorio?»

**Respuesta corta:** El skill en repo es el **protocolo** (prompt, Clave A/B, JSON schema). La **inferencia** (Claude Vision) sigue siendo un servicio de pago que no puede ejecutarse solo con archivos estáticos en GitHub Pages.

| Capa | Qué hay hoy | Qué falta sin proxy |
|------|-------------|---------------------|
| Skill / prompt | ✅ embebido en HTML + `docs/skills/` | — |
| Corpus citas | ✅ `data/zuboff-citas.json` + localStorage | — |
| Inferencia IA | ❌ `fetch(api.anthropic.com)` desde browser | API key del usuario en sesión |

**North Star:** Subir foto → Clave B / bujo-ro → citas sin pegar `sk-ant-…` en la UI pública.

**Guardrails:** Key nunca en localStorage · CORS solo `vientonorte.github.io` · Sin persistir imágenes en Worker · BYOK opcional para dev.

---

## 1 · Arquitectura objetivo

```
zuboff-archivo.html (GitHub Pages)
    │  POST /api/claude  { model, system, messages }
    ▼
table-ro AI Proxy (Cloudflare Worker)
    │  CLAUDE_API_KEY (secret)
    ▼
api.anthropic.com/v1/messages
```

Reutiliza el Worker ya documentado en `table-ro/WORKER-DEPLOY.md` — **no duplicar** infra.

Config publicada:

```json
// data/ai-proxy-config.json
{ "proxyUrl": "https://table-ro-ai-proxy.<cuenta>.workers.dev", "model": "claude-sonnet-4-6" }
```

Override local (solo Rö): `localStorage.contra_archivo_proxy_url`

---

## 2 · Design Thinking

### Empatizar

| Momento | Hoy | Pain |
|---------|-----|------|
| Abrir analizador Clave B | Campo API key | Fricción; parece bug si ya hay skill en repo |
| Sesión nueva | Key en memoria, se pierde | Re-ingresar cada vez |
| Investigadora en privado | Mismo flujo | No diferencia espacio privado vs público |

### Definir

**Problem statement:** Como investigadora del contra-archivo quiero analizar fotos con Clave B sin gestionar API keys, usando el proxy viento norte que ya aloja el protocolo del skill.

### Idear (MoSCoW)

| ID | Idea | Prioridad |
|----|------|-----------|
| P1 | `callClaudeMessages()` → proxy primero, BYOK fallback | Must |
| P2 | `data/ai-proxy-config.json` en deploy | Must |
| P3 | Ocultar fila API key cuando proxy activo | Must |
| P4 | Mensaje claro si falta proxy **y** key | Must |
| P5 | Cargar prompts desde `docs/skills/*.md` (fetch) | Could |
| P6 | Rate limit / passkey en Worker | Could |

---

## 3 · Sprint técnico (3 fases)

### Sprint A — Frontend (este commit) ✅

| Entregable | Archivo |
|------------|---------|
| Config proxy | `data/ai-proxy-config.json` |
| Helper `callClaudeMessages` | `web/zuboff-archivo.html` |
| UI proxy activo / BYOK fallback | idem |
| Design doc | `DESIGN-SPRINT-PROXY-IA.md` |

**DoD Sprint A:**
- [ ] Con `proxyUrl` vacío + sin key → mensaje explica Worker, no solo «API key»
- [ ] Con `proxyUrl` set + Worker desplegado → analizar sin key
- [ ] `node tests/runner.js` pasa

### Sprint B — Worker (owner: Rö)

```bash
cd table-ro/worker
npx wrangler login
npx wrangler secret put CLAUDE_API_KEY
npx wrangler deploy
```

Actualizar `data/ai-proxy-config.json` con URL real → push `main` → GitHub Pages.

**DoD Sprint B:**
- [ ] `curl -X POST $PROXY/api/claude` desde origen Pages → 200
- [ ] Clave B: foto golden → JSON array importable
- [ ] bujo-ro: foto cuaderno → Markdown en preview

### Sprint C — QA producción

| Check | URL |
|-------|-----|
| Corpus carga | `/zuboff-archivo.html` stats > 0 |
| Proxy badge | «Proxy IA viento norte activo» |
| Sin key en DevTools | no `localStorage.anthropicApiKey` |
| Privado | enlace desde `privado.html` |

---

## 4 · Criterios de aceptación (CMA)

| Criterio | Medida | Aceptación |
|----------|--------|------------|
| Sin key con proxy | Analizar foto Clave B sin input sk-ant | ≥1 cita importada |
| Fallback BYOK | proxy vacío + key sesión | flujo actual funciona |
| Seguridad | Inspección storage | 0 keys persistidas |
| Skill trazable | system prompt | menciona lectura-clave-b / bujo-ro v1.2 |
| Deploy | GitHub Actions | deploy job success |

---

## 5 · Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Worker sin deploy | Mensaje UX + Sprint B checklist |
| Costo API | Solo Rö en secret; sin key pública |
| CORS 403 | `ALLOWED_ORIGIN` incluye Pages URL |
| Dependabot rompe nada aquí | Sitio estático, sin react |

---

## 6 · Referencias

- Worker: `table-ro/worker/src/index.js` → `POST /api/claude`
- Patrón cliente: `table-ro/js/app.js` → `callClaude()`, `getProxyUrl()`
- Deploy Worker: `table-ro/WORKER-DEPLOY.md`
- Skills: `docs/skills/lectura-clave-b.md`, `docs/skills/bujo-ro.md`