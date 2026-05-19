(function() {
    'use strict';

    if (window.__CA_UNIFIED_SHELL__) {
        return;
    }
    window.__CA_UNIFIED_SHELL__ = true;

    function resolveBasePath() {
        return window.location.pathname.indexOf('/antropologia-corrupcion/') === 0 ?
            '/antropologia-corrupcion/' :
            '/';
    }

    function injectStyles() {
        if (document.getElementById('ca-unified-shell-styles')) {
            return;
        }

        var style = document.createElement('style');
        style.id = 'ca-unified-shell-styles';
        style.textContent = [
            '.ca-unified-nav {',
            '  position: sticky;',
            '  top: 0;',
            '  z-index: 4000;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  gap: 12px;',
            '  padding: 10px 16px;',
            '  border-bottom: 1px solid rgba(255,255,255,0.14);',
            '  background: rgba(13, 13, 13, 0.92);',
            '  backdrop-filter: blur(8px);',
            '  font-family: "Courier New", monospace;',
            '}',
            '.ca-unified-nav__brand {',
            '  color: #c8a96e;',
            '  text-decoration: none;',
            '  font-size: 12px;',
            '  letter-spacing: 0.08em;',
            '  text-transform: uppercase;',
            '  white-space: nowrap;',
            '}',
            '.ca-unified-nav__links {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 8px;',
            '  flex-wrap: wrap;',
            '  justify-content: flex-end;',
            '}',
            '.ca-unified-nav__link {',
            '  color: #e8e0d0;',
            '  text-decoration: none;',
            '  padding: 5px 8px;',
            '  border: 1px solid transparent;',
            '  border-radius: 4px;',
            '  font-size: 11px;',
            '  letter-spacing: 0.04em;',
            '}',
            '.ca-unified-nav__link:hover, .ca-unified-nav__link.is-active {',
            '  border-color: rgba(200, 169, 110, 0.5);',
            '  color: #c8a96e;',
            '}',
            '.ca-unified-footer {',
            '  margin-top: 24px;',
            '  padding: 14px 16px;',
            '  border-top: 1px solid rgba(255,255,255,0.14);',
            '  color: #9e9484;',
            '  background: rgba(13, 13, 13, 0.92);',
            '  font-family: "Courier New", monospace;',
            '  font-size: 10px;',
            '  letter-spacing: 0.03em;',
            '  display: flex;',
            '  justify-content: space-between;',
            '  gap: 12px;',
            '  flex-wrap: wrap;',
            '}',
            '.ca-unified-footer a {',
            '  color: #c8a96e;',
            '  text-decoration: none;',
            '}',
            '.ca-unified-footer a:hover {',
            '  text-decoration: underline;',
            '}',
            '@media (max-width: 760px) {',
            '  .ca-unified-nav {',
            '    flex-direction: column;',
            '    align-items: flex-start;',
            '  }',
            '  .ca-unified-nav__links {',
            '    width: 100%;',
            '    justify-content: flex-start;',
            '  }',
            '  .ca-unified-footer {',
            '    flex-direction: column;',
            '    align-items: flex-start;',
            '  }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function buildNav(basePath) {
        var currentPath = window.location.pathname;
        var links = [
            { href: basePath + 'index.html', label: 'Inicio' },
            { href: basePath + 'landing.html', label: 'Landing' },
            { href: basePath + 'buscador.html', label: 'Buscador' },
            { href: basePath + 'tesis.html', label: 'Tesis' },
            { href: basePath + 'privado.html', label: 'Privado' },
            { href: basePath + 'contra-archivo.html', label: 'Contra-Archivo' }
        ];

        var nav = document.createElement('nav');
        nav.className = 'ca-unified-nav';
        nav.setAttribute('aria-label', 'Navegacion unificada del sitio');
        nav.setAttribute('data-ca-unified-nav', 'true');

        var brand = document.createElement('a');
        brand.className = 'ca-unified-nav__brand';
        brand.href = basePath + 'index.html';
        brand.textContent = 'Contra-Archivo';

        var linksWrap = document.createElement('div');
        linksWrap.className = 'ca-unified-nav__links';

        links.forEach(function(item) {
            var a = document.createElement('a');
            a.className = 'ca-unified-nav__link';
            a.href = item.href;
            a.textContent = item.label;
            if (currentPath === new URL(item.href, window.location.origin).pathname) {
                a.className += ' is-active';
            }
            linksWrap.appendChild(a);
        });

        nav.appendChild(brand);
        nav.appendChild(linksWrap);

        return nav;
    }

    function buildFooter(basePath) {
        var footer = document.createElement('footer');
        footer.className = 'ca-unified-footer';
        footer.setAttribute('data-ca-unified-footer', 'true');

        var left = document.createElement('div');
        left.textContent = 'Contra-Archivo · Tesis Doctoral · Chile 2026 · mistranslation institucional';

        var right = document.createElement('div');
        right.innerHTML =
            '<a href="' + basePath + 'index.html">Inicio</a> · ' +
            '<a href="' + basePath + 'landing.html">Explorar</a> · ' +
            '<a href="' + basePath + 'buscador.html">Fuentes</a> · ' +
            '<a href="' + basePath + 'contra-archivo.html">Contra-Archivo</a>';

        footer.appendChild(left);
        footer.appendChild(right);

        return footer;
    }

    function isLegacyPrimaryNav(node) {
        if (!node || node.tagName !== 'NAV') {
            return false;
        }

        if (node.hasAttribute('data-ca-unified-nav')) {
            return false;
        }

        if (node.classList.contains('sidebar') ||
            node.classList.contains('leer-progress') ||
            node.classList.contains('ca-unified-nav')) {
            return false;
        }

        if (node.id === 'main-nav' ||
            node.classList.contains('site-nav') ||
            node.classList.contains('pv-nav')) {
            return true;
        }

        if (node.parentElement === document.body) {
            var role = (node.getAttribute('role') || '').toLowerCase();
            var aria = (node.getAttribute('aria-label') || '').toLowerCase();
            if (role === 'navigation' || aria.indexOf('naveg') !== -1 || aria.indexOf('principal') !== -1) {
                return true;
            }
            if (!node.className) {
                return true;
            }
        }

        return false;
    }

    function isLegacyPrimaryHeader(node) {
        if (!node || node.tagName !== 'HEADER') {
            return false;
        }

        if (node.hasAttribute('data-ca-unified-nav')) {
            return false;
        }

        if (node.classList.contains('site-header')) {
            return true;
        }

        if (node.parentElement === document.body) {
            var hasPrimaryNav = !!node.querySelector('nav.site-nav, nav.pv-nav, nav[aria-label*="principal"], nav[aria-label*="Navegación"], nav[aria-label*="navegación"]');
            if (hasPrimaryNav) {
                return true;
            }
        }

        return false;
    }

    function isLegacyPrimaryFooter(node) {
        if (!node || node.tagName !== 'FOOTER') {
            return false;
        }

        if (node.hasAttribute('data-ca-unified-footer') || node.classList.contains('ca-unified-footer')) {
            return false;
        }

        if (node.classList.contains('site-footer')) {
            return true;
        }

        if (node.parentElement === document.body) {
            return true;
        }

        return false;
    }

    function pruneLegacyShell() {
        var bodyChildren = Array.prototype.slice.call(document.body.children || []);

        bodyChildren.forEach(function(node) {
            if (isLegacyPrimaryHeader(node) || isLegacyPrimaryNav(node) || isLegacyPrimaryFooter(node)) {
                node.setAttribute('data-ca-legacy-hidden', 'true');
                node.style.display = 'none';
            }
        });

        var orphanBackLinks = document.querySelectorAll('a.header-back');
        Array.prototype.forEach.call(orphanBackLinks, function(link) {
            if (link.closest('[data-ca-legacy-hidden="true"]')) {
                return;
            }
            link.style.display = 'none';
        });

        var isAdminPage = /\/admin\.html$/.test(window.location.pathname);
        if (!isAdminPage) {
            var adminLinks = document.querySelectorAll('a[href$="admin.html"], a[href*="/admin.html"], a[href*="admin.html?"]');
            Array.prototype.forEach.call(adminLinks, function(link) {
                link.style.display = 'none';
                link.setAttribute('aria-hidden', 'true');
                link.setAttribute('tabindex', '-1');
            });
        }

        var readerModeNodes = document.querySelectorAll(
            '#reader-mode, #reader-mode-panel, #reader-mode-toggle, #reader-mode-logout, #reader-notes, ' +
            '.reader-mode, .reader-mode-panel, .reader-mode-toggle, .reader-mode-sheet, .reader-mode-backdrop, ' +
            '[data-reader-mode], [data-reader-notes]'
        );

        Array.prototype.forEach.call(readerModeNodes, function(node) {
            node.style.display = 'none';
            node.setAttribute('data-ca-reader-mode-deprecated', 'true');
            node.setAttribute('aria-hidden', 'true');
        });

        var textualReaderPanels = document.querySelectorAll('aside, section, div');
        Array.prototype.forEach.call(textualReaderPanels, function(node) {
            var txt = (node.textContent || '').toUpperCase();
            if (txt.indexOf('MODO LECTOR ACTIVO') !== -1 || txt.indexOf('SESIÓN DE LECTORA') !== -1 || txt.indexOf('NOTAS DE LECTURA') !== -1) {
                node.style.display = 'none';
                node.setAttribute('data-ca-reader-mode-deprecated', 'true');
                node.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function injectShell() {
        if (!document.body) {
            return;
        }

        pruneLegacyShell();

        if (!document.querySelector('[data-ca-unified-nav]')) {
            document.body.insertBefore(buildNav(resolveBasePath()), document.body.firstChild);
        }

        if (!document.querySelector('[data-ca-unified-footer]')) {
            document.body.appendChild(buildFooter(resolveBasePath()));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            injectStyles();
            injectShell();
        });
    } else {
        injectStyles();
        injectShell();
    }
})();