# Sistema documental del repositorio

> Mapa editorial y triage completo de los archivos Markdown del repositorio.

## Regla madre

Cada tema tiene **un documento canónico**. Los demás `.md` existen como apoyo, operación interna o archivo histórico.

## Fuentes de verdad por tema

| Tema | Documento |
|---|---|
| Visión pública | [`../README.md`](../README.md) |
| Estado operativo | [`../HANDOFF.md`](../HANDOFF.md) |
| Contribución | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Seguridad | [`../SECURITY.md`](../SECURITY.md) |
| CI/CD | [`../PIPELINE.md`](../PIPELINE.md) |
| Contexto privado `terraza/` | [`../CLAUDE.md`](../CLAUDE.md) |

## Triage completo por grupo

### 1. Canónicos del sitio público

| Ruta | Rol |
|---|---|
| `README.md` | visión pública y alcance del sitio estático |
| `HANDOFF.md` | estado operativo, prioridades y runbook |
| `CONTRIBUTING.md` | reglas de colaboración |
| `SECURITY.md` | reporte responsable y privacidad |
| `PIPELINE.md` | workflows, validaciones y branch policy |

### 2. Operativos internos

| Ruta | Rol |
|---|---|
| `CLAUDE.md` | documento canónico de `terraza/` |
| `CODE_OF_CONDUCT.md` | reglas de convivencia y marco de conducta |
| `CHANGELOG.md` | registro histórico de cambios significativos |
| `DEPRECATIONS.md` | decisiones de deprecación y limpieza |
| `.github/copilot-instructions.md` | instrucciones técnicas para agentes y contribuciones asistidas |
| `.github/pull_request_template.md` | estructura estándar de PR |
| `.github/ISSUE_TEMPLATE/bug_report.md` | intake de bugs |
| `.github/ISSUE_TEMPLATE/feature_request.md` | intake de mejoras |
| `.github/ISSUE_TEMPLATE/data_addition.md` | intake de nuevas fuentes oficiales |
| `.github/ISSUE_TEMPLATE/security_issue.md` | intake de reportes de seguridad de baja severidad |

### 3. Históricos / de sprint

| Ruta | Rol |
|---|---|
| `DESIGN_SPRINT.md` | archivo resumido del sprint de diseño |
| `BEST_PRACTICES.md` | snapshot histórico del hardening al abrir el repo |
| `docs/INTEGRACION_FUENTES.md` | integración histórica de datasets y cruces |
| `docs/PLAN_MEJORAS_RAMAS.md` | plan histórico sobre ramas y cleanup |
| `docs/NARRATIVA_GODEL_FRICCION.md` | apoyo teórico-narrativo |
| `Estado del Arte/README.md` | índice de materiales de investigación |
| `Estado del Arte/Citas Attac/README.md` | material de investigación |
| `Estado del Arte/Ensayo Traducción de Saberes/README.md` | material de investigación |
| `Estado del Arte/Etnografía Audiovisual/README.md` | material de investigación |
| `Estado del Arte/La Negra/README.md` | material de investigación |
| `Estado del Arte/Poemarios/README.md` | material de investigación |
| `Estado del Arte/Proyectos/dihe-extension/README_Version5.md` | material de investigación |

### 4. Prompts / documentos de apoyo

| Ruta | Rol |
|---|---|
| `docs/DESIGN_SPRINT_PROMPT.md` | prompt de apoyo para iteraciones históricas de sprint |

## Depuraciones aplicadas

- `CODEX_PROMPT_BUILD.md` fue eliminado por no contener instrucciones sustantivas ni funcionar como fuente de verdad.
- `DESIGN_SPRINT.md` fue reducido a archivo histórico resumido.
- `BEST_PRACTICES.md` quedó explicitado como snapshot histórico, no como norma vigente.

## Política de mantenimiento

### Si cambia el producto

1. actualiza primero el documento canónico correspondiente
2. después revisa si algún documento auxiliar quedó obsoleto
3. si un `.md` ya no orienta decisiones, archívalo o elimínalo

### Qué no debe volver a ocurrir

- mezclar la arquitectura pública de la raíz con la arquitectura privada de `terraza/`
- usar documentos históricos como si fueran especificaciones vigentes
- duplicar la misma regla en múltiples `.md` sin señalar cuál manda

### Criterio editorial

- **canónico**: define reglas vigentes
- **operativo interno**: soporta trabajo, revisión o coordinación
- **histórico**: conserva memoria del proceso
- **apoyo**: sirve como prompt, insumo o referencia secundaria
