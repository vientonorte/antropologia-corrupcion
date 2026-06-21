/**
 * lib/dataLoader.js
 * Carga y cache del corpus público (fuentes, casos, BCN, huella).
 */
(function () {
    'use strict';

    var cache = null;

    function resolveDataPath(filename) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function normalizeFuentes(fuentesRaw) {
        if (Array.isArray(fuentesRaw)) return fuentesRaw;
        if (!fuentesRaw) return [];
        return fuentesRaw.registros || fuentesRaw.fuentes || [];
    }

    function normalizeBcnRecords(bcnData) {
        if (typeof window.normalizeBcnDataset === 'function') {
            return window.normalizeBcnDataset(bcnData);
        }
        if (window.CAHuellaDigital && window.CAHuellaDigital.normalizeBcnRecords) {
            return window.CAHuellaDigital.normalizeBcnRecords(bcnData);
        }
        return [];
    }

    function loadCorpusBundle(options) {
        options = options || {};
        if (cache && !options.force) {
            return Promise.resolve(cache);
        }

        var fetches = [
            fetch(resolveDataPath('fuentes-oficiales.json')).then(function (r) {
                return r.json();
            }),
            fetch(resolveDataPath('casos.json')).then(function (r) {
                return r.json();
            }),
            fetch(resolveDataPath('bcn-legislativo.json')).then(function (r) {
                return r.json();
            }),
        ];

        if (options.includeHuella !== false) {
            fetches.push(
                fetch(resolveDataPath('huella-digital-publica.json')).then(function (r) {
                    return r.ok ? r.json() : { entidades: [], trazas: [] };
                }),
            );
        }

        return Promise.all(fetches).then(function (results) {
            var fuentesRaw = results[0];
            var casosData = results[1];
            var bcnData = results[2];
            var huella = results[3] || { entidades: [], trazas: [] };
            var registros = normalizeFuentes(fuentesRaw);
            var bcnRecords = normalizeBcnRecords(bcnData);
            var casos = casosData.casos || casosData;

            cache = {
                huella: huella,
                fuentesRaw: fuentesRaw,
                fuentes: registros,
                bcn: bcnData,
                bcnRecords: bcnRecords,
                casos: casos,
                casosData: casosData,
                allRecords: registros.concat(bcnRecords),
            };
            return cache;
        });
    }

    window.CADataLoader = {
        loadCorpusBundle: loadCorpusBundle,
        resolveDataPath: resolveDataPath,
        normalizeFuentes: normalizeFuentes,
        normalizeBcnRecords: normalizeBcnRecords,
        getCached: function () {
            return cache;
        },
        clearCache: function () {
            cache = null;
        },
    };
})();