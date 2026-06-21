/**
 * bibliotecaLoader.js — Catálogo desde archivo-index.json (fuente única)
 */
(function () {
    'use strict';

    var GITHUB_BLOB =
        'https://github.com/vientonorte/antropologia-corrupcion/blob/main/';

    var PUBLIC_STATES = ['publicable', 'publicable_resumen', 'en revisión'];

    var TIPO_FILTER = {
        ficha: 'ficha',
        dossier: 'corpus',
        poemario: 'poemario',
        articulo: 'investigacion',
        ensayo: 'ensayo',
        biblioteca: 'tesis',
    };

    function resolveDataPath(filename) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function normalizeHref(entry) {
        if (entry.corpus_url) return entry.corpus_url;
        if (entry.grafo_url) return entry.grafo_url;
        var url = entry.url || '#';
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
        return url;
    }

    function iconForTipo(tipo) {
        switch (tipo) {
            case 'ficha': return '◫';
            case 'dossier': return '⑤';
            case 'poemario': return '◦';
            case 'articulo': return '◈';
            case 'ensayo': return '◎';
            case 'biblioteca': return '⊘';
            default: return '·';
        }
    }

    function mapEntry(entry) {
        var disponible = entry.estado === 'publicable' || entry.estado === 'publicable_resumen';
        return {
            id: entry.id,
            titulo: entry.titulo,
            tipo: TIPO_FILTER[entry.tipo] || entry.tipo,
            anio: entry.anio || 2026,
            desc: entry.descripcion || '',
            href: normalizeHref(entry),
            icono: iconForTipo(entry.tipo),
            nivel: entry.nivel || 'publico',
            disponible: entry.disponible !== false && disponible,
            external: (entry.url || '').indexOf('github.com') !== -1,
        };
    }

    function loadCatalog() {
        return fetch(resolveDataPath('archivo-index.json'))
            .then(function (res) {
                if (!res.ok) throw new Error('archivo-index no disponible');
                return res.json();
            })
            .then(function (payload) {
                return (payload.entries || [])
                    .filter(function (e) {
                        return PUBLIC_STATES.indexOf(e.estado) !== -1;
                    })
                    .map(mapEntry);
            });
    }

    window.CABiblioteca = {
        loadCatalog: loadCatalog,
        mapEntry: mapEntry,
        PUBLIC_STATES: PUBLIC_STATES,
        GITHUB_BLOB: GITHUB_BLOB,
    };
})();