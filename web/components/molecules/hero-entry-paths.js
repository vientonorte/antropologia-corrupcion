/**
 * Molecule: rutas de entrada del inicio público (grafo · leer · buscar)
 */
(function () {
    'use strict';

    var dom = window.CAAtoms && window.CAAtoms.dom;

    function esc(str) {
        if (dom) return dom.escapeHtml(str);
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function render() {
        return (
            '<nav class="ca-hero-paths" aria-label="Rutas de exploración">' +
            '<a class="ca-hero-paths__card" href="index.html#tesis" data-ca-path="grafo">' +
            '<span class="ca-hero-paths__kicker">Instrumento</span>' +
            '<span class="ca-hero-paths__title">Ver la tesis en el grafo</span>' +
            '<span class="ca-hero-paths__meta">Fricción epistemológica · I = V/R · casos etnográficos</span>' +
            '</a>' +
            '<a class="ca-hero-paths__card" href="leer.html" data-ca-path="leer">' +
            '<span class="ca-hero-paths__kicker">Narrativa</span>' +
            '<span class="ca-hero-paths__title">Leer el marco doctoral</span>' +
            '<span class="ca-hero-paths__meta">Mistranslation institucional · ensayo · protocolo</span>' +
            '</a>' +
            '<button type="button" class="ca-hero-paths__card ca-hero-paths__card--action" data-ca-path="buscar" ' +
            'aria-label="Ir a la búsqueda pública">' +
            '<span class="ca-hero-paths__kicker">Exploración</span>' +
            '<span class="ca-hero-paths__title">Buscar actor o ley</span>' +
            '<span class="ca-hero-paths__meta">Fuentes oficiales chilenas · score de fricción · ' +
            '<a href="buscador.html" class="ca-hero-paths__link">avanzada</a></span>' +
            '</button>' +
            '</nav>'
        );
    }

    function wire(container) {
        if (!container) return;

        var buscarBtn = container.querySelector('[data-ca-path="buscar"]');
        if (buscarBtn) {
            buscarBtn.addEventListener('click', function (e) {
                if (e.target && e.target.closest && e.target.closest('.ca-hero-paths__link')) return;
                var input = document.getElementById('search-input');
                if (input) {
                    input.focus({ preventScroll: false });
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }

        container.querySelectorAll('.ca-hero-paths__link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });

        var grafoLink = container.querySelector('[data-ca-path="grafo"]');
        if (grafoLink) {
            grafoLink.addEventListener('click', function (e) {
                e.preventDefault();
                var scrollTesis = function () {
                    var tesis = document.getElementById('tesis');
                    if (tesis) tesis.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                var bootGraph = function () {
                    if (window.GraphBootstrap && typeof window.GraphBootstrap.boot === 'function') {
                        window.GraphBootstrap.boot({
                            mount: '#ca-thesis-mount',
                            embedded: true,
                            showModeToggle: false,
                            lazy: false,
                        });
                    }
                    scrollTesis();
                };
                if (window.CAGraphChunk && window.CAGraphChunk.whenReady) {
                    window.CAGraphChunk.whenReady().then(bootGraph);
                } else {
                    bootGraph();
                }
            });
        }
    }

    function mount(containerId) {
        var el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = render();
        wire(el);
    }

    window.CAMolecules = window.CAMolecules || {};
    window.CAMolecules.heroEntryPaths = { render: render, mount: mount, wire: wire };
})();