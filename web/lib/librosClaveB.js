/**
 * lib/librosClaveB.js — Registro de libros Clave B para capturas
 */
(function () {
    'use strict';

    function resolveDataPath(filename) {
        var base = window.location.pathname.replace(/\/[^/]*$/, '/');
        return base + 'data/' + filename;
    }

    function formatLibroLabel(libro) {
        if (!libro) return '';
        var parts = [];
        if (libro.autor) parts.push(libro.autor);
        if (libro.titulo) parts.push(libro.titulo);
        if (libro.anio) parts.push('(' + libro.anio + ')');
        return parts.join(', ');
    }

    function loadRegistry() {
        return fetch(resolveDataPath('libros-clave-b.json'))
            .then(function (r) {
                return r.ok ? r.json() : { libros: [] };
            })
            .then(function (data) {
                return {
                    meta: data._meta || {},
                    libros: Array.isArray(data.libros) ? data.libros : [],
                };
            })
            .catch(function () {
                return { meta: {}, libros: [] };
            });
    }

    function getLibroById(registry, id) {
        if (!registry || !registry.libros) return null;
        for (var i = 0; i < registry.libros.length; i++) {
            if (registry.libros[i].id === id) return registry.libros[i];
        }
        return null;
    }

    function populateSelect(selectEl, registry, options) {
        options = options || {};
        if (!selectEl || !registry) return;
        var current = selectEl.value;
        selectEl.innerHTML = '';
        if (options.allowEmpty !== false) {
            var empty = document.createElement('option');
            empty.value = '';
            empty.textContent = options.placeholder || 'Seleccionar libro…';
            selectEl.appendChild(empty);
        }
        registry.libros.forEach(function (libro) {
            var opt = document.createElement('option');
            opt.value = libro.id;
            opt.textContent = formatLibroLabel(libro);
            opt.dataset.fuente = formatLibroLabel(libro);
            selectEl.appendChild(opt);
        });
        if (current) selectEl.value = current;
    }

    window.CALibrosClaveB = {
        loadRegistry: loadRegistry,
        formatLibroLabel: formatLibroLabel,
        getLibroById: getLibroById,
        populateSelect: populateSelect,
    };
})();