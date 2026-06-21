/**
 * redirectStubs.test.js — QA de redirects de consolidación corpus citas
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
  var web = path.join(__dirname, '..', 'web');

  var stubs = [
    {
      file: 'zuboff-citas.html',
      target: 'zuboff-archivo.html',
      canonical: 'zuboff-archivo.html',
    },
    {
      file: 'citas-attac.html',
      target: 'zuboff-archivo.html',
      canonical: 'zuboff-archivo.html',
    },
  ];

  describe('Redirect stubs — corpus citas consolidado', function () {
    stubs.forEach(function (stub) {
      it(stub.file + ' redirige a ' + stub.target, function () {
        var html = fs.readFileSync(path.join(web, stub.file), 'utf8');
        assert(html.includes('url=' + stub.target), 'meta refresh debe apuntar a ' + stub.target);
        assert(html.includes('rel="canonical" href="' + stub.canonical + '"'), 'canonical debe ser ' + stub.canonical);
        assert(html.includes('noindex'), 'debe ser noindex para evitar duplicado SEO');
        assert(!html.includes('<form'), 'no debe tener UI duplicada');
        assert(html.length < 2000, 'debe ser stub liviano, no página completa');
      });
    });

    it('index.html es home canónica, no redirect', function () {
      var html = fs.readFileSync(path.join(web, 'index.html'), 'utf8');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'index no debe redirigir');
      assert(html.indexOf('graphBootstrap.js') !== -1, 'index monta grafo');
      assert(html.indexOf('siteSurface.js') !== -1, 'index carga superficies JSON');
      assert(html.indexOf('ca-resource-mount') !== -1, 'mount de recursos editorial');
    });

    it('contra-archivo-v2.html es instrumento con contenido, no redirect', function () {
      var html = fs.readFileSync(path.join(web, 'contra-archivo-v2.html'), 'utf8');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'no redirect');
      assert(html.indexOf('instrumento-boot.js') !== -1, 'boot de grafo');
      assert(html.indexOf('ca-thesis-placeholder') !== -1, 'monta organismo tesis');
    });

    it('contra-archivo.html renderiza narrativa, no redirect', function () {
      var html = fs.readFileSync(path.join(web, 'contra-archivo.html'), 'utf8');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'no redirect');
      assert(html.indexOf('narrativeRenderer.js') !== -1, 'renderer JSON');
      assert(html.indexOf('narrative-root') !== -1, 'mount narrativa');
    });

    it('archivo-index.json apunta al canónico zuboff-archivo.html', function () {
      var index = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'archivo-index.json'), 'utf8'));
      var corpus = (index.entries || []).find(function (e) { return e.id === 'corpus-citas-archivo'; });
      assert(corpus, 'entrada corpus-citas-archivo debe existir');
      assertEqual(corpus.url, 'zuboff-archivo.html');
      assert(!/(^|;)zuboff-citas\.html(;|$)/.test(corpus.url), 'url no debe ser zuboff-citas.html');
    });
  });
};