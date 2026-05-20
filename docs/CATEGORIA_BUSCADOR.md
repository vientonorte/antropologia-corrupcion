# Sistema de Categorías Avanzadas de Búsqueda

> Documentación completa del sistema de categorización multi-dimensional  
> Contra-Archivo: Antropología y Corrupción — Tesis Doctoral  
> Última actualización: 2026-05-20

---

## 1. Visión General

El sistema de categorías avanzadas organiza los registros oficiales del contra-archivo en **5 puertas epistemológicas** (E, F, G, H, I), cada una enfocada en un régimen institucional específico. El objetivo es facilitar el análisis de **mistranslation** entre las capas ética, institucional y material.

### 1.1. Principios de Diseño

- **Precisión editorial**: Cada registro puede pertenecer a múltiples categorías simultáneamente
- **Retrocompatibilidad**: El sistema sigue funcionando si no se asignan categorías explícitas
- **Auditoría**: Todas las asignaciones son exportables a CSV con metadata completa
- **Accesibilidad**: Cumple WCAG 2.2 AA con navegación por teclado y aria-labels dinámicos

---

## 2. Definición de Categorías

### E — Entidades Públicas

**Descripción corta:**  
Registros de transparencia, SEIA y otras instituciones públicas con deber de publicación activa.

**Descripción extendida:**  
Capa institucional: lo que el Estado hace visible. Respuestas a solicitudes de transparencia, expedientes SEIA, resoluciones. El registro oficial como primera traducción de conflictos políticos a lenguaje administrativo.

**Fuentes primarias:**  
- `transparencia` — Portal de Transparencia / Consejo para la Transparencia
- `seia` — Servicio de Evaluación Ambiental

**Ejemplos de registros:**
- Solicitud de transparencia: detalle de inversiones AFP en territorios indígenas
- Expediente SEIA: consulta indígena para proyecto hidroeléctrico
- Resolución territorial: catastro de predios con títulos de merced

**Lógica de filtrado:**  
Registros con `fuente` = `transparencia` o `seia`, o que tengan `institucion` definida con `tipo_friccion`.

---

### F — Funcionarios y Actores

**Descripción corta:**  
Registros de lobby, audiencias con funcionarios y actores vinculados a la Comisión para el Mercado Financiero.

**Descripción extendida:**  
Trazabilidad de actores: quién habla con quién. Audiencias de lobby, reuniones con reguladores, actores corporativos. El registro oficial de influencia que documenta qué voces tienen acceso institucional.

**Fuentes primarias:**  
- `infolobby` — InfoLobby (Ley del Lobby)
- `cmf` — Comisión para el Mercado Financiero

**Ejemplos de registros:**
- Audiencia SURA Investments con CMF sobre regulación multifondos
- Lobby de empresas forestales con CONADI sobre títulos de merced
- Reunión SEA con empresas energéticas sobre proyectos en territorio indígena

**Lógica de filtrado:**  
Registros con `fuente` = `infolobby` o `cmf`, o que tengan `actores_lobby` definido.

---

### G — Gestión de Recursos

**Descripción corta:**  
Compras públicas, licitaciones y regulación financiera: trazabilidad de recursos estatales y mercados.

**Descripción extendida:**  
Flujos de capital: cómo se mueve el dinero público y regulado. Licitaciones, adquisiciones, marcos regulatorios financieros. El registro contable que traduce decisiones políticas a transacciones.

**Fuentes primarias:**  
- `compraspublicas` — Mercado Público / ChileCompra
- `cmf` — Comisión para el Mercado Financiero (marco regulatorio)

**Ejemplos de registros:**
- Licitación municipal de proveedores recurrentes
- Regulación CMF sobre inversiones alternativas en multifondos AFP
- Adquisición tecnológica de sistemas de gestión municipal

**Lógica de filtrado:**  
Registros con `fuente` = `compraspublicas` o `cmf`.

---

### H — Historial Normativo

**Descripción corta:**  
Boletines legislativos y leyes vigentes: historial normativo con trazabilidad parlamentaria.

**Descripción extendida:**  
Genealogía normativa: cómo se construye la ley. Boletines en tramitación, leyes vigentes, decretos. El archivo jurídico que registra negociaciones parlamentarias y produce el marco legal que después se aplica con fricción.

**Fuentes primarias:**  
- `bcn` — Biblioteca del Congreso Nacional (tramitación legislativa)
- `leychile` — LeyChile (normativa vigente)

**Ejemplos de registros:**
- Tramitación del Convenio OIT 169 (Ley 19.253)
- DS 66 sobre consulta indígena
- Boletín legislativo sobre regulación de multifondos AFP

**Lógica de filtrado:**  
Registros con `fuente` = `bcn` o `leychile`.

---

### I — Investigaciones

**Descripción corta:**  
Registros vinculados a los 4 campos etnográficos de la tesis: SURA, La Negra, periodismo de datos y OIT 169.

**Descripción extendida:**  
Punto de entrada analítico: registros oficiales que conectan directamente con los 4 casos etnográficos de la tesis doctoral. Evidencia documentada de mistranslation entre capas ética, institucional y material.

**Casos etnográficos vinculados:**  
- `sura-gobernanza-datos` — SURA Investments: Gobernanza de Datos y Separación AFP
- `la-negra-territorio-mapuche` — La Negra: Memoria, Territorio y Resistencia Mapuche-Huilliche
- `periodismo-datos-chile` — Periodismo de Datos y la Corrupción como Mistranslation
- `oit169-consulta-previa` — OIT 169: La Consulta Previa como Dispositivo de Neutralización

**Ejemplos de registros:**
- Audiencia SURA con CMF (vinculada a `sura-gobernanza-datos`)
- Solicitud de transparencia sobre territorios mapuche (vinculada a `la-negra-territorio-mapuche`)
- Expediente SEIA con consulta previa pendiente (vinculada a `oit169-consulta-previa`)

**Lógica de filtrado:**  
Registros donde `friccion_con` apunta a uno de los 4 casos etnográficos.

---

## 3. Esquema de Datos

### 3.1. Campo Opcional: `categoria_primaria`

Cada registro en `data/fuentes-oficiales.json` puede incluir un campo opcional `categoria_primaria`:

```json
{
  "id": "lobby-sura-cmf-2024",
  "fuente": "infolobby",
  "titulo": "Audiencias SURA Investments con CMF sobre regulación multifondos",
  "fecha": "2024-03-15",
  "categoria_primaria": ["F", "I"],
  "friccion_con": "sura-gobernanza-datos",
  ...
}
```

**Características:**
- **Tipo**: Array de strings
- **Valores válidos**: `["E", "F", "G", "H", "I"]`
- **Cardinalidad**: 0 a 5 (puede pertenecer a todas las categorías)
- **Comportamiento si ausente**: Se infiere automáticamente por fuente

**Validación en tests:**
```javascript
// tests/dataValidation.test.js
it('categoria_primaria values are valid if present', function () {
  for (var i = 0; i < fuentesData.length; i++) {
    var registro = fuentesData[i];
    if (registro.categoria_primaria) {
      assert(Array.isArray(registro.categoria_primaria), 
        'categoria_primaria should be array if present');
      for (var j = 0; j < registro.categoria_primaria.length; j++) {
        var cat = registro.categoria_primaria[j];
        assertArrayIncludes(['E', 'F', 'G', 'H', 'I'], cat,
          'categoria "' + cat + '" should be valid');
      }
    }
  }
});
```

### 3.2. Inferencia Automática de Categoría

Si `categoria_primaria` no está presente, el sistema infiere la categoría primaria usando las `filterFn` de cada categoría, en este orden de prioridad:

1. **I** — si vinculado a caso etnográfico
2. **F** — si tiene actores de lobby
3. **E** — si es de transparencia/SEIA
4. **G** — si es de compras públicas/CMF
5. **H** — si es de BCN/LeyChile

Implementación:

```javascript
function getRecordCategory(r) {
  if (CAT_META.I.filterFn && CAT_META.I.filterFn(r)) return 'I';
  if (CAT_META.F.filterFn && CAT_META.F.filterFn(r)) return 'F';
  if (CAT_META.E.filterFn && CAT_META.E.filterFn(r)) return 'E';
  if (CAT_META.G.filterFn && CAT_META.G.filterFn(r)) return 'G';
  if (CAT_META.H.filterFn && CAT_META.H.filterFn(r)) return 'H';
  return 'E'; // default
}
```

---

## 4. Interfaz de Usuario

### 4.1. Tabs de Categoría

Cada tab muestra:
- **Ícono** (emoji): identificador visual
- **Letra** (E/F/G/H/I): código de categoría
- **Nombre**: descripción corta
- **Contador**: número de registros en esa categoría

Ejemplo visual:
```
[🏛 E Entidades públicas 36]  [👤 F Funcionarios 18]  ...
```

**Estados:**
- `active`: categoría seleccionada (fondo resaltado, borde inferior)
- `inactive`: categoría no seleccionada (fondo opaco)

**Accesibilidad:**
- Cada tab tiene `role="tab"` y `aria-selected`
- `aria-label` dinámico con contador: `"Categoría E: Registros de transparencia... - 36 resultados"`
- Navegación por teclado: `ArrowLeft/Right` para cambiar entre tabs

### 4.2. Descripción de Categoría

Debajo de los tabs, un área con `aria-live="polite"` muestra la descripción de la categoría activa. Cambia automáticamente al seleccionar otro tab.

### 4.3. Badges en Resultados

Cada resultado muestra un badge con la categoría primaria inferida:

```
[E] Audiencias SURA Investments con CMF...  0.82  2024-03-15
```

**Estilos:**
- Badge circular con letra de categoría
- Color coherente con el tab activo
- Posición: antes del título del resultado

### 4.4. Contadores Dinámicos

Los contadores se actualizan:
- Al cargar los datos inicialmente
- Al cambiar filtros (año, fricción mínima, fuentes)
- NO cambian al cambiar de categoría (muestran el total global)

Implementación:

```javascript
function updateCategoryCounts() {
  var cats = ['E', 'F', 'G', 'H', 'I'];
  cats.forEach(function(cat) {
    var filterFn = CAT_META[cat].filterFn;
    var count = allRecords.filter(filterFn).length;
    var tab = $catTabs.querySelector('[data-cat="' + cat + '"]');
    var countEl = tab.querySelector('.cat-count');
    if (countEl) {
      countEl.textContent = count;
    }
  });
}
```

---

## 5. Exportación CSV

### 5.1. Botón de Exportación

Visible cuando hay resultados filtrados. Ubicación: junto al contador de resultados.

```
36 resultados en búsqueda avanzada  [📥 Exportar CSV]
```

### 5.2. Contenido del CSV

El CSV exportado incluye:

**Metadata (líneas comentadas con `#`):**
```
# Categoria: E
# Fecha exportacion: 2026-05-20T14:00:00.000Z
# Total registros: 36
```

**Columnas:**
- `id` — Identificador único del registro
- `titulo` — Título del registro
- `fecha` — Fecha YYYY-MM-DD
- `fuente` — Fuente de datos
- `institucion` — Institución responsable
- `friccion_score` — Score de fricción (0.000-1.000)
- `tipo_friccion` — Tipo (politica, semantica, tecnica)
- `friccion_con` — ID del caso vinculado
- `keywords` — Keywords separados por `;`
- `tags` — Tags separados por `;`

**Nombre de archivo:**
```
contra-archivo-cat-E-2026-05-20.csv
```

### 5.3. Uso desde JavaScript

```javascript
// Exportar resultados filtrados de categoría I
var filtered = allRecords.filter(CAT_META.I.filterFn);
window.categoryExport.exportCategoryResults('I', filtered);
```

---

## 6. Accesibilidad (WCAG 2.2 AA)

### 6.1. Navegación por Teclado

**Tabs de categoría:**
- `Tab` / `Shift+Tab`: moverse entre tabs y otros elementos
- `ArrowRight` / `ArrowDown`: siguiente categoría
- `ArrowLeft` / `ArrowUp`: categoría anterior
- `Enter` / `Space`: activar categoría

**Resultados:**
- `Tab` / `Shift+Tab`: moverse entre resultados
- `Enter` / `Space`: expandir/contraer dossier
- `Escape`: cerrar dossier expandido

### 6.2. Atributos ARIA

**Tabs:**
```html
<div class="cat-tabs" role="tablist" aria-label="Categorías de fuentes">
  <button class="cat-tab active" data-cat="E" role="tab" 
          aria-selected="true" 
          aria-label="Categoría E: Registros de transparencia... - 36 resultados">
    ...
  </button>
</div>
```

**Descripción:**
```html
<div class="cat-desc" id="catDesc" aria-live="polite">
  Registros de transparencia, SEIA y otras instituciones públicas...
</div>
```

**Badges:**
```html
<span class="cat-badge cat-E" aria-label="Categoría E">E</span>
```

### 6.3. Anuncios para Lectores de Pantalla

- Cambio de categoría: anunciado por `aria-live="polite"` en `#catDesc`
- Contador de resultados: anunciado por `aria-live="polite"` implícito en `.results-status`
- Expansión de dossier: anunciado por cambio de `aria-expanded`

---

## 7. Guía de Implementación

### 7.1. Añadir un Registro con Categorías

```json
{
  "id": "mi-nuevo-registro",
  "fuente": "transparencia",
  "titulo": "Solicitud: detalle de X",
  "fecha": "2026-05-20",
  "categoria_primaria": ["E", "I"],
  "friccion_con": "sura-gobernanza-datos",
  "tipo_friccion": "politica",
  "keywords": ["transparencia", "AFP", "inversión"],
  "tags": ["SURA", "CMF"],
  "capa_oficial": "El registro clasifica...",
  "institucion": "Superintendencia de Pensiones",
  "url": "https://..."
}
```

### 7.2. Añadir una Nueva Categoría (Fase 2+)

Si en el futuro se requiere añadir una categoría `J`:

1. **Actualizar `CAT_META` en `buscador.html`:**
   ```javascript
   J: {
     desc: 'Descripción corta',
     desc_extendida: 'Descripción extendida...',
     fuentes: ['nueva-fuente'],
     ejemplos: ['Ejemplo 1', 'Ejemplo 2'],
     filterFn: function(r) {
       return r.fuente === 'nueva-fuente';
     }
   }
   ```

2. **Añadir tab en HTML:**
   ```html
   <button class="cat-tab" data-cat="J" role="tab" aria-selected="false">
     <span class="cat-icon" aria-hidden="true">🔬</span>
     <span class="cat-letter" aria-hidden="true">J</span>
     Nueva Categoría
     <span class="cat-count" aria-label="número de resultados">—</span>
   </button>
   ```

3. **Añadir estilos CSS:**
   ```css
   .cat-tab[data-cat="J"].active {
     color: var(--color-nueva);
     border-bottom-color: var(--color-nueva);
   }
   .cat-badge.cat-J {
     background: rgba(R, G, B, .15);
     color: var(--color-nueva);
   }
   ```

4. **Actualizar validación en tests:**
   ```javascript
   var validCats = ['E', 'F', 'G', 'H', 'I', 'J'];
   ```

5. **Actualizar esta documentación.**

### 7.3. Debugging

**Ver categoría inferida de un registro:**
```javascript
var registro = allRecords[0];
var cat = getRecordCategory(registro);
console.log('Categoría:', cat);
```

**Ver contadores de todas las categorías:**
```javascript
['E', 'F', 'G', 'H', 'I'].forEach(function(cat) {
  var count = allRecords.filter(CAT_META[cat].filterFn).length;
  console.log(cat + ':', count);
});
```

**Verificar que un registro cumple el filtro:**
```javascript
var registro = allRecords[5];
console.log('Cumple I:', CAT_META.I.filterFn(registro));
```

---

## 8. Casos de Uso

### 8.1. Investigador busca todos los registros de lobby

1. Click en tab **F — Funcionarios y actores**
2. Ve contador: `18 resultados`
3. Revisa resultados con badge `[F]`
4. Click en `📥 Exportar CSV` → descarga `contra-archivo-cat-F-2026-05-20.csv`
5. Abre en Excel/LibreOffice para análisis cuantitativo

### 8.2. Analista quiere registros vinculados a SURA

1. Click en tab **I — Investigaciones**
2. Ve contador: `8 resultados`
3. Cada resultado muestra caso vinculado en el dossier
4. Puede filtrar adicionalmente por año o fricción mínima
5. Exporta para cruzar con otros datasets

### 8.3. Periodista busca expedientes ambientales

1. Click en tab **E — Entidades públicas**
2. Filtro adicional: fuente `seia` en sidebar
3. Ve resultados con badge `[E]`
4. Expande dossier para ver las 3 capas (ética, institucional, material)
5. Copia URL de fuente oficial para verificación

### 8.4. Estudiante navega con teclado

1. `Tab` hasta llegar a tabs de categoría
2. `ArrowRight` para moverse de E → F → G → H → I
3. `Enter` para activar categoría
4. Lector de pantalla anuncia: "Categoría F: Registros de lobby... - 18 resultados"
5. Descripción se actualiza automáticamente (aria-live)

---

## 9. Mantenimiento

### 9.1. Tests Automatizados

Ejecutar suite completa:
```bash
node tests/runner.js
```

Suite específica de categorías:
```bash
# Ver tests/dataValidation.test.js
# Sección "Categorías de búsqueda"
```

### 9.2. Checklist Pre-Deploy

- [ ] Todos los tests pasan (`node tests/runner.js`)
- [ ] Validación de categorías sin errores
- [ ] Contadores muestran valores correctos
- [ ] Navegación por teclado funciona
- [ ] Export CSV genera archivo válido
- [ ] Aria-labels actualizados con contadores
- [ ] Compatibilidad con lectores de pantalla verificada

### 9.3. Actualización de Contadores

Los contadores se actualizan automáticamente cuando:
- Se cargan los datos (`updateCategoryCounts()` en `loadData()`)
- Se modifican filtros laterales (año, fricción, fuentes)

NO es necesario actualizar manualmente.

---

## 10. Referencias

### 10.1. Archivos del Sistema

- `buscador.html` — UI principal con tabs y resultados
- `src/categoryExport.js` — Módulo de exportación CSV
- `tests/dataValidation.test.js` — Suite de validación de categorías
- `data/fuentes-oficiales.json` — Datos de registros
- `data/casos.json` — Casos etnográficos (para categoría I)

### 10.2. Funciones Clave

- `updateCategoryCounts()` — Actualiza contadores en tabs
- `getRecordCategory(r)` — Infiere categoría primaria
- `window.categoryExport.exportCategoryResults(cat, records)` — Exporta CSV
- `CAT_META[cat].filterFn(r)` — Evalúa si registro pertenece a categoría

### 10.3. Marco Teórico

Este sistema implementa el concepto de **mistranslation institucional** descrito en la tesis:

> "La institución traduce. La traducción falla. El fallo es el sistema."

Cada categoría representa un **régimen de verdad** institucional que traduce realidades complejas a formatos administrativos. El análisis de fricción mide la **pérdida** en esa traducción.

---

## 11. Soporte

Para consultas o problemas:
- **Issues**: https://github.com/vientonorte/antropologia-corrupcion/issues
- **Documentación general**: Ver `README.md` en raíz del repositorio
- **Contacto**: ver `CONTRIBUTING.md`

---

**Fin de la documentación**  
Sistema de Categorías Avanzadas de Búsqueda — v1.0  
Contra-Archivo: Antropología y Corrupción  
© 2026 Colectivo Viento Norte — CC BY-NC-SA 4.0
