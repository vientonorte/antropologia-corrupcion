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
      target: 'corpus-citas.html',
      canonical: 'corpus-citas.html',
    },
    {
      file: 'citas-attac.html',
      target: 'corpus-citas.html',
      canonical: 'corpus-citas.html',
    },
    {
      file: 'zuboff-archivo.html',
      target: 'corpus-citas.html',
      canonical: 'corpus-citas.html',
      migrates: true,
    },
    {
      file: 'archivo-lecturas.html',
      target: 'corpus-citas.html',
      canonical: 'corpus-citas.html',
      migrates: true,
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
        if (stub.migrates) {
          assert(html.includes('corpusCitasStore.js'), 'debe cargar store de migración');
          assert(html.includes('migrateLegacy'), 'debe migrar storages legacy');
        }
        assert(html.length < 2500, 'debe ser stub liviano, no página completa');
      });
    });

    it('corpus-citas.html es superficie canónica con captura local', function () {
      var html = fs.readFileSync(path.join(web, 'corpus-citas.html'), 'utf8');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'no debe redirigir');
      assert(html.indexOf('LecturaClaveB') !== -1 || html.indexOf('lectura-clave-b.js') !== -1, 'captura Clave B local');
      assert(html.indexOf('corpusCitasStore.js') !== -1, 'almacén unificado');
      assert(html.indexOf('librosClaveB.js') !== -1, 'registro libros físicos');
      assert(html.indexOf('imagePrepare.js') !== -1, 'preparación de imágenes local');
      assert(html.indexOf('claveBAutoScan') !== -1, 'escaneo automático Clave B');
      var imgIdx = html.indexOf('imagePrepare.js');
      var inlineIdx = html.indexOf('initCaptureReaders');
      assert(imgIdx !== -1 && inlineIdx !== -1 && imgIdx < inlineIdx, 'imagePrepare antes del inline');
      assert(fs.existsSync(path.join(web, 'vendor', 'heic2any.min.js')), 'heic2any vendoreado');
    });

    it('index.html es home canónica, no redirect', function () {
      var html = fs.readFileSync(path.join(web, 'index.html'), 'utf8');
      assert(html.indexOf('http-equiv="refresh"') === -1, 'index no debe redirigir');
      assert(
        html.indexOf('graphBootstrap.js') !== -1 || html.indexOf('graphChunk.js') !== -1,
        'index monta grafo (directo o lazy)',
      );
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

    it('archivo-index.json apunta al canónico corpus-citas.html', function () {
      var index = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'archivo-index.json'), 'utf8'));
      var corpus = (index.entries || []).find(function (e) { return e.id === 'corpus-citas-archivo'; });
      assert(corpus, 'entrada corpus-citas-archivo debe existir');
      assertEqual(corpus.url, 'corpus-citas.html');
      assert(!/(^|;)zuboff-citas\.html(;|$)/.test(corpus.url), 'url no debe ser zuboff-citas.html');
    });
  });
};