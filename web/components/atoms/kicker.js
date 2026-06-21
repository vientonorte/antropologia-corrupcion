/**
 * Atom: kicker / eyebrow tipográfico
 */
(function () {
    'use strict';

    var dom = window.CAAtoms && window.CAAtoms.dom;

    function renderKicker(text, className) {
        var cls = 'ca-kicker' + (className ? ' ' + className : '');
        return '<p class="' + cls + '">' + dom.escapeHtml(text) + '</p>';
    }

    window.CAAtoms = window.CAAtoms || {};
    window.CAAtoms.kicker = { render: renderKicker };
})();