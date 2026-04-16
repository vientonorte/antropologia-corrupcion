'use strict';
(function() {
  var DB_NAME = 'contra_archivo_memoria';
  var DB_VERSION = 1;
  var STORE_NAME = 'busquedas';
  var _db = null;

  function isSupported() {
    return !!(window.indexedDB || window.mozIndexedDB ||
              window.webkitIndexedDB || window.msIndexedDB);
  }

  function _getIDB() {
    return window.indexedDB || window.mozIndexedDB ||
           window.webkitIndexedDB || window.msIndexedDB;
  }

  function open() {
    return new Promise(function(resolve, reject) {
      if (_db) { resolve(_db); return; }
      if (!isSupported()) { reject(new Error('IndexedDB no soportado')); return; }

      var request = _getIDB().open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          var store = db.createObjectStore(STORE_NAME, { autoIncrement: true });
          store.createIndex('query', 'query', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = function(event) {
        _db = event.target.result;
        _db.onclose = function() { _db = null; };
        resolve(_db);
      };

      request.onerror = function(event) {
        console.error('MemoriaSearch: error abriendo DB', event.target.error);
        reject(event.target.error);
      };
    });
  }

  function guardar(entry) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var record = {
          query: entry.query || '',
          category: entry.category || '',
          resultCount: entry.resultCount || 0,
          timestamp: entry.timestamp || Date.now(),
          results: entry.results || []
        };
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var request = store.add(record);

        request.onsuccess = function() { resolve(request.result); };
        request.onerror = function(event) {
          console.error('MemoriaSearch: error guardando', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function listar(limit) {
    var max = (typeof limit === 'number' && limit > 0) ? limit : 50;
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var index = store.index('timestamp');
        var results = [];
        var request = index.openCursor(null, 'prev');

        request.onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor && results.length < max) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = function(event) {
          console.error('MemoriaSearch: error listando', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function buscarPorQuery(query) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var index = store.index('query');
        var request = index.getAll(query);

        request.onsuccess = function() { resolve(request.result || []); };
        request.onerror = function(event) {
          console.error('MemoriaSearch: error buscando', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function _normalizar(str) {
    var texto = str.toLowerCase().trim();
    var mapa = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'ü': 'u', 'ñ': 'n'
    };
    var resultado = '';
    for (var i = 0; i < texto.length; i++) {
      resultado += mapa[texto[i]] || texto[i];
    }
    return resultado;
  }

  function _extraerPalabras(str) {
    return _normalizar(str).split(/\s+/).filter(function(w) {
      return w.length > 2;
    });
  }

  function _contarComunes(wordsA, wordsB) {
    var count = 0;
    for (var i = 0; i < wordsA.length; i++) {
      if (wordsB.indexOf(wordsA[i]) !== -1) {
        count++;
      }
    }
    return count;
  }

  function detectarPatrones() {
    return _obtenerTodos().then(function(entries) {
      var groups = {};

      for (var i = 0; i < entries.length; i++) {
        var key = _normalizar(entries[i].query);
        if (!key) continue;
        if (!groups[key]) {
          groups[key] = { query: entries[i].query, count: 0, lastSeen: 0, words: _extraerPalabras(entries[i].query) };
        }
        groups[key].count++;
        if (entries[i].timestamp > groups[key].lastSeen) {
          groups[key].lastSeen = entries[i].timestamp;
          groups[key].query = entries[i].query;
        }
      }

      var frequent = [];
      var keys = Object.keys(groups);
      for (var j = 0; j < keys.length; j++) {
        if (groups[keys[j]].count >= 3) {
          frequent.push(groups[keys[j]]);
        }
      }

      for (var f = 0; f < frequent.length; f++) {
        var related = [];
        for (var k = 0; k < keys.length; k++) {
          var other = groups[keys[k]];
          if (_normalizar(other.query) === _normalizar(frequent[f].query)) continue;
          if (_contarComunes(frequent[f].words, other.words) >= 2) {
            related.push(other.query);
          }
        }
        frequent[f].relatedQueries = related;
        delete frequent[f].words;
      }

      frequent.sort(function(a, b) { return b.count - a.count; });
      return frequent;
    });
  }

  function _obtenerTodos() {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var request = store.getAll();

        request.onsuccess = function() { resolve(request.result || []); };
        request.onerror = function(event) {
          console.error('MemoriaSearch: error obteniendo todos', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function _escaparCSV(valor) {
    var str = String(valor == null ? '' : valor);
    if (str.indexOf('"') !== -1 || str.indexOf(',') !== -1 ||
        str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return '"' + str + '"';
  }

  function exportarCSV() {
    return _obtenerTodos().then(function(entries) {
      var lines = ['Fecha,Consulta,Categoría,Resultados'];

      entries.sort(function(a, b) { return b.timestamp - a.timestamp; });

      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var fecha = new Date(e.timestamp).toISOString();
        lines.push(
          _escaparCSV(fecha) + ',' +
          _escaparCSV(e.query) + ',' +
          _escaparCSV(e.category) + ',' +
          _escaparCSV(e.resultCount)
        );
      }

      return lines.join('\n');
    });
  }

  function limpiar() {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        var store = tx.objectStore(STORE_NAME);
        var request = store.clear();

        request.onsuccess = function() { resolve(); };
        request.onerror = function(event) {
          console.error('MemoriaSearch: error limpiando', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  function contarBusquedas() {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var store = tx.objectStore(STORE_NAME);
        var request = store.count();

        request.onsuccess = function() { resolve(request.result); };
        request.onerror = function(event) {
          console.error('MemoriaSearch: error contando', event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  window.MemoriaSearch = {
    open: open,
    guardar: guardar,
    listar: listar,
    buscarPorQuery: buscarPorQuery,
    detectarPatrones: detectarPatrones,
    exportarCSV: exportarCSV,
    limpiar: limpiar,
    contarBusquedas: contarBusquedas,
    isSupported: isSupported
  };
})();
