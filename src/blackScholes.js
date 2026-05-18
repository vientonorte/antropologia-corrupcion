/**
 * blackScholes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Ecuación de Black-Scholes adaptada para fricción epistemológica — Contra-Archivo
 *
 * Black & Scholes (1973) modelaron el precio de una opción financiera con la PDE:
 *
 *   ∂V/∂t + rS·∂V/∂S + ½σ²S²·∂²V/∂S² − rV = 0
 *
 * Aquí cada variable se reinterpreta en el dominio epistémico:
 *
 *   V(S,t)  Valor de resolución epistémica — probabilidad esperada (descontada)
 *           de que el caso alcance visibilidad institucional suficiente.
 *
 *   S       Presión pública actual — índice compuesto de actores, instituciones,
 *           conexiones y tags que ejercen fuerza sobre el caso.
 *
 *   K       Umbral de resolución (strike) — cuánta presión necesita el caso
 *           para "ejercerse": varía según su estado (abierta / parcial / archivada).
 *
 *   σ       Volatilidad epistemológica — intensidad de la fricción entre capas
 *           calculada por frictionEngine. Alta σ = mayor incertidumbre sobre
 *           qué versión del conflicto prevalecerá.
 *
 *   r       Tasa de erosión institucional — ritmo al que el silencio y el tiempo
 *           deprecian el valor del caso si no hay nueva presión social.
 *
 *   T       Tiempo transcurrido — años desde que ocurrió el evento. A mayor T
 *           con presión insuficiente, Theta negativo devora el valor.
 *
 * La ecuación revela tensiones no obvias:
 *   · Un caso con alta fricción (σ↑) no necesariamente pierde valor: si S > K,
 *     la volatilidad amplifica la probabilidad de salto hacia visibilidad.
 *   · Theta (∂V/∂T) mide el costo anual del silencio — cuánto valor pierde el
 *     caso por cada año sin presión pública nueva.
 *   · Gamma alto (∂²V/∂S²) señala casos "near the money": pequeños cambios en
 *     presión producen grandes cambios en la probabilidad de resolución.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES DEL MODELO
═══════════════════════════════════════════════════════════════════════════ */

const BS_CONFIG = Object.freeze({
    // Tasa de erosión institucional anual (análogo a risk-free rate)
    // 6% refleja: rotación de autoridades, prescripción administrativa, olvido mediático
    EROSION_RATE: 0.06,

    // Año actual para calcular T — dinámico para evitar staleness anual
    CURRENT_YEAR: new Date().getFullYear(),

    // Tiempo mínimo (evita singularidad en T→0)
    MIN_T: 0.25,

    // Rango de σ mapeado desde la intensidad de fricción (0-1)
    SIGMA_MIN: 0.10,
    SIGMA_MAX: 0.95,

    // Rango de S (presión pública) — normalización del índice compuesto
    PRESSURE_SCALE: 10,

    // Umbrales K según estado del caso
    STRIKE: Object.freeze({
        abierta:   1.00, // requiere presión estándar
        parcial:   0.70, // ya tiene algo de visibilidad — más fácil de activar
        archivada: 1.60, // enterrado institucionalmente — muy difícil
        cerrada:   1.40,
        resuelta:  0.50, // ya ejercida — valor residual de seguimiento
    }),

    STRIKE_DEFAULT: 1.00,
});

/* ═══════════════════════════════════════════════════════════════════════════
   MATEMÁTICAS: CDF / PDF NORMAL
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Aproximación de la CDF de N(0,1) — Abramowitz & Stegun 26.2.17
 * Error máximo: 7.5×10⁻⁸
 * @param {number} x
 * @returns {number} P(Z ≤ x)
 */
function normCDF(x) {
    if (x < -8) return 0;
    if (x > 8)  return 1;

    const p  =  0.2316419;
    const b1 =  0.319381530;
    const b2 = -0.356563782;
    const b3 =  1.781477937;
    const b4 = -1.821255978;
    const b5 =  1.330274429;

    const t = 1 / (1 + p * Math.abs(x));
    const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
    const pdf  = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    const cdf  = 1 - pdf * poly;

    return x >= 0 ? cdf : 1 - cdf;
}

/**
 * PDF de N(0,1)
 * @param {number} x
 * @returns {number} φ(x)
 */
function normPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CORE: BLACK-SCHOLES
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Calcula d₁ y d₂ de Black-Scholes.
 * d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)
 * d₂ = d₁ − σ·√T
 */
function computeD(S, K, r, sigma, T) {
    const sqrtT  = Math.sqrt(T);
    const sigmaT = sigma * sqrtT;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / sigmaT;
    const d2 = d1 - sigmaT;
    return { d1, d2, sqrtT, sigmaT };
}

/**
 * Precio de la "call epistémica":
 * valor de la opción de que el caso ALCANCE el umbral de resolución.
 *
 * C = S·N(d₁) − K·e^(−rT)·N(d₂)
 *
 * @param {number} S     presión pública (spot)
 * @param {number} K     umbral de resolución (strike)
 * @param {number} r     tasa de erosión institucional
 * @param {number} sigma volatilidad epistemológica
 * @param {number} T     años transcurridos
 * @returns {number} valor esperado de resolución (0-∞, normalizado por K)
 */
function priceCall(S, K, r, sigma, T) {
    if (T <= 0 || sigma <= 0) return Math.max(S - K, 0);
    const { d1, d2 } = computeD(S, K, r, sigma, T);
    return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
}

/**
 * Precio de la "put epistémica":
 * valor de la opción de que el caso sea SUPRIMIDO / enterrado institucionalmente.
 *
 * P = K·e^(−rT)·N(−d₂) − S·N(−d₁)
 */
function pricePut(S, K, r, sigma, T) {
    if (T <= 0 || sigma <= 0) return Math.max(K - S, 0);
    const { d1, d2 } = computeD(S, K, r, sigma, T);
    return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

/**
 * Calcula las Letras Griegas adaptadas al dominio epistemológico.
 *
 * Δ  (Delta)  = ∂V/∂S   — sensibilidad a cambios en presión pública
 * Γ  (Gamma)  = ∂²V/∂S² — curvatura; alto = caso cerca del umbral de resolución
 * Θ  (Theta)  = ∂V/∂T   — costo anual del silencio (siempre negativo)
 * ν  (Vega)   = ∂V/∂σ   — sensibilidad a la volatilidad de la fricción
 * ρ  (Rho)    = ∂V/∂r   — sensibilidad a la erosión institucional
 *
 * @returns {{ delta, gamma, theta, vega, rho }}  theta en unidades/año
 */
function greeks(S, K, r, sigma, T) {
    if (T <= 0 || sigma <= 0) {
        return { delta: S > K ? 1 : 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
    }

    const { d1, d2, sqrtT } = computeD(S, K, r, sigma, T);
    const nd1  = normPDF(d1);
    const Nd1  = normCDF(d1);
    const Nd2  = normCDF(d2);
    const ert  = Math.exp(-r * T);

    const delta = Nd1;
    const gamma = nd1 / (S * sigma * sqrtT);
    // Theta = derivada respecto a T con signo negativo (el tiempo consume valor)
    const theta = -(S * nd1 * sigma / (2 * sqrtT)) - r * K * ert * Nd2;
    const vega  = S * nd1 * sqrtT;
    const rho   = K * T * ert * Nd2;

    return {
        delta: parseFloat(delta.toFixed(4)),
        gamma: parseFloat(gamma.toFixed(4)),
        theta: parseFloat(theta.toFixed(4)),  // por año
        vega:  parseFloat(vega.toFixed(4)),
        rho:   parseFloat(rho.toFixed(4)),
    };
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARÁMETROS: MAPEO DESDE DATOS DEL CASO
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Calcula S (presión pública) a partir de los metadatos del caso.
 * Índice compuesto: actores (0.30) + instituciones (0.25) + conexiones (0.40) + tags (0.05)
 * Normalizado al rango [0.10, 2.50]
 */
function computePressure(caso) {
    const actores      = (caso.actores || []).length;
    const instituciones= (caso.instituciones || []).length;
    const conexiones   = (caso.conexiones || []).length;
    const tags         = (caso.tags || []).length;

    const raw = actores * 0.30 + instituciones * 0.25 + conexiones * 0.40 + tags * 0.05;
    return Math.max(0.10, Math.min(2.50, 0.10 + raw / BS_CONFIG.PRESSURE_SCALE));
}

/**
 * Deriva σ (volatilidad epistemológica) desde la intensidad de fricción.
 * frictionIntensity ∈ [0,1] → σ ∈ [SIGMA_MIN, SIGMA_MAX]
 */
function frictionToSigma(frictionIntensity) {
    const clamped = Math.max(0, Math.min(1, frictionIntensity));
    return BS_CONFIG.SIGMA_MIN + clamped * (BS_CONFIG.SIGMA_MAX - BS_CONFIG.SIGMA_MIN);
}

/**
 * Deriva K (umbral de resolución) del estado del caso.
 */
function computeStrike(caso) {
    const estado = (caso.friccion?.estado || '').toLowerCase();
    return BS_CONFIG.STRIKE[estado] ?? BS_CONFIG.STRIKE_DEFAULT;
}

/**
 * Precio epistémico completo de un caso.
 *
 * @param {Object} caso            - caso del JSON
 * @param {number} frictionIntensity - intensidad calculada por frictionEngine (0-1)
 * @returns {Object}               - parámetros, precios y griegos
 */
function priceCaso(caso, frictionIntensity) {
    const S     = computePressure(caso);
    const K     = computeStrike(caso);
    const sigma = frictionToSigma(frictionIntensity);
    const r     = BS_CONFIG.EROSION_RATE;
    const T     = Math.max(BS_CONFIG.MIN_T, BS_CONFIG.CURRENT_YEAR - (caso.anio || 2020));

    const callVal = priceCall(S, K, r, sigma, T);
    const putVal  = pricePut(S, K, r, sigma, T);
    const g       = greeks(S, K, r, sigma, T);

    const { d2 } = T > 0 && sigma > 0
        ? computeD(S, K, r, sigma, T)
        : { d2: 0 };

    // Probabilidad riesgo-neutral de que el caso alcance visibilidad
    const riskNeutralProb = normCDF(d2);

    // Moneyness: S/K — >1 "in the money" = presión actual supera el umbral
    const moneyness = S / K;

    // Valor intrínseco: lo que valdría la opción si se ejerciera ahora mismo
    const intrinsicValue = Math.max(S - K, 0);

    // Valor temporal: prima por la incertidumbre futura (puede cambiar)
    const timeValue = Math.max(callVal - intrinsicValue, 0);

    return {
        params: { S, K, sigma, r, T },
        callValue:       parseFloat(callVal.toFixed(4)),
        putValue:        parseFloat(putVal.toFixed(4)),
        riskNeutralProb: parseFloat(riskNeutralProb.toFixed(4)),
        moneyness:       parseFloat(moneyness.toFixed(3)),
        intrinsicValue:  parseFloat(intrinsicValue.toFixed(4)),
        timeValue:       parseFloat(timeValue.toFixed(4)),
        greeks:          g,
    };
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTEGRACIÓN: ENRIQUECIMIENTO DE NODOS DEL GRAFO
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Enriquece los nodos del grafo con datos Black-Scholes.
 * Requiere que frictionEngine ya haya calculado el campo .intensidad en cada nodo.
 *
 * @param {Object[]} nodes - nodos de buildGraph()
 * @param {Object[]} casos - array de casos del JSON (para recuperar metadatos)
 */
function enrichNodes(nodes, casos) {
    const casoMap = {};
    for (const c of (casos || [])) casoMap[c.id] = c;

    for (const node of nodes) {
        const caso = casoMap[node.id];
        if (!caso) continue;
        try {
            node.bs = priceCaso(caso, node.intensidad);
        } catch (e) {
            node.bs = null;
        }
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════════════════ */

if (typeof window !== 'undefined' && !window.BlackScholes) {
    window.BlackScholes = {
        priceCaso,
        enrichNodes,
        priceCall,
        pricePut,
        greeks,
        normCDF,
        normPDF,
        frictionToSigma,
        computePressure,
        computeStrike,
        BS_CONFIG,
    };
}
