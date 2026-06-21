/**
 * archivoIndex.test.js — índice editorial completo
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
  var root = path.join(__dirname, '..');
  var indexPath = path.join(root, 'data', 'archivo-index.json');
  var index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  var entries = index.entries || [];

  function find(id) {
    return entries.find(function (e) { return e.id === id; });
  }

  function fichaExists(rel) {
    return fs.existsSync(path.join(root, rel));
  }

  describe('archivo-index — fichas y corpus documentados', function () {
    it('incluye C05 Michillanca publicable con enlace al grafo', function () {
      var c05 = find('ficha-c05-michillanca');
      assert(c05, 'falta ficha-c05-michillanca');
      assertEqual(c05.estado, 'publicable');
      assert(c05.grafo_url.indexOf('michillanca-extractivismo-ley-anti') !== -1);
      assert(fichaExists('docs/fichas/C05-michillanca-extractivismo-ley-anti.md'));
    });

    it('incluye M01 ATTAC y M02 Zuboff', function () {
      var m01 = find('ficha-m01-corpus-attac');
      var m02 = find('ficha-m02-corpus-zuboff');
      assert(m01 && m02, 'faltan fichas M01/M02');
      assert(m01.corpus_url === 'zuboff-archivo.html');
      assert(fichaExists('docs/fichas/M01-corpus-attac-documentacion.md'));
      assert(fichaExists('docs/fichas/M02-corpus-zuboff-documentacion.md'));
    });

    it('incluye caso La Negra como resumen en grafo', function () {
      var laNegra = find('caso-la-negra-grafo');
      assert(laNegra, 'falta caso-la-negra-grafo');
      assert(laNegra.caso_id === 'la-negra-territorio-mapuche');
    });

    it('C04 está en revisión (poemario publicado)', function () {
      var c04 = find('ficha-c04-bomba-viento-norte');
      assert(c04.estado === 'en revisión', 'C04 debe estar en revisión');
    });

    it('tesis.html carga catálogo desde bibliotecaLoader', function () {
      var html = fs.readFileSync(path.join(root, 'web', 'tesis.html'), 'utf8');
      assert(html.indexOf('bibliotecaLoader.js') !== -1, 'tesis usa bibliotecaLoader');
      assert(html.indexOf('loadCatalog') !== -1, 'tesis invoca loadCatalog');
      assert(fs.existsSync(path.join(root, 'web', 'lib', 'bibliotecaLoader.js')));
    });
  });
};