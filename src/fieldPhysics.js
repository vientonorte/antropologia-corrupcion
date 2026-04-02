/**
 * fieldPhysics.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de física de campos — Contra-Archivo
 *
 * Modela la fricción epistemológica como un campo de fuerzas continuo.
 * Cada caso = fuente de campo con "carga" proporcional a su intensidad de fricción.
 *
 * Física implementada:
 *   - Potencial escalar: Φ(x,y) = Σ qᵢ / rᵢ  (análogo coulombiano)
 *   - Campo de fuerza:   F(x,y) = -∇Φ          (gradiente negativo del potencial)
 *   - Densidad de energía: u(x,y) = |F|² / 2    (energía del campo)
 *   - Líneas de campo:   Integración de streamlines siguiendo F
 *   - Partículas de energía: puntos que fluyen por las líneas de campo
 *
 * Renderiza en un <canvas> detrás del SVG del grafo.
 * Zero-dependency. Usa Canvas2D + ImageData para cálculo GPU-friendly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES FÍSICAS
═══════════════════════════════════════════════════════════════════════════ */

const FIELD_CONFIG = Object.freeze({
    // Resolución del grid (píxeles por celda) — menor = más detalle, más costo
    GRID_RESOLUTION: 6,
    // Intensidad base del campo (coulombiano)
    CHARGE_MULTIPLIER: 8000,
    // Softening para evitar singularidades en r→0
    SOFTENING: 40,
    // Cantidad de partículas de energía
    PARTICLE_COUNT: 120,
    // Velocidad base de partículas
    PARTICLE_SPEED: 1.2,
    // Vida máxima de partícula (frames)
    PARTICLE_LIFE: 180,
    // Cantidad de streamlines por nodo
    STREAMLINES_PER_NODE: 8,
    // Pasos de integración por streamline
    STREAMLINE_STEPS: 60,
    // Paso de integración (Euler)
    STREAMLINE_DT: 4,
    // Opacidad máxima del campo de fondo
    FIELD_MAX_OPACITY: 0.35,
    // Energía de interacción entre nodos conectados (dipolo)
    DIPOLE_STRENGTH: 3000,
});

/* ═══════════════════════════════════════════════════════════════════════════
   PALETA DE COLORES PARA EL CAMPO
═══════════════════════════════════════════════════════════════════════════ */

// Gradiente de potencial: oscuro → dorado → blanco (alta energía)
const FIELD_PALETTE = (() => {
    const stops = [
        { t: 0.0, r: 18, g: 18, b: 18 }, // fondo
        { t: 0.15, r: 40, g: 30, b: 20 }, // terroso oscuro
        { t: 0.3, r: 74, g: 55, b: 30 }, // ámbar profundo
        { t: 0.45, r: 120, g: 90, b: 45 }, // dorado oscuro
        { t: 0.6, r: 180, g: 140, b: 70 }, // dorado
        { t: 0.75, r: 200, g: 169, b: 110 }, // accent (#c8a96e)
        { t: 0.9, r: 232, g: 196, b: 122 }, // dorado claro
        { t: 1.0, r: 255, g: 240, b: 200 }, // casi blanco
    ];

    // Pre-compute LUT de 256 entradas
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
        const t = i / 255;
        // Encontrar los dos stops entre los que estamos
        let lo = stops[0],
            hi = stops[stops.length - 1];
        for (let s = 0; s < stops.length - 1; s++) {
            if (t >= stops[s].t && t <= stops[s + 1].t) {
                lo = stops[s];
                hi = stops[s + 1];
                break;
            }
        }
        const f = (hi.t - lo.t) > 0 ? (t - lo.t) / (hi.t - lo.t) : 0;
        lut[i * 3] = Math.round(lo.r + (hi.r - lo.r) * f);
        lut[i * 3 + 1] = Math.round(lo.g + (hi.g - lo.g) * f);
        lut[i * 3 + 2] = Math.round(lo.b + (hi.b - lo.b) * f);
    }
    return lut;
})();

/* Paleta de capas — para visualización por capa */
const LAYER_PALETTES = {
    etica: { r: 200, g: 169, b: 110 }, // dorado
    institucional: { r: 74, g: 127, b: 165 }, // azul
    material: { r: 122, g: 158, b: 110 }, // verde
};

/* ═══════════════════════════════════════════════════════════════════════════
   CLASE: FIELD PHYSICS ENGINE
═══════════════════════════════════════════════════════════════════════════ */

class FrictionField {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - mismo container del grafo SVG
     * @param {Object[]} options.nodes       - nodos del grafo (con x, y, intensidad)
     * @param {Object[]} options.links       - aristas del grafo
     */
    constructor({ container, nodes, links }) {
        this.container = container;
        this.nodes = nodes;
        this.links = links;
        this.width = 0;
        this.height = 0;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animFrame = null;
        this.visible = true;
        this.activeLayer = 'all';
        this.showStreamlines = true;
        this.showParticles = true;
        this.showField = true;
        this.fieldImageData = null;
        this._needsFieldUpdate = true;
        this._frameCount = 0;
        this._cachedStreamlines = null;
        this._streamlinesDirty = true;
        this._lastPosHash = 0;
        this._gridW = 0;
        this._gridH = 0;
        this._gridRes = FIELD_CONFIG.GRID_RESOLUTION;
        this._potentialGrid = null;
        this._potentialMax = 0;

        this._init();
    }

    /* ─── INICIALIZACIÓN ─── */

    _init() {
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(rect.width || this.container.offsetWidth || 600, 300);
        this.height = Math.max(rect.height || this.container.offsetHeight || 500, 300);

        // Crear canvas detrás del SVG
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.className = 'friction-field-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.container.insertBefore(this.canvas, this.container.firstChild);

        this.ctx = this.canvas.getContext('2d', { alpha: true });

        // Inicializar partículas
        this._initParticles();

        // Primer render del campo estático
        this._computeField();

        // Arrancar loop de animación
        this._animate();

        // Pausar cuando offscreen
        this._io = new IntersectionObserver(entries => {
            const vis = entries[0].isIntersecting;
            if (vis && !this.visible) {
                this.visible = true;
                this.canvas.style.display = 'block';
                this._needsFieldUpdate = true;
                // Cancel existing frame before starting new loop (prevent double-loop)
                if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
                this._animate();
            } else if (!vis && this.visible) {
                this.visible = false;
                if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
            }
        }, { threshold: 0.05 });
        this._io.observe(this.container);
    }

    /* ─── CAMPO ESCALAR (POTENCIAL) ─── */

    /**
     * Calcula el potencial Φ(x,y) en un punto.
     * Φ = Σ (qᵢ / √(rᵢ² + ε²))   donde qᵢ = intensidad × multiplier
     */
    _potential(x, y) {
        let phi = 0;
        const softSq = FIELD_CONFIG.SOFTENING * FIELD_CONFIG.SOFTENING;

        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const dx = x - node.x;
            const dy = y - node.y;
            const rSq = dx * dx + dy * dy + softSq;
            const q = (node.intensidad || 0.5) * FIELD_CONFIG.CHARGE_MULTIPLIER;

            // Campo de capa específica si hay filtro activo
            let layerMult = 1;
            if (this.activeLayer !== 'all') {
                const layerData = node[this.activeLayer];
                layerMult = layerData ? 1.5 : 0.2;
            }

            phi += (q * layerMult) / Math.sqrt(rSq);
        }

        // Componente dipolar para links (interacción entre pares)
        for (const link of this.links) {
            const s = link.source,
                t = link.target;
            if (!s?.x || !t?.x) continue;
            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            const dx = x - mx;
            const dy = y - my;
            const rSq = dx * dx + dy * dy + softSq * 4;
            const strength = (link.weight || 0.5) * FIELD_CONFIG.DIPOLE_STRENGTH;
            phi += strength / Math.sqrt(rSq);
        }

        return phi;
    }

    /**
     * Calcula el vector de fuerza F(x,y) = -∇Φ  (gradiente numérico)
     */
    // Reusable force result object (avoids allocation per call)
    _forceResult = { fx: 0, fy: 0 };

    _forceAt(x, y) {
        const h = 2;
        // Use grid O(1) lookup instead of O(N+L) _potential
        const lookup = this._potentialGrid ? '_potentialFromGrid' : '_potential';
        const dPhiDx = (this[lookup](x + h, y) - this[lookup](x - h, y)) / (2 * h);
        const dPhiDy = (this[lookup](x, y + h) - this[lookup](x, y - h)) / (2 * h);
        const res = this._forceResult;
        res.fx = -dPhiDx;
        res.fy = -dPhiDy;
        return res;
    }

    /**
     * Calcula el grid de potencial (reutilizable por partículas y heatmap)
     */
    _computePotentialGrid() {
        const res = this._gridRes;
        const gw = Math.ceil(this.width / res);
        const gh = Math.ceil(this.height / res);
        this._gridW = gw;
        this._gridH = gh;

        const grid = new Float32Array(gw * gh);
        let maxPhi = 0;

        for (let gy = 0; gy < gh; gy++) {
            for (let gx = 0; gx < gw; gx++) {
                const phi = this._potential(gx * res + res / 2, gy * res + res / 2);
                grid[gy * gw + gx] = phi;
                if (phi > maxPhi) maxPhi = phi;
            }
        }
        this._potentialGrid = grid;
        this._potentialMax = maxPhi;
    }

    /**
     * Interpola el potencial desde el grid pre-calculado (O(1) en lugar de O(N))
     */
    _potentialFromGrid(x, y) {
        if (!this._potentialGrid) return 0;
        const res = this._gridRes;
        const gw = this._gridW;
        const gh = this._gridH;
        const gxf = x / res - 0.5;
        const gyf = y / res - 0.5;
        const gx0 = Math.max(0, Math.min(gw - 1, gxf | 0));
        const gy0 = Math.max(0, Math.min(gh - 1, gyf | 0));
        const gx1 = Math.min(gw - 1, gx0 + 1);
        const gy1 = Math.min(gh - 1, gy0 + 1);
        const fx = gxf - gx0;
        const fy = gyf - gy0;
        return this._potentialGrid[gy0 * gw + gx0] * (1 - fx) * (1 - fy) +
            this._potentialGrid[gy0 * gw + gx1] * fx * (1 - fy) +
            this._potentialGrid[gy1 * gw + gx0] * (1 - fx) * fy +
            this._potentialGrid[gy1 * gw + gx1] * fx * fy;
    }

    /**
     * Calcula y renderiza el campo escalar como heatmap en ImageData
     */
    _computeField() {
        if (!this.showField || !this.visible) return;

        this._computePotentialGrid();
        const res = this._gridRes;
        const gw = this._gridW;
        const gh = this._gridH;
        const grid = this._potentialGrid;
        const maxPhi = this._potentialMax;

        // Crear ImageData a resolución completa
        const imgData = this.ctx.createImageData(this.width, this.height);
        const data = imgData.data;
        const maxOpacity = FIELD_CONFIG.FIELD_MAX_OPACITY * 255;

        // Normalizar y mapear a paleta
        const invMax = maxPhi > 0 ? 1 / maxPhi : 0;

        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                // Interpolación bilineal desde grid
                const gxf = px / res - 0.5;
                const gyf = py / res - 0.5;
                const gx0 = Math.max(0, Math.min(gw - 1, Math.floor(gxf)));
                const gy0 = Math.max(0, Math.min(gh - 1, Math.floor(gyf)));
                const gx1 = Math.min(gw - 1, gx0 + 1);
                const gy1 = Math.min(gh - 1, gy0 + 1);
                const fx = gxf - gx0;
                const fy = gyf - gy0;

                const v00 = grid[gy0 * gw + gx0];
                const v10 = grid[gy0 * gw + gx1];
                const v01 = grid[gy1 * gw + gx0];
                const v11 = grid[gy1 * gw + gx1];

                const phi = v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) +
                    v01 * (1 - fx) * fy + v11 * fx * fy;

                // Normalizar a 0-1 con curva gamma (realza energías medias)
                const norm = Math.pow(Math.min(phi * invMax, 1), 0.6);
                const idx = Math.min(255, Math.round(norm * 255));

                const pIdx = (py * this.width + px) * 4;

                if (this.activeLayer !== 'all' && LAYER_PALETTES[this.activeLayer]) {
                    // Modo capa: teñir con color de capa
                    const lp = LAYER_PALETTES[this.activeLayer];
                    const bright = norm;
                    data[pIdx] = Math.round(lp.r * bright);
                    data[pIdx + 1] = Math.round(lp.g * bright);
                    data[pIdx + 2] = Math.round(lp.b * bright);
                } else {
                    // Modo general: usar paleta friction
                    data[pIdx] = FIELD_PALETTE[idx * 3];
                    data[pIdx + 1] = FIELD_PALETTE[idx * 3 + 1];
                    data[pIdx + 2] = FIELD_PALETTE[idx * 3 + 2];
                }

                // Alpha: transparente en zonas de bajo potencial, más opaco en altas
                data[pIdx + 3] = Math.round(norm * maxOpacity);
            }
        }

        this.fieldImageData = imgData;
        this._needsFieldUpdate = false;
    }

    /* ─── STREAMLINES (LÍNEAS DE CAMPO) ─── */

    /**
     * Genera streamlines integrando el campo de fuerza desde puntos semilla
     * alrededor de cada nodo.
     */
    _computeStreamlines() {
        const lines = [];
        const stepsPerLine = FIELD_CONFIG.STREAMLINE_STEPS;
        const dt = FIELD_CONFIG.STREAMLINE_DT;

        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const n = FIELD_CONFIG.STREAMLINES_PER_NODE;
            const r = 35 + node.intensidad * 20;

            for (let i = 0; i < n; i++) {
                const angle = (i / n) * Math.PI * 2;
                let x = node.x + Math.cos(angle) * r;
                let y = node.y + Math.sin(angle) * r;

                const points = [{ x, y }];

                for (let s = 0; s < stepsPerLine; s++) {
                    const { fx, fy } = this._forceAt(x, y);
                    const mag = Math.sqrt(fx * fx + fy * fy) || 1;

                    // Normalizar + escalar por dt
                    x += (fx / mag) * dt;
                    y += (fy / mag) * dt;

                    // Bounds check
                    if (x < 0 || x > this.width || y < 0 || y > this.height) break;

                    points.push({ x, y });
                }

                if (points.length > 3) {
                    lines.push({
                        points,
                        intensity: node.intensidad,
                        color: this._nodeFieldColor(node),
                    });
                }
            }
        }

        return lines;
    }

    /* ─── PARTÍCULAS DE ENERGÍA ─── */

    _initParticles() {
        this.particles = [];
        for (let i = 0; i < FIELD_CONFIG.PARTICLE_COUNT; i++) {
            this.particles.push(this._resetParticle({}));
        }
    }

    _resetParticle(p) {
        // Spawn cerca de nodos con probabilidad proporcional a intensidad
        const totalIntensity = this.nodes.reduce((s, n) => s + (n.intensidad || 0), 0) || 1;
        let r = Math.random() * totalIntensity;
        let spawnNode = this.nodes[0];

        for (const n of this.nodes) {
            r -= (n.intensidad || 0);
            if (r <= 0) { spawnNode = n; break; }
        }

        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 80;

        p.x = (spawnNode?.x || this.width / 2) + Math.cos(angle) * dist;
        p.y = (spawnNode?.y || this.height / 2) + Math.sin(angle) * dist;
        p.vx = 0;
        p.vy = 0;
        p.life = Math.random() * FIELD_CONFIG.PARTICLE_LIFE;
        p.maxLife = FIELD_CONFIG.PARTICLE_LIFE;
        p.size = 1 + Math.random() * 1.5;
        return p;
    }

    _updateParticles() {
        if (!this.showParticles || !this.visible) return;

        const speed = FIELD_CONFIG.PARTICLE_SPEED;

        for (const p of this.particles) {
            // Calcular fuerza en posición de la partícula
            const { fx, fy } = this._forceAt(p.x, p.y);
            const mag = Math.sqrt(fx * fx + fy * fy) || 1;

            // Integrar movimiento (semi-implícito Euler)
            p.vx = p.vx * 0.85 + (fx / mag) * speed * 0.15;
            p.vy = p.vy * 0.85 + (fy / mag) * speed * 0.15;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            // Reset si muere o sale de bounds
            if (p.life <= 0 || p.x < -10 || p.x > this.width + 10 ||
                p.y < -10 || p.y > this.height + 10) {
                this._resetParticle(p);
            }
        }
    }

    /* ─── RENDER LOOP ─── */

    _animate() {
        if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
        const frame = () => {
            if (!this.visible) {
                this.animFrame = null;
                return; // Pausa real: no solicitar frames
            }

            this._frameCount++;

            // Solo recomputar si las posiciones de nodos realmente cambiaron
            // Numeric hash of positions (avoids string allocation per frame)
            let posHash = 0;
            for (let i = 0; i < this.nodes.length; i++) {
                posHash = (posHash * 31 + ((this.nodes[i].x||0)|0)) | 0;
                posHash = (posHash * 31 + ((this.nodes[i].y||0)|0)) | 0;
            }
            if (this._needsFieldUpdate || (posHash !== this._lastPosHash && this._frameCount % 3 === 0)) {
                this._lastPosHash = posHash;
                this._computeField();
                this._streamlinesDirty = true;
            }

            this._updateParticles();
            this._render();

            this.animFrame = requestAnimationFrame(frame);
        };
        this.animFrame = requestAnimationFrame(frame);
    }

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Campo escalar de fondo (heatmap)
        if (this.fieldImageData && this.showField) {
            ctx.putImageData(this.fieldImageData, 0, 0);
        }

        // 2. Streamlines (solo recalcular cuando dirty)
        if (this.showStreamlines && this._streamlinesDirty) {
            this._cachedStreamlines = this._computeStreamlines();
            this._streamlinesDirty = false;
        }
        if (this._cachedStreamlines && this.showStreamlines) {
            this._renderStreamlines(ctx, this._cachedStreamlines);
        }

        // 3. Líneas de fuerza entre nodos conectados
        this._renderForceLines(ctx);

        // 4. Partículas de energía
        if (this.showParticles) {
            this._renderParticles(ctx);
        }

        // 5. Indicadores de energía en nodos
        this._renderEnergyIndicators(ctx);
    }

    _renderStreamlines(ctx, lines) {
        for (const line of lines) {
            const pts = line.points;
            if (pts.length < 2) continue;

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);

            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }

            // Fade out a lo largo de la línea
            const alpha = 0.15 * line.intensity;
            ctx.strokeStyle = line.color.replace('1)', `${alpha})`);
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }

    _renderForceLines(ctx) {
        const sinVal = Math.sin(this._frameCount * 0.02);
        // Batch: draw all curves first, then all arrows
        for (const link of this.links) {
            const s = link.source,
                t = link.target;
            if (!s?.x || !t?.x) continue;

            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const weight = link.weight || 0.5;
            const alpha = 0.08 * weight;

            // Use flat color instead of gradient per-frame (major perf win)
            ctx.strokeStyle = `rgba(200, 169, 110, ${alpha + 0.04})`;
            ctx.lineWidth = weight * 3;

            const nx = -dy / dist;
            const ny = dx / dist;
            const amp = weight * 15 * sinVal;

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.quadraticCurveTo(
                (s.x + t.x) / 2 + nx * amp,
                (s.y + t.y) / 2 + ny * amp,
                t.x, t.y
            );
            ctx.stroke();
        }
        // Batch arrows in a single path
        ctx.beginPath();
        for (const link of this.links) {
            const s = link.source,
                t = link.target;
            if (!s?.x || !t?.x) continue;
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const weight = link.weight || 0.5;
            const nx = -dy / dist;
            const ny = dx / dist;
            const amp = weight * 15 * sinVal;
            const mx = (s.x + t.x) / 2 + nx * amp * 0.5;
            const my = (s.y + t.y) / 2 + ny * amp * 0.5;
            const angle = Math.atan2(dy, dx);
            const arrowSize = 4 + weight * 4;
            ctx.moveTo(mx + Math.cos(angle) * arrowSize, my + Math.sin(angle) * arrowSize);
            ctx.lineTo(mx + Math.cos(angle + 2.5) * arrowSize * 0.6, my + Math.sin(angle + 2.5) * arrowSize * 0.6);
            ctx.lineTo(mx + Math.cos(angle - 2.5) * arrowSize * 0.6, my + Math.sin(angle - 2.5) * arrowSize * 0.6);
            ctx.closePath();
        }
        ctx.fillStyle = 'rgba(200, 169, 110, 0.15)';
        ctx.fill();
    }

    _renderParticles(ctx) {
        const PI2 = Math.PI * 2;
        const invMax = this._potentialMax > 0 ? 1 / this._potentialMax : 0;

        // Batch normal particles in one path
        ctx.fillStyle = 'rgba(210, 175, 120, 0.45)';
        ctx.beginPath();
        for (const p of this.particles) {
            const lifeRatio = p.life / p.maxLife;
            if (lifeRatio < 0.05 || lifeRatio > 0.95) continue;
            ctx.moveTo(p.x + p.size, p.y);
            ctx.arc(p.x, p.y, p.size, 0, PI2);
        }
        ctx.fill();

        // Glow pass: only high-energy particles
        ctx.fillStyle = 'rgba(232, 196, 122, 0.06)';
        ctx.beginPath();
        for (const p of this.particles) {
            const phi = this._potentialFromGrid(p.x, p.y);
            if (phi * invMax > 0.5) {
                ctx.moveTo(p.x + p.size * 3, p.y);
                ctx.arc(p.x, p.y, p.size * 3, 0, PI2);
            }
        }
        ctx.fill();
    }

    _renderEnergyIndicators(ctx) {
        const PI2 = Math.PI * 2;
        // Only update energy indicators every 2 frames (visual = same, perf = 2x)
        if (this._frameCount % 2 !== 0) return;

        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const energy = node.intensidad || 0.5;
            const radius = 35 + energy * 25;
            const pulse = 1 + Math.sin(this._frameCount * 0.03 + node.intensidad * 10) * 0.08;
            const r = radius * pulse;

            // Simple radial fill instead of gradient (no allocation)
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, PI2);
            ctx.fillStyle = `rgba(200, 169, 110, ${0.04 * energy})`;
            ctx.fill();

            // Energy label
            const E = (energy * energy * FIELD_CONFIG.CHARGE_MULTIPLIER / 2).toFixed(0);
            ctx.font = '9px "SF Mono", "Fira Code", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(200, 169, 110, ${0.4 * energy})`;
            ctx.fillText('E=' + E, node.x, node.y - radius - 8);
        }

        // Batch all force arrows in one path
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200, 169, 110, 0.12)';
        ctx.lineWidth = 1;
        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const energy = node.intensidad || 0.5;
            if (energy <= 0.6) continue;
            const radius = 35 + energy * 25;
            const nArrows = Math.round(energy * 8);
            const innerR = radius * 0.9;
            const outerR = radius * 1.3;
            for (let i = 0; i < nArrows; i++) {
                const a = (i / nArrows) * PI2 + this._frameCount * 0.008;
                ctx.moveTo(
                    node.x + Math.cos(a) * innerR,
                    node.y + Math.sin(a) * innerR
                );
                ctx.lineTo(
                    node.x + Math.cos(a) * outerR,
                    node.y + Math.sin(a) * outerR
                );
            }
        }
        ctx.stroke();
    }

    /* ─── UTILIDADES ─── */

    _nodeFieldColor(node) {
        if (this.activeLayer !== 'all') {
            const lp = LAYER_PALETTES[this.activeLayer];
            if (lp) return `rgba(${lp.r}, ${lp.g}, ${lp.b}, 1)`;
            return 'rgba(128, 128, 128, 1)';
        }

        // Color basado en tipo de fricción dominante
        switch (node.tipo) {
            case 'politica':
                return 'rgba(200, 169, 110, 1)';
            case 'semantica':
                return 'rgba(74, 127, 165, 1)';
            case 'tecnica':
                return 'rgba(122, 158, 110, 1)';
            default:
                return 'rgba(200, 169, 110, 1)';
        }
    }

    /* ─── API PÚBLICA ─── */

    /**
     * Actualizar posiciones de nodos (llamado desde el grafo principal)
     */
    updateNodes(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        this._needsFieldUpdate = true;
    }

    /**
     * Cambiar capa activa
     */
    setActiveLayer(layer) {
        this.activeLayer = layer;
        this._needsFieldUpdate = true;
    }

    /**
     * Toggle de visibilidad
     */
    setVisible(v) {
        this.visible = v;
        this.canvas.style.display = v ? 'block' : 'none';
        if (v) this._needsFieldUpdate = true;
    }

    /**
     * Toggle de componentes individuales
     */
    toggleField(v) {
        this.showField = v;
        this._needsFieldUpdate = true;
    }
    toggleStreamlines(v) { this.showStreamlines = v; }
    toggleParticles(v) { this.showParticles = v; }

    /**
     * Resize
     */
    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
        this._needsFieldUpdate = true;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this._io) this._io.disconnect();
        if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════════════════ */

if (typeof window !== 'undefined') {
    window.FrictionField = FrictionField;
}