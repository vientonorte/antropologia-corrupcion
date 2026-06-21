/**
 * Page boot: index.html — organismo tesis, Grafo B y superficies desde JSON.
 */
(function () {
    'use strict';

    function injectThesisSection() {
        var placeholder = document.getElementById('ca-thesis-placeholder');
        if (!placeholder || !window.CAOrganisms || !window.CAOrganisms.thesisSection) return;
        placeholder.outerHTML = window.CAOrganisms.thesisSection.render();
    }

    function shouldEagerGraph() {
        if (window.location.hash === '#tesis') return true;
        if (new URLSearchParams(window.location.search).get('caso')) return true;
        return false;
    }

    function bootGraph() {
        if (!window.GraphBootstrap) return;
        var eager = shouldEagerGraph();
        window.GraphBootstrap.boot({
            mount: '#ca-thesis-mount',
            embedded: true,
            showModeToggle: false,
            lazy: !eager,
        });
        if (eager) {
            requestAnimationFrame(function () {
                var tesis = document.getElementById('tesis');
                if (tesis) tesis.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    function bootSurfaces() {
        if (window.CASiteSurface && window.CASiteSurface.mountHomeSurfaces) {
            window.CASiteSurface.mountHomeSurfaces();
        }
    }

    function onReady() {
        injectThesisSection();
        bootGraph();
        bootSurfaces();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();