/**
 * Organism: sección Tesis — Grafo B en landing
 */
(function () {
    'use strict';

    var sectionHeader = window.CAMolecules.sectionHeader;

    function render() {
        return (
            '<section class="ca-thesis" id="tesis" aria-labelledby="tesis-title">' +
            sectionHeader.render({
                id: 'tesis-title',
                kicker: 'Colectivo Viento Norte · Instrumento analítico',
                title: 'La tesis en movimiento',
                lead:
                    'Fricción epistemológica modelada sobre casos reales: I = V/R, entropía social y transacciones entre capas ética, institucional y material. El motor no resuelve contradicciones — las hace explorables.',
            }) +
            '<p class="ca-thesis__formula" aria-label="Ley de Ohm Social">' +
            '<span class="ca-thesis__formula-label">Ley de Ohm Social</span> ' +
            '<span class="ca-thesis__formula-expr">I = V / R</span>' +
            '</p>' +
            '<div class="ca-thesis__mount is-loading" id="ca-thesis-mount" ' +
            'role="region" aria-label="Grafo de fricción y entropía" aria-busy="true">' +
            '<div class="ca-thesis__skeleton" aria-hidden="true">' +
            '<div class="ca-thesis__skeleton-bar"></div>' +
            '<p>Inicializando instrumento…</p>' +
            '</div>' +
            '</div>' +
            '<p class="ca-thesis__status" id="thesis-graph-status" aria-live="polite"></p>' +
            '<p class="ca-thesis__cta">' +
            '<a href="leer.html">Leer marco y narrativa →</a> · ' +
            '<a href="buscador.html">Consultar fuentes →</a>' +
            '</p>' +
            '</section>'
        );
    }

    window.CAOrganisms = window.CAOrganisms || {};
    window.CAOrganisms.thesisSection = { render: render };
})();