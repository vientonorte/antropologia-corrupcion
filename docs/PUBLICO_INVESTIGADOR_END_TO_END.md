# Público / Investigador — Política End-to-End

## Propósito

Este documento define la separación entre la **capa pública / freemium** del proyecto `Contra-Archivo` y la **capa reservada para investigador**. Su objetivo es evitar que el sitio público mezcle obra, archivo curado y taller de producción.

**Principio rector:**

> Se publica la pieza ya producida como lectura. Se reserva la pieza que sirve para producir esa lectura.

---

## 1. Capas del sistema

### 1.1 Capa pública / freemium

Corresponde a la experiencia abierta del proyecto. Incluye:

- inicio público
- instrumento
- búsqueda pública
- archivo curado
- fichas ya publicables
- dossier documental ya editado
- biblioteca pública seleccionada

**Objetivo:** ofrecer una experiencia legible, navegable y sustantiva sin exponer el taller completo.

### 1.2 Capa investigador / reservada

Corresponde al entorno de trabajo del investigador. Incluye:

- `privado.html`
- acceso privado y administración
- producción de fichas
- borradores y memos
- protocolos internos
- prompts
- documentación operativa
- backlog y diseño metodológico

**Objetivo:** sostener el trabajo analítico, editorial y técnico sin mezclarlo con la publicación abierta.

### 1.3 Capa sensible

Material que no debe circular en la experiencia pública ni confundirse con archivo abierto:

- trazas de producción sensibles
- material no depurado
- estructuras que comprometan protocolo o seguridad
- trabajo que aún no distingue con claridad entre hecho documentado, hipótesis e inferencia

---

## 2. Tipología documental

### Ficha
Pieza analítica con objeto claro. Puede ser:

- conceptual
- de sistema
- de caso

Una ficha pasa a público solo si ya es legible como obra.

### Dossier / archivo de citas
Conjunto documental organizado para consulta y apoyo analítico. No equivale automáticamente a una ficha.

**Ejemplo:** `Estado del Arte/Citas Attac/README.md`

### Biblioteca
Materiales de lectura, consulta o referencia ya curados para acceso abierto.

### Protocolo interno
Documento de trabajo metodológico, operativo o técnico. No debe entrar a la navegación pública.

---

## 3. Regla editorial de publicación

Un material puede entrar a la capa pública si cumple estas condiciones:

- tiene objeto claro
- tiene función editorial pública
- no depende de contexto interno para ser comprendido
- no expone innecesariamente el proceso de producción
- no compromete protocolo ni sensibilidad del trabajo
- su estado no es meramente borrador operativo

---

## 4. Regla para fichas

### Público
- ficha producida
- ficha revisada
- ficha declarada publicable

### Investigador
- ficha por producir
- ficha en memo
- ficha en borrador
- ficha en revisión metodológica
- plantilla de ficha

---

## 5. Regla para capturas del marco teórico

Toda captura de pantalla del marco teórico debe analizarse con:

## **lectura cromática clave B**

Esto implica registrar al menos:

- organización visual
- dominante cromática
- jerarquía perceptual
- función argumental del color
- relación entre color, autoridad y afecto documental
- vínculo con marcador semántico o fricción

---

## 6. Arquitectura de experiencia

### Público
- `landing.html`
- `index.html`
- `buscador.html`
- archivo curado
- materiales ya publicados

### Investigador
- `login.html`
- `privado.html`
- `admin.html`
- `terraza/`
- documentación operativa
- producción analítica

---

## 7. Navegación recomendada

### Navegación pública
- Inicio
- Instrumento
- Archivo
- Acceso privado

### Navegación investigadora
- Inicio privado / panel
- simulación
- chat / síntesis
- noticias / cruces
- tesis / documentos
- huella digital
- administración y producción

---

## 8. Implementación editorial

### En Archivo público mostrar solo:
- fichas publicadas
- dossier de citas público
- biblioteca curada

### No enlazar públicamente:
- plantillas
- handoff
- prompts
- skills
- backlog
- documentación interna del sistema
- fichas en estado borrador

---

## 9. Caso ATTAC

`Estado del Arte/Citas Attac/README.md` debe entenderse como **dossier documental / archivo de citas**, no como ficha analítica en su estado actual.

Si ATTAC produce una tesis propia, esa tesis debe transformarse en una ficha separada.

---

## 10. Resultado esperado

Un visitante ve:

- una obra legible
- un archivo curado
- un instrumento navegable

Un investigador ve además:

- el taller
- la producción
- la continuidad del trabajo
- la infraestructura privada del proyecto
