# Política de Seguridad

## Versiones Soportadas

Este proyecto es una investigación doctoral activa. La versión actual desplegada en GitHub Pages es la única versión soportada.

| Versión | Soportada          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| Otras   | :x:                |

## Reportar una Vulnerabilidad

### Vulnerabilidades de Seguridad

Si descubres una vulnerabilidad de seguridad en este repositorio, por favor **NO** la reportes públicamente a través de un issue. En su lugar:

1. Envía un correo a: **seguridad@vientonorte.cl** con:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

2. Te responderemos en un plazo máximo de **72 horas** para confirmar la recepción.

3. Trabajaremos en una solución y te mantendremos informado del progreso.

4. Una vez solucionada, publicaremos un aviso de seguridad y te acreditaremos (si lo deseas).

### Alcance de la Política de Seguridad

#### Dentro del alcance:

- Exposición de datos sensibles no anonimizados
- Vulnerabilidades XSS en la aplicación web
- Problemas de inyección (SQL, HTML, JS)
- Exposición de secretos (API keys, tokens) en código o historial
- Problemas de autenticación/autorización (módulo passkey en `/terraza`)
- Vulnerabilidades en dependencias (terraza/package.json)

#### Fuera del alcance:

- Issues de usabilidad o UX que no afecten la seguridad
- Bugs en navegadores específicos sin implicaciones de seguridad
- Ataques de ingeniería social
- Ataques físicos a infraestructura
- Ataques DDoS contra GitHub Pages

### Datos Sensibles y Privacidad

#### Datos públicos en este repositorio:

- **Fuentes oficiales**: Todos los datos en `/data/*.json` provienen exclusivamente de registros públicos oficiales chilenos (InfoLobby, Transparencia, CMF, SEIA, LeyChile, BCN, ComprasPublicas, SII)
- **Anonimización**: Los casos etnográficos no contienen nombres reales de participantes
- **Agregación**: Los testimonios están agregados temáticamente, no identificables individualmente

#### Datos que NUNCA deben estar en este repositorio:

- Nombres reales de participantes de investigación etnográfica
- Datos personales identificables (RUT, direcciones, teléfonos)
- Credenciales o secretos (API keys, passwords, tokens)
- Documentos internos de instituciones no públicos
- Grabaciones de audio o video sin consentimiento publicado
- Imágenes de personas sin consentimiento informado

#### Si encuentras datos sensibles expuestos:

1. **NO** los copies ni los compartas
2. Repórtalo inmediatamente a **seguridad@vientonorte.cl**
3. Indica la ubicación exacta (archivo, línea, commit hash si aplica)
4. El equipo evaluará y tomará acción inmediata (eliminar del historial si es necesario)

### Buenas Prácticas para Colaboradores

Si planeas contribuir a este repositorio:

- **Nunca** hagas commit de archivos `.env` con valores reales
- **Nunca** incluyas datos personales de participantes reales
- **Verifica** que tus cambios no expongan información sensible
- **Usa** `.gitignore` correctamente para excluir archivos locales sensibles
- **Revisa** el historial de tus commits antes de hacer push
- **Consulta** con el equipo si tienes dudas sobre qué datos son públicos

### Historial de Seguridad

Esta sección documentará cualquier incidente de seguridad una vez resuelto:

- **2026-05-04**: Repositorio hecho público - Auditoría inicial de seguridad completada. No se encontraron secretos en el historial. Todos los datos son de fuentes públicas oficiales.

### Contacto

- **Seguridad**: seguridad@vientonorte.cl
- **General**: [@vientonorte](https://github.com/vientonorte)
- **Proyecto**: https://vientonorte.github.io/antropologia-corrupcion/
