/**
 * Organism: sección Tesis — Grafo B en landing
 */
(function () {
    'use strict';

    var sectionHeader = window.CAMolecules.sectionHeader;

    function render() {
        return (
            '<section class="ca-thesis ca-thesis--v3" id="tesis" aria-labelledby="tesis-title">' +
            '<div class="ca-thesis__prose">' +
            sectionHeader.render({
                id: 'tesis-title',
                kicker: 'Colectivo Viento Norte · Instrumento analítico · v3',
                title: 'La tesis en movimiento',
                lead:
                    'Fricción epistemológica modelada sobre casos reales: I = V/R, entropía social y transacciones entre capas ética, institucional y material. El motor no resuelve contradicciones — las hace explorables.',
            }) +
            '<p class="ca-thesis__formula" aria-label="Ley de Ohm Social">' +
            '<span class="ca-thesis__formula-label">Ley de Ohm Social</span> ' +
            '<span class="ca-thesis__formula-expr">I = V / R</span>' +
            '</p>' +
            '</div>' +
            '<div class="ca-thesis__instrument" aria-label="Instrumento a ancho completo">' +
            '<div class="ca-thesis__mount is-loading" id="ca-thesis-mount" ' +
            'role="region" aria-label="Grafo de fricción y entropía" aria-busy="true">' +
            '<div class="ca-thesis__skeleton" aria-hidden="true">' +
            '<div class="ca-thesis__skeleton-bar"></div>' +
            '<p>Inicializando instrumento…</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ca-thesis__prose ca-thesis__prose--footer">' +
            '<p class="ca-thesis__status" id="thesis-graph-status" aria-live="polite"></p>' +
            '<p class="ca-thesis__cta">' +
            '<a href="leer.html">Leer marco y narrativa →</a> · ' +
            '<a href="buscador.html">Consultar fuentes →</a>' +
            '</p>' +
            '</div>' +
            '</section>'
        );
    }

    window.CAOrganisms = window.CAOrganisms || {};
    window.CAOrganisms.thesisSection = { render: render };
})();