/**
 * Organism: demo de fricción precargada — inicio público
 */
(function () {
    'use strict';

    function esc(str) {
        if (window.CAAtoms && window.CAAtoms.dom) return window.CAAtoms.dom.escapeHtml(str);
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fuenteLabel(id) {
        return (window.FUENTE_LABELS && window.FUENTE_LABELS[id]) || id || '';
    }

    function fuenteColor(id) {
        return (window.FUENTE_COLORS && window.FUENTE_COLORS[id]) || '#888';
    }

    function frictionColor(score) {
        if (score >= 0.85) return '#c85f4a';
        if (score >= 0.7) return '#e8b84b';
        if (score >= 0.45) return '#c8a96e';
        return '#4a7fa5';
    }

    function findTopRecord(bundle) {
        if (!bundle || typeof window.FrictionSearchEngine !== 'function') return null;

        var engine = new window.FrictionSearchEngine({
            registros: (bundle.allRecords || []).slice(),
            casos: bundle.casos || [],
            sourceConfig: bundle.sourceConfig,
        });

        var results = engine.search({ query: '', sort: 'friction' });
        if (!results.length) return null;

        var top = results[0];
        return {
            registro: top.registro,
            frictionScore: top.frictionScore || 0,
            casoVinculado: top.casoVinculado,
        };
    }

    function renderCard(item, report) {
        if (!item || !item.registro) return '';

        var reg = item.registro;
        var fs = item.frictionScore;
        var color = frictionColor(fs);
        var fuente = reg.fuente || 'desconocida';
        var badgeColor = fuenteColor(fuente);
        var label = fuenteLabel(fuente);
        var desc =
            (reg.capa_oficial || '').length > 180
                ? reg.capa_oficial.substring(0, 180) + '…'
                : reg.capa_oficial || '—';
        var stateBadges = '';
        if (window.CABasesConsultadas && window.CABasesConsultadas.renderRecordBadges && report) {
            stateBadges = window.CABasesConsultadas.renderRecordBadges(reg, report);
        }

        var casoLabel = '';
        if (item.casoVinculado && item.casoVinculado.titulo) {
            casoLabel =
                '<p class="ca-friction-demo__caso">Caso vinculado: ' +
                esc(item.casoVinculado.titulo) +
                '</p>';
        }

        var buscadorHref =
            'buscador.html?q=' + encodeURIComponent(reg.titulo || '');

        return (
            '<article class="ca-friction-demo__card">' +
            '<header class="ca-friction-demo__head">' +
            '<span class="ca-friction-demo__kicker">Ejemplo de fricción</span>' +
            '<span class="ca-friction-demo__badge" style="background:' +
            esc(badgeColor) +
            '">' +
            esc(label) +
            '</span>' +
            '</header>' +
            '<h2 class="ca-friction-demo__title">' +
            esc(reg.titulo) +
            '</h2>' +
            '<div class="ca-friction-demo__row">' +
            '<span class="ca-friction-demo__row-label">Fricción</span>' +
            '<div class="ca-friction-demo__track">' +
            '<div class="ca-friction-demo__fill" style="width:' +
            fs * 100 +
            '%;background:' +
            color +
            '"></div>' +
            '</div>' +
            '<span class="ca-friction-demo__value">' +
            fs.toFixed(2) +
            '</span>' +
            '</div>' +
            (stateBadges ? '<div class="ca-friction-demo__badges">' + stateBadges + '</div>' : '') +
            '<p class="ca-friction-demo__desc">' +
            esc(desc) +
            '</p>' +
            casoLabel +
            '<a class="ca-friction-demo__cta" href="' +
            esc(buscadorHref) +
            '">Ver en búsqueda avanzada →</a>' +
            '</article>'
        );
    }

    function renderShell(cardHtml) {
        return (
            '<section class="ca-friction-demo" aria-labelledby="ca-friction-demo-title">' +
            '<h2 id="ca-friction-demo-title" class="visually-hidden">Ejemplo de fricción documentada</h2>' +
            '<p class="ca-friction-demo__lead">La distancia entre lo declarado y lo registrado — sin escribir nada.</p>' +
            cardHtml +
            '</section>'
        );
    }

    function mount(containerId, bundle) {
        var el = document.getElementById(containerId);
        if (!el || !bundle) return;

        var report =
            window.CABasesConsultadas && window.CABasesConsultadas.buildFromBundle
                ? window.CABasesConsultadas.buildFromBundle(bundle)
                : null;
        var top = findTopRecord(bundle);

        if (!top) {
            el.innerHTML = '';
            el.setAttribute('hidden', 'hidden');
            return;
        }

        el.removeAttribute('hidden');
        el.innerHTML = renderShell(renderCard(top, report));
    }

    window.CAOrganisms = window.CAOrganisms || {};
    window.CAOrganisms.frictionDemo = {
        findTopRecord: findTopRecord,
        renderCard: renderCard,
        mount: mount,
        frictionColor: frictionColor,
    };
})();