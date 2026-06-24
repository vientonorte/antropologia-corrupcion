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

    function ensureGraphChunk(onReady) {
        if (window.GraphBootstrap) {
            onReady();
            return;
        }
        if (!window.CAGraphChunk || !window.CAGraphChunk.whenReady) {
            console.error('[home-boot] CAGraphChunk no disponible');
            return;
        }
        window.CAGraphChunk.whenReady().then(onReady).catch(function (err) {
            console.error('[home-boot] Error cargando instrumento:', err);
            var mount = document.getElementById('ca-thesis-mount');
            if (mount) mount.classList.remove('is-loading');
        });
    }

    function scheduleGraphBoot() {
        var run = function () {
            ensureGraphChunk(function () {
                if (!window.GraphBootstrap) return;
                window.GraphBootstrap.boot({
                    mount: '#ca-thesis-mount',
                    embedded: true,
                    showModeToggle: false,
                    lazy: false,
                });
                if (shouldEagerGraph()) {
                    requestAnimationFrame(function () {
                        var tesis = document.getElementById('tesis');
                        if (tesis) tesis.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
            });
        };

        if (shouldEagerGraph()) {
            run();
            return;
        }

        var mount = document.getElementById('ca-thesis-mount');
        if (!mount || typeof IntersectionObserver === 'undefined') {
            run();
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                if (entries.some(function (e) { return e.isIntersecting; })) {
                    observer.disconnect();
                    run();
                }
            },
            { rootMargin: '280px' },
        );
        observer.observe(mount);
    }

    function bootSurfaces() {
        if (window.CASiteSurface && window.CASiteSurface.mountHomeSurfaces) {
            window.CASiteSurface.mountHomeSurfaces();
        }
    }

    function onReady() {
        injectThesisSection();
        scheduleGraphBoot();
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(bootSurfaces, { timeout: 2000 });
        } else {
            setTimeout(bootSurfaces, 120);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();