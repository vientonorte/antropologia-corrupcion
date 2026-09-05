/**
 * lecturaClaveB.test.js — N marcadores en una foto de página completa
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

module.exports = function (describe, it, assert, assertEqual) {
  var code = fs.readFileSync(
    path.join(__dirname, '..', 'web', 'js', 'lectura-clave-b.js'),
    'utf8'
  );
  var sandbox = { window: {}, globalThis: {}, console: console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  var LB = sandbox.LecturaClaveB;
  assert(LB, 'LecturaClaveB export');

  describe('3 marcadores en página completa', function () {
    var W = 640;
    var H = 640;

    it('una foto entera SÍ es page-sized', function () {
      assert(LB.isPageSized(W, H, W, H), 'canvas completo');
      assert(LB.isPageSized(600, 500, W, H), 'casi toda la página');
    });

    it('una línea resaltada NO es page-sized', function () {
      assert(!LB.isPageSized(420, 28, W, H), 'highlight de una línea');
      assert(!LB.isPageSized(500, 80, W, H), 'párrafo corto resaltado');
    });

    it('expande 3 marcadores separados en la misma página', function () {
      var marks = [
        { x: 80, y: 140, w: 420, h: 26, color: 'pink' },
        { x: 80, y: 280, w: 390, h: 24, color: 'green' },
        { x: 90, y: 430, w: 400, h: 30, color: 'blue' },
      ];
      var kept = [];
      for (var i = 0; i < marks.length; i++) {
        var out = LB.expandRegionForOcr(marks[i], W, H);
        assert(out, 'marcador ' + (i + 1) + ' no debe tumbarse');
        assert(!LB.isPageSized(out.w, out.h, W, H), 'marcador ' + (i + 1) + ' no es página');
        kept.push(out);
      }
      assertEqual(kept.length, 3, 'tres fragmentos vivos');
    });

    it('pestaña de margen alta y estrecha se descarta', function () {
      assert(LB.isMarginTab({ w: 36, h: 90, x: 580, y: 200 }, W), 'tab lateral');
      assert(!LB.isMarginTab({ w: 420, h: 26, x: 80, y: 140 }, W), 'línea resaltada');
    });

    it('no tumba un párrafo al aplicar padding (antes: 13% + pad = null)', function () {
      var almostCap = { x: 40, y: 200, w: 500, h: Math.round(H * 0.12), color: 'pink' };
      var out = LB.expandRegionForOcr(almostCap, W, H);
      assert(out, 'padding no debe anular un highlight del 12%');
    });

    it('N marcadores del mismo color en una página (sin tope de 3)', function () {
      var n = 12;
      var points = [];
      for (var i = 0; i < n; i++) {
        var y = 40 + i * 48;
        for (var x = 80; x < 500; x += 8) {
          points.push({ x: x, y: y });
          points.push({ x: x, y: y + 4 });
        }
      }
      var boxes = LB.boxesFromColorPoints('pink', points, W, H);
      assert(boxes.length >= n, 'esperaba ≥' + n + ' cajas, hay ' + boxes.length);
      boxes.forEach(function (b, idx) {
        assert(!LB.isPageSized(b.w, b.h, W, H), 'caja ' + idx + ' no es página entera');
      });
    });

    it('splitClusterByRows no recorta a 3', function () {
      var points = [];
      for (var i = 0; i < 9; i++) {
        points.push({ x: 100, y: i * 40 });
        points.push({ x: 180, y: i * 40 });
        points.push({ x: 260, y: i * 40 });
      }
      var rows = LB.splitClusterByRows(points, 15);
      assertEqual(rows.length, 9, '9 renglones');
    });
  });
};
