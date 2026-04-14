/**
 * searchEngine.test.js — Tests for src/searchEngine.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData, fuentesData, bcnData) {

    /* ─── _seNormalize (via FrictionSearchEngine internal — tested via search behavior) ─── */

    /* ─── normalizeBcnDataset ─── */

    describe('searchEngine.normalizeBcnDataset', function () {
        it('is exported as a function', function () {
            assertEqual(typeof window.normalizeBcnDataset, 'function');
        });

        it('normalizes BCN boletines into registro format', function () {
            var result = window.normalizeBcnDataset(bcnData);
            assert(Array.isArray(result), 'should return an array');
            assertGreaterThan(result.length, 0, 'should produce registros');
        });

        it('each normalized registro has required fields', function () {
            var result = window.normalizeBcnDataset(bcnData);
            for (var i = 0; i < result.length; i++) {
                var r = result[i];
                assert(typeof r.id === 'string', 'registro.id should be string');
                assertEqual(r.fuente, 'bcn', 'fuente should be bcn');
                assert(typeof r.titulo === 'string', 'registro.titulo should be string');
                assert(Array.isArray(r.keywords), 'registro.keywords should be array');
                assert(Array.isArray(r.tags), 'registro.tags should be array');
                assertArrayIncludes(r.tags, 'BCN', 'tags should include BCN');
            }
        });

        it('preserves boletin number', function () {
            var result = window.normalizeBcnDataset(bcnData);
            var first = result[0];
            assert(typeof first.boletin === 'string', 'should preserve boletin');
        });

        it('builds metadatos_legislativos object', function () {
            var result = window.normalizeBcnDataset(bcnData);
            var first = result[0];
            assert('metadatos_legislativos' in first, 'should have metadatos_legislativos');
            assert(Array.isArray(first.metadatos_legislativos.comisiones), 'comisiones should be array');
            assert(Array.isArray(first.metadatos_legislativos.urgencias), 'urgencias should be array');
        });

        it('handles empty dataset', function () {
            var result = window.normalizeBcnDataset({});
            assertEqual(result.length, 0, 'empty dataset should produce no registros');
        });

        it('handles null input', function () {
            var result = window.normalizeBcnDataset(null);
            assertEqual(result.length, 0, 'null should produce no registros');
        });

        it('flattens urgencias into keywords', function () {
            var result = window.normalizeBcnDataset(bcnData);
            // Urgencias from the first boletin should appear in keywords
            var first = result[0];
            var kw = first.keywords.join(' ').toLowerCase();
            // BCN boletines have urgencias as objects with tipo field
            assert(kw.length > 0, 'keywords should be non-empty');
        });
    });

    /* ─── FrictionSearchEngine constructor ─── */

    describe('FrictionSearchEngine constructor', function () {
        it('is exported as a function', function () {
            assertEqual(typeof window.FrictionSearchEngine, 'function');
        });

        it('creates instance with registros and casos', function () {
            var engine = new window.FrictionSearchEngine({
                registros: fuentesData,
                casos: casosData.casos
            });
            assertEqual(engine.registros.length, fuentesData.length);
            assertEqual(engine.casos.length, casosData.casos.length);
        });

        it('builds internal caso map by id', function () {
            var engine = new window.FrictionSearchEngine({
                registros: fuentesData,
                casos: casosData.casos
            });
            for (var i = 0; i < casosData.casos.length; i++) {
                var caso = casosData.casos[i];
                assert(engine._casoMap[caso.id] === caso,
                    'casoMap should contain caso ' + caso.id);
            }
        });

        it('handles empty options', function () {
            var engine = new window.FrictionSearchEngine({});
            assertEqual(engine.registros.length, 0);
            assertEqual(engine.casos.length, 0);
        });
    });

    /* ─── FrictionSearchEngine.search ─── */

    describe('FrictionSearchEngine.search', function () {
        var engine;

        engine = new window.FrictionSearchEngine({
            registros: fuentesData.concat(window.normalizeBcnDataset(bcnData)),
            casos: casosData.casos
        });

        it('returns all registros with empty query and no filters', function () {
            var results = engine.search({});
            assertEqual(results.length, engine.registros.length,
                'empty search should return all');
        });

        it('each result has required structure', function () {
            var results = engine.search({});
            for (var i = 0; i < Math.min(results.length, 5); i++) {
                var r = results[i];
                assert('registro' in r, 'result should have registro');
                assert('relevance' in r, 'result should have relevance');
                assert('frictionScore' in r, 'result should have frictionScore');
                assert('frictionAudit' in r, 'result should have frictionAudit');
                assert('casoVinculado' in r, 'result should have casoVinculado');
            }
        });

        it('filters by fuente', function () {
            var results = engine.search({ fuente: 'infolobby' });
            for (var i = 0; i < results.length; i++) {
                assertEqual(results[i].registro.fuente, 'infolobby',
                    'all results should be from infolobby');
            }
        });

        it('filters by caso', function () {
            var results = engine.search({ caso: 'sura-gobernanza-datos' });
            for (var i = 0; i < results.length; i++) {
                assertEqual(results[i].registro.friccion_con, 'sura-gobernanza-datos',
                    'all results should link to sura-gobernanza-datos');
            }
        });

        it('filters by tipo de fricción', function () {
            var results = engine.search({ tipo: 'semantica' });
            for (var i = 0; i < results.length; i++) {
                assertEqual(results[i].registro.tipo_friccion, 'semantica',
                    'all results should have tipo semantica');
            }
        });

        it('combines text query with filters', function () {
            var all = engine.search({ fuente: 'infolobby' });
            var withQuery = engine.search({ fuente: 'infolobby', query: 'CMF regulación' });
            // With a query, we may get fewer or equal results (relevance threshold)
            assertLessThan(withQuery.length, all.length + 1, 'filtered+query should not exceed filtered');
        });

        it('sorts by relevance then friction score', function () {
            var results = engine.search({ query: 'regulación AFP' });
            // The search engine sorts by relevance first (with a 0.1 bucket tolerance)
            // then by friction score within the same bucket
            var RELEVANCE_BUCKET_TOLERANCE = 0.11;
            for (var i = 1; i < results.length; i++) {
                var prev = results[i - 1];
                var curr = results[i];
                var ok = prev.relevance >= curr.relevance - RELEVANCE_BUCKET_TOLERANCE;
                assert(ok, 'results should be sorted by relevance then friction');
            }
        });

        it('returns casoVinculado when friction_con matches a caso', function () {
            var results = engine.search({});
            var linked = results.filter(function (r) { return r.casoVinculado !== null; });
            assertGreaterThan(linked.length, 0, 'some results should have casoVinculado');
            for (var i = 0; i < linked.length; i++) {
                assertEqual(linked[i].casoVinculado.id, linked[i].registro.friccion_con,
                    'casoVinculado.id should match friccion_con');
            }
        });

        it('frictionScore is between 0.05 and 1.0', function () {
            var results = engine.search({});
            for (var i = 0; i < results.length; i++) {
                assertGreaterThan(results[i].frictionScore, 0.04, 'frictionScore >= 0.05');
                assertLessThan(results[i].frictionScore, 1.01, 'frictionScore <= 1.0');
            }
        });

        it('text search is case-insensitive and accent-insensitive', function () {
            var r1 = engine.search({ query: 'REGULACIÓN' });
            var r2 = engine.search({ query: 'regulacion' });
            // Should return similar results
            assertEqual(r1.length, r2.length, 'accent-insensitive: result counts should match');
        });
    });

    /* ─── FrictionSearchEngine.getStats ─── */

    describe('FrictionSearchEngine.getStats', function () {
        var engine = new window.FrictionSearchEngine({
            registros: fuentesData,
            casos: casosData.casos
        });

        it('returns zero stats for empty results', function () {
            var stats = engine.getStats([]);
            assertEqual(stats.total, 0);
            assertEqual(stats.avgFriction, 0);
        });

        it('returns correct total count', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            assertEqual(stats.total, results.length, 'total should match results length');
        });

        it('computes average friction', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            assertGreaterThan(stats.avgFriction, 0, 'average friction should be > 0');
            assertLessThan(stats.avgFriction, 1.01, 'average friction should be <= 1');
        });

        it('breaks down by fuente', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            var total = 0;
            var fuentes = Object.keys(stats.byFuente);
            for (var i = 0; i < fuentes.length; i++) {
                total += stats.byFuente[fuentes[i]];
            }
            assertEqual(total, stats.total, 'byFuente counts should sum to total');
        });

        it('breaks down by tipo', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            var total = 0;
            var tipos = Object.keys(stats.byTipo);
            for (var i = 0; i < tipos.length; i++) {
                total += stats.byTipo[tipos[i]];
            }
            assertEqual(total, stats.total, 'byTipo counts should sum to total');
        });

        it('computes component averages', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            assert('overlap' in stats.components, 'should have overlap component');
            assert('marker' in stats.components, 'should have marker component');
            assert('tipo' in stats.components, 'should have tipo component');
        });

        it('computes markerActivationRate', function () {
            var results = engine.search({});
            var stats = engine.getStats(results);
            assert(typeof stats.markerActivationRate === 'number',
                'markerActivationRate should be a number');
            assertGreaterThan(stats.markerActivationRate, -0.01);
            assertLessThan(stats.markerActivationRate, 1.01);
        });
    });
};
