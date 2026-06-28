/**
 * lib/corpusStats.js — barra de métricas del corpus público
 */
(function () {
    'use strict';

    function esc(str) {
        if (window.CAAtoms && window.CAAtoms.dom) return window.CAAtoms.dom.escapeHtml(str);
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function buildMetrics(bundle, report) {
        var summary = (report && report.summary) || {};
        var casos = (bundle && bundle.casos) || [];
        return {
            registros: summary.totalRecords || (bundle && bundle.allRecords ? bundle.allRecords.length : 0),
            fuentes: summary.conDatos || 0,
            casos: casos.length,
            operativas: summary.operativas || 0,
        };
    }

    function render(metrics) {
        metrics = metrics || {};
        return (
            '<p class="ca-corpus-stats" role="status" aria-label="Resumen del corpus consultado">' +
            '<span class="ca-corpus-stats__item">' +
            '<strong>' +
            esc(String(metrics.registros || 0)) +
            '</strong> registros</span>' +
            '<span class="ca-corpus-stats__sep" aria-hidden="true">·</span>' +
            '<span class="ca-corpus-stats__item">' +
            '<strong>' +
            esc(String(metrics.fuentes || 0)) +
            '</strong> fuentes con datos</span>' +
            '<span class="ca-corpus-stats__sep" aria-hidden="true">·</span>' +
            '<span class="ca-corpus-stats__item">' +
            '<strong>' +
            esc(String(metrics.casos || 0)) +
            '</strong> casos etnográficos</span>' +
            '</p>'
        );
    }

    function mount(containerId, bundle, report) {
        var el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = render(buildMetrics(bundle, report));
    }

    window.CACorpusStats = {
        buildMetrics: buildMetrics,
        render: render,
        mount: mount,
    };
})();