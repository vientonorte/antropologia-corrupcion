/**
 * main.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Entry point del sistema de grafo — Contra-Archivo
 *
 * Orquesta: carga de datos → motor de fricción → grafo → renderer
 * Progressive enhancement: el sitio narrativo preexiste; el grafo se activa
 * mediante toggle sin romper la estructura original.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── ESTADO GLOBAL ─── */
const STATE = {
    mode: 'narrative', // 'narrative' | 'graph'
    activeLayer: 'all',
    activeFrictionType: 'all',
    graph: null,
    renderer: null,
    data: null,
};

/* ─── CARGA DE DATOS ─── */

async function loadCasos() {
    const resp = await fetch('./data/casos.json');
    if (!resp.ok) throw new Error(`No se pudo cargar casos.json: ${resp.status}`);
    return resp.json();
}

/* ─── BOOTSTRAP ─── */

async function init() {
    try {
        // 1. Cargar datos
        const json = await loadCasos();
        STATE.data = json;

        // 2. Construir grafo (datos) via frictionEngine
        const { buildGraph } = window.frictionEngine;
        const graphData = buildGraph(json.casos);

        // 3. Inyectar estructura del modo grafo en el DOM
        setupGraphDOM();

        // 4. Instanciar grafo SVG
        const container = document.getElementById('ca-graph-canvas');
        STATE.graph = new window.FrictionGraph({
            container,
            nodes: graphData.nodes,
            links: graphData.links,
            onNodeClick: (node) => {
                STATE.renderer.showPreview(null);
                STATE.renderer.expand(node);
            },
            onNodeHover: (node) => {
                STATE.renderer.showPreview(node);
            },
        });

        // 5. Instanciar renderer de paneles
        STATE.renderer = new window.NodeRenderer({
            panel: document.getElementById('ca-panel'),
            previewEl: document.getElementById('ca-preview'),
            onClose: () => {
                // Restaurar grafo sin selección activa
                STATE.graph?.setActiveLayer(STATE.activeLayer);
            },
        });

        // 6. Conectar controles
        setupControls();
        setupModeToggle();

        // 7. Accesibilidad: skip link directo al grafo
        const skip = document.getElementById('skip-to-graph');
        if (skip) {
            skip.addEventListener('click', (e) => {
                e.preventDefault();
                activateGraphMode();
                document.getElementById('ca-graph-canvas')?.focus();
            });
        }

        console.log('[Contra-Archivo] Sistema de grafo iniciado:', {
            casos: json.casos.length,
            links: graphData.links.length,
        });

    } catch (err) {
        console.error('[Contra-Archivo] Error al iniciar grafo:', err);
        showFallbackError(err);
    }
}

/* ─── DOM SETUP ─── */

function setupGraphDOM() {
    // Crear sección del grafo si no existe
    if (document.getElementById('graph-mode-section')) return;

    const section = document.createElement('section');
    section.id = 'graph-mode-section';
    section.setAttribute('aria-label', 'Modo grafo — Interfaz de fricción epistemológica');
    section.setAttribute('aria-hidden', 'true');

    section.innerHTML = `
    <!-- Toolbar -->
    <div class="ca-toolbar" role="toolbar" aria-label="Controles del grafo de fricción">

      <div class="ca-toolbar__group">
        <span class="ca-toolbar__label" id="ca-layer-label">Capa</span>
        <div class="ca-layer-filter" role="group" aria-labelledby="ca-layer-label">
          <button class="ca-layer-btn active" data-layer="all"
            aria-pressed="true">Todas</button>
          <button class="ca-layer-btn" data-layer="etica"
            aria-pressed="false">◎ Ética</button>
          <button class="ca-layer-btn" data-layer="institucional"
            aria-pressed="false">▣ Institucional</button>
          <button class="ca-layer-btn" data-layer="material"
            aria-pressed="false">◈ Material</button>
        </div>
      </div>

      <div class="ca-toolbar__sep" aria-hidden="true"></div>

      <div class="ca-toolbar__group">
        <span class="ca-toolbar__label" id="ca-friction-label">Fricción</span>
        <div class="ca-friction-filter" role="group" aria-labelledby="ca-friction-label">
          <button class="ca-friction-btn active" data-tipo="all"
            aria-pressed="true">Todas</button>
          <button class="ca-friction-btn" data-tipo="politica"
            aria-pressed="false">Política</button>
          <button class="ca-friction-btn" data-tipo="semantica"
            aria-pressed="false">Semántica</button>
          <button class="ca-friction-btn" data-tipo="tecnica"
            aria-pressed="false">Técnica</button>
        </div>
      </div>

      <div class="ca-toolbar__sep" aria-hidden="true"></div>

      <div class="ca-intensity-legend" aria-label="Leyenda de intensidad de fricción">
        <span class="ca-intensity-legend__label">baja</span>
        <div class="ca-intensity-legend__bar" aria-hidden="true"></div>
        <span class="ca-intensity-legend__label">crítica</span>
      </div>

      <div class="ca-toolbar__sep" aria-hidden="true"></div>

      <div class="ca-toolbar__group ca-field-controls">
        <span class="ca-toolbar__label" id="ca-field-label">Campo</span>
        <div role="group" aria-labelledby="ca-field-label">
          <button class="ca-field-btn active" data-field="all"
            aria-pressed="true">⊕ Todo</button>
          <button class="ca-field-btn active" data-field="potential"
            aria-pressed="true">Φ Potencial</button>
          <button class="ca-field-btn active" data-field="streamlines"
            aria-pressed="true">∇ Líneas</button>
          <button class="ca-field-btn active" data-field="particles"
            aria-pressed="true">⚡ Energía</button>
        </div>
      </div>
    </div>

    <!-- Área principal -->
    <div class="ca-graph-area">
      <!-- Canvas del grafo -->
      <div class="ca-graph-canvas" id="ca-graph-canvas"
        tabindex="0" aria-label="Grafo interactivo de casos — use Tab y Enter para navegar">

        <!-- Preview en hover -->
        <div class="ca-preview" id="ca-preview" aria-live="polite" aria-atomic="true"
          role="status" aria-label="Vista previa del caso seleccionado">
        </div>

        <!-- Leyenda -->
        <aside class="ca-legend" aria-label="Leyenda del grafo">
          <span class="ca-legend__title">Capas</span>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#c8a96e"></div>
            <span>Ética</span>
          </div>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#4a7fa5"></div>
            <span>Institucional</span>
          </div>
          <div class="ca-legend__item">
            <div class="ca-legend__dot" style="background:#7a9e6e"></div>
            <span>Material</span>
          </div>
          <div class="ca-legend__item" style="margin-top:0.5rem">
            <div class="ca-legend__line" style="background:rgba(200,169,110,0.5);border-top:1px dashed #c8a96e"></div>
            <span>Conexión</span>
          </div>
        </aside>
      </div>

      <!-- Panel de detalle -->
      <aside class="ca-panel" id="ca-panel"
        aria-label="Detalle del caso" aria-hidden="true">
      </aside>
    </div>
  `;

    // Insertar antes del main narrativo
    const main = document.querySelector('main');
    if (main) {
        main.parentNode.insertBefore(section, main);
    } else {
        document.body.appendChild(section);
    }
}

/* ─── CONTROLES ─── */

function setupControls() {
    // Filtros de capa
    document.querySelectorAll('.ca-layer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const layer = btn.dataset.layer;
            STATE.activeLayer = layer;

            document.querySelectorAll('.ca-layer-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });

            STATE.graph?.setActiveLayer(layer);
        });
    });

    // Filtros de tipo de fricción
    document.querySelectorAll('.ca-friction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tipo = btn.dataset.tipo;
            STATE.activeFrictionType = tipo;

            document.querySelectorAll('.ca-friction-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });

            STATE.graph?.setFrictionTypeFilter(tipo);
        });
    });

    // Controles de campo de física
    document.querySelectorAll('.ca-field-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const graph = STATE.graph;
            if (!graph?.field) return;

            const action = btn.dataset.field;
            const wasActive = btn.classList.contains('active');

            if (action === 'all') {
                // Toggle todo el campo
                const newState = !wasActive;
                graph.field.setVisible(newState);
                graph.field.toggleField(newState);
                graph.field.toggleStreamlines(newState);
                graph.field.toggleParticles(newState);
                document.querySelectorAll('.ca-field-btn').forEach(b => {
                    b.classList.toggle('active', newState);
                    b.setAttribute('aria-pressed', newState ? 'true' : 'false');
                });
            } else {
                // Toggle componente individual
                const newState = !wasActive;
                btn.classList.toggle('active', newState);
                btn.setAttribute('aria-pressed', newState ? 'true' : 'false');

                if (action === 'potential') graph.field.toggleField(newState);
                else if (action === 'streamlines') graph.field.toggleStreamlines(newState);
                else if (action === 'particles') graph.field.toggleParticles(newState);

                // Sincronizar botón "all"
                const allActive = [...document.querySelectorAll('.ca-field-btn:not([data-field="all"])')]
                    .every(b => b.classList.contains('active'));
                const allBtn = document.querySelector('.ca-field-btn[data-field="all"]');
                if (allBtn) {
                    allBtn.classList.toggle('active', allActive);
                    allBtn.setAttribute('aria-pressed', allActive ? 'true' : 'false');
                }
            }
        });
    });
}

/* ─── TOGGLE DE MODO ─── */

function setupModeToggle() {
    // Inyectar botones de modo en la interfaz
    const toggle = document.createElement('div');
    toggle.className = 'ca-mode-toggle';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Modo de visualización');
    toggle.innerHTML = `
    <button class="ca-mode-btn active" data-mode="narrative"
      aria-pressed="true">Narrativo</button>
    <button class="ca-mode-btn" data-mode="graph"
      aria-pressed="false">Grafo ⊕</button>
  `;
    document.body.appendChild(toggle);

    toggle.querySelectorAll('.ca-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            toggle.querySelectorAll('.ca-mode-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            if (mode === 'graph') activateGraphMode();
            else activateNarrativeMode();
        });
    });
}

function activateGraphMode() {
    STATE.mode = 'graph';
    const graphSection = document.getElementById('graph-mode-section');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const nav = document.querySelector('nav:not(.bottom-nav)');

    if (graphSection) {
        graphSection.classList.add('ca-active');
        graphSection.setAttribute('aria-hidden', 'false');
    }
    if (main) main.style.display = 'none';
    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';

    // Anunciar a lectores de pantalla
    announceToSR('Modo grafo activado. Navegue con Tab y Enter para explorar los casos.');
}

function activateNarrativeMode() {
    STATE.mode = 'narrative';
    const graphSection = document.getElementById('graph-mode-section');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const nav = document.querySelector('nav:not(.bottom-nav)');

    if (graphSection) {
        graphSection.classList.remove('ca-active');
        graphSection.setAttribute('aria-hidden', 'true');
    }
    if (main) main.style.display = '';
    if (header) header.style.display = '';
    if (nav) nav.style.display = '';

    announceToSR('Modo narrativo activado.');
}

/* ─── ACCESIBILIDAD ─── */

function announceToSR(msg) {
    let live = document.getElementById('ca-sr-live');
    if (!live) {
        live = document.createElement('div');
        live.id = 'ca-sr-live';
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        live.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
        document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 50);
}

function showFallbackError(err) {
    const container = document.getElementById('ca-graph-canvas');
    if (!container) return;
    container.innerHTML = `
    <div class="ca-empty-state" role="alert">
      <span class="ca-empty-state__icon">∅</span>
      <p>El grafo no pudo iniciar.<br>
         <small style="opacity:0.6">${err?.message || 'Error desconocido'}</small></p>
    </div>
  `;
}

/* ─── INIT ─── */

// Esperar a que los módulos estén disponibles
function waitForModules(cb, retries = 20) {
    if (window.frictionEngine && window.FrictionGraph && window.NodeRenderer && window.FrictionField) {
        cb();
    } else if (retries > 0) {
        setTimeout(() => waitForModules(cb, retries - 1), 100);
    } else {
        console.error('[Contra-Archivo] Módulos no disponibles');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => waitForModules(init));
} else {
    waitForModules(init);
}