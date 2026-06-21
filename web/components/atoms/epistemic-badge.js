/**
 * Atom: badge de estatus epistémico
 * hecho | hipotesis | inferencia
 */
(function () {
    'use strict';

    var LABELS = {
        hecho: 'Hecho documentado',
        hipotesis: 'Hipótesis investigativa',
        inferencia: 'Inferencia teórica',
    };

    var dom = window.CAAtoms && window.CAAtoms.dom;

    function render(type) {
        var t = LABELS[type] ? type : 'inferencia';
        return (
            '<span class="ca-epistemic ca-epistemic--' + t + '">' +
            dom.escapeHtml(LABELS[t]) +
            '</span>'
        );
    }

    window.CAAtoms = window.CAAtoms || {};
    window.CAAtoms.epistemicBadge = { render: render, labels: LABELS };
})();