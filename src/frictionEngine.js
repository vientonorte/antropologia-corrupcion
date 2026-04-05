/**
 * frictionEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de fricción epistemológica — Contra-Archivo
 *
 * Fricción = diferencia irreductible entre capas de verdad.
 * El motor NO resuelve contradicciones. Las cuantifica y clasifica
 * para hacerlas explorable visualmente.
 *
 * Modelo conceptual:
 *   - Cada caso tiene 3 capas: ética, institucional, material
 *   - La fricción emerge de la distancia semántica entre sus keywords
 *   - La intensidad refleja cuán incompatibles son los marcos de verdad
 *   - El tipo define el plano del conflicto (quién define / qué significa / qué mide)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ─── CONSTANTES ─── */

const FRICTION_TYPES = Object.freeze({
    POLITICA: 'politica', // Conflicto de autoridad: ¿quién tiene derecho a definir?
    SEMANTICA: 'semantica', // Conflicto de significado: ¿qué significa el mismo término?
    TECNICA: 'tecnica', // Conflicto de medición: ¿qué cuentan los datos y para quién?
});

const FRICTION_PAIR_LABELS = Object.freeze({
    etica_institucional: 'Ética ↔ Institucional',
    etica_material: 'Ética ↔ Material',
    institucional_material: 'Institucional ↔ Material',
});

// Pares de keywords que indican fricción alta cuando coexisten en capas distintas
const FRICTION_MARKERS = [
    // Semánticos: misma palabra, mundos distintos
    { a: 'consentimiento', b: 'proceso administrativo', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.9 },
    { a: 'consulta', b: 'trámite', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.85 },
    { a: 'territorio', b: 'catastro', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.88 },
    { a: 'memoria', b: 'clasificación', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.75 },
    { a: 'autonomía', b: 'regulación', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.72 },
    // Políticos: quién habla con autoridad
    { a: 'testimonio', b: 'resolución', tipo: FRICTION_TYPES.POLITICA, peso: 0.8 },
    { a: 'soberanía', b: 'CONADI', tipo: FRICTION_TYPES.POLITICA, peso: 0.9 },
    { a: 'resistencia', b: 'admisibilidad', tipo: FRICTION_TYPES.POLITICA, peso: 0.85 },
    { a: 'fuente', b: 'registro', tipo: FRICTION_TYPES.POLITICA, peso: 0.7 },
    // Técnicos: lo que los datos pueden y no pueden decir
    { a: 'evidencia', b: 'dato', tipo: FRICTION_TYPES.TECNICA, peso: 0.65 },
    { a: 'deforestación', b: 'uso productivo', tipo: FRICTION_TYPES.TECNICA, peso: 0.88 },
    { a: 'opacidad', b: 'transparencia', tipo: FRICTION_TYPES.TECNICA, peso: 0.82 },
    { a: 'whistleblower', b: 'proceso regular', tipo: FRICTION_TYPES.TECNICA, peso: 0.78 },
];

/* ─── UTILIDADES ─── */

/**
 * Normaliza un string: lowercase, sin tildes, sin puntuación
 * @param {string} str
 * @returns {string}
 */
function normalizeStr(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ');
}

/**
 * Extrae todos los keywords de una capa como array normalizado
 * @param {Object} capa - capa del caso (etica | institucional | material)
 * @returns {string[]}
 */
function extractKeywords(capa) {
    if (!capa) return [];
    const base = [
        ...(capa.keywords || []),
        ...(capa.clasificaciones || []),
        capa.titulo || '',
        capa.descripcion || '',
    ];
    return base.flatMap(s => normalizeStr(s).split(/\s+/)).filter(Boolean);
}

/**
 * Calcula la intersección de dos sets de keywords
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number} proporción de overlap (0-1)
 */
function keywordOverlap(a, b) {
    if (!a.length || !b.length) return 0;
    const setA = new Set(a);
    const intersection = b.filter(k => setA.has(k));
    return intersection.length / Math.max(a.length, b.length);
}

/* ─── CORE: CÁLCULO DE FRICCIÓN ─── */

/**
 * Detecta marcadores de fricción entre dos capas
 * @param {string[]} kwA - keywords capa A
 * @param {string[]} kwB - keywords capa B
 * @returns {{ markers: Array, maxPeso: number }}
 */
function detectMarkers(kwA, kwB) {
    const found = [];
    for (const marker of FRICTION_MARKERS) {
        const hasA = kwA.some(k => k.includes(normalizeStr(marker.a)));
        const hasB = kwB.some(k => k.includes(normalizeStr(marker.b)));
        const hasCross = kwA.some(k => k.includes(normalizeStr(marker.b))) &&
            kwB.some(k => k.includes(normalizeStr(marker.a)));
        if ((hasA && hasB) || hasCross) {
            found.push(marker);
        }
    }
    const maxPeso = found.length ? Math.max(...found.map(m => m.peso)) : 0;
    return { markers: found, maxPeso };
}

/**
 * Audita un par de capas para exponer por qué aparece la fricción.
 * @param {string} pairId
 * @param {string[]} kwA
 * @param {string[]} kwB
 * @returns {Object}
 */
function auditLayerPair(pairId, kwA, kwB) {
    const overlap = keywordOverlap(kwA, kwB);
    const { markers, maxPeso } = detectMarkers(kwA, kwB);
    const overlapScore = 1 - Math.min(overlap * 8, 1);
    const pairIntensity = maxPeso > 0 ?
        (overlapScore * 0.4 + maxPeso * 0.6) :
        overlapScore * 0.7;

    return {
        id: pairId,
        label: FRICTION_PAIR_LABELS[pairId] || pairId,
        overlap: parseFloat(overlap.toFixed(3)),
        overlapScore: parseFloat(overlapScore.toFixed(3)),
        markerScore: parseFloat(maxPeso.toFixed(3)),
        pairIntensity: parseFloat(pairIntensity.toFixed(3)),
        markers: markers.map(marker => ({
            a: marker.a,
            b: marker.b,
            tipo: marker.tipo,
            peso: marker.peso,
            label: `${marker.a} ↔ ${marker.b}`,
        })),
    };
}

/**
 * Construye un desglose explicable del caso para auditoría y trazabilidad.
 * @param {Object} etica
 * @param {Object} institucional
 * @param {Object} material
 * @returns {Object}
 */
function auditCaseFriction(etica, institucional, material) {
    const kwE = extractKeywords(etica);
    const kwI = extractKeywords(institucional);
    const kwM = extractKeywords(material);

    const pairs = [
        auditLayerPair('etica_institucional', kwE, kwI),
        auditLayerPair('etica_material', kwE, kwM),
        auditLayerPair('institucional_material', kwI, kwM),
    ];

    const avgOverlap = pairs.reduce((sum, pair) => sum + pair.overlap, 0) / pairs.length;
    const markerScore = Math.max(...pairs.map(pair => pair.markerScore));
    const baseScore = 1 - Math.min(avgOverlap * 8, 1);
    const calculatedIntensity = markerScore > 0 ?
        (baseScore * 0.4 + markerScore * 0.6) :
        baseScore * 0.7;

    const dominantPair = pairs
        .slice()
        .sort((a, b) => b.pairIntensity - a.pairIntensity)[0] || null;

    return {
        avgOverlap: parseFloat(avgOverlap.toFixed(3)),
        baseScore: parseFloat(baseScore.toFixed(3)),
        markerScore: parseFloat(markerScore.toFixed(3)),
        calculatedIntensity: Math.min(Math.max(parseFloat(calculatedIntensity.toFixed(3)), 0.05), 1.0),
        dominantPair,
        pairs,
    };
}

/**
 * Calcula y explica el score de fricción entre un registro oficial y un caso.
 * @param {Object} registro
 * @param {Object} caso
 * @returns {Object}
 */
function explainRecordFriction(registro, caso) {
    if (!caso) {
        return {
            score: 0.5,
            overlap: 0,
            overlapScore: 0.5,
            markerScore: 0,
            tipoPenalty: 0,
            markers: [],
        };
    }

    const regKw = (registro.keywords || []).flatMap(s => normalizeStr(s).split(/\s+/)).filter(Boolean);
    const casoKw = [
        ...(caso.etica ?.keywords || []),
        ...(caso.institucional ?.keywords || []),
        ...(caso.material ?.keywords || []),
    ].flatMap(s => normalizeStr(s).split(/\s+/)).filter(Boolean);

    const overlap = keywordOverlap(regKw, casoKw);
    const overlapScore = 1 - Math.min(overlap * 6, 1);
    const { markers, maxPeso } = detectMarkers(regKw, casoKw);

    let tipoPenalty = 0;
    if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.tipo) {
        tipoPenalty = 0.3;
    } else if (registro.tipo_friccion && caso.friccion && registro.tipo_friccion === caso.friccion.subtipo) {
        tipoPenalty = 0.15;
    }

    const score = 0.5 * overlapScore + 0.3 * maxPeso + 0.2 * tipoPenalty;

    return {
        score: Math.min(Math.max(parseFloat(score.toFixed(3)), 0.05), 1.0),
        overlap: parseFloat(overlap.toFixed(3)),
        overlapScore: parseFloat(overlapScore.toFixed(3)),
        markerScore: parseFloat(maxPeso.toFixed(3)),
        tipoPenalty: parseFloat(tipoPenalty.toFixed(3)),
        markers: markers.map(marker => ({
            a: marker.a,
            b: marker.b,
            tipo: marker.tipo,
            peso: marker.peso,
            label: `${marker.a} ↔ ${marker.b}`,
        })),
    };
}

/**
 * Calcula la intensidad de fricción entre capas de un caso.
 * La fricción sube cuando las capas usan vocabularios distintos
 * para fenómenos que deberían ser equivalentes.
 *
 * @param {Object} etica
 * @param {Object} institucional
 * @param {Object} material
 * @returns {number} intensidad 0.0 → 1.0
 */
function calculateFrictionIntensity(etica, institucional, material) {
    return auditCaseFriction(etica, institucional, material).calculatedIntensity;
}

/**
 * Detecta el tipo dominante de fricción entre capas.
 *
 * @param {Object} caso - caso completo del JSON
 * @returns {{ tipo: string, subtipo: string|null, marcadores: string[] }}
 */
function detectFrictionType(caso) {
    const { etica, institucional, material } = caso;
    const kwE = extractKeywords(etica);
    const kwI = extractKeywords(institucional);
    const kwM = extractKeywords(material);

    const pairs = [
        { a: kwE, b: kwI },
        { a: kwE, b: kwM },
        { a: kwI, b: kwM },
    ];

    const allMarkers = [];
    for (const { a, b }
        of pairs) {
        const { markers } = detectMarkers(a, b);
        allMarkers.push(...markers);
    }

    // Tipo dominante por frecuencia y peso
    const counts = {
        [FRICTION_TYPES.POLITICA]: 0,
        [FRICTION_TYPES.SEMANTICA]: 0,
        [FRICTION_TYPES.TECNICA]: 0
    };
    const scores = {
        [FRICTION_TYPES.POLITICA]: 0,
        [FRICTION_TYPES.SEMANTICA]: 0,
        [FRICTION_TYPES.TECNICA]: 0
    };

    for (const m of allMarkers) {
        counts[m.tipo]++;
        scores[m.tipo] += m.peso;
    }

    // Si hay datos explícitos en el JSON, respetarlos; sino, calcular
    const tipoExplicito = caso.friccion ?.tipo;
    const subtipoExplicito = caso.friccion ?.subtipo || null;

    const tipoCalculado = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0] ?.[0] || FRICTION_TYPES.SEMANTICA;

    return {
        tipo: tipoExplicito || tipoCalculado,
        subtipo: subtipoExplicito,
        marcadores: allMarkers.map(m => `${m.a} ↔ ${m.b}`),
        confianza: allMarkers.length > 0 ? Math.min(allMarkers.length / 5, 1) : 0.3,
    };
}

/* ─── GRAFO: CONEXIONES ENTRE CASOS ─── */

/**
 * Detecta actores compartidos entre dos casos
 * @param {Object} casoA
 * @param {Object} casoB
 * @returns {string[]} actores en común
 */
function sharedActors(casoA, casoB) {
    const setA = new Set((casoA.actores || []).map(normalizeStr));
    return (casoB.actores || []).filter(a => setA.has(normalizeStr(a)));
}

/**
 * Detecta instituciones compartidas entre dos casos
 */
function sharedInstituciones(casoA, casoB) {
    const setA = new Set((casoA.instituciones || []).map(normalizeStr));
    return (casoB.instituciones || []).filter(i => setA.has(normalizeStr(i)));
}

/**
 * Detecta tags compartidos
 */
function sharedTags(casoA, casoB) {
    const setA = new Set((casoA.tags || []).map(normalizeStr));
    return (casoB.tags || []).filter(t => setA.has(normalizeStr(t)));
}

/**
 * Calcula el peso de conexión entre dos casos (0-1)
 * Peso alto = fuerte vínculo entre conflictos
 */
function connectionWeight(casoA, casoB) {
    const actors = sharedActors(casoA, casoB).length;
    const instit = sharedInstituciones(casoA, casoB).length;
    const tags = sharedTags(casoA, casoB).length;
    // Conexiones explícitas en el JSON
    const explicit = (casoA.conexiones || []).includes(casoB.id) ? 1 : 0;

    const raw = (actors * 0.3) + (instit * 0.25) + (tags * 0.15) + (explicit * 0.8);
    return Math.min(parseFloat(raw.toFixed(3)), 1.0);
}

/**
 * Construye el grafo de conexiones entre todos los casos.
 *
 * @param {Object[]} casos - array de casos del JSON
 * @returns {{ nodes: Object[], links: Object[] }}
 */
function buildGraph(casos) {
    const nodes = casos.map(caso => {
        const audit = auditCaseFriction(caso.etica, caso.institucional, caso.material);
        const explicitIntensity = caso.friccion ?.intensidad;
        const intensity = explicitIntensity ?? audit.calculatedIntensity;
        const { tipo, subtipo, marcadores } = detectFrictionType(caso);

        return {
            id: caso.id,
            titulo: caso.titulo,
            anio: caso.anio,
            intensidad: intensity,
            tipo: tipo,
            subtipo: subtipo,
            marcadores: marcadores,
            estado: caso.friccion ?.estado || 'abierta',
            tension: caso.friccion ?.tension_central || '',
            sinResolver: caso.friccion ?.sin_resolver ?? true,
            audit: {
                ...audit,
                source: explicitIntensity != null ? 'json' : 'engine',
                explicitIntensity: explicitIntensity ?? null,
                effectiveIntensity: intensity,
                deltaFromCalculated: explicitIntensity != null ?
                    parseFloat((explicitIntensity - audit.calculatedIntensity).toFixed(3)) : 0,
            },
            // Colores de capas para renderizado
            colorEtica: caso.etica ?.color || '#c8a96e',
            colorInstitucional: caso.institucional ?.color || '#4a7fa5',
            colorMaterial: caso.material ?.color || '#7a9e6e',
            // Datos completos para el panel de detalle
            etica: caso.etica,
            institucional: caso.institucional,
            material: caso.material,
            tags: caso.tags || [],
        };
    });

    const links = [];
    for (let i = 0; i < casos.length; i++) {
        for (let j = i + 1; j < casos.length; j++) {
            const weight = connectionWeight(casos[i], casos[j]);
            if (weight > 0.1) {
                links.push({
                    source: casos[i].id,
                    target: casos[j].id,
                    weight,
                    actores: sharedActors(casos[i], casos[j]),
                    instituciones: sharedInstituciones(casos[i], casos[j]),
                    tags: sharedTags(casos[i], casos[j]),
                });
            }
        }
    }

    return { nodes, links };
}

/* ─── FILTROS ─── */

/**
 * Filtra nodos por capa visible
 * @param {Object[]} nodes
 * @param {'etica'|'institucional'|'material'|'all'} capa
 * @returns {Object[]} nodos filtrados (con opacidad reducida en las demás capas)
 */
function filterByLayer(nodes, capa) {
    if (capa === 'all') return nodes.map(n => ({...n, _dimmed: false }));
    return nodes.map(n => {
        const hasCapa = !!n[capa];
        return {...n, _dimmed: !hasCapa };
    });
}

/**
 * Filtra por tipo de fricción
 */
function filterByFrictionType(nodes, tipo) {
    if (!tipo || tipo === 'all') return nodes.map(n => ({...n, _dimmed: false }));
    return nodes.map(n => ({...n, _dimmed: n.tipo !== tipo }));
}

/**
 * Filtra por umbral de intensidad mínima
 */
function filterByIntensity(nodes, minIntensidad) {
    return nodes.map(n => ({...n, _dimmed: n.intensidad < minIntensidad }));
}

/* ─── EXPORTS MODULARES (también funciona como IIFE para vanilla JS) ─── */
// Si el entorno no soporta ES modules, se exporta al global
if (typeof window !== 'undefined' && !window.frictionEngine) {
    window.frictionEngine = {
        calculateFrictionIntensity,
        auditCaseFriction,
        detectFrictionType,
        buildGraph,
        filterByLayer,
        filterByFrictionType,
        filterByIntensity,
        explainRecordFriction,
        normalizeStr,
        FRICTION_MARKERS,
        FRICTION_TYPES,
    };
}