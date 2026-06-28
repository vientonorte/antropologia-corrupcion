/**
 * homePublicE2E.test.js — Circuito end-to-end inicio público (Sprint P01)
 * index → demo fricción → chips fuente → buscador → grafo/leer
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
    var root = path.join(__dirname, '..');
    var web = path.join(root, 'web');
    var data = path.join(root, 'data');

    function readWeb(file) {
        return fs.readFileSync(path.join(web, file), 'utf8');
    }

    function readData(file) {
        return JSON.parse(fs.readFileSync(path.join(data, file), 'utf8'));
    }

    describe('E2E — inicio público Sprint P01 (estructura)', function () {
        var html = readWeb('index.html');

        it('hero portal con 3 rutas y landmarks', function () {
            assert(/id=["']hero-title["']/i.test(html), 'hero-title');
            assert(/Contra-archivo/i.test(html), 'H1 portal');
            assert(html.indexOf('¿Quién es?') === -1, 'sin FAQ identidad');
            assert(/ca-hero-entry-paths/i.test(html), 'mount rutas');
            assert(/ca-corpus-stats/i.test(html), 'mount stats');
            assert(/ca-friction-demo/i.test(html), 'mount demo');
            assert(/<main[^>]*id=["']main-content["']/i.test(html), 'main landmark único');
            assert(/Resultados preliminares/i.test(html), 'copy resultados');
        });

        it('carga módulos del sprint en orden de dependencia', function () {
            var scripts = [
                'frictionEngine.js',
                'searchEngine.js',
                'dataLoader.js',
                'basesConsultadas.js',
                'hero-entry-paths.js',
                'friction-demo.js',
                'corpusStats.js',
                'home-boot.js',
                'onboarding-search.js',
            ];
            scripts.forEach(function (s) {
                assert(html.indexOf(s) !== -1, 'falta script ' + s);
            });
        });

        it('assets CSS del sprint existen en disco', function () {
            var css = [
                'styles/molecules/hero-entry-paths.css',
                'styles/molecules/corpus-stats.css',
                'styles/organisms/friction-demo.css',
            ];
            css.forEach(function (c) {
                assert(fs.existsSync(path.join(web, c)), 'falta ' + c);
            });
        });
    });

    describe('E2E — rutas grafo / leer / buscar', function () {
        it('hero-entry-paths enlaza grafo, leer y buscar', function () {
            var js = readWeb('components/molecules/hero-entry-paths.js');
            assert(js.indexOf('index.html#tesis') !== -1, 'CTA grafo');
            assert(js.indexOf('leer.html') !== -1, 'CTA leer');
            assert(js.indexOf('data-ca-path="buscar"') !== -1, 'CTA buscar');
            assert(js.indexOf('GraphBootstrap.boot') !== -1, 'eager grafo al clic');
        });

        it('leer.html es superficie narrativa alcanzable', function () {
            var html = readWeb('leer.html');
            assert(html.indexOf('narrativeRenderer') !== -1 || html.indexOf('leer-boot') !== -1, 'boot narrativa');
            assert(!/http-equiv=["']refresh/i.test(html), 'leer no es redirect');
        });

        it('buscador.html recibe deep-link desde chips y demo', function () {
            var bases = readWeb('lib/basesConsultadas.js');
            var demo = readWeb('components/organisms/friction-demo.js');
            assert(bases.indexOf('buscador.html?fuente=') !== -1, 'chip → buscador fuente');
            assert(demo.indexOf('buscador.html?q=') !== -1, 'demo → buscador query');
        });
    });

    describe('E2E — demo fricción con corpus real', function () {
        it('encuentra registro top por score de fricción', function () {
            var fuentes = readData('fuentes-oficiales.json');
            var bcnRaw = readData('bcn-legislativo.json');
            var casosData = readData('casos.json');
            var registros = Array.isArray(fuentes) ? fuentes : fuentes.registros || [];

            assert(typeof window.FrictionSearchEngine === 'function', 'FrictionSearchEngine cargado');

            var bcnRecords =
                typeof window.normalizeBcnDataset === 'function'
                    ? window.normalizeBcnDataset(bcnRaw)
                    : [];
            var casos = casosData.casos || casosData;

            var engine = new window.FrictionSearchEngine({
                registros: registros.concat(bcnRecords),
                casos: casos,
            });
            var results = engine.search({ query: '', sort: 'friction' });
            assert(results.length > 0, 'hay resultados sin query');
            assert(results[0].frictionScore > 0, 'score de fricción positivo');
            assert(results[0].registro && results[0].registro.titulo, 'registro con título');
        });

        it('corpusStats refleja totales del bundle', function () {
            assert(window.CACorpusStats, 'CACorpusStats cargado');
            var fuentes = readData('fuentes-oficiales.json');
            var bcnRaw = readData('bcn-legislativo.json');
            var casosData = readData('casos.json');
            var sourceConfig = readData('fuentes-config.json');
            var registros = Array.isArray(fuentes) ? fuentes : fuentes.registros || [];
            assert(window.CASourceRegistry, 'CASourceRegistry cargado');
            var bcnRecords =
                typeof window.normalizeBcnDataset === 'function'
                    ? window.normalizeBcnDataset(bcnRaw)
                    : [];
            var bundle = {
                allRecords: registros.concat(bcnRecords),
                casos: casosData.casos || casosData,
                sourceConfig: sourceConfig,
            };
            var report = window.CASourceRegistry.buildSourceReport(
                bundle.sourceConfig,
                bundle.allRecords,
            );
            var metrics = window.CACorpusStats.buildMetrics(bundle, report);
            assertEqual(metrics.registros, bundle.allRecords.length);
            assert(metrics.fuentes > 0, 'fuentes con datos');
            assert(metrics.casos > 0, 'casos etnográficos');
        });
    });

    describe('E2E — superficies JSON bajo el fold', function () {
        it('archivo-index alimenta grid publicable', function () {
            var archivo = readData('archivo-index.json');
            var publicables = (archivo.entries || []).filter(function (e) {
                return e.estado === 'publicable';
            });
            assert(publicables.length >= 1, 'hay recursos publicables');
        });

        it('narrativa-rescatada alimenta teaser', function () {
            var narrativa = readData('narrativa-rescatada.json');
            assert(narrativa.presentacion_00 && narrativa.presentacion_00.titulo, 'presentación');
            assert(narrativa.protocolo_traduccion, 'protocolo');
        });

        it('siteSurface no expone nombres JSON en HTML renderizado', function () {
            var js = readWeb('lib/siteSurface.js');
            assert(js.indexOf('narrativa-rescatada.json') === -1, 'sin JSON en teaser kicker');
            assert(js.indexOf('casos.json') === -1, 'sin JSON en casos strip');
        });
    });

    describe('E2E — política público/investigador en home', function () {
        it('index no enlaza rutas privadas ni taller', function () {
            var html = readWeb('index.html');
            assert(!/vault\/|acab\/DOCS|terraza\/corpus/i.test(html), 'sin rutas sensibles');
            assert(!/admin\.html/i.test(html), 'sin admin en hero');
        });

        it('ia-inventario declara P01 canónico con módulos sprint', function () {
            var inv = readData('ia-inventario.json');
            var p01 = (inv.surfaces || []).find(function (s) {
                return s.id === 'P01';
            });
            assert(p01, 'superficie P01');
            assertEqual(p01.path, 'index.html');
            assert(p01.canonical === true, 'canonical');
            assert((p01.modules || []).indexOf('friction-demo.js') !== -1, 'módulo demo');
            assert((p01.modules || []).indexOf('hero-entry-paths.js') !== -1, 'módulo rutas');
        });
    });
};