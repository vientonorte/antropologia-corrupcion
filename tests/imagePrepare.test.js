/**
 * imagePrepare.test.js — detección MIME, magic bytes HEIC, formatos admitidos
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

module.exports = function (describe, it, assert, assertEqual) {
  var web = path.join(__dirname, '..', 'web');

  function loadCAImagePrepare() {
    var code = fs.readFileSync(path.join(web, 'lib', 'imagePrepare.js'), 'utf8');
    var sandbox = {
      window: {},
      globalThis: {},
      document: {
        createElement: function () {
          return {
            getContext: function () { return null; },
            width: 0,
            height: 0,
          };
        },
        head: { appendChild: function () {} },
      },
      URL: {
        createObjectURL: function () { return 'blob:mock'; },
        revokeObjectURL: function () {},
      },
      Image: function () {
        this.naturalWidth = 0;
        this.naturalHeight = 0;
        this.onload = null;
        this.onerror = null;
      },
      Blob: function () {},
      atob: function () { return ''; },
      FileReader: function () {
        this.onload = null;
        this.onerror = null;
        this.readAsArrayBuffer = function () {};
      },
      console: console,
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    vm.runInNewContext(code, sandbox);
    return sandbox.CAImagePrepare;
  }

  describe('CAImagePrepare — formatos', function () {
    var CA;

    it('carga el módulo', function () {
      CA = loadCAImagePrepare();
      assert(CA, 'CAImagePrepare definido');
      assertEqual(CA.MAX_BYTES, 20 * 1024 * 1024);
    });

    it('detecta HEIC por extensión sin MIME', function () {
      CA = CA || loadCAImagePrepare();
      var file = { name: 'IMG_1211.HEIC', type: '', size: 1024 };
      assert(CA.isHeic(file), 'HEIC por extensión');
      assert(CA.isSupportedImage(file), 'HEIC admitido');
      assertEqual(CA.resolveMime(file), 'image/heic');
    });

    it('detecta HEIC disfrazado de JPG por magic bytes (IMG_1210.jpg iPhone)', function () {
      CA = CA || loadCAImagePrepare();
      var sample = fs.readFileSync(path.join(__dirname, '..', 'tests', 'fixtures', 'heic-header.bin'));
      assertEqual(CA.sniffHeifBrand(sample), 'heic');
      var fakeJpg = { name: 'IMG_1210.jpg', type: 'image/jpeg', size: 1483683 };
      assert(CA.isHeic(fakeJpg, 'heic'), 'HEIC aunque diga .jpg');
    });

    it('detecta JPEG real por extensión', function () {
      CA = CA || loadCAImagePrepare();
      var file = { name: 'foto.jpg', type: 'application/octet-stream', size: 1024 };
      assert(!CA.isHeic(file));
      assert(CA.isSupportedImage(file));
      assertEqual(CA.resolveMime(file), 'image/jpeg');
    });

    it('rechaza archivos sin imagen', function () {
      CA = CA || loadCAImagePrepare();
      var file = { name: 'notas.pdf', type: 'application/pdf', size: 1024 };
      assert(!CA.isSupportedImage(file));
    });

    it('convertidores HEIC vendoreados localmente', function () {
      var heic2any = path.join(web, 'vendor', 'heic2any.min.js');
      var heicTo = path.join(web, 'vendor', 'heic-to.js');
      assert(fs.existsSync(heic2any), 'vendor/heic2any.min.js existe');
      assert(fs.existsSync(heicTo), 'vendor/heic-to.js existe');
      assert(fs.statSync(heic2any).size > 100000, 'heic2any no está vacío');
      assert(fs.statSync(heicTo).size > 1000000, 'heic-to no está vacío');
    });

    it('imagePrepare usa heic-to como convertidor principal', function () {
      var code = fs.readFileSync(path.join(web, 'lib', 'imagePrepare.js'), 'utf8');
      assert(code.indexOf('heic-to') !== -1, 'referencia heic-to');
      assert(code.indexOf('ensureHeicTo') !== -1, 'carga heic-to');
    });

    it('lectura-clave-b expone escaneo automático', function () {
      var code = fs.readFileSync(path.join(web, 'js', 'lectura-clave-b.js'), 'utf8');
      assert(code.indexOf('autoScanFragments') !== -1, 'autoScanFragments definido');
      assert(code.indexOf('detectMarkedRegions') !== -1, 'detectMarkedRegions definido');
      assert(code.indexOf('claveBAutoScan') !== -1, 'botón auto scan cableado');
    });
  });
};