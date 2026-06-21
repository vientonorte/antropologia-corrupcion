/**
 * lib/huellaDigital.js
 * Seguimiento de huella digital pública — cruza fuentes-oficiales + índice huella
 */
(function () {
    'use strict';

    function fuenteLabel(source) {
        if (window.FUENTE_LABELS && window.FUENTE_LABELS[source]) {
            return window.FUENTE_LABELS[source];
        }
        var fallback = {
            bcn: 'BCN',
            infolobby: 'InfoLobby',
            transparencia: 'Transparencia',
            leychile: 'LeyChile',
            seia: 'SEIA',
            compraspublicas: 'ComprasPúblicas',
            cmf: 'CMF',
            sii: 'SII',
        };
        return fallback[source] || source;
    }

    function resolveDataPath(filename) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function escapeHtml(str) {
        if (window.CAAtoms && window.CAAtoms.dom && window.CAAtoms.dom.escapeHtml) {
            return window.CAAtoms.dom.escapeHtml(str);
        }
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fmtDate(d) {
        if (!d) return '—';
        return d.length >= 10 ? d.substring(0, 10) : d;
    }

    function buildBuscadorUrl(params) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        var q = new URLSearchParams();
        Object.keys(params || {}).forEach(function (key) {
            if (params[key] != null && params[key] !== '') {
                q.set(key, String(params[key]));
            }
        });
        var qs = q.toString();
        return base + 'buscador.html' + (qs ? '?' + qs : '');
    }

    function findEntidadForCaso(huella, casoId) {
        if (!huella || !huella.entidades || !casoId) return null;
        return (
            huella.entidades.find(function (e) {
                return (e.casos_relacionados || []).indexOf(casoId) !== -1;
            }) || null
        );
    }

    function findEntidadByQuery(huella, query) {
        if (!huella || !huella.entidades || !query) return null;
        var al = query.toLowerCase();
        return (
            huella.entidades.find(function (e) {
                if (e.nombre && e.nombre.toLowerCase().indexOf(al) !== -1) return true;
                if (
                    e.aliases &&
                    e.aliases.some(function (a) {
                        return a.toLowerCase().indexOf(al) !== -1;
                    })
                ) {
                    return true;
                }
                return false;
            }) || null
        );
    }

    function recordMatches(record, term) {
        var al = term.toLowerCase();
        if (!al || al.length < 2) return false;
        if (record.titulo && record.titulo.toLowerCase().indexOf(al) !== -1) return true;
        if (record.capa_oficial && record.capa_oficial.toLowerCase().indexOf(al) !== -1) return true;
        if (record.institucion && record.institucion.toLowerCase().indexOf(al) !== -1) return true;
        if (
            record.actores_lobby &&
            record.actores_lobby.some(function (a) {
                return a.toLowerCase().indexOf(al) !== -1;
            })
        ) {
            return true;
        }
        if (
            record.keywords &&
            record.keywords.some(function (k) {
                return k.toLowerCase().indexOf(al) !== -1;
            })
        ) {
            return true;
        }
        if (
            record.tags &&
            record.tags.some(function (t) {
                return t.toLowerCase().indexOf(al) !== -1;
            })
        ) {
            return true;
        }
        return false;
    }

    function collectEvents(searchTerms, fuentes, bcnRecords, registrosIds) {
        var events = [];
        var idSet = {};
        if (registrosIds && registrosIds.length) {
            registrosIds.forEach(function (id) {
                idSet[id] = true;
            });
        }

        function pushEvent(rec, source) {
            if (registrosIds && registrosIds.length && !idSet[rec.id]) return;
            if (!registrosIds || !registrosIds.length) {
                var matched = searchTerms.some(function (term) {
                    return recordMatches(rec, term);
                });
                if (!matched) return;
            }
            events.push({
                date: rec.fecha || '',
                source: source || rec.fuente || 'desconocida',
                title: rec.titulo || rec.id,
                desc: rec.capa_oficial || rec.descripcion || '',
                friction: rec.tipo_friccion || '',
                id: rec.id,
                url: rec.url || '',
                frictionScore: typeof rec.friction_score === 'number' ? rec.friction_score : null,
                verificado: rec.verificado === true,
                estado_verificacion: rec.estado_verificacion || null,
                etapa_actual: rec.etapa_actual || null,
                official_score:
                    typeof rec.official_score === 'number' ? rec.official_score : null,
            });
        }

        (fuentes || []).forEach(function (f) {
            pushEvent(f, f.fuente);
        });
        (bcnRecords || []).forEach(function (b) {
            pushEvent(b, 'bcn');
        });

        events.sort(function (a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });
        return events;
    }

    function countSources(events) {
        var s = {};
        events.forEach(function (e) {
            s[e.source] = true;
        });
        return Object.keys(s).length;
    }

    function normalizeFuentes(fuentesRaw) {
        if (Array.isArray(fuentesRaw)) return fuentesRaw;
        if (!fuentesRaw) return [];
        return fuentesRaw.registros || fuentesRaw.fuentes || [];
    }

    function normalizeBcnRecords(bcnData) {
        if (!bcnData) return [];
        if (window.CADataLoader && window.CADataLoader.normalizeBcnRecords) {
            return window.CADataLoader.normalizeBcnRecords(bcnData);
        }
        if (typeof window.normalizeBcnDataset === 'function') {
            return window.normalizeBcnDataset(bcnData);
        }
        return [];
    }

    function normalizeCasos(casosInput) {
        if (!casosInput) return [];
        if (Array.isArray(casosInput)) return casosInput;
        return casosInput.casos || [];
    }

    function resolveContext(options, huella, casos) {
        var caso = null;
        var entidad = null;
        var searchTerms = [];
        var registrosIds = null;

        if (options.casoId && casos && casos.length) {
            caso = casos.find(function (c) {
                return c.id === options.casoId;
            });
            if (caso) {
                searchTerms.push(caso.titulo);
                (caso.actores || []).forEach(function (a) {
                    searchTerms.push(a);
                });
                (caso.instituciones || []).forEach(function (i) {
                    searchTerms.push(i);
                });
                entidad = findEntidadForCaso(huella, caso.id);
            }
        }

        if (!entidad && options.query) {
            entidad = findEntidadByQuery(huella, options.query);
            searchTerms.push(options.query);
        }

        if (entidad) {
            if (!searchTerms.length) searchTerms.push(entidad.nombre);
            if (entidad.registros_relacionados && entidad.registros_relacionados.length) {
                registrosIds = entidad.registros_relacionados.slice();
            }
        }

        searchTerms = searchTerms.filter(function (t, i, arr) {
            return t && arr.indexOf(t) === i;
        });

        var label =
            (caso && caso.titulo) ||
            (entidad && entidad.nombre) ||
            options.query ||
            'Entidad';

        return {
            caso: caso,
            entidad: entidad,
            label: label,
            searchTerms: searchTerms,
            registrosIds: registrosIds,
        };
    }

    function renderTraces(huella, entidad) {
        if (!entidad || !huella.trazas) return '';
        var trazas = huella.trazas.filter(function (t) {
            return t.entidades && t.entidades.indexOf(entidad.id) !== -1;
        });
        if (!trazas.length) return '';

        var html =
            '<div class="ca-huella__trazas">' +
            '<h3 class="ca-huella__trazas-title">Trazas de investigación</h3>';
        trazas.forEach(function (t) {
            html += '<div class="ca-huella__traza">';
            html += '<p>' + escapeHtml(t.descripcion) + '</p>';
            if (t.pasos_llm && t.pasos_llm.length) {
                html += '<ol>';
                t.pasos_llm.forEach(function (p) {
                    html += '<li>' + escapeHtml(p) + '</li>';
                });
                html += '</ol>';
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    function renderHTML(ctx, events, huella) {
        var entidad = ctx.entidad;
        var label = ctx.label;

        if (!events.length) {
            return (
                '<div class="ca-huella ca-huella--empty" role="status">' +
                '<div class="ca-huella__empty-icon" aria-hidden="true">⊘</div>' +
                '<p>No hay registros públicos cruzados para <strong>' +
                escapeHtml(label) +
                '</strong>.</p>' +
                '<p class="ca-huella__hint">Prueba ampliar la búsqueda en registros o consulta el espacio privado para seguimientos personalizados.</p>' +
                '</div>'
            );
        }

        var avgFriction = 0;
        var frictionCount = 0;
        events.forEach(function (e) {
            if (typeof e.frictionScore === 'number') {
                avgFriction += e.frictionScore;
                frictionCount++;
            }
        });
        if (frictionCount) avgFriction = avgFriction / frictionCount;

        var scoreColor =
            avgFriction > 0.7 ? 'var(--crit)' : avgFriction > 0.4 ? 'var(--etica)' : 'var(--mat)';

        var html = '<div class="ca-huella">';
        html += '<header class="ca-huella__header">';
        html += '<h2 class="ca-huella__title">Huella digital: ' + escapeHtml(label) + '</h2>';

        if (ctx.caso) {
            html +=
                '<p class="ca-huella__caso-link">' +
                '<a href="index.html?caso=' +
                escapeHtml(ctx.caso.id) +
                '">Ver caso en el grafo →</a></p>';
        }

        if (entidad) {
            html +=
                '<p class="ca-huella__meta">' +
                escapeHtml((entidad.tipo || '').replace(/_/g, ' ')) +
                ' · Fricción: <strong>' +
                escapeHtml(entidad.nivel_friccion || '—') +
                '</strong></p>';
            if (entidad.atributos_huella && entidad.atributos_huella.length) {
                html += '<div class="ca-huella__tags">';
                entidad.atributos_huella.forEach(function (a) {
                    html += '<span class="ca-huella__tag">' + escapeHtml(a) + '</span>';
                });
                html += '</div>';
            }
        }

        html +=
            '<p class="ca-huella__stats">' +
            events.length +
            ' registros en ' +
            countSources(events) +
            ' fuentes</p>';

        if (avgFriction > 0) {
            html +=
                '<div class="ca-huella__score" aria-label="Fricción agregada ' +
                avgFriction.toFixed(2) +
                '">' +
                '<span>Fricción agregada</span>' +
                '<div class="ca-huella__score-bar"><div class="ca-huella__score-fill" style="width:' +
                avgFriction * 100 +
                '%;background:' +
                scoreColor +
                '"></div></div>' +
                '<span class="ca-huella__score-val">' +
                avgFriction.toFixed(2) +
                '</span></div>';
        }
        html += '</header>';

        html += '<div class="ca-huella__timeline" role="list">';
        events.forEach(function (ev) {
            html += '<article class="ca-huella__event" role="listitem">';
            html += '<div class="ca-huella__event-meta">';
            html += '<time datetime="' + escapeHtml(ev.date) + '">' + fmtDate(ev.date) + '</time>';
            html +=
                '<span class="ca-huella__source ca-huella__source--' +
                escapeHtml(ev.source) +
                '">' +
                escapeHtml(fuenteLabel(ev.source)) +
                '</span>';
            html += '</div>';
            if (ev.url) {
                html +=
                    '<h3 class="ca-huella__event-title"><a href="' +
                    escapeHtml(ev.url) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    escapeHtml(ev.title) +
                    '</a></h3>';
            } else {
                html += '<h3 class="ca-huella__event-title">' + escapeHtml(ev.title) + '</h3>';
            }
            if (ev.desc) {
                html += '<p class="ca-huella__event-desc">' + escapeHtml(ev.desc.substring(0, 320)) + '</p>';
            }
            if (ev.friction) {
                html +=
                    '<span class="ca-huella__event-friction">tipo: ' + escapeHtml(ev.friction) + '</span>';
            }
            var badgeBits = [];
            if (ev.verificado === true) {
                badgeBits.push('<span class="ca-bases-pill ca-bases-pill--ok">Verificado</span>');
            } else if (ev.verificado === false) {
                badgeBits.push('<span class="ca-bases-pill ca-bases-pill--warn">Sin verificar</span>');
            }
            if (ev.estado_verificacion) {
                badgeBits.push(
                    '<span class="ca-bases-pill ca-bases-pill--verif">' +
                        escapeHtml(ev.estado_verificacion) +
                        '</span>',
                );
            }
            if (ev.etapa_actual) {
                badgeBits.push(
                    '<span class="ca-bases-pill ca-bases-pill--etapa">' +
                        escapeHtml(ev.etapa_actual) +
                        '</span>',
                );
            }
            if (ev.official_score != null) {
                badgeBits.push(
                    '<span class="ca-bases-pill ca-bases-pill--score">Conf. ' +
                        Math.round(ev.official_score * 100) +
                        '%</span>',
                );
            }
            if (badgeBits.length) {
                html +=
                    '<div class="ca-huella__event-badges" role="list">' +
                    badgeBits.join('') +
                    '</div>';
            }
            html += '</article>';
        });
        html += '</div>';

        html += renderTraces(huella, entidad);
        html +=
            '<footer class="ca-huella__footer">' +
            '<span class="ca-epistemic ca-epistemic--hecho">Hecho documentado</span> ' +
            'Índice curado en <code>huella-digital-publica.json</code> — no scraping en vivo.' +
            '</footer>';
        html += '</div>';
        return html;
    }

    function renderSidebarPreview(ctx, events, huella, options) {
        options = options || {};
        if (!ctx) return '';
        if (!ctx.entidad && (!events || !events.length)) return '';

        var label = ctx.label;
        var huellaParams = { huella: '1' };
        if (ctx.caso && ctx.caso.id) huellaParams.caso = ctx.caso.id;
        if (options.query) huellaParams.q = options.query;
        else if (ctx.entidad && ctx.entidad.nombre) huellaParams.q = ctx.entidad.nombre;

        var huellaUrl = buildBuscadorUrl(huellaParams);

        var html =
            '<div class="ca-huella-sidebar" role="complementary" aria-label="Vista previa huella digital">';
        html += '<div class="ca-huella-sidebar__label">Huella digital</div>';
        html += '<p class="ca-huella-sidebar__entity">' + escapeHtml(label) + '</p>';

        if (ctx.entidad) {
            html +=
                '<p class="ca-huella-sidebar__meta">' +
                escapeHtml((ctx.entidad.tipo || '').replace(/_/g, ' ')) +
                ' · ' +
                escapeHtml(ctx.entidad.nivel_friccion || '—') +
                '</p>';
        }

        if (events && events.length) {
            html +=
                '<p class="ca-huella-sidebar__stats">' +
                events.length +
                ' registro' +
                (events.length !== 1 ? 's' : '') +
                ' en ' +
                countSources(events) +
                ' fuentes</p>';
            html += '<ul class="ca-huella-sidebar__events">';
            events.slice(0, 3).forEach(function (ev) {
                var title = ev.title || ev.id || '';
                html += '<li>';
                html += '<time datetime="' + escapeHtml(ev.date) + '">' + fmtDate(ev.date) + '</time> ';
                html += escapeHtml(title.length > 56 ? title.substring(0, 56) + '…' : title);
                html += '</li>';
            });
            html += '</ul>';
        }

        html +=
            '<a class="ca-huella-sidebar__link" href="' +
            escapeHtml(huellaUrl) +
            '" data-ca-huella-expand="1">Ver huella completa →</a>';
        html += '</div>';
        return html;
    }

    function renderFromData(data, options) {
        options = options || {};
        var huella = data.huella || { entidades: [], trazas: [] };
        var fuentes = data.fuentes
            ? normalizeFuentes(data.fuentes)
            : data.fuentesRaw
              ? normalizeFuentes(data.fuentesRaw)
              : [];
        var bcnRecords = data.bcnRecords
            ? data.bcnRecords
            : normalizeBcnRecords(data.bcn || data.bcnData || {});
        var casos = normalizeCasos(data.casos);

        var ctx = resolveContext(options, huella, casos);
        var events = collectEvents(ctx.searchTerms, fuentes, bcnRecords, ctx.registrosIds);
        var html = renderHTML(ctx, events, huella);

        return { html: html, ctx: ctx, events: events };
    }

    function loadAndRender(container, options) {
        if (!container) return Promise.resolve();

        options = options || {};
        container.setAttribute('aria-busy', 'true');
        container.innerHTML =
            '<p class="ca-huella__loading">Cruzando huella digital en fuentes públicas…</p>';

        function finish(rendered) {
            container.innerHTML = rendered.html;
            container.setAttribute('aria-busy', 'false');
            return rendered;
        }

        function fail(err) {
            container.innerHTML =
                '<div class="ca-huella ca-huella--error" role="alert">' +
                '<p>Error al cargar huella digital.</p>' +
                '<p><small>' +
                escapeHtml(err.message) +
                '</small></p></div>';
            container.setAttribute('aria-busy', 'false');
        }

        if (options.preloaded || options.bundle) {
            try {
                return Promise.resolve(finish(renderFromData(options.preloaded || options.bundle, options)));
            } catch (err) {
                fail(err);
                return Promise.resolve();
            }
        }

        var loadPromise = window.CADataLoader
            ? window.CADataLoader.loadCorpusBundle()
            : Promise.all([
                  fetch(resolveDataPath('huella-digital-publica.json')).then(function (r) {
                      return r.ok ? r.json() : { entidades: [], trazas: [] };
                  }),
                  fetch(resolveDataPath('fuentes-oficiales.json')).then(function (r) {
                      return r.ok ? r.json() : [];
                  }),
                  fetch(resolveDataPath('bcn-legislativo.json')).then(function (r) {
                      return r.ok ? r.json() : {};
                  }),
                  fetch(resolveDataPath('casos.json')).then(function (r) {
                      return r.ok ? r.json() : { casos: [] };
                  }),
              ]).then(function (results) {
                  var fuentesRaw = results[1];
                  var casosData = results[3];
                  var registros = normalizeFuentes(fuentesRaw);
                  var bcnRecords = normalizeBcnRecords(results[2]);
                  var casos = casosData.casos || casosData;
                  var bundle = {
                      huella: results[0],
                      fuentesRaw: fuentesRaw,
                      fuentes: registros,
                      bcn: results[2],
                      bcnRecords: bcnRecords,
                      casos: casos,
                      casosData: casosData,
                      allRecords: registros.concat(bcnRecords),
                  };
                  if (window.CACasoPublico && window.CACasoPublico.prepareCorpusBundle) {
                      return window.CACasoPublico.prepareCorpusBundle(bundle);
                  }
                  return bundle;
              });

        return loadPromise
            .then(function (bundle) {
                return finish(renderFromData(bundle, options));
            })
            .catch(fail);
    }

    window.CAHuellaDigital = {
        loadAndRender: loadAndRender,
        renderFromData: renderFromData,
        renderSidebarPreview: renderSidebarPreview,
        renderHTML: renderHTML,
        collectEvents: collectEvents,
        recordMatches: recordMatches,
        normalizeFuentes: normalizeFuentes,
        normalizeBcnRecords: normalizeBcnRecords,
        findEntidadForCaso: findEntidadForCaso,
        findEntidadByQuery: findEntidadByQuery,
        buildBuscadorUrl: buildBuscadorUrl,
        resolveContext: resolveContext,
        countSources: countSources,
    };
})();