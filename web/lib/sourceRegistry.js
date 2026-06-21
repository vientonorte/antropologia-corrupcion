/**
 * lib/sourceRegistry.js
 * Agrega estadísticas de corpus + estados DevOps/Scrum por fuente.
 * Design thinking: confianza del investigador · DevOps: pipeline mvp/fase-2 · Scrum: readiness.
 */
(function () {
    'use strict';

    var READINESS_LABELS = {
        operativo: 'Operativo',
        parcial: 'Cobertura parcial',
        pipeline: 'En pipeline',
        planificado: 'Planificado',
        inactivo: 'Inactivo',
    };

    var PIPELINE_LABELS = {
        mvp: 'MVP',
        'fase-2': 'Fase 2',
    };

    var VERIFICACION_LABELS = {
        'curado-manual': 'Curado manual',
        'derivado-ley-vigente': 'Derivado ley vigente',
        'sin-clasificar': 'Sin clasificar',
    };

    function emptyStats() {
        return {
            total: 0,
            verificados: 0,
            conScore: 0,
            scoreSum: 0,
            estadosVerificacion: {},
            etapas: {},
        };
    }

    function bumpCount(map, key) {
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
    }

    function aggregateRecordsBySource(records) {
        var stats = {};
        (records || []).forEach(function (r) {
            var src = r.fuente || 'desconocida';
            if (!stats[src]) stats[src] = emptyStats();
            var s = stats[src];
            s.total += 1;
            if (r.verificado === true) s.verificados += 1;
            if (typeof r.official_score === 'number') {
                s.conScore += 1;
                s.scoreSum += r.official_score;
            }
            bumpCount(s.estadosVerificacion, r.estado_verificacion);
            bumpCount(s.etapas, r.etapa_actual);
        });
        return stats;
    }

    function computeReadiness(configItem, recordStats) {
        if (!configItem) return 'planificado';
        if (configItem.activa === false) {
            return configItem.estado === 'fase-2' ? 'planificado' : 'inactivo';
        }
        var stats = recordStats || emptyStats();
        if (stats.total === 0) {
            return configItem.estado === 'mvp' ? 'pipeline' : 'planificado';
        }
        if (stats.total >= 2 && stats.verificados / stats.total >= 0.5) return 'operativo';
        return 'parcial';
    }

    function computeSprintMeta(configItem, recordStats, readiness) {
        var stats = recordStats || emptyStats();
        var checklist = [
            { id: 'registry', label: 'Registro DevOps', done: true },
            { id: 'activa', label: 'Fuente activa', done: configItem.activa !== false },
            { id: 'datos', label: 'Corpus cargado', done: stats.total > 0 },
            {
                id: 'verificacion',
                label: 'Verificación ≥50%',
                done: stats.total > 0 && stats.verificados / stats.total >= 0.5,
            },
        ];
        var done = checklist.filter(function (c) {
            return c.done;
        }).length;
        return {
            checklist: checklist,
            points: done,
            maxPoints: checklist.length,
            label: done + '/' + checklist.length + ' criterios',
            readiness: readiness,
        };
    }

    function dominantKey(map) {
        var keys = Object.keys(map || {});
        if (!keys.length) return null;
        keys.sort(function (a, b) {
            return (map[b] || 0) - (map[a] || 0);
        });
        return keys[0];
    }

    function buildEntry(configItem, recordStats) {
        var stats = recordStats || emptyStats();
        var readiness = computeReadiness(configItem, stats);
        var avgScore = stats.conScore > 0 ? stats.scoreSum / stats.conScore : null;
        var verificacionPct = stats.total > 0 ? stats.verificados / stats.total : 0;
        var domVerificacion = dominantKey(stats.estadosVerificacion);
        var domEtapa = dominantKey(stats.etapas);

        return {
            id: configItem.id,
            label: configItem.label || configItem.id,
            icon: configItem.icon || '📄',
            color: configItem.color || '#888',
            tipo: configItem.tipo || 'oficial',
            criticidad: configItem.criticidad || 'media',
            prioridad: typeof configItem.prioridad === 'number' ? configItem.prioridad : 99,
            estado: configItem.estado || 'fase-2',
            activa: configItem.activa !== false,
            endpoint: configItem.endpoint || configItem.url_base || '',
            metodo_acceso: configItem.metodo_acceso || 'web',
            readiness: readiness,
            readinessLabel: READINESS_LABELS[readiness] || readiness,
            pipelineLabel: PIPELINE_LABELS[configItem.estado] || configItem.estado,
            records: stats.total,
            verificados: stats.verificados,
            verificacionPct: verificacionPct,
            avgOfficialScore: avgScore,
            estadoVerificacionDominante: domVerificacion,
            estadoVerificacionLabel: domVerificacion
                ? VERIFICACION_LABELS[domVerificacion] || domVerificacion
                : null,
            etapaDominante: domEtapa,
            estadosVerificacion: stats.estadosVerificacion,
            etapas: stats.etapas,
            sprint: computeSprintMeta(configItem, stats, readiness),
        };
    }

    function buildSourceReport(sourceConfig, records) {
        var config = sourceConfig || { sources: [] };
        var bySource = aggregateRecordsBySource(records);
        var configured = config.sources || [];
        var seen = {};
        var entries = [];

        configured.forEach(function (cfg) {
            if (!cfg || !cfg.id) return;
            seen[cfg.id] = true;
            entries.push(buildEntry(cfg, bySource[cfg.id]));
        });

        Object.keys(bySource).forEach(function (id) {
            if (seen[id]) return;
            entries.push(
                buildEntry(
                    {
                        id: id,
                        label: id,
                        estado: 'mvp',
                        activa: true,
                        prioridad: 50,
                    },
                    bySource[id],
                ),
            );
        });

        entries.sort(function (a, b) {
            if (a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
            return b.records - a.records;
        });

        var activas = entries.filter(function (e) {
            return e.activa;
        });
        var conDatos = entries.filter(function (e) {
            return e.records > 0;
        });
        var operativas = entries.filter(function (e) {
            return e.readiness === 'operativo';
        });

        return {
            meta: config._meta || {},
            entries: entries,
            summary: {
                totalSources: entries.length,
                activas: activas.length,
                conDatos: conDatos.length,
                operativas: operativas.length,
                totalRecords: (records || []).length,
            },
        };
    }

    function getEntryById(report, sourceId) {
        if (!report || !report.entries) return null;
        for (var i = 0; i < report.entries.length; i++) {
            if (report.entries[i].id === sourceId) return report.entries[i];
        }
        return null;
    }

    function resolveRecordState(record, entry) {
        var verificado = record.verificado === true;
        var estadoVerificacion = record.estado_verificacion || null;
        var etapa = record.etapa_actual || null;
        var officialScore =
            typeof record.official_score === 'number' ? record.official_score : null;

        return {
            verificado: verificado,
            verificadoLabel: verificado ? 'Verificado' : 'Sin verificar',
            estadoVerificacion: estadoVerificacion,
            estadoVerificacionLabel: estadoVerificacion
                ? VERIFICACION_LABELS[estadoVerificacion] || estadoVerificacion
                : null,
            etapa: etapa,
            officialScore: officialScore,
            pipelineLabel: entry ? entry.pipelineLabel : null,
            readiness: entry ? entry.readiness : null,
            readinessLabel: entry ? entry.readinessLabel : null,
        };
    }

    window.CASourceRegistry = {
        READINESS_LABELS: READINESS_LABELS,
        PIPELINE_LABELS: PIPELINE_LABELS,
        VERIFICACION_LABELS: VERIFICACION_LABELS,
        aggregateRecordsBySource: aggregateRecordsBySource,
        computeReadiness: computeReadiness,
        buildSourceReport: buildSourceReport,
        getEntryById: getEntryById,
        resolveRecordState: resolveRecordState,
    };
})();