/**
 * casoPublico.js — Capa pública anonimizada (C03 §5)
 * Superficies públicas: home, grafo, buscador. Privado conserva casos.json íntegro.
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

    window.CACasoPublico = {
        shouldAnonymize: shouldAnonymize,
        isPrivadoSurface: isPrivadoSurface,
        getPublicLabel: getPublicLabel,
        prepareCaso: prepareCaso,
        prepareCasos: prepareCasos,
        sanitizeText: sanitizeText,
        CASO_OVERRIDES: CASO_OVERRIDES,
    };
})();