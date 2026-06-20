# Mobile-first QA — Contra-Archivo

> Sprint 2026-06-20 · quick wins + debug + documentación

## Breakpoints canónicos

| Token | Ancho | Uso |
|---|---|---|
| `sm` | 640px | Nav colapsable, grafo toolbar stack |
| `md` | 768px | `privado.html` sidebar sticky / hamburger off |
| `lg` | 1024px | Layouts de dos columnas |

## Quick wins aplicados

### Navegación
- **`shared-shell.js`**: hamburger en `.ca-unified-nav` (<640px), `aria-expanded`, Escape cierra
- **Enlace canónico**: `privado-login.html` (no `login.html`) en shell y footer
- **`js/nav.js`**: cargado en `privado-login.html` y `terraza-gateway.html` (páginas sin shell)
- **`landing.html`**: CTA Acceder → `privado-login.html`

### Contraste
- **`--dim`**: `#767676` → `#8a8a8a` en `shared.css` (≥4.5:1 sobre `#0c0c0c`)

### Grafo (`contra-archivo-v2.html`)
- Toolbar en columna en móvil
- Touch targets ≥44px en filtros y utilidades
- `socialField.js` cargado (HUD entropía)

### Panel privado
- Sidebar drawer: `pointer-events: none` cerrado, `aria-expanded` en hamburger

## Smoke test móvil (375×812)

```
□ shared-shell: toggle abre/cierra links
□ privado-login: nav.js hamburger en header local
□ privado.html: ☰ abre sidebar, overlay cierra
□ #explorar: filtros scrollean sin overflow horizontal
□ terraza/: gateway legible, CTAs ≥44px
□ 404: links apilados en <480px
```

## Archivos clave

| Archivo | Rol |
|---|---|
| `shared-shell.js` | Nav unificada + mobile menu |
| `web/js/nav.js` | Hamburger para `.site-header` legacy |
| `web/styles/shared.css` | Tokens + responsive nav |
| `SECURITY.md` | OPSEC rutas privadas |

## Debug conocido

- Páginas **con** `shared-shell.js` ocultan `.site-header` legacy — no cargar `nav.js` ahí (duplicaría controles)
- Terraza Next.js (`web/terraza/`) es app separada; en Pages solo gateway estático