/**
 * htmlLint.test.js — Structural QA tests for HTML files
 *
 * Catches systemic CSS/HTML issues before deploy:
 * - Generic element selectors in <style> blocks that contaminate child components
 * - Missing cache-bust params on CSS/JS links
 * - Nav elements without scoped class
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (describe, it, assert, assertEqual) {

    var repoRoot = path.join(__dirname, '..');
    var webRoot = path.join(repoRoot, 'web');

    /* HTML files to audit */
    var htmlFiles = [
        'index.html',
        'landing.html',
        'archivo.html',
        'buscador.html',
        'login.html',
        'privado.html',
        'tesis.html',
        'contra-archivo-v2.html',
        '404.html'
    ];

    /* ─── Generic element selectors inside <style> ─── */

    describe('HTML lint — no generic element selectors in <style>', function () {

        /*
         * DANGEROUS GENERIC SELECTORS: bare element names used as CSS selectors
         * inside <style> blocks that set layout properties (position, top, left,
         * height, width, z-index, display). These contaminate ALL instances of
         * that element, causing inheritance bugs in child components.
         *
         * Allowed: element selectors inside a class scope (e.g. .bottom-nav a {})
         * Forbidden: top-level element selectors (e.g. nav { position: fixed })
         */
        var dangerousElements = ['nav', 'header', 'footer', 'main', 'aside', 'section', 'article'];

        /* Extract all <style> content from an HTML file */
        function extractStyleBlocks(html) {
            var blocks = [];
            var re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            var m;
            while ((m = re.exec(html)) !== null) {
                blocks.push(m[1]);
            }
            return blocks.join('\n');
        }

        /*
         * Check if a selector is a bare element (not scoped by a class/id).
         * Matches: "nav {", "nav," at start of line or after closing brace
         * Does NOT match: ".foo nav {", "#bar nav {", "nav.class {"
         */
        function findBareElementSelectors(css, element) {
            var found = [];
            var lines = css.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                /* Skip comments */
                if (line.indexOf('/*') === 0) continue;

                /*
                 * Match bare element selector: starts with the element name
                 * followed by whitespace+'{', or ',' or end-of-rule.
                 * Must NOT be preceded by '.', '#', or another word char.
                 * Element names are escaped for regex safety.
                 */
                var escaped = element.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                var re = new RegExp('^' + escaped + '\\s*[{,]');
                if (re.test(line)) {
                    found.push({ line: i + 1, text: line.substring(0, 80) });
                }
            }
            return found;
        }

        /*
         * Known exceptions — generic selectors that are intentional:
         * - index.html uses bare "section" and "footer" because it's a monolithic
         *   single-page app with exactly one footer and consistent section styling.
         * - contra-archivo-v2.html has bare "nav" and "main" (tech debt, TODO: scope).
         */
        var allowlist = {
            'index.html': ['section', 'footer'],
            'contra-archivo-v2.html': ['nav', 'main']
        };

        htmlFiles.forEach(function (file) {
            var filePath = path.join(webRoot, file);
            if (!fs.existsSync(filePath)) return;

            var html = fs.readFileSync(filePath, 'utf8');
            var css = extractStyleBlocks(html);
            if (!css) return;

            var fileAllowlist = allowlist[file] || [];

            dangerousElements.forEach(function (el) {
                /* Skip allowlisted elements for specific files */
                if (fileAllowlist.indexOf(el) !== -1) return;

                it(file + ' has no bare "' + el + ' {}" selector in <style>', function () {
                    var violations = findBareElementSelectors(css, el);
                    /* Skip lines mentioning "print" (likely inside @media print) */
                    var realViolations = violations.filter(function (v) {
                        return v.text.indexOf('print') === -1;
                    });
                    assert(
                        realViolations.length === 0,
                        'Found bare "' + el + '" selector in ' + file + ': ' +
                        realViolations.map(function (v) { return 'L' + v.line + ': ' + v.text; }).join('; ') +
                        ' — Use a scoped class instead (e.g. .top-nav instead of nav)'
                    );
                });
            });
        });
    });

    /* ─── Cache-bust params on CSS/JS links ─── */

    describe('HTML lint — cache-bust params on external resources', function () {

        var pagesWithExternal = ['landing.html', 'archivo.html', 'buscador.html', 'login.html', 'privado.html', 'tesis.html', 'contra-archivo-v2.html'];

        pagesWithExternal.forEach(function (file) {
            var filePath = path.join(webRoot, file);
            if (!fs.existsSync(filePath)) return;

            var html = fs.readFileSync(filePath, 'utf8');

            it(file + ' CSS links have cache-bust param', function () {
                var cssLinks = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi) || [];
                cssLinks.forEach(function (tag) {
                    var href = tag.match(/href="([^"]+)"/);
                    if (href && href[1].indexOf('?v=') === -1 && href[1].indexOf('http') === -1) {
                        assert(false, 'Missing cache-bust on CSS link: ' + href[1] + ' in ' + file);
                    }
                });
            });

            it(file + ' JS scripts have cache-bust param', function () {
                var scripts = html.match(/<script[^>]+src="([^"]+)"/gi) || [];
                scripts.forEach(function (tag) {
                    var src = tag.match(/src="([^"]+)"/);
                    if (src && src[1].indexOf('?v=') === -1 && src[1].indexOf('http') === -1) {
                        assert(false, 'Missing cache-bust on script: ' + src[1] + ' in ' + file);
                    }
                });
            });
        });
    });

    /* ─── Nav elements should have scoped classes ─── */

    describe('HTML lint — nav elements have scoped classes', function () {

        htmlFiles.forEach(function (file) {
            var filePath = path.join(webRoot, file);
            if (!fs.existsSync(filePath)) return;

            var html = fs.readFileSync(filePath, 'utf8');
            var navTags = html.match(/<nav[^>]*>/gi) || [];

            navTags.forEach(function (tag, i) {
                it(file + ' nav #' + (i + 1) + ' has a class or role attribute', function () {
                    var hasClass = /class="/.test(tag);
                    var hasRole = /role="/.test(tag);
                    assert(
                        hasClass || hasRole,
                        'Bare <nav> without class in ' + file + ': ' + tag.substring(0, 80) +
                        ' — Always scope nav elements with a class'
                    );
                });
            });
        });
    });
};
