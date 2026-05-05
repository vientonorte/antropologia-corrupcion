/**
 * frictionEngine.test.js — Tests for src/frictionEngine.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData) {

    var fe = window.frictionEngine;

    /* ─── normalizeStr ─── */

    describe('frictionEngine.normalizeStr', function () {
        it('converts to lowercase', function () {
            assertEqual(fe.normalizeStr('HOLA Mundo'), 'hola mundo');
        });

        it('removes accents/diacritics', function () {
            assertEqual(fe.normalizeStr('regulación'), 'regulacion');
            assertEqual(fe.normalizeStr('título'), 'titulo');
            assertEqual(fe.normalizeStr('ñandú'), 'nandu');
        });

        it('replaces punctuation with spaces', function () {
            var result = fe.normalizeStr('dato-clave: ¿algo?');
            assert(result.indexOf('-') === -1, 'should remove hyphens');
            assert(result.indexOf(':') === -1, 'should remove colons');
            assert(result.indexOf('¿') === -1, 'should remove inverted question marks');
        });

        it('handles empty string', function () {
            assertEqual(fe.normalizeStr(''), '');
        });

        it('handles numbers', function () {
            var result = fe.normalizeStr('DL3500 de 1980');
            assert(result.indexOf('3500') !== -1, 'should preserve digits');
        });

        it('normalizes special characters from Spanish', function () {
            var result = fe.normalizeStr('Resolución Nº 123');
            assert(result.indexOf('resolucion') !== -1, 'should normalize ó');
        });
    });

    /* ─── FRICTION_MARKERS ─── */

    describe('frictionEngine.FRICTION_MARKERS', function () {
        it('has at least 15 markers', function () {
            assertGreaterThan(fe.FRICTION_MARKERS.length, 14, 'should have 15+ markers');
        });

        it('each marker has required fields', function () {
            for (var i = 0; i < fe.FRICTION_MARKERS.length; i++) {
                var m = fe.FRICTION_MARKERS[i];
                assert(typeof m.a === 'string' && m.a.length > 0, 'marker[' + i + '].a must be non-empty string');
                assert(typeof m.b === 'string' && m.b.length > 0, 'marker[' + i + '].b must be non-empty string');
                assert(typeof m.tipo === 'string', 'marker[' + i + '].tipo must be string');
                assert(typeof m.peso === 'number', 'marker[' + i + '].peso must be number');
                assertGreaterThan(m.peso, 0.59, 'marker peso should be >= 0.60');
                assertLessThan(m.peso, 0.96, 'marker peso should be <= 0.95');
            }
        });

        it('marker tipos are valid FRICTION_TYPES', function () {
            var validTypes = Object.values(fe.FRICTION_TYPES);
            for (var i = 0; i < fe.FRICTION_MARKERS.length; i++) {
                assertArrayIncludes(validTypes, fe.FRICTION_MARKERS[i].tipo,
                    'marker[' + i + '].tipo should be a valid FRICTION_TYPE');
            }
        });

        it('contains financial-institutional markers', function () {
            var financialMarkers = fe.FRICTION_MARKERS.filter(function (m) {
                return m.a === 'trabajador' || m.a === 'custodia transnacional' ||
                    m.b === 'cartera de custodia' || m.b === 'patrimonio depurado';
            });
            assertGreaterThan(financialMarkers.length, 0, 'should have financial markers');
        });
    });

    /* ─── FRICTION_TYPES ─── */

    describe('frictionEngine.FRICTION_TYPES', function () {
        it('has politica, semantica, tecnica', function () {
            assertEqual(fe.FRICTION_TYPES.POLITICA, 'politica');
            assertEqual(fe.FRICTION_TYPES.SEMANTICA, 'semantica');
            assertEqual(fe.FRICTION_TYPES.TECNICA, 'tecnica');
        });

        it('is frozen (immutable)', function () {
            assert(Object.isFrozen(fe.FRICTION_TYPES), 'FRICTION_TYPES should be frozen');
        });
    });

    /* ─── calculateFrictionIntensity ─── */

    describe('frictionEngine.calculateFrictionIntensity', function () {
        it('returns a number between 0 and 1', function () {
            var result = fe.calculateFrictionIntensity(
                { keywords: ['consentimiento'] },
                { keywords: ['regulación'] },
                { keywords: ['territorio'] }
            );
            assert(typeof result === 'number', 'should return a number');
            assertGreaterThan(result, -0.01, 'should be >= 0');
            assertLessThan(result, 1.01, 'should be <= 1');
        });

        it('returns higher friction for very different keywords', function () {
            var high = fe.calculateFrictionIntensity(
                { keywords: ['consentimiento', 'testimonio', 'memoria'] },
                { keywords: ['proceso administrativo', 'resolución', 'clasificación'] },
                { keywords: ['catastro', 'dato', 'uso productivo'] }
            );
            var low = fe.calculateFrictionIntensity(
                { keywords: ['regulación', 'dato'] },
                { keywords: ['regulación', 'dato'] },
                { keywords: ['regulación', 'dato'] }
            );
            assertGreaterThan(high, low, 'different keywords should produce higher friction');
        });

        it('handles null/undefined layers', function () {
            var result = fe.calculateFrictionIntensity(null, null, null);
            assert(typeof result === 'number', 'should handle null input');
        });

        it('handles empty keyword arrays', function () {
            var result = fe.calculateFrictionIntensity(
                { keywords: [] },
                { keywords: [] },
                { keywords: [] }
            );
            assert(typeof result === 'number', 'should handle empty keywords');
        });

        it('calculates for real caso data', function () {
            var caso = casosData.casos[0]; // sura-gobernanza-datos
            var result = fe.calculateFrictionIntensity(
                caso.etica, caso.institucional, caso.material
            );
            assertGreaterThan(result, 0.04, 'real caso should have friction > 0.05');
            assertLessThan(result, 1.01, 'real caso should have friction <= 1.0');
        });
    });

    /* ─── auditCaseFriction ─── */

    describe('frictionEngine.auditCaseFriction', function () {
        it('returns all required fields', function () {
            var caso = casosData.casos[0];
            var result = fe.auditCaseFriction(caso.etica, caso.institucional, caso.material);
            assert('avgOverlap' in result, 'should have avgOverlap');
            assert('baseScore' in result, 'should have baseScore');
            assert('markerScore' in result, 'should have markerScore');
            assert('calculatedIntensity' in result, 'should have calculatedIntensity');
            assert('dominantPair' in result, 'should have dominantPair');
            assert('pairs' in result, 'should have pairs');
            assertEqual(result.pairs.length, 3, 'should have 3 pairs');
        });

        it('pairs have correct IDs', function () {
            var caso = casosData.casos[0];
            var result = fe.auditCaseFriction(caso.etica, caso.institucional, caso.material);
            var pairIds = result.pairs.map(function (p) { return p.id; });
            assertArrayIncludes(pairIds, 'etica_institucional');
            assertArrayIncludes(pairIds, 'etica_material');
            assertArrayIncludes(pairIds, 'institucional_material');
        });

        it('each pair has a label and numeric scores', function () {
            var caso = casosData.casos[0];
            var result = fe.auditCaseFriction(caso.etica, caso.institucional, caso.material);
            for (var i = 0; i < result.pairs.length; i++) {
                var pair = result.pairs[i];
                assert(typeof pair.label === 'string', 'pair.label should be string');
                assert(typeof pair.overlap === 'number', 'pair.overlap should be number');
                assert(typeof pair.pairIntensity === 'number', 'pair.pairIntensity should be number');
            }
        });

        it('calculatedIntensity is clamped between 0.05 and 1.0', function () {
            var result = fe.auditCaseFriction(
                { keywords: [] }, { keywords: [] }, { keywords: [] }
            );
            assertGreaterThan(result.calculatedIntensity, 0.04, 'should be >= 0.05');
            assertLessThan(result.calculatedIntensity, 1.01, 'should be <= 1.0');
        });

        it('dominantPair is the pair with highest pairIntensity', function () {
            var caso = casosData.casos[1]; // la-negra
            var result = fe.auditCaseFriction(caso.etica, caso.institucional, caso.material);
            var maxIntensity = Math.max.apply(null, result.pairs.map(function (p) { return p.pairIntensity; }));
            assertEqual(result.dominantPair.pairIntensity, maxIntensity,
                'dominantPair should be the highest intensity pair');
        });
    });

    /* ─── explainRecordFriction ─── */

    describe('frictionEngine.explainRecordFriction', function () {
        it('returns default score 0.5 when caso is null', function () {
            var result = fe.explainRecordFriction({ keywords: ['test'] }, null);
            assertEqual(result.score, 0.5, 'score should be 0.5 for null caso');
            assertEqual(result.overlap, 0);
            assertEqual(result.markerScore, 0);
        });

        it('returns all required fields', function () {
            var registro = { keywords: ['regulación', 'ESG'], tipo_friccion: 'tecnica' };
            var caso = casosData.casos[0];
            var result = fe.explainRecordFriction(registro, caso);
            assert('score' in result, 'should have score');
            assert('overlap' in result, 'should have overlap');
            assert('overlapScore' in result, 'should have overlapScore');
            assert('markerScore' in result, 'should have markerScore');
            assert('tipoPenalty' in result, 'should have tipoPenalty');
            assert('markers' in result, 'should have markers');
        });

        it('score is clamped between 0.05 and 1.0', function () {
            var registro = { keywords: ['xyz_unique_kw'] };
            var caso = casosData.casos[0];
            var result = fe.explainRecordFriction(registro, caso);
            assertGreaterThan(result.score, 0.04, 'score >= 0.05');
            assertLessThan(result.score, 1.01, 'score <= 1.0');
        });

        it('tipoPenalty is 0.3 when tipo matches', function () {
            var caso = casosData.casos.find(function (c) { return c.friccion && c.friccion.tipo; });
            if (!caso) return; // skip if no caso with friccion.tipo
            var registro = { keywords: ['test'], tipo_friccion: caso.friccion.tipo };
            var result = fe.explainRecordFriction(registro, caso);
            assertEqual(result.tipoPenalty, 0.3, 'tipoPenalty should be 0.3 for matching tipo');
        });

        it('tipoPenalty is 0.15 when subtipo matches', function () {
            var caso = casosData.casos.find(function (c) { return c.friccion && c.friccion.subtipo; });
            if (!caso) return;
            var registro = { keywords: ['test'], tipo_friccion: caso.friccion.subtipo };
            var result = fe.explainRecordFriction(registro, caso);
            assertEqual(result.tipoPenalty, 0.15, 'tipoPenalty should be 0.15 for matching subtipo');
        });

        it('markers contain label field', function () {
            // Use keywords that should trigger a marker
            var registro = { keywords: ['consentimiento', 'proceso administrativo'] };
            var caso = {
                etica: { keywords: ['consentimiento'] },
                institucional: { keywords: ['proceso administrativo'] },
                material: { keywords: [] }
            };
            var result = fe.explainRecordFriction(registro, caso);
            if (result.markers.length > 0) {
                assert(typeof result.markers[0].label === 'string', 'marker should have label');
            }
        });
    });

    /* ─── detectFrictionType ─── */

    describe('frictionEngine.detectFrictionType', function () {
        it('returns tipo, subtipo, marcadores, confianza', function () {
            var caso = casosData.casos[0];
            var result = fe.detectFrictionType(caso);
            assert('tipo' in result, 'should have tipo');
            assert('subtipo' in result, 'should have subtipo');
            assert(Array.isArray(result.marcadores), 'marcadores should be array');
            assert(typeof result.confianza === 'number', 'confianza should be number');
        });

        it('respects explicit tipo from JSON when present', function () {
            var caso = casosData.casos.find(function (c) { return c.friccion && c.friccion.tipo; });
            if (!caso) return;
            var result = fe.detectFrictionType(caso);
            assertEqual(result.tipo, caso.friccion.tipo, 'should use explicit tipo from JSON');
        });

        it('confianza is between 0 and 1', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var result = fe.detectFrictionType(casosData.casos[i]);
                assertGreaterThan(result.confianza, -0.01);
                assertLessThan(result.confianza, 1.01);
            }
        });

        it('marcadores are formatted as "a ↔ b"', function () {
            var caso = casosData.casos[0];
            var result = fe.detectFrictionType(caso);
            for (var i = 0; i < result.marcadores.length; i++) {
                assert(result.marcadores[i].indexOf('↔') !== -1,
                    'marcador should contain ↔ separator');
            }
        });
    });

    /* ─── buildGraph ─── */

    describe('frictionEngine.buildGraph', function () {
        it('returns nodes and links arrays', function () {
            var result = fe.buildGraph(casosData.casos);
            assert(Array.isArray(result.nodes), 'should have nodes array');
            assert(Array.isArray(result.links), 'should have links array');
        });

        it('creates one node per caso', function () {
            var result = fe.buildGraph(casosData.casos);
            assertEqual(result.nodes.length, casosData.casos.length,
                'node count should equal caso count');
        });

        it('each node has required fields', function () {
            var result = fe.buildGraph(casosData.casos);
            for (var i = 0; i < result.nodes.length; i++) {
                var n = result.nodes[i];
                assert(typeof n.id === 'string', 'node.id should be string');
                assert(typeof n.titulo === 'string', 'node.titulo should be string');
                assert(typeof n.intensidad === 'number', 'node.intensidad should be number');
                assert(typeof n.tipo === 'string', 'node.tipo should be string');
                assert('audit' in n, 'node should have audit data');
                assert(Array.isArray(n.tags), 'node.tags should be array');
            }
        });

        it('links only exist between related cases (weight > 0.1)', function () {
            var result = fe.buildGraph(casosData.casos);
            for (var i = 0; i < result.links.length; i++) {
                var link = result.links[i];
                assertGreaterThan(link.weight, 0.1, 'link weight should exceed 0.1');
                assert(typeof link.source === 'string', 'link.source should be string');
                assert(typeof link.target === 'string', 'link.target should be string');
            }
        });

        it('node audit tracks source (json vs engine)', function () {
            var result = fe.buildGraph(casosData.casos);
            for (var i = 0; i < result.nodes.length; i++) {
                var audit = result.nodes[i].audit;
                assert(audit.source === 'json' || audit.source === 'engine',
                    'audit.source should be json or engine');
            }
        });

        it('handles empty casos array', function () {
            var result = fe.buildGraph([]);
            assertEqual(result.nodes.length, 0);
            assertEqual(result.links.length, 0);
        });
    });

    /* ─── filterByLayer ─── */

    describe('frictionEngine.filterByLayer', function () {
        var nodes;

        // Build nodes for the tests
        nodes = fe.buildGraph(casosData.casos).nodes;

        it('returns all nodes undimmed when capa is "all"', function () {
            var result = fe.filterByLayer(nodes, 'all');
            assertEqual(result.length, nodes.length);
            for (var i = 0; i < result.length; i++) {
                assertEqual(result[i]._dimmed, false, 'all nodes should not be dimmed');
            }
        });

        it('dims nodes without the specified layer', function () {
            var result = fe.filterByLayer(nodes, 'etica');
            for (var i = 0; i < result.length; i++) {
                if (result[i].etica) {
                    assertEqual(result[i]._dimmed, false, 'nodes with etica should not be dimmed');
                } else {
                    assertEqual(result[i]._dimmed, true, 'nodes without etica should be dimmed');
                }
            }
        });

        it('returns same number of nodes regardless of filter', function () {
            assertEqual(fe.filterByLayer(nodes, 'etica').length, nodes.length);
            assertEqual(fe.filterByLayer(nodes, 'institucional').length, nodes.length);
            assertEqual(fe.filterByLayer(nodes, 'material').length, nodes.length);
        });
    });

    /* ─── filterByFrictionType ─── */

    describe('frictionEngine.filterByFrictionType', function () {
        var nodes = fe.buildGraph(casosData.casos).nodes;

        it('returns all nodes undimmed when tipo is "all"', function () {
            var result = fe.filterByFrictionType(nodes, 'all');
            for (var i = 0; i < result.length; i++) {
                assertEqual(result[i]._dimmed, false);
            }
        });

        it('returns all nodes undimmed when tipo is falsy', function () {
            var result = fe.filterByFrictionType(nodes, '');
            for (var i = 0; i < result.length; i++) {
                assertEqual(result[i]._dimmed, false);
            }
        });

        it('dims nodes that dont match the friction type', function () {
            var result = fe.filterByFrictionType(nodes, 'semantica');
            for (var i = 0; i < result.length; i++) {
                if (result[i].tipo === 'semantica') {
                    assertEqual(result[i]._dimmed, false);
                } else {
                    assertEqual(result[i]._dimmed, true);
                }
            }
        });
    });

    /* ─── filterByIntensity ─── */

    describe('frictionEngine.filterByIntensity', function () {
        var nodes = fe.buildGraph(casosData.casos).nodes;

        it('dims nodes below the threshold', function () {
            var result = fe.filterByIntensity(nodes, 0.5);
            for (var i = 0; i < result.length; i++) {
                if (result[i].intensidad >= 0.5) {
                    assertEqual(result[i]._dimmed, false);
                } else {
                    assertEqual(result[i]._dimmed, true);
                }
            }
        });

        it('with threshold 0, nothing is dimmed', function () {
            var result = fe.filterByIntensity(nodes, 0);
            for (var i = 0; i < result.length; i++) {
                assertEqual(result[i]._dimmed, false);
            }
        });

        it('with threshold 1.1, everything is dimmed', function () {
            var result = fe.filterByIntensity(nodes, 1.1);
            for (var i = 0; i < result.length; i++) {
                assertEqual(result[i]._dimmed, true);
            }
        });
    });

    /* ─── calculateZuboffIndex ─── */

    describe('frictionEngine.calculateZuboffIndex', function () {
        var caso = casosData.casos[0];

        it('returns all required fields', function () {
            var result = fe.calculateZuboffIndex(caso);
            assert(typeof result.score === 'number', 'score missing');
            assert(typeof result.nivel === 'string', 'nivel missing');
            assert(typeof result.interpretacion === 'string', 'interpretacion missing');
            assert(Array.isArray(result.dimensiones), 'dimensiones should be an array');
        });

        it('score is between 0 and 1', function () {
            var result = fe.calculateZuboffIndex(caso);
            assert(result.score >= 0 && result.score <= 1, 'score out of [0,1]');
        });

        it('nivel is one of the valid levels', function () {
            var valid = ['bajo', 'medio', 'alto', 'crítico'];
            var result = fe.calculateZuboffIndex(caso);
            assertArrayIncludes(valid, result.nivel);
        });

        it('interpretacion is non-empty', function () {
            var result = fe.calculateZuboffIndex(caso);
            assert(result.interpretacion.length > 0, 'interpretacion should not be empty');
        });

        it('each dimensión has id, label, cita, score, activo', function () {
            var result = fe.calculateZuboffIndex(caso);
            result.dimensiones.forEach(function (dim) {
                assert(typeof dim.id === 'string', 'dimension id missing');
                assert(typeof dim.label === 'string', 'dimension label missing');
                assert(typeof dim.cita === 'string', 'dimension cita missing');
                assert(typeof dim.score === 'number', 'dimension score missing');
                assert(typeof dim.activo === 'boolean', 'dimension activo missing');
            });
        });

        it('dimension count matches ZUBOFF_DIMENSIONS', function () {
            var result = fe.calculateZuboffIndex(caso);
            var dimCount = Object.keys(fe.ZUBOFF_DIMENSIONS).length;
            assertEqual(result.dimensiones.length, dimCount);
        });

        it('each dimension score is non-negative', function () {
            var result = fe.calculateZuboffIndex(caso);
            result.dimensiones.forEach(function (dim) {
                assert(dim.score >= 0, 'dimension score must be >= 0');
            });
        });

        it('nivel is "bajo" for a caso with no matching keywords', function () {
            var emptyCaso = {
                id: 'test-empty',
                titulo: 'Caso sin keywords',
                etica: {},
                institucional: {},
                material: {},
                tags: [],
                actores: [],
                instituciones: [],
            };
            var result = fe.calculateZuboffIndex(emptyCaso);
            assertEqual(result.nivel, 'bajo');
            assertApprox(result.score, 0, 0.001);
        });

        it('returns valid results for all casos in the dataset', function () {
            casosData.casos.forEach(function (c) {
                var result = fe.calculateZuboffIndex(c);
                assert(!isNaN(result.score), 'score is NaN for ' + c.id);
                assert(['bajo', 'medio', 'alto', 'crítico'].indexOf(result.nivel) !== -1, 'invalid nivel for ' + c.id);
            });
        });

        it('score increases when relevant surveillance keywords are present', function () {
            var baseCaso = {
                id: 'zuboff-test',
                etica: { descripcion: 'sin keywords relevantes' },
                institucional: {},
                material: {},
            };
            var richCaso = {
                id: 'zuboff-rich',
                etica: { descripcion: 'extraccion cotizacion afp zona de sacrificio borramiento' },
                institucional: { descripcion: 'prevision cartera inversiones cmf multifondos' },
                material: { descripcion: 'pino deforestacion forestales bosque nativo' },
            };
            var scoreBase = fe.calculateZuboffIndex(baseCaso).score;
            var scoreRich = fe.calculateZuboffIndex(richCaso).score;
            assert(scoreRich > scoreBase, 'richer surveillance keywords should produce strictly higher score');
        });
    });
};
