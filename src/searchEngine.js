/**
 * searchEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Buscador de Fricción Institucional — Contra-Archivo
 *
 * Conecta fuentes oficiales chilenas (InfoLobby, Transparencia, LeyChile,
 * SEIA, ComprasPúblicas, CMF) con el modelo de fricción epistemológica
 * del contra-archivo. Cada resultado muestra el score de fricción entre
 * la capa oficial y las capas del caso vinculado.
 *
 * Dependencias: frictionEngine.js (normalizeStr, FRICTION_MARKERS)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── CONSTANTES ─── */

var FUENTE_ICONS = {
    bcn: '🏛',
    infolobby: '🏛',
    transparencia: '🔍',
    leychile: '⚖',
    seia: '🌿',
    compraspublicas: '📋',
    cmf: '💹'
};

var FUENTE_LABELS = {
    bcn: 'BCN Tramitación',
    infolobby: 'InfoLobby',
    transparencia: 'Transparencia',
    leychile: 'LeyChile',
    seia: 'SEIA',
    compraspublicas: 'ComprasPúblicas',
    cmf: 'CMF'
};

var FUENTE_COLORS = {
    bcn: '#6f8fcb',
    infolobby: '#e8b84b',
    transparencia: '#5ba3d9',
    leychile: '#c8a96e',
    seia: '#7a9e6e',
    compraspublicas: '#d97b5b',
    cmf: '#a07acc'
};

/* ─── UTILIDADES ─── */

/**
 * Normaliza string: lowercase, sin tildes, sin puntuación
 */
function _seNormalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim();
}

/**
 * Calcula similitud Jaccard entre dos conjuntos de keywords
 */
function _seJaccard(setA, setB) {
    if (!setA.length || !setB.length) return 0;
    var a = new Set(setA.map(_seNormalize));
    var b = new Set(setB.map(_seNormalize));
    var inter = 0;
    b.forEach(function(k) { if (a.has(k)) inter++; });
    var union = a.size + b.size - inter;
    return union > 0 ? inter / union : 0;
}

/**
 * Busca coincidencias de texto en campos de un registro
 */
function _seTextMatch(registro, query) {
    var normalized = _seNormalize(query);
    var tokens = normalized.split(/\s+/).filter(Boolean);
    if (!tokens.length) return 1; // vacío = muestra todo

    var searchable = [
        registro.titulo || '',
        registro.materia || '',
        registro.capa_oficial || '',
        (registro.keywords || []).join(' '),
        (registro.tags || []).join(' '),
        registro.institucion || '',
        (registro.actores_lobby || []).join(' ')
    ].join(' ');

    var normalSearchable = _seNormalize(searchable);
    var hits = 0;
    for (var i = 0; i < tokens.length; i++) {
        if (normalSearchable.indexOf(tokens[i]) !== -1) hits++;
    }
    return hits / tokens.length;
}

/* ─── CORE: SCORE DE FRICCIÓN ─── */

/**
 * Calcula el score de fricción entre un registro oficial y un caso del contra-archivo.
 *
 * Score = 0.5 * (1 - keyword_overlap) + 0.3 * marker_match + 0.2 * tipo_penalty
 *
 * - keyword_overlap: Jaccard entre keywords del registro y keywords combinados de las 3 capas del caso
 * - marker_match: si los keywords del registro activan FRICTION_MARKERS del frictionEngine
 * - tipo_penalty: bonus si el tipo de fricción del registro coincide con el tipo del caso
 */
function computeFrictionScore(registro, caso) {
    if (window.frictionEngine && typeof window.frictionEngine.explainRecordFriction === 'function') {
        return window.frictionEngine.explainRecordFriction(registro, caso).score;
    }

    if (!caso) return 0.5;

    var regKw = (registro.keywords || []);
    var casoKw = []
        .concat(caso.etica ? caso.etica.keywords || [] : [])
        .concat(caso.institucional ? caso.institucional.keywords || [] : [])
        .concat(caso.material ? caso.material.keywords || [] : []);

    var overlap = _seJaccard(regKw, casoKw);
    var overlapScore = 1 - Math.min(overlap * 6, 1);
    var tipoPenalty = 0;

    if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.tipo) {
        tipoPenalty = 0.3;
    } else if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.subtipo) {
        tipoPenalty = 0.15;
    }

    var score = 0.5 * overlapScore + 0.2 * tipoPenalty;
    return Math.min(Math.max(parseFloat(score.toFixed(3)), 0.05), 1.0);
}

function explainSearchFriction(registro, caso) {
    if (window.frictionEngine && typeof window.frictionEngine.explainRecordFriction === 'function') {
        return window.frictionEngine.explainRecordFriction(registro, caso);
    }

    var fallbackScore = computeFrictionScore(registro, caso);
    return {
        score: fallbackScore,
        overlap: 0,
        overlapScore: fallbackScore,
        markerScore: 0,
        tipoPenalty: 0,
        markers: []
    };
}

function _seFlatLegislativeList(list) {
    var output = [];
    list = list || [];

    for (var index = 0; index < list.length; index++) {
        var item = list[index];
        if (!item) continue;
        if (typeof item === 'string') {
            output.push(item);
            continue;
        }
        output.push(item.tipo || item.nombre || item.descripcion || item.label || '');
    }

    return output.filter(Boolean);
}

function normalizeBcnDataset(dataset) {
    dataset = dataset || {};
    var boletines = dataset.boletines || dataset.registros || [];
    var normalized = [];

    for (var i = 0; i < boletines.length; i++) {
        var boletin = boletines[i] || {};
        var urgencias = _seFlatLegislativeList(boletin.urgencias);
        var comisiones = []
            .concat(boletin.comisiones || [])
            .concat(boletin.comision_actual ? [boletin.comision_actual] : []);
        var autores = boletin.autores || [];
        var indicaciones = _seFlatLegislativeList(boletin.indicaciones_clave);
        var keywords = []
            .concat(boletin.materias || [])
            .concat(boletin.etapas_irregulares || [])
            .concat(boletin.actores_clave || [])
            .concat(boletin.alertas_friccion || [])
            .concat(urgencias)
            .concat(comisiones)
            .concat(autores)
            .concat(indicaciones)
            .concat(boletin.enip_dimensiones || []);
        var tags = []
            .concat(['BCN', 'tramitación legislativa'])
            .concat(boletin.tipo_registro ? [boletin.tipo_registro] : [])
            .concat(boletin.estado_verificacion ? [boletin.estado_verificacion] : [])
            .concat(boletin.tags || []);

        normalized.push({
            id: boletin.id || ('bcn-' + i),
            fuente: 'bcn',
            titulo: boletin.titulo || boletin.boletin || 'Boletín BCN',
            fecha: boletin.fecha_ingreso || boletin.fecha_actualizacion || '',
            url: boletin.url || '',
            institucion: 'Biblioteca del Congreso Nacional',
            materia: boletin.resumen || boletin.materia || '',
            keywords: keywords,
            capa_oficial: boletin.capa_oficial || boletin.resumen || '',
            friccion_con: boletin.friccion_con || 'periodismo-datos-chile',
            tipo_friccion: boletin.tipo_friccion || 'tecnica',
            tags: tags,
            boletin: boletin.boletin || '',
            tipo_registro: boletin.tipo_registro || 'boletin',
            etapa: boletin.etapa_actual || '',
            comision: boletin.comision_actual || '',
            urgencias: urgencias,
            autores: autores,
            indicaciones_total: boletin.indicaciones_total != null ? boletin.indicaciones_total : null,
            indicaciones_clave: indicaciones,
            camara_origen: boletin.camara_origen || '',
            camara_revisora: boletin.camara_revisora || '',
            estado_verificacion: boletin.estado_verificacion || 'sin-clasificar',
            trazabilidad: boletin.trazabilidad || [],
            enip_dimensiones: boletin.enip_dimensiones || [],
            metadatos_legislativos: {
                comision_actual: boletin.comision_actual || '',
                comisiones: boletin.comisiones || [],
                urgencias: boletin.urgencias || [],
                autores: boletin.autores || [],
                indicaciones_total: boletin.indicaciones_total != null ? boletin.indicaciones_total : null,
                indicaciones_clave: boletin.indicaciones_clave || [],
                camara_origen: boletin.camara_origen || '',
                camara_revisora: boletin.camara_revisora || '',
                ultimo_hito: boletin.ultimo_hito || '',
                trazabilidad: boletin.trazabilidad || [],
                estado_verificacion: boletin.estado_verificacion || 'sin-clasificar',
                fuente_historia_ley: boletin.fuente_historia_ley || boletin.url || ''
            }
        });
    }

    return normalized;
}

/* ─── MOTOR DE BÚSQUEDA ─── */

/**
 * @typedef {Object} SearchResult
 * @property {Object} registro - El registro de fuente oficial
 * @property {number} relevance - Relevancia del texto (0-1)
 * @property {number} frictionScore - Score de fricción con el caso vinculado
 * @property {Object} frictionAudit - Desglose del score de fricción
 * @property {Object|null} casoVinculado - El caso del contra-archivo
 */

/**
 * Constructor del buscador
 * @param {Object} opts
 * @param {Object[]} opts.registros - Array de registros de fuentes oficiales
 * @param {Object[]} opts.casos - Array de casos del contra-archivo
 */
function FrictionSearchEngine(opts) {
    this.registros = opts.registros || [];
    this.casos = opts.casos || [];
    this._casoMap = {};
    for (var i = 0; i < this.casos.length; i++) {
        this._casoMap[this.casos[i].id] = this.casos[i];
    }
}

/**
 * Busca registros que coincidan con el query y/o filtros
 * @param {Object} params
 * @param {string} [params.query] - Texto libre
 * @param {string} [params.fuente] - Filtrar por fuente (infolobby|transparencia|leychile|seia|compraspublicas|cmf)
 * @param {string} [params.caso] - Filtrar por caso vinculado (id)
 * @param {string} [params.tipo] - Filtrar por tipo de fricción (politica|semantica|tecnica)
 * @returns {SearchResult[]}
 */
FrictionSearchEngine.prototype.search = function(params) {
    params = params || {};
    var query = params.query || '';
    var fuenteFilter = params.fuente || 'all';
    var casoFilter = params.caso || 'all';
    var tipoFilter = params.tipo || 'all';

    var results = [];
    var self = this;

    for (var i = 0; i < this.registros.length; i++) {
        var reg = this.registros[i];

        // Apply filters
        if (fuenteFilter !== 'all' && reg.fuente !== fuenteFilter) continue;
        if (casoFilter !== 'all' && reg.friccion_con !== casoFilter) continue;
        if (tipoFilter !== 'all' && reg.tipo_friccion !== tipoFilter) continue;

        // Text match
        var relevance = _seTextMatch(reg, query);
        if (relevance < 0.3 && query.length > 0) continue;

        // Friction score
        var caso = self._casoMap[reg.friccion_con] || null;
        var frictionAudit = explainSearchFriction(reg, caso);
        var frictionScore = frictionAudit.score;

        results.push({
            registro: reg,
            relevance: relevance,
            frictionScore: frictionScore,
            frictionAudit: frictionAudit,
            casoVinculado: caso
        });
    }

    // Sort: relevance first, then friction score
    results.sort(function(a, b) {
        if (Math.abs(a.relevance - b.relevance) > 0.1) return b.relevance - a.relevance;
        return b.frictionScore - a.frictionScore;
    });

    return results;
};

/**
 * Obtiene los stats agregados de un conjunto de resultados
 */
FrictionSearchEngine.prototype.getStats = function(results) {
    if (!results.length) {
        return {
            total: 0,
            avgFriction: 0,
            byFuente: {},
            byTipo: {},
            components: {
                overlap: 0,
                marker: 0,
                tipo: 0
            },
            markerActivationRate: 0
        };
    }

    var sum = 0;
    var byFuente = {};
    var byTipo = {};
    var componentTotals = {
        overlap: 0,
        marker: 0,
        tipo: 0
    };
    var markerHits = 0;

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        sum += r.frictionScore;

        var f = r.registro.fuente;
        byFuente[f] = (byFuente[f] || 0) + 1;

        var t = r.registro.tipo_friccion;
        byTipo[t] = (byTipo[t] || 0) + 1;

        var audit = r.frictionAudit || {};
        componentTotals.overlap += audit.overlapScore || 0;
        componentTotals.marker += audit.markerScore || 0;
        componentTotals.tipo += audit.tipoPenalty || 0;
        if ((audit.markers || []).length) markerHits++;
    }

    return {
        total: results.length,
        avgFriction: parseFloat((sum / results.length).toFixed(3)),
        byFuente: byFuente,
        byTipo: byTipo,
        components: {
            overlap: parseFloat((componentTotals.overlap / results.length).toFixed(3)),
            marker: parseFloat((componentTotals.marker / results.length).toFixed(3)),
            tipo: parseFloat((componentTotals.tipo / results.length).toFixed(3))
        },
        markerActivationRate: parseFloat((markerHits / results.length).toFixed(3))
    };
};

/* ─── RENDERING ─── */

/**
 * Genera el HTML de una tarjeta de resultado
 */
function renderSearchCard(result, context) {
    var reg = result.registro;
    var score = result.frictionScore;
    var audit = result.frictionAudit || { overlapScore: score, markerScore: 0, tipoPenalty: 0, markers: [] };
    context = context || {};
    var fuente = reg.fuente;
    var color = FUENTE_COLORS[fuente] || '#888';
    var icon = FUENTE_ICONS[fuente] || '📄';
    var label = FUENTE_LABELS[fuente] || fuente;

    // Color del score según intensidad
    var scoreColor = score > 0.7 ? '#c85f4a' : score > 0.4 ? '#e8b84b' : '#7a9e6e';

    var casoLabel = '';
    if (result.casoVinculado) {
        casoLabel = result.casoVinculado.titulo;
    }

    var tagsHtml = '';
    var tags = reg.tags || [];
    for (var t = 0; t < Math.min(tags.length, 4); t++) {
        tagsHtml += '<span class="se-tag">' + _escHtml(tags[t]) + '</span>';
    }

    var overlapPct = (audit.overlapScore || 0) * 100;
    var markerPct = (audit.markerScore || 0) * 100;
    var tipoPct = (audit.tipoPenalty || 0) * 100;
    var summaryText = markerPct >= overlapPct && markerPct >= tipoPct ?
        'Predomina un marcador explícito de conflicto.' :
        overlapPct >= tipoPct ?
        'Predomina la distancia semántica entre registro y caso.' :
        'Predomina la coincidencia tipológica con el caso vinculado.';
    var markersHtml = '';
    var markers = audit.markers || [];
    for (var m = 0; m < Math.min(markers.length, 2); m++) {
        markersHtml += '<span class="se-audit-pill">' + _escHtml(markers[m].label) + '</span>';
    }

    var sharedKeywords = _seSharedKeywords(reg, result.casoVinculado);
    var sharedHtml = '';
    for (var s = 0; s < sharedKeywords.length; s++) {
        sharedHtml += '<span class="se-card-shared-pill">' + _escHtml(sharedKeywords[s]) + '</span>';
    }

    var markerExplainHtml = '';
    for (var mx = 0; mx < Math.min(markers.length, 3); mx++) {
        var marker = markers[mx] || {};
        var markerWeight = marker.peso != null ? ' · peso ' + Math.round(marker.peso * 100) + '%' : '';
        markerExplainHtml += '<span class="se-card-marker-pill">' + _escHtml((marker.label || 'Marcador') + markerWeight) + '</span>';
    }

    var queryText = context.query && context.query.trim() ? context.query.trim() : '';
    var explainLead = queryText ?
        'Consulta activa: "' + _escHtml(queryText) + '". Relevancia textual ' + Math.round((result.relevance || 0) * 100) + '%.' :
        'Sin término libre: el orden actual depende de filtros activos y score de fricción.';

    var detailsHtml = '<details class="se-card-details">' +
        '<summary><span>Por qué aparece</span><span>' + Math.round((result.relevance || 0) * 100) + '% relevancia</span></summary>' +
        '<div class="se-card-details-body">' +
        '<div class="se-card-detail-note">' + explainLead + '</div>' +
        '<div class="se-card-details-grid">' +
        '<div class="se-card-detail-box"><span class="se-card-detail-kicker">Distancia semántica</span><div class="se-card-detail-value">' + overlapPct.toFixed(0) + '%</div></div>' +
        '<div class="se-card-detail-box"><span class="se-card-detail-kicker">Marcadores explícitos</span><div class="se-card-detail-value">' + markerPct.toFixed(0) + '%</div></div>' +
        '<div class="se-card-detail-box"><span class="se-card-detail-kicker">Coincidencia tipológica</span><div class="se-card-detail-value">' + tipoPct.toFixed(0) + '%</div></div>' +
        '<div class="se-card-detail-box"><span class="se-card-detail-kicker">Caso priorizado</span><div class="se-card-detail-value">' + _escHtml(casoLabel || 'Sin caso vinculado') + '</div></div>' +
        '</div>' +
        (sharedHtml ? '<div><span class="se-card-detail-kicker">Keywords compartidas</span><div class="se-card-shared-list">' + sharedHtml + '</div></div>' : '') +
        (markerExplainHtml ? '<div><span class="se-card-detail-kicker">Marcadores activados</span><div class="se-card-marker-list">' + markerExplainHtml + '</div></div>' : '') +
        '<div class="se-card-detail-note">Este registro se ordena combinando distancia entre vocabularios, presencia de marcadores de conflicto y coincidencia con el tipo de fricción del caso.</div>' +
        '</div>' +
        '</details>';

    var html = '<article class="se-card" data-result-id="' + _escHtml(reg.id || '') + '" data-fuente="' + fuente + '" data-score="' + score + '">' +
        '<div class="se-card-header">' +
        '<span class="se-card-icon" style="color:' + color + '">' + icon + '</span>' +
        '<span class="se-card-fuente" style="color:' + color + '">' + _escHtml(label) + '</span>' +
        '<span class="se-card-fecha">' + _escHtml(reg.fecha || '') + '</span>' +
        '</div>' +
        '<h3 class="se-card-title">' + _escHtml(reg.titulo) + '</h3>' +
        '<p class="se-card-capa">' + _escHtml(reg.capa_oficial || '') + '</p>' +
        '<div class="se-card-meta">' +
        '<div class="se-card-score-wrap">' +
        '<span class="se-card-score-label">Fricción</span>' +
        '<div class="se-card-score-bar"><div class="se-card-score-fill" style="width:' + (score * 100) + '%;background:' + scoreColor + '"></div></div>' +
        '<span class="se-card-score-val" style="color:' + scoreColor + '">' + (score * 100).toFixed(0) + '%</span>' +
        '</div>' +
        (casoLabel ? '<div class="se-card-caso">↔ ' + _escHtml(casoLabel) + '</div>' : '') +
        '</div>' +
        '<div class="se-card-audit">' +
        '<div class="se-card-audit-head">' +
        '<span class="se-card-audit-kicker">Desglose</span>' +
        '<span class="se-card-audit-summary">' + _escHtml(summaryText) + '</span>' +
        '</div>' +
        '<div class="se-card-audit-metrics">' +
        '<span class="se-card-audit-metric">distancia ' + overlapPct.toFixed(0) + '%</span>' +
        '<span class="se-card-audit-metric">marcador ' + markerPct.toFixed(0) + '%</span>' +
        '<span class="se-card-audit-metric">tipo ' + tipoPct.toFixed(0) + '%</span>' +
        '</div>' +
        (markersHtml ? '<div class="se-card-audit-markers">' + markersHtml + '</div>' : '') +
        '</div>' +
        detailsHtml +
        '<div class="se-card-tags">' + tagsHtml + '</div>' +
        (reg.url ? '<a class="se-card-link" href="' + _escHtml(reg.url) + '" target="_blank" rel="noopener noreferrer">Ver fuente oficial ↗</a>' : '') +
        '</article>';

    return html;
}

/**
 * Genera HTML del panel de estadísticas
 */
function renderSearchStats(stats) {
    if (!stats.total) return '<div class="se-stats-empty">Sin resultados para esta búsqueda. Prueba un término más general o cambia los filtros.</div>';

    var fuenteBars = '';
    var fuentes = Object.keys(stats.byFuente);
    for (var i = 0; i < fuentes.length; i++) {
        var f = fuentes[i];
        var count = stats.byFuente[f];
        var pct = (count / stats.total * 100).toFixed(0);
        var clr = FUENTE_COLORS[f] || '#888';
        fuenteBars += '<div class="se-stat-row">' +
            '<span class="se-stat-label" style="color:' + clr + '">' + (FUENTE_ICONS[f] || '') + ' ' + (FUENTE_LABELS[f] || f) + '</span>' +
            '<div class="se-stat-bar"><div class="se-stat-fill" style="width:' + pct + '%;background:' + clr + '"></div></div>' +
            '<span class="se-stat-val">' + count + '</span>' +
            '</div>';
    }

    var avgColor = stats.avgFriction > 0.7 ? '#c85f4a' : stats.avgFriction > 0.4 ? '#e8b84b' : '#7a9e6e';
    var overlapPct = (stats.components.overlap || 0) * 100;
    var markerPct = (stats.components.marker || 0) * 100;
    var tipoPct = (stats.components.tipo || 0) * 100;
    var activationPct = (stats.markerActivationRate || 0) * 100;

    var componentRows = '' +
        '<div class="se-component-row">' +
        '<span class="se-component-label">Distancia semántica</span>' +
        '<div class="se-component-bar"><div class="se-component-fill" style="width:' + overlapPct.toFixed(0) + '%;background:#c8a96e"></div></div>' +
        '<span class="se-component-val">' + overlapPct.toFixed(0) + '%</span>' +
        '</div>' +
        '<div class="se-component-row">' +
        '<span class="se-component-label">Marcadores explícitos</span>' +
        '<div class="se-component-bar"><div class="se-component-fill" style="width:' + markerPct.toFixed(0) + '%;background:#c85f4a"></div></div>' +
        '<span class="se-component-val">' + markerPct.toFixed(0) + '%</span>' +
        '</div>' +
        '<div class="se-component-row">' +
        '<span class="se-component-label">Coincidencia tipológica</span>' +
        '<div class="se-component-bar"><div class="se-component-fill" style="width:' + tipoPct.toFixed(0) + '%;background:#4a7fa5"></div></div>' +
        '<span class="se-component-val">' + tipoPct.toFixed(0) + '%</span>' +
        '</div>';

    return '<div class="se-stats">' +
        '<div class="se-stats-summary">' +
        '<div class="se-stat-big"><span class="se-stat-num">' + stats.total + '</span><span class="se-stat-desc">registros</span></div>' +
        '<div class="se-stat-big"><span class="se-stat-num" style="color:' + avgColor + '">' + (stats.avgFriction * 100).toFixed(0) + '%</span><span class="se-stat-desc">fricción promedio</span></div>' +
        '<div class="se-stat-big"><span class="se-stat-num">' + activationPct.toFixed(0) + '%</span><span class="se-stat-desc">con marcador activo</span></div>' +
        '</div>' +
        '<div class="se-stats-components">' +
        '<div class="se-stats-components-title">Componentes del score</div>' +
        componentRows +
        '</div>' +
        '<div class="se-stats-breakdown">' + fuenteBars + '</div>' +
        '</div>';
}

/**
 * Escapa HTML
 */
function _escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _seBuildSuggestions(registros, casos) {
    var bag = Object.create(null);

    function pushTerm(term) {
        if (!term) return;
        var normalized = _seNormalize(String(term));
        if (!normalized || normalized.length < 4) return;
        bag[normalized] = (bag[normalized] || 0) + 1;
    }

    for (var i = 0; i < (registros || []).length; i++) {
        var reg = registros[i] || {};
        pushTerm(reg.titulo);
        pushTerm(reg.materia);
        pushTerm(reg.institucion);

        var regKeywords = reg.keywords || [];
        for (var rk = 0; rk < regKeywords.length; rk++) pushTerm(regKeywords[rk]);

        var regTags = reg.tags || [];
        for (var rt = 0; rt < regTags.length; rt++) pushTerm(regTags[rt]);
    }

    for (var j = 0; j < (casos || []).length; j++) {
        var caso = casos[j] || {};
        pushTerm(caso.titulo);
        var casoTags = caso.tags || [];
        for (var ct = 0; ct < casoTags.length; ct++) pushTerm(casoTags[ct]);
    }

    return Object.keys(bag)
        .sort(function(a, b) {
            return bag[b] - bag[a] || a.localeCompare(b);
        })
        .slice(0, 120);
}

function _seMountSuggestions(searchInput, registros, casos) {
    if (!searchInput || !searchInput.parentNode) return;

    var datalistId = 'se-suggestions';
    var datalist = document.getElementById(datalistId);
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        searchInput.parentNode.appendChild(datalist);
    }

    var suggestions = _seBuildSuggestions(registros, casos);
    var options = '';
    for (var i = 0; i < suggestions.length; i++) {
        options += '<option value="' + _escHtml(suggestions[i]) + '"></option>';
    }
    datalist.innerHTML = options;
    searchInput.setAttribute('list', datalistId);
}

function _seShortCasoLabel(caso) {
    if (!caso || !caso.titulo) return 'Caso vinculado';
    return caso.titulo.split('—')[0].split(':')[0].trim();
}

function _seSharedKeywords(registro, caso) {
    if (!registro || !caso) return [];

    var regKeywords = (registro.keywords || []).map(_seNormalize).filter(Boolean);
    var casoKeywords = []
        .concat(caso.etica ? caso.etica.keywords || [] : [])
        .concat(caso.institucional ? caso.institucional.keywords || [] : [])
        .concat(caso.material ? caso.material.keywords || [] : [])
        .map(_seNormalize)
        .filter(Boolean);

    var casoSet = new Set(casoKeywords);
    var seen = Object.create(null);
    var shared = [];

    for (var i = 0; i < regKeywords.length; i++) {
        var keyword = regKeywords[i];
        if (casoSet.has(keyword) && !seen[keyword]) {
            seen[keyword] = true;
            shared.push(keyword);
        }
    }

    return shared.slice(0, 6);
}

function _seCountBy(results, getter) {
    var counts = Object.create(null);

    for (var i = 0; i < results.length; i++) {
        var item = getter(results[i]);
        if (!item || !item.value) continue;
        if (!counts[item.value]) counts[item.value] = { value: item.value, label: item.label || item.value, count: 0 };
        counts[item.value].count++;
    }

    return Object.keys(counts).map(function(key) {
        return counts[key];
    }).sort(function(a, b) {
        return b.count - a.count || a.label.localeCompare(b.label);
    });
}

function renderSearchFacets(results, params) {
    if (!results || !results.length) return '';

    var fuenteItems = _seCountBy(results, function(result) {
        var fuente = result.registro && result.registro.fuente;
        if (!fuente) return null;
        return {
            value: fuente,
            label: (FUENTE_ICONS[fuente] || '•') + ' ' + (FUENTE_LABELS[fuente] || fuente)
        };
    }).slice(0, 5);

    var tipoItems = _seCountBy(results, function(result) {
        var tipo = result.registro && result.registro.tipo_friccion;
        if (!tipo) return null;
        return {
            value: tipo,
            label: tipo.charAt(0).toUpperCase() + tipo.slice(1)
        };
    }).slice(0, 4);

    var casoItems = _seCountBy(results, function(result) {
        var caso = result.casoVinculado;
        if (!caso || !caso.id) return null;
        return {
            value: caso.id,
            label: _seShortCasoLabel(caso)
        };
    }).slice(0, 4);

    function renderFacetButtons(items, group, activeValue) {
        if (!items.length) return '';
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var active = activeValue === item.value ? ' active' : '';
            html += '<button class="se-facet-btn' + active + '" type="button" data-facet-group="' + group + '" data-facet-value="' + _escHtml(item.value) + '">' +
                '<span class="se-facet-text">' + _escHtml(item.label) + '</span>' +
                '<span class="se-facet-count">' + item.count + '</span>' +
                '</button>';
        }
        return html;
    }

    var hasFilters = !!((params.query && params.query.trim()) || params.fuente !== 'all' || params.caso !== 'all' || params.tipo !== 'all');

    return '<div class="se-facets">' +
        '<div class="se-facets-head">' +
        '<div>' +
        '<div class="se-facets-title">Facetas dinámicas</div>' +
        '<div class="se-facets-subtitle">Ajusta la búsqueda según lo que ya está emergiendo en los resultados.</div>' +
        '</div>' +
        (hasFilters ? '<button class="se-facets-reset" type="button" data-facet-reset="1">Limpiar búsqueda</button>' : '') +
        '</div>' +
        (fuenteItems.length ? '<div class="se-facet-group"><div class="se-facet-label">Fuentes dominantes</div><div class="se-facet-items">' + renderFacetButtons(fuenteItems, 'fuente', params.fuente) + '</div></div>' : '') +
        (tipoItems.length ? '<div class="se-facet-group"><div class="se-facet-label">Tipos de fricción</div><div class="se-facet-items">' + renderFacetButtons(tipoItems, 'tipo', params.tipo) + '</div></div>' : '') +
        (casoItems.length ? '<div class="se-facet-group"><div class="se-facet-label">Casos vinculados</div><div class="se-facet-items">' + renderFacetButtons(casoItems, 'caso', params.caso) + '</div></div>' : '') +
        '</div>';
}

/* ─── UI CONTROLLER ─── */

/**
 * Inicializa el buscador en el DOM
 * @param {Object} opts
 * @param {Object[]} opts.registros
 * @param {Object[]} opts.casos
 */
function initSearchUI(opts) {
    var engine = new FrictionSearchEngine(opts);
    var onResults = opts && typeof opts.onResults === 'function' ? opts.onResults : null;
    var onResultClick = opts && typeof opts.onResultClick === 'function' ? opts.onResultClick : null;

    var searchInput = document.getElementById('se-search-input');
    var fuenteFilter = document.getElementById('se-filter-fuente');
    var casoFilter = document.getElementById('se-filter-caso');
    var tipoFilter = document.getElementById('se-filter-tipo');
    var facetsContainer = document.getElementById('se-facets-panel');
    var resultsContainer = document.getElementById('se-results');
    var statsContainer = document.getElementById('se-stats-panel');
    var lastResultsById = Object.create(null);
    var selectedResultId = null;

    if (!searchInput || !resultsContainer) return;

    _seMountSuggestions(searchInput, opts.registros || [], opts.casos || []);

    function doSearch() {
        var params = {
            query: searchInput.value,
            fuente: fuenteFilter ? fuenteFilter.value : 'all',
            caso: casoFilter ? casoFilter.value : 'all',
            tipo: tipoFilter ? tipoFilter.value : 'all'
        };

        var results = engine.search(params);
        var stats = engine.getStats(results);
        lastResultsById = Object.create(null);
        for (var x = 0; x < results.length; x++) {
            var rid = (results[x].registro && results[x].registro.id) || ('__idx_' + x);
            lastResultsById[rid] = results[x];
        }

        // Render stats
        if (statsContainer) {
            statsContainer.innerHTML = renderSearchStats(stats);
        }

        if (facetsContainer) {
            facetsContainer.innerHTML = renderSearchFacets(results, params);
        }

        // Render results
        var html = '';
        for (var i = 0; i < results.length; i++) {
            html += renderSearchCard(results[i], params);
        }
        resultsContainer.innerHTML = html || '<div class="se-no-results">No se encontraron registros. Intenta: buscar un término general (ej. "territorio"), quitar filtros, o explorar los campos en la sección anterior.</div>';

        if (selectedResultId) {
            var selectedCard = resultsContainer.querySelector('.se-card[data-result-id="' + selectedResultId + '"]');
            if (selectedCard) selectedCard.classList.add('se-card--selected');
        }

        if (onResults) {
            try {
                onResults({
                    params: params,
                    results: results,
                    stats: stats
                });
            } catch (err) {
                console.warn('onResults callback failed:', err);
            }
        }

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('ca:search-results', {
                detail: {
                    params: params,
                    stats: stats,
                    total: results.length
                }
            }));
        }
    }

    // Debounced search on input
    var debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSearch, 250);
    });

    // Filter changes
    if (fuenteFilter) fuenteFilter.addEventListener('change', doSearch);
    if (casoFilter) casoFilter.addEventListener('change', doSearch);
    if (tipoFilter) tipoFilter.addEventListener('change', doSearch);

    if (facetsContainer) {
        facetsContainer.addEventListener('click', function(evt) {
            var target = evt.target;
            if (!target) return;

            var resetBtn = target.closest ? target.closest('[data-facet-reset="1"]') : null;
            if (resetBtn) {
                searchInput.value = '';
                if (fuenteFilter) fuenteFilter.value = 'all';
                if (casoFilter) casoFilter.value = 'all';
                if (tipoFilter) tipoFilter.value = 'all';
                selectedResultId = null;
                doSearch();
                return;
            }

            var facetBtn = target.closest ? target.closest('.se-facet-btn') : null;
            if (!facetBtn) return;

            var group = facetBtn.getAttribute('data-facet-group') || '';
            var value = facetBtn.getAttribute('data-facet-value') || 'all';
            selectedResultId = null;

            if (group === 'fuente' && fuenteFilter) {
                fuenteFilter.value = fuenteFilter.value === value ? 'all' : value;
            } else if (group === 'caso' && casoFilter) {
                casoFilter.value = casoFilter.value === value ? 'all' : value;
            } else if (group === 'tipo' && tipoFilter) {
                tipoFilter.value = tipoFilter.value === value ? 'all' : value;
            }

            doSearch();
        });
    }

    resultsContainer.addEventListener('click', function(evt) {
        var target = evt.target;
        if (!target) return;

        if (target.closest && target.closest('.se-card-link')) {
            return;
        }

        var card = target.closest ? target.closest('.se-card') : null;
        if (!card) return;

        var resultId = card.getAttribute('data-result-id') || '';
        var selected = lastResultsById[resultId];
        if (!selected) return;

        selectedResultId = resultId;
        var cards = resultsContainer.querySelectorAll('.se-card');
        for (var c = 0; c < cards.length; c++) cards[c].classList.remove('se-card--selected');
        card.classList.add('se-card--selected');

        if (onResultClick) {
            try {
                onResultClick(selected, {
                    resultId: resultId,
                    event: evt
                });
            } catch (err) {
                console.warn('onResultClick callback failed:', err);
            }
        }
    });

    // Initial render
    doSearch();
}

/* ─── EXPORTS ─── */
if (typeof window !== 'undefined') {
    window.FrictionSearchEngine = FrictionSearchEngine;
    window.initSearchUI = initSearchUI;
    window.normalizeBcnDataset = normalizeBcnDataset;
}