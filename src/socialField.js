/**
 * socialField.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de Entropía Social — Contra-Archivo
 *
 * Modela la corrupción institucional como un sistema termodinámico:
 *
 *   LEY DE OHM SOCIAL:  I = V / R
 *     V = Potencial de necesidad (presión por resolver un trámite)
 *     R = Resistencia institucional (integridad del funcionario/sistema)
 *     I = Corriente informal (flujo de energía corrupta)
 *
 *   TERMODINÁMICA DEL SOBORNO:
 *     Cada interacción corrupta reduce la fricción local (beneficio inmediato)
 *     pero incrementa la Entropía S del sistema global (desorden/desconfianza).
 *     Cuando S → S_max, la institución alcanza "muerte térmica" — colapso
 *     donde toda transacción requiere soborno y la confianza es cero.
 *
 *   POTENCIAL DE NODO (masa de poder):
 *     Cada nodo tiene una "masa de poder" M que curva el espacio legal.
 *     M alta = capacidad de desviar recursos sin consecuencia.
 *     El campo gravitacional de poder: g(r) = G·M / r²
 *
 *   SATURACIÓN DE CALOR:
 *     Cada nodo acumula "calor" Q proporcional a las interacciones corruptas
 *     que lo atraviesan. Color: frío (azul/ético) → caliente (rojo/corrupto).
 *
 * Renderiza un overlay canvas con métricas termodinámicas en tiempo real.
 * Zero-dependency. Extiende el motor de campos existente (fieldPhysics.js).
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES TERMODINÁMICAS
═══════════════════════════════════════════════════════════════════════════ */

const THERMO_CONFIG = Object.freeze({
    // Constante gravitacional social (cuán fuerte curva el poder el espacio)
    G_SOCIAL: 2400,
    // Factor de Boltzmann social (relación energía-desorden)
    K_BOLTZMANN: 0.08,
    // Resistencia base de un funcionario íntegro (0-1)
    BASE_INTEGRITY: 0.7,
    // Degradación de integridad por unidad de calor
    INTEGRITY_DECAY: 0.003,
    // Umbral de corriente donde comienza la interacción corrupta
    CURRENT_THRESHOLD: 0.35,
    // Factor de disipación de calor (enfriamiento natural del sistema)
    HEAT_DISSIPATION: 0.0005,
    // Entropía máxima antes de colapso sistémico
    ENTROPY_CRITICAL: 0.85,
    // Cantidad de agentes que circulan en el sistema
    AGENT_COUNT: 80,
    // Velocidad base de los agentes
    AGENT_SPEED: 0.8,
    // Vida de un agente (frames antes de reiniciar)
    AGENT_LIFE: 300,
    // Tasa de transferencia de energía en interacción
    TRANSFER_RATE: 0.15,
    // Radio de influencia gravitacional (px)
    GRAVITY_RADIUS: 200,
});

/* ═══════════════════════════════════════════════════════════════════════════
   PALETA TERMOGRÁFICA
═══════════════════════════════════════════════════════════════════════════ */

// Escala: azul (frío/ético) → ámbar (tibio/gris) → rojo (caliente/corrupto)
const THERMO_PALETTE = (() => {
    const stops = [
        { t: 0.0, r: 60, g: 120, b: 180 }, // azul frío — integridad
        { t: 0.25, r: 74, g: 127, b: 165 }, // azul institucional
        { t: 0.4, r: 160, g: 140, b: 100 }, // transición ámbar
        { t: 0.55, r: 200, g: 169, b: 110 }, // dorado — zona gris
        { t: 0.7, r: 200, g: 120, b: 70 }, // naranja — corrupción activa
        { t: 0.85, r: 180, g: 60, b: 50 }, // rojo — saturación
        { t: 1.0, r: 140, g: 30, b: 30 }, // rojo oscuro — colapso
    ];
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
        const t = i / 255;
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

/* ═══════════════════════════════════════════════════════════════════════════
   CLASE: SocialField — Motor de Entropía Social
═══════════════════════════════════════════════════════════════════════════ */

class SocialField {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container  - contenedor del grafo
     * @param {Object[]}    options.nodes      - nodos del grafo (con x, y, intensidad, tipo)
     * @param {Object[]}    options.links      - aristas del grafo
     * @param {HTMLElement} options.metricsEl  - elemento para métricas termodinámicas
     */
    constructor({ container, nodes, links, metricsEl }) {
        this.container = container;
        this.nodes = nodes;
        this.links = links;
        this.metricsEl = metricsEl || null;
        this.width = 0;
        this.height = 0;

        // Estado termodinámico
        this.entropy = 0; // Entropía global S (0 → 1)
        this.systemHeat = 0; // Calor total del sistema Q
        this.totalTransactions = 0; // Interacciones totales
        this.corruptTransactions = 0;
        this.collapseTriggered = false;

        // Estado por nodo
        this.nodeState = new Map();

        // Agentes (ciudadanos/trámites que circulan)
        this.agents = [];

        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.animFrame = null;
        this._frameCount = 0;
        this.visible = true;
        this._lastMetricsUpdate = 0;

        // Historial de entropía para sparkline
        this.entropyHistory = [];

        this._init();
    }

    /* ─── INICIALIZACIÓN ─── */

    _init() {
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(rect.width || this.container.offsetWidth || 600, 300);
        this.height = Math.max(rect.height || this.container.offsetHeight || 500, 300);

        // Asignar posiciones a nodos (layout circular centrado)
        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.32;
        const n = this.nodes.length || 1;
        for (let i = 0; i < this.nodes.length; i++) {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            this.nodes[i].x = cx + radius * Math.cos(angle);
            this.nodes[i].y = cy + radius * Math.sin(angle);
        }

        // Resolver links: convertir string IDs a referencias de objeto nodo
        const nodeMap = new Map(this.nodes.map(nd => [nd.id, nd]));
        this.links = this.links.map(lk => {
            const src = typeof lk.source === 'string' ? nodeMap.get(lk.source) : lk.source;
            const tgt = typeof lk.target === 'string' ? nodeMap.get(lk.target) : lk.target;
            return Object.assign({}, lk, { source: src, target: tgt });
        }).filter(lk => lk.source && lk.target);


        // Canvas sobre el SVG (z-index alto)
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.className = 'social-field-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true });

        // Inicializar estado de nodos
        this._initNodeState();

        // Inicializar agentes (reduce en pantallas pequeñas para perf)
        this._agentScale = this.width < 500 ? 0.5 : 1;
        this._initAgents();

        // Loop
        this._animate();

        // Pausar cuando offscreen (IntersectionObserver)
        this._io = new IntersectionObserver(entries => {
            const vis = entries[0].isIntersecting;
            if (vis && !this.visible) {
                this.visible = true;
                this.canvas.style.display = 'block';
                this._animate(); // Reiniciar loop cuando vuelve a ser visible
            } else if (!vis && this.visible) {
                this.visible = false;
            }
        }, { threshold: 0.05 });
        this._io.observe(this.container);
    }

    /* ─── ESTADO DE NODOS ─── */

    _initNodeState() {
        for (const node of this.nodes) {
            // Masa de poder: función de intensidad y tipo de fricción
            const typeMult = node.tipo === 'politica' ? 1.4 :
                node.tipo === 'semantica' ? 1.0 :
                0.8; // tecnica
            const powerMass = (node.intensidad || 0.5) * typeMult;

            this.nodeState.set(node.id, {
                // Potencial de poder (curva el espacio legal)
                powerMass,
                // Resistencia institucional (integridad)
                integrity: THERMO_CONFIG.BASE_INTEGRITY * (1 - node.intensidad * 0.3),
                // Calor acumulado (saturación de corrupción)
                heat: node.intensidad * 0.2, // inicializar proporcional a fricción existente
                // Corriente informal acumulada
                currentFlow: 0,
                // Contador de interacciones corruptas
                corruptCount: 0,
                // Temperatura local
                temperature: 0,
            });
        }
    }

    /* ─── AGENTES (ciudadanos/trámites) ─── */

    _initAgents() {
        this.agents = [];
        const count = Math.round(THERMO_CONFIG.AGENT_COUNT * (this._agentScale || 1));
        for (let i = 0; i < count; i++) {
            this.agents.push(this._spawnAgent());
        }
    }

    _spawnAgent() {
        // Spawn en borde aleatorio (ciudadano entra al sistema)
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0:
                x = Math.random() * this.width;
                y = -10;
                break;
            case 1:
                x = this.width + 10;
                y = Math.random() * this.height;
                break;
            case 2:
                x = Math.random() * this.width;
                y = this.height + 10;
                break;
            default:
                x = -10;
                y = Math.random() * this.height;
        }

        // Necesidad = presión por resolver trámite (V en I=V/R)
        const necessity = 0.3 + Math.random() * 0.7;

        return {
            x,
            y,
            vx: 0,
            vy: 0,
            necessity, // V: potencial de necesidad
            patience: 1.0, // paciencia restante (decrece con el tiempo)
            corrupted: false, // si ya participó en interacción corrupta
            energy: 0, // energía informal acumulada
            life: Math.random() * THERMO_CONFIG.AGENT_LIFE,
            maxLife: THERMO_CONFIG.AGENT_LIFE,
            size: 1.5 + necessity * 1.5,
            nearNode: null, // nodo más cercano
        };
    }

    /* ─── FÍSICA: LEY DE OHM SOCIAL ─── */

    /**
     * I = V / R
     * V = presión por necesidad × proximidad al nodo de poder
     * R = integridad del nodo (decrece con calor acumulado)
     * Si I > umbral → interacción corrupta
     */
    _computeSocialCurrent(agent, nodeId) {
        const state = this.nodeState.get(nodeId);
        if (!state) return 0;

        const V = agent.necessity * (1 + (1 - agent.patience) * 0.5);
        const R = Math.max(0.05, state.integrity);
        return V / R;
    }

    /**
     * Campo gravitacional de poder: g(r) = G·M / r²
     * Atrae agentes hacia nodos con alta masa de poder
     */
    // Reusable result object (evita 80 allocs/frame)
    _gravResult = { gx: 0, gy: 0, closestNode: null, closestDistSq: Infinity };

    _gravityAt(x, y) {
        const res = this._gravResult;
        res.gx = 0; res.gy = 0; res.closestNode = null; res.closestDistSq = Infinity;
        const softSq = 900;
        const gravRadSq = THERMO_CONFIG.GRAVITY_RADIUS * THERMO_CONFIG.GRAVITY_RADIUS;

        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const state = this.nodeState.get(node.id);
            if (!state) continue;

            const dx = node.x - x;
            const dy = node.y - y;
            const rawDistSq = dx * dx + dy * dy;

            // Closest node (sin sqrt)
            if (rawDistSq < res.closestDistSq) {
                res.closestDistSq = rawDistSq;
                res.closestNode = node;
            }

            if (rawDistSq > gravRadSq) continue;

            const rSq = rawDistSq + softSq;
            const r = Math.sqrt(rSq);
            const force = THERMO_CONFIG.G_SOCIAL * state.powerMass / rSq;
            res.gx += (dx / r) * force;
            res.gy += (dy / r) * force;
        }

        return res;
    }

    /* ─── TERMODINÁMICA ─── */

    /**
     * Procesa la interacción entre agente y nodo.
     * Si la corriente supera el umbral → transacción corrupta:
     *   - El agente resuelve su trámite (reduce necesidad)
     *   - El nodo acumula calor
     *   - La integridad del nodo decrece
     *   - La entropía global aumenta
     */
    _processInteraction(agent, node) {
        const state = this.nodeState.get(node.id);
        if (!state) return;

        const I = this._computeSocialCurrent(agent, node.id);
        this.totalTransactions++;

        if (I > THERMO_CONFIG.CURRENT_THRESHOLD && !agent.corrupted) {
            // Transacción corrupta
            agent.corrupted = true;
            agent.energy += I * THERMO_CONFIG.TRANSFER_RATE;
            agent.necessity *= 0.3; // trámite "resuelto" rápido

            // El nodo absorbe calor
            const deltaQ = I * THERMO_CONFIG.K_BOLTZMANN;
            state.heat += deltaQ;
            state.corruptCount++;
            state.currentFlow += I;
            this.systemHeat += deltaQ;
            this.corruptTransactions++;

            // La integridad se degrada
            state.integrity = Math.max(0.05,
                state.integrity - THERMO_CONFIG.INTEGRITY_DECAY * I);

            // Entropía global: S = ΣQ / T_sistema
            this._updateEntropy();
        } else {
            // Canal formal: más lento pero no genera calor
            agent.patience -= 0.02;
            if (agent.patience <= 0) {
                // Frustración máxima → más susceptible a corrupción
                agent.necessity *= 1.3;
                agent.patience = 0.3;
            }
        }
    }

    _updateEntropy() {
        // Shannon entropy: S = -Σ pᵢ·ln(pᵢ) sobre distribución de calor por nodo
        // Ponderada por corrupt-ratio para acoplar flujo informal con desorden espacial
        if (this.totalTransactions === 0) { this.entropy = 0; return; }

        const n = this.nodes.length;
        if (n === 0) { this.entropy = 0; return; }

        // 1. Distribución de calor: pᵢ = Qᵢ / ΣQ
        let totalHeat = 0;
        for (const [, state] of this.nodeState) totalHeat += state.heat;

        let shannonRaw = 0;
        if (totalHeat > 0.001) {
            for (const [, state] of this.nodeState) {
                const p = state.heat / totalHeat;
                if (p > 1e-9) shannonRaw -= p * Math.log(p);
            }
            // Normalizar: S_max = ln(N) cuando calor uniforme (máximo desorden)
            shannonRaw /= Math.log(n);
        }

        // 2. Factor de corrupción: cuántas transacciones son informales
        const corruptRatio = this.corruptTransactions / this.totalTransactions;

        // 3. Factor de degradación de integridad: cuánto se ha erosionado R̄
        let avgIntegrity = 0;
        for (const [, state] of this.nodeState) avgIntegrity += state.integrity;
        avgIntegrity /= n;
        const integrityLoss = 1 - (avgIntegrity / THERMO_CONFIG.BASE_INTEGRITY);

        // S compuesta: Shannon × (corruptRatio + integrityLoss) / 2
        // - Shannon alta + corrupción alta = máxima entropía
        // - Shannon baja (calor concentrado) aún puede dar entropía si corrupción es alta
        // - Integridad perdida contribuye independientemente
        const fieldFactor = Math.max(corruptRatio, integrityLoss);
        this.entropy = Math.min(1, shannonRaw * 0.6 + fieldFactor * 0.4);

        // Comprobar colapso
        if (this.entropy >= THERMO_CONFIG.ENTROPY_CRITICAL && !this.collapseTriggered) {
            this.collapseTriggered = true;
        }
    }

    /* ─── ACTUALIZACIÓN DE AGENTES ─── */

    _updateAgents() {
        for (const agent of this.agents) {
            // Gravedad de poder atrae al agente
            const grav = this._gravityAt(agent.x, agent.y);
            const gx = grav.gx, gy = grav.gy;
            agent._closestNode = grav.closestNode;
            agent._closestDistSq = grav.closestDistSq;
            const speed = THERMO_CONFIG.AGENT_SPEED;

            agent.vx = agent.vx * 0.9 + gx * 0.005;
            agent.vy = agent.vy * 0.9 + gy * 0.005;

            // Ruido browniano (incertidumbre social)
            agent.vx += (Math.random() - 0.5) * speed * 0.3;
            agent.vy += (Math.random() - 0.5) * speed * 0.3;

            // Limitar velocidad
            const mag = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
            if (mag > speed * 2) {
                agent.vx = (agent.vx / mag) * speed * 2;
                agent.vy = (agent.vy / mag) * speed * 2;
            }

            agent.x += agent.vx;
            agent.y += agent.vy;
            agent.life--;
            agent.patience -= 0.001;

            // Detectar cercanía a nodos (reutiliza datos de _gravityAt fusionado)
            agent.nearNode = agent._closestNode || null;

            // Interacción si está suficientemente cerca
            if (agent._closestDistSq < 2500 && agent.nearNode) { // 50² = 2500
                this._processInteraction(agent, agent.nearNode);
            }

            // Respawn si muere o sale de bounds
            if (agent.life <= 0 ||
                agent.x < -30 || agent.x > this.width + 30 ||
                agent.y < -30 || agent.y > this.height + 30) {
                Object.assign(agent, this._spawnAgent());
            }
        }
    }

    /* ─── DISIPACIÓN NATURAL ─── */

    _dissipateHeat() {
        // Enfriamiento natural (el sistema tiende al orden si no se alimenta)
        for (const [, state] of this.nodeState) {
            state.heat *= (1 - THERMO_CONFIG.HEAT_DISSIPATION);
            state.temperature = state.heat / (state.integrity + 0.1);
            // Lenta recuperación de integridad si no hay presión
            state.integrity = Math.min(
                THERMO_CONFIG.BASE_INTEGRITY,
                state.integrity + THERMO_CONFIG.INTEGRITY_DECAY * 0.05
            );
            state.currentFlow *= 0.98;
        }
        this.systemHeat *= (1 - THERMO_CONFIG.HEAT_DISSIPATION);
    }

    /* ─── RENDER ─── */

    _animate() {
        const frame = () => {
            if (!this.visible) {
                return; // Pausa real: no solicitar frames cuando offscreen
            }
            this._frameCount++;

            this._updateAgents();

            // Disipar calor cada 10 frames
            if (this._frameCount % 10 === 0) this._dissipateHeat();

            // Registrar entropía para sparkline
            if (this._frameCount % 15 === 0) {
                this.entropyHistory.push(this.entropy);
                if (this.entropyHistory.length > 100) this.entropyHistory.shift();
            }

            this._render();

            // Actualizar métricas cada 20 frames
            if (this._frameCount % 30 === 0) this._updateMetrics();

            this.animFrame = requestAnimationFrame(frame);
        };
        this.animFrame = requestAnimationFrame(frame);
    }

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Campos gravitacionales de poder (halos)
        this._renderPowerFields(ctx);

        // 2. Flujos de corriente informal entre nodos (aristas térmicas)
        this._renderCurrentFlows(ctx);

        // 3. Agentes
        this._renderAgents(ctx);

        // 4. Indicadores de saturación en nodos
        this._renderNodeHeat(ctx);

        // 5. Overlay de fase: orden → desorden visual proporcional a entropía
        if (this.entropy > 0.05) this._renderEntropyPhase(ctx);

        // 6. Indicador de colapso si aplica
        if (this.collapseTriggered) this._renderCollapseWarning(ctx);
    }

    _renderPowerFields(ctx) {
        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const state = this.nodeState.get(node.id);
            if (!state) continue;

            const temp = Math.min(state.temperature, 1);
            const radius = 40 + state.powerMass * 60;
            const pulse = 1 + Math.sin(this._frameCount * 0.02 + state.heat * 5) * 0.06;
            const r = radius * pulse;

            // Gradiente termográfico
            const idx = Math.min(255, Math.floor(temp * 255));
            const cr = THERMO_PALETTE[idx * 3];
            const cg = THERMO_PALETTE[idx * 3 + 1];
            const cb = THERMO_PALETTE[idx * 3 + 2];

            const grad = ctx.createRadialGradient(node.x, node.y, r * 0.1, node.x, node.y, r);
            grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.15 + temp * 0.15})`);
            grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${0.05 + temp * 0.08})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    _renderCurrentFlows(ctx) {
        for (const link of this.links) {
            const s = link.source;
            const t = link.target;
            if (!s?.x || !t?.x) continue;

            const sState = this.nodeState.get(s.id);
            const tState = this.nodeState.get(t.id);
            if (!sState || !tState) continue;

            // Corriente = promedio del flujo informal de ambos nodos
            const flow = (sState.currentFlow + tState.currentFlow) / 2;
            const flowNorm = Math.min(flow / 3, 1);
            if (flowNorm < 0.05) continue;

            // Color: calor promedio
            const avgTemp = Math.min((sState.temperature + tState.temperature) / 2, 1);
            const idx = Math.min(255, Math.floor(avgTemp * 255));
            const cr = THERMO_PALETTE[idx * 3];
            const cg = THERMO_PALETTE[idx * 3 + 1];
            const cb = THERMO_PALETTE[idx * 3 + 2];

            // Línea ondulante (flujo turbulento)
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / dist;
            const ny = dx / dist;
            const amp = flowNorm * 12 * Math.sin(this._frameCount * 0.03);

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.quadraticCurveTo(
                (s.x + t.x) / 2 + nx * amp,
                (s.y + t.y) / 2 + ny * amp,
                t.x, t.y
            );
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.15 + flowNorm * 0.3})`;
            ctx.lineWidth = 1 + flowNorm * 4;
            ctx.stroke();
        }
    }

    _renderAgents(ctx) {
        for (const agent of this.agents) {
            const lifeRatio = agent.life / agent.maxLife;
            const alpha = lifeRatio > 0.85 ? (1 - lifeRatio) * 6.67 :
                lifeRatio < 0.15 ? lifeRatio * 6.67 :
                1;

            if (agent.corrupted) {
                // Agente corrupto: brillo rojo-naranja
                ctx.beginPath();
                ctx.arc(agent.x, agent.y, agent.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 100, 60, ${alpha * 0.15})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(agent.x, agent.y, agent.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 120, 70, ${alpha * 0.7})`;
                ctx.fill();
            } else {
                // Agente limpio: azul-blanco
                const needColor = Math.floor(agent.necessity * 80);
                ctx.beginPath();
                ctx.arc(agent.x, agent.y, agent.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${120 + needColor}, ${160 + needColor * 0.5}, ${200}, ${alpha * 0.6})`;
                ctx.fill();
            }
        }
    }

    _renderNodeHeat(ctx) {
        // Dual-ring system: outer=Integrity(R), inner=Heat(Q), gap=resistance barrier
        const rOuter = 42;    // radio exterior (integridad)
        const rInner = 33;    // radio interior (calor)
        const ringW = 3.5;
        const PI2 = Math.PI * 2;
        const startAngle = -Math.PI / 2; // 12 o'clock

        ctx.lineCap = 'round';

        for (const node of this.nodes) {
            if (!node.x || !node.y) continue;
            const state = this.nodeState.get(node.id);
            if (!state) continue;

            const nx = node.x, ny = node.y;
            const integrity = state.integrity;
            const temp = Math.min(state.temperature, 1);
            const heatFill = Math.min(state.heat / 1.5, 1); // normalizado a 1.5 como saturación
            const flow = state.currentFlow;

            // ── ANILLO EXTERIOR: Integridad R ──
            // Track de fondo (anillo completo, tenue)
            ctx.beginPath();
            ctx.arc(nx, ny, rOuter, 0, PI2);
            ctx.strokeStyle = 'rgba(60,80,100,0.15)';
            ctx.lineWidth = ringW;
            ctx.stroke();

            // Arco de integridad: se consume en sentido horario
            const intAngle = integrity * PI2;
            // Color: azul-frío (íntegro) → ámbar → rojo (degradado)
            const intIdx = Math.min(255, Math.floor((1 - integrity) * 255));
            const iR = THERMO_PALETTE[intIdx * 3];
            const iG = THERMO_PALETTE[intIdx * 3 + 1];
            const iB = THERMO_PALETTE[intIdx * 3 + 2];

            if (intAngle > 0.02) {
                ctx.beginPath();
                ctx.arc(nx, ny, rOuter, startAngle, startAngle + intAngle);
                ctx.strokeStyle = `rgba(${iR},${iG},${iB},0.75)`;
                ctx.lineWidth = ringW;
                ctx.stroke();

                // Glow en extremo del arco (punto de "resistencia")
                const tipX = nx + rOuter * Math.cos(startAngle + intAngle);
                const tipY = ny + rOuter * Math.sin(startAngle + intAngle);
                ctx.beginPath();
                ctx.arc(tipX, tipY, 2.5, 0, PI2);
                ctx.fillStyle = `rgba(${iR},${iG},${iB},0.9)`;
                ctx.fill();
            }

            // ── ANILLO INTERIOR: Calor Q (se llena como termómetro) ──
            if (heatFill > 0.01) {
                // Track de fondo
                ctx.beginPath();
                ctx.arc(nx, ny, rInner, 0, PI2);
                ctx.strokeStyle = 'rgba(60,40,30,0.1)';
                ctx.lineWidth = ringW * 0.8;
                ctx.stroke();

                // Arco de calor: crece conforme se acumula corrupción
                const heatAngle = heatFill * PI2;
                const hIdx = Math.min(255, Math.floor(heatFill * 255));
                const hR = THERMO_PALETTE[hIdx * 3];
                const hG = THERMO_PALETTE[hIdx * 3 + 1];
                const hB = THERMO_PALETTE[hIdx * 3 + 2];

                ctx.beginPath();
                ctx.arc(nx, ny, rInner, startAngle, startAngle + heatAngle);
                ctx.strokeStyle = `rgba(${hR},${hG},${hB},0.65)`;
                ctx.lineWidth = ringW * 0.8;
                ctx.stroke();
            }

            // ── LABEL: R% + I (si hay corriente) ──
            ctx.font = '9px "SF Mono","Fira Code",monospace';
            ctx.textAlign = 'center';

            const intPct = Math.round(integrity * 100);
            // Color del label acorde a la integridad
            ctx.fillStyle = integrity > 0.5 ? 'rgba(120,180,200,0.7)' :
                integrity > 0.2 ? 'rgba(200,169,110,0.7)' : 'rgba(180,60,50,0.9)';
            ctx.fillText('R=' + intPct + '%', nx, ny + rOuter + 14);

            if (flow > 0.1) {
                ctx.fillStyle = 'rgba(200,120,70,0.7)';
                ctx.fillText('I=' + flow.toFixed(1), nx, ny - rOuter - 8);
            }

            // Indicador de calor (Q%) si relevante
            if (heatFill > 0.15) {
                ctx.font = '7px "SF Mono","Fira Code",monospace';
                ctx.fillStyle = `rgba(200,140,80,${0.4 + heatFill * 0.4})`;
                ctx.fillText('Q=' + Math.round(heatFill * 100) + '%', nx, ny + rOuter + 24);
            }
        }
        ctx.lineCap = 'butt';
    }

    _renderEntropyPhase(ctx) {
        // Overlay visual: a medida que S sube, el espacio se "desorganiza"
        // Fase 1 (S < 0.3): grid sutil de orden institucional (líneas rectas)
        // Fase 2 (0.3 < S < 0.6): distorsión — las líneas se curvan
        // Fase 3 (S > 0.6): ruido — partículas caóticas reemplazan el grid

        const S = this.entropy;
        const w = this.width, h = this.height;
        const t = this._frameCount;

        if (S < 0.3) {
            // Grid ordenado que se desvanece conforme sube S
            const alpha = 0.04 * (1 - S / 0.3);
            ctx.strokeStyle = `rgba(74,127,165,${alpha})`;
            ctx.lineWidth = 0.5;
            const spacing = 40;
            for (let x = spacing; x < w; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0); ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = spacing; y < h; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y); ctx.lineTo(w, y);
                ctx.stroke();
            }
        } else if (S < 0.6) {
            // Grid distorsionado: líneas se curvan proporcionalmente a S
            const distort = (S - 0.3) / 0.3; // 0→1 en este rango
            const alpha = 0.03 + distort * 0.02;
            ctx.strokeStyle = `rgba(200,169,110,${alpha})`;
            ctx.lineWidth = 0.5;
            const spacing = 40;
            for (let x = spacing; x < w; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                for (let y = 0; y < h; y += 20) {
                    const wave = Math.sin(y * 0.02 + t * 0.01 + x * 0.01) * distort * 15;
                    ctx.lineTo(x + wave, y);
                }
                ctx.stroke();
            }
        } else {
            // Muerte térmica: partículas de ruido
            const noiseCount = Math.floor((S - 0.6) / 0.4 * 60);
            const pulse = 0.5 + Math.sin(t * 0.05) * 0.3;
            for (let i = 0; i < noiseCount; i++) {
                // Pseudo-random determinista basado en frame + index
                const seed = (i * 7919 + t * 31) % 10000;
                const px = (seed * 13) % w;
                const py = (seed * 17 + i * 97) % h;
                const size = 0.5 + (seed % 3) * 0.5;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180,60,50,${0.1 * pulse})`;
                ctx.fill();
            }
        }
    }

    _renderCollapseWarning(ctx) {
        const pulse = 0.5 + Math.sin(this._frameCount * 0.08) * 0.5;
        ctx.fillStyle = `rgba(140, 30, 30, ${0.03 * pulse})`;
        ctx.fillRect(0, 0, this.width, this.height);

        // Texto de alerta
        ctx.save();
        ctx.font = 'bold 11px "SF Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(180, 50, 40, ${0.4 + pulse * 0.4})`;
        ctx.fillText(
            'COLAPSO TÉRMICO — ENTROPÍA CRÍTICA',
            this.width / 2, 20
        );
        ctx.restore();
    }

    /* ─── MÉTRICAS ─── */

    _updateMetrics() {
        if (!this.metricsEl) return;

        const corruptPct = this.totalTransactions > 0 ?
            Math.round((this.corruptTransactions / this.totalTransactions) * 100) :
            0;

        // Calcular integridad promedio
        let avgIntegrity = 0;
        let count = 0;
        for (const [, state] of this.nodeState) {
            avgIntegrity += state.integrity;
            count++;
        }
        avgIntegrity = count > 0 ? avgIntegrity / count : 0;

        const entropyPct = Math.round(this.entropy * 100);
        const status = this.collapseTriggered ? 'COLAPSO' :
            this.entropy > 0.6 ? 'CRÍTICO' :
            this.entropy > 0.3 ? 'DEGRADADO' :
            'ESTABLE';

        const statusCls = this.collapseTriggered ? 'sf-status--collapse' :
            this.entropy > 0.6 ? 'sf-status--critical' :
            this.entropy > 0.3 ? 'sf-status--degraded' :
            'sf-status--stable';

        // Fase del sistema
        const phase = this.collapseTriggered ? 'COLAPSO' :
            this.entropy > 0.6 ? 'MUERTE TÉRMICA' :
            this.entropy > 0.3 ? 'TRANSICIÓN' :
            'ORDEN';

        // Fase + sparkline (SVG más grande)
        const sparkW = 160, sparkH = 36;
        const hist = this.entropyHistory;
        let sparkPath = '';
        let sparkArea = '';
        if (hist.length > 1) {
            const dx = sparkW / (hist.length - 1);
            const pts = hist.map((v, i) =>
                `${(i * dx).toFixed(1)},${(sparkH - v * sparkH).toFixed(1)}`
            );
            sparkPath = 'M' + pts.join(' L');
            sparkArea = sparkPath + ` L${sparkW},${sparkH} L0,${sparkH} Z`;
        }

        // Color dinámico de entropía
        const eidx = Math.min(255, Math.floor(this.entropy * 255));
        const eR = THERMO_PALETTE[eidx * 3];
        const eG = THERMO_PALETTE[eidx * 3 + 1];
        const eB = THERMO_PALETTE[eidx * 3 + 2];
        const entropyColor = `rgb(${eR},${eG},${eB})`;

        this.metricsEl.innerHTML = `
      <div class="sf-metrics sf-metrics--enhanced">
        <div class="sf-metric sf-metric--entropy">
          <span class="sf-label">ENTROPÍA S</span>
          <span class="sf-value ${statusCls}" style="color:${entropyColor}">${entropyPct}%</span>
          <svg class="sf-spark" width="${sparkW}" height="${sparkH}" viewBox="0 0 ${sparkW} ${sparkH}">
            <defs>
              <linearGradient id="sf-spark-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${entropyColor}" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="${entropyColor}" stop-opacity="0"/>
              </linearGradient>
            </defs>
            ${sparkArea ? `<path d="${sparkArea}" fill="url(#sf-spark-grad)"/>` : ''}
            <line x1="0" y1="${sparkH * (1 - THERMO_CONFIG.ENTROPY_CRITICAL)}"
                  x2="${sparkW}" y2="${sparkH * (1 - THERMO_CONFIG.ENTROPY_CRITICAL)}"
                  stroke="rgba(180,50,40,0.4)" stroke-width="1" stroke-dasharray="3 2"/>
            <text x="${sparkW - 2}" y="${sparkH * (1 - THERMO_CONFIG.ENTROPY_CRITICAL) - 2}"
                  fill="rgba(180,50,40,0.5)" font-size="6" text-anchor="end">S_crit</text>
            ${sparkPath ? `<path d="${sparkPath}" fill="none" stroke="${entropyColor}" stroke-width="1.5"/>` : ''}
          </svg>
          <span class="sf-phase">${phase}</span>
        </div>
        <div class="sf-metric">
          <span class="sf-label">INTEGRIDAD R\u0304</span>
          <span class="sf-value">${Math.round(avgIntegrity * 100)}%</span>
          <div class="sf-bar">
            <div class="sf-bar__fill sf-bar__fill--integrity"
                 style="width:${Math.round(avgIntegrity * 100)}%;
                        background:${avgIntegrity > 0.5 ? 'rgba(74,127,165,0.6)' : avgIntegrity > 0.2 ? 'rgba(200,169,110,0.6)' : 'rgba(180,60,50,0.7)'}">
            </div>
          </div>
        </div>
        <div class="sf-metric">
          <span class="sf-label">TXN CORRUPTAS</span>
          <span class="sf-value">${corruptPct}%</span>
          <span class="sf-sub">${this.corruptTransactions} / ${this.totalTransactions}</span>
        </div>
        <div class="sf-metric sf-metric--status">
          <span class="sf-label">ESTADO</span>
          <span class="sf-value ${statusCls}">${status}</span>
        </div>
      </div>
    `;
        }

    /* ─── API PÚBLICA ─── */

    updateNodes(nodes, links) {
        this.nodes = nodes;
        this.links = links;
    }

    setVisible(v) {
        const wasHidden = !this.visible;
        this.visible = v;
        this.canvas.style.display = v ? 'block' : 'none';
        if (v && wasHidden) this._animate(); // Re-arrancar loop
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    /** Reset termodinámico — volver a condiciones iniciales */
    reset() {
        this.entropy = 0;
        this.systemHeat = 0;
        this.totalTransactions = 0;
        this.corruptTransactions = 0;
        this.collapseTriggered = false;
        this.entropyHistory = [];
        this._initNodeState();
        this._initAgents();
    }

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
    window.SocialField = SocialField;
}