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
    // Financiero-institucionales: FECU / SURA / capital transnacional
    { a: 'consentimiento', b: 'liquidez como semáforo', tipo: FRICTION_TYPES.TECNICA, peso: 0.87 },
    { a: 'rescates fondos mutuos', b: 'cumplimiento normativo', tipo: FRICTION_TYPES.TECNICA, peso: 0.84 },
    { a: 'custodia transnacional', b: 'regulación', tipo: FRICTION_TYPES.POLITICA, peso: 0.86 },
    { a: 'opacidad', b: 'patrimonio depurado', tipo: FRICTION_TYPES.TECNICA, peso: 0.80 },
    { a: 'trabajador', b: 'cartera de custodia', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.91 },
    // Epistemológico: la Terraza registra evidencia que el grafo público no puede mostrar
    { a: 'hash_evidencia', b: 'acceso_publico', tipo: FRICTION_TYPES.SEMANTICA, peso: 0.93 },
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
        ...(caso.etica?.keywords || []),
        ...(caso.institucional?.keywords || []),
        ...(caso.material?.keywords || []),
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
    const tipoExplicito = caso.friccion?.tipo;
    const subtipoExplicito = caso.friccion?.subtipo || null;

    const tipoCalculado = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || FRICTION_TYPES.SEMANTICA;

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
        const explicitIntensity = caso.friccion?.intensidad;
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
            estado: caso.friccion?.estado || 'abierta',
            tension: caso.friccion?.tension_central || '',
            sinResolver: caso.friccion?.sin_resolver ?? true,
            audit: {
                ...audit,
                source: explicitIntensity != null ? 'json' : 'engine',
                explicitIntensity: explicitIntensity ?? null,
                effectiveIntensity: intensity,
                deltaFromCalculated: explicitIntensity != null ?
                    parseFloat((explicitIntensity - audit.calculatedIntensity).toFixed(3)) : 0,
            },
            // Colores de capas para renderizado
            colorEtica: caso.etica?.color || '#c8a96e',
            colorInstitucional: caso.institucional?.color || '#4a7fa5',
            colorMaterial: caso.material?.color || '#7a9e6e',
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

/* ─── ÍNDICE DE ZUBOFF ─── */
// Basado en Zuboff, S. (2019). The Age of Surveillance Capitalism.
// PublicAffairs, Nueva York.
//
// Mide en qué medida un caso exhibe la lógica del capitalismo de vigilancia:
// extracción unilateral de experiencia humana como materia prima conductual,
// producción de instrumentos de predicción/modificación del comportamiento, y
// la desigualdad epistémica resultante.
//
// Cinco dimensiones (0.0–1.0 cada una):
//   1. extraccion_unilateral   — datos tomados sin consentimiento (Zuboff p.8)
//   2. excedente_conductual    — experiencia → materia prima financiera (p.96)
//   3. productos_prediccion    — instrumentos que modelan conducta futura (p.97)
//   4. desigualdad_epistemica  — institución sabe; trabajador/comunidad no sabe (p.176)
//   5. modificacion_conducta   — mecanismos que redirigen comportamiento (p.202)

// Umbral de score mínimo para marcar una dimensión como activa.
// Una dimensión está activa si al menos 1 keyword coincide Y su score supera este valor.
var ZUBOFF_MIN_ACTIVE_SCORE = 0.05;

// Umbrales de severidad del índice agregado
var ZUBOFF_CRITICAL_THRESHOLD = 0.6;
var ZUBOFF_HIGH_THRESHOLD = 0.4;
var ZUBOFF_MEDIUM_THRESHOLD = 0.2;

const ZUBOFF_DIMENSIONS = Object.freeze({
    extraccion_unilateral: {
        label: 'Extracción unilateral',
        cita: 'Surveillance capitalism unilaterally claims human experience as free raw material. (p.8)',
        peso: 1.0,
        keywords: [
            // Vocabulario AFP/financiero
            'cotizacion', 'afiliacion', 'afiliados', 'extractivismo', 'capital financiero',
            'zona de sacrificio', 'multifondo',
            // Vocabulario territorial/etnográfico
            'catastro', 'dl701', 'titulos de merced', 'borramiento', 'extraccion',
            // Vocabulario periodismo/datos
            'filtracion', 'datos anonimizados', 'fuente confidencial',
        ],
    },
    excedente_conductual: {
        label: 'Excedente conductual',
        cita: 'Behavioral surplus is the raw material... translated into prediction products. (p.96)',
        peso: 0.9,
        keywords: [
            // La vida del trabajador → materia prima financiera
            'afp', 'prevision', 'ahorro obligatorio', 'cartera', 'custodia',
            'inversiones', 'fondo de pensiones',
            // El territorio como materia prima extractiva
            'pino', 'deforestacion', 'napa freatica', 'bosque nativo', 'forestales',
        ],
    },
    productos_prediccion: {
        label: 'Productos de predicción',
        cita: 'These prediction products are sold in behavioral futures markets. (p.97)',
        peso: 0.85,
        keywords: [
            // Instrumentos financieros que predicen/modelan conducta
            'esg', 'fecu', 'cmf', 'regulacion de inversiones',
            'multifondos', 'riesgo sistemico',
            // Instrumentos legales que clasifican/predicen conducta
            'ley antiterrorista', 'testigos reservados', 'dl701',
            // Periodismo de datos como contra-producto de predicción
            'periodismo de datos', 'verificacion de datos',
        ],
    },
    desigualdad_epistemica: {
        label: 'Desigualdad epistémica',
        cita: 'Epistemic inequality: unequal access to learning imposed by asymmetric knowledge and power. (p.176)',
        peso: 1.0,
        keywords: [
            // Vocabulario en el corpus
            'opacidad', 'mistranslation', 'borramiento', 'distorsion',
            'conadi', 'ilegible',
            // Asimetría epistémica territorio/estado
            'saber situado', 'conocimiento situado', 'lonko', 'testimonio',
            // Asimetría AFP/trabajador
            'trabajadores afiliados', 'autonomia', 'transparencia',
        ],
    },
    modificacion_conducta: {
        label: 'Modificación de conducta',
        cita: 'The goal is to modify behavior at scale for third parties\' interests. (p.202)',
        peso: 0.8,
        keywords: [
            // Dispositivos de neutralización en el corpus
            'consulta previa', 'proceso administrativo', 'admisibilidad',
            'oit 169', 'oit169', 'regulacion', 'resolucion',
            // Militarización como modificación conductual territorial
            'militarizacion', 'ley antiterrorista', 'fuerzas especiales',
            // Lobby como modificación de decisiones
            'lobby', 'infolobby', 'influencia regulatoria',
        ],
    },
});

/**
 * Calcula el Índice de Zuboff para un caso.
 * Retorna un score 0.0–1.0 y el desglose por dimensión.
 *
 * Estrategia: busca keywords COMPUESTOS (frases) en el corpus del caso.
 * Un hit solo cuenta si la frase normalizada aparece como substring en
 * el texto del caso. Evita inflación por palabras genéricas sueltas.
 *
 * @param {Object} caso - caso completo del JSON
 * @returns {{ score: number, dimensiones: Object[], nivel: string, interpretacion: string }}
 */
function calculateZuboffIndex(caso) {
    // Texto completo del caso como string normalizado para búsqueda de frases
    var casoText = [
        caso.etica ? (caso.etica.titulo || '') + ' ' + (caso.etica.descripcion || '') + ' ' + (caso.etica.keywords || []).join(' ') : '',
        caso.institucional ? (caso.institucional.titulo || '') + ' ' + (caso.institucional.descripcion || '') + ' ' + (caso.institucional.clasificaciones || []).join(' ') + ' ' + (caso.institucional.keywords || []).join(' ') : '',
        caso.material ? (caso.material.titulo || '') + ' ' + (caso.material.descripcion || '') + ' ' + (caso.material.keywords || []).join(' ') : '',
        (caso.tags || []).join(' '),
        (caso.actores || []).join(' '),
        (caso.instituciones || []).join(' '),
        caso.friccion ? ((caso.friccion.descripcion || '') + ' ' + (caso.friccion.tension_central || '')) : '',
    ].join(' ');
    var normCasoText = normalizeStr(casoText);

    var totalPeso = 0;
    var activePeso = 0;
    var dimensiones = [];

    var dimIds = Object.keys(ZUBOFF_DIMENSIONS);
    for (var di = 0; di < dimIds.length; di++) {
        var dimId = dimIds[di];
        var dim = ZUBOFF_DIMENSIONS[dimId];
        var hits = 0;
        // Buscar cada keyword como frase completa (no dividida en palabras)
        for (var ki = 0; ki < dim.keywords.length; ki++) {
            var normKw = normalizeStr(dim.keywords[ki]);
            if (normCasoText.indexOf(normKw) !== -1) hits++;
        }
        // Score = (hits / keywords.length) * peso del dimension
        var hitRatio = hits / dim.keywords.length;
        var dimScore = parseFloat((hitRatio * dim.peso).toFixed(3));

        totalPeso += dim.peso;
        activePeso += dimScore;

        dimensiones.push({
            id: dimId,
            label: dim.label,
            cita: dim.cita,
            score: dimScore,
            activo: hits >= 1 && dimScore >= ZUBOFF_MIN_ACTIVE_SCORE,
        });
    }

    var score = parseFloat((activePeso / totalPeso).toFixed(3));
    var nivel = score >= ZUBOFF_CRITICAL_THRESHOLD ? 'crítico' :
        score >= ZUBOFF_HIGH_THRESHOLD ? 'alto' :
        score >= ZUBOFF_MEDIUM_THRESHOLD ? 'medio' : 'bajo';

    var interpretacionMap = {
        'crítico': 'El caso documenta la lógica completa del capitalismo de vigilancia aplicada a este dominio.',
        'alto': 'Múltiples dimensiones de extracción/predicción activas. Asimetría epistémica pronunciada.',
        'medio': 'Presencia parcial de mecanismos de vigilancia; fricción documenta la opacidad resultante.',
        'bajo': 'Dimensiones de vigilancia limitadas o indirectas en el corpus disponible.',
    };
    var interpretacion = interpretacionMap[nivel] || '';

    return { score: score, nivel: nivel, interpretacion: interpretacion, dimensiones: dimensiones };
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
        ZUBOFF_DIMENSIONS,
        calculateZuboffIndex,
    };
}