/**
 * sourceNormalizers.test.js — Tests for src/sourceNormalizers.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes) {

    var sn = {
        normalizeScieloRecord:      window.normalizeScieloRecord,
        normalizeDiarioOficialRecord: window.normalizeDiarioOficialRecord,
        normalizeAnySourceRecord:   window.normalizeAnySourceRecord,
    };

    /* ─── canonical schema ─── */

    var CANONICAL_FIELDS = [
        'id', 'fuente', 'titulo', 'fecha', 'url', 'institucion',
        'materia', 'keywords', 'capa_oficial', 'friccion_con',
        'tipo_friccion', 'tags', 'published_at', 'fetched_at',
        'verificado', 'official_score', 'evidencia_tipo',
    ];

    function assertCanonicalSchema(record, label) {
        CANONICAL_FIELDS.forEach(function (field) {
            assert(field in record, (label || '') + ': missing canonical field "' + field + '"');
        });
    }

    /* ─── normalizeScieloRecord ─── */

    describe('sourceNormalizers.normalizeScieloRecord', function () {
        it('sets fuente to "scielo"', function () {
            assertEqual(sn.normalizeScieloRecord({}).fuente, 'scielo');
        });

        it('returns all canonical schema fields', function () {
            assertCanonicalSchema(sn.normalizeScieloRecord({}), 'empty input');
        });

        it('uses raw.titulo as titulo', function () {
            var r = sn.normalizeScieloRecord({ titulo: 'Mi artículo' });
            assertEqual(r.titulo, 'Mi artículo');
        });

        it('falls back to raw.title when titulo is absent', function () {
            var r = sn.normalizeScieloRecord({ title: 'Fallback title' });
            assertEqual(r.titulo, 'Fallback title');
        });

        it('uses raw.id, raw.pid, or raw.doi as id (in priority order)', function () {
            assertEqual(sn.normalizeScieloRecord({ id: 'A' }).id, 'A');
            assertEqual(sn.normalizeScieloRecord({ pid: 'B' }).id, 'B');
            assertEqual(sn.normalizeScieloRecord({ doi: 'C' }).id, 'C');
        });

        it('merges raw.keywords and raw.temas into keywords array', function () {
            var r = sn.normalizeScieloRecord({ keywords: ['alpha'], temas: ['beta'] });
            assertArrayIncludes(r.keywords, 'alpha');
            assertArrayIncludes(r.keywords, 'beta');
        });

        it('deduplicates keywords (case-insensitive)', function () {
            var r = sn.normalizeScieloRecord({ keywords: ['Alpha', 'alpha', 'ALPHA'] });
            assertEqual(r.keywords.length, 1);
            assertEqual(r.keywords[0], 'alpha');
        });

        it('converts keywords to lowercase', function () {
            var r = sn.normalizeScieloRecord({ keywords: ['UPPERCASE'] });
            assertArrayIncludes(r.keywords, 'uppercase');
        });

        it('appends SciELO and artículo académico to tags', function () {
            var r = sn.normalizeScieloRecord({ tags: ['custom'] });
            assertArrayIncludes(r.tags, 'SciELO');
            assertArrayIncludes(r.tags, 'artículo académico');
        });

        it('defaults verificado to true', function () {
            assertEqual(sn.normalizeScieloRecord({}).verificado, true);
        });

        it('respects explicit verificado=false', function () {
            assertEqual(sn.normalizeScieloRecord({ verificado: false }).verificado, false);
        });

        it('defaults official_score to 0.74', function () {
            assertApprox(sn.normalizeScieloRecord({}).official_score, 0.74, 0.0001);
        });

        it('respects explicit official_score', function () {
            assertApprox(sn.normalizeScieloRecord({ official_score: 0.9 }).official_score, 0.9, 0.0001);
        });

        it('sets evidencia_tipo to "academica"', function () {
            assertEqual(sn.normalizeScieloRecord({}).evidencia_tipo, 'academica');
        });

        it('defaults tipo_friccion to "semantica"', function () {
            assertEqual(sn.normalizeScieloRecord({}).tipo_friccion, 'semantica');
        });

        it('handles null input gracefully (treats as empty)', function () {
            assertCanonicalSchema(sn.normalizeScieloRecord(null));
        });

        it('uses raw.revista or raw.journal as institucion', function () {
            assertEqual(sn.normalizeScieloRecord({ revista: 'Revista A' }).institucion, 'Revista A');
            assertEqual(sn.normalizeScieloRecord({ journal: 'Journal B' }).institucion, 'Journal B');
        });

        it('defaults institucion to "SciELO" when not provided', function () {
            assertEqual(sn.normalizeScieloRecord({}).institucion, 'SciELO');
        });

        it('syncs fecha and published_at', function () {
            var r = sn.normalizeScieloRecord({ published_at: '2024-01-01' });
            assertEqual(r.fecha, '2024-01-01');
            assertEqual(r.published_at, '2024-01-01');
        });
    });

    /* ─── normalizeDiarioOficialRecord ─── */

    describe('sourceNormalizers.normalizeDiarioOficialRecord', function () {
        it('sets fuente to "diariooficial"', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({}).fuente, 'diariooficial');
        });

        it('returns all canonical schema fields', function () {
            assertCanonicalSchema(sn.normalizeDiarioOficialRecord({}), 'empty input');
        });

        it('uses id, edicion, or norma_id as id (in priority order)', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({ id: 'X' }).id, 'X');
            assertEqual(sn.normalizeDiarioOficialRecord({ edicion: 'E' }).id, 'E');
            assertEqual(sn.normalizeDiarioOficialRecord({ norma_id: 'N' }).id, 'N');
        });

        it('uses fecha_publicacion or fecha as fecha', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({ fecha_publicacion: '2023-05-01' }).fecha, '2023-05-01');
            assertEqual(sn.normalizeDiarioOficialRecord({ fecha: '2023-06-01' }).fecha, '2023-06-01');
        });

        it('uses titulo or materia as titulo', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({ titulo: 'Decreto 100' }).titulo, 'Decreto 100');
            assertEqual(sn.normalizeDiarioOficialRecord({ materia: 'Materia alternativa' }).titulo, 'Materia alternativa');
        });

        it('defaults official_score to 0.92', function () {
            assertApprox(sn.normalizeDiarioOficialRecord({}).official_score, 0.92, 0.0001);
        });

        it('defaults tipo_friccion to "politica"', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({}).tipo_friccion, 'politica');
        });

        it('appends Diario Oficial and normativa to tags', function () {
            var r = sn.normalizeDiarioOficialRecord({ tags: ['ley'] });
            assertArrayIncludes(r.tags, 'Diario Oficial');
            assertArrayIncludes(r.tags, 'normativa');
        });

        it('defaults institucion to Diario Oficial de la República de Chile', function () {
            assertEqual(
                sn.normalizeDiarioOficialRecord({}).institucion,
                'Diario Oficial de la República de Chile'
            );
        });

        it('defaults verificado to true', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({}).verificado, true);
        });

        it('handles null input gracefully', function () {
            assertCanonicalSchema(sn.normalizeDiarioOficialRecord(null));
        });

        it('sets evidencia_tipo to "oficial"', function () {
            assertEqual(sn.normalizeDiarioOficialRecord({}).evidencia_tipo, 'oficial');
        });

        it('includes norma_tipo and numero_norma in keywords when present', function () {
            var r = sn.normalizeDiarioOficialRecord({ norma_tipo: 'DFL', numero_norma: '42' });
            assertArrayIncludes(r.keywords, 'dfl');
            assertArrayIncludes(r.keywords, '42');
        });

        it('keywords array contains no empty or falsy entries', function () {
            // null norma_tipo and null numero_norma should be filtered out
            var r = sn.normalizeDiarioOficialRecord({ norma_tipo: null, numero_norma: undefined });
            r.keywords.forEach(function (kw) {
                assert(kw && kw.trim() !== '', 'keyword should not be empty or falsy');
            });
            // Empty string values should also be filtered
            var r2 = sn.normalizeDiarioOficialRecord({ norma_tipo: '', numero_norma: '   ' });
            r2.keywords.forEach(function (kw) {
                assert(kw && kw.trim() !== '', 'keyword should not be empty string');
            });
        });
    });

    /* ─── normalizeAnySourceRecord ─── */

    describe('sourceNormalizers.normalizeAnySourceRecord', function () {
        it('dispatches scielo records to normalizeScieloRecord', function () {
            var r = sn.normalizeAnySourceRecord({ fuente: 'scielo', titulo: 'Test' });
            assertEqual(r.fuente, 'scielo');
            assertEqual(r.evidencia_tipo, 'academica');
        });

        it('dispatches diariooficial records to normalizeDiarioOficialRecord', function () {
            var r = sn.normalizeAnySourceRecord({ fuente: 'diariooficial', titulo: 'Test' });
            assertEqual(r.fuente, 'diariooficial');
            assertEqual(r.evidencia_tipo, 'oficial');
        });

        it('falls back to canonical normalizer for unknown fuente', function () {
            var r = sn.normalizeAnySourceRecord({ fuente: 'custom', titulo: 'Custom record' });
            assertEqual(r.titulo, 'Custom record');
        });

        it('falls back to canonical normalizer when fuente is missing', function () {
            var r = sn.normalizeAnySourceRecord({ titulo: 'No fuente' });
            assert(typeof r.fuente === 'string', 'fuente should be a string');
        });

        it('handles null input gracefully', function () {
            assertCanonicalSchema(sn.normalizeAnySourceRecord(null));
        });

        it('handles empty object gracefully', function () {
            assertCanonicalSchema(sn.normalizeAnySourceRecord({}));
        });

        it('returns all canonical schema fields regardless of fuente', function () {
            ['scielo', 'diariooficial', 'cmf', 'infolobby', 'custom'].forEach(function (fuente) {
                var r = sn.normalizeAnySourceRecord({ fuente: fuente });
                assertCanonicalSchema(r, fuente);
            });
        });

        it('preserves explicit friccion_con when provided', function () {
            var r = sn.normalizeAnySourceRecord({ fuente: 'scielo', friccion_con: 'mi-caso' });
            assertEqual(r.friccion_con, 'mi-caso');
        });

        it('verificado is always a boolean', function () {
            [null, {}, { fuente: 'scielo' }, { fuente: 'diariooficial' }].forEach(function (input) {
                var r = sn.normalizeAnySourceRecord(input);
                assertEqual(typeof r.verificado, 'boolean');
            });
        });
    });
};
