/**
 * Organism logic: renderiza narrativa desde JSON (sin HTML horneado)
 */
(function () {
    'use strict';

    var dom = window.CAAtoms.dom;
    var badge = window.CAAtoms.epistemicBadge;
    var sectionHeader = window.CAMolecules.sectionHeader;

    function resolveDataPath(filename) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function renderParagraphs(paragraphs, epistemic) {
        if (!Array.isArray(paragraphs)) return '';
        return paragraphs
            .map(function (p) {
                return (
                    '<p class="ca-narrative__p">' +
                    (epistemic ? badge.render(epistemic) + ' ' : '') +
                    dom.escapeHtml(p) +
                    '</p>'
                );
            })
            .join('');
    }

    function renderPresentacion(block) {
        if (!block) return '';
        var html = sectionHeader.render({
            kicker: 'Marco doctoral',
            title: block.titulo || 'Presentación',
            lead: block.tesis,
        });
        html += badge.render('hipotesis');

        if (block.preguntas_investigacion) {
            html += '<h3 class="ca-narrative__h3">Preguntas de investigación</h3><ul class="ca-narrative__list">';
            block.preguntas_investigacion.forEach(function (q) {
                html += '<li>' + dom.escapeHtml(q) + '</li>';
            });
            html += '</ul>';
        }

        if (block.hipotesis) {
            html += '<h3 class="ca-narrative__h3">Hipótesis</h3><dl class="ca-narrative__dl">';
            block.hipotesis.forEach(function (h) {
                html += '<dt>' + dom.escapeHtml(h.id) + '</dt><dd>' + dom.escapeHtml(h.texto) + '</dd>';
            });
            html += '</dl>';
        }
        return '<article class="ca-narrative__block">' + html + '</article>';
    }

    function renderProtocolo(block) {
        if (!block) return '';
        var html = sectionHeader.render({
            kicker: 'Protocolo C.01–C.04',
            title: block.titulo || 'Protocolo de traducción',
            lead: block.epigrafe,
        });
        html += '<p class="ca-narrative__output">' + dom.escapeHtml(block.output || '') + '</p>';

        if (block.codigos) {
            html += '<table class="ca-narrative__table"><caption class="sr-only">Códigos de fricción</caption>' +
                '<thead><tr><th scope="col">Código</th><th scope="col">Dimensión</th><th scope="col">Condición</th></tr></thead><tbody>';
            block.codigos.forEach(function (c) {
                html +=
                    '<tr><td>' + dom.escapeHtml(c.codigo) + '</td>' +
                    '<td>' + dom.escapeHtml(c.dimension) + '</td>' +
                    '<td>' + dom.escapeHtml(c.condicion) + '</td></tr>';
            });
            html += '</tbody></table>';
        }
        return '<article class="ca-narrative__block">' + html + '</article>';
    }

    function renderEnsayo(block) {
        if (!block) return '';
        var html = sectionHeader.render({
            kicker: 'Ensayo · Traducción de saberes',
            title: block.titulo || 'Ensayo',
            lead: block.abstract,
        });
        html += badge.render('inferencia');

        if (block.argumentos) {
            block.argumentos.forEach(function (arg) {
                html +=
                    '<section class="ca-narrative__arg">' +
                    '<h3 class="ca-narrative__h3">' + dom.escapeHtml(arg.titulo) + '</h3>' +
                    '<p class="ca-narrative__p">' + dom.escapeHtml(arg.cuerpo) + '</p>' +
                    '</section>';
            });
        }
        return '<article class="ca-narrative__block">' + html + '</article>';
    }

    function renderArticulo(data) {
        if (!data || !data.sections) return '';
        var html = sectionHeader.render({
            kicker: 'Artículo etnográfico',
            title: 'La máquina de fabricar enemigos',
            lead: 'Lectura etnográfica del archivo Huracán — desde JSON, no HTML estático.',
        });
        html += badge.render('inferencia');

        data.sections.forEach(function (sec) {
            html +=
                '<section class="ca-narrative__arg" id="' + dom.escapeHtml(sec.id) + '">' +
                '<h3 class="ca-narrative__h3">' + dom.escapeHtml(sec.title) + '</h3>' +
                renderParagraphs(sec.paragraphs, null) +
                '</section>';
        });
        return '<article class="ca-narrative__block" id="articulo-etnografico">' + html + '</article>';
    }

    function render(rootEl) {
        if (!rootEl) return Promise.reject(new Error('rootEl requerido'));

        rootEl.setAttribute('aria-busy', 'true');
        rootEl.innerHTML = '<p class="ca-narrative__loading">Cargando narrativa…</p>';

        return Promise.all([
            fetch(resolveDataPath('narrativa-rescatada.json')).then(function (r) {
                return r.ok ? r.json() : {};
            }),
            fetch(resolveDataPath('articulo-etnografico.json')).then(function (r) {
                return r.ok ? r.json() : null;
            }),
        ])
            .then(function (results) {
                var narrativa = results[0] || {};
                var articulo = results[1];

                var html = '<div class="ca-narrative">';
                html += renderPresentacion(narrativa.presentacion_00);
                html += renderProtocolo(narrativa.protocolo_traduccion);
                html += renderEnsayo(narrativa.ensayo_argumentos);
                html += renderArticulo(articulo);
                html +=
                    '<footer class="ca-narrative__footer">' +
                    '<a href="index.html#tesis">← Volver al instrumento (grafo)</a> · ' +
                    '<a href="archivo.html">Archivo editorial</a>' +
                    '</footer>';
                html += '</div>';

                rootEl.innerHTML = html;
                rootEl.setAttribute('aria-busy', 'false');
            })
            .catch(function (err) {
                rootEl.innerHTML =
                    '<div class="ca-narrative__error" role="alert">' +
                    '<p>No se pudo cargar la narrativa.</p>' +
                    '<p><small>' + dom.escapeHtml(err.message) + '</small></p>' +
                    '</div>';
                rootEl.setAttribute('aria-busy', 'false');
            });
    }

    window.CANarrativeRenderer = { render: render };
})();