/**
 * casoPublico.js — Capa pública anonimizada (C03 §5)
 * Superficies públicas: home, grafo, buscador, huella. Privado conserva datos íntegros.
 */
(function () {
    'use strict';

    var TOKEN_REPLACEMENTS = [
        [/SURA\s+Investments/gi, 'conglomerado regional de inversiones'],
        [/SURA\s+Asset\s+Management/gi, 'conglomerado regional de inversiones'],
        [/AFP\s+UNO/gi, 'administradora de fondos de pensiones'],
        [/\bSURA\b/gi, 'conglomerado regional'],
        [/Comisión para el Mercado Financiero/gi, 'regulador del mercado financiero'],
        [/\bCMF\b/g, 'regulador financiero'],
        [/JP\s*Morgan/gi, 'custodio financiero transnacional'],
        [/FECU/gi, 'informe financiero regulado'],
    ];

    var CASO_OVERRIDES = {
        'sura-gobernanza-datos': {
            titulo: 'Gobernanza de datos previsionales y custodia transnacional',
            actores: [
                'Conglomerado regional de inversiones',
                'Administradora de fondos de pensiones',
                'Regulador financiero',
                'Trabajadores afiliados',
                'Comunidades indígenas',
            ],
            instituciones: [
                'Administradora de fondos de pensiones',
                'Regulador del mercado financiero',
            ],
        },
        'banca-roles-opacidad-digital': {
            titulo: 'Banca digital — roles, permisos y opacidad institucional',
            actores: ['Institución bancaria', 'Usuarios del sistema', 'Regulador financiero'],
        },
    };

    var ENTITY_OVERRIDES = {
        'ent-sura-investments': {
            nombre: 'Conglomerado regional de inversiones',
            aliases: [
                'Gestora de activos regional',
                'Administradora de fondos de pensiones',
            ],
        },
    };

    var RECORD_STRING_KEYS = [
        'titulo',
        'capa_oficial',
        'institucion',
        'descripcion',
        'resumen',
        'snippet',
        'pregunta',
        'etiqueta',
        'consulta',
        'razon_social',
        'nombre',
    ];

    var RECORD_LIST_KEYS = ['actores_lobby', 'keywords', 'tags', 'actores', 'aliases', 'pasos_llm'];

    function isPrivadoSurface() {
        return /privado(?:-login)?\.html/i.test(window.location.pathname || '');
    }

    function shouldAnonymize() {
        return !isPrivadoSurface();
    }

    function sanitizeText(value) {
        if (value == null || value === '') return value;
        var out = String(value);
        for (var i = 0; i < TOKEN_REPLACEMENTS.length; i++) {
            out = out.replace(TOKEN_REPLACEMENTS[i][0], TOKEN_REPLACEMENTS[i][1]);
        }
        return out;
    }

    function sanitizeStringList(list) {
        if (!Array.isArray(list)) return list;
        return list.map(sanitizeText);
    }

    function cloneLayer(layer) {
        if (!layer || typeof layer !== 'object') return layer;
        var copy = {};
        Object.keys(layer).forEach(function (key) {
            var val = layer[key];
            if (typeof val === 'string') copy[key] = sanitizeText(val);
            else if (Array.isArray(val)) copy[key] = sanitizeStringList(val);
            else copy[key] = val;
        });
        return copy;
    }

    function getPublicLabel(caso) {
        if (!caso) return { titulo: '', actores: [] };
        if (!shouldAnonymize()) {
            return {
                titulo: caso.titulo || caso.id || '',
                actores: caso.actores || [],
            };
        }
        var override = CASO_OVERRIDES[caso.id] || {};
        return {
            titulo: override.titulo || sanitizeText(caso.titulo || caso.id || ''),
            actores: override.actores || sanitizeStringList(caso.actores || []),
        };
    }

    function prepareCaso(caso) {
        if (!caso || !shouldAnonymize()) return caso;
        var override = CASO_OVERRIDES[caso.id] || {};
        var prepared = Object.assign({}, caso);
        prepared.titulo = override.titulo || sanitizeText(caso.titulo);
        prepared.actores = override.actores || sanitizeStringList(caso.actores);
        if (caso.instituciones) {
            prepared.instituciones = override.instituciones || sanitizeStringList(caso.instituciones);
        }
        if (caso.etica) prepared.etica = cloneLayer(caso.etica);
        if (caso.institucional) prepared.institucional = cloneLayer(caso.institucional);
        if (caso.material) prepared.material = cloneLayer(caso.material);
        if (caso.friccion && caso.friccion.descripcion) {
            prepared.friccion = Object.assign({}, caso.friccion, {
                descripcion: sanitizeText(caso.friccion.descripcion),
                tension_central: sanitizeText(caso.friccion.tension_central),
            });
        }
        if (Array.isArray(caso.tags)) prepared.tags = sanitizeStringList(caso.tags);
        return prepared;
    }

    function prepareCasos(casos) {
        if (!Array.isArray(casos) || !shouldAnonymize()) return casos;
        return casos.map(prepareCaso);
    }

    function sanitizeRecord(record) {
        if (!record || !shouldAnonymize()) return record;
        var out = Object.assign({}, record);
        RECORD_STRING_KEYS.forEach(function (key) {
            if (out[key]) out[key] = sanitizeText(out[key]);
        });
        RECORD_LIST_KEYS.forEach(function (key) {
            if (out[key]) out[key] = sanitizeStringList(out[key]);
        });
        return out;
    }

    function sanitizeRecords(records) {
        if (!Array.isArray(records) || !shouldAnonymize()) return records;
        return records.map(sanitizeRecord);
    }

    function prepareEntidad(ent) {
        if (!ent || !shouldAnonymize()) return ent;
        var override = ENTITY_OVERRIDES[ent.id] || {};
        var prepared = Object.assign({}, ent);
        prepared.nombre = override.nombre || sanitizeText(ent.nombre);
        prepared.aliases = override.aliases || sanitizeStringList(ent.aliases || []);
        if (ent.atributos_huella) {
            prepared.atributos_huella = sanitizeStringList(ent.atributos_huella);
        }
        return prepared;
    }

    function prepareHuella(huella) {
        if (!huella || !shouldAnonymize()) return huella;
        var copy = Object.assign({}, huella);
        if (Array.isArray(huella.entidades)) {
            copy.entidades = huella.entidades.map(prepareEntidad);
        }
        if (Array.isArray(huella.trazas)) {
            copy.trazas = huella.trazas.map(function (traza) {
                var prepared = Object.assign({}, traza);
                if (prepared.descripcion) prepared.descripcion = sanitizeText(prepared.descripcion);
                if (prepared.etiqueta) prepared.etiqueta = sanitizeText(prepared.etiqueta);
                if (prepared.consulta) prepared.consulta = sanitizeText(prepared.consulta);
                if (prepared.pasos_llm) prepared.pasos_llm = sanitizeStringList(prepared.pasos_llm);
                return prepared;
            });
        }
        if (Array.isArray(huella.consultas_semilla)) {
            copy.consultas_semilla = huella.consultas_semilla.map(function (item) {
                if (!item || typeof item !== 'object') return sanitizeText(item);
                var prepared = Object.assign({}, item);
                if (prepared.pregunta) prepared.pregunta = sanitizeText(prepared.pregunta);
                return prepared;
            });
        }
        return copy;
    }

    function normalizeCasosList(casosInput) {
        if (Array.isArray(casosInput)) return casosInput;
        if (casosInput && Array.isArray(casosInput.casos)) return casosInput.casos;
        return [];
    }

    function prepareCorpusBundle(bundle) {
        if (!bundle || !shouldAnonymize()) return bundle;
        var casosRaw = normalizeCasosList(bundle.casos || (bundle.casosData && bundle.casosData.casos));
        var casosPrepared = prepareCasos(casosRaw);
        var fuentes = sanitizeRecords(bundle.fuentes || []);
        var bcnRecords = sanitizeRecords(bundle.bcnRecords || []);
        var allRecords = sanitizeRecords(
            bundle.allRecords || fuentes.concat(bcnRecords),
        );
        var casosData = bundle.casosData
            ? Object.assign({}, bundle.casosData, { casos: casosPrepared })
            : { casos: casosPrepared };

        return Object.assign({}, bundle, {
            huella: prepareHuella(bundle.huella || { entidades: [], trazas: [] }),
            fuentes: fuentes,
            bcnRecords: bcnRecords,
            casos: casosPrepared,
            casosData: casosData,
            allRecords: allRecords,
        });
    }

    function patchPublicGlobals() {
        if (!shouldAnonymize()) return;
        if (window.FUENTE_LABELS && window.FUENTE_LABELS.cmf) {
            window.FUENTE_LABELS.cmf = 'Regulador financiero';
        }
        if (window.CASourceCatalog && window.CASourceCatalog.labels) {
            window.CASourceCatalog.labels.cmf = 'Regulador financiero';
        }
    }

    patchPublicGlobals();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchPublicGlobals);
    } else {
        setTimeout(patchPublicGlobals, 0);
    }

    window.CACasoPublico = {
        shouldAnonymize: shouldAnonymize,
        isPrivadoSurface: isPrivadoSurface,
        getPublicLabel: getPublicLabel,
        prepareCaso: prepareCaso,
        prepareCasos: prepareCasos,
        sanitizeText: sanitizeText,
        sanitizeRecord: sanitizeRecord,
        sanitizeRecords: sanitizeRecords,
        prepareHuella: prepareHuella,
        prepareCorpusBundle: prepareCorpusBundle,
        patchPublicGlobals: patchPublicGlobals,
        CASO_OVERRIDES: CASO_OVERRIDES,
        ENTITY_OVERRIDES: ENTITY_OVERRIDES,
    };
})();