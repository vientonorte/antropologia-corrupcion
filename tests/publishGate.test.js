/**
 * publishGate.test.js — Gate C03 integrado al flujo de validación
 * Verifica invariantes de pre-publicación del protocolo docs/fichas/C03.
 */
'use strict';

var fs = require('fs');
var path = require('path');

function walkHtml(dir, acc) {
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

module.exports = function (describe, it, assert, assertEqual) {
  var root = path.join(__dirname, '..');
  var webDir = path.join(root, 'web');
  var c03Path = path.join(root, 'docs', 'fichas', 'C03-protocolo-documentacion.md');

  describe('Gate C03 — protocolo de pre-publicación', function () {
    it('existe la ficha C03 canónica', function () {
      assert(fs.existsSync(c03Path), 'docs/fichas/C03-protocolo-documentacion.md debe existir');
      var c03 = fs.readFileSync(c03Path, 'utf8');
      assert(c03.includes('Gate de pre-publicación'), 'C03 debe definir el gate');
      assert(c03.includes('P/R/C'), 'C03 debe definir clasificación P/R/C');
    });

    it('CONTRIBUTING referencia el gate C03', function () {
      var contributing = fs.readFileSync(path.join(root, 'CONTRIBUTING.md'), 'utf8');
      assert(contributing.includes('C03'), 'CONTRIBUTING debe referenciar gate C03');
    });

    it('web/ no enlaza rutas vault/ ni acab/', function () {
      var htmlFiles = walkHtml(webDir, []);
      for (var i = 0; i < htmlFiles.length; i++) {
        var html = fs.readFileSync(htmlFiles[i], 'utf8');
        assert(!html.includes('vault/'), htmlFiles[i] + ' no debe enlazar vault/');
        assert(!html.includes('acab/DOCS'), htmlFiles[i] + ' no debe enlazar acab/DOCS');
      }
    });

    it('archivo-index.json declara estado en cada entrada', function () {
      var index = JSON.parse(fs.readFileSync(path.join(root, 'data', 'archivo-index.json'), 'utf8'));
      var entries = index.entries || [];
      assert(entries.length > 0, 'archivo-index debe tener entradas');
      for (var j = 0; j < entries.length; j++) {
        assert(entries[j].estado, 'entrada ' + entries[j].id + ' debe tener estado');
      }
    });

    it('archivo-index incluye fichas C03 y C04', function () {
      var index = JSON.parse(fs.readFileSync(path.join(root, 'data', 'archivo-index.json'), 'utf8'));
      var ids = (index.entries || []).map(function (e) { return e.id; });
      assert(ids.indexOf('ficha-c03-protocolo-documentacion') !== -1, 'falta C03');
      assert(ids.indexOf('ficha-c04-bomba-viento-norte') !== -1, 'falta C04');
      assert(ids.indexOf('poema-bomba-viento-norte') !== -1, 'falta poema bomba');
    });

    it('narrativa-rescatada.json incluye bloques N1 y N2', function () {
      var narrativa = JSON.parse(fs.readFileSync(path.join(root, 'data', 'narrativa-rescatada.json'), 'utf8'));
      assert(narrativa.presentacion_00, 'debe existir presentacion_00 (N1)');
      assert(narrativa.protocolo_traduccion, 'debe existir protocolo_traduccion (N2)');
      assert(narrativa.ensayo_argumentos, 'debe existir ensayo_argumentos (N4)');
    });
  });
};