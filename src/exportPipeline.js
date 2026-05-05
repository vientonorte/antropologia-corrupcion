/**
 * exportPipeline.js — Pipeline de salida dual + grafo
 * ─────────────────────────────────────────────────────
 * Genera tres artefactos distintos desde el mismo corpus:
 *
 *   1. buildEvidenceCard(caso, registros)
 *      → Ficha de evidencia HTML imprimible (abre print dialog → PDF)
 *        Incluye: cadena de custodia, mapa de actores, línea de tiempo,
 *        régimen de verdad comprometido, fricción epistémica + Índice Zuboff.
 *
 *   2. buildActorMap(casos)
 *      → Tabla estructurada actores × casos, renderizada en modal.
 *        Muestra quién aparece en qué casos, con qué rol institucional.
 *
 *   3. buildAcademicExport(casos, registros)
 *      → CSV para SPSS/R + JSON estructurado para análisis estadístico.
 *        Incluye: frecuencias de tipos de fricción, saturación teórica,
 *        tabla de mistranslations por régimen.
 *
 * Dependencias: frictionEngine.js (window.frictionEngine debe estar cargado)
 * ─────────────────────────────────────────────────────
 */

'use strict';

/* ─── UTILIDADES INTERNAS ─── */

function _safeText(val) {
    if (!val) return '—';
    return String(val).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _formatDate(iso) {
    if (!iso) return '—';
    try {
        var d = new Date(iso);
        return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) { return iso; }
}

function _downloadBlob(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

function _getFrictionEngine() {
    if (typeof window !== 'undefined' && window.frictionEngine) return window.frictionEngine;
    return null;
}

/* ─── 1. FICHA DE EVIDENCIA ─── */

/**
 * Genera el HTML de la ficha de evidencia para un caso.
 * Abre en nueva ventana y activa el diálogo de impresión (→ PDF).
 *
 * @param {Object} caso      - Objeto caso del JSON
 * @param {Array}  registros - Array de fuentes-oficiales.json
 */
function buildEvidenceCard(caso, registros) {
    var fe = _getFrictionEngine();
    var frictionAudit = fe ? fe.auditCaseFriction(caso.etica, caso.institucional, caso.material) : null;
    var zuboff = fe ? fe.calculateZuboffIndex(caso) : null;

    // Registros relacionados con este caso
    var relatedRegistros = (registros || []).filter(function(r) {
        return (r.friccion_con || []).indexOf(caso.id) !== -1;
    });

    // Línea de tiempo: combinar fechas del caso con las de registros
    var timeline = [];
    if (caso.anio) timeline.push({ fecha: String(caso.anio), evento: 'Inicio del periodo documentado', tipo: 'caso' });
    relatedRegistros.forEach(function(r) {
        if (r.fecha) timeline.push({ fecha: r.fecha, evento: r.titulo, tipo: r.fuente, actor: (r.actores_lobby || []).join(', ') });
    });
    timeline.sort(function(a, b) { return a.fecha < b.fecha ? -1 : 1; });

    // Actores únicos
    var actoresSet = {};
    (caso.actores || []).forEach(function(a) { actoresSet[a] = { nombre: a, roles: [], casos: [caso.id] }; });
    relatedRegistros.forEach(function(r) {
        (r.actores_lobby || []).forEach(function(a) {
            if (!actoresSet[a]) actoresSet[a] = { nombre: a, roles: [], casos: [] };
            if (actoresSet[a].casos.indexOf(caso.id) === -1) actoresSet[a].casos.push(caso.id);
            if (r.fuente && actoresSet[a].roles.indexOf(r.fuente) === -1) actoresSet[a].roles.push(r.fuente);
        });
    });

    // Fricción por par de capas
    var pairsHtml = '';
    if (frictionAudit && frictionAudit.pairs) {
        pairsHtml = frictionAudit.pairs.map(function(p) {
            var bars = Math.round(p.pairIntensity * 10);
            var barStr = '█'.repeat(bars) + '░'.repeat(10 - bars);
            return '<tr><td>' + _safeText(p.label) + '</td>'
                + '<td class="ev-mono">' + barStr + ' ' + (p.pairIntensity * 100).toFixed(0) + '%</td>'
                + '<td>' + (p.markers.map(function(m) { return m.label; }).join('; ') || '—') + '</td></tr>';
        }).join('');
    }

    // Índice Zuboff
    var zuboffHtml = '';
    if (zuboff) {
        var zBar = Math.round(zuboff.score * 10);
        zuboffHtml = '<p><strong>Índice Zuboff:</strong> '
            + '█'.repeat(zBar) + '░'.repeat(10 - zBar)
            + ' ' + (zuboff.score * 100).toFixed(0) + '% — Nivel: <em>' + zuboff.nivel + '</em></p>'
            + '<p class="ev-cita">' + _safeText(zuboff.interpretacion) + '</p>'
            + '<table class="ev-table"><thead><tr><th>Dimensión</th><th>Score</th><th>Activo</th></tr></thead><tbody>'
            + zuboff.dimensiones.map(function(d) {
                return '<tr><td>' + _safeText(d.label) + '</td>'
                    + '<td class="ev-mono">' + (d.score * 100).toFixed(0) + '%</td>'
                    + '<td>' + (d.activo ? '✓' : '—') + '</td></tr>';
            }).join('')
            + '</tbody></table>';
    }

    // Régimen comprometido
    var regimenHtml = [
        { key: 'etica', label: 'Ético/Testimonial', color: '#c8a96e', data: caso.etica },
        { key: 'institucional', label: 'Institucional', color: '#4a7fa5', data: caso.institucional },
        { key: 'material', label: 'Material/Territorial', color: '#7a9e6e', data: caso.material },
    ].map(function(capa) {
        if (!capa.data) return '';
        return '<div class="ev-capa" style="border-left:4px solid ' + capa.color + ';padding:8px 12px;margin-bottom:10px;">'
            + '<strong style="color:' + capa.color + '">' + capa.label + '</strong>: '
            + _safeText(capa.data.titulo) + '<br>'
            + '<small>' + _safeText(capa.data.descripcion) + '</small></div>';
    }).join('');

    var hashFecha = new Date().toISOString();
    var hashRef = caso.id + '-' + Date.now();

    var html = '<!DOCTYPE html>'
        + '<html lang="es"><head>'
        + '<meta charset="UTF-8">'
        + '<title>Ficha de Evidencia — ' + _safeText(caso.titulo) + '</title>'
        + '<style>'
        + 'body{font-family:Georgia,serif;max-width:780px;margin:0 auto;padding:24px;color:#1a1a1a;font-size:13px}'
        + 'h1{font-size:18px;border-bottom:2px solid #333;padding-bottom:6px}'
        + 'h2{font-size:14px;margin-top:20px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}'
        + '.ev-meta{background:#f5f5f5;padding:10px 14px;border-radius:4px;margin-bottom:16px}'
        + '.ev-meta td{padding:2px 8px 2px 0;vertical-align:top}'
        + '.ev-meta td:first-child{color:#555;white-space:nowrap;min-width:140px}'
        + '.ev-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}'
        + '.ev-table th{background:#333;color:#fff;padding:4px 8px;text-align:left}'
        + '.ev-table td{padding:4px 8px;border-bottom:1px solid #ddd;vertical-align:top}'
        + '.ev-mono{font-family:monospace;font-size:11px;white-space:nowrap}'
        + '.ev-cita{font-style:italic;color:#555;font-size:11px;border-left:3px solid #999;padding-left:8px}'
        + '.ev-hash{font-family:monospace;font-size:10px;color:#888;word-break:break-all}'
        + '.ev-timeline{border-left:3px solid #4a7fa5;padding-left:12px}'
        + '.ev-tl-item{margin-bottom:8px;position:relative}'
        + '.ev-tl-item::before{content:"";position:absolute;left:-16px;top:4px;width:8px;height:8px;'
        + 'background:#4a7fa5;border-radius:50%}'
        + '.ev-friction-bar{font-family:monospace;letter-spacing:1px}'
        + '@media print{'
        + 'body{max-width:none;padding:12px}'
        + '.no-print{display:none!important}'
        + 'h2{break-before:avoid}'
        + '.ev-capa,.ev-tl-item{break-inside:avoid}'
        + '}'
        + '</style>'
        + '</head><body>'

        // Header
        + '<div class="no-print" style="background:#ffeb3b;padding:8px 12px;margin-bottom:16px;border-radius:4px;font-size:12px">'
        + '⚠️ Uso restringido — Investigación doctoral | <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>'
        + '</div>'

        + '<h1>Ficha de Evidencia — Contra-Archivo</h1>'
        + '<h2>' + _safeText(caso.titulo) + '</h2>'

        // Metadatos
        + '<div class="ev-meta"><table>'
        + '<tr><td>ID del caso:</td><td><code>' + _safeText(caso.id) + '</code></td></tr>'
        + '<tr><td>Año:</td><td>' + _safeText(caso.anio) + '</td></tr>'
        + '<tr><td>Fricción dominante:</td><td>' + _safeText(caso.friccion && caso.friccion.tipo) + ' / ' + _safeText(caso.friccion && caso.friccion.subtipo) + '</td></tr>'
        + '<tr><td>Intensidad:</td><td>' + _safeText(caso.friccion && (caso.friccion.intensidad * 100).toFixed(0) + '%') + '</td></tr>'
        + '<tr><td>Estado:</td><td>' + _safeText(caso.friccion && caso.friccion.estado) + '</td></tr>'
        + '<tr><td>Tensión central:</td><td>' + _safeText(caso.friccion && caso.friccion.tension_central) + '</td></tr>'
        + '<tr><td>Instituciones:</td><td>' + _safeText((caso.instituciones || []).join(', ')) + '</td></tr>'
        + '<tr><td>Actores:</td><td>' + _safeText((caso.actores || []).join(', ')) + '</td></tr>'
        + '<tr><td>Fuente:</td><td>Contra-Archivo — Investigación Doctoral</td></tr>'
        + '<tr><td>Generado:</td><td>' + _formatDate(hashFecha) + '</td></tr>'
        + '</table></div>'

        // Regímenes comprometidos
        + '<h2>Regímenes de Verdad Comprometidos</h2>'
        + regimenHtml

        // Fricción epistémica
        + '<h2>Fricción Epistémica por Par de Capas</h2>'
        + (pairsHtml
            ? '<table class="ev-table"><thead><tr><th>Par de capas</th><th>Intensidad</th><th>Marcadores activos</th></tr></thead><tbody>' + pairsHtml + '</tbody></table>'
            : '<p>No disponible</p>')

        // Índice Zuboff
        + '<h2>Índice de Capitalismo de Vigilancia (Zuboff)</h2>'
        + (zuboffHtml || '<p>No disponible</p>')
        + '<p class="ev-cita">Zuboff, S. (2019). <em>The Age of Surveillance Capitalism</em>. PublicAffairs, Nueva York.</p>'

        // Línea de tiempo
        + '<h2>Línea de Tiempo Documental</h2>'
        + (timeline.length
            ? '<div class="ev-timeline">' + timeline.map(function(ev) {
                return '<div class="ev-tl-item">'
                    + '<strong>' + _safeText(ev.fecha) + '</strong> — '
                    + _safeText(ev.evento)
                    + (ev.actor ? ' <em>(' + _safeText(ev.actor) + ')</em>' : '')
                    + (ev.tipo && ev.tipo !== 'caso' ? ' <small>[' + _safeText(ev.tipo) + ']</small>' : '')
                    + '</div>';
            }).join('') + '</div>'
            : '<p>Sin documentos oficiales vinculados en el corpus.</p>')

        // Fuentes oficiales vinculadas
        + '<h2>Fuentes Oficiales Vinculadas (' + relatedRegistros.length + ')</h2>'
        + (relatedRegistros.length
            ? '<table class="ev-table"><thead><tr><th>Fuente</th><th>Título</th><th>Fecha</th><th>Tipo fricción</th></tr></thead><tbody>'
                + relatedRegistros.map(function(r) {
                    return '<tr><td>' + _safeText(r.fuente) + '</td><td>' + _safeText(r.titulo) + '</td>'
                        + '<td>' + _safeText(r.fecha) + '</td><td>' + _safeText(r.tipo_friccion) + '</td></tr>';
                }).join('')
                + '</tbody></table>'
            : '<p>Sin registros vinculados.</p>')

        // Cadena de custodia
        + '<h2>Cadena de Custodia</h2>'
        + '<p>Esta ficha fue generada desde el corpus público del Contra-Archivo. '
        + 'Los datos de la capa <em>institucional</em> provienen exclusivamente de fuentes oficiales verificables '
        + '(InfoLobby, CMF, Transparencia Activa, SEIA, LeyChile, BCN, ComprasPublicas). '
        + 'La capa <em>ética</em> contiene testimonios situados documentados bajo protocolo etnográfico. '
        + 'La capa <em>material</em> registra evidencia física/territorial.</p>'
        + '<p class="ev-hash">Referencia de generación: ' + hashRef + ' · ' + hashFecha + '</p>'
        + '<p class="ev-cita">Uso académico y de investigación. Citar como: Contra-Archivo: Antropología y Corrupción. '
        + 'Tesis doctoral, Chile, 2026. https://vientonorte.github.io/antropologia-corrupcion/</p>'

        + '</body></html>';

    var w = window.open('', '_blank', 'width=820,height=900,scrollbars=yes');
    if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(function() { w.focus(); }, 300);
    }
}

/* ─── 2. MAPA DE ACTORES ─── */

/**
 * Renderiza el mapa de actores en un modal dentro de la página.
 * Muestra qué actores aparecen en qué casos, con qué rol.
 *
 * @param {Array} casos     - Array de casos del JSON
 * @param {Array} registros - Array de fuentes-oficiales.json
 */
function buildActorMap(casos, registros) {
    // Recolectar todos los actores con sus apariciones
    var actorIndex = {};

    casos.forEach(function(caso) {
        (caso.actores || []).forEach(function(actor) {
            if (!actorIndex[actor]) actorIndex[actor] = { nombre: actor, apariciones: [], instituciones: new Set(), fuentes: new Set() };
            actorIndex[actor].apariciones.push({ casoId: caso.id, casoTitulo: caso.titulo, rol: 'actor_caso' });
        });
        (caso.instituciones || []).forEach(function(inst) {
            if (!actorIndex[inst]) actorIndex[inst] = { nombre: inst, apariciones: [], instituciones: new Set(), fuentes: new Set() };
            actorIndex[inst].apariciones.push({ casoId: caso.id, casoTitulo: caso.titulo, rol: 'institucion' });
            actorIndex[inst].instituciones.add(inst);
        });
    });

    (registros || []).forEach(function(r) {
        (r.actores_lobby || []).forEach(function(actor) {
            if (!actorIndex[actor]) actorIndex[actor] = { nombre: actor, apariciones: [], instituciones: new Set(), fuentes: new Set() };
            actorIndex[actor].fuentes.add(r.fuente);
            (r.friccion_con || []).forEach(function(casoId) {
                var caso = casos.find(function(c) { return c.id === casoId; });
                var casoTitulo = caso ? caso.titulo : casoId;
                var yaEsta = actorIndex[actor].apariciones.some(function(a) { return a.casoId === casoId && a.rol === 'lobby'; });
                if (!yaEsta) actorIndex[actor].apariciones.push({ casoId: casoId, casoTitulo: casoTitulo, rol: 'lobby', fuente: r.fuente });
            });
        });
    });

    // Ordenar por número de apariciones
    var actores = Object.values(actorIndex).sort(function(a, b) { return b.apariciones.length - a.apariciones.length; });

    // Crear IDs únicos de casos para la tabla de cruces
    var casoIds = casos.map(function(c) { return c.id; });

    var thead = '<thead><tr>'
        + '<th>Actor / Institución</th>'
        + '<th>Rol dominante</th>'
        + '<th>Fuentes</th>'
        + casos.map(function(c) {
            var short = c.titulo.length > 22 ? c.titulo.slice(0, 20) + '…' : c.titulo;
            return '<th title="' + _safeText(c.titulo) + '">' + _safeText(short) + '</th>';
        }).join('')
        + '</tr></thead>';

    var tbody = '<tbody>' + actores.map(function(actor) {
        var rolDom = actor.fuentes.size > 0 ? 'lobby/registro oficial' :
            actor.apariciones.some(function(a) { return a.rol === 'institucion'; }) ? 'institución' : 'actor';
        var fuentesStr = actor.fuentes.size > 0 ? Array.from(actor.fuentes).join(', ') : '—';
        return '<tr>'
            + '<td><strong>' + _safeText(actor.nombre) + '</strong></td>'
            + '<td>' + rolDom + '</td>'
            + '<td><small>' + _safeText(fuentesStr) + '</small></td>'
            + casoIds.map(function(casoId) {
                var aparece = actor.apariciones.filter(function(a) { return a.casoId === casoId; });
                if (!aparece.length) return '<td style="text-align:center;color:#ccc">—</td>';
                var roles = [...new Set(aparece.map(function(a) { return a.rol; }))].join(', ');
                return '<td style="text-align:center" title="' + _safeText(roles) + '">●</td>';
            }).join('')
            + '</tr>';
    }).join('') + '</tbody>';

    // Renderizar modal
    var existing = document.getElementById('ca-actor-map-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'ca-actor-map-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Mapa de actores transversal');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:9999;overflow:auto;padding:24px;';

    var inner = document.createElement('div');
    inner.style.cssText = 'background:#1a1a1a;max-width:1000px;margin:0 auto;border-radius:8px;padding:24px;color:#e5e5e5;';

    inner.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
        + '<h2 style="margin:0;font-size:16px">Mapa de Actores Transversal — ' + actores.length + ' actores identificados</h2>'
        + '<button id="ca-actor-map-close" aria-label="Cerrar mapa de actores" '
        + 'style="background:#333;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">✕ Cerrar</button>'
        + '</div>'
        + '<p style="font-size:12px;color:#aaa;margin-bottom:12px">● = aparece en ese caso. Rol: actor_caso, institución, lobby. '
        + 'Exportar como CSV para análisis estadístico.</p>'
        + '<div style="overflow-x:auto">'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
        + '<style>#ca-actor-map-modal th{background:#2d2d2d;padding:6px 8px;text-align:left;white-space:nowrap}'
        + '#ca-actor-map-modal td{padding:5px 8px;border-bottom:1px solid #2a2a2a}'
        + '#ca-actor-map-modal tr:hover td{background:#252525}</style>'
        + thead + tbody
        + '</table></div>'
        + '<div style="margin-top:16px;display:flex;gap:8px">'
        + '<button id="ca-actor-map-csv" style="background:#4a7fa5;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer">⬇ Exportar CSV</button>'
        + '</div>';

    modal.appendChild(inner);
    document.body.appendChild(modal);

    document.getElementById('ca-actor-map-close').addEventListener('click', function() { modal.remove(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

    // Exportar CSV desde el mapa de actores
    document.getElementById('ca-actor-map-csv').addEventListener('click', function() {
        var headers = ['actor', 'rol', 'fuentes'].concat(casoIds);
        var rows = actores.map(function(actor) {
            var rolDom = actor.fuentes.size > 0 ? 'lobby' :
                actor.apariciones.some(function(a) { return a.rol === 'institucion'; }) ? 'institucion' : 'actor';
            var fuentesStr = actor.fuentes.size > 0 ? Array.from(actor.fuentes).join(';') : '';
            return [
                '"' + actor.nombre.replace(/"/g, '""') + '"',
                rolDom,
                '"' + fuentesStr + '"',
            ].concat(casoIds.map(function(casoId) {
                return actor.apariciones.some(function(a) { return a.casoId === casoId; }) ? '1' : '0';
            })).join(',');
        });
        var csv = headers.join(',') + '\n' + rows.join('\n');
        _downloadBlob(csv, 'actores-transversal.csv', 'text/csv;charset=utf-8;');
    });
}

/* ─── 3. EXPORT ACADÉMICO ─── */

/**
 * Genera export académico: CSV para SPSS/R + JSON citable.
 * Incluye: frecuencias de fricción, saturación teórica por caso,
 * tabla de mistranslations por régimen, Índice Zuboff.
 *
 * @param {Array} casos     - Array de casos del JSON
 * @param {Array} registros - Array de fuentes-oficiales.json
 * @param {'csv'|'json'|'both'} formato - Formato de salida
 */
function buildAcademicExport(casos, registros, formato) {
    formato = formato || 'both';
    var fe = _getFrictionEngine();

    // Análisis por caso
    var casoData = casos.map(function(caso) {
        var frictionAudit = fe ? fe.auditCaseFriction(caso.etica, caso.institucional, caso.material) : null;
        var zuboff = fe ? fe.calculateZuboffIndex(caso) : null;
        var caseRegistros = (registros || []).filter(function(r) {
            return (r.friccion_con || []).indexOf(caso.id) !== -1;
        });

        // Frecuencia de tipos de fricción
        var frictionTypeCounts = { politica: 0, semantica: 0, tecnica: 0 };
        if (frictionAudit && frictionAudit.pairs) {
            frictionAudit.pairs.forEach(function(p) {
                p.markers.forEach(function(m) {
                    if (frictionTypeCounts[m.tipo] !== undefined) frictionTypeCounts[m.tipo]++;
                });
            });
        }

        // Saturación teórica: ratio de marcadores activados / marcadores totales
        var totalMarkers = fe ? fe.FRICTION_MARKERS.length : 18;
        var activeMarkers = frictionAudit ? frictionAudit.pairs.reduce(function(sum, p) { return sum + p.markers.length; }, 0) : 0;
        var saturacion = parseFloat((activeMarkers / totalMarkers).toFixed(3));

        // Mistranslations por régimen
        var mistranslations = caseRegistros.map(function(r) {
            return {
                fuente: r.fuente,
                tipo: r.tipo_friccion,
                capa_oficial: r.capa_oficial,
                fecha: r.fecha,
            };
        });

        return {
            id: caso.id,
            titulo: caso.titulo,
            anio: caso.anio,
            n_actores: (caso.actores || []).length,
            n_instituciones: (caso.instituciones || []).length,
            friccion_tipo: caso.friccion ? caso.friccion.tipo : null,
            friccion_subtipo: caso.friccion ? caso.friccion.subtipo : null,
            friccion_intensidad: caso.friccion ? caso.friccion.intensidad : null,
            friccion_politica: frictionTypeCounts.politica,
            friccion_semantica: frictionTypeCounts.semantica,
            friccion_tecnica: frictionTypeCounts.tecnica,
            saturacion_teorica: saturacion,
            n_fuentes_oficiales: caseRegistros.length,
            zuboff_score: zuboff ? zuboff.score : null,
            zuboff_nivel: zuboff ? zuboff.nivel : null,
            zuboff_extraccion: zuboff ? (zuboff.dimensiones[0] ? zuboff.dimensiones[0].score : 0) : null,
            zuboff_excedente: zuboff ? (zuboff.dimensiones[1] ? zuboff.dimensiones[1].score : 0) : null,
            zuboff_prediccion: zuboff ? (zuboff.dimensiones[2] ? zuboff.dimensiones[2].score : 0) : null,
            zuboff_desigualdad: zuboff ? (zuboff.dimensiones[3] ? zuboff.dimensiones[3].score : 0) : null,
            zuboff_modificacion: zuboff ? (zuboff.dimensiones[4] ? zuboff.dimensiones[4].score : 0) : null,
            mistranslations: mistranslations,
            tags: (caso.tags || []).join(';'),
        };
    });

    // Tabla agregada de mistranslations por régimen
    var missByRegimen = {};
    casoData.forEach(function(c) {
        c.mistranslations.forEach(function(m) {
            var key = m.fuente + '|' + m.tipo;
            if (!missByRegimen[key]) missByRegimen[key] = { fuente: m.fuente, tipo: m.tipo, count: 0, casos: [] };
            missByRegimen[key].count++;
            if (missByRegimen[key].casos.indexOf(c.id) === -1) missByRegimen[key].casos.push(c.id);
        });
    });

    var fechaExport = new Date().toISOString().slice(0, 10);

    if (formato === 'csv' || formato === 'both') {
        // CSV plano: un caso por fila (para SPSS/R)
        var headers = [
            'id', 'titulo', 'anio', 'n_actores', 'n_instituciones',
            'friccion_tipo', 'friccion_subtipo', 'friccion_intensidad',
            'friccion_politica', 'friccion_semantica', 'friccion_tecnica',
            'saturacion_teorica', 'n_fuentes_oficiales',
            'zuboff_score', 'zuboff_nivel',
            'zuboff_extraccion', 'zuboff_excedente', 'zuboff_prediccion',
            'zuboff_desigualdad', 'zuboff_modificacion', 'tags',
        ];
        var csvRows = casoData.map(function(c) {
            return headers.map(function(h) {
                var val = c[h];
                if (val === null || val === undefined) return '';
                if (typeof val === 'string' && val.indexOf(',') !== -1) return '"' + val.replace(/"/g, '""') + '"';
                return String(val);
            }).join(',');
        });
        var csv = headers.join(',') + '\n' + csvRows.join('\n')
            + '\n\n# Mistranslations por régimen\n'
            + 'fuente,tipo,count,casos\n'
            + Object.values(missByRegimen).map(function(m) {
                return [m.fuente, m.tipo, m.count, '"' + m.casos.join(';') + '"'].join(',');
            }).join('\n');

        _downloadBlob(csv, 'contra-archivo-export-' + fechaExport + '.csv', 'text/csv;charset=utf-8;');
    }

    if (formato === 'json' || formato === 'both') {
        var jsonExport = {
            _meta: {
                proyecto: 'Contra-Archivo: Antropología y Corrupción',
                version: '2026',
                exportado: new Date().toISOString(),
                citar_como: 'Contra-Archivo: Antropología y Corrupción. Tesis doctoral, Chile, 2026.',
                url: 'https://vientonorte.github.io/antropologia-corrupcion/',
                marco_analitico: {
                    friccion: 'Distancia epistémica entre regímenes de verdad (ético, institucional, material)',
                    zuboff: 'Índice de Capitalismo de Vigilancia. Zuboff (2019) The Age of Surveillance Capitalism',
                    saturacion: 'Ratio marcadores activos / total FRICTION_MARKERS — indica saturación teórica GT',
                },
            },
            resumen: {
                n_casos: casos.length,
                n_fuentes_oficiales: (registros || []).length,
                friccion_media: parseFloat((casoData.reduce(function(s, c) { return s + (c.friccion_intensidad || 0); }, 0) / casoData.length).toFixed(3)),
                zuboff_medio: parseFloat((casoData.reduce(function(s, c) { return s + (c.zuboff_score || 0); }, 0) / casoData.length).toFixed(3)),
                saturacion_media: parseFloat((casoData.reduce(function(s, c) { return s + c.saturacion_teorica; }, 0) / casoData.length).toFixed(3)),
                mistranslations_por_regimen: Object.values(missByRegimen),
            },
            casos: casoData,
        };
        _downloadBlob(JSON.stringify(jsonExport, null, 2), 'contra-archivo-export-' + fechaExport + '.json', 'application/json');
    }
}

/* ─── EXPORT GLOBAL ─── */
if (typeof window !== 'undefined' && !window.exportPipeline) {
    window.exportPipeline = {
        buildEvidenceCard: buildEvidenceCard,
        buildActorMap: buildActorMap,
        buildAcademicExport: buildAcademicExport,
    };
}
