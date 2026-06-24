/**
 * graphChunk.js — carga diferida del instrumento Grafo B en home.
 * Evita parsear ~500KB de JS (d3, fieldPhysics, socialField…) antes del scroll.
 */
(function () {
    'use strict';

    var VERSION = '20260628';

    function basePath() {
        var p = location.pathname;
        return p.indexOf('/antropologia-corrupcion/') === 0 ? '/antropologia-corrupcion/' : '/';
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = function () { resolve(); };
            s.onerror = function () { reject(new Error('No se pudo cargar ' + src)); };
            document.head.appendChild(s);
        });
    }

    var SCRIPTS = [
        'src/socialField.js?v=' + VERSION,
        'vendor/d3.min.js?v=7.9.0',
        'src/fieldPhysics.js?v=' + VERSION,
        'src/graph.js?v=' + VERSION,
        'src/nodeRenderer.js?v=20260621d',
        'lib/huellaDigital.js?v=20260621',
        'src/graphBootstrap.js?v=' + VERSION,
    ];

    var promise = null;

    function whenReady() {
        if (window.GraphBootstrap && window.FrictionGraph && window.SocialField) {
            return Promise.resolve();
        }
        if (!promise) {
            var base = basePath();
            promise = SCRIPTS.reduce(function (chain, rel) {
                return chain.then(function () { return loadScript(base + rel); });
            }, Promise.resolve());
        }
        return promise;
    }

    window.CAGraphChunk = {
        VERSION: VERSION,
        whenReady: whenReady,
        scripts: SCRIPTS,
    };
}());