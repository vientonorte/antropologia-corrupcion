'use strict';
(function() {
  var STORAGE_KEY = 'ca_seguimientos';
  var TIPOS_VALIDOS = ['actor', 'institucion', 'ley', 'caso'];

  function _normalize(str) {
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function _leer() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Seguimientos: error leyendo localStorage', e);
      return [];
    }
  }

  function _guardar(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Seguimientos: error escribiendo localStorage', e);
    }
  }

  function _generarId() {
    var rand;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      rand = arr[0].toString(36) + arr[1].toString(36);
    } else {
      rand = String(Math.random()).slice(2, 10) + String(Math.random()).slice(2, 10);
    }
    return String(Date.now()) + '-' + rand;
  }

  function seguir(item) {
    if (!item || !item.nombre || !item.tipo) return null;
    if (TIPOS_VALIDOS.indexOf(item.tipo) === -1) return null;

    var ahora = Date.now();
    var nuevo = {
      id: _generarId(),
      tipo: item.tipo,
      nombre: String(item.nombre),
      tags: Array.isArray(item.tags) ? item.tags.slice() : [],
      fechaCreacion: ahora,
      ultimaRevision: ahora,
      notas: item.notas ? String(item.notas) : ''
    };

    var items = _leer();
    items.push(nuevo);
    _guardar(items);
    return nuevo;
  }

  function dejarDeSeguir(id) {
    var items = _leer();
    var filtrado = items.filter(function(it) { return it.id !== id; });
    if (filtrado.length === items.length) return false;
    _guardar(filtrado);
    return true;
  }

  function listar(filtroTipo) {
    var items = _leer();
    if (!filtroTipo) return items;
    return items.filter(function(it) { return it.tipo === filtroTipo; });
  }

  function buscar(query) {
    if (!query) return [];
    var norm = _normalize(query);
    if (!norm) return [];
    var items = _leer();
    return items.filter(function(it) {
      return _normalize(it.nombre).indexOf(norm) !== -1;
    });
  }

  function _encontrar(items, id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return i;
    }
    return -1;
  }

  function actualizarNota(id, nota) {
    var items = _leer();
    var idx = _encontrar(items, id);
    if (idx === -1) return false;
    items[idx].notas = String(nota);
    items[idx].ultimaRevision = Date.now();
    _guardar(items);
    return true;
  }

  function agregarTag(id, tag) {
    if (!tag) return false;
    var tagStr = String(tag);
    var items = _leer();
    var idx = _encontrar(items, id);
    if (idx === -1) return false;
    if (items[idx].tags.indexOf(tagStr) !== -1) return false;
    items[idx].tags.push(tagStr);
    items[idx].ultimaRevision = Date.now();
    _guardar(items);
    return true;
  }

  function quitarTag(id, tag) {
    if (!tag) return false;
    var tagStr = String(tag);
    var items = _leer();
    var idx = _encontrar(items, id);
    if (idx === -1) return false;
    var tagIdx = items[idx].tags.indexOf(tagStr);
    if (tagIdx === -1) return false;
    items[idx].tags.splice(tagIdx, 1);
    items[idx].ultimaRevision = Date.now();
    _guardar(items);
    return true;
  }

  function _escaparCSV(val) {
    var str = String(val);
    if (str.indexOf('"') !== -1 || str.indexOf(',') !== -1 || str.indexOf('\n') !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function exportarCSV() {
    var items = _leer();
    var lineas = ['ID,Tipo,Nombre,Tags,Fecha,Nota'];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var fecha = new Date(it.fechaCreacion).toISOString();
      lineas.push([
        _escaparCSV(it.id),
        _escaparCSV(it.tipo),
        _escaparCSV(it.nombre),
        _escaparCSV(it.tags.join('; ')),
        _escaparCSV(fecha),
        _escaparCSV(it.notas)
      ].join(','));
    }
    return lineas.join('\n');
  }

  function importarJSON(json) {
    var nuevos;
    if (typeof json === 'string') {
      try {
        nuevos = JSON.parse(json);
      } catch (e) {
        console.error('Seguimientos: JSON inválido en importarJSON', e);
        return 0;
      }
    } else {
      nuevos = json;
    }
    if (!Array.isArray(nuevos)) return 0;

    var items = _leer();
    var agregados = 0;

    var existentes = {};
    for (var k = 0; k < items.length; k++) {
      existentes[items[k].tipo + ':' + items[k].nombre] = true;
    }

    for (var i = 0; i < nuevos.length; i++) {
      var n = nuevos[i];
      if (!n || !n.nombre || !n.tipo) continue;
      if (TIPOS_VALIDOS.indexOf(n.tipo) === -1) continue;

      var clave = n.tipo + ':' + n.nombre;
      if (existentes[clave]) continue;

      var ahora = Date.now();
      existentes[clave] = true;
      items.push({
        id: n.id || _generarId(),
        tipo: n.tipo,
        nombre: String(n.nombre),
        tags: Array.isArray(n.tags) ? n.tags.slice() : [],
        fechaCreacion: n.fechaCreacion || ahora,
        ultimaRevision: n.ultimaRevision || ahora,
        notas: n.notas ? String(n.notas) : ''
      });
      agregados++;
    }

    _guardar(items);
    return agregados;
  }

  function contarPorTipo() {
    var items = _leer();
    var conteo = { actor: 0, institucion: 0, ley: 0, caso: 0 };
    for (var i = 0; i < items.length; i++) {
      if (conteo.hasOwnProperty(items[i].tipo)) {
        conteo[items[i].tipo]++;
      }
    }
    return conteo;
  }

  function tieneNuevos(desde) {
    var ts = Number(desde);
    var items = _leer();
    return items.filter(function(it) { return it.ultimaRevision > ts; });
  }

  function marcarRevisado(id) {
    var items = _leer();
    var idx = _encontrar(items, id);
    if (idx === -1) return false;
    items[idx].ultimaRevision = Date.now();
    _guardar(items);
    return true;
  }

  window.Seguimientos = {
    seguir: seguir,
    dejarDeSeguir: dejarDeSeguir,
    listar: listar,
    buscar: buscar,
    actualizarNota: actualizarNota,
    agregarTag: agregarTag,
    quitarTag: quitarTag,
    exportarCSV: exportarCSV,
    importarJSON: importarJSON,
    contarPorTipo: contarPorTipo,
    tieneNuevos: tieneNuevos,
    marcarRevisado: marcarRevisado
  };
})();
