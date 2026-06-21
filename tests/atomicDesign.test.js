/**
 * atomicDesign.test.js — Gates evolutivos Atomic Design (capas + registry)
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {
  var root = path.join(__dirname, '..');
  var registryPath = path.join(root, 'data', 'atomic-registry.json');
  var registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  function readComponent(rel) {
    return fs.readFileSync(path.join(root, rel), 'utf8');
  }

  function readWebHtml(rel) {
    return fs.readFileSync(path.join(root, rel), 'utf8');
  }

  describe('Atomic Design — reglas de capa (import)', function () {
    it('átomos no referencian moléculas ni organismos', function () {
      var atomsDir = path.join(root, 'web', 'components', 'atoms');
      var files = fs.readdirSync(atomsDir).filter(function (f) { return f.endsWith('.js'); });
      var forbidden = [/CAMolecules/i, /CAOrganisms/i, /components\/molecules/i, /components\/organisms/i];
      files.forEach(function (file) {
        var content = readComponent(path.join('web', 'components', 'atoms', file));
        forbidden.forEach(function (re) {
          assert(!re.test(content), file + ' viola capa átomo: ' + re.source);
        });
      });
    });

    it('moléculas no referencian organismos', function () {
      var molDir = path.join(root, 'web', 'components', 'molecules');
      var files = fs.readdirSync(molDir).filter(function (f) { return f.endsWith('.js'); });
      var forbidden = [/CAOrganisms/i, /components\/organisms/i];
      files.forEach(function (file) {
        var content = readComponent(path.join('web', 'components', 'molecules', file));
        forbidden.forEach(function (re) {
          assert(!re.test(content), file + ' viola capa molécula: ' + re.source);
        });
      });
    });
  });

  describe('Atomic Design — registry de componentes', function () {
    it('existe atomic-registry.json con sprint y pipeline', function () {
      assert(registry.sprint, 'debe definir sprint evolutivo');
      assert(registry.devops_pipeline, 'debe mapear gates DevOps');
      assert(registry.components.atoms.length >= 3, 'mínimo 3 átomos');
    });

    it('cada componente JS declarado existe en disco', function () {
      ['atoms', 'molecules', 'organisms'].forEach(function (layer) {
        (registry.components[layer] || []).forEach(function (c) {
          if (!c.js) return;
          assert(fs.existsSync(path.join(root, c.js)), c.id + ' falta en ' + c.js);
        });
      });
    });

    it('CSS de componente existe cuando está declarado', function () {
      var all = []
        .concat(registry.components.atoms)
        .concat(registry.components.molecules)
        .concat(registry.components.organisms);
      all.forEach(function (c) {
        if (!c.css) return;
        assert(fs.existsSync(path.join(root, c.css)), c.id + ' CSS faltante: ' + c.css);
      });
    });
  });

  describe('Atomic Design — superficies partial (wave 2–3)', function () {
    var partial = registry.surfaces.filter(function (s) {
      return s.maturity === 'partial' || s.maturity === 'full';
    });

    partial.forEach(function (surface) {
      it(surface.surface + ' (' + surface.path + ') cumple scripts requeridos', function () {
        var html = readWebHtml(surface.path);
        (surface.required_scripts || []).forEach(function (script) {
          assert(html.indexOf(script) !== -1, surface.surface + ' falta ' + script);
        });
      });
    });

    it('P01 monta thesis-section y home-boot', function () {
      var html = readWebHtml('web/index.html');
      assert(html.indexOf('thesis-section.js') !== -1);
      assert(html.indexOf('home-boot.js') !== -1);
      assert(html.indexOf('ca-thesis-mount') !== -1 || html.indexOf('thesis-section') !== -1);
    });

    it('P03 monta circuito huella', function () {
      var html = readWebHtml('web/buscador.html');
      assert(html.indexOf('huellaDigital.js') !== -1);
      assert(html.indexOf('huella-panel.css') !== -1);
    });
  });

  describe('Atomic Design — alineación ia-inventario', function () {
    it('superficies P01/P03/P05 del registry existen en ia-inventario', function () {
      var ia = JSON.parse(fs.readFileSync(path.join(root, 'data', 'ia-inventario.json'), 'utf8'));
      var paths = ia.surfaces.map(function (s) { return s.file; });
      ['web/index.html', 'web/buscador.html', 'web/leer.html'].forEach(function (p) {
        assert(paths.indexOf(p) !== -1, p + ' debe estar en ia-inventario');
      });
    });
  });
};