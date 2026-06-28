/**
 * lib/siteSurface.js
 * Superficies públicas alimentadas por JSON (inventario, archivo, narrativa, casos).
 */
(function () {
    'use strict';

    var TIPO_KICKER = {
        ficha: 'Ficha',
        dossier: 'Corpus de citas',
        poemario: 'Poemario',
        articulo: 'Artículo',
        ensayo: 'Ensayo',
        biblioteca: 'Biblioteca',
        narrativa: 'Narrativa',
    };

    var SECCION_ORDER = { fichas: 0, citas: 1, poemarios: 2, biblioteca: 3 };

    function esc(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function resolveDataPath(filename) {
        if (window.CADataLoader && window.CADataLoader.resolveDataPath) {
            return window.CADataLoader.resolveDataPath(filename);
        }
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function kickerForEntry(entry) {
        if (entry.tipo === 'ficha') {
            if ((entry.titulo || '').indexOf('C03') === 0) return 'Ficha metodológica';
            if ((entry.titulo || '').indexOf('C02') === 0) return 'Ficha de sistema';
            return 'Ficha conceptual';
        }
        return TIPO_KICKER[entry.tipo] || entry.tipo || 'Recurso';
    }

    function buildResourceCard(entry) {
        return (
            '<a class="resource-card" href="' +
            esc(entry.url) +
            '">' +
            '<span class="resource-kicker">' +
            esc(kickerForEntry(entry)) +
            '</span>' +
            '<span class="resource-title">' +
            esc(entry.titulo) +
            '</span>' +
            '<span class="resource-meta">' +
            esc(entry.descripcion || '') +
            '</span>' +
            '</a>'
        );
    }

    function pickHomeResources(entries, surfaces) {
        var publicable = (entries || []).filter(function (entry) {
            return entry.estado === 'publicable';
        });

        publicable.sort(function (a, b) {
            var sa = SECCION_ORDER[a.seccion] !== undefined ? SECCION_ORDER[a.seccion] : 9;
            var sb = SECCION_ORDER[b.seccion] !== undefined ? SECCION_ORDER[b.seccion] : 9;
            return sa - sb;
        });

        var hasLeer = publicable.some(function (entry) {
            return String(entry.url || '').indexOf('leer.html') !== -1;
        });

        if (!hasLeer) {
            var leerSurface = (surfaces || []).find(function (surface) {
                return surface.path === 'leer.html';
            });
            if (leerSurface) {
                publicable.unshift({
                    id: 'surface-leer',
                    tipo: 'narrativa',
                    titulo: leerSurface.title || 'Leer — Marco y narrativa',
                    descripcion:
                        'Contenido dinámico desde JSON: presentación doctoral, protocolo C.01–C.04 y artículo etnográfico.',
                    url: 'leer.html',
                    estado: 'publicable',
                });
            }
        }

        return publicable.slice(0, 6);
    }

    function renderResourceGrid(entries, mount) {
        if (!mount) return;
        if (!entries.length) {
            mount.innerHTML = '<p class="resource-meta">Sin recursos publicables en el índice por ahora.</p>';
            return;
        }
        mount.innerHTML = entries.map(buildResourceCard).join('');
    }

    function renderNarrativeTeaser(narrativa, mount) {
        if (!mount || !narrativa) return;

        var pres = narrativa.presentacion_00 || {};
        var proto = narrativa.protocolo_traduccion || {};
        var ensayo = narrativa.ensayo_argumentos || {};
        var abstract = ensayo.abstract || '';
        var abstractShort = abstract.length > 240 ? abstract.slice(0, 240) + '…' : abstract;

        mount.innerHTML =
            '<div class="ca-surface__prose">' +
            '<div class="narrative-teaser__inner">' +
            '<span class="resource-kicker">Marco narrativo</span>' +
            '<h2 id="narrative-teaser-title" class="narrative-teaser__title">' +
            esc(pres.titulo || 'Presentación del proyecto') +
            '</h2>' +
            '<p class="narrative-teaser__tesis">' +
            esc(pres.tesis || '') +
            '</p>' +
            '<blockquote class="narrative-teaser__epigrafe">' +
            esc(proto.epigrafe || '') +
            '</blockquote>' +
            '<p class="narrative-teaser__abstract">' +
            esc(abstractShort) +
            '</p>' +
            '<div class="narrative-teaser__actions">' +
            '<a class="result-cta" href="leer.html">Leer marco completo →</a>' +
            '<a class="result-cta" href="index.html#tesis">Ver grafo de tesis →</a>' +
            '</div>' +
            '</div></div>';
    }

    function renderCasosStrip(casos, mount) {
        if (!mount) return;

        var list = Array.isArray(casos) ? casos : [];
        if (!list.length) {
            mount.style.display = 'none';
            return;
        }

        var cards = list.map(function (caso) {
            var href = 'index.html?caso=' + encodeURIComponent(caso.id);
            var label = window.CACasoPublico
                ? window.CACasoPublico.getPublicLabel(caso)
                : { titulo: caso.titulo || caso.id, actores: caso.actores || [] };
            var actors = (label.actores || []).slice(0, 3).join(' · ');
            return (
                '<a class="caso-chip" href="' +
                esc(href) +
                '">' +
                '<span class="caso-chip__title">' +
                esc(label.titulo || caso.id) +
                '</span>' +
                '<span class="caso-chip__meta">' +
                esc(String(caso.anio || '')) +
                (actors ? ' · ' + esc(actors) : '') +
                '</span>' +
                '</a>'
            );
        });

        mount.innerHTML =
            '<div class="ca-surface__prose">' +
            '<h2 id="casos-strip-title" class="casos-strip__title">Casos etnográficos en el grafo</h2>' +
            '<p class="casos-strip__copy section-lead">Cada enlace abre el instrumento con el caso precargado en el grafo de tesis.</p>' +
            '<div class="casos-strip__grid">' +
            cards.join('') +
            '</div></div>';
    }

    function mountHomeSurfaces() {
        var resourceMount = document.getElementById('ca-resource-mount');
        var narrativeMount = document.getElementById('ca-narrative-teaser');
        var casosMount = document.getElementById('ca-casos-strip');

        if (!resourceMount && !narrativeMount && !casosMount) {
            return Promise.resolve();
        }

        var fetches = [
            fetch(resolveDataPath('archivo-index.json')).then(function (response) {
                return response.ok ? response.json() : { entries: [] };
            }),
            fetch(resolveDataPath('narrativa-rescatada.json')).then(function (response) {
                return response.ok ? response.json() : {};
            }),
            fetch(resolveDataPath('ia-inventario.json')).then(function (response) {
                return response.ok ? response.json() : { surfaces: [] };
            }),
        ];

        var corpusPromise = window.CADataLoader
            ? window.CADataLoader.loadCorpusBundle({ includeHuella: false })
            : Promise.resolve({ casos: [] });

        return Promise.all(fetches.concat([corpusPromise]))
            .then(function (results) {
                var archivo = results[0];
                var narrativa = results[1];
                var inventario = results[2];
                var corpus = results[3] || {};

                renderResourceGrid(
                    pickHomeResources(archivo.entries, inventario.surfaces),
                    resourceMount,
                );
                renderNarrativeTeaser(narrativa, narrativeMount);
                renderCasosStrip(corpus.casos, casosMount);
            })
            .catch(function () {
                if (resourceMount) {
                    resourceMount.innerHTML =
                        '<p class="resource-meta">No se pudo cargar el índice editorial.</p>';
                }
            });
    }

    function buildNavLinks(surfaces) {
        return (surfaces || [])
            .filter(function (surface) {
                return surface.nav_primary && surface.path && surface.nav_label;
            })
            .map(function (surface) {
                return { href: surface.path, label: surface.nav_label };
            });
    }

    window.CASiteSurface = {
        mountHomeSurfaces: mountHomeSurfaces,
        buildNavLinks: buildNavLinks,
        pickHomeResources: pickHomeResources,
        renderResourceGrid: renderResourceGrid,
        renderNarrativeTeaser: renderNarrativeTeaser,
        renderCasosStrip: renderCasosStrip,
    };
})();