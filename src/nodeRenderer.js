/**
 * nodeRenderer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Renderizador de paneles de detalle de nodo — Contra-Archivo
 *
 * Cuando un nodo es seleccionado, abre un panel lateral que expone
 * las 3 capas de verdad de forma simultánea — sin resolverlas.
 *
 * Principio: el panel NO narra. Confronta.
 * Cada capa tiene su propio frame visual y terminología.
 * La zona de fricción es el único espacio compartido — y está marcada como
 * ABIERTA, no como conclusión.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── CONSTANTES VISUALES ─── */

const LAYER_CONFIG = {
    etica: {
        label: 'Capa Ética',
        sublabel: 'Testimonio situado · Cuidado · Contexto vivido',
        icon: '◎',
        cssVar: '--ca-color-etica',
        default: '#c8a96e',
        ariaRole: 'region',
    },
    institucional: {
        label: 'Capa Institucional',
        sublabel: 'Registro oficial · Clasificación · Distorsión normativa',
        icon: '▣',
        cssVar: '--ca-color-institucional',
        default: '#4a7fa5',
        ariaRole: 'region',
    },
    material: {
        label: 'Capa Material',
        sublabel: 'Territorio · Evidencia · Densidad histórica',
        icon: '◈',
        cssVar: '--ca-color-material',
        default: '#7a9e6e',
        ariaRole: 'region',
    },
};

const FRICTION_TYPE_LABELS = {
    politica: 'Fricción política — ¿Quién tiene autoridad para definir?',
    semantica: 'Fricción semántica — El mismo término, mundos distintos',
    tecnica: 'Fricción técnica — ¿Qué cuentan los datos y para quién?',
};

/* ─── CLASE PRINCIPAL ─── */

class NodeRenderer {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.panel       - elemento contenedor del panel de detalle
     * @param {HTMLElement} options.previewEl   - elemento para preview en hover
     * @param {Function}    options.onClose     - callback al cerrar panel
     */
    constructor({ panel, previewEl, onClose }) {
        this.panel = panel;
        this.previewEl = previewEl;
        this.onClose = onClose || (() => {});
        this.currentNode = null;
        this._setupPanel();
    }

    /* ─── SETUP ─── */

    _setupPanel() {
        if (!this.panel) return;
        this.panel.setAttribute('role', 'complementary');
        this.panel.setAttribute('aria-label', 'Detalle del caso — capas de fricción');

        // Botón de cierre
        const closeBtn = this.panel.querySelector('#ca-panel-close') || (() => {
            const btn = document.createElement('button');
            btn.id = 'ca-panel-close';
            btn.setAttribute('aria-label', 'Cerrar panel de detalle');
            btn.textContent = '×';
            this.panel.prepend(btn);
            return btn;
        })();

        closeBtn.addEventListener('click', () => this.close());

        // ESC para cerrar
        this._handleEsc = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this._handleEsc);
    }

    /* ─── API PÚBLICA ─── */

    /**
     * Muestra preview rápido en hover (tooltip enriquecido)
     * @param {Object|null} node
     */
    showPreview(node) {
        if (!this.previewEl) return;
        if (!node) {
            this.previewEl.classList.remove('ca-preview--visible');
            this.previewEl.innerHTML = '';
            return;
        }
        this.previewEl.innerHTML = this._buildPreview(node);
        this.previewEl.classList.add('ca-preview--visible');
        this.previewEl.setAttribute('aria-live', 'polite');
    }

    /**
     * Muestra preview de conexión (link) en hover
     * @param {Object|null} link
     */
    showLinkPreview(link) {
        if (!this.previewEl) return;
        if (!link) {
            this.previewEl.classList.remove('ca-preview--visible');
            this.previewEl.innerHTML = '';
            return;
        }
        this.previewEl.innerHTML = this._buildLinkPreview(link);
        this.previewEl.classList.add('ca-preview--visible');
        this.previewEl.setAttribute('aria-live', 'polite');
    }

    /**
     * Abre el panel completo con las 3 capas del caso
     * @param {Object} node
     */
    expand(node) {
        if (!this.panel) return;
        this.currentNode = node;
        this.panel.innerHTML = this._buildPanel(node);
        this.panel.classList.add('ca-panel--open');
        this.panel.setAttribute('aria-hidden', 'false');

        // Focus management
        const firstFocusable = this.panel.querySelector('button, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();

        // Re-adjuntar botón de cierre
        const closeBtn = this.panel.querySelector('#ca-panel-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        // Tabs de capa
        this._setupLayerTabs();
    }

    /**
     * Cierra el panel
     */
    close() {
        if (!this.panel) return;
        this.panel.classList.remove('ca-panel--open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.currentNode = null;
        this.onClose();
    }

    /* ─── BUILDERS HTML ─── */

    _buildPreview(node) {
        const pct = Math.round(node.intensidad * 100);
        const tipoLabel = FRICTION_TYPE_LABELS[node.tipo] || node.tipo;

        return `
      <div class="ca-preview__header">
        <span class="ca-preview__titulo">${this._esc(node.titulo)}</span>
        <span class="ca-preview__anio">${node.anio || ''}</span>
      </div>
      <div class="ca-preview__friction">
        <div class="ca-preview__friction-bar" style="--pct:${pct}%">
          <div class="ca-preview__friction-fill" style="width:${pct}%"></div>
        </div>
        <span class="ca-preview__friction-label">${pct}% fricción</span>
      </div>
      <div class="ca-preview__tipo">${this._esc(tipoLabel)}</div>
      <div class="ca-preview__tension">"${this._esc(node.tension)}"</div>
      <div class="ca-preview__layers">
        ${this._previewLayerChip('etica', node.colorEtica, node.etica?.titulo)}
        ${this._previewLayerChip('institucional', node.colorInstitucional, node.institucional?.titulo)}
        ${this._previewLayerChip('material', node.colorMaterial, node.material?.titulo)}
      </div>
      <p class="ca-preview__hint">↵ Click para expandir el conflicto</p>
    `;
    }

    _previewLayerChip(capa, color, titulo) {
        const cfg = LAYER_CONFIG[capa];
        const displayTitle = titulo ? this._esc(titulo) : cfg.label;
        return `
      <div class="ca-preview__layer-chip" style="border-color:${color || cfg.default}" title="${displayTitle}">
        <span class="ca-preview__layer-icon" style="color:${color || cfg.default}">${cfg.icon}</span>
        <span class="ca-preview__layer-name">${displayTitle}</span>
      </div>
    `;
    }

    _buildLinkPreview(link) {
            const sourceName = this._esc(link.source ?.titulo || link.source ?.id || '');
            const targetName = this._esc(link.target ?.titulo || link.target ?.id || '');
            const weightPct = Math.round((link.weight || 0) * 100);

            const items = [
                ...((link.actores || []).map(a => `<span class="ca-preview__link-tag">Actor: ${this._esc(a)}</span>`)),
                ...((link.instituciones || []).map(i => `<span class="ca-preview__link-tag">Institución: ${this._esc(i)}</span>`)),
                ...((link.tags || []).map(t => `<span class="ca-preview__link-tag">Tema: ${this._esc(t)}</span>`)),
            ];

            return `
      <div class="ca-preview__header">
        <span class="ca-preview__titulo">Conexión</span>
        <span class="ca-preview__anio">${weightPct}% vínculo</span>
      </div>
      <div class="ca-preview__link-nodes">
        <span class="ca-preview__link-node">${sourceName}</span>
        <span class="ca-preview__link-arrow">⟷</span>
        <span class="ca-preview__link-node">${targetName}</span>
      </div>
      ${items.length ? `<div class="ca-preview__link-shared">${items.join('')}</div>` : ''}
    `;
  }

  _buildPanel(node) {
    const pct = Math.round(node.intensidad * 100);
    const tipoLabel = FRICTION_TYPE_LABELS[node.tipo] || node.tipo;
    const tipoSubLabel = node.subtipo ? FRICTION_TYPE_LABELS[node.subtipo] : '';

    return `
      <div class="ca-panel__header">
        <button id="ca-panel-close" class="ca-panel__close" aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="ca-panel__meta">
          <span class="ca-panel__label">Caso · ${node.anio || ''}</span>
        </div>
        <h2 class="ca-panel__titulo">${this._esc(node.titulo)}</h2>

        <div class="ca-panel__friction-block" aria-label="Indicador de fricción">
          <div class="ca-panel__friction-bar">
            <div class="ca-panel__friction-fill" style="width:${pct}%" role="progressbar"
              aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
              aria-label="Intensidad de fricción: ${pct}%">
            </div>
          </div>
          <div class="ca-panel__friction-meta">
            <span class="ca-panel__friction-pct">${pct}%</span>
            <span class="ca-panel__friction-tipo">${this._esc(tipoLabel)}</span>
          </div>
          ${tipoSubLabel ? `<div class="ca-panel__friction-subtipo">${this._esc(tipoSubLabel)}</div>` : ''}
        </div>

        ${node.tension ? `
          <blockquote class="ca-panel__tension" aria-label="Tensión central no resuelta">
            <p>${this._esc(node.tension)}</p>
            <cite>Tensión abierta — sin resolver</cite>
          </blockquote>
        ` : ''}

        <div class="ca-panel__tags" aria-label="Etiquetas temáticas">
          ${(node.tags || []).map(t => `<span class="ca-panel__tag">${this._esc(t)}</span>`).join('')}
        </div>
      </div>

      <div class="ca-panel__layer-nav" role="tablist" aria-label="Capas de verdad">
        <button class="ca-panel__tab ca-panel__tab--active" role="tab"
          aria-selected="true" aria-controls="ca-tab-etica" data-capa="etica"
          style="--tab-color:${node.colorEtica || LAYER_CONFIG.etica.default}">
          ${LAYER_CONFIG.etica.icon} Ética
        </button>
        <button class="ca-panel__tab" role="tab"
          aria-selected="false" aria-controls="ca-tab-institucional" data-capa="institucional"
          style="--tab-color:${node.colorInstitucional || LAYER_CONFIG.institucional.default}">
          ${LAYER_CONFIG.institucional.icon} Institucional
        </button>
        <button class="ca-panel__tab" role="tab"
          aria-selected="false" aria-controls="ca-tab-material" data-capa="material"
          style="--tab-color:${node.colorMaterial || LAYER_CONFIG.material.default}">
          ${LAYER_CONFIG.material.icon} Material
        </button>
        <button class="ca-panel__tab" role="tab"
          aria-selected="false" aria-controls="ca-tab-all" data-capa="all">
          ⊕ Todas
        </button>
      </div>

      <div class="ca-panel__layers-body">
        ${this._buildLayerSection('etica',         node, node.colorEtica)}
        ${this._buildLayerSection('institucional',  node, node.colorInstitucional)}
        ${this._buildLayerSection('material',       node, node.colorMaterial)}
      </div>

      <div class="ca-panel__friction-detail" aria-label="Zona de fricción">
        <div class="ca-panel__friction-header">
          <span class="ca-panel__friction-icon">⚡</span>
          <h3>Zona de fricción</h3>
          <span class="ca-panel__estado ca-panel__estado--${node.estado}">${node.estado}</span>
        </div>
        <p class="ca-panel__friction-desc">
          ${node.tension ? this._esc(node.tension) : ''}
        </p>
        ${this._renderAudit(node.audit)}
        ${node.marcadores?.length ? `
          <ul class="ca-panel__marcadores" aria-label="Marcadores de fricción detectados">
            ${node.marcadores.slice(0, 4).map(m =>
              `<li class="ca-panel__marcador">${this._esc(m)}</li>`
            ).join('')}
          </ul>
        ` : ''}
        <div class="ca-panel__no-conclusion">
          <span class="ca-panel__nc-icon">∅</span>
          Esta fricción no tiene conclusión en este archivo.
          Las capas coexisten sin resolución.
        </div>
      </div>
    `;
  }

  _buildLayerSection(capaName, node, color) {
    const cfg  = LAYER_CONFIG[capaName];
    const data = node[capaName];
    if (!data) return '';

    const accentColor = color || cfg.default;

    return `
      <section id="ca-tab-${capaName}"
        class="ca-panel__layer ca-panel__layer--${capaName}"
        role="tabpanel"
        aria-labelledby="ca-tab-btn-${capaName}"
        style="--layer-color:${accentColor}"
        ${capaName !== 'etica' ? 'hidden' : ''}>

        <header class="ca-panel__layer-header">
          <span class="ca-panel__layer-icon" aria-hidden="true">${cfg.icon}</span>
          <div>
            <h3 class="ca-panel__layer-title" style="color:${accentColor}">${cfg.label}</h3>
            <p class="ca-panel__layer-sublabel">${cfg.sublabel}</p>
          </div>
        </header>

        <h4 class="ca-panel__layer-nombre">${this._esc(data.titulo || '')}</h4>

        <p class="ca-panel__layer-desc">${this._esc(data.descripcion || '')}</p>

        ${this._renderVoces(data, capaName, accentColor)}
        ${this._renderDocs(data, capaName)}
        ${this._renderKeywords(data, accentColor)}
      </section>
    `;
  }

  _renderVoces(data, capaName, color) {
    // 'voces' es exclusivo de la capa ética
    const voces = data.voces || [];
    if (!voces.length || capaName !== 'etica') return '';
    return `
      <div class="ca-panel__voces" aria-label="Voces y testimonios">
        <h5 class="ca-panel__voces-title" style="color:${color}">Voces</h5>
        <ul class="ca-panel__voces-list">
          ${voces.map(v => `<li>${this._esc(v)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  _renderDocs(data, capaName) {
    const docs = data.documentos || data.documentos_ref || data.evidencias || [];
    if (!docs.length) return '';
    const label = capaName === 'material' ? 'Evidencias materiales' : 'Documentos';
    return `
      <div class="ca-panel__docs" aria-label="${label}">
        <h5 class="ca-panel__docs-title">${label}</h5>
        <ul class="ca-panel__docs-list">
          ${docs.slice(0, 4).map(d => `<li>${this._esc(d)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  _renderKeywords(data, color) {
    const kws = data.keywords || [];
    if (!kws.length) return '';
    return `
      <div class="ca-panel__keywords" aria-label="Palabras clave">
        ${kws.map(k => `
          <span class="ca-panel__keyword" style="border-color:${color}; color:${color}">
            ${this._esc(k)}
          </span>
        `).join('')}
      </div>
    `;
  }

  _renderAudit(audit) {
    if (!audit) return '';

    const effectivePct = Math.round((audit.effectiveIntensity || 0) * 100);
    const calculatedPct = Math.round((audit.calculatedIntensity || 0) * 100);
    const overlapPct = Math.round((audit.avgOverlap || 0) * 100);
    const markerPct = Math.round((audit.markerScore || 0) * 100);
    const sourceLabel = audit.source === 'json'
      ? 'Valor publicado en el caso'
      : 'Valor calculado por el motor';
    const delta = Math.abs(audit.deltaFromCalculated || 0);

    return `
      <section class="ca-panel__audit" aria-label="Desglose auditable de fricción">
        <div class="ca-panel__audit-head">
          <div>
            <span class="ca-panel__audit-kicker">Auditoría del puntaje</span>
            <p class="ca-panel__audit-source">${sourceLabel}</p>
          </div>
          <div class="ca-panel__audit-score">${effectivePct}%</div>
        </div>

        <div class="ca-panel__audit-metrics">
          <div class="ca-panel__audit-metric">
            <span class="ca-panel__audit-label">Overlap promedio</span>
            <strong>${overlapPct}%</strong>
          </div>
          <div class="ca-panel__audit-metric">
            <span class="ca-panel__audit-label">Marcador dominante</span>
            <strong>${markerPct}%</strong>
          </div>
          <div class="ca-panel__audit-metric">
            <span class="ca-panel__audit-label">Motor base</span>
            <strong>${calculatedPct}%</strong>
          </div>
        </div>

        ${audit.dominantPair ? `
          <p class="ca-panel__audit-summary">
            Par dominante: <strong>${this._esc(audit.dominantPair.label)}</strong>
            · presión ${Math.round((audit.dominantPair.pairIntensity || 0) * 100)}%
          </p>
        ` : ''}

        ${audit.source === 'json' && delta >= 0.02 ? `
          <p class="ca-panel__audit-note">
            El valor publicado difiere ${Math.round(delta * 100)} puntos del cálculo automático del motor.
          </p>
        ` : ''}

        <div class="ca-panel__audit-pairs">
          ${(audit.pairs || []).map(pair => this._renderAuditPair(pair)).join('')}
        </div>
      </section>
    `;
  }

  _renderAuditPair(pair) {
    const overlapPct = Math.round((pair.overlap || 0) * 100);
    const markerPct = Math.round((pair.markerScore || 0) * 100);
    const intensityPct = Math.round((pair.pairIntensity || 0) * 100);
    const markers = pair.markers || [];

    return `
      <article class="ca-panel__audit-pair">
        <div class="ca-panel__audit-pair-head">
          <span class="ca-panel__audit-pair-label">${this._esc(pair.label)}</span>
          <span class="ca-panel__audit-pair-score">${intensityPct}%</span>
        </div>
        <div class="ca-panel__audit-pair-bars">
          <span>solapamiento ${overlapPct}%</span>
          <span>marcador ${markerPct}%</span>
        </div>
        ${markers.length ? `
          <div class="ca-panel__audit-pair-markers">
            ${markers.slice(0, 2).map(marker => `
              <span class="ca-panel__audit-pill">${this._esc(marker.label)}</span>
            `).join('')}
          </div>
        ` : `
          <div class="ca-panel__audit-pair-empty">Sin marcador explícito; domina la distancia semántica.</div>
        `}
      </article>
    `;
  }

  /* ─── TABS DE CAPA ─── */

  _setupLayerTabs() {
    const tabs    = this.panel.querySelectorAll('.ca-panel__tab');
    const sections = this.panel.querySelectorAll('.ca-panel__layer');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const capa = tab.dataset.capa;

        // Actualizar tabs
        tabs.forEach(t => {
          t.classList.toggle('ca-panel__tab--active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        // Mostrar/ocultar secciones
        sections.forEach(section => {
          const id = section.id.replace('ca-tab-', '');
          if (capa === 'all') {
            section.removeAttribute('hidden');
          } else {
            if (id === capa) section.removeAttribute('hidden');
            else section.setAttribute('hidden', '');
          }
        });
      });

      // Teclado: flechas entre tabs
      tab.addEventListener('keydown', (e) => {
        const list = [...tabs];
        const idx  = list.indexOf(e.currentTarget);
        let next   = idx;
        if (e.key === 'ArrowRight') next = (idx + 1) % list.length;
        if (e.key === 'ArrowLeft')  next = (idx - 1 + list.length) % list.length;
        if (next !== idx) {
          e.preventDefault();
          list[next].focus();
          list[next].click();
        }
      });
    });
  }

  /* ─── UTILIDADES ─── */

  /**
   * Escapa HTML para prevenir XSS
   */
  _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Limpieza de listeners globales
   */
  destroy() {
    if (this._handleEsc) {
      document.removeEventListener('keydown', this._handleEsc);
    }
  }
}

/* ─── EXPORT GLOBAL ─── */
if (typeof window !== 'undefined') {
  window.NodeRenderer = NodeRenderer;
}