/**
 * qaLiveHeuristics.test.js — invariantes alineados con scripts/qa-live.mjs
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
  var root = path.join(__dirname, '..');
  var web = path.join(root, 'web');

  function readWeb(file) {
    return fs.readFileSync(path.join(web, file), 'utf8');
  }

  describe('QA live — heurísticas home (index.html)', function () {
    var html = readWeb('index.html');

    it('no usa meta refresh', function () {
      assert(!/http-equiv=["']refresh/i.test(html), 'index no debe redirigir');
    });

    it('monta grafo y superficies JSON', function () {
      var hasGraphBoot = /graphBootstrap\.js/i.test(html) || /graphChunk\.js/i.test(html);
      assert(hasGraphBoot, 'falta graphBootstrap o graphChunk');
      assert(/tokens\.js/i.test(html), 'falta tokens.js para canvas de entropía');
      if (/graphChunk\.js/i.test(html)) {
        var chunk = readWeb('lib/graphChunk.js');
        assert(/socialField\.js/i.test(chunk), 'graphChunk debe incluir socialField');
        assert(/graphBootstrap\.js/i.test(chunk), 'graphChunk debe incluir graphBootstrap');
      } else {
        assert(/socialField\.js/i.test(html), 'falta socialField');
      }
      assert(/siteSurface\.js/i.test(html), 'falta siteSurface');
      assert(/shared-shell\.js/i.test(html), 'falta shared-shell');
    });

    it('tiene landmark principal para skip link', function () {
      assert(/id=["']main-content["']|id=["']main["']/i.test(html), 'falta #main-content');
    });

    it('carga módulos bases consultadas', function () {
      assert(/sourceRegistry\.js/i.test(html), 'falta sourceRegistry');
      assert(/basesConsultadas\.js/i.test(html), 'falta basesConsultadas');
      assert(/bases-consultadas\.css/i.test(html), 'falta CSS bases consultadas');
      assert(/id=["']search-sources["']/i.test(html), 'falta #search-sources');
    });

    it('portal público Sprint P01 — rutas, demo y copy sin JSON', function () {
      assert(/hero-entry-paths\.js/i.test(html), 'falta hero-entry-paths');
      assert(/friction-demo\.js/i.test(html), 'falta friction-demo');
      assert(/corpusStats\.js/i.test(html), 'falta corpusStats');
      assert(/id=["']ca-hero-entry-paths["']/i.test(html), 'falta mount rutas');
      assert(/id=["']ca-friction-demo["']/i.test(html), 'falta mount demo fricción');
      assert(/id=["']ca-corpus-stats["']/i.test(html), 'falta mount stats');
      assert(/Contra-archivo/i.test(html), 'falta H1 Contra-archivo');
      assert(html.indexOf('¿Quién es?') === -1, 'no debe usar H1 ¿Quién es?');
      assert(/Resultados preliminares/i.test(html), 'falta copy resultados preliminares');
      assert(/archivo-index\.json/i.test(html) === false, 'copy público sin archivo-index.json');
    });
  });

  describe('QA live — circuito buscador / instrumento / narrativa', function () {
    it('buscador.html enlaza huella y boot', function () {
      var html = readWeb('buscador.html');
      assert(/huellaDigital\.js/i.test(html), 'falta huellaDigital');
      assert(/buscador-boot\.js/i.test(html), 'falta buscador-boot');
    });

    it('buscador.html monta panel bases consultadas', function () {
      var html = readWeb('buscador.html');
      assert(/basesConsultadasPanel/i.test(html), 'falta mount panel');
      assert(/sourceRegistry\.js/i.test(html), 'falta sourceRegistry');
      assert(/bases-consultadas\.css/i.test(html), 'falta CSS');
    });

    it('leer.html — narrativa canónica', function () {
      var html = readWeb('leer.html');
      assert(/leer-boot\.js/i.test(html), 'boot leer');
      assert(/narrativeRenderer\.js/i.test(html), 'renderer');
      assert(/skip-link/i.test(html), 'skip link');
    });

    it('archivo.html — hub editorial', function () {
      var html = readWeb('archivo.html');
      assert(/archivo-index\.json/i.test(html), 'índice');
      assert(/corpus-citas\.html/i.test(html), 'corpus');
      assert(/estado-legend/i.test(html), 'leyenda');
    });

    it('tesis.html — biblioteca', function () {
      var html = readWeb('tesis.html');
      assert(/bibliotecaLoader\.js/i.test(html), 'loader');
      assert(/passkey\.js/i.test(html), 'passkey');
    });

    it('404.html — recuperación', function () {
      var html = readWeb('404.html');
      assert(/index\.html/i.test(html));
      assert(/buscador\.html/i.test(html));
    });

    it('buscador.html Sprint P02 — strip, stats y deep-link ?q=', function () {
      var html = readWeb('buscador.html');
      assert(/ca-buscador-bases-strip/i.test(html), 'strip sobre el pliegue');
      assert(/ca-buscador-corpus-stats/i.test(html), 'stats corpus buscador');
      assert(/corpusStats\.js/i.test(html), 'lib corpusStats');
      var boot = readWeb('pages/buscador-boot.js');
      assert(
        boot.indexOf('params.huella || params.casoId || params.query') === -1,
        '?q= no fuerza huella',
      );
      var avanzado = readWeb('lib/buscadorAvanzado.js');
      assert(/get\('q'\)/.test(avanzado), 'buscadorAvanzado lee ?q=');
    });

    it('contra-archivo-v2.html es instrumento real Sprint v2', function () {
      var html = readWeb('contra-archivo-v2.html');
      assert(/instrumento-boot\.js/i.test(html), 'falta instrumento-boot');
      assert(/graphChunk\.js/i.test(html), 'falta graphChunk');
      assert(/ca-instrumento-corpus-stats/i.test(html), 'falta mount stats');
      assert(html.indexOf('casos.json') === -1, 'sin JSON en copy');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'no redirect');
    });

    it('contra-archivo.html renderiza narrativa JSON', function () {
      var html = readWeb('contra-archivo.html');
      assert(/narrativeRenderer\.js/i.test(html), 'falta narrativeRenderer');
    });
  });

  describe('QA live — shared-shell móvil', function () {
    it('shared-shell.js define bottom nav', function () {
      var js = readWeb('shared-shell.js');
      assert(/bottom-nav|ca-bottom-nav/i.test(js), 'falta bottom nav móvil');
    });

    it('nav unificado no fuerza width 100% en desktop', function () {
      var css = fs.readFileSync(path.join(root, 'web', 'styles', 'shared.css'), 'utf8');
      var shell = readWeb('shared-shell.js');
      assert(css.indexOf('.ca-unified-nav__row {') !== -1, 'shared.css define fila del nav');
      assert(css.indexOf('width: 100%') === -1 || /@media \(max-width: 640px\)[\s\S]*\.ca-unified-nav__row[\s\S]*width: 100%/.test(css), 'width 100% solo en móvil');
      assert(shell.indexOf("'  width: 100%;',") === -1, 'shared-shell sin width 100% global en row');
    });
  });

  describe('QA live — manifest y sitemap', function () {
    it('manifest apunta a index.html en subpath Pages', function () {
      var manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
      assertEqual(manifest.start_url, '/antropologia-corrupcion/index.html');
      assertEqual(manifest.scope, '/antropologia-corrupcion/');
    });

    it('sitemap no lista landing.html', function () {
      var sitemap = fs.readFileSync(path.join(root, 'xml', 'sitemap.xml'), 'utf8');
      assert(sitemap.indexOf('landing.html') === -1, 'sitemap no debe incluir landing');
      assert(sitemap.indexOf('index.html') !== -1, 'sitemap debe incluir index');
    });
  });
};