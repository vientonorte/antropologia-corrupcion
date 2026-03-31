/**
 * graph.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Grafo de fricción epistemológica — Contra-Archivo
 *
 * Implementa un grafo force-directed en SVG (vanilla JS + simulación propia).
 * Cada nodo = un caso con 3 capas de verdad.
 * Cada arista = conexión entre conflictos (actores, instituciones, tags compartidos).
 *
 * NO usa D3 para mantener zero-dependency.
 * Implementa física de resortes simplificada (Fruchterman-Reingold adaptado).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── FÍSICA DEL GRAFO ─── */

class ForceSimulation {
    constructor(nodes, links, width, height) {
        this.nodes = nodes.map((n, i) => ({
            ...n,
            x: width / 2 + (Math.random() - 0.5) * width * 0.6,
            y: height / 2 + (Math.random() - 0.5) * height * 0.6,
            vx: 0,
            vy: 0,
        }));
        this.links = links.map(l => ({
            ...l,
            source: this.nodes.find(n => n.id === (l.source ?.id ?? l.source)),
            target: this.nodes.find(n => n.id === (l.target ?.id ?? l.target)),
        })).filter(l => l.source && l.target);
        this.width = width;
        this.height = height;
        this.alpha = 1;
        this.alphaDecay = 0.0228;
        this.alphaMin = 0.001;
        this.velocityDecay = 0.4;
    }

    tick() {
        if (this.alpha < this.alphaMin) return false;
        this.alpha *= (1 - this.alphaDecay);

        const k = Math.min(Math.sqrt((this.width * this.height) / (this.nodes.length || 1)), 180);

        // Fuerza repulsiva entre nodos
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const ni = this.nodes[i],
                    nj = this.nodes[j];
                let dx = nj.x - ni.x,
                    dy = nj.y - ni.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (k * k) / dist * this.alpha;
                const fx = dx / dist * force;
                const fy = dy / dist * force;
                ni.vx -= fx;
                ni.vy -= fy;
                nj.vx += fx;
                nj.vy += fy;
            }
        }

        // Fuerza atractiva sobre aristas (resortes)
        for (const link of this.links) {
            let dx = link.target.x - link.source.x;
            let dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = k * 1.5; // distancia ideal
            const force = (dist - targetDist) / dist * this.alpha * (link.weight || 0.5);
            const fx = dx * force;
            const fy = dy * force;
            link.source.vx += fx;
            link.source.vy += fy;
            link.target.vx -= fx;
            link.target.vy -= fy;
        }

        // Fuerza hacia el centro (gravedad suave)
        const cx = this.width / 2,
            cy = this.height / 2;
        for (const n of this.nodes) {
            n.vx += (cx - n.x) * 0.06 * this.alpha;
            n.vy += (cy - n.y) * 0.06 * this.alpha;
        }

        // Aplicar velocidades + decay + bounds
        const margin = 80;
        for (const n of this.nodes) {
            if (n.fixed) continue;
            n.vx *= (1 - this.velocityDecay);
            n.vy *= (1 - this.velocityDecay);
            n.x = Math.max(margin, Math.min(this.width - margin, n.x + n.vx));
            n.y = Math.max(margin, Math.min(this.height - margin, n.y + n.vy));
        }

        return true;
    }

    // Fijar un nodo (drag)
    fix(id, x, y) {
        const n = this.nodes.find(n => n.id === id);
        if (n) {
            n.x = x;
            n.y = y;
            n.vx = 0;
            n.vy = 0;
            n.fixed = true;
        }
    }

    release(id) {
        const n = this.nodes.find(n => n.id === id);
        if (n) n.fixed = false;
    }

    reheat() { this.alpha = 0.3; }
}

/* ─── GRAFO SVG ─── */

class FrictionGraph {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - elemento donde se monta el SVG
     * @param {Object[]} options.nodes        - nodos del motor de fricción
     * @param {Object[]} options.links        - aristas
     * @param {Function} options.onNodeClick  - callback(node)
     * @param {Function} options.onNodeHover  - callback(node|null)
     */
    constructor({ container, nodes, links, onNodeClick, onNodeHover, onLinkHover }) {
        this.container = container;
        this.rawNodes = nodes;
        this.rawLinks = links;
        this.onNodeClick = onNodeClick || (() => {});
        this.onNodeHover = onNodeHover || (() => {});
        this.onLinkHover = onLinkHover || (() => {});
        this.activeLayer = 'all'; // 'all' | 'etica' | 'institucional' | 'material'
        this.selectedId = null;
        this.animFrame = null;
        this.field = null;
        this._dragNode = null;
        this._nodeElMap = new Map();
        this._labelElMap = new Map();
        this._linkElMap = new Map();

        // Shared drag handlers (una sola instancia, no N)
        this._onMouseMove = (e) => {
            if (!this._dragNode) return;
            const rect = this.svg.getBoundingClientRect();
            this.sim.fix(this._dragNode.id, e.clientX - rect.left, e.clientY - rect.top);
            this._updatePositions();
        };
        this._onMouseUp = () => {
            if (this._dragNode) {
                this.sim.release(this._dragNode.id);
                this._dragNode = null;
            }
        };

        this._init();
    }

    _init() {
        // SVG root
        const { width, height } = this._dims();
        this.svg = this._createSVG(width, height);
        this.container.appendChild(this.svg);

        // Defs: gradients, filters
        this._setupDefs();

        // Layers
        this.linkLayer = this._createGroup('ca-links');
        this.nodeLayer = this._createGroup('ca-nodes');
        this.labelLayer = this._createGroup('ca-labels');
        this.svg.appendChild(this.linkLayer);
        this.svg.appendChild(this.nodeLayer);
        this.svg.appendChild(this.labelLayer);

        // Simulación
        this.sim = new ForceSimulation(this.rawNodes, this.rawLinks, width, height);

        // Render inicial
        this._renderLinks();
        this._renderNodes();

        // Campo de física (canvas detrás del SVG)
        if (window.FrictionField) {
            this.field = new window.FrictionField({
                container: this.container,
                nodes: this.sim.nodes,
                links: this.sim.links,
            });
        }

        // Animación
        this._animate();

        // Resize
        this._setupResize();

        // Drag global (un solo par de listeners)
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
    }

    _dims() {
        const rect = this.container.getBoundingClientRect();
        return {
            width: Math.max(rect.width || 600, 300),
            height: Math.max(rect.height || 500, 300),
        };
    }

    _createSVG(w, h) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Grafo de fricción epistemológica — Contra-Archivo');
        svg.classList.add('friction-graph-svg');
        return svg;
    }

    _createGroup(cls) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add(cls);
        return g;
    }

    _setupDefs() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Glow filter para nodos de alta fricción
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'ca-glow');
        filter.innerHTML = `
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    `;
        defs.appendChild(filter);

        // Clip circular para nodos
        const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clip.setAttribute('id', 'ca-node-clip');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '40');
        clip.appendChild(circle);
        defs.appendChild(clip);

        this.svg.appendChild(defs);
    }

    /* ─── RENDER DE LINKS ─── */

    _renderLinks() {
        this.linkLayer.innerHTML = '';
        this._linkElMap.clear();
        for (const link of this.sim.links) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('ca-link');
            line.setAttribute('stroke-width', Math.max(1, link.weight * 4));
            line.setAttribute('data-source', link.source.id);
            line.setAttribute('data-target', link.target.id);

            // Tooltip de conexión (fallback nativo)
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            const shared = [
                ...link.actores.map(a => `Actor: ${a}`),
                ...link.instituciones.map(i => `Institución: ${i}`),
                ...link.tags.map(t => `Tema: ${t}`),
            ].join(' · ');
            title.textContent = shared || 'Conflictos conectados';
            line.appendChild(title);

            // Custom hover tooltip for links
            line.style.cursor = 'pointer';
            line.addEventListener('mouseenter', () => {
                this.onLinkHover(link);
            });
            line.addEventListener('mouseleave', () => {
                this.onLinkHover(null);
            });

            this.linkLayer.appendChild(line);
            this._linkElMap.set(`${link.source.id}|${link.target.id}`, line);
        }
    }

    /* ─── RENDER DE NODOS ─── */

    _renderNodes() {
        this.nodeLayer.innerHTML = '';
        this.labelLayer.innerHTML = '';
        this._nodeElMap.clear();
        this._labelElMap.clear();

        for (const node of this.sim.nodes) {
            const g = this._createNodeGroup(node);
            this.nodeLayer.appendChild(g);
            this._nodeElMap.set(node.id, g);

            const lbl = this._createLabel(node);
            this.labelLayer.appendChild(lbl);
            this._labelElMap.set(node.id, lbl);
        }
    }

    /**
     * Cada nodo = 3 círculos superpuestos (diagrama de Venn simplificado)
     * Centro = intensidad de fricción
     */
    _createNodeGroup(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('ca-node');
        g.setAttribute('data-id', node.id);
        g.setAttribute('data-tipo', node.tipo);
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label',
            `Caso: ${node.titulo}. Fricción ${node.tipo}, intensidad ${Math.round(node.intensidad * 100)}%. ${node.tension}`
        );

        const r = 30; // radio base
        const ri = node.intensidad * r * 0.7; // radio zona de fricción central
        const offset = r * 0.45; // desplazamiento de los círculos de capa

        // Círculo fondo (sombra/glow si intensidad alta)
        if (node.intensidad > 0.75) {
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('r', r + 8);
            glow.setAttribute('fill', 'none');
            glow.setAttribute('stroke', this._frictionColor(node.intensidad));
            glow.setAttribute('stroke-width', '2');
            glow.setAttribute('opacity', '0.4');
            glow.setAttribute('filter', 'url(#ca-glow)');
            g.appendChild(glow);
        }

        // Capa ética (arriba-izquierda)
        g.appendChild(this._layerCircle(-offset * 0.6, -offset * 0.7, r * 0.85,
            node.colorEtica, 'etica', node.etica ?.titulo
        ));

        // Capa institucional (arriba-derecha)
        g.appendChild(this._layerCircle(
            offset * 0.6, -offset * 0.7, r * 0.85,
            node.colorInstitucional, 'institucional', node.institucional ?.titulo
        ));

        // Capa material (abajo-centro)
        g.appendChild(this._layerCircle(
            0, offset * 0.7, r * 0.85,
            node.colorMaterial, 'material', node.material ?.titulo
        ));

        // Zona de fricción central
        const frictionCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        frictionCircle.setAttribute('r', Math.max(ri, 6));
        frictionCircle.setAttribute('fill', this._frictionColor(node.intensidad));
        frictionCircle.setAttribute('opacity', '0.9');
        frictionCircle.classList.add('ca-friction-center');
        g.appendChild(frictionCircle);

        // Indicador de tipo (anillo punteado)
        const typeRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        typeRing.setAttribute('r', r + 4);
        typeRing.setAttribute('fill', 'none');
        typeRing.setAttribute('stroke', this._typeColor(node.tipo));
        typeRing.setAttribute('stroke-width', '1.5');
        typeRing.setAttribute('stroke-dasharray', this._typeDash(node.tipo));
        typeRing.setAttribute('opacity', '0.7');
        g.appendChild(typeRing);

        // Hitbox invisible para interacción
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitbox.setAttribute('r', r + 12);
        hitbox.setAttribute('fill', 'transparent');
        hitbox.classList.add('ca-hitbox');
        g.appendChild(hitbox);

        // Eventos
        this._attachNodeEvents(g, node);

        return g;
    }

    _layerCircle(cx, cy, r, color, capaName, title) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', cy);
        c.setAttribute('r', r);
        c.setAttribute('fill', color);
        c.setAttribute('opacity', '0.55');
        c.classList.add('ca-layer-circle', `ca-layer-${capaName}`);
        if (title) {
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            t.textContent = title;
            c.appendChild(t);
        }
        return c;
    }

    _createLabel(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('ca-label');
        g.setAttribute('data-id', node.id);
        g.setAttribute('pointer-events', 'none');

        // Nombre del caso (truncado)
        const words = node.titulo.split(' ');
        const firstLine = words.slice(0, 3).join(' ');
        const rest = words.slice(3, 6).join(' ');

        const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text1.setAttribute('text-anchor', 'middle');
        text1.setAttribute('dy', '48');
        text1.setAttribute('font-size', '9');
        text1.textContent = firstLine;
        g.appendChild(text1);

        if (rest) {
            const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text2.setAttribute('text-anchor', 'middle');
            text2.setAttribute('dy', '59');
            text2.setAttribute('font-size', '9');
            text2.textContent = rest + (words.length > 6 ? '…' : '');
            g.appendChild(text2);
        }

        return g;
    }

    _attachNodeEvents(g, node) {
        // Hover
        g.addEventListener('mouseenter', () => {
            g.classList.add('ca-node--hovered');
            this.onNodeHover(node);
        });
        g.addEventListener('mouseleave', () => {
            g.classList.remove('ca-node--hovered');
            if (this.selectedId !== node.id) this.onNodeHover(null);
        });

        // Click
        g.addEventListener('click', () => this._selectNode(node));

        // Teclado (accesibilidad)
        g.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._selectNode(node);
            }
        });

        // Drag (usa shared handler en lugar de N listeners en window)
        g.addEventListener('mousedown', (e) => {
            this._dragNode = node;
            this.sim.reheat();
            e.preventDefault();
        });

        // Touch drag
        g.addEventListener('touchstart', (e) => {
            this.sim.reheat();
        }, { passive: true });
        g.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;
            const rect = this.svg.getBoundingClientRect();
            const t = e.touches[0];
            this.sim.fix(node.id, t.clientX - rect.left, t.clientY - rect.top);
            this._updatePositions();
        }, { passive: true });
        g.addEventListener('touchend', () => this.sim.release(node.id), { passive: true });
    }

    _selectNode(node) {
        const prev = this.selectedId;
        this.selectedId = node.id;

        // Actualizar clases visuales
        this.nodeLayer.querySelectorAll('.ca-node').forEach(g => {
            const id = g.getAttribute('data-id');
            g.classList.toggle('ca-node--selected', id === node.id);
            g.classList.toggle('ca-node--dimmed',
                id !== node.id && this.rawLinks.every(l =>
                    (l.source ?.id ?? l.source) !== node.id &&
                    (l.target ?.id ?? l.target) !== node.id ||
                    (l.source ?.id ?? l.source) !== id &&
                    (l.target ?.id ?? l.target) !== id
                )
            );
        });

        this.linkLayer.querySelectorAll('.ca-link').forEach(line => {
            const connected =
                line.getAttribute('data-source') === node.id ||
                line.getAttribute('data-target') === node.id;
            line.classList.toggle('ca-link--active', connected);
            line.classList.toggle('ca-link--dimmed', !connected);
        });

        this.onNodeClick(node);
    }

    /* ─── LOOP DE ANIMACIÓN ─── */

    _animate() {
        const step = () => {
            const running = this.sim.tick();
            this._updatePositions();
            if (running) {
                this.animFrame = requestAnimationFrame(step);
            }
        };
        this.animFrame = requestAnimationFrame(step);
    }

    _updatePositions() {
        for (const n of this.sim.nodes) {
            const g = this._nodeElMap.get(n.id);
            const lb = this._labelElMap.get(n.id);
            if (g) g.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
            if (lb) lb.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
        }

        for (const link of this.sim.links) {
            const line = this._linkElMap.get(`${link.source.id}|${link.target.id}`);
            if (line) {
                line.setAttribute('x1', link.source.x.toFixed(1));
                line.setAttribute('y1', link.source.y.toFixed(1));
                line.setAttribute('x2', link.target.x.toFixed(1));
                line.setAttribute('y2', link.target.y.toFixed(1));
            }
        }

        // Sincronizar campo de física con posiciones
        if (this.field) this.field.updateNodes(this.sim.nodes, this.sim.links);
    }

    /* ─── FILTROS EXTERNOS ─── */

    /**
     * Muestra sólo la capa indicada, atenúa las demás
     * @param {'all'|'etica'|'institucional'|'material'} layer
     */
    setActiveLayer(layer) {
        this.activeLayer = layer;
        this.nodeLayer.querySelectorAll('.ca-layer-circle').forEach(c => {
            const capaName = [...c.classList].find(cl => cl.startsWith('ca-layer-') && cl !== 'ca-layer-circle') ?
                .replace('ca-layer-', '');
            if (layer === 'all') {
                c.setAttribute('opacity', '0.55');
            } else if (capaName === layer) {
                c.setAttribute('opacity', '0.85');
            } else {
                c.setAttribute('opacity', '0.1');
            }
        });
        if (this.field) this.field.setActiveLayer(layer);
    }

    /**
     * Filtra nodos por tipo de fricción
     * @param {'all'|'politica'|'semantica'|'tecnica'} tipo
     */
    setFrictionTypeFilter(tipo) {
        this.nodeLayer.querySelectorAll('.ca-node').forEach(g => {
            const nodeTipo = g.getAttribute('data-tipo');
            g.classList.toggle('ca-node--dimmed', tipo !== 'all' && nodeTipo !== tipo);
        });
    }

    /* ─── RESIZE ─── */

    _setupResize() {
        const ro = new ResizeObserver(() => this._onResize());
        ro.observe(this.container);
    }

    _onResize() {
        const { width, height } = this._dims();
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        this.sim.width = width;
        this.sim.height = height;
        this.sim.reheat();
        if (this.field) this.field.resize(width, height);
    }

    /* ─── UTILIDADES DE COLOR ─── */

    _frictionColor(intensity) {
        // 0 = azul frío → 1 = dorado intenso
        if (intensity < 0.4) return '#4a7fa5';
        if (intensity < 0.65) return '#b8922e';
        if (intensity < 0.8) return '#c8a96e';
        return '#e8c47a';
    }

    _typeColor(tipo) {
        const map = {
            politica: '#a05c5c',
            semantica: '#c8a96e',
            tecnica: '#5c8fa0',
        };
        return map[tipo] || '#6e6e6e';
    }

    _typeDash(tipo) {
        const map = {
            politica: '4 2',
            semantica: '2 2',
            tecnica: '6 2',
        };
        return map[tipo] || '4 4';
    }

    /* ─── CLEANUP ─── */

    destroy() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        if (this.field) this.field.destroy();
        this.svg ?.remove();
    }
}

/* ─── EXPORT GLOBAL ─── */
if (typeof window !== 'undefined') {
    window.FrictionGraph = FrictionGraph;
}