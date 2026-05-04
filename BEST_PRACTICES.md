# Mejores Prácticas Implementadas — Repositorio Público

Este documento detalla las mejores prácticas de seguridad, privacidad y gobernanza implementadas al hacer público el repositorio de investigación doctoral **Contra-Archivo: Antropología y Corrupción**.

## Fecha de Implementación

**2026-05-04** — Repositorio hecho público con auditoría completa de seguridad.

---

## 1. Seguridad y Privacidad

### ✅ Auditoría de Datos Sensibles

**Realizado:**
- [x] Revisión completa del repositorio buscando secretos (`.env`, `.pem`, `.key`, API keys, tokens)
- [x] Verificación del historial de Git (no se encontraron secretos en commits históricos)
- [x] Validación de que todos los datos en `data/*.json` provienen de fuentes públicas oficiales
- [x] Confirmación de que los casos etnográficos están anonimizados

**Resultado:** ✓ Ningún dato sensible expuesto. Todos los datos son de fuentes públicas oficiales verificables.

### ✅ .gitignore Reforzado

Añadidos patrones de seguridad:
```gitignore
# === SEGURIDAD (nunca commitear) ===
.env
.env.local
.env.*.local
*.pem
*.key
*.p12
*.pfx
secrets/
credentials/
*.secret
.npmrc
.yarnrc
```

### ✅ Política de Seguridad (SECURITY.md)

Documento completo que incluye:
- Proceso de reporte responsable de vulnerabilidades
- Correo dedicado: `seguridad@vientonorte.cl`
- Alcance claro de qué es aceptable reportar
- Guías sobre datos sensibles que NUNCA deben estar en el repo
- Historial de seguridad (documentación de incidentes)

**Compromiso:** Respuesta en máximo 72 horas a reportes de seguridad.

---

## 2. Gobernanza y Contribución

### ✅ Código de Conducta (CODE_OF_CONDUCT.md)

Basado en Contributor Covenant 2.0, adaptado para investigación académica sensible:
- Protección de participantes de investigación etnográfica
- Responsabilidad con datos de fuentes públicas oficiales
- Respeto por soberanía territorial (casos con comunidades indígenas)
- Proceso de reporte y consecuencias claras
- Correo dedicado: `conducta@vientonorte.cl`

### ✅ Guía de Contribución (CONTRIBUTING.md)

Documento de 10,000+ caracteres que cubre:
- Cómo reportar bugs
- Cómo sugerir mejoras
- Proceso específico para añadir datos (solo fuentes públicas oficiales)
- Guías de estilo para JavaScript, CSS, HTML
- Formato de commits (`tipo(scope): descripción`)
- Checklist de seguridad y ética obligatoria
- Consideraciones éticas específicas del proyecto

**Fuentes oficiales aceptadas:** InfoLobby, CMF, Transparencia, SEIA, LeyChile, BCN, ComprasPublicas, SII

**Fuentes NO aceptadas:** Leaks, filtraciones, documentos confidenciales, testimonios sin anonimizar

---

## 3. Licencia y Citación Académica

### ✅ Licencia CC BY-NC-SA 4.0 (LICENSE)

Elegida porque:
- **Permite uso académico**: Investigadores pueden usar y adaptar el instrumento
- **Protege contra uso comercial**: Previene explotación comercial de la investigación
- **Requiere atribución**: Asegura crédito apropiado al trabajo doctoral
- **Compartir igual**: Derivados deben mantener la misma licencia abierta

### ✅ Archivo de Citación (CITATION.cff)

Formato estándar Citation File Format para:
- Citación automática por GitHub
- Herramientas de gestión bibliográfica (Zotero, Mendeley)
- Incluye referencias teóricas clave (Salazar, Harvey, Dussel, Quijano)
- Metadata completa (institución, departamento, año)

---

## 4. Templates de Issues y PRs

### ✅ Templates de Issues

Creados 4 templates especializados:

1. **Bug Report** (`bug_report.md`)
   - Pasos para reproducir
   - Información de entorno (navegador, OS, dispositivo)
   - Screenshots
   - Checklist de validación

2. **Feature Request** (`feature_request.md`)
   - Problema que resuelve
   - Impacto en la investigación
   - Mockups/ejemplos
   - Checklist de consistencia teórica

3. **Añadir Datos** (`data_addition.md`)
   - Tipo de fuente oficial
   - Caso relacionado
   - Descripción de mistranslation (capa oficial)
   - Checklist de seguridad (no datos personales, fuente verificable)

4. **Reporte de Seguridad** (`security_issue.md`)
   - Advertencia sobre vulnerabilidades de alta severidad (reportar a email)
   - Categorías de issues de seguridad
   - Referencia a SECURITY.md

### ✅ Template de Pull Request

Ya existente y robusto (mantenido):
- Tipo de cambio con checkboxes
- Casos afectados
- Tests ejecutados
- Checklist de calidad
- Notas para el revisor

---

## 5. Documentación Mejorada

### ✅ README.md Actualizado

Añadido:
- **Badges**: License, GitHub Pages, Tests, Lighthouse
- **Sección de Contribución**: Link a CONTRIBUTING.md con advertencias importantes
- **Seguridad y Privacidad**: Advertencia sobre datos anonimizados y fuentes públicas
- **Citación Académica**: Formatos BibTeX y APA listos para copiar
- **Licencia expandida**: Explicación de CC BY-NC-SA 4.0 con íconos

### ✅ Badges de Estado

```markdown
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](...)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](...)
[![Tests](https://github.com/.../actions/workflows/qa.yml/badge.svg)](...)
[![Lighthouse](https://img.shields.io/badge/lighthouse-passing-brightgreen)](...)
```

---

## 6. Validación Técnica

### ✅ Tests Ejecutados

Todos los tests del proyecto pasaron exitosamente:
```
✓ 289 tests passed (100%)
- frictionEngine: 47 tests
- searchEngine: 24 tests  
- dataValidation: 70 tests
- graph (ForceSimulation): 22 tests
- ciperFeed: 19 tests
- seguimientos: 43 tests
- passkey: 12 tests
- htmlLint: 52 tests
```

**Cobertura de validación:**
- Integridad referencial de datos
- Schema de JSON files
- Seguridad (XSS, sanitización)
- Accesibilidad (HTML semántico, aria-labels)
- Cache-busting en recursos
- Selectors CSS sin conflictos

---

## 7. Recomendaciones Adicionales (Opcionales)

### Consideraciones Futuras

#### GitHub Security Features

- [ ] **Dependabot**: Ya está habilitado por defecto en repos públicos
  - Monitorea `/terraza/package.json` automáticamente
  - Crea PRs automáticos para vulnerabilidades conocidas

- [ ] **Code Scanning (CodeQL)**: Considerar activar para análisis estático
  - Detecta vulnerabilidades automáticamente
  - Requiere configuración en `.github/workflows/codeql.yml`
  - Gratuito para repositorios públicos

#### Branch Protection

Configurar protecciones en la rama `main`:
- [ ] Requerir review de PR antes de merge
- [ ] Requerir que status checks pasen (qa-gate ya está configurado)
- [ ] Requerir branches actualizados antes de merge
- [ ] Restringir quién puede hacer push directo

#### Documentación Complementaria

- [ ] **GOVERNANCE.md**: Si el proyecto crece, documentar toma de decisiones
- [ ] **SUPPORT.md**: Canales de soporte y preguntas frecuentes
- [ ] **AUTHORS.md**: Créditos detallados a colaboradores
- [ ] **CHANGELOG.md**: Ya existe y está actualizado ✓

---

## 8. Checklist de Mantenimiento Continuo

### Mensual

- [ ] Revisar issues abiertos y responder preguntas
- [ ] Revisar PRs pendientes
- [ ] Actualizar CHANGELOG.md con cambios significativos
- [ ] Verificar que tests siguen pasando

### Trimestral

- [ ] Auditar datos nuevos añadidos (verificar fuentes públicas)
- [ ] Revisar dependencias de `/terraza` (npm audit)
- [ ] Actualizar documentación si hubo cambios significativos
- [ ] Verificar que badges en README funcionan

### Anual

- [ ] Auditoría completa de seguridad y privacidad
- [ ] Revisar y actualizar CODE_OF_CONDUCT.md si es necesario
- [ ] Actualizar CITATION.cff con nueva información (publicaciones, presentaciones)
- [ ] Revisar y renovar certificados/credenciales si aplica

---

## 9. Puntos de Contacto

Para mantener buena gobernanza del proyecto público:

| Tipo de Consulta | Email | Propósito |
|------------------|-------|-----------|
| Seguridad | seguridad@vientonorte.cl | Reportar vulnerabilidades |
| Conducta | conducta@vientonorte.cl | Violaciones al código de conducta |
| Contribuciones | contribuciones@vientonorte.cl | Preguntas sobre cómo contribuir |
| General | [@vientonorte](https://github.com/vientonorte) | Issues públicos en GitHub |

**Nota**: Estos emails deben ser configurados y monitoreados regularmente.

---

## 10. Principios Éticos del Proyecto

Documentados explícitamente para colaboradores:

### Protección de Participantes
- Anonimización obligatoria de testimonios
- No exponer información identificable
- Respeto a consentimiento informado

### Soberanía de Conocimiento
- Respeto por conocimientos territoriales indígenas
- Perspectiva decolonial en análisis (Dussel, Quijano, Mignolo)
- No extractivismo de conocimiento

### Criticidad Fundamentada
- Crítica institucional basada en evidencia
- Marco teórico académico riguroso (Harvey, Salazar, Gramsci)
- Distinguir análisis crítico de difamación

### Transparencia Metodológica
- Todas las fuentes deben ser públicas y verificables
- Documentación clara de métodos de análisis
- Trazabilidad de datos (URLs, fechas, instituciones)

---

## Resumen Ejecutivo

### ✅ Lo que se implementó hoy (2026-05-04)

1. **Licencia**: CC BY-NC-SA 4.0 — protege uso académico, previene comercial
2. **Seguridad**: SECURITY.md — proceso de reporte responsable
3. **Conducta**: CODE_OF_CONDUCT.md — adaptado para investigación sensible
4. **Contribución**: CONTRIBUTING.md — guías éticas y técnicas completas
5. **Citación**: CITATION.cff — formato estándar para herramientas académicas
6. **Issues**: 4 templates especializados (bug, feature, data, security)
7. **.gitignore**: Reforzado con patrones de seguridad
8. **README**: Badges, citación, sección de contribución y seguridad
9. **Validación**: 289 tests pasados, ningún secreto en historial

### ✓ Estado de Seguridad

- **Secretos en código**: ✓ Ninguno encontrado
- **Secretos en historial**: ✓ Ninguno encontrado  
- **Datos sensibles**: ✓ Todos anonimizados
- **Fuentes de datos**: ✓ 100% públicas oficiales verificables
- **Tests de seguridad**: ✓ XSS sanitization implementado

### 📊 Métricas del Repositorio

- **Archivos de gobernancia**: 9 (LICENSE, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING, CITATION, 4 templates)
- **Tests**: 289 (100% pasando)
- **Cobertura de datos**: 8 fuentes oficiales, 5 casos, 19+ registros
- **Commits auditados**: Todo el historial (sin secretos)

---

**Repositorio listo para colaboración pública con estándares de seguridad y ética doctoral.**

---

*Documento generado el 2026-05-04 como parte de la auditoría de mejores prácticas.*  
*Colectivo Viento Norte · [@vientonorte](https://github.com/vientonorte)*
