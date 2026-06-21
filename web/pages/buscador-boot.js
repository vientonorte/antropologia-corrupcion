/**
 * Page boot: buscador — vista Huella digital + deep-links ?caso= & ?huella=
 */
(function () {
    'use strict';

    function parseParams() {
        var params = new URLSearchParams(window.location.search);
        return {
            casoId: params.get('caso') || '',
            query: params.get('q') || '',
            huella: params.get('huella') === '1' || !!params.get('caso'),
        };
    }

    function getCorpusBundle() {
        return (
            window.CABuscadorCorpus ||
            (window.CADataLoader && window.CADataLoader.getCached()) ||
            null
        );
    }

    function loadHuella(mount, options) {
        if (!mount || !window.CAHuellaDigital) return;
        var opts = options || {};
        var bundle = getCorpusBundle();
        if (bundle) opts.preloaded = bundle;
        return window.CAHuellaDigital.loadAndRender(mount, opts);
    }

    function setView(mode) {
        var registrosBlock = document.getElementById('registros-block');
        var huellaSection = document.getElementById('huella-section');
        var tabs = document.querySelectorAll('.ca-view-tab');
        var isHuella = mode === 'huella';

        tabs.forEach(function (tab) {
            var active = tab.dataset.view === mode;
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.classList.toggle('is-active', active);
        });

        if (registrosBlock) registrosBlock.hidden = isHuella;
        if (huellaSection) huellaSection.hidden = !isHuella;
    }

    function bootHuellaFromUrl() {
        var params = parseParams();
        var mount = document.getElementById('huella-mount');
        if (!mount) return;

        if (params.huella || params.casoId || params.query) {
            setView('huella');
            loadHuella(mount, {
                casoId: params.casoId,
                query: params.query,
            });
        }
    }

    function wireViewTabs() {
        document.querySelectorAll('.ca-view-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                var view = tab.dataset.view;
                setView(view);
                if (view === 'huella') {
                    var mount = document.getElementById('huella-mount');
                    var input = document.getElementById('searchInput');
                    var q = input && input.value ? input.value.trim() : '';
                    var params = parseParams();
                    loadHuella(mount, {
                        casoId: params.casoId,
                        query: q || params.query,
                    });
                    history.replaceState(
                        null,
                        '',
                        window.CAHuellaDigital.buildBuscadorUrl({
                            huella: '1',
                            q: q || undefined,
                            caso: params.casoId || undefined,
                        }),
                    );
                } else {
                    history.replaceState(null, '', 'buscador.html');
                }
            });
        });
    }

    function exposeHuellaBridge() {
        window.CABuscadorHuella = {
            showForCaso: function (casoId) {
                setView('huella');
                var mount = document.getElementById('huella-mount');
                loadHuella(mount, { casoId: casoId });
                history.replaceState(
                    null,
                    '',
                    window.CAHuellaDigital.buildBuscadorUrl({ caso: casoId, huella: '1' }),
                );
            },
        };
    }

    function onReady() {
        wireViewTabs();
        exposeHuellaBridge();
    }

    window.CABuscadorBoot = {
        refreshHuellaFromUrl: bootHuellaFromUrl,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();