/**
 * lib/corpusCitasStore.js — Almacén unificado de citas del corpus físico
 * Migra sin pérdida desde corpusBookCitations, zuboffCitations y contraarchivoLecturas.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'corpusCitas';
    var MIGRATION_KEY = 'corpusCitasMigrationV1';
    var LEGACY_ZUBOFF = 'corpusBookCitations';
    var LEGACY_ZUBOFF_OLD = 'zuboffCitations';
    var LEGACY_LECTURAS = 'contraarchivoLecturas';

    var LECTURAS_CATEGORY_MAP = {
        'marco-teorico': 'metodologia',
        'concepto-clave': 'poder_epistemico',
        'evidencia-dato': 'extraccion_datos',
        'critica-tension': 'regimenes_verdad',
        'mistranslation': 'metodologia',
        'practica-informal': 'regimenes_verdad',
        'instituciones': 'vigilancia_inst',
        'metodologia': 'metodologia',
        'notas-campo': 'metodologia',
        'conexion-caso': 'metodologia',
        'poesia': 'hogar',
    };

    function safeParse(raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function readLegacyList(key) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return [];
            var parsed = safeParse(raw);
            if (!parsed) return [];
            if (Array.isArray(parsed)) return parsed;
            if (Array.isArray(parsed.citas)) return parsed.citas;
            if (Array.isArray(parsed.citations)) return parsed.citations;
            return [];
        } catch (e) {
            return [];
        }
    }

    function mapLecturasCategory(cat) {
        if (!cat) return 'metodologia';
        return LECTURAS_CATEGORY_MAP[cat] || cat.replace(/-/g, '_');
    }

    function normalizeId(id) {
        if (id === undefined || id === null || id === '') {
            return 'cc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
        }
        return id;
    }

    function normalizeFromLecturas(c) {
        if (!c) return null;
        var text = String(c.texto || c.text || '').trim();
        if (!text) return null;
        return {
            id: normalizeId(c.id),
            bookTitle: String(c.fuente || c.libro || c.bookTitle || 'Libro no identificado').trim(),
            author: String(c.autor || c.author || '').trim(),
            pageNo: c.pagina != null && c.pagina !== '' ? Number(c.pagina) : (c.pageNo != null ? c.pageNo : ''),
            text: text,
            color: String(c.color || 'yellow').trim(),
            category: mapLecturasCategory(c.categoria || c.category),
            notes: String(c.notas || c.notes || c.contexto || '').trim(),
            clave: c.clave === 'A' ? 'A' : 'B',
            libro_id: c.libro_id || '',
            timestamp: c.timestamp || (c.fecha ? c.fecha + 'T12:00:00.000Z' : new Date().toISOString()),
            _source: 'lecturas',
        };
    }

    function normalizeFromZuboff(c) {
        if (!c) return null;
        var out = Object.assign({}, c);
        if (!out.text && out.texto) out.text = out.texto;
        if ((out.pageNo === undefined || out.pageNo === '') && out.pagina != null) {
            out.pageNo = Number(out.pagina);
        }
        if (!out.category && out.categoria) out.category = out.categoria;
        if (!out.notes && out.notas) out.notes = out.notas;
        out.id = normalizeId(out.id);
        out.bookTitle = String(out.bookTitle || out.libro || 'Libro no identificado').trim();
        out.author = String(out.author || out.autor || '').trim();
        out.text = String(out.text || '').trim();
        out.notes = String(out.notes || '').trim();
        out.color = String(out.color || 'yellow').trim();
        out.category = String(out.category || 'metodologia').trim();
        out.pageNo = Number.isFinite(Number(out.pageNo)) ? Number(out.pageNo) : '';
        out.clave = out.clave === 'A' ? 'A' : 'B';
        out.libro_id = out.libro_id || '';
        out.timestamp = out.timestamp || new Date().toISOString();
        out._source = out._source || 'local';
        if (!out.text) return null;
        return out;
    }

    function dedupeKey(c) {
        return [
            String(c.text || '').trim().toLowerCase(),
            String(c.bookTitle || '').trim().toLowerCase(),
            String(c.pageNo != null ? c.pageNo : ''),
        ].join('|');
    }

    function read() {
        var list = readLegacyList(STORAGE_KEY);
        return list.map(normalizeFromZuboff).filter(Boolean);
    }

    function persist(list) {
        var normalized = (list || []).map(normalizeFromZuboff).filter(Boolean);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function mergeLists(targetMap, list, normalizer) {
        (list || []).forEach(function (item) {
            var norm = normalizer(item);
            if (!norm) return;
            var byId = targetMap.get(String(norm.id));
            if (byId) {
                targetMap.set(String(norm.id), Object.assign({}, byId, norm));
                return;
            }
            var dk = dedupeKey(norm);
            var duplicate = false;
            targetMap.forEach(function (existing) {
                if (!duplicate && dedupeKey(existing) === dk) duplicate = true;
            });
            if (!duplicate) targetMap.set(String(norm.id), norm);
        });
    }

    function migrateLegacy() {
        var merged = new Map();
        mergeLists(merged, read(), normalizeFromZuboff);
        mergeLists(merged, readLegacyList(LEGACY_ZUBOFF), normalizeFromZuboff);
        mergeLists(merged, readLegacyList(LEGACY_ZUBOFF_OLD), normalizeFromZuboff);
        mergeLists(merged, readLegacyList(LEGACY_LECTURAS), normalizeFromLecturas);

        var result = persist(Array.from(merged.values()));
        localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
        return {
            total: result.length,
            migrated: true,
        };
    }

    function ensureMigrated() {
        if (!localStorage.getItem(MIGRATION_KEY)) {
            return migrateLegacy();
        }
        return { total: read().length, migrated: false };
    }

    function clearLocal(keepMigration) {
        localStorage.removeItem(STORAGE_KEY);
        if (!keepMigration) {
            localStorage.removeItem(MIGRATION_KEY);
        }
    }

    window.CorpusCitasStore = {
        STORAGE_KEY: STORAGE_KEY,
        MIGRATION_KEY: MIGRATION_KEY,
        LEGACY_KEYS: [LEGACY_ZUBOFF, LEGACY_ZUBOFF_OLD, LEGACY_LECTURAS],
        read: read,
        persist: persist,
        migrateLegacy: migrateLegacy,
        ensureMigrated: ensureMigrated,
        normalizeFromLecturas: normalizeFromLecturas,
        normalizeFromZuboff: normalizeFromZuboff,
        clearLocal: clearLocal,
    };
})();