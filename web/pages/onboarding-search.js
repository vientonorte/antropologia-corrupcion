/**
 * pages/onboarding-search.js — Búsqueda onboarding en landing (≤3 resultados)
 */
(function () {
    'use strict';

    var suggestionIndex = [];
    var debounceTimer = null;
    var selectedSuggest = -1;
    var searchEngine = null;
    var MAX_PUBLIC_RESULTS = 3;
    var MAX_SUGGESTIONS = 8;

    var input = document.getElementById('search-input');
    var dropdown = document.getElementById('suggest-dropdown');
    var resultsSection = document.getElementById('results-section');
    var resultsList = document.getElementById('results-list');
    var resultsCount = document.getElementById('results-count');
    var resultsQuery = document.getElementById('results-query');
    var moreResults = document.getElementById('more-results');
    var dataStatus = document.getElementById('data-status');

    function escapeHtml(str) {
        if (window.CAAtoms && window.CAAtoms.dom) return window.CAAtoms.dom.escapeHtml(str);
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function fuenteLabel(id) {
        return (window.FUENTE_LABELS && window.FUENTE_LABELS[id]) || id || '';
    }

    function fuenteColor(id) {
        return (window.FUENTE_COLORS && window.FUENTE_COLORS[id]) || '#888';
    }

    function setStatus(msg) {
        if (!dataStatus) return;
        dataStatus.textContent = msg;
        dataStatus.style.display = msg ? 'block' : 'none';
    }

    function loadData() {
        if (!input) return;
        setStatus('Cargando fuentes para onboarding…');

        var loader = window.CADataLoader
            ? window.CADataLoader.loadCorpusBundle({ includeHuella: false })
            : Promise.reject(new Error('CADataLoader no disponible'));

        loader
            .then(function (bundle) {
                var registros = bundle.fuentes || [];
                var bcnRegistros = bundle.bcnRecords || [];
                var casos = bundle.casos || [];

                if (typeof window.FrictionSearchEngine === 'function') {
                    searchEngine = new window.FrictionSearchEngine({
                        registros: registros.concat(bcnRegistros),
                        casos: casos,
                    });
                }

                buildSuggestionIndex(casos, registros, bcnRegistros);
                if (window.CABasesConsultadas && window.CABasesConsultadas.buildFromBundle) {
                    var report = window.CABasesConsultadas.buildFromBundle(bundle);
                    window.CABasesConsultadas.mountCompactLine('search-sources', report);
                }
                setStatus('');
            })
            .catch(function (err) {
                console.error('Error cargando datos:', err);
                setStatus('Error al cargar las fuentes de onboarding. Intenta recargar la página.');
            });
    }

    function buildSuggestionIndex(casos, registros, bcnRegistros) {
        suggestionIndex = [];
        var seen = {};

        function addEntry(name, source, sourceColor) {
            var key = (name || '').toLowerCase().trim();
            if (!key || key.length < 2 || seen[key]) return;
            seen[key] = true;
            suggestionIndex.push({ name: name.trim(), source: source, color: sourceColor });
        }

        casos.forEach(function (c) {
            (c.actores || []).forEach(function (a) {
                addEntry(a, 'caso', '#c8a96e');
            });
            (c.instituciones || []).forEach(function (i) {
                addEntry(i, 'caso', '#4a7fa5');
            });
            addEntry(c.titulo, 'caso', '#c8a96e');
        });

        registros.forEach(function (r) {
            addEntry(r.titulo, fuenteLabel(r.fuente), fuenteColor(r.fuente));
            if (r.institucion) addEntry(r.institucion, fuenteLabel(r.fuente), fuenteColor(r.fuente));
            (r.actores_lobby || []).forEach(function (a) {
                addEntry(a, fuenteLabel(r.fuente), fuenteColor(r.fuente));
            });
        });

        bcnRegistros.forEach(function (r) {
            addEntry(r.titulo, fuenteLabel('bcn'), fuenteColor('bcn'));
            (r.actores_lobby || []).forEach(function (a) {
                addEntry(a, fuenteLabel('bcn'), fuenteColor('bcn'));
            });
        });
    }

    function normalize(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .trim();
    }

    function filterSuggestions(query) {
        var q = normalize(query);
        if (q.length < 2) return [];
        var tokens = q.split(/\s+/);
        return suggestionIndex
            .filter(function (item) {
                var norm = normalize(item.name);
                return tokens.every(function (t) {
                    return norm.indexOf(t) !== -1;
                });
            })
            .slice(0, MAX_SUGGESTIONS);
    }

    function renderSuggestions(items) {
        if (!dropdown) return;
        selectedSuggest = -1;
        if (!items.length) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        dropdown.innerHTML = items
            .map(function (item, i) {
                return (
                    '<div class="suggest-item" data-index="' +
                    i +
                    '">' +
                    '<span class="suggest-item-name">' +
                    escapeHtml(item.name) +
                    '</span>' +
                    '<span class="suggest-badge" style="background:' +
                    item.color +
                    '">' +
                    escapeHtml(item.source) +
                    '</span>' +
                    '</div>'
                );
            })
            .join('');
        dropdown.classList.add('active');
    }

    function frictionColor(score) {
        if (score >= 0.85) return '#c85f4a';
        if (score >= 0.7) return '#e8b84b';
        if (score >= 0.45) return '#c8a96e';
        return '#4a7fa5';
    }

    function performSearch(query) {
        if (!dropdown || !resultsSection) return;
        dropdown.classList.remove('active');
        if (!query || query.trim().length < 2) {
            resultsSection.classList.remove('active');
            return;
        }

        var scored = [];
        if (searchEngine) {
            scored = searchEngine
                .search({ query: query, fuente: 'all', caso: 'all', tipo: 'all' })
                .map(function (r) {
                    return {
                        registro: r.registro,
                        frictionScore: r.frictionScore || 0,
                    };
                });
        }

        scored.sort(function (a, b) {
            return b.frictionScore - a.frictionScore;
        });
        renderResults(scored, query);
    }

    function renderResults(scored, query) {
        resultsSection.classList.add('active');
        resultsCount.textContent = scored.length;
        resultsQuery.textContent = '«' + query + '»';
        resultsList.innerHTML = '';

        if (!scored.length) {
            resultsList.innerHTML =
                '<p style="color:var(--dim);font-size:14px;font-family:var(--font-mono);padding:24px 0">Sin resultados para «' +
                escapeHtml(query) +
                '» en onboarding.</p>';
            moreResults.classList.remove('active');
            return;
        }

        scored.slice(0, MAX_PUBLIC_RESULTS).forEach(function (item) {
            var reg = item.registro;
            var fs = item.frictionScore;
            var color = frictionColor(fs);
            var fuente = reg.fuente || 'desconocida';
            var badgeColor = fuenteColor(fuente);
            var label = fuenteLabel(fuente);
            var desc =
                (reg.capa_oficial || '').length > 150
                    ? reg.capa_oficial.substring(0, 150) + '…'
                    : reg.capa_oficial || '—';
            var stateBadges = '';
            if (window.CABasesConsultadas && window.CABasesConsultadas.buildFromBundle) {
                var report = window.CABasesConsultadas.buildFromBundle(
                    window.CADataLoader && window.CADataLoader.getCached
                        ? window.CADataLoader.getCached()
                        : null,
                );
                if (report) {
                    stateBadges = window.CABasesConsultadas.renderRecordBadges(reg, report);
                }
            }

            var card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML =
                '<div class="result-card-top">' +
                '<div class="result-card-title">' +
                escapeHtml(reg.titulo) +
                '</div>' +
                '<span class="result-fuente-badge" style="background:' +
                badgeColor +
                '">' +
                escapeHtml(label) +
                '</span>' +
                '</div>' +
                '<div class="friction-row">' +
                '<span class="friction-label">Fricción</span>' +
                '<div class="friction-track"><div class="friction-fill" style="width:' +
                fs * 100 +
                '%;background:' +
                color +
                '"></div></div>' +
                '<span class="friction-value">' +
                fs.toFixed(2) +
                '</span>' +
                '</div>' +
                (stateBadges
                    ? '<div style="margin:8px 0">' + stateBadges + '</div>'
                    : '') +
                '<p class="result-description">' +
                escapeHtml(desc) +
                '</p>' +
                '<a class="result-cta" href="buscador.html">Profundizar en búsqueda avanzada →</a>';

            resultsList.appendChild(card);
        });

        moreResults.classList.toggle('active', scored.length > MAX_PUBLIC_RESULTS);
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function wireEvents() {
        if (!input) return;

        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                renderSuggestions(filterSuggestions(input.value));
            }, 300);
        });

        input.addEventListener('keydown', function (e) {
            var items = dropdown ? dropdown.querySelectorAll('.suggest-item') : [];
            if (!items.length) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch(input.value);
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggest = Math.min(selectedSuggest + 1, items.length - 1);
                updateSelected(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggest = Math.max(selectedSuggest - 1, -1);
                updateSelected(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggest >= 0 && items[selectedSuggest]) {
                    var name = items[selectedSuggest].querySelector('.suggest-item-name').textContent;
                    input.value = name;
                    performSearch(name);
                } else {
                    performSearch(input.value);
                }
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('active');
                selectedSuggest = -1;
            }
        });

        if (dropdown) {
            dropdown.addEventListener('click', function (e) {
                var item = e.target.closest('.suggest-item');
                if (!item) return;
                var name = item.querySelector('.suggest-item-name').textContent;
                input.value = name;
                performSearch(name);
            });
        }

        document.addEventListener('click', function (e) {
            if (!e.target.closest('#search-wrap')) {
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    }

    function updateSelected(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('selected', i === selectedSuggest);
        }
    }

    function boot() {
        wireEvents();
        loadData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();