/**
 * lib/buscadorAvanzado.js — Búsqueda avanzada (categorías E–I)
 */
(function() {
    'use strict';

    /* ── State ── */
    var allRecords = [];
    var casos = [];
    var huellaIndex = null;
    var registrosCache = [];
    var bcnNormCache = [];
    var activeCat = 'E';
    var query = '';
    var visibleCount = 5;
    var debounceTimer = null;
    var suggestDebounceTimer = null;
    var openDossierId = null;
    var sourceCheckboxes = [];
    var checkedSourcesCache = {};
    var hasSourceFilter = false;
    var catCounts = {};
    var corpusBundle = null;
    var sourceReport = null;

    var CAT_META = {
        E: {
            desc: 'Registros de transparencia, SEIA y otras instituciones públicas con deber de publicación activa.',
            desc_extendida: 'Capa institucional: lo que el Estado hace visible. Respuestas a solicitudes de transparencia, expedientes SEIA, resoluciones. El registro oficial como primera traducción de conflictos políticos a lenguaje administrativo.',
            fuentes: ['transparencia', 'seia'],
            ejemplos: ['Solicitud AFP carteras', 'Expediente consulta indígena', 'Resolución territorial'],
            filterFn: function(r) {
                return r.fuente === 'transparencia' || r.fuente === 'seia' || (r.institucion && r.tipo_friccion);
            }
        },
        F: {
            desc: 'Registros de lobby, audiencias con funcionarios y actores vinculados a la Comisión para el Mercado Financiero.',
            desc_extendida: 'Trazabilidad de actores: quién habla con quién. Audiencias de lobby, reuniones con reguladores, actores corporativos. El registro oficial de influencia que documenta qué voces tienen acceso institucional.',
            fuentes: ['infolobby', 'cmf'],
            ejemplos: ['Audiencia SURA-CMF', 'Lobby forestal-CONADI', 'Reunión SEA-energéticas'],
            filterFn: function(r) {
                return r.fuente === 'infolobby' || r.fuente === 'cmf' || (r.actores_lobby && r.actores_lobby.length > 0);
            }
        },
        G: {
            desc: 'Compras públicas, licitaciones y regulación financiera: trazabilidad de recursos estatales y mercados.',
            desc_extendida: 'Flujos de capital: cómo se mueve el dinero público y regulado. Licitaciones, adquisiciones, marcos regulatorios financieros. El registro contable que traduce decisiones políticas a transacciones.',
            fuentes: ['compraspublicas', 'cmf'],
            ejemplos: ['Licitación municipal', 'Regulación multifondos', 'Adquisición tecnológica'],
            filterFn: function(r) {
                return r.fuente === 'compraspublicas' || r.fuente === 'cmf';
            }
        },
        H: {
            desc: 'Boletines legislativos y leyes vigentes: historial normativo con trazabilidad parlamentaria.',
            desc_extendida: 'Genealogía normativa: cómo se construye la ley. Boletines en tramitación, leyes vigentes, decretos. El archivo jurídico que registra negociaciones parlamentarias y produce el marco legal que después se aplica con fricción.',
            fuentes: ['bcn', 'leychile'],
            ejemplos: ['Ley OIT 169', 'DS 66 consulta', 'Tramitación multifondos'],
            filterFn: function(r) {
                return r.fuente === 'bcn' || r.fuente === 'leychile';
            }
        },
        I: {
            desc: 'Registros vinculados a los 4 campos etnográficos de la tesis: SURA, La Negra, periodismo de datos y OIT 169.',
            desc_extendida: 'Punto de entrada analítico: registros oficiales que conectan directamente con los 4 casos etnográficos de la tesis doctoral. Evidencia documentada de mistranslation entre capas ética, institucional y material.',
            fuentes: [],
            ejemplos: ['Audiencias SURA con CMF', 'Solicitud transparencia territorios mapuche', 'SEIA con consulta previa'],
            filterFn: function(r) {
                // Filtrar por friccion_con apuntando a cualquier caso etnográfico
                var casoIds = ['sura-gobernanza-datos', 'la-negra-territorio-mapuche', 'periodismo-datos-chile', 'oit169-consulta-previa'];
                return r.friccion_con && casoIds.indexOf(r.friccion_con) !== -1;
            }
        }
    };

    function fuenteLabel(fuente) {
        if (window.FUENTE_LABELS && window.FUENTE_LABELS[fuente]) {
            return window.FUENTE_LABELS[fuente];
        }
        return fuente || '';
    }

    /* ── DOM refs ── */
    var $input = document.getElementById('searchInput');
    var $suggestList = document.getElementById('suggestList');
    var $catTabs = document.getElementById('catTabs');
    var $catDesc = document.getElementById('catDesc');
    var $resultsList = document.getElementById('resultsList');
    var $resultsStatus = document.getElementById('resultsStatus');
    var $btnMore = document.getElementById('btnMore');
    var $noResults = document.getElementById('noResults');
    var $filterYear = document.getElementById('filterYear');
    var $filterFriction = document.getElementById('filterFriction');
    var $frictionVal = document.getElementById('frictionVal');
    var $sourceChecks = document.getElementById('sourceChecks');
    var $filterToggle = document.getElementById('filterToggle');
    var $filterSidebar = document.getElementById('filterSidebar');
    var $huellaSidebarSection = document.getElementById('huellaSidebarSection');
    var $huellaSidebarPreview = document.getElementById('huellaSidebarPreview');
    var $filterOverlay = document.getElementById('filterOverlay');
    var $filterClose = document.getElementById('filterClose');
    var $loadingState = document.getElementById('loadingState');
    var $noResultsMsg = document.getElementById('noResultsMsg');
    var $btnExportCSV = document.getElementById('btnExportCSV');
    var suggestActiveIdx = -1;

    function sanitizeCatMeta() {
        if (!window.CACasoPublico || !window.CACasoPublico.shouldAnonymize()) return;
        var CP = window.CACasoPublico;
        Object.keys(CAT_META).forEach(function(cat) {
            if (CAT_META[cat].desc) CAT_META[cat].desc = CP.sanitizeText(CAT_META[cat].desc);
            if (CAT_META[cat].desc_extendida) {
                CAT_META[cat].desc_extendida = CP.sanitizeText(CAT_META[cat].desc_extendida);
            }
            if (Array.isArray(CAT_META[cat].ejemplos)) {
                CAT_META[cat].ejemplos = CAT_META[cat].ejemplos.map(CP.sanitizeText);
            }
        });
    }

    function applyFuenteFilterFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var fuenteId = params.get('fuente');
        if (!fuenteId || !sourceCheckboxes.length) return false;

        var found = false;
        sourceCheckboxes.forEach(function(cb) {
            var match = cb.value === fuenteId;
            cb.checked = match;
            if (match) found = true;
        });
        if (!found) {
            sourceCheckboxes.forEach(function(cb) {
                cb.checked = true;
            });
            return false;
        }
        syncSourceFilter();
        return true;
    }

    function applyDeepLinkFromUrl() {
        var params = new URLSearchParams(window.location.search);
        applyFuenteFilterFromUrl();

        var casoId = params.get('caso');
        if (!casoId) return;
        activeCat = 'I';
        document.querySelectorAll('.cat-tab').forEach(function(tab) {
            var isI = tab.dataset.cat === 'I';
            tab.classList.toggle('active', isI);
            tab.setAttribute('aria-selected', isI ? 'true' : 'false');
        });
        var caso = casos.find(function(c) { return c.id === casoId; });
        if (caso && $input && !$input.value) {
            query = caso.titulo;
            $input.value = caso.titulo;
        }
        if ($catDesc && CAT_META.I) {
            $catDesc.textContent = CAT_META.I.desc;
        }
    }

    /* ── Data loading ── */
    function init() {
        $loadingState.style.display = 'block';
        var loader = window.CADataLoader
            ? window.CADataLoader.loadCorpusBundle()
            : Promise.reject(new Error('CADataLoader no disponible'));

        loader.then(function(bundle) {
            sanitizeCatMeta();
            corpusBundle = bundle;
            window.CABuscadorCorpus = bundle;
            huellaIndex = bundle.huella || { entidades: [], trazas: [] };
            casos = bundle.casos || [];
            registrosCache = bundle.fuentes || [];
            bcnNormCache = bundle.bcnRecords || [];
            allRecords = bundle.allRecords || registrosCache.concat(bcnNormCache);

            if (window.CABasesConsultadas && window.CABasesConsultadas.buildFromBundle) {
                sourceReport = window.CABasesConsultadas.buildFromBundle(bundle);
                window.CABuscadorSourceReport = sourceReport;
                window.CABasesConsultadas.mountPanel('basesConsultadasPanel', sourceReport, {
                    onlyActivas: true,
                });
            }

            // Build "I" category filter using caso keywords
            var casoKeywords = [];
            casos.forEach(function(c) {
                ['etica', 'institucional', 'material'].forEach(function(layer) {
                    if (c[layer] && c[layer].keywords) {
                        casoKeywords = casoKeywords.concat(c[layer].keywords);
                    }
                });
                if (c.tags) casoKeywords = casoKeywords.concat(c.tags);
            });
            var kwSet = {};
            casoKeywords.forEach(function(kw) {
                kwSet[kw.toLowerCase()] = true;
            });

            CAT_META.I.filterFn = function(r) {
                var rKw = (r.keywords || []).concat(r.tags || []);
                for (var i = 0; i < rKw.length; i++) {
                    if (kwSet[rKw[i].toLowerCase()]) return true;
                }
                return !!r.friccion_con;
            };

            computeScores();
            buildCategoryCounts();
            buildYearFilter();
            buildSourceFilter();
            updateCategoryCounts();
            $loadingState.style.display = 'none';
            applyDeepLinkFromUrl();
            render();
            if (window.CABuscadorBoot && window.CABuscadorBoot.refreshHuellaFromUrl) {
                window.CABuscadorBoot.refreshHuellaFromUrl();
            }
        }).catch(function(err) {
            console.error('Error cargando datos:', err);
            $loadingState.style.display = 'none';
            $noResultsMsg.textContent = 'Error al cargar las fuentes de búsqueda avanzada. Intenta recargar la página.';
            $noResults.classList.remove('hidden');
        });
    }

    /* ── Friction scores ── */
    function computeScores() {
        var casosMap = {};
        casos.forEach(function(c) {
            casosMap[c.id] = c;
        });

        allRecords.forEach(function(r) {
            if (r._frictionScore !== undefined) return;
            var linked = r.friccion_con ? casosMap[r.friccion_con] : null;
            r._linkedCaso = linked || null;
            if (!linked || !window.frictionEngine || !window.frictionEngine.explainRecordFriction) {
                r._frictionScore = 0;
                return;
            }
            try {
                var expl = window.frictionEngine.explainRecordFriction(r, linked);
                r._frictionScore = expl.score || 0;
                r._frictionAudit = expl;
            } catch (e) {
                r._frictionScore = 0;
            }
        });
    }

    /* ── Filtering ── */
    function getFiltered() {
        var catFilter = CAT_META[activeCat].filterFn;
        var yearVal = $filterYear.value;
        var frictionMin = parseInt($filterFriction.value, 10) / 100;
        var checkedSources = checkedSourcesCache;
        var q = query.trim().toLowerCase();

        return allRecords.filter(function(r) {
            if (catFilter && !catFilter(r)) return false;
            if (yearVal !== 'all') {
                var rYear = (r.fecha || '').substring(0, 4);
                if (rYear !== yearVal) return false;
            }
            if (r._frictionScore < frictionMin) return false;
            if (hasSourceFilter && !checkedSources[r.fuente]) return false;
            if (q) {
                var haystack = [r.titulo, r.institucion, r.capa_oficial, (r.keywords || []).join(' '), (r.tags || []).join(' ')].join(' ').toLowerCase();
                if (haystack.indexOf(q) === -1) return false;
            }
            return true;
        }).sort(function(a, b) {
            return (b._frictionScore || 0) - (a._frictionScore || 0);
        });
    }

    /* ── Render ── */
    function render() {
        var filtered = getFiltered();
        visibleCount = 5;
        renderResults(filtered);
        updateHuellaSidebarPreview();
    }

    function updateHuellaSidebarPreview() {
        if (!$huellaSidebarPreview || !$huellaSidebarSection || !window.CAHuellaDigital) return;

        var q = query.trim();
        if (q.length < 2 || !huellaIndex) {
            $huellaSidebarPreview.innerHTML = '';
            $huellaSidebarSection.hidden = true;
            return;
        }

        var rendered = window.CAHuellaDigital.renderFromData(
            {
                huella: huellaIndex,
                fuentes: registrosCache,
                bcnRecords: bcnNormCache,
                casos: casos,
            },
            { query: q },
        );

        if (!rendered.ctx.entidad && (!rendered.events || !rendered.events.length)) {
            $huellaSidebarPreview.innerHTML = '';
            $huellaSidebarSection.hidden = true;
            return;
        }

        $huellaSidebarPreview.innerHTML = window.CAHuellaDigital.renderSidebarPreview(
            rendered.ctx,
            rendered.events,
            huellaIndex,
            { query: q },
        );
        $huellaSidebarSection.hidden = false;

        var expandLink = $huellaSidebarPreview.querySelector('[data-ca-huella-expand]');
        if (expandLink) {
            expandLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (rendered.ctx.caso && window.CABuscadorHuella && window.CABuscadorHuella.showForCaso) {
                    window.CABuscadorHuella.showForCaso(rendered.ctx.caso.id);
                    return;
                }
                var huellaTab = document.querySelector('.ca-view-tab[data-view="huella"]');
                if (huellaTab) huellaTab.click();
            });
        }
    }

    function renderResults(filtered) {
        var showing = filtered.slice(0, visibleCount);
        $resultsList.innerHTML = '';

        if (filtered.length === 0) {
            $noResults.classList.remove('hidden');
            $resultsStatus.textContent = '';
            $btnMore.classList.add('hidden');
            if ($btnExportCSV) $btnExportCSV.style.display = 'none';
            return;
        }
        $noResults.classList.add('hidden');
        $resultsStatus.textContent = filtered.length + ' resultado' + (filtered.length !== 1 ? 's' : '') + ' en búsqueda avanzada';
        if ($btnExportCSV) $btnExportCSV.style.display = 'block';

        showing.forEach(function(r, i) {
            var item = document.createElement('div');
            item.className = 'result-item';
            item.setAttribute('data-id', r.id);

            var score = r._frictionScore || 0;
            var pillClass = score >= 0.7 ? 'high' : score >= 0.4 ? 'mid' : 'low';
            var fecha = r.fecha || '—';
            var inst = r.institucion || fuenteLabel(r.fuente) || r.fuente || '';
            var cat = getRecordCategory(r);
            var catBadge = '<span class="cat-badge cat-' + cat + '" aria-label="Categoría ' + cat + '">' + cat + '</span>';
            var stateBadges = '';
            if (window.CABasesConsultadas && sourceReport) {
                stateBadges = window.CABasesConsultadas.renderRecordBadges(r, sourceReport);
            }

            var dossierId = 'dossier-' + esc(r.id);
            item.innerHTML =
                '<div class="result-row" role="button" tabindex="0" aria-expanded="false" aria-controls="' + dossierId + '">' +
                '<span class="result-idx">' + (i + 1) + '</span>' +
                '<span class="result-title">' + esc(r.titulo || r.id) + '</span>' +
                '<div class="result-meta">' +
                catBadge +
                '<span class="result-inst">' + esc(inst) + '</span>' +
                stateBadges +
                '<span class="friction-pill ' + pillClass + '">' + score.toFixed(2) + '</span>' +
                '<span class="result-date">' + esc(fecha) + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="dossier" id="' + dossierId + '" role="region" aria-label="Dossier ' + esc(r.titulo || r.id) + '">' + buildDossier(r) + '</div>';

            var row = item.querySelector('.result-row');

            function makeToggle(rid, rowEl) {
                return function() {
                    var expanded = rowEl.getAttribute('aria-expanded') === 'true';
                    rowEl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                    toggleDossier(rid);
                };
            }
            var handler = makeToggle(r.id, row);
            row.addEventListener('click', handler);
            row.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handler();
                }
            });

            $resultsList.appendChild(item);
        });

        if (openDossierId) {
            var d = document.getElementById('dossier-' + openDossierId);
            if (d) d.classList.add('open');
        }

        if (filtered.length > visibleCount) {
            $btnMore.classList.remove('hidden');
            $btnMore.textContent = 'Mostrar más resultados (' + (filtered.length - visibleCount) + ' restantes)';
        } else {
            $btnMore.classList.add('hidden');
        }
    }

    function buildDossier(r) {
        var metaHtml = '';
        if (window.CABasesConsultadas && sourceReport) {
            var stateBadges = window.CABasesConsultadas.renderRecordBadges(r, sourceReport);
            if (stateBadges) {
                metaHtml =
                    '<div class="dossier-source-meta" style="margin-bottom:12px;font-size:12px;">' +
                    '<span style="color:var(--dim);font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.06em;">Estado del registro</span><br>' +
                    stateBadges +
                    '</div>';
            }
        }
        if (r.estado_verificacion || r.etapa_actual) {
            metaHtml +=
                '<p style="font-size:11px;font-family:var(--font-mono);color:var(--muted);margin:0 0 12px;">' +
                (r.estado_verificacion ? 'Verificación: ' + esc(r.estado_verificacion) : '') +
                (r.estado_verificacion && r.etapa_actual ? ' · ' : '') +
                (r.etapa_actual ? 'Etapa: ' + esc(r.etapa_actual) : '') +
                '</p>';
        }

        var c = r._linkedCaso;
        if (!c) {
            return (
                metaHtml +
                '<div style="color:var(--dim);font-size:13px;padding:8px 0;">Sin caso vinculado para desplegar capas en búsqueda avanzada.</div>'
            );
        }

        var layers = ['etica', 'institucional', 'material'];
        var layerLabels = {
            etica: 'Ética',
            institucional: 'Institucional',
            material: 'Material'
        };
        var layerColors = {
            etica: 'var(--etica)',
            institucional: 'var(--inst)',
            material: 'var(--mat)'
        };
        var layerClass = {
            etica: 'etica',
            institucional: 'inst',
            material: 'mat'
        };

        var grid = '<div class="dossier-grid">';
        layers.forEach(function(l) {
            var data = c[l] || {};
            var kws = data.keywords || [];
            var kwHtml = kws.map(function(k) {
                return '<span class="kw-pill ' + layerClass[l] + '">' + esc(k) + '</span>';
            }).join('');

            grid +=
                '<div class="capa-col">' +
                '<div class="capa-header"><span class="capa-dot" style="background:' + layerColors[l] + '"></span>' + layerLabels[l] + '</div>' +
                '<div class="capa-text">' + esc(data.descripcion || data.titulo || '—') + '</div>' +
                '<div class="capa-keywords">' + kwHtml + '</div>' +
                '</div>';
        });
        grid += '</div>';

        // Friction breakdown
        var score = r._frictionScore || 0;
        var audit = r._frictionAudit || {};
        var friction =
            '<div class="dossier-friction">' +
            '<div class="df-score">' + score.toFixed(2) + '</div>' +
            '<div class="df-breakdown">' +
            'overlap: ' + ((audit.overlap !== undefined ? audit.overlap : '—')) +
            ' · marker: ' + ((audit.markerMatch !== undefined ? audit.markerMatch : (audit.marker !== undefined ? audit.marker : '—'))) +
            ' · tipo: ' + esc(r.tipo_friccion || c.friccion.tipo || '—') +
            '</div>' +
            '</div>';

        var grafoHref = 'index.html?caso=' + encodeURIComponent(c.id);
        var huellaHref = window.CAHuellaDigital
            ? window.CAHuellaDigital.buildBuscadorUrl({ caso: c.id, huella: '1' })
            : 'buscador.html?caso=' + encodeURIComponent(c.id) + '&huella=1';

        var actions =
            '<div class="dossier-actions">' +
            '<a href="' + esc(grafoHref) + '">Ver caso en el grafo →</a>' +
            '<a href="' + esc(huellaHref) + '">Huella digital →</a>' +
            '</div>';

        return metaHtml + grid + friction + actions;
    }

    function toggleDossier(id) {
        if (openDossierId === id) {
            var d = document.getElementById('dossier-' + id);
            if (d) d.classList.remove('open');
            openDossierId = null;
        } else {
            // close previous
            if (openDossierId) {
                var prev = document.getElementById('dossier-' + openDossierId);
                if (prev) prev.classList.remove('open');
            }
            var el = document.getElementById('dossier-' + id);
            if (el) el.classList.add('open');
            openDossierId = id;
        }
    }

    /* ── Autosuggest ── */
    function updateSuggest() {
        var q = $input.value.trim().toLowerCase();
        if (q.length < 2) {
            $suggestList.classList.remove('open');
            return;
        }

        var catFilter = CAT_META[activeCat].filterFn;
        var pool = allRecords.filter(function(r) {
            return !catFilter || catFilter(r);
        });

        var matches = [];
        for (var i = 0; i < pool.length && matches.length < 8; i++) {
            var haystack = [pool[i].titulo, pool[i].institucion, (pool[i].keywords || []).join(' ')].join(' ').toLowerCase();
            if (haystack.indexOf(q) !== -1) matches.push(pool[i]);
        }

        if (matches.length === 0) {
            $suggestList.classList.remove('open');
            return;
        }

        $suggestList.innerHTML = matches.map(function(m) {
            return '<div class="suggest-item" data-titulo="' + esc(m.titulo || m.id) + '">' +
                '<span>' + esc(m.titulo || m.id) + '</span>' +
                '<span class="sg-fuente">' + esc(fuenteLabel(m.fuente)) + '</span>' +
                '</div>';
        }).join('');
        $suggestList.classList.add('open');
    }

    /* ── Filters ── */
    function buildYearFilter() {
        var years = {};
        allRecords.forEach(function(r) {
            var y = (r.fecha || '').substring(0, 4);
            if (y && y.length === 4) years[y] = true;
        });
        var sorted = Object.keys(years).sort().reverse();
        $filterYear.innerHTML = '<option value="all">Todos</option>';
        sorted.forEach(function(y) {
            var opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            $filterYear.appendChild(opt);
        });
    }

    function syncSourceFilter() {
        checkedSourcesCache = {};
        sourceCheckboxes.forEach(function(cb) {
            if (cb.checked) checkedSourcesCache[cb.value] = true;
        });
        hasSourceFilter =
            sourceCheckboxes.length > 0 &&
            Object.keys(checkedSourcesCache).length < sourceCheckboxes.length;
    }

    function buildSourceFilter() {
        var fuenteSet = {};
        allRecords.forEach(function(r) {
            if (r.fuente) fuenteSet[r.fuente] = true;
        });
        var keys = Object.keys(fuenteSet).sort();
        $sourceChecks.innerHTML = '';
        sourceCheckboxes = [];
        keys.forEach(function(f) {
            var entry = sourceReport && window.CASourceRegistry
                ? window.CASourceRegistry.getEntryById(sourceReport, f)
                : null;
            var readiness = entry
                ? '<span class="ca-bases__readiness ca-bases__readiness--' + esc(entry.readiness) + '" style="font-size:8px;margin-left:4px">' + esc(entry.readinessLabel) + '</span>'
                : '';
            var count = entry ? ' <span style="color:var(--dim);font-size:10px">(' + entry.records + ')</span>' : '';
            var label = document.createElement('label');
            label.className = 'filter-check';
            label.innerHTML =
                '<input type="checkbox" value="' +
                esc(f) +
                '" checked> ' +
                esc(fuenteLabel(f) || f) +
                count +
                readiness;
            $sourceChecks.appendChild(label);
            sourceCheckboxes.push(label.querySelector('input'));
        });
        syncSourceFilter();
    }

    function buildCategoryCounts() {
        catCounts = {};
        ['E', 'F', 'G', 'H', 'I'].forEach(function(cat) {
            var filterFn = CAT_META[cat].filterFn;
            catCounts[cat] = filterFn ? allRecords.filter(filterFn).length : 0;
        });
    }

    /* ── Category counts ── */
    function updateCategoryCounts() {
        var cats = ['E', 'F', 'G', 'H', 'I'];
        cats.forEach(function(cat) {
            var count = catCounts[cat] || 0;
            var tab = $catTabs.querySelector('[data-cat="' + cat + '"]');
            if (tab) {
                var countEl = tab.querySelector('.cat-count');
                if (countEl) {
                    countEl.textContent = count;
                }
                // Update aria-label
                var desc = CAT_META[cat].desc;
                tab.setAttribute('aria-label', 'Categoría ' + cat + ': ' + desc.substring(0, 50) + '... - ' + count + ' resultados');
            }
        });
    }

    function getRecordCategory(r) {
        // Determine primary category for a record
        // Order matters: I > F > E > G > H
        if (CAT_META.I.filterFn && CAT_META.I.filterFn(r)) return 'I';
        if (CAT_META.F.filterFn && CAT_META.F.filterFn(r)) return 'F';
        if (CAT_META.E.filterFn && CAT_META.E.filterFn(r)) return 'E';
        if (CAT_META.G.filterFn && CAT_META.G.filterFn(r)) return 'G';
        if (CAT_META.H.filterFn && CAT_META.H.filterFn(r)) return 'H';
        return 'E'; // default
    }

    /* ── Escape HTML ── */
    function esc(s) {
        if (!s) return '';
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(s));
        return d.innerHTML;
    }

    /* ── Events ── */
    function attachEvents() {
        // Search input with debounce
        $input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                query = $input.value;
                openDossierId = null;
                render();
            }, 300);
            clearTimeout(suggestDebounceTimer);
            suggestDebounceTimer = setTimeout(updateSuggest, 120);
        });

        // Suggest click
        $suggestList.addEventListener('click', function(e) {
            var item = e.target.closest('.suggest-item');
            if (!item) return;
            $input.value = item.getAttribute('data-titulo');
            query = $input.value;
            $suggestList.classList.remove('open');
            openDossierId = null;
            render();
        });

        // Close suggest on blur
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) $suggestList.classList.remove('open');
        });

        // Category tabs
        $catTabs.addEventListener('click', function(e) {
            var tab = e.target.closest('.cat-tab');
            if (!tab) return;
            $catTabs.querySelectorAll('.cat-tab').forEach(function(t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            activeCat = tab.getAttribute('data-cat');
            $catDesc.textContent = CAT_META[activeCat].desc;
            openDossierId = null;
            render();
        });

        // Keyboard navigation for category tabs (Arrow keys)
        $catTabs.addEventListener('keydown', function(e) {
            var tab = e.target.closest('.cat-tab');
            if (!tab) return;
            
            var tabs = Array.from($catTabs.querySelectorAll('.cat-tab'));
            var currentIdx = tabs.indexOf(tab);
            var nextIdx = -1;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIdx = (currentIdx + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
            } else {
                return;
            }

            tabs[nextIdx].focus();
            tabs[nextIdx].click();
        });

        // Show more
        $btnMore.addEventListener('click', function() {
            visibleCount += 5;
            var filtered = getFiltered();
            renderResults(filtered);
        });

        // Export CSV
        if ($btnExportCSV) {
            $btnExportCSV.addEventListener('click', function() {
                var filtered = getFiltered();
                if (window.categoryExport && window.categoryExport.exportCategoryResults) {
                    window.categoryExport.exportCategoryResults(activeCat, filtered, {
                        sourceReport: sourceReport,
                    });
                }
            });
        }

        // Filters
        $filterYear.addEventListener('change', function() {
            openDossierId = null;
            render();
        });
        $filterFriction.addEventListener('input', function() {
            $frictionVal.textContent = (parseInt($filterFriction.value, 10) / 100).toFixed(2);
            openDossierId = null;
            render();
        });
        $sourceChecks.addEventListener('change', function() {
            syncSourceFilter();
            openDossierId = null;
            render();
        });

        // Mobile filter toggle + close
        function openFilters() {
            $filterSidebar.classList.add('open');
            $filterOverlay.classList.add('open');
            if ($filterClose) $filterClose.style.display = 'block';
            $filterToggle.setAttribute('aria-expanded', 'true');
        }

        function closeFilters() {
            $filterSidebar.classList.remove('open');
            $filterOverlay.classList.remove('open');
            if ($filterClose) $filterClose.style.display = 'none';
            $filterToggle.setAttribute('aria-expanded', 'false');
        }
        $filterToggle.setAttribute('aria-expanded', 'false');
        $filterToggle.addEventListener('click', function() {
            $filterSidebar.classList.contains('open') ? closeFilters() : openFilters();
        });
        $filterOverlay.addEventListener('click', closeFilters);
        if ($filterClose) $filterClose.addEventListener('click', closeFilters);

        // Keyboard nav en autosuggest
        $input.addEventListener('keydown', function(e) {
            var items = $suggestList.querySelectorAll('.suggest-item');
            if (!$suggestList.classList.contains('open') || !items.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                suggestActiveIdx = Math.min(suggestActiveIdx + 1, items.length - 1);
                items.forEach(function(it, i) {
                    it.classList.toggle('active', i === suggestActiveIdx);
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                suggestActiveIdx = Math.max(suggestActiveIdx - 1, -1);
                items.forEach(function(it, i) {
                    it.classList.toggle('active', i === suggestActiveIdx);
                });
            } else if (e.key === 'Enter' && suggestActiveIdx >= 0) {
                e.preventDefault();
                var chosen = items[suggestActiveIdx];
                if (chosen) {
                    $input.value = chosen.getAttribute('data-titulo');
                    query = $input.value;
                    $suggestList.classList.remove('open');
                    suggestActiveIdx = -1;
                    openDossierId = null;
                    render();
                }
            } else if (e.key === 'Escape') {
                $suggestList.classList.remove('open');
                suggestActiveIdx = -1;
            }
        });
    }

    /* ── Boot ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            attachEvents();
            init();
        });
    } else {
        attachEvents();
        init();
    }
})();