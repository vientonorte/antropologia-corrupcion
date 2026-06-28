/**
 * sprintGatesQA.test.js — Gates automatizados post P01/P02/P03
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
    var root = path.join(__dirname, '..');
    var web = path.join(root, 'web');

    function readWeb(rel) {
        return fs.readFileSync(path.join(web, rel), 'utf8');
    }

    function readData(name) {
        return JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
    }

    describe('QA Sprint — P01 portal público', function () {
        it('index.html monta componentes Sprint P01', function () {
            var html = readWeb('index.html');
            assert(html.indexOf('hero-entry-paths.js') !== -1, 'hero-entry-paths');
            assert(html.indexOf('friction-demo.js') !== -1, 'friction-demo');
            assert(html.indexOf('corpusStats.js') !== -1, 'corpusStats');
            assert(html.indexOf('Contra-archivo') !== -1, 'H1 portal');
            assert(html.indexOf('¿Quién es?') === -1, 'sin FAQ identidad obsoleto');
            assert(html.indexOf('skip-link') !== -1, 'skip link');
        });

        it('atomic-registry declara P01 molecules y organisms', function () {
            var reg = readData('atomic-registry.json');
            var ids = []
                .concat(reg.components.molecules.map(function (c) { return c.id; }))
                .concat(reg.components.organisms.map(function (c) { return c.id; }));
            assert(ids.indexOf('hero-entry-paths') !== -1, 'registry hero-entry-paths');
            assert(ids.indexOf('friction-demo') !== -1, 'registry friction-demo');
            assert(ids.indexOf('corpus-stats') !== -1, 'registry corpus-stats');
        });
    });

    describe('QA Sprint — P02 buscador embudo', function () {
        it('buscador.html integra strip, stats y leyenda epistémica', function () {
            var html = readWeb('buscador.html');
            assert(html.indexOf('ca-buscador-bases-strip') !== -1);
            assert(html.indexOf('ca-buscador-corpus-stats') !== -1);
            assert(html.indexOf('ca-epistemic--hecho') !== -1);
        });

        it('deep-link ?q= no abre huella por defecto', function () {
            var boot = readWeb('pages/buscador-boot.js');
            var avanzado = readWeb('lib/buscadorAvanzado.js');
            assert(boot.indexOf('params.huella || params.casoId || params.query') === -1);
            assert(avanzado.indexOf("get('q')") !== -1);
            assert(avanzado.indexOf('applyDeepLinkFromUrl') !== -1);
        });
    });

    describe('QA Sprint — P03 contenido y grafo', function () {
        it('corpus declara 7 casos con ensayo D4 y Michillanca', function () {
            var casos = readData('casos.json');
            assertEqual(casos.casos.length, 7);
            var ids = casos.casos.map(function (c) { return c.id; });
            assert(ids.indexOf('ensayo-traduccion-saberes') !== -1);
            assert(ids.indexOf('michillanca-extractivismo-ley-anti') !== -1);
            assert(casos._meta.nota_casos, 'nota_casos documentada');
        });

        it('archivo-index enlaza ensayo y C05 al grafo', function () {
            var idx = readData('archivo-index.json');
            var ensayo = idx.entries.find(function (e) { return e.id === 'ensayo-traduccion-teorico'; });
            var c05 = idx.entries.find(function (e) { return e.id === 'ficha-c05-michillanca'; });
            assert(ensayo && ensayo.grafo_url, 'ensayo grafo_url');
            assert(c05 && c05.grafo_url, 'C05 grafo_url');
        });

        it('siteSurface casos strip progresivo preserva 7 casos', function () {
            var js = readWeb('lib/siteSurface.js');
            assert(js.indexOf('CASOS_STRIP_VISIBLE') !== -1, 'límite visible inicial');
            assert(js.indexOf('data-casos-extra') !== -1, 'casos extra colapsables');
        });

        it('embudo onboarding preserva query hacia buscador', function () {
            var onboarding = readWeb('pages/onboarding-search.js');
            assert(onboarding.indexOf("buscador.html?q=") !== -1, 'CTA con deep-link');
            var demo = readWeb('components/organisms/friction-demo.js');
            assert(demo.indexOf('ca-friction-demo__actions') !== -1, 'demo dual CTA');
            assert(demo.indexOf('index.html?caso=') !== -1, 'demo enlace grafo');
        });
    });

    describe('QA Sprint — deuda conocida (wave 3)', function () {
        it('huella-panel organism JS sigue documentado como deuda', function () {
            var reg = readData('atomic-registry.json');
            var huella = reg.components.organisms.find(function (c) { return c.id === 'huella-panel'; });
            assert(huella && huella.debt, 'deuda huella-panel registrada');
            assert(huella.js === null, 'JS organism pendiente');
        });
    });
};