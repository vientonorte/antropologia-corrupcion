/**
 * graphBootstrap.js
 * Orquestador del Grafo B (fricción + entropía) — Contra-Archivo
 *
 * Modos:
 *   embedded  — visible en landing (#tesis), sin toggle fullscreen
 *   fullscreen — legacy overlay (main.js)
 */
'use strict';

const GraphBootstrap = (function () {
    const STATE = {
        activeLayer: 'all',
        activeFrictionType: 'all',
        graph: null,
        renderer: null,
        socialField: null,
        data: null,
        options: null,
    };

    const GRAPH_SHELL_HTML = `
    <div class="ca-toolbar" role="toolbar" aria-label="Controles del grafo de fricción">
      <div class="ca-toolbar__row ca-toolbar__row--filters">
        <div class="ca-toolbar__group">
          <span class="ca-toolbar__label" id="ca-layer-label">Capa</span>
          <div class="ca-layer-filter" role="group" aria-labelledby="ca-layer-label">
            <button class="ca-layer-btn active" data-layer="all" aria-pressed="true">Todas</button>
            <button class="ca-layer-btn" data-layer="etica" aria-pressed="false">◎ Ética</button>
            <button class="ca-layer-btn" data-layer="institucional" aria-pressed="false">▣ Institucional</button>
            <button class="ca-layer-btn" data-layer="material" aria-pressed="false">◈ Material</button>
          </div>
        </div>
        <div class="ca-toolbar__sep" aria-hidden="true"></div>
        <div class="ca-toolbar__group">
          <span class="ca-toolbar__label" id="ca-friction-label">Fricción</span>
          <div class="ca-friction-filter" role="group" aria-labelledby="ca-friction-label">
            <button class="ca-friction-btn active" data-tipo="all" aria-pressed="true">Todas</button>
            <button class="ca-friction-btn" data-tipo="politica" aria-pressed="false">Política</button>
            <button class="ca-friction-btn" data-tipo="semantica" aria-pressed="false">Semántica</button>
            <button class="ca-friction-btn" data-tipo="tecnica" aria-pressed="false">Técnica</button>
          </div>
        </div>
        <div class="ca-toolbar__sep" aria-hidden="true"></div>
        <div class="ca-intensity-legend" aria-label="Leyenda de intensidad de fricción">
          <span class="ca-intensity-legend__label">baja</span>
          <div class="ca-intensity-legend__bar" aria-hidden="true"></div>
          <span class="ca-intensity-legend__label">crítica</span>
        </div>
      </div>
      <div class="ca-toolbar__row ca-toolbar__row--field">
        <div class="ca-toolbar__group ca-field-controls">
          <span class="ca-toolbar__label" id="ca-field-label">Campo</span>
          <div class="ca-field-filter" role="group" aria-labelledby="ca-field-label">
            <button class="ca-field-btn active" data-field="all" aria-pressed="true" aria-label="Mostrar todo el campo">⊕ Todo</button>
            <button class="ca-field-btn active" data-field="potential" aria-pressed="true" aria-label="Campo de potencial">Φ Potencial</button>
            <button class="ca-field-btn active" data-field="streamlines" aria-pressed="true" aria-label="Líneas de flujo">∇ Líneas</button>
            <button class="ca-field-btn active" data-field="particles" aria-pressed="true" aria-label="Partículas de energía">⚡ Energía</button>
            <button class="ca-field-btn active" data-field="entropy" aria-pressed="true" aria-label="Entropía social">S Entropía</button>
          </div>
        </div>
      </div>
    </div>
    <div class="ca-graph-area">
      <div class="ca-graph-canvas" id="ca-graph-canvas" tabindex="0"
        aria-label="Grafo interactivo de casos — use Tab y Enter para navegar">
        <div class="ca-preview" id="ca-preview" aria-live="polite" aria-atomic="true"
          role="status" aria-label="Vista previa del caso seleccionado"></div>
        <aside class="ca-legend" aria-label="Leyenda del grafo">
          <span class="ca-legend__title">Capas</span>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#c8a96e"></div><span>Ética</span>
          </div>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#4a7fa5"></div><span>Institucional</span>
          </div>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#7a9e6e"></div><span>Material</span>
          </div>
        </aside>
        <aside class="sf-hud-dock" id="ca-sf-hud-dock" aria-label="Panel de métricas termodinámicas">
          <button type="button" class="sf-hud-dock__toggle" id="ca-sf-hud-toggle"
            aria-expanded="true" aria-controls="ca-sf-hud"
            aria-label="Mostrar u ocultar panel de entropía">
            <span class="sf-hud-dock__toggle-icon" aria-hidden="true">S</span>
            <span class="sf-hud-dock__toggle-text">Entropía</span>
          </button>
          <div class="sf-hud" id="ca-sf-hud" role="status" aria-live="polite" aria-atomic="false"
            aria-label="Métricas termodinámicas del campo de entropía social"></div>
        </aside>
      </div>
      <aside class="ca-panel" id="ca-panel" aria-label="Detalle del caso" aria-hidden="true"></aside>
    </div>`;

    function resolveDataPath(filename) {
        const base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    async function loadCasos() {
        const resp = await fetch(resolveDataPath('casos.json'));
        if (!resp.ok) {
            throw new Error('No se pudo cargar casos.json: ' + resp.status);
        }
        return resp.json();
    }

    async function loadFuentes() {
        try {
            const resp = await fetch(resolveDataPath('fuentes-oficiales.json'));
            if (!resp.ok) return [];
            const j = await resp.json();
            if (Array.isArray(j)) return j;
            return j.fuentes || j.registros || [];
        } catch (_) {
            return [];
        }
    }

    function setupGraphDOM(options) {
        const sectionId = options.sectionId || 'graph-mode-section';
        if (document.getElementById(sectionId)) return;

        const section = document.createElement('section');
        section.id = sectionId;
        section.setAttribute('aria-label', 'Instrumento de fricción epistemológica — Colectivo Viento Norte');

        if (options.embedded) {
            section.classList.add('ca-graph--embedded', 'ca-active');
            section.setAttribute('aria-hidden', 'false');
        } else {
            section.setAttribute('aria-hidden', 'true');
        }

        section.innerHTML = GRAPH_SHELL_HTML;

        const mount = options.mount ? document.querySelector(options.mount) : null;
        if (mount) {
            mount.appendChild(section);
        } else if (options.embedded) {
            document.body.appendChild(section);
        } else {
            const main = document.querySelector('main');
            if (main && main.parentNode) {
                main.parentNode.insertBefore(section, main);
            } else {
                document.body.appendChild(section);
            }
        }
    }

    function syncEntropyUi(visible) {
        const entropyBtn = document.querySelector('.ca-field-btn[data-field="entropy"]');
        if (entropyBtn) {
            entropyBtn.classList.toggle('active', visible);
            entropyBtn.setAttribute('aria-pressed', visible ? 'true' : 'false');
        }
        const dock = document.getElementById('ca-sf-hud-dock');
        if (dock) dock.style.display = visible ? '' : 'none';
    }

    function setupHudDock() {
        const dock = document.getElementById('ca-sf-hud-dock');
        const toggle = document.getElementById('ca-sf-hud-toggle');
        if (!dock || !toggle) return;

        let collapsed = false;
        try {
            collapsed = sessionStorage.getItem('ca-sf-hud-collapsed') === '1';
        } catch (_) {
            collapsed = false;
        }

        if (collapsed) {
            dock.classList.add('is-collapsed');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', () => {
            const isCollapsed = dock.classList.toggle('is-collapsed');
            toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
            try {
                sessionStorage.setItem('ca-sf-hud-collapsed', isCollapsed ? '1' : '0');
            } catch (_) {}
        });
    }

    function setupControls() {
        document.querySelectorAll('.ca-layer-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const layer = btn.dataset.layer;
                STATE.activeLayer = layer;
                document.querySelectorAll('.ca-layer-btn').forEach((b) => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
                STATE.graph?.setActiveLayer(layer);
            });
        });

        document.querySelectorAll('.ca-friction-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tipo = btn.dataset.tipo;
                STATE.activeFrictionType = tipo;
                document.querySelectorAll('.ca-friction-btn').forEach((b) => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
                STATE.graph?.setFrictionTypeFilter(tipo);
            });
        });

        document.querySelectorAll('.ca-field-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const graph = STATE.graph;
                const action = btn.dataset.field;
                const wasActive = btn.classList.contains('active');

                if (action === 'entropy') {
                    const next = !wasActive;
                    syncEntropyUi(next);
                    STATE.socialField?.setVisible(next);
                    return;
                }

                if (!graph?.field) return;

                if (action === 'all') {
                    const newState = !wasActive;
                    graph.field.setVisible(newState);
                    graph.field.toggleField(newState);
                    graph.field.toggleStreamlines(newState);
                    graph.field.toggleParticles(newState);
                    document.querySelectorAll('.ca-field-btn').forEach((b) => {
                        b.classList.toggle('active', newState);
                        b.setAttribute('aria-pressed', newState ? 'true' : 'false');
                    });
                } else {
                    const newState = !wasActive;
                    btn.classList.toggle('active', newState);
                    btn.setAttribute('aria-pressed', newState ? 'true' : 'false');
                    if (action === 'potential') graph.field.toggleField(newState);
                    else if (action === 'streamlines') graph.field.toggleStreamlines(newState);
                    else if (action === 'particles') graph.field.toggleParticles(newState);

                    const allActive = [...document.querySelectorAll('.ca-field-btn:not([data-field="all"])')]
                        .every((b) => b.classList.contains('active'));
                    const allBtn = document.querySelector('.ca-field-btn[data-field="all"]');
                    if (allBtn) {
                        allBtn.classList.toggle('active', allActive);
                        allBtn.setAttribute('aria-pressed', allActive ? 'true' : 'false');
                    }
                }
            });
        });
    }

    function setupModeToggle() {
        if (document.querySelector('.ca-mode-toggle')) return;

        const toggle = document.createElement('div');
        toggle.className = 'ca-mode-toggle';
        toggle.setAttribute('role', 'group');
        toggle.setAttribute('aria-label', 'Modo de visualización');
        toggle.innerHTML = `
          <button class="ca-mode-btn active" data-mode="narrative" aria-pressed="true">Narrativo</button>
          <button class="ca-mode-btn" data-mode="graph" aria-pressed="false">Grafo ⊕</button>`;
        document.body.appendChild(toggle);

        toggle.querySelectorAll('.ca-mode-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                toggle.querySelectorAll('.ca-mode-btn').forEach((b) => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
                if (mode === 'graph') activateFullscreen();
                else deactivateFullscreen();
            });
        });
    }

    function activateFullscreen() {
        const graphSection = document.getElementById(STATE.options.sectionId || 'graph-mode-section');
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        const nav = document.querySelector('nav:not(.bottom-nav):not([data-ca-unified-nav])');

        if (graphSection) {
            graphSection.classList.add('ca-active');
            graphSection.setAttribute('aria-hidden', 'false');
        }
        if (main) main.style.display = 'none';
        if (header) header.style.display = 'none';
        if (nav) nav.style.display = 'none';
        resizeSocialField();
    }

    function deactivateFullscreen() {
        const graphSection = document.getElementById(STATE.options.sectionId || 'graph-mode-section');
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        const nav = document.querySelector('nav:not(.bottom-nav):not([data-ca-unified-nav])');

        if (graphSection && !STATE.options.embedded) {
            graphSection.classList.remove('ca-active');
            graphSection.setAttribute('aria-hidden', 'true');
        }
        if (main) main.style.display = '';
        if (header) header.style.display = '';
        if (nav) nav.style.display = '';
    }

    function resizeSocialField() {
        const sf = STATE.socialField;
        const canvas = document.getElementById('ca-graph-canvas');
        if (!sf || !canvas) return;
        requestAnimationFrame(() => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width && rect.height) sf.resize(rect.width, rect.height);
        });
    }

    function applyDeepLinkCaso() {
        const deepCaso = new URLSearchParams(window.location.search).get('caso');
        if (!deepCaso || !STATE.graph) return;
        try {
            requestAnimationFrame(() => {
                if (typeof STATE.graph.selectNodeById === 'function') {
                    STATE.graph.selectNodeById(deepCaso);
                } else {
                    const nodes = STATE.graph.sim?.nodes;
                    const target = nodes?.find((n) => n.id === deepCaso);
                    if (target && typeof STATE.graph._selectNode === 'function') {
                        STATE.graph._selectNode(target);
                    }
                }
            });
        } catch (err) {
            console.warn('[GraphBootstrap] Deep-link ?caso= ignorado:', deepCaso, err);
        }
    }

    function showFallbackError(err) {
        const container = document.getElementById('ca-graph-canvas');
        if (!container) return;
        const msg = err?.message
            ? err.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            : 'Error desconocido';
        container.innerHTML =
            '<div class="ca-empty-state" role="alert">' +
            '<span class="ca-empty-state__icon">∅</span>' +
            '<p>El grafo no pudo iniciar.<br>' +
            '<small style="opacity:0.6">' + msg + '</small></p></div>';
    }

    async function init(userOptions) {
        const options = {
            mount: '#ca-thesis-mount',
            embedded: true,
            showModeToggle: false,
            sectionId: 'graph-mode-section',
            lazy: false,
            ...userOptions,
        };
        STATE.options = options;

        try {
            const json = await loadCasos();
            STATE.data = json;

            const { buildGraph } = window.frictionEngine;
            const casosForGraph = window.CACasoPublico?.prepareCasos
                ? window.CACasoPublico.prepareCasos(json.casos)
                : json.casos;
            const graphData = buildGraph(casosForGraph);

            if (window.BlackScholes) {
                window.BlackScholes.enrichNodes(graphData.nodes, json.casos);
            }

            setupGraphDOM(options);

            const container = document.getElementById('ca-graph-canvas');
            STATE.graph = new window.FrictionGraph({
                container,
                nodes: graphData.nodes,
                links: graphData.links,
                onNodeClick: (node) => {
                    STATE.renderer.showPreview(null);
                    STATE.renderer.expand(node);
                },
                onNodeHover: (node) => STATE.renderer.showPreview(node),
                onLinkHover: (link) => STATE.renderer.showLinkPreview(link),
                onPositionUpdate: (nodes, links) => {
                    STATE.socialField?.updateNodes(nodes, links);
                },
            });

            STATE.renderer = new window.NodeRenderer({
                panel: document.getElementById('ca-panel'),
                previewEl: document.getElementById('ca-preview'),
                onClose: () => STATE.graph?.setActiveLayer(STATE.activeLayer),
            });

            if (window.SocialField && container) {
                const fuentes = await loadFuentes();
                const hudEl = document.getElementById('ca-sf-hud');
                const prefersReducedMotion =
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                STATE.socialField = new window.SocialField({
                    container,
                    nodes: STATE.graph.sim.nodes,
                    links: STATE.graph.sim.links,
                    metricsEl: hudEl,
                    fuentes,
                });

                STATE.socialField.setVisible(true);
                syncEntropyUi(true);
                if (prefersReducedMotion) {
                    STATE.socialField.renderFrame();
                }

                let resizeRaf = null;
                window.addEventListener('resize', () => {
                    if (resizeRaf) cancelAnimationFrame(resizeRaf);
                    resizeRaf = requestAnimationFrame(resizeSocialField);
                });
            }

            setupControls();
            setupHudDock();

            if (options.showModeToggle) {
                setupModeToggle();
            }

            requestAnimationFrame(() => {
                STATE.graph?._onResize?.();
                resizeSocialField();
                STATE.socialField?.renderFrame?.();
            });

            if (options.embedded) {
                const status = document.getElementById('thesis-graph-status');
                if (status) status.textContent = 'Instrumento activo — explora casos y métricas de entropía.';
            }

            applyDeepLinkCaso();

            const mountEl = options.mount ? document.querySelector(options.mount) : null;
            if (mountEl) mountEl.classList.remove('is-loading');

        } catch (err) {
            console.error('[GraphBootstrap] Error:', err);
            showFallbackError(err);
            const mountEl = options.mount ? document.querySelector(options.mount) : null;
            if (mountEl) mountEl.classList.remove('is-loading');
        }
    }

    function modulesReady() {
        return !!(window.frictionEngine && window.FrictionGraph && window.NodeRenderer);
    }

    function waitForModules(cb, retries) {
        const left = retries ?? 80;
        if (modulesReady()) {
            cb();
        } else if (left > 0) {
            setTimeout(() => waitForModules(cb, left - 1), 100);
        } else {
            console.error('[GraphBootstrap] Módulos no disponibles');
            showFallbackError(new Error('Los módulos del grafo no se cargaron.'));
        }
    }

    function boot(userOptions) {
        const options = { lazy: true, embedded: true, showModeToggle: false, ...userOptions };
        const mount = options.mount ? document.querySelector(options.mount) : null;
        if (!mount) return;

        const run = () => waitForModules(() => init(options));

        if (!options.lazy || typeof IntersectionObserver === 'undefined') {
            run();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    observer.disconnect();
                    run();
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(mount);
    }

    return { init, boot, waitForModules, getState: () => STATE };
})();

window.GraphBootstrap = GraphBootstrap;