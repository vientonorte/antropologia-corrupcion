/**
 * sourceRegistry.test.js — Stats y readiness por fuente
 */
'use strict';

module.exports = function (
    describe,
    it,
    assert,
    assertEqual,
    assertDeepEqual,
    assertApprox,
    assertGreaterThan,
    assertArrayIncludes,
    fuentesData,
    bcnData,
    fuentesConfig,
) {
    var SR = window.CASourceRegistry;
    var BC = window.CABasesConsultadas;

    function allRecords() {
        var fuentes = Array.isArray(fuentesData) ? fuentesData : fuentesData.registros || [];
        var bcnNorm =
            window.CAHuellaDigital && window.CAHuellaDigital.normalizeBcnRecords
                ? window.CAHuellaDigital.normalizeBcnRecords(bcnData)
                : [];
        return fuentes.concat(bcnNorm);
    }

    describe('CASourceRegistry — API', function () {
        it('exposes buildSourceReport and resolveRecordState', function () {
            assert(typeof SR.buildSourceReport === 'function');
            assert(typeof SR.resolveRecordState === 'function');
            assert(typeof SR.computeReadiness === 'function');
        });
    });

    describe('CASourceRegistry — buildSourceReport', function () {
        it('includes all configured sources', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            assertGreaterThan(report.entries.length, fuentesConfig.sources.length - 1);
            assert(report.summary.totalRecords > 0, 'should count records');
        });

        it('marks mvp activa with data as operativo or parcial', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var infolobby = SR.getEntryById(report, 'infolobby');
            assert(infolobby, 'infolobby entry');
            assertArrayIncludes(
                ['operativo', 'parcial', 'pipeline'],
                infolobby.readiness,
                'infolobby readiness',
            );
            assertEqual(infolobby.pipelineLabel, 'MVP');
        });

        it('marks fase-2 inactiva as planificado', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var uai = SR.getEntryById(report, 'repositorio-uai');
            assert(uai, 'repositorio-uai entry');
            assertEqual(uai.readiness, 'planificado');
            assertEqual(uai.activa, false);
        });

        it('computes sprint checklist with 4 criteria', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var bcn = SR.getEntryById(report, 'bcn');
            assert(bcn.sprint, 'sprint meta');
            assertEqual(bcn.sprint.maxPoints, 4);
            assertGreaterThan(bcn.sprint.points, 0, 'bcn should have some sprint points');
        });
    });

    describe('CASourceRegistry — resolveRecordState', function () {
        it('resolves verificado from record', function () {
            var records = allRecords();
            var verified = records.find(function (r) {
                return r.verificado === true;
            });
            if (!verified) return;
            var state = SR.resolveRecordState(verified, null);
            assertEqual(state.verificado, true);
            assertEqual(state.verificadoLabel, 'Verificado');
        });

        it('resolves BCN estado_verificacion', function () {
            var records = allRecords();
            var bcnRec = records.find(function (r) {
                return r.estado_verificacion;
            });
            if (!bcnRec) return;
            var state = SR.resolveRecordState(bcnRec, null);
            assert(state.estadoVerificacionLabel, 'should have verificacion label');
        });
    });

    describe('CABasesConsultadas — render', function () {
        it('renders panel HTML with readiness classes', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var html = BC.renderPanel(report, { onlyActivas: true, limit: 5 });
            assert(html.indexOf('ca-bases') !== -1, 'panel markup');
            assert(html.indexOf('ca-bases__readiness') !== -1, 'readiness badge');
            assert(html.indexOf('Bases consultadas') !== -1, 'title');
        });

        it('renders compact line with chips', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var line = BC.renderCompactLine(report);
            assert(line.indexOf('ca-bases-chip') !== -1, 'chip markup');
        });

        it('renders record badges for verified record', function () {
            var report = SR.buildSourceReport(fuentesConfig, allRecords());
            var verified = allRecords().find(function (r) {
                return r.verificado === true;
            });
            if (!verified) return;
            var badges = BC.renderRecordBadges(verified, report);
            assert(badges.indexOf('Verificado') !== -1, 'verified pill');
        });

        it('buildFromBundle uses sourceConfig', function () {
            var bundle = {
                sourceConfig: fuentesConfig,
                allRecords: allRecords(),
            };
            var report = BC.buildFromBundle(bundle);
            assert(report, 'report from bundle');
            assertGreaterThan(report.entries.length, 0);
        });
    });
};