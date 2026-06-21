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

    it('heic2any está vendoreado localmente', function () {
      var vendor = path.join(web, 'vendor', 'heic2any.min.js');
      assert(fs.existsSync(vendor), 'vendor/heic2any.min.js existe');
      var stat = fs.statSync(vendor);
      assert(stat.size > 100000, 'heic2any no está vacío');
    });

    it('lectura-clave-b expone escaneo automático', function () {
      var code = fs.readFileSync(path.join(web, 'js', 'lectura-clave-b.js'), 'utf8');
      assert(code.indexOf('autoScanFragments') !== -1, 'autoScanFragments definido');
      assert(code.indexOf('detectMarkedRegions') !== -1, 'detectMarkedRegions definido');
      assert(code.indexOf('claveBAutoScan') !== -1, 'botón auto scan cableado');
    });
  });
};