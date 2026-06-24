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

    function preloadCasoPublico() {
        if (window.CACasoPublico || document.querySelector('script[data-ca-caso-publico]')) {
            return;
        }
        var script = document.createElement('script');
        script.src = resolveBasePath() + 'lib/casoPublico.js?v=20260621d';
        script.defer = true;
        script.setAttribute('data-ca-caso-publico', 'true');
        document.head.appendChild(script);
    }

    preloadCasoPublico();

    function injectStyles() {
        if (document.getElementById('ca-unified-shell-styles')) {
            return;
        }

        if (document.querySelector('link[rel="stylesheet"][href*="shared.css"]')) {
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
            '.ca-unified-nav__link:hover, .ca-unified-nav__link:focus-visible, .ca-unified-nav__link.is-active {',
            '  border-color: rgba(200, 169, 110, 0.5);',
            '  color: #c8a96e;',
            '  text-decoration: none;',
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
            '.ca-skip-link {',
            '  position: absolute;',
            '  left: -9999px;',
            '  top: auto;',
            '  width: 1px;',
            '  height: 1px;',
            '  overflow: hidden;',
            '}',
            '.ca-skip-link:focus {',
            '  position: fixed;',
            '  top: 12px;',
            '  left: 12px;',
            '  width: auto;',
            '  height: auto;',
            '  overflow: visible;',
            '  padding: 10px 18px;',
            '  background: #c8a96e;',
            '  color: #000;',
            '  border-radius: 6px;',
            '  font-size: 13px;',
            '  font-weight: 600;',
            '  z-index: 9999;',
            '  outline: 2px solid #0d0d0d;',
            '  text-decoration: none;',
            '}',
            '.ca-unified-nav__row {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  gap: 12px;',
            '  flex-shrink: 0;',
            '}',
            '.ca-unified-nav__toggle {',
            '  display: none;',
            '  flex-direction: column;',
            '  justify-content: center;',
            '  align-items: center;',
            '  gap: 5px;',
            '  width: 44px;',
            '  height: 44px;',
            '  border: 1px solid rgba(255,255,255,0.2);',
            '  border-radius: 6px;',
            '  background: transparent;',
            '  color: #e8e0d0;',
            '  cursor: pointer;',
            '  flex-shrink: 0;',
            '}',
            '.ca-unified-nav__toggle:focus-visible {',
            '  outline: 2px solid #c8a96e;',
            '  outline-offset: 2px;',
            '}',
            '.ca-unified-nav__toggle-bar {',
            '  display: block;',
            '  width: 20px;',
            '  height: 2px;',
            '  background: currentColor;',
            '  border-radius: 2px;',
            '  transition: transform .2s ease, opacity .2s ease;',
            '}',
            '.ca-unified-nav.is-open .ca-unified-nav__toggle-bar:nth-child(1) {',
            '  transform: translateY(7px) rotate(45deg);',
            '}',
            '.ca-unified-nav.is-open .ca-unified-nav__toggle-bar:nth-child(2) {',
            '  opacity: 0;',
            '}',
            '.ca-unified-nav.is-open .ca-unified-nav__toggle-bar:nth-child(3) {',
            '  transform: translateY(-7px) rotate(-45deg);',
            '}',
            '@media (max-width: 640px) {',
            '  .ca-unified-nav {',
            '    flex-direction: column;',
            '    align-items: stretch;',
            '  }',
            '  .ca-unified-nav__row {',
            '    width: 100%;',
            '  }',
            '  .ca-unified-nav__toggle {',
            '    display: flex;',
            '  }',
            '  .ca-unified-nav__links {',
            '    display: none;',
            '    width: 100%;',
            '    flex-direction: column;',
            '    align-items: stretch;',
            '    gap: 0;',
            '    border-top: 1px solid rgba(255,255,255,0.14);',
            '    padding-top: 8px;',
            '  }',
            '  .ca-unified-nav.is-open .ca-unified-nav__links {',
            '    display: flex;',
            '  }',
            '  .ca-unified-nav__link {',
            '    display: block;',
            '    width: 100%;',
            '    padding: 10px 4px;',
            '    border-bottom: 1px solid rgba(255,255,255,0.08);',
            '  }',
            '  .ca-unified-footer {',
            '    flex-direction: column;',
            '    align-items: flex-start;',
            '  }',
            '}',
            '.ca-bottom-nav {',
            '  display: none;',
            '  position: fixed;',
            '  bottom: 0;',
            '  left: 0;',
            '  right: 0;',
            '  z-index: 3900;',
            '  background: rgba(13, 13, 13, 0.95);',
            '  backdrop-filter: blur(10px);',
            '  -webkit-backdrop-filter: blur(10px);',
            '  border-top: 1px solid rgba(200, 169, 110, 0.18);',
            '  padding: 4px 6px calc(4px + env(safe-area-inset-bottom));',
            '  justify-content: space-around;',
            '  align-items: stretch;',
            '  gap: 2px;',
            '}',
            '.ca-bottom-nav__link {',
            '  display: flex;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 2px;',
            '  flex: 1 1 0;',
            '  min-height: 44px;',
            '  padding: 6px 2px 4px;',
            '  color: #9e9484;',
            '  text-decoration: none;',
            '  font-size: 9px;',
            '  letter-spacing: 0.04em;',
            '  text-transform: uppercase;',
            '  border-radius: 8px;',
            '  -webkit-tap-highlight-color: transparent;',
            '  position: relative;',
            '}',
            '.ca-bottom-nav__link:active {',
            '  transform: scale(0.94);',
            '}',
            '.ca-bottom-nav__icon {',
            '  font-size: 16px;',
            '  line-height: 1;',
            '}',
            '.ca-bottom-nav__link.is-active {',
            '  color: #c8a96e;',
            '}',
            '.ca-bottom-nav__link.is-active::after {',
            '  content: "";',
            '  position: absolute;',
            '  top: 2px;',
            '  left: 50%;',
            '  transform: translateX(-50%);',
            '  width: 4px;',
            '  height: 4px;',
            '  border-radius: 50%;',
            '  background: #c8a96e;',
            '}',
            'body.ca-has-bottom-nav {',
            '  padding-bottom: calc(68px + env(safe-area-inset-bottom));',
            '}',
            '@media (max-width: 768px) {',
            '  .ca-bottom-nav {',
            '    display: flex;',
            '  }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function buildNav(basePath) {
        var currentPath = window.location.pathname;
        var links = [
            { href: basePath + 'index.html', label: 'Inicio' },
            { href: basePath + 'index.html#tesis', label: 'Tesis' },
            { href: basePath + 'leer.html', label: 'Leer' },
            { href: basePath + 'buscador.html', label: 'Búsqueda' },
            { href: basePath + 'archivo.html', label: 'Archivo' },
            { href: basePath + 'corpus-citas.html', label: 'Lecturas' },
            { href: basePath + 'tesis.html', label: 'Biblioteca' },
            { href: basePath + 'privado-login.html', label: 'Acceso privado' }
        ];

        var nav = document.createElement('nav');
        nav.className = 'ca-unified-nav';
        nav.setAttribute('aria-label', 'Navegación unificada del sitio');
        nav.setAttribute('data-ca-unified-nav', 'true');

        var row = document.createElement('div');
        row.className = 'ca-unified-nav__row';

        var brand = document.createElement('a');
        brand.className = 'ca-unified-nav__brand';
        brand.href = basePath + 'index.html';
        brand.textContent = 'Contra-Archivo';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'ca-unified-nav__toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        toggle.innerHTML =
            '<span class="ca-unified-nav__toggle-bar"></span>' +
            '<span class="ca-unified-nav__toggle-bar"></span>' +
            '<span class="ca-unified-nav__toggle-bar"></span>';

        var linksWrap = document.createElement('div');
        linksWrap.className = 'ca-unified-nav__links';
        linksWrap.id = 'ca-unified-nav-links';
        toggle.setAttribute('aria-controls', 'ca-unified-nav-links');

        links.forEach(function(item) {
            var a = document.createElement('a');
            a.className = 'ca-unified-nav__link';
            a.href = item.href;
            a.textContent = item.label;
            var itemUrl = new URL(item.href, window.location.origin);
            if (currentPath === itemUrl.pathname) {
                a.className += ' is-active';
            }
            linksWrap.appendChild(a);
        });

        row.appendChild(brand);
        row.appendChild(toggle);
        nav.appendChild(row);
        nav.appendChild(linksWrap);

        toggle.addEventListener('click', function() {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
            if (open) {
                var first = linksWrap.querySelector('a');
                if (first) first.focus();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Abrir menú de navegación');
                toggle.focus();
            }
        });

        linksWrap.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth < 640) {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
                }
            });
        });

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
            '<a href="' + basePath + 'index.html#tesis">Tesis</a> · ' +
            '<a href="' + basePath + 'leer.html">Leer</a> · ' +
            '<a href="' + basePath + 'archivo.html">Archivo</a> · ' +
            '<a href="' + basePath + 'poemas.html">Poemas</a> · ' +
            '<a href="' + basePath + 'privado-login.html">Acceso privado</a>';

        footer.appendChild(left);
        footer.appendChild(right);

        return footer;
    }

    function buildBottomNav(basePath) {
        var currentPath = window.location.pathname;
        var currentHash = window.location.hash;
        var links = [
            { href: basePath + 'index.html', label: 'Inicio', icon: '⊘' },
            { href: basePath + 'index.html#tesis', label: 'Tesis', icon: '◎' },
            { href: basePath + 'buscador.html', label: 'Buscar', icon: '⌕' },
            { href: basePath + 'leer.html', label: 'Leer', icon: '¶' },
            { href: basePath + 'archivo.html', label: 'Archivo', icon: '▣' },
            { href: basePath + 'corpus-citas.html', label: 'Lecturas', icon: '◫' },
        ];

        var nav = document.createElement('nav');
        nav.className = 'ca-bottom-nav';
        nav.setAttribute('aria-label', 'Navegación móvil del sitio');
        nav.setAttribute('data-ca-bottom-nav', 'true');

        links.forEach(function(item) {
            var a = document.createElement('a');
            a.className = 'ca-bottom-nav__link';
            a.href = item.href;
            var itemUrl = new URL(item.href, window.location.origin);
            var isActive =
                currentPath === itemUrl.pathname &&
                (!itemUrl.hash || itemUrl.hash === currentHash);
            if (isActive) {
                a.className += ' is-active';
                a.setAttribute('aria-current', 'page');
            }
            a.innerHTML =
                '<span class="ca-bottom-nav__icon" aria-hidden="true">' +
                item.icon +
                '</span>' +
                '<span>' +
                item.label +
                '</span>';
            nav.appendChild(a);
        });

        return nav;
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

        var legacyReaderMarkers = document.querySelectorAll(
            '[data-reader-mode], .reader-mode, .reader-mode-panel, #reader-mode, #reader-mode-panel'
        );
        Array.prototype.forEach.call(legacyReaderMarkers, function(node) {
            var txt = (node.textContent || '').toUpperCase();
            if (
                txt.indexOf('MODO LECTOR ACTIVO') !== -1 ||
                txt.indexOf('SESIÓN DE LECTORA') !== -1 ||
                txt.indexOf('NOTAS DE LECTURA') !== -1
            ) {
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

        if (!document.querySelector('.ca-skip-link') && !document.querySelector('.skip-link')) {
            var skip = document.createElement('a');
            skip.className = 'ca-skip-link';
            skip.href = '#main-content';
            skip.textContent = 'Saltar al contenido principal';
            document.body.insertBefore(skip, document.body.firstChild);
        }

        if (!document.querySelector('[data-ca-unified-nav]')) {
            var nav = buildNav(resolveBasePath());
            var skipEl = document.querySelector('.ca-skip-link');
            document.body.insertBefore(nav, skipEl ? skipEl.nextSibling : document.body.firstChild);
        }

        if (!document.querySelector('[data-ca-unified-footer]')) {
            document.body.appendChild(buildFooter(resolveBasePath()));
        }

        if (!document.querySelector('[data-ca-bottom-nav]')) {
            document.body.appendChild(buildBottomNav(resolveBasePath()));
            document.body.classList.add('ca-has-bottom-nav');
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
