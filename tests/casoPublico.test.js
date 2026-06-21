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
      document: {
        readyState: 'complete',
        addEventListener: function () {},
      },
      console: console,
      setTimeout: function (fn) {
        fn();
      },
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
    it('superficies clave cargan capa pública', function () {
      var surface = fs.readFileSync(path.join(root, 'web', 'lib', 'siteSurface.js'), 'utf8');
      var bootstrap = fs.readFileSync(path.join(root, 'src', 'graphBootstrap.js'), 'utf8');
      var index = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
      var buscador = fs.readFileSync(path.join(root, 'web', 'buscador.html'), 'utf8');
      var dataLoader = fs.readFileSync(path.join(root, 'web', 'lib', 'dataLoader.js'), 'utf8');
      var sharedShell = fs.readFileSync(path.join(root, 'web', 'shared-shell.js'), 'utf8');
      assert(surface.indexOf('CACasoPublico.getPublicLabel') !== -1);
      assert(bootstrap.indexOf('prepareCasos') !== -1);
      assert(index.indexOf('casoPublico.js') !== -1);
      assert(buscador.indexOf('casoPublico.js') !== -1);
      assert(dataLoader.indexOf('prepareCorpusBundle') !== -1);
      assert(sharedShell.indexOf('preloadCasoPublico') !== -1);
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

    it('prepareHuella anonimiza entidades y consultas semilla', function () {
      var CP = loadCasoPublico('/buscador.html');
      var huella = {
        entidades: [{
          id: 'ent-sura-investments',
          nombre: 'SURA Investments',
          aliases: ['SURA Asset Management', 'AFP UNO'],
        }],
        consultas_semilla: [{
          pregunta: 'Que huella publica deja SURA Investments entre SII, Transparencia, CMF y BCN?',
        }],
        trazas: [{
          descripcion: 'Cruzar carteras AFP y reportes CMF de SURA Investments.',
          pasos_llm: ['Cruzar con resoluciones CMF'],
        }],
      };
      var prepared = CP.prepareHuella(huella);
      assert(prepared.entidades[0].nombre.indexOf('SURA') === -1);
      assert(prepared.entidades[0].aliases.join(' ').indexOf('SURA') === -1);
      assert(prepared.consultas_semilla[0].pregunta.indexOf('SURA') === -1);
      assert(prepared.consultas_semilla[0].pregunta.indexOf('CMF') === -1);
      assert(prepared.trazas[0].descripcion.indexOf('SURA') === -1);
    });

    it('sanitizeRecord limpia registros de fuentes oficiales', function () {
      var CP = loadCasoPublico('/buscador.html');
      var record = CP.sanitizeRecord({
        titulo: 'Audiencia SURA-CMF sobre carteras AFP',
        institucion: 'Comisión para el Mercado Financiero',
        actores_lobby: ['SURA Investments', 'AFP UNO'],
      });
      assert(record.titulo.indexOf('SURA') === -1);
      assert(record.titulo.indexOf('CMF') === -1);
      assert(record.institucion.indexOf('Comisión para el Mercado Financiero') === -1);
      assert(record.actores_lobby.join(' ').indexOf('SURA') === -1);
    });

    it('prepareCorpusBundle sanitiza bundle completo', function () {
      var CP = loadCasoPublico('/index.html');
      var bundle = CP.prepareCorpusBundle({
        huella: {
          entidades: [{ id: 'ent-sura-investments', nombre: 'SURA Investments', aliases: [] }],
        },
        fuentes: [{ titulo: 'Informe SURA ante CMF' }],
        bcnRecords: [{ titulo: 'Tramitación multifondos CMF' }],
        casos: [suraCaso],
        casosData: { casos: [suraCaso] },
        allRecords: [{ titulo: 'Informe SURA ante CMF' }],
      });
      assert(bundle.casos[0].titulo.indexOf('SURA') === -1);
      assert(bundle.fuentes[0].titulo.indexOf('SURA') === -1);
      assert(bundle.huella.entidades[0].nombre.indexOf('SURA') === -1);
      assert(bundle.allRecords[0].titulo.indexOf('SURA') === -1);
    });

    it('nodeRenderer aplica sanitizeText en _esc', function () {
      var renderer = fs.readFileSync(path.join(root, 'src', 'nodeRenderer.js'), 'utf8');
      assert(renderer.indexOf('CACasoPublico.sanitizeText') !== -1);
    });
  });
};