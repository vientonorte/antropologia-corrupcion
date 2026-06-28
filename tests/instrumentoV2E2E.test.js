/**
 * instrumentoV2E2E.test.js — Sprint v2 design E2E
 * contra-archivo-v2 → grafo → buscador/huella
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
    var root = path.join(__dirname, '..');
    var web = path.join(root, 'web');
    var src = path.join(root, 'src');

    function readWeb(file) {
        return fs.readFileSync(path.join(web, file), 'utf8');
    }

    describe('E2E — instrumento v2 Sprint (estructura)', function () {
        var html = readWeb('contra-archivo-v2.html');

        it('superficie dedicada con landmarks y circuito', function () {
            assert(/<main[^>]*id=["']main-content["']/i.test(html), 'main landmark');
            assert(/skip-link/i.test(html), 'skip link');
            assert(/instrumento-boot\.js/i.test(html), 'boot instrumento');
            assert(/graphChunk\.js/i.test(html), 'graphChunk');
            assert(/ca-instrumento-corpus-stats/i.test(html), 'mount métricas');
            assert(/buscador\.html/i.test(html), 'enlace buscador');
            assert(/leer\.html/i.test(html), 'enlace leer');
            assert(/index\.html/i.test(html), 'enlace portal');
            assert(html.indexOf('casos.json') === -1, 'sin JSON en copy');
            assert(!/http-equiv=["']refresh/i.test(html), 'no redirect');
        });

        it('no carga grafo eager en HTML (delega a graphChunk)', function () {
            assert(html.indexOf('vendor/d3.min.js') === -1, 'd3 vía chunk');
            assert(html.indexOf('src/graphBootstrap.js') === -1, 'bootstrap vía chunk');
            assert(html.indexOf('src/socialField.js') === -1, 'socialField vía chunk');
        });

        it('instrumento-boot usa graphChunk y corpusStats', function () {
            var boot = readWeb('pages/instrumento-boot.js');
            assert(boot.indexOf('CAGraphChunk') !== -1, 'ensureGraphChunk');
            assert(boot.indexOf('GraphBootstrap.boot') !== -1, 'boot grafo');
            assert(boot.indexOf('ca-instrumento-corpus-stats') !== -1, 'mount stats');
            assert(boot.indexOf('loadCorpusBundle') !== -1, 'carga bundle');
        });
    });

    describe('E2E — instrumento v2 circuito grafo → buscador', function () {
        it('graphBootstrap soporta ?caso= en cualquier superficie', function () {
            var js = fs.readFileSync(path.join(src, 'graphBootstrap.js'), 'utf8');
            assert(js.indexOf("get('caso')") !== -1, 'deep-link caso');
            assert(js.indexOf('applyDeepLinkCaso') !== -1, 'aplica deep-link');
        });

        it('nodeRenderer enlaza buscador y huella desde panel', function () {
            var js = fs.readFileSync(path.join(src, 'nodeRenderer.js'), 'utf8');
            assert(js.indexOf('buildBuscadorUrl') !== -1, 'URL builder');
            assert(js.indexOf("huella: '1'") !== -1 || js.indexOf('huella') !== -1, 'tab huella');
        });

        it('graphChunk incluye stack completo del grafo', function () {
            var chunk = readWeb('lib/graphChunk.js');
            assert(chunk.indexOf('graphBootstrap.js') !== -1, 'bootstrap en chunk');
            assert(chunk.indexOf('socialField.js') !== -1, 'socialField en chunk');
            assert(chunk.indexOf('nodeRenderer.js') !== -1, 'nodeRenderer en chunk');
        });
    });

    describe('E2E — instrumento v2 inventario y QA', function () {
        it('atomic-registry P_INSTRUMENTO en beta wave 4', function () {
            var reg = JSON.parse(fs.readFileSync(path.join(root, 'data', 'atomic-registry.json'), 'utf8'));
            var surface = (reg.surfaces || []).find(function (s) {
                return s.surface === 'P_INSTRUMENTO';
            });
            assert(surface, 'superficie registrada');
            assertEqual(surface.maturity, 'beta');
            assert(surface.required_scripts.indexOf('lib/graphChunk.js') !== -1, 'graphChunk requerido');
        });

        it('ia-inventario declara P_INSTRUMENTO con propósito', function () {
            var inv = JSON.parse(fs.readFileSync(path.join(root, 'data', 'ia-inventario.json'), 'utf8'));
            var p = (inv.surfaces || []).find(function (s) {
                return s.id === 'P_INSTRUMENTO';
            });
            assert(p, 'P_INSTRUMENTO');
            assertEqual(p.path, 'contra-archivo-v2.html');
            assert(p.purpose && p.purpose.indexOf('index.html#tesis') !== -1, 'aclara portal canónico');
        });

        it('J04 journey DT cubre circuito v2', function () {
            var journeys = JSON.parse(fs.readFileSync(path.join(root, 'data', 'qa-journeys.json'), 'utf8'));
            var j04 = journeys.journeys.find(function (j) {
                return j.id === 'J04';
            });
            assert(j04, 'J04');
            assert(j04.circuit.some(function (c) {
                return c.needle === 'graphChunk.js';
            }), 'circuito graphChunk');
            assert(j04.circuit.some(function (c) {
                return c.must_not_contain === 'casos.json';
            }), 'circuito sin JSON copy');
        });
    });
};