/**
 * dataValidation.test.js — Schema & integrity tests for JSON data files
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertArrayIncludes, casosData, fuentesData, bcnData, fuentesConfig) {

    /* ─── casos.json schema ─── */

    describe('data/casos.json — schema', function () {
        it('has _meta with capas definition', function () {
            assert(casosData._meta, 'should have _meta');
            assert(casosData._meta.capas, 'should have _meta.capas');
            assert(casosData._meta.capas.etica, 'should define etica capa');
            assert(casosData._meta.capas.institucional, 'should define institucional capa');
            assert(casosData._meta.capas.material, 'should define material capa');
        });

        it('has casos array', function () {
            assert(Array.isArray(casosData.casos), 'casos should be array');
        });

        it('has exactly 6 cases', function () {
            assertEqual(casosData.casos.length, 6, 'should have 6 casos');
        });

        it('each caso has required top-level fields', function () {
            var requiredFields = ['id', 'titulo', 'anio', 'etica', 'institucional', 'material'];
            for (var i = 0; i < casosData.casos.length; i++) {
                var caso = casosData.casos[i];
                for (var j = 0; j < requiredFields.length; j++) {
                    assert(caso[requiredFields[j]] !== undefined,
                        'caso[' + i + '] missing field: ' + requiredFields[j]);
                }
            }
        });

        it('caso IDs are unique', function () {
            var ids = {};
            for (var i = 0; i < casosData.casos.length; i++) {
                var id = casosData.casos[i].id;
                assert(!ids[id], 'duplicate caso id: ' + id);
                ids[id] = true;
            }
        });

        it('each caso has expected IDs', function () {
            var expectedIds = [
                'sura-gobernanza-datos',
                'la-negra-territorio-mapuche',
                'periodismo-datos-chile',
                'oit169-consulta-previa'
            ];
            var ids = casosData.casos.map(function (c) { return c.id; });
            for (var i = 0; i < expectedIds.length; i++) {
                assertArrayIncludes(ids, expectedIds[i],
                    'should include caso: ' + expectedIds[i]);
            }
        });
    });

    describe('data/casos.json — layer structure', function () {
        it('each etica layer has keywords array', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var etica = casosData.casos[i].etica;
                assert(etica, 'caso[' + i + '] should have etica');
                assert(Array.isArray(etica.keywords), 'etica.keywords should be array in caso[' + i + ']');
                assertGreaterThan(etica.keywords.length, 0, 'etica should have at least 1 keyword');
            }
        });

        it('each institucional layer has keywords array', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var inst = casosData.casos[i].institucional;
                assert(inst, 'caso[' + i + '] should have institucional');
                assert(Array.isArray(inst.keywords), 'institucional.keywords should be array');
                assertGreaterThan(inst.keywords.length, 0, 'institucional should have at least 1 keyword');
            }
        });

        it('each material layer has keywords array', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var mat = casosData.casos[i].material;
                assert(mat, 'caso[' + i + '] should have material');
                assert(Array.isArray(mat.keywords), 'material.keywords should be array');
                assertGreaterThan(mat.keywords.length, 0, 'material should have at least 1 keyword');
            }
        });

        it('layers have correct color tokens', function () {
            var expectedColors = {
                etica: '#c8a96e',
                institucional: '#4a7fa5',
                material: '#7a9e6e'
            };
            for (var i = 0; i < casosData.casos.length; i++) {
                var caso = casosData.casos[i];
                if (caso.etica.color) assertEqual(caso.etica.color, expectedColors.etica);
                if (caso.institucional.color) assertEqual(caso.institucional.color, expectedColors.institucional);
                if (caso.material.color) assertEqual(caso.material.color, expectedColors.material);
            }
        });
    });

    describe('data/casos.json — friction metadata', function () {
        it('each caso with friccion has required friction fields', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var caso = casosData.casos[i];
                if (caso.friccion) {
                    assert(typeof caso.friccion.tipo === 'string', 'friccion.tipo should be string');
                    assert(typeof caso.friccion.intensidad === 'number', 'friccion.intensidad should be number');
                    assertGreaterThan(caso.friccion.intensidad, -0.01, 'intensity >= 0');
                }
            }
        });

        it('friction intensidad is between 0 and 1', function () {
            for (var i = 0; i < casosData.casos.length; i++) {
                var caso = casosData.casos[i];
                if (caso.friccion && typeof caso.friccion.intensidad === 'number') {
                    assertGreaterThan(caso.friccion.intensidad, -0.01, 'intensity >= 0');
                    assert(caso.friccion.intensidad <= 1.0, 'intensity should be <= 1.0 for caso ' + caso.id);
                }
            }
        });
    });

    /* ─── fuentes-oficiales.json schema ─── */

    describe('data/fuentes-oficiales.json — schema', function () {
        it('is a non-empty array', function () {
            assert(Array.isArray(fuentesData), 'should be array');
            assertGreaterThan(fuentesData.length, 0, 'should have registros');
        });

        it('has at least 15 registros', function () {
            assertGreaterThan(fuentesData.length, 14, 'should have 15+ registros');
        });

        it('each registro has required fields', function () {
            var requiredFields = ['id', 'fuente', 'titulo', 'fecha', 'keywords', 'capa_oficial', 'friccion_con', 'tipo_friccion', 'tags'];
            for (var i = 0; i < fuentesData.length; i++) {
                var reg = fuentesData[i];
                for (var j = 0; j < requiredFields.length; j++) {
                    assert(reg[requiredFields[j]] !== undefined,
                        'registro[' + i + '] (' + reg.id + ') missing: ' + requiredFields[j]);
                }
            }
        });

        it('registro IDs are unique', function () {
            var ids = {};
            for (var i = 0; i < fuentesData.length; i++) {
                var id = fuentesData[i].id;
                assert(!ids[id], 'duplicate registro id: ' + id);
                ids[id] = true;
            }
        });

        it('fuente values are from known set', function () {
            var validFuentes = (fuentesConfig && Array.isArray(fuentesConfig.sources) ? fuentesConfig.sources : [])
                .map(function(source) { return source.id; });
            for (var i = 0; i < fuentesData.length; i++) {
                assertArrayIncludes(validFuentes, fuentesData[i].fuente,
                    'registro[' + i + '] fuente "' + fuentesData[i].fuente + '" should be valid');
            }
        });

        it('tipo_friccion values are valid friction types', function () {
            var validTipos = ['politica', 'semantica', 'tecnica'];
            for (var i = 0; i < fuentesData.length; i++) {
                assertArrayIncludes(validTipos, fuentesData[i].tipo_friccion,
                    'registro[' + i + '] tipo_friccion "' + fuentesData[i].tipo_friccion + '" should be valid');
            }
        });

        it('friccion_con references existing caso IDs', function () {
            var casoIds = casosData.casos.map(function (c) { return c.id; });
            for (var i = 0; i < fuentesData.length; i++) {
                assertArrayIncludes(casoIds, fuentesData[i].friccion_con,
                    'registro[' + i + '] friccion_con "' + fuentesData[i].friccion_con + '" should reference a valid caso');
            }
        });

        it('dates are in YYYY-MM-DD format', function () {
            var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            for (var i = 0; i < fuentesData.length; i++) {
                var fecha = fuentesData[i].fecha;
                assert(dateRegex.test(fecha),
                    'registro[' + i + '] fecha "' + fecha + '" should be YYYY-MM-DD');
            }
        });

        it('keywords are non-empty arrays', function () {
            for (var i = 0; i < fuentesData.length; i++) {
                assert(Array.isArray(fuentesData[i].keywords), 'keywords should be array');
                assertGreaterThan(fuentesData[i].keywords.length, 0,
                    'registro[' + i + '] should have at least 1 keyword');
            }
        });

        it('tags are non-empty arrays', function () {
            for (var i = 0; i < fuentesData.length; i++) {
                assert(Array.isArray(fuentesData[i].tags), 'tags should be array');
                assertGreaterThan(fuentesData[i].tags.length, 0,
                    'registro[' + i + '] should have at least 1 tag');
            }
        });
    });

    /* ─── Categorías de búsqueda ─── */

    describe('data/fuentes-oficiales.json — categorías', function () {
        var validCats = ['E', 'F', 'G', 'H', 'I'];

        it('categoria_primaria values are valid if present', function () {
            for (var i = 0; i < fuentesData.length; i++) {
                var registro = fuentesData[i];
                if (registro.categoria_primaria) {
                    assert(Array.isArray(registro.categoria_primaria),
                        'registro[' + i + '] categoria_primaria should be array if present');
                    for (var j = 0; j < registro.categoria_primaria.length; j++) {
                        var cat = registro.categoria_primaria[j];
                        assertArrayIncludes(validCats, cat,
                            'registro[' + i + '] categoria "' + cat + '" should be valid (E, F, G, H, I)');
                    }
                }
            }
        });

        it('categoría I solo contiene registros vinculados a casos etnográficos', function () {
            var casoIds = ['sura-gobernanza-datos', 'la-negra-territorio-mapuche', 'periodismo-datos-chile', 'oit169-consulta-previa'];
            for (var i = 0; i < fuentesData.length; i++) {
                var registro = fuentesData[i];
                if (registro.categoria_primaria && registro.categoria_primaria.indexOf('I') !== -1) {
                    assert(registro.friccion_con,
                        'registro[' + i + '] con categoría I debe tener friccion_con');
                    assertArrayIncludes(casoIds, registro.friccion_con,
                        'registro[' + i + '] categoría I debe vincular a caso etnográfico válido');
                }
            }
        });
    });

    /* ─── bcn-legislativo.json schema ─── */

    describe('data/bcn-legislativo.json — schema', function () {
        it('has _meta with schema info', function () {
            assert(bcnData._meta, 'should have _meta');
            assert(typeof bcnData._meta.schema === 'string', 'should have schema name');
            assert(typeof bcnData._meta.version === 'number', 'should have version number');
        });

        it('has boletines array', function () {
            assert(Array.isArray(bcnData.boletines), 'should have boletines array');
            assertGreaterThan(bcnData.boletines.length, 0, 'should have at least 1 boletin');
        });

        it('each boletin has required fields', function () {
            var requiredFields = ['id', 'titulo', 'friccion_con', 'tipo_friccion'];
            for (var i = 0; i < bcnData.boletines.length; i++) {
                var b = bcnData.boletines[i];
                for (var j = 0; j < requiredFields.length; j++) {
                    assert(b[requiredFields[j]] !== undefined,
                        'boletin[' + i + '] missing field: ' + requiredFields[j]);
                }
            }
        });

        it('boletin IDs are unique', function () {
            var ids = {};
            for (var i = 0; i < bcnData.boletines.length; i++) {
                var id = bcnData.boletines[i].id;
                assert(!ids[id], 'duplicate boletin id: ' + id);
                ids[id] = true;
            }
        });

        it('friccion_con references existing caso IDs', function () {
            var casoIds = casosData.casos.map(function (c) { return c.id; });
            for (var i = 0; i < bcnData.boletines.length; i++) {
                assertArrayIncludes(casoIds, bcnData.boletines[i].friccion_con,
                    'boletin[' + i + '] friccion_con should reference a valid caso');
            }
        });

        it('tipo_friccion values are valid', function () {
            var validTipos = ['politica', 'semantica', 'tecnica'];
            for (var i = 0; i < bcnData.boletines.length; i++) {
                assertArrayIncludes(validTipos, bcnData.boletines[i].tipo_friccion,
                    'boletin[' + i + '] tipo_friccion should be valid');
            }
        });
    });

    /* ─── Cross-data referential integrity ─── */

    describe('Cross-data referential integrity', function () {
        it('all expected fuente types are covered across registros', function () {
            var fuentes = {};
            for (var i = 0; i < fuentesData.length; i++) {
                fuentes[fuentesData[i].fuente] = true;
            }
            var expectedFuentes = [
                'infolobby',
                'sii',
                'transparencia',
                'leychile',
                'seia',
                'compraspublicas',
                'cmf',
                'diario-financiero',
                'repositorio-uai',
                'repositorio-uchile'
            ];
            for (var j = 0; j < expectedFuentes.length; j++) {
                assert(fuentes[expectedFuentes[j]],
                    'fuentes-oficiales.json should cover fuente: ' + expectedFuentes[j]);
            }
        });

        it('all 6 casos are referenced by at least one fuente', function () {
            var casoRefs = {};
            for (var i = 0; i < fuentesData.length; i++) {
                casoRefs[fuentesData[i].friccion_con] = true;
            }
            for (var j = 0; j < casosData.casos.length; j++) {
                assert(casoRefs[casosData.casos[j].id],
                    'caso ' + casosData.casos[j].id + ' should be referenced by at least one fuente');
            }
        });

        it('BCN boletines reference at least one caso', function () {
            var casoIds = casosData.casos.map(function (c) { return c.id; });
            var found = false;
            for (var i = 0; i < bcnData.boletines.length; i++) {
                if (casoIds.indexOf(bcnData.boletines[i].friccion_con) !== -1) {
                    found = true;
                    break;
                }
            }
            assert(found, 'at least one BCN boletin should reference a caso');
        });

        it('all three friction types (politica, semantica, tecnica) appear in fuentes', function () {
            var tipos = {};
            for (var i = 0; i < fuentesData.length; i++) {
                tipos[fuentesData[i].tipo_friccion] = true;
            }
            assert(tipos.politica, 'should have politica registros');
            assert(tipos.semantica, 'should have semantica registros');
            assert(tipos.tecnica, 'should have tecnica registros');
        });
    });
};
