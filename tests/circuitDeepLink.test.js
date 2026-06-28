/**
 * circuitDeepLink.test.js — Static circuit tests: grafo → buscador → huella
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
    var root = path.join(__dirname, '..');
    var web = path.join(root, 'web');
    var src = path.join(root, 'src');

    describe('Circuit grafo → buscador → huella — deep-links', function () {
        it('nodeRenderer links fuentes and huella with caso param', function () {
            var js = fs.readFileSync(path.join(src, 'nodeRenderer.js'), 'utf8');
            assert(js.indexOf("huella: '1'") !== -1, 'huella tab param');
            assert(js.indexOf('caso: casoId') !== -1, 'caso param in panel actions');
            assert(js.indexOf('CAHuellaDigital.buildBuscadorUrl') !== -1, 'uses shared URL builder');
        });

        it('graphBootstrap reads ?caso= for node preselection', function () {
            var js = fs.readFileSync(path.join(src, 'graphBootstrap.js'), 'utf8');
            assert(js.indexOf("get('caso')") !== -1, 'caso deep-link in bootstrap');
            assert(js.indexOf('selectNodeById') !== -1, 'usa API pública del grafo');
            assert(js.indexOf('graph.nodes.find') === -1, 'no accede a graph.nodes inexistente');
        });

        it('FrictionGraph expone getNodeById sobre sim.nodes', function () {
            var js = fs.readFileSync(path.join(src, 'graph.js'), 'utf8');
            assert(js.indexOf('getNodeById') !== -1, 'getter público de nodos');
            assert(js.indexOf('selectNodeById') !== -1, 'selector por id para deep-links');
            assert(js.indexOf('this.sim.nodes.find') !== -1, 'nodos viven en simulación');
        });

        it('buscador supports ?fuente= deep-link filter', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'buscadorAvanzado.js'), 'utf8');
            assert(js.indexOf("get('fuente')") !== -1, 'fuente param reader');
            assert(js.indexOf('applyFuenteFilterFromUrl') !== -1, 'fuente filter applier');
        });

        it('onboarding chips link to buscador with fuente param', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'basesConsultadas.js'), 'utf8');
            assert(js.indexOf('buscador.html?fuente=') !== -1, 'chip href to buscador');
        });

        it('buscador dossier links to index grafo and huella tab', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'buscadorAvanzado.js'), 'utf8');
            assert(js.indexOf('index.html?caso=') !== -1, 'grafo link in dossier');
            assert(js.indexOf('Huella digital →') !== -1, 'huella link in dossier');
            assert(js.indexOf('index.html#campos') === -1, 'deprecated grafo link removed');
            assert(js.indexOf('login.html" class="btn-follow"') === -1, 'deprecated follow link removed');
        });

        it('buscador has sidebar huella preview hook', function () {
            var html = fs.readFileSync(path.join(web, 'buscador.html'), 'utf8');
            assert(html.indexOf('id="huellaSidebarPreview"') !== -1, 'sidebar mount');
            assert(html.indexOf('buscadorAvanzado.js') !== -1, 'extracted buscador module');
            var js = fs.readFileSync(path.join(web, 'lib', 'buscadorAvanzado.js'), 'utf8');
            assert(js.indexOf('updateHuellaSidebarPreview') !== -1, 'preview updater in module');
            assert(
                html.indexOf('dataLoader.js') !== -1 || html.indexOf('CADataLoader') !== -1,
                'loads corpus via dataLoader',
            );
        });

        it('index.html is canonical home with content-driven mounts', function () {
            var html = fs.readFileSync(path.join(web, 'index.html'), 'utf8');
            assert(html.indexOf('http-equiv="refresh"') === -1, 'no redirect stub');
            assert(
                html.indexOf('graphBootstrap.js') !== -1 || html.indexOf('graphChunk.js') !== -1,
                'graph bootstrap o chunk lazy',
            );
            assert(html.indexOf('type="module"') === -1, 'no module race on graph deps');
            assert(html.indexOf('onboarding-search.js') !== -1, 'extracted onboarding search');
            assert(html.indexOf('siteSurface.js') !== -1, 'JSON-driven surfaces');
            assert(html.indexOf('ca-narrative-teaser') !== -1, 'narrative teaser mount');
            assert(html.indexOf('ca-casos-strip') !== -1, 'casos strip mount');
            assert(html.indexOf('hero-entry-paths.js') !== -1, 'rutas portal Sprint P01');
            assert(html.indexOf('friction-demo.js') !== -1, 'demo fricción Sprint P01');
            assert(html.indexOf('ca-hero-entry-paths') !== -1, 'mount rutas');
            assert(html.indexOf('ca-friction-demo') !== -1, 'mount demo');
        });

        it('siteSurface.js renders home from archivo and narrativa JSON', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'siteSurface.js'), 'utf8');
            assert(js.indexOf('archivo-index.json') !== -1, 'archivo index');
            assert(js.indexOf('narrativa-rescatada.json') !== -1, 'narrativa JSON');
            assert(js.indexOf('mountHomeSurfaces') !== -1, 'home mount API');
            assert(js.indexOf('index.html?caso=') !== -1, 'caso deep-links');
        });

        it('siteSurface casos strip muestra los 7 casos del corpus (Sprint P03)', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'siteSurface.js'), 'utf8');
            assert(js.indexOf('list.slice(0, 4)') === -1, 'sin límite artificial de 4 casos');
            var casos = JSON.parse(fs.readFileSync(path.join(root, 'data', 'casos.json'), 'utf8'));
            assertEqual(casos.casos.length, 7, 'corpus declara 7 casos');
        });

        it('buscador-boot handles ?huella=1 and ?caso=', function () {
            var js = fs.readFileSync(path.join(web, 'pages', 'buscador-boot.js'), 'utf8');
            assert(js.indexOf("get('huella')") !== -1, 'huella param');
            assert(js.indexOf("get('caso')") !== -1, 'caso param');
            assert(js.indexOf('CAHuellaDigital.loadAndRender') !== -1, 'mounts huella view');
            assert(js.indexOf('preloaded') !== -1, 'reuses cached corpus bundle');
            assert(js.indexOf('refreshHuellaFromUrl') !== -1, 'defers huella boot until corpus loads');
        });

        it('buscador-boot no fuerza huella solo con ?q= (Sprint P02)', function () {
            var js = fs.readFileSync(path.join(web, 'pages', 'buscador-boot.js'), 'utf8');
            assert(
                js.indexOf('params.huella || params.casoId || params.query') === -1,
                '?q= solo no abre pestaña huella',
            );
            assert(js.indexOf('params.huella || params.casoId') !== -1, 'huella solo con ?huella= o ?caso=');
        });

        it('buscador P02 monta strip y stats sobre el pliegue', function () {
            var html = fs.readFileSync(path.join(web, 'buscador.html'), 'utf8');
            assert(html.indexOf('id="ca-buscador-bases-strip"') !== -1, 'mount strip principal');
            assert(html.indexOf('id="ca-buscador-corpus-stats"') !== -1, 'mount corpus stats');
            assert(html.indexOf('corpusStats.js') !== -1, 'carga corpusStats');
            assert(html.indexOf('ca-epistemic--hecho') !== -1, 'leyenda epistémica en toolbar');

            var js = fs.readFileSync(path.join(web, 'lib', 'buscadorAvanzado.js'), 'utf8');
            assert(js.indexOf("get('q')") !== -1, 'lee param ?q=');
            assert(js.indexOf('applyDeepLinkFromUrl') !== -1, 'aplica deep-link query');
            assert(js.indexOf('pickCategoryForQuery') !== -1, 'auto-selecciona categoría');
            assert(js.indexOf('ca-buscador-bases-strip') !== -1, 'monta strip compacta');
            assert(js.indexOf('ca-buscador-corpus-stats') !== -1, 'monta stats buscador');
        });

        it('dataLoader caches corpus bundle', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'dataLoader.js'), 'utf8');
            assert(js.indexOf('loadCorpusBundle') !== -1, 'bundle loader');
            assert(js.indexOf('huella-digital-publica.json') !== -1, 'includes huella index');
        });

        it('privado reuses CAHuellaDigital.renderFromData', function () {
            var html = fs.readFileSync(path.join(web, 'privado.html'), 'utf8');
            assert(html.indexOf('lib/huellaDigital.js') !== -1, 'loads shared module');
            assert(html.indexOf('CAHuellaDigital.renderFromData') !== -1, 'delegates rendering');
            assert(html.indexOf('FUENTES.forEach(function(f)') === -1, 'inline matcher removed');
        });

        it('huellaDigital caso link targets index?caso=', function () {
            var js = fs.readFileSync(path.join(web, 'lib', 'huellaDigital.js'), 'utf8');
            assert(js.indexOf('index.html?caso=') !== -1, 'grafo deep-link in huella panel');
        });

        it('shared-shell injects mobile bottom nav', function () {
            var js = fs.readFileSync(path.join(web, 'shared-shell.js'), 'utf8');
            assert(js.indexOf('buildBottomNav') !== -1, 'bottom nav builder');
            assert(js.indexOf('data-ca-bottom-nav') !== -1, 'bottom nav mount');
            assert(js.indexOf('ca-has-bottom-nav') !== -1, 'body padding for safe area');
            assert(js.indexOf('index.html#tesis') !== -1, 'tesis in mobile nav');
        });
    });
};