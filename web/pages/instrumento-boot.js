/**
 * Page boot: contra-archivo-v2.html — instrumento (Grafo B) sin duplicar home.
 */
(function () {
    'use strict';

    function injectThesisSection() {
        var placeholder = document.getElementById('ca-thesis-placeholder');
        if (!placeholder || !window.CAOrganisms || !window.CAOrganisms.thesisSection) return;
        placeholder.outerHTML = window.CAOrganisms.thesisSection.render();
    }

    function bootGraph() {
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
    }

    function onReady() {
        injectThesisSection();
        bootGraph();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();