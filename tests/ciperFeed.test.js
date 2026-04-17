/**
 * ciperFeed.test.js — Tests for src/ciperFeed.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData) {

    var CiperFeed = window.CiperFeed;

    /* ─── Module export ─── */

    describe('CiperFeed — module export', function () {
        it('is exported as an object', function () {
            assert(CiperFeed !== null && typeof CiperFeed === 'object', 'should be an object');
        });

        it('has required public methods', function () {
            assertEqual(typeof CiperFeed.cargar, 'function');
            assertEqual(typeof CiperFeed.filtrarPorActores, 'function');
            assertEqual(typeof CiperFeed.filtrarPorKeywords, 'function');
            assertEqual(typeof CiperFeed.cruzarConCasos, 'function');
            assertEqual(typeof CiperFeed.renderHTML, 'function');
        });
    });

    /* ─── Test data ─── */

    var mockArticulos = [
        {
            titulo: 'AFP e inversiones en zonas de sacrificio',
            enlace: 'https://example.com/afp',
            fecha: '2025-09-12',
            descripcion: 'Fondos de pensiones mantienen participación en empresas con operaciones en territorios declarados zonas de sacrificio.',
            categorias: ['AFP', 'Inversiones', 'Medio Ambiente']
        },
        {
            titulo: 'SURA y la opacidad regulatoria de la CMF',
            enlace: 'https://example.com/sura',
            fecha: '2025-11-03',
            descripcion: 'El grupo SURA Investments opera bajo un marco de supervisión que la CMF califica de suficiente.',
            categorias: ['CMF', 'SURA', 'Regulación']
        },
        {
            titulo: 'Territorio mapuche y consulta previa',
            enlace: 'https://example.com/mapuche',
            fecha: '2026-01-18',
            descripcion: 'Comunidades mapuche-huilliche de Los Ríos denuncian que los procesos de consulta previa operan como dispositivos de legitimación.',
            categorias: ['Pueblos Originarios', 'OIT 169', 'Consulta Previa']
        },
        {
            titulo: 'Periodismo de datos en Chile',
            enlace: 'https://example.com/periodismo',
            fecha: '2025-07-25',
            descripcion: 'El acceso a datos públicos en Chile sigue siendo fragmentario y parcial.',
            categorias: ['Periodismo', 'Datos Abiertos', 'Transparencia']
        }
    ];

    /* ─── filtrarPorActores ─── */

    describe('CiperFeed.filtrarPorActores', function () {
        it('filters articles by actor name', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, ['SURA']);
            assertGreaterThan(result.length, 0, 'should find SURA articles');
            for (var i = 0; i < result.length; i++) {
                var text = (result[i].titulo + ' ' + result[i].descripcion).toLowerCase();
                assert(text.indexOf('sura') !== -1, 'each result should mention SURA');
            }
        });

        it('is accent-insensitive', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, ['ríos']);
            assertGreaterThan(result.length, 0, 'should find articles mentioning Ríos accent-insensitively');
        });

        it('is case-insensitive', function () {
            var upper = CiperFeed.filtrarPorActores(mockArticulos, ['AFP']);
            var lower = CiperFeed.filtrarPorActores(mockArticulos, ['afp']);
            assertEqual(upper.length, lower.length, 'case should not affect results');
        });

        it('returns empty for no matches', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, ['ZZZ_INEXISTENTE']);
            assertEqual(result.length, 0);
        });

        it('returns empty for null articulos', function () {
            var result = CiperFeed.filtrarPorActores(null, ['SURA']);
            assertEqual(result.length, 0);
        });

        it('returns empty for null actores', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, null);
            assertEqual(result.length, 0);
        });

        it('returns empty for empty actores array', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, []);
            assertEqual(result.length, 0);
        });

        it('matches multiple actors with OR logic', function () {
            var result = CiperFeed.filtrarPorActores(mockArticulos, ['SURA', 'AFP']);
            assertGreaterThan(result.length, 1, 'should match articles for both actors');
        });
    });

    /* ─── filtrarPorKeywords ─── */

    describe('CiperFeed.filtrarPorKeywords', function () {
        it('filters articles by keyword', function () {
            var result = CiperFeed.filtrarPorKeywords(mockArticulos, ['supervisión']);
            assertGreaterThan(result.length, 0, 'should find articles with supervisión');
        });

        it('is accent-insensitive', function () {
            var r1 = CiperFeed.filtrarPorKeywords(mockArticulos, ['regulación']);
            var r2 = CiperFeed.filtrarPorKeywords(mockArticulos, ['regulacion']);
            assertEqual(r1.length, r2.length, 'accent insensitivity');
        });

        it('searches in both titulo and descripcion', function () {
            // 'zonas de sacrificio' appears only in titulo
            var result = CiperFeed.filtrarPorKeywords(mockArticulos, ['sacrificio']);
            assertGreaterThan(result.length, 0, 'should match in titulo');

            // 'fragmentario' appears only in descripcion
            var result2 = CiperFeed.filtrarPorKeywords(mockArticulos, ['fragmentario']);
            assertGreaterThan(result2.length, 0, 'should match in descripcion');
        });

        it('returns empty for null inputs', function () {
            assertEqual(CiperFeed.filtrarPorKeywords(null, ['test']).length, 0);
            assertEqual(CiperFeed.filtrarPorKeywords(mockArticulos, null).length, 0);
            assertEqual(CiperFeed.filtrarPorKeywords(mockArticulos, []).length, 0);
        });

        it('matches multiple keywords with OR logic', function () {
            var result = CiperFeed.filtrarPorKeywords(mockArticulos, ['AFP', 'mapuche']);
            assertGreaterThan(result.length, 1, 'should match articles for either keyword');
        });
    });

    /* ─── cruzarConCasos ─── */

    describe('CiperFeed.cruzarConCasos', function () {
        it('returns array with one entry per articulo', function () {
            var result = CiperFeed.cruzarConCasos(mockArticulos, casosData.casos);
            assertEqual(result.length, mockArticulos.length);
        });

        it('each entry has articulo and casosRelacionados', function () {
            var result = CiperFeed.cruzarConCasos(mockArticulos, casosData.casos);
            for (var i = 0; i < result.length; i++) {
                assert('articulo' in result[i], 'should have articulo');
                assert(Array.isArray(result[i].casosRelacionados), 'should have casosRelacionados array');
            }
        });

        it('finds related casos based on keyword overlap', function () {
            var result = CiperFeed.cruzarConCasos(mockArticulos, casosData.casos);
            var anyRelated = result.some(function (r) {
                return r.casosRelacionados.length > 0;
            });
            assert(anyRelated, 'at least one article should have related casos');
        });

        it('casosRelacionados are sorted by overlap (descending)', function () {
            var result = CiperFeed.cruzarConCasos(mockArticulos, casosData.casos);
            for (var i = 0; i < result.length; i++) {
                var rel = result[i].casosRelacionados;
                for (var j = 1; j < rel.length; j++) {
                    assert(rel[j - 1].overlap >= rel[j].overlap,
                        'casosRelacionados should be sorted by overlap desc');
                }
            }
        });

        it('each related caso has id, titulo, overlap', function () {
            var result = CiperFeed.cruzarConCasos(mockArticulos, casosData.casos);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].casosRelacionados.length; j++) {
                    var rel = result[i].casosRelacionados[j];
                    assert(typeof rel.id === 'string', 'related.id should be string');
                    assert(typeof rel.titulo === 'string', 'related.titulo should be string');
                    assert(typeof rel.overlap === 'number', 'related.overlap should be number');
                    assertGreaterThan(rel.overlap, 0, 'overlap should be > 0');
                }
            }
        });

        it('returns empty for null inputs', function () {
            assertEqual(CiperFeed.cruzarConCasos(null, casosData.casos).length, 0);
            assertEqual(CiperFeed.cruzarConCasos(mockArticulos, null).length, 0);
        });

        it('handles articles with no matching keywords', function () {
            var unrelatedArticle = [{
                titulo: 'Quantum Computing Advances',
                descripcion: 'New breakthroughs in quantum entanglement protocols.',
                categorias: ['Science', 'Technology']
            }];
            var result = CiperFeed.cruzarConCasos(unrelatedArticle, casosData.casos);
            assertEqual(result.length, 1);
            assertEqual(result[0].casosRelacionados.length, 0,
                'unrelated article should have no caso matches');
        });
    });
};
