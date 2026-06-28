/**
 * qaDesignThinking.test.js — viajes DT + cobertura de páginas
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
    var root = path.join(__dirname, '..');
    var web = path.join(root, 'web');
    var journeys = JSON.parse(fs.readFileSync(path.join(root, 'data', 'qa-journeys.json'), 'utf8'));

    function readWeb(rel) {
        return fs.readFileSync(path.join(web, rel), 'utf8');
    }

    function pageExists(rel) {
        return fs.existsSync(path.join(web, rel));
    }

    describe('QA Design Thinking — inventario de viajes', function () {
        it('qa-journeys.json define personas y fases DT', function () {
            assert(journeys._meta.framework === 'design-thinking');
            assert(journeys.personas.length >= 3);
            assert(journeys.journeys.length >= 10);
        });

        it('cada viaje tiene empatizar, definir y páginas', function () {
            journeys.journeys.forEach(function (j) {
                assert(j.id && j.title, 'id/title en ' + (j.id || '?'));
                assert(j.empatizar && j.definir, 'DT en ' + j.id);
                assert(Array.isArray(j.pages) && j.pages.length > 0, 'pages en ' + j.id);
                assert(Array.isArray(j.manual) && j.manual.length > 0, 'manual en ' + j.id);
            });
        });

        it('todas las páginas declaradas existen en web/', function () {
            var allPages = {};
            journeys.journeys.forEach(function (j) {
                j.pages.forEach(function (p) {
                    allPages[p] = true;
                });
            });
            Object.keys(allPages).forEach(function (p) {
                assert(pageExists(p), 'falta página: ' + p);
            });
        });
    });

    describe('QA Design Thinking — cobertura por taxonomía', function () {
        var taxonomies = {};

        journeys.journeys.forEach(function (j) {
            taxonomies[j.taxonomy] = (taxonomies[j.taxonomy] || 0) + 1;
        });

        it('cubre entrada, exploración, instrumento, archivo, corpus, publicaciones, investigador', function () {
            ['entrada', 'exploracion', 'instrumento', 'archivo', 'corpus', 'publicaciones', 'investigador'].forEach(
                function (t) {
                    assert(taxonomies[t] >= 1, 'sin viaje para taxonomía ' + t);
                },
            );
        });
    });

    describe('QA Design Thinking — circuitos por página', function () {
        it('J01 portal — orden demo y embudo', function () {
            var html = readWeb('index.html');
            assert(html.indexOf('ca-friction-demo') < html.indexOf('hero-search'), 'demo antes de search');
            assert(/hero-search__hint/.test(html), 'hint embudo');
            assert(/onboarding-search\.js/.test(html), 'onboarding');
        });

        it('J02 buscador — deep-links y strip', function () {
            var html = readWeb('buscador.html');
            var boot = readWeb('pages/buscador-boot.js');
            assert(html.indexOf('ca-buscador-bases-strip') !== -1);
            assert(boot.indexOf('params.huella || params.casoId || params.query') === -1);
        });

        it('J04 instrumento v2 — grafo dedicado E2E', function () {
            var html = readWeb('contra-archivo-v2.html');
            var boot = readWeb('pages/instrumento-boot.js');
            assert(/graphChunk\.js/.test(html), 'graphChunk en página');
            assert(/ca-instrumento-corpus-stats/.test(html), 'métricas corpus');
            assert(html.indexOf('casos.json') === -1, 'sin JSON en copy');
            assert(boot.indexOf('CAGraphChunk') !== -1, 'boot usa chunk');
            assert(/buscador\.html/.test(html) && /leer\.html/.test(html), 'circuito navegación');
        });

        it('J03 leer — narrativa sin copy JSON', function () {
            var html = readWeb('leer.html');
            assert(/leer-boot\.js/.test(html));
            assert(/narrativa-rescatada\.json/.test(html) === false, 'sin JSON en HTML');
        });

        it('J05 archivo — índice y corpus', function () {
            var html = readWeb('archivo.html');
            assert(/archivo-index\.json/.test(html));
            assert(/corpus-citas\.html/.test(html));
            assert(/estado-legend/.test(html));
        });

        it('J06 corpus-citas — store y datos', function () {
            var html = readWeb('corpus-citas.html');
            assert(/corpusCitasStore\.js/.test(html));
            assert(/zuboff-citas\.json/.test(html));
        });

        it('J07 tesis — biblioteca y passkey', function () {
            var html = readWeb('tesis.html');
            assert(/bibliotecaLoader\.js/.test(html));
            assert(/passkey\.js/.test(html));
        });

        it('J09 privado-login — passkey accesible', function () {
            var html = readWeb('privado-login.html');
            assert(/passkey\.js/.test(html));
            assert(/aria-live/i.test(html));
            assert(/skip-to-content|skip-link/i.test(html));
        });

        it('J10 redirects — corpus canónico', function () {
            assert(/corpus-citas\.html/.test(readWeb('zuboff-archivo.html')));
            assert(/corpus-citas\.html/.test(readWeb('citas-attac.html')));
            assert(/corpus-citas\.html/.test(readWeb('archivo-lecturas.html')));
            assert(/leer\.html#articulo-etnografico/.test(readWeb('articulo-fabricar-enemigos.html')));
        });

        it('J11 casos strip — progresivo 4+3', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'siteSurface.js'), 'utf8');
            assert(js.indexOf('data-casos-toggle') !== -1);
            assert(js.indexOf('PRIORITY_CASO_IDS') !== -1);
        });
    });

    describe('QA Design Thinking — navegación cruzada', function () {
        it('cross_nav definido y enlaces en página o shared-shell', function () {
            var shell = readWeb('shared-shell.js');
            assert(Array.isArray(journeys.cross_nav) && journeys.cross_nav.length >= 5);
            journeys.cross_nav.forEach(function (link) {
                var html = readWeb(link.from);
                var inPage = html.indexOf(link.needle) !== -1;
                var inShell = shell.indexOf(link.needle) !== -1;
                assert(inPage || inShell, link.label + ' en ' + link.from + ' o shell');
            });
        });
    });

    describe('QA Design Thinking — script auditor', function () {
        it('qa-design-thinking.mjs existe y referencia journeys', function () {
            var script = fs.readFileSync(path.join(root, 'scripts', 'qa-design-thinking.mjs'), 'utf8');
            assert(script.indexOf('qa-journeys.json') !== -1);
            assert(script.indexOf('auditJourney') !== -1);
            assert(script.indexOf('design-thinking') !== -1);
        });
    });
};