/**
 * Atom: utilidades DOM (escape, createElement)
 * No importa moléculas ni organismos.
 */
(function () {
    'use strict';

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function createEl(tag, className, attrs) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (attrs) {
            Object.keys(attrs).forEach(function (key) {
                if (key === 'text') el.textContent = attrs[key];
                else if (key === 'html') el.innerHTML = attrs[key];
                else el.setAttribute(key, attrs[key]);
            });
        }
        return el;
    }

    window.CAAtoms = window.CAAtoms || {};
    window.CAAtoms.dom = { escapeHtml: escapeHtml, createEl: createEl };
})();