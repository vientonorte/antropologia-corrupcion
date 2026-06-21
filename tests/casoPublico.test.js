/**
 * casoPublico.test.js — anonimización C03 en superficies públicas
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

module.exports = function (describe, it, assert, assertEqual) {
  var root = path.join(__dirname, '..');

  function loadCasoPublico(pathname) {
    var sandbox = {
      window: { location: { pathname: pathname || '/index.html' } },
      console: console,
    };
    var code = fs.readFileSync(path.join(root, 'web', 'lib', 'casoPublico.js'), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: 'casoPublico.js' });
    return sandbox.window.CACasoPublico;
  }

  var suraCaso = {
    id: 'sura-gobernanza-datos',
    titulo: 'SURA Investments: Gobernanza de Datos y Separación AFP',
    actores: ['SURA Investments', 'AFP', 'CMF', 'trabajadores afiliados'],
  };

  describe('CACasoPublico — anonimización pública', function () {
    it('siteSurface y graphBootstrap usan capa pública', function () {
      var surface = fs.readFileSync(path.join(root, 'web', 'lib', 'siteSurface.js'), 'utf8');
      var bootstrap = fs.readFileSync(path.join(root, 'src', 'graphBootstrap.js'), 'utf8');
      var index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
      assert(surface.indexOf('CACasoPublico.getPublicLabel') !== -1);
      assert(bootstrap.indexOf('prepareCasos') !== -1);
      assert(index.indexOf('casoPublico.js') !== -1);
    });

    it('en home no expone SURA ni CMF en etiquetas del caso', function () {
      var CP = loadCasoPublico('/antropologia-corrupcion/index.html');
      var label = CP.getPublicLabel(suraCaso);
      assert(label.titulo.indexOf('SURA') === -1, 'titulo sin SURA');
      assert(label.titulo.indexOf('AFP') === -1, 'titulo sin AFP como marca');
      assert(label.actores.join(' ').indexOf('SURA') === -1, 'actores sin SURA');
      assert(label.actores.join(' ').indexOf('CMF') === -1, 'actores sin CMF');
      assert(label.titulo.indexOf('Gobernanza de datos previsionales') !== -1);
    });

    it('en privado conserva titulo original', function () {
      var CP = loadCasoPublico('/privado.html');
      var label = CP.getPublicLabel(suraCaso);
      assertEqual(label.titulo, suraCaso.titulo);
      assertEqual(label.actores[0], 'SURA Investments');
    });

    it('prepareCasos sanitiza descripciones institucionales', function () {
      var CP = loadCasoPublico('/index.html');
      var prepared = CP.prepareCaso({
        id: 'sura-gobernanza-datos',
        titulo: suraCaso.titulo,
        institucional: {
          descripcion: 'SURA opera bajo clasificaciones ESG. La CMF regula los flujos.',
        },
      });
      assert(prepared.institucional.descripcion.indexOf('SURA') === -1);
      assert(prepared.institucional.descripcion.indexOf('CMF') === -1);
    });
  });
};