/**
 * categoryExport.test.js — CSV export con columnas de verificación
 */
'use strict';

module.exports = function (
    describe,
    it,
    assert,
    assertEqual,
    assertDeepEqual,
    fuentesConfig,
) {
    var CE = window.categoryExport;
    var SR = window.CASourceRegistry;

    describe('categoryExport — enrichForExport', function () {
        it('adds verification columns when sourceReport provided', function () {
            var records = [
                {
                    id: 't1',
                    titulo: 'Test',
                    fecha: '2024-01-01',
                    fuente: 'infolobby',
                    verificado: true,
                    official_score: 0.94,
                },
            ];
            var report = SR.buildSourceReport(fuentesConfig, records);
            var enriched = CE.enrichForExport(records, report);
            assertEqual(enriched[0].verificado, 'si');
            assert(enriched[0].readiness_fuente, 'readiness label');
        });

        it('exportCategoryResults includes verificado in CSV header', function () {
            var records = [
                {
                    id: 't2',
                    titulo: 'BCN',
                    fecha: '2023-01-01',
                    fuente: 'bcn',
                    estado_verificacion: 'curado-manual',
                    _frictionScore: 0.5,
                },
            ];
            var report = SR.buildSourceReport(fuentesConfig, records);
            var csv = CE.generateCSV(CE.enrichForExport(records, report), {
                columns: [
                    'id', 'verificado', 'estado_verificacion', 'official_score', 'readiness_fuente',
                ],
            });
            assert(csv.indexOf('estado_verificacion') !== -1, 'header has estado_verificacion');
            assert(csv.indexOf('readiness_fuente') !== -1, 'header has readiness_fuente');
        });
    });
};