# Política de Seguridad

> Este documento es la **fuente de verdad** para seguridad, privacidad y reporte responsable.

## Versiones soportadas

La rama soportada es `main`. La versión desplegada en GitHub Pages se genera desde ese estado.

| Versión | Soportada |
|---|---|
| `main` | ✅ |
| otras | ❌ |

## Reportar una vulnerabilidad

No abras un issue público para vulnerabilidades de seguridad.

Envía un correo a **seguridad@vientonorte.cl** con:

- descripción del problema
- pasos para reproducirlo
- impacto potencial
- archivos o rutas afectadas
- mitigación sugerida, si la tienes

**Compromiso de respuesta inicial:** 72 horas.

## Alcance por contexto

### 1. Sitio estático en la raíz

Dentro del alcance:

- XSS en páginas HTML o módulos JS
- exposición de datos sensibles no anonimizados
- errores de sanitización o inyección HTML/JS
- publicación accidental de secretos o credenciales
- problemas en exportación o exposición de datos oficiales

### 2. `terraza/`

Dentro del alcance:

- autenticación, sesión y passkeys
- autorización indebida sobre recursos privados
- exposición de secretos o configuración sensible
- vulnerabilidades en dependencias y rutas API
- errores en persistencia local o sync que expongan datos privados

La superficie privada de `terraza/` se describe operativamente en [`CLAUDE.md`](CLAUDE.md).

## Fuera del alcance

- problemas de UX sin implicancias de seguridad
- diferencias de renderizado sin impacto de seguridad
- ataques de ingeniería social fuera del repo
- ataques físicos a infraestructura de terceros
- DDoS contra GitHub Pages

## Datos y privacidad

### Datos permitidos en este repositorio

- registros públicos oficiales chilenos
- casos etnográficos anonimizados
- materiales documentales sin información personal identificable

### Datos que nunca deben estar aquí

- nombres reales de participantes etnográficos
- RUT, direcciones, teléfonos o correos personales
- tokens, contraseñas, claves privadas o `.env` reales
- documentos internos no públicos
- imágenes o grabaciones sin consentimiento explícito publicado

## Qué hacer si encuentras datos sensibles

1. no los redistribuyas
2. repórtalos de inmediato a **seguridad@vientonorte.cl**
3. indica archivo, línea, commit o workflow si aplica
4. evita abrir un issue público con el contenido expuesto

## Buenas prácticas para colaboradores

- revisa tus cambios antes de hacer commit
- no subas secretos ni archivos locales sensibles
- valida que las fuentes añadidas sean públicas y verificables
- si cambias seguridad, actualiza este documento antes que cualquier resumen auxiliar
- si cambias `terraza/`, revisa también [`CLAUDE.md`](CLAUDE.md)

## Historial resumido

- **2026-05-04**: auditoría integral previa a la apertura pública del repositorio
- **2026-05-05**: hardening adicional en CSP, `robots.txt`, `sitemap.xml`, CodeQL, Dependabot y seguridad de `terraza/`

## Referencias relacionadas

- colaboración y límites éticos → [`CONTRIBUTING.md`](CONTRIBUTING.md)
- CI/CD y workflows de seguridad → [`PIPELINE.md`](PIPELINE.md)
- snapshot histórico de hardening → [`BEST_PRACTICES.md`](BEST_PRACTICES.md)
