/**
 * main.js — Entry legacy fullscreen (delega en GraphBootstrap)
 * Preferir GraphBootstrap.boot() en landing embebido.
 */
'use strict';

if (window.GraphBootstrap) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            window.GraphBootstrap.waitForModules(function () {
                window.GraphBootstrap.init({
                    embedded: false,
                    showModeToggle: true,
                    mount: null,
                });
            });
        });
    } else {
        window.GraphBootstrap.waitForModules(function () {
            window.GraphBootstrap.init({
                embedded: false,
                showModeToggle: true,
                mount: null,
            });
        });
    }
}