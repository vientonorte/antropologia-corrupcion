/**
 * lib/basesConsultadas.js
 * Panel "Bases consultadas" — estados visibles para el investigador.
 */
(function () {
    'use strict';

    var SR = null;

    function registry() {
        return SR || window.CASourceRegistry;
    }

    function escapeHtml(str) {
        if (window.CAAtoms && window.CAAtoms.dom) return window.CAAtoms.dom.escapeHtml(str);
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readinessClass(readiness) {
        return 'ca-bases__readiness--' + (readiness || 'planificado');
    }

    function renderSprintDots(sprint) {
        if (!sprint || !sprint.checklist) return '';
        return sprint.checklist
            .map(function (item) {
                return (
                    '<span class="ca-bases__dot' +
                    (item.done ? ' ca-bases__dot--done' : '') +
                    '" title="' +
                    escapeHtml(item.label) +
                    '" aria-label="' +
                    escapeHtml(item.label + (item.done ? ' cumplido' : ' pendiente')) +
                    '"></span>'
                );
            })
            .join('');
    }

    function renderSourceRow(entry, options) {
        options = options || {};
        var showRecords = options.showRecords !== false;
        var compact = options.compact === true;

        var metaBits = [];
        metaBits.push(
            '<span class="ca-bases__pipeline">' + escapeHtml(entry.pipelineLabel) + '</span>',
        );
        if (showRecords) {
            metaBits.push(
                '<span class="ca-bases__count">' +
                    entry.records +
                    ' reg.' +
                    (entry.verificados ? ' · ' + entry.verificados + ' verif.' : '') +
                    '</span>',
            );
        }
        if (entry.avgOfficialScore != null && !compact) {
            metaBits.push(
                '<span class="ca-bases__score">Conf. ' +
                    Math.round(entry.avgOfficialScore * 100) +
                    '%</span>',
            );
        }

        var detail = '';
        if (!compact && (entry.estadoVerificacionLabel || entry.etapaDominante)) {
            detail =
                '<p class="ca-bases__detail">' +
                (entry.estadoVerificacionLabel
                    ? escapeHtml(entry.estadoVerificacionLabel)
                    : '') +
                (entry.estadoVerificacionLabel && entry.etapaDominante ? ' · ' : '') +
                (entry.etapaDominante ? escapeHtml(entry.etapaDominante) : '') +
                '</p>';
        }

        return (
            '<li class="ca-bases__item' +
            (entry.activa ? '' : ' ca-bases__item--inactive') +
            '" data-source-id="' +
            escapeHtml(entry.id) +
            '">' +
            '<div class="ca-bases__item-head">' +
            '<span class="ca-bases__icon" style="color:' +
            escapeHtml(entry.color) +
            '" aria-hidden="true">' +
            escapeHtml(entry.icon) +
            '</span>' +
            '<span class="ca-bases__name">' +
            escapeHtml(entry.label) +
            '</span>' +
            '<span class="ca-bases__readiness ' +
            readinessClass(entry.readiness) +
            '">' +
            escapeHtml(entry.readinessLabel) +
            '</span>' +
            '</div>' +
            '<div class="ca-bases__meta">' +
            metaBits.join('') +
            '</div>' +
            (!compact
                ? '<div class="ca-bases__sprint" aria-label="Criterios de sprint ' +
                  escapeHtml(entry.sprint.label) +
                  '">' +
                  renderSprintDots(entry.sprint) +
                  '<span class="ca-bases__sprint-label">' +
                  escapeHtml(entry.sprint.label) +
                  '</span></div>'
                : '') +
            detail +
            '</li>'
        );
    }

    function renderPanel(report, options) {
        options = options || {};
        if (!report || !report.entries) return '';

        var title = options.title || 'Bases consultadas';
        var subtitle =
            options.subtitle ||
            'Estado del pipeline DevOps y readiness Scrum por fuente. Corpus curado, no scraping en vivo.';
        var limit = typeof options.limit === 'number' ? options.limit : null;

        var entries = report.entries;
        if (options.onlyActivas) {
            entries = entries.filter(function (e) {
                return e.activa;
            });
        }
        if (options.onlyConDatos) {
            entries = entries.filter(function (e) {
                return e.records > 0;
            });
        }
        if (limit != null) entries = entries.slice(0, limit);

        var summary = report.summary || {};
        var summaryHtml =
            '<p class="ca-bases__summary">' +
            (summary.operativas || 0) +
            ' operativas · ' +
            (summary.conDatos || 0) +
            ' con datos · ' +
            (summary.totalRecords || 0) +
            ' registros totales</p>';

        var listHtml = entries.map(function (e) {
            return renderSourceRow(e, { compact: options.compact });
        }).join('');

        return (
            '<section class="ca-bases" role="region" aria-label="' +
            escapeHtml(title) +
            '">' +
            '<header class="ca-bases__header">' +
            '<h2 class="ca-bases__title">' +
            escapeHtml(title) +
            '</h2>' +
            '<p class="ca-bases__subtitle">' +
            escapeHtml(subtitle) +
            '</p>' +
            summaryHtml +
            '</header>' +
            '<ul class="ca-bases__list" role="list">' +
            listHtml +
            '</ul>' +
            '<footer class="ca-bases__footer">' +
            '<span class="ca-epistemic ca-epistemic--hecho">Hecho documentado</span> ' +
            '<span class="ca-epistemic ca-epistemic--inferencia">Readiness calculado</span>' +
            '</footer>' +
            '</section>'
        );
    }

    function renderCompactLine(report) {
        if (!report || !report.entries) return '';
        var activas = report.entries.filter(function (e) {
            return e.activa && e.records > 0;
        });
        if (!activas.length) {
            activas = report.entries.filter(function (e) {
                return e.activa;
            });
        }
        return activas
            .slice(0, 8)
            .map(function (e) {
                return (
                    '<span class="ca-bases-chip" data-source-id="' +
                    escapeHtml(e.id) +
                    '" style="--chip-color:' +
                    escapeHtml(e.color) +
                    '">' +
                    '<span class="ca-bases-chip__dot ' +
                    readinessClass(e.readiness) +
                    '" aria-hidden="true"></span>' +
                    escapeHtml(e.label) +
                    (e.records ? ' (' + e.records + ')' : '') +
                    '</span>'
                );
            })
            .join('<span class="ca-bases-chip-sep" aria-hidden="true"> · </span>');
    }

    function renderRecordBadges(record, report) {
        var R = registry();
        if (!R) return '';
        var entry = R.getEntryById(report, record.fuente);
        var state = R.resolveRecordState(record, entry);

        var pills = [];
        if (state.verificadoLabel) {
            pills.push(
                '<span class="ca-bases-pill ca-bases-pill--' +
                    (state.verificado ? 'ok' : 'warn') +
                    '">' +
                    escapeHtml(state.verificadoLabel) +
                    '</span>',
            );
        }
        if (state.estadoVerificacionLabel) {
            pills.push(
                '<span class="ca-bases-pill ca-bases-pill--verif">' +
                    escapeHtml(state.estadoVerificacionLabel) +
                    '</span>',
            );
        }
        if (state.etapa) {
            pills.push(
                '<span class="ca-bases-pill ca-bases-pill--etapa">' +
                    escapeHtml(state.etapa) +
                    '</span>',
            );
        }
        if (state.officialScore != null) {
            pills.push(
                '<span class="ca-bases-pill ca-bases-pill--score">Conf. ' +
                    Math.round(state.officialScore * 100) +
                    '%</span>',
            );
        }
        if (!pills.length && entry) {
            pills.push(
                '<span class="ca-bases-pill ca-bases-pill--pipeline">' +
                    escapeHtml(entry.pipelineLabel) +
                    '</span>',
            );
        }
        return pills.length
            ? '<span class="ca-bases-pills" role="list">' + pills.join('') + '</span>'
            : '';
    }

    function mountPanel(containerId, report, options) {
        var el = document.getElementById(containerId);
        if (!el || !report) return;
        el.innerHTML = renderPanel(report, options);
    }

    function mountCompactLine(containerId, report) {
        var el = document.getElementById(containerId);
        if (!el || !report) return;
        var html = renderCompactLine(report);
        if (html) {
            el.innerHTML = html;
            el.setAttribute('aria-label', 'Bases consultadas con estado de cobertura');
        }
    }

    function buildFromBundle(bundle) {
        var R = registry();
        if (!R || !bundle) return null;
        return R.buildSourceReport(bundle.sourceConfig, bundle.allRecords || []);
    }

    window.CABasesConsultadas = {
        renderPanel: renderPanel,
        renderCompactLine: renderCompactLine,
        renderRecordBadges: renderRecordBadges,
        mountPanel: mountPanel,
        mountCompactLine: mountCompactLine,
        buildFromBundle: buildFromBundle,
    };
})();