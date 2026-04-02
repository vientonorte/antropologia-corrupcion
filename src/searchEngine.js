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
    infolobby: '🏛',
    transparencia: '🔍',
    leychile: '⚖',
    seia: '🌿',
    compraspublicas: '📋',
    cmf: '💹'
};

var FUENTE_LABELS = {
    infolobby: 'InfoLobby',
    transparencia: 'Transparencia',
    leychile: 'LeyChile',
    seia: 'SEIA',
    compraspublicas: 'ComprasPúblicas',
    cmf: 'CMF'
};

var FUENTE_COLORS = {
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
    if (!caso) return 0.5;

    // Keywords del registro
    var regKw = (registro.keywords || []);

    // Keywords combinados de las 3 capas del caso
    var casoKw = []
        .concat(caso.etica ? caso.etica.keywords || [] : [])
        .concat(caso.institucional ? caso.institucional.keywords || [] : [])
        .concat(caso.material ? caso.material.keywords || [] : []);

    // 1. Keyword overlap (bajo overlap = alta fricción)
    var overlap = _seJaccard(regKw, casoKw);
    var overlapScore = 1 - Math.min(overlap * 6, 1); // amplificar overlaps pequeños

    // 2. Marker match: buscar si keywords del registro activan FRICTION_MARKERS
    var markerScore = 0;
    if (window.frictionEngine && window.frictionEngine.FRICTION_TYPES) {
        var normRegKw = regKw.map(_seNormalize);
        var normCasoKw = casoKw.map(_seNormalize);
        var MARKERS = [
            { a: 'consentimiento', b: 'proceso administrativo', peso: 0.9 },
            { a: 'consulta', b: 'tramite', peso: 0.85 },
            { a: 'territorio', b: 'catastro', peso: 0.88 },
            { a: 'memoria', b: 'clasificacion', peso: 0.75 },
            { a: 'autonomia', b: 'regulacion', peso: 0.72 },
            { a: 'testimonio', b: 'resolucion', peso: 0.8 },
            { a: 'soberania', b: 'CONADI', peso: 0.9 },
            { a: 'resistencia', b: 'admisibilidad', peso: 0.85 },
            { a: 'evidencia', b: 'dato', peso: 0.65 },
            { a: 'deforestacion', b: 'uso productivo', peso: 0.88 },
            { a: 'opacidad', b: 'transparencia', peso: 0.82 },
            { a: 'whistleblower', b: 'proceso regular', peso: 0.78 }
        ];
        for (var m = 0; m < MARKERS.length; m++) {
            var mk = MARKERS[m];
            var hasA = normRegKw.some(function(k) { return k.indexOf(mk.a) !== -1; });
            var hasB = normCasoKw.some(function(k) { return k.indexOf(mk.b) !== -1; });
            var hasCross = normRegKw.some(function(k) { return k.indexOf(mk.b) !== -1; }) &&
                normCasoKw.some(function(k) { return k.indexOf(mk.a) !== -1; });
            if ((hasA && hasB) || hasCross) {
                markerScore = Math.max(markerScore, mk.peso);
            }
        }
    }

    // 3. Tipo penalty: bonus si el tipo de fricción del registro coincide con el del caso
    var tipoPenalty = 0;
    if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.tipo) {
        tipoPenalty = 0.3;
    } else if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.subtipo) {
        tipoPenalty = 0.15;
    }

    var score = 0.5 * overlapScore + 0.3 * markerScore + 0.2 * tipoPenalty;
    return Math.min(Math.max(parseFloat(score.toFixed(3)), 0.05), 1.0);
}

/* ─── MOTOR DE BÚSQUEDA ─── */

/**
 * @typedef {Object} SearchResult
 * @property {Object} registro - El registro de fuente oficial
 * @property {number} relevance - Relevancia del texto (0-1)
 * @property {number} frictionScore - Score de fricción con el caso vinculado
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
        var frictionScore = computeFrictionScore(reg, caso);

        results.push({
            registro: reg,
            relevance: relevance,
            frictionScore: frictionScore,
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
    if (!results.length) return { total: 0, avgFriction: 0, byFuente: {}, byTipo: {} };

    var sum = 0;
    var byFuente = {};
    var byTipo = {};

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        sum += r.frictionScore;

        var f = r.registro.fuente;
        byFuente[f] = (byFuente[f] || 0) + 1;

        var t = r.registro.tipo_friccion;
        byTipo[t] = (byTipo[t] || 0) + 1;
    }

    return {
        total: results.length,
        avgFriction: parseFloat((sum / results.length).toFixed(3)),
        byFuente: byFuente,
        byTipo: byTipo
    };
};

/* ─── RENDERING ─── */

/**
 * Genera el HTML de una tarjeta de resultado
 */
function renderSearchCard(result) {
    var reg = result.registro;
    var score = result.frictionScore;
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

    var html = '<article class="se-card" data-fuente="' + fuente + '" data-score="' + score + '">' +
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
        '<div class="se-card-tags">' + tagsHtml + '</div>' +
        (reg.url ? '<a class="se-card-link" href="' + _escHtml(reg.url) + '" target="_blank" rel="noopener noreferrer">Ver fuente oficial ↗</a>' : '') +
        '</article>';

    return html;
}

/**
 * Genera HTML del panel de estadísticas
 */
function renderSearchStats(stats) {
    if (!stats.total) return '<div class="se-stats-empty">Sin resultados. Intenta con otro término o filtro.</div>';

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

    return '<div class="se-stats">' +
        '<div class="se-stats-summary">' +
        '<div class="se-stat-big"><span class="se-stat-num">' + stats.total + '</span><span class="se-stat-desc">registros</span></div>' +
        '<div class="se-stat-big"><span class="se-stat-num" style="color:' + avgColor + '">' + (stats.avgFriction * 100).toFixed(0) + '%</span><span class="se-stat-desc">fricción promedio</span></div>' +
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

/* ─── UI CONTROLLER ─── */

/**
 * Inicializa el buscador en el DOM
 * @param {Object} opts
 * @param {Object[]} opts.registros
 * @param {Object[]} opts.casos
 */
function initSearchUI(opts) {
    var engine = new FrictionSearchEngine(opts);

    var searchInput = document.getElementById('se-search-input');
    var fuenteFilter = document.getElementById('se-filter-fuente');
    var casoFilter = document.getElementById('se-filter-caso');
    var tipoFilter = document.getElementById('se-filter-tipo');
    var resultsContainer = document.getElementById('se-results');
    var statsContainer = document.getElementById('se-stats-panel');

    if (!searchInput || !resultsContainer) return;

    function doSearch() {
        var params = {
            query: searchInput.value,
            fuente: fuenteFilter ? fuenteFilter.value : 'all',
            caso: casoFilter ? casoFilter.value : 'all',
            tipo: tipoFilter ? tipoFilter.value : 'all'
        };

        var results = engine.search(params);
        var stats = engine.getStats(results);

        // Render stats
        if (statsContainer) {
            statsContainer.innerHTML = renderSearchStats(stats);
        }

        // Render results
        var html = '';
        for (var i = 0; i < results.length; i++) {
            html += renderSearchCard(results[i]);
        }
        resultsContainer.innerHTML = html || '<div class="se-no-results">No se encontraron registros.</div>';
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

    // Initial render
    doSearch();
}

/* ─── EXPORTS ─── */
if (typeof window !== 'undefined') {
    window.FrictionSearchEngine = FrictionSearchEngine;
    window.initSearchUI = initSearchUI;
}