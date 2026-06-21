/**
 * Page boot: leer.html — narrativa desde JSON
 */
(function () {
    'use strict';

    function onReady() {
        var root = document.getElementById('narrative-root');
        if (root && window.CANarrativeRenderer) {
            window.CANarrativeRenderer.render(root);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();