/**
 * huellaDigital.test.js — Schema & referential integrity tests for data/huella-digital-publica.json
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertArrayIncludes, casosData, fuentesData, bcnData, huellaData) {
    describe('data/huella-digital-publica.json — schema', function () {
        it('has _meta with schema and version', function () {
            assert(huellaData._meta, 'should have _meta');
            assertEqual(huellaData._meta.schema, 'contra-archivo/huella-digital-publica');
            assert(typeof huellaData._meta.version === 'number', 'version should be numeric');
        });

        it('has non-empty entidades array', function () {
            assert(Array.isArray(huellaData.entidades), 'entidades should be array');
            assertGreaterThan(huellaData.entidades.length, 0, 'should define entidades');
        });

        it('has non-empty trazas array', function () {
            assert(Array.isArray(huellaData.trazas), 'trazas should be array');
            assertGreaterThan(huellaData.trazas.length, 0, 'should define trazas');
        });

        it('has non-empty consultas_semilla array', function () {
            assert(Array.isArray(huellaData.consultas_semilla), 'consultas_semilla should be array');
            assertGreaterThan(huellaData.consultas_semilla.length, 0, 'should define consultas semilla');
        });
    });

    describe('data/huella-digital-publica.json — referential integrity', function () {
        var casoIds = casosData.casos.map(function (c) { return c.id; });
        var fuenteIds = fuentesData.map(function (r) { return r.id; });
        var bcnIds = (bcnData.boletines || []).map(function (b) { return b.id; });
        var allRegistroIds = fuenteIds.concat(bcnIds);

        it('entidades reference known casos', function () {
            for (var i = 0; i < huellaData.entidades.length; i++) {
                var entidad = huellaData.entidades[i];
                assert(Array.isArray(entidad.casos_relacionados), 'casos_relacionados should be array for ' + entidad.id);
                for (var j = 0; j < entidad.casos_relacionados.length; j++) {
                    assertArrayIncludes(casoIds, entidad.casos_relacionados[j], 'unknown caso in ' + entidad.id);
                }
            }
        });

        it('entidades reference known registros', function () {
            for (var i = 0; i < huellaData.entidades.length; i++) {
                var entidad = huellaData.entidades[i];
                assert(Array.isArray(entidad.registros_relacionados), 'registros_relacionados should be array for ' + entidad.id);
                for (var j = 0; j < entidad.registros_relacionados.length; j++) {
                    assertArrayIncludes(allRegistroIds, entidad.registros_relacionados[j], 'unknown registro in ' + entidad.id);
                }
            }
        });

        it('includes SII as an enabled source for at least one entidad', function () {
            var found = false;
            for (var i = 0; i < huellaData.entidades.length; i++) {
                if ((huellaData.entidades[i].fuentes_habilitadas || []).indexOf('sii') !== -1) {
                    found = true;
                    break;
                }
            }
            assert(found, 'at least one entidad should include sii');
        });
    });
};
