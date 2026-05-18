/**
 * exportPipeline.test.js — Tests for src/exportPipeline.js
 *
 * exportPipeline functions interact with the DOM (modal creation, download blobs).
 * Tests focus on data-processing logic that can be verified without a real browser.
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData, fuentesData) {

    var ep = window.exportPipeline;

    /* ─── module availability ─── */

    describe('exportPipeline.module', function () {
        it('is exposed on window.exportPipeline', function () {
            assert(ep && typeof ep === 'object', 'exportPipeline not exposed on window');
        });

        it('exposes buildEvidenceCard', function () {
            assert(typeof ep.buildEvidenceCard === 'function', 'buildEvidenceCard missing');
        });

        it('exposes buildActorMap', function () {
            assert(typeof ep.buildActorMap === 'function', 'buildActorMap missing');
        });

        it('exposes buildAcademicExport', function () {
            assert(typeof ep.buildAcademicExport === 'function', 'buildAcademicExport missing');
        });
    });

    /* ─── buildActorMap (DOM side-effects allowed; we check it does not throw) ─── */

    describe('exportPipeline.buildActorMap', function () {
        var casos = casosData.casos;
        var registros = fuentesData.registros || [];

        it('does not throw with real dataset', function () {
            ep.buildActorMap(casos, registros);
        });

        it('does not throw with empty casos array', function () {
            ep.buildActorMap([], []);
        });

        it('does not throw with null registros', function () {
            ep.buildActorMap(casos, null);
        });

        it('does not throw when a caso has no actores field', function () {
            ep.buildActorMap([{ id: 'x', titulo: 'Test', instituciones: ['Inst A'] }], []);
        });

        it('does not throw when a caso has no instituciones field', function () {
            ep.buildActorMap([{ id: 'y', titulo: 'Test', actores: ['Actor A'] }], []);
        });

        it('does not throw when registros have actores_lobby referencing unknown casos', function () {
            ep.buildActorMap([], [{ actores_lobby: ['Actor X'], friccion_con: ['nonexistent'], fuente: 'infolobby' }]);
        });
    });

    /* ─── buildAcademicExport ─── */

    describe('exportPipeline.buildAcademicExport', function () {
        var casos = casosData.casos;
        var registros = fuentesData.registros || [];

        it('does not throw with formato="csv"', function () {
            ep.buildAcademicExport(casos, registros, 'csv');
        });

        it('does not throw with formato="json"', function () {
            ep.buildAcademicExport(casos, registros, 'json');
        });

        it('does not throw with formato="both"', function () {
            ep.buildAcademicExport(casos, registros, 'both');
        });

        it('does not throw when formato is omitted (defaults to "both")', function () {
            ep.buildAcademicExport(casos, registros);
        });

        it('does not throw with empty casos and registros', function () {
            ep.buildAcademicExport([], []);
        });

        it('does not throw with null registros', function () {
            ep.buildAcademicExport(casos, null, 'csv');
        });
    });

    /* ─── buildEvidenceCard ─── */

    describe('exportPipeline.buildEvidenceCard', function () {
        var caso = casosData.casos[0];
        var registros = fuentesData.registros || [];

        it('does not throw with a real caso', function () {
            ep.buildEvidenceCard(caso, registros);
        });

        it('does not throw with an empty caso object', function () {
            ep.buildEvidenceCard({}, []);
        });

        it('does not throw with null registros', function () {
            ep.buildEvidenceCard(caso, null);
        });
    });
};
