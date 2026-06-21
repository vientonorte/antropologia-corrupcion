/**
 * Molecule: encabezado de sección (kicker + título + lead)
 */
(function () {
    'use strict';

    var dom = window.CAAtoms.dom;
    var kicker = window.CAAtoms.kicker;

    /**
     * @param {{ kicker?: string, title: string, lead?: string, id?: string }} props
     */
    function render(props) {
        var idAttr = props.id ? ' id="' + dom.escapeHtml(props.id) + '"' : '';
        var html = '<header class="ca-section-header"' + idAttr + '>';
        if (props.kicker) html += kicker.render(props.kicker);
        html += '<h2 class="ca-section-header__title">' + dom.escapeHtml(props.title) + '</h2>';
        if (props.lead) {
            html += '<p class="ca-section-header__lead">' + dom.escapeHtml(props.lead) + '</p>';
        }
        html += '</header>';
        return html;
    }

    window.CAMolecules = window.CAMolecules || {};
    window.CAMolecules.sectionHeader = { render: render };
})();