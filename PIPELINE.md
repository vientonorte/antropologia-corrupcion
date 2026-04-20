# Pipeline CI/CD — Contra-Archivo

> Arquitectura de 3 agentes para mantener la calidad, seguridad y sincronización del repositorio.

---

## Arquitectura de agentes

```
┌─────────────────────────────────────────────────────────────┐
│                    PIPELINE CI/CD                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  VS Code +   │  │ Claude Code  │  │ GitHub Copilot   │  │
│  │  Copilot     │  │    (QA)      │  │ Agent (Lead)     │  │
│  │              │  │              │  │                  │  │
│  │ Desarrollo   │  │ Revisión de  │  │ Aprobación de    │  │
│  │ local +      │  │ código +     │  │ deploy +         │  │
│  │ sincroniza-  │  │ testing +    │  │ merge a main +   │  │
│  │ ción + docs  │  │ auditoría    │  │ CI/CD pipeline   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│    PR a main ───→ QA Pipeline ───→ Deploy a GitHub Pages   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. VS Code + Copilot — Mantenimiento local

**Rol:** Desarrollo, documentación y sincronización repositorio local ↔ nube.

### Buenas prácticas

```bash
# Siempre trabajar desde main
git checkout main
git pull origin main

# Crear rama de feature (si necesario)
git checkout -b feat/nombre-descriptivo

# Commits con formato estándar
git commit -m "feat(scope): descripción en español"

# Push y crear PR
git push origin feat/nombre-descriptivo
```

### Sincronización local ↔ nube

| Acción | Comando |
|--------|---------|
| Actualizar local | `git pull origin main` |
| Ver estado | `git status` |
| Ver ramas remotas | `git branch -r` |
| Limpiar ramas locales merged | `git branch --merged main` &#124; `grep -v main` &#124; `xargs git branch -d` |
| Verificar antes de push | `node tests/runner.js` |

### Convenciones de documentación

- **Commits:** `tipo(scope): descripción en español`
- **Tipos válidos:** `feat`, `fix`, `docs`, `data`, `ux`, `refactor`, `ci`, `chore`
- **README.md:** Actualizar si cambian casos o funcionalidades
- **CHANGELOG.md:** Registrar cambios significativos
- **DEPRECATIONS.md:** Registrar eliminaciones de código o ramas

---

## 2. Claude Code — QA

**Rol:** Revisión de código, testing automatizado, auditoría de calidad.

### Checks automáticos en PRs

| Gate | Workflow | Obligatorio |
|------|----------|-------------|
| 🧪 Tests unitarios | `qa.yml` → `tests` | ✅ Sí |
| 📐 Validación HTML | `qa.yml` → `html-lint` | ✅ Sí |
| 🔦 Lighthouse CI | `qa.yml` → `lighthouse` | ⚠️ Warning |
| 📊 Integridad datos | `qa.yml` → `data-integrity` | ✅ Sí |

### Qué revisa Claude Code

1. **Código:** Selectores CSS genéricos, cache-bust sincronizado, nav con clases
2. **Datos:** Schema JSON válido, referencias cruzadas entre casos/fuentes/BCN
3. **Fricción:** Marcadores con pares a/b, pesos 0.60-0.95, tipos válidos
4. **Seguridad:** No secrets, no binarios pesados, no dependencias externas
5. **Arquitectura:** ES5+ compatible, sin ESM, sin frameworks

### Ejecutar QA localmente

```bash
# Suite completa (283+ tests)
node tests/runner.js

# Validar datos JSON
node -e "
  const c = require('./data/casos.json');
  const f = require('./data/fuentes-oficiales.json');
  console.log('Casos:', c.casos.length, '| Fuentes:', f.length);
"
```

---

## 3. GitHub Copilot Agent — Lead técnico

**Rol:** Aprobación de deploys, CI/CD, protección de `main`.

### Workflows activos

| Archivo | Trigger | Función |
|---------|---------|---------|
| `qa.yml` | PR → main | Pipeline QA completo (4 gates) |
| `deploy.yml` | Push main | Tests → Deploy a GitHub Pages |
| `branch-cleanup.yml` | PR merged / manual | Auto-eliminar ramas merged |
| `copilot-setup-steps.yml` | Cambios en sí mismo | Setup del agente Copilot |

### Flujo de deploy

```
Desarrollador (VS Code)
    │
    ├─ git push origin feature-branch
    │
    ▼
Pull Request → main
    │
    ├─ qa.yml se ejecuta automáticamente
    │   ├─ 🧪 Tests unitarios
    │   ├─ 📐 Validación HTML
    │   ├─ 🔦 Lighthouse CI
    │   ├─ 📊 Integridad de datos
    │   └─ ✅ QA Gate (consolidado)
    │
    ├─ Copilot Agent revisa + aprueba
    │
    ▼
Merge a main
    │
    ├─ deploy.yml se ejecuta
    │   ├─ Tests pasan ✓
    │   └─ Deploy a GitHub Pages ✓
    │
    ├─ branch-cleanup.yml elimina la rama
    │
    ▼
Sitio actualizado en producción
```

### Branch protection recomendada para `main`

Configurar en **Settings → Branches → Branch protection rules**:

- [x] Require a pull request before merging
- [x] Require status checks to pass: `qa-gate`
- [x] Require branches to be up to date before merging
- [x] Automatically delete head branches ← **activar**
- [x] Do not allow bypassing the above settings

---

## 4. Política de ramas

### Regla principal

> **Solo `main` es permanente. Toda rama de feature se elimina después del merge.**

### Nomenclatura de ramas

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feat/` | Nueva funcionalidad | `feat/campo-social-v2` |
| `fix/` | Corrección de bugs | `fix/grafo-zoom-mobile` |
| `data/` | Cambios en datos | `data/agregar-fuente-cmf` |
| `docs/` | Documentación | `docs/actualizar-readme` |
| `ci/` | Cambios en pipeline | `ci/agregar-lighthouse` |

### Limpieza

- **Automática:** `branch-cleanup.yml` elimina ramas después de merge
- **Manual:** Ejecutar `branch-cleanup.yml` con `workflow_dispatch` para auditar
- **Local:** `git branch --merged main | grep -v main | xargs git branch -d`

---

## 5. Estado actual

**Fecha:** 2026-04-20

| Métrica | Valor |
|---------|-------|
| Ramas activas | 1 (`main`) |
| Ramas a eliminar | 20 (todas merged) |
| Workflows | 4 (`qa.yml`, `deploy.yml`, `branch-cleanup.yml`, `copilot-setup-steps.yml`) |
| Tests | 283+ |
| Deploy | GitHub Pages (automático en push a main) |

---

*Última actualización: 2026-04-20*
