/**
 * sourceNormalizers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizadores canónicos para integrar proveedores externos al buscador.
 *
 * Mantiene un esquema común:
 * id, fuente, titulo, fecha, url, institucion, materia, keywords,
 * capa_oficial, friccion_con, tipo_friccion, tags,
 * published_at, fetched_at, verificado, official_score, evidencia_tipo
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

function _snArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return [value];
}

function _snNormalizeKeywords(list) {
    var seen = Object.create(null);
    var normalized = [];
    var items = _snArray(list);

    for (var i = 0; i < items.length; i++) {
        var item = String(items[i]).trim().toLowerCase();
        if (!item) continue;
        if (seen[item]) continue;
        seen[item] = true;
        normalized.push(item);
    }

    return normalized;
}

function _snCanonicalRecord(base) {
    return {
        id: base.id || '',
        fuente: base.fuente || '',
        titulo: base.titulo || '',
        fecha: base.fecha || base.published_at || '',
        url: base.url || '',
        institucion: base.institucion || '',
        materia: base.materia || '',
        keywords: _snNormalizeKeywords(base.keywords),
        capa_oficial: base.capa_oficial || '',
        friccion_con: base.friccion_con || 'periodismo-datos-chile',
        tipo_friccion: base.tipo_friccion || 'semantica',
        tags: _snArray(base.tags),
        published_at: base.published_at || base.fecha || '',
        fetched_at: base.fetched_at || '',
        verificado: Boolean(base.verificado),
        official_score: typeof base.official_score === 'number' ? base.official_score : 0,
        evidencia_tipo: base.evidencia_tipo || ''
    };
}

function normalizeScieloRecord(raw) {
    raw = raw || {};
    return _snCanonicalRecord({
        id: raw.id || raw.pid || raw.doi || '',
        fuente: 'scielo',
        titulo: raw.titulo || raw.title || '',
        fecha: raw.fecha || raw.published_at || '',
        url: raw.url || raw.link || '',
        institucion: raw.revista || raw.journal || 'SciELO',
        materia: raw.resumen || raw.abstract || '',
        keywords: (raw.keywords || []).concat(raw.temas || []),
        capa_oficial: raw.capa_oficial || 'Producción académica indexada para contraste metodológico.',
        friccion_con: raw.friccion_con || 'periodismo-datos-chile',
        tipo_friccion: raw.tipo_friccion || 'semantica',
        tags: (raw.tags || []).concat(['SciELO', 'artículo académico']),
        published_at: raw.published_at || raw.fecha || '',
        fetched_at: raw.fetched_at || '',
        verificado: raw.verificado !== false,
        official_score: typeof raw.official_score === 'number' ? raw.official_score : 0.74,
        evidencia_tipo: 'academica'
    });
}

function normalizeDiarioOficialRecord(raw) {
    raw = raw || {};
    return _snCanonicalRecord({
        id: raw.id || raw.edicion || raw.norma_id || '',
        fuente: 'diariooficial',
        titulo: raw.titulo || raw.materia || '',
        fecha: raw.fecha_publicacion || raw.fecha || '',
        url: raw.url || '',
        institucion: raw.institucion || 'Diario Oficial de la República de Chile',
        materia: raw.materia || raw.extracto || '',
        keywords: (raw.keywords || []).concat([raw.norma_tipo, raw.numero_norma]),
        capa_oficial: raw.capa_oficial || 'Publicación normativa oficial con efectos jurídicos vigentes.',
        friccion_con: raw.friccion_con || 'oit169-consulta-previa',
        tipo_friccion: raw.tipo_friccion || 'politica',
        tags: (raw.tags || []).concat(['Diario Oficial', 'normativa']),
        published_at: raw.fecha_publicacion || raw.fecha || '',
        fetched_at: raw.fetched_at || '',
        verificado: raw.verificado !== false,
        official_score: typeof raw.official_score === 'number' ? raw.official_score : 0.92,
        evidencia_tipo: 'oficial'
    });
}

function normalizeAnySourceRecord(raw) {
    if (!raw || !raw.fuente) return _snCanonicalRecord(raw || {});
    if (raw.fuente === 'scielo') return normalizeScieloRecord(raw);
    if (raw.fuente === 'diariooficial') return normalizeDiarioOficialRecord(raw);
    return _snCanonicalRecord(raw);
}

if (typeof window !== 'undefined') {
    window.normalizeScieloRecord = normalizeScieloRecord;
    window.normalizeDiarioOficialRecord = normalizeDiarioOficialRecord;
    window.normalizeAnySourceRecord = normalizeAnySourceRecord;
}
