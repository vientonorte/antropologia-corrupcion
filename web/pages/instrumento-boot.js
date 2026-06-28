/**
 * Page boot: contra-archivo-v2.html — instrumento dedicado (Grafo B).
 * Paridad con home-boot: graphChunk, ?caso=, métricas corpus.
 */
(function () {
    'use strict';

    function injectThesisSection() {
        var placeholder = document.getElementById('ca-thesis-placeholder');
        if (!placeholder || !window.CAOrganisms || !window.CAOrganisms.thesisSection) return;
        placeholder.outerHTML = window.CAOrganisms.thesisSection.render();
    }

    function ensureGraphChunk(onReady) {
        if (window.GraphBootstrap) {
            onReady();
            return;
        }
        if (!window.CAGraphChunk || !window.CAGraphChunk.whenReady) {
            console.error('[instrumento-boot] CAGraphChunk no disponible');
            return;
        }
        window.CAGraphChunk.whenReady().then(onReady).catch(function (err) {
            console.error('[instrumento-boot] Error cargando grafo:', err);
            var mount = document.getElementById('ca-thesis-mount');
            if (mount) mount.classList.remove('is-loading');
        });
    }

    function bootGraph() {
        ensureGraphChunk(function () {
            if (!window.GraphBootstrap) return;
            window.GraphBootstrap.boot({
                mount: '#ca-thesis-mount',
                embedded: true,
                showModeToggle: false,
                lazy: false,
            });
            requestAnimationFrame(function () {
                var tesis = document.getElementById('tesis');
                if (tesis) tesis.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function bootCorpusMetrics() {
        if (!window.CADataLoader) return Promise.resolve();

        return window.CADataLoader.loadCorpusBundle({ includeHuella: false })
            .then(function (bundle) {
                var report =
                    window.CABasesConsultadas && window.CABasesConsultadas.buildFromBundle
                        ? window.CABasesConsultadas.buildFromBundle(bundle)
                        : null;

                if (window.CACorpusStats) {
                    window.CACorpusStats.mount('ca-instrumento-corpus-stats', bundle, report);
                }
            })
            .catch(function () {
                /* métricas opcionales — el grafo sigue operativo */
            });
    }

    function onReady() {
        injectThesisSection();
        bootGraph();
        bootCorpusMetrics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();