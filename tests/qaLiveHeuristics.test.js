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
      assert(/graphBootstrap\.js/i.test(html), 'falta graphBootstrap');
      assert(/siteSurface\.js/i.test(html), 'falta siteSurface');
      assert(/shared-shell\.js/i.test(html), 'falta shared-shell');
    });

    it('tiene landmark principal para skip link', function () {
      assert(/id=["']main-content["']|id=["']main["']/i.test(html), 'falta #main-content');
    });
  });

  describe('QA live — circuito buscador / instrumento / narrativa', function () {
    it('buscador.html enlaza huella y boot', function () {
      var html = readWeb('buscador.html');
      assert(/huellaDigital\.js/i.test(html), 'falta huellaDigital');
      assert(/buscador-boot\.js/i.test(html), 'falta buscador-boot');
    });

    it('contra-archivo-v2.html es instrumento real', function () {
      var html = readWeb('contra-archivo-v2.html');
      assert(/instrumento-boot\.js/i.test(html), 'falta instrumento-boot');
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