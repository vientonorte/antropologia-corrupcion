# Guía de Contribución

Gracias por contribuir a **Contra-Archivo: Antropología y Corrupción**.

> Este documento es la **fuente de verdad** para el proceso de contribución. Si cambian las reglas de colaboración, se actualiza aquí primero.

## Documentos canónicos antes de contribuir

- visión pública del proyecto → [`README.md`](README.md)
- estado operativo y backlog → [`HANDOFF.md`](HANDOFF.md)
- seguridad y privacidad → [`SECURITY.md`](SECURITY.md)
- CI/CD y workflows → [`PIPELINE.md`](PIPELINE.md)
- contexto privado de `terraza/` → [`CLAUDE.md`](CLAUDE.md)
- mapa documental completo → [`docs/DOCUMENTATION_SYSTEM.md`](docs/DOCUMENTATION_SYSTEM.md)

## Cómo puedes contribuir

### 1. Reportar bugs

Usa el template correspondiente y describe:

- pasos exactos para reproducir
- comportamiento esperado vs. actual
- navegador/dispositivo si aplica
- evidencia visual cuando aporte contexto

### 2. Proponer mejoras

Antes de abrir un PR grande:

1. verifica que no exista un issue similar
2. explica qué problema resuelve
3. justifica por qué importa para el instrumento

### 3. Añadir datos

Este repositorio **solo acepta fuentes públicas oficiales chilenas verificables**.

#### Fuentes aceptadas

- InfoLobby
- Transparencia
- CMF
- SEIA
- LeyChile
- BCN
- ComprasPublicas
- SII

#### Fuentes rechazadas

- leaks o filtraciones
- documentos internos no públicos
- datos personales identificables
- testimonios no anonimizados
- cualquier registro sin fuente verificable

#### Proceso para datos

1. agrega el registro respetando el schema vigente
2. valida `friccion_con` contra `data/casos.json`
3. ejecuta `node tests/runner.js`
4. abre un PR o issue con contexto metodológico suficiente

## Antes de escribir código

### Identifica el contexto correcto

#### A. Sitio estático (`web/`)

- stack: **HTML5 + CSS3 + Vanilla JS**
- sin frameworks
- sin D3
- sin bundlers
- sin dependencias externas en el sitio estático
- **editar páginas y shell en `web/`** — la raíz del repo no debe acumular espejos HTML

#### B. `terraza/`

- stack independiente
- reglas e invariantes en [`CLAUDE.md`](CLAUDE.md)
- no documentar `terraza/` como si fuera parte del sitio estático público

## Flujo de trabajo

1. parte desde el estado actual de `main`
2. discute antes los cambios grandes
3. mantén commits atómicos
4. ejecuta la validación existente antes de abrir PR
5. actualiza la documentación canónica afectada antes que cualquier archivo auxiliar

### Política de ramas

- `main` es la rama permanente del repositorio.
- Si trabajas desde un fork, abre el PR desde tu fork.
- Si necesitas una rama temporal en el repo principal para un PR, que sea corta y se elimine tras el merge.

### Commits

Formato obligatorio:

```text
tipo(scope): descripción en español
```

Tipos válidos:

- `feat`
- `fix`
- `docs`
- `data`
- `ux`
- `refactor`
- `test`
- `ci`

## Validación mínima

```sh
cd /home/runner/work/antropologia-corrupcion/antropologia-corrupcion
node tests/runner.js
```

## Regla editorial

Cuando un cambio afecta documentación:

1. actualiza primero el documento canónico del tema
2. luego corrige archivos auxiliares o históricos si siguen siendo útiles
3. si un `.md` ya no guía decisiones, archívalo o elimínalo

## Checklist antes de abrir PR

- [ ] la validación existente pasa
- [ ] no se agregaron datos sensibles
- [ ] el cambio respeta el contexto correcto (raíz o `terraza/`)
- [ ] la documentación canónica afectada fue actualizada primero
- [ ] los commits siguen el formato acordado

## Consideraciones éticas

- nunca publicar nombres reales de participantes etnográficos
- nunca incluir RUT, direcciones, teléfonos o credenciales
- distinguir crítica institucional de afirmaciones no respaldadas
- respetar el marco decolonial y territorial del proyecto
- usar los datos para análisis crítico, no para sensacionalismo

## Seguridad y conducta

- problemas de seguridad → [`SECURITY.md`](SECURITY.md)
- convivencia y reporte de conducta → [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

## Recursos útiles

- [`README.md`](README.md)
- [`HANDOFF.md`](HANDOFF.md)
- [`PIPELINE.md`](PIPELINE.md)
- [`CLAUDE.md`](CLAUDE.md)
- [`docs/DOCUMENTATION_SYSTEM.md`](docs/DOCUMENTATION_SYSTEM.md)
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md)

---

Colectivo Viento Norte · [@vientonorte](https://github.com/vientonorte)
