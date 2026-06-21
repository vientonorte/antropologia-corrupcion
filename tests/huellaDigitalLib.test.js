/**
 * huellaDigitalLib.test.js — Pure-function tests for web/lib/huellaDigital.js
 */
'use strict';

module.exports = function (
    describe,
    it,
    assert,
    assertEqual,
    assertDeepEqual,
    assertApprox,
    assertGreaterThan,
    assertArrayIncludes,
    casosData,
    fuentesData,
    bcnData,
    huellaData,
) {
    var HD = window.CAHuellaDigital;

    describe('CAHuellaDigital — API surface', function () {
        it('exposes renderFromData and renderSidebarPreview', function () {
            assert(typeof HD.renderFromData === 'function', 'renderFromData');
            assert(typeof HD.renderSidebarPreview === 'function', 'renderSidebarPreview');
            assert(typeof HD.collectEvents === 'function', 'collectEvents');
            assert(typeof HD.recordMatches === 'function', 'recordMatches');
        });
    });

    describe('CAHuellaDigital — resolveContext', function () {
        it('resolves entidad by casoId', function () {
            var ctx = HD.resolveContext(
                { casoId: 'sura-gobernanza-datos' },
                huellaData,
                casosData.casos,
            );
            assert(ctx.caso, 'should resolve caso');
            assertEqual(ctx.caso.id, 'sura-gobernanza-datos');
            assert(ctx.entidad, 'should resolve linked entidad');
            assertEqual(ctx.entidad.id, 'ent-sura-investments');
        });

        it('resolves entidad by query alias', function () {
            var ctx = HD.resolveContext({ query: 'AFP UNO' }, huellaData, casosData.casos);
            assert(ctx.entidad, 'should match alias');
            assertEqual(ctx.entidad.nombre, 'SURA Investments');
        });
    });

    describe('CAHuellaDigital — collectEvents', function () {
        it('filters by registros_relacionados when entidad is known', function () {
            var entidad = HD.findEntidadForCaso(huellaData, 'sura-gobernanza-datos');
            var events = HD.collectEvents(
                [entidad.nombre],
                fuentesData,
                HD.normalizeBcnRecords(bcnData),
                entidad.registros_relacionados,
            );
            assertGreaterThan(events.length, 0, 'should find linked registros');
            events.forEach(function (ev) {
                assertArrayIncludes(entidad.registros_relacionados, ev.id, 'event id in entidad');
            });
        });
    });

    describe('CAHuellaDigital — renderFromData', function () {
        it('renders timeline HTML for caso sura', function () {
            var rendered = HD.renderFromData(
                {
                    huella: huellaData,
                    fuentes: fuentesData,
                    bcn: bcnData,
                    casos: casosData,
                },
                { casoId: 'sura-gobernanza-datos' },
            );
            assert(rendered.html.indexOf('ca-huella__timeline') !== -1, 'timeline markup');
            assert(rendered.html.indexOf('SURA') !== -1, 'entity label');
            assert(rendered.html.indexOf('index.html?caso=sura-gobernanza-datos') !== -1, 'grafo deep-link');
            assertGreaterThan(rendered.events.length, 0, 'events collected');
        });

        it('renders verification badges in timeline when present', function () {
            var bcnNorm = HD.normalizeBcnRecords(bcnData);
            var withVerif = bcnNorm.find(function (r) {
                return r.estado_verificacion;
            });
            if (!withVerif) return;
            var events = HD.collectEvents([withVerif.titulo], [], bcnNorm, null);
            var hasVerifEvent = events.some(function (e) {
                return e.estado_verificacion;
            });
            assert(hasVerifEvent, 'events carry estado_verificacion');
            var rendered = HD.renderFromData(
                {
                    huella: huellaData,
                    fuentes: fuentesData,
                    bcn: bcnData,
                    casos: casosData,
                },
                { query: withVerif.titulo.substring(0, 12) },
            );
            assert(
                rendered.html.indexOf('ca-huella__event-badges') !== -1 ||
                    rendered.html.indexOf('ca-bases-pill') !== -1,
                'badge markup in timeline',
            );
        });

        it('returns empty state when no matches', function () {
            var rendered = HD.renderFromData(
                {
                    huella: huellaData,
                    fuentes: fuentesData,
                    bcn: bcnData,
                    casos: casosData,
                },
                { query: 'xyz-no-existe-12345' },
            );
            assert(rendered.html.indexOf('ca-huella--empty') !== -1, 'empty state');
        });
    });

    describe('CAHuellaDigital — buildBuscadorUrl', function () {
        it('builds circuit URL with caso and huella', function () {
            var url = HD.buildBuscadorUrl({ caso: 'sura-gobernanza-datos', huella: '1' });
            assert(url.indexOf('buscador.html?') !== -1, 'buscador target');
            assert(url.indexOf('caso=sura-gobernanza-datos') !== -1, 'caso param');
            assert(url.indexOf('huella=1') !== -1, 'huella param');
        });

        it('omits empty query params', function () {
            var url = HD.buildBuscadorUrl({ huella: '1', q: '' });
            assert(url.indexOf('q=') === -1, 'no empty q');
        });
    });

    describe('CAHuellaDigital — renderSidebarPreview', function () {
        it('renders compact preview with expand link', function () {
            var rendered = HD.renderFromData(
                {
                    huella: huellaData,
                    fuentes: fuentesData,
                    bcn: bcnData,
                    casos: casosData,
                },
                { query: 'SURA Investments' },
            );
            var preview = HD.renderSidebarPreview(rendered.ctx, rendered.events, huellaData, {
                query: 'SURA Investments',
            });
            assert(preview.indexOf('ca-huella-sidebar') !== -1, 'sidebar wrapper');
            assert(preview.indexOf('data-ca-huella-expand') !== -1, 'expand hook');
            assert(preview.indexOf('huella=1') !== -1, 'huella deep-link');
        });
    });
};