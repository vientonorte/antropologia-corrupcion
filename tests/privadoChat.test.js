/**
 * privadoChat.test.js — Structural checks for private search/chat wiring
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(describe, it, assert, assertEqual) {
    var html = fs.readFileSync(path.join(__dirname, '..', 'web', 'privado.html'), 'utf8');

    describe('privado.html chat wiring', function() {
        it('loads rescued branch content dataset', function() {
            assert(html.indexOf('data/contenido-ramas-rescatado.json') !== -1,
                'privado.html should fetch contenido-ramas-rescatado.json');
        });

        it('injects BCN normalized records into the private search engine', function() {
            assert(html.indexOf('normalizeBcnDataset') !== -1,
                'privado.html should normalize BCN before creating FrictionSearchEngine');
            assert(html.indexOf('FUENTES.concat(normalizedBcn).concat(RAMAS_RESCATADAS)') !== -1,
                'privado.html should merge fuentes, BCN and rescued branch records');
        });

        it('uses frictionScore consistently in private rendering', function() {
            var frictionScoreMentions = (html.match(/frictionScore/g) || []).length;
            assert(frictionScoreMentions >= 2,
                'privado.html should render frictionScore for search/chat results');
        });
    });
};