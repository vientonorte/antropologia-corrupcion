/**
 * privadoChatValidation.test.js — Validación de entradas del chat privado
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(describe, it, assert, assertEqual) {
    var html = fs.readFileSync(path.join(__dirname, '..', 'privado.html'), 'utf8');

    describe('privado.html chat validation', function() {
        it('previene mensajes vacíos', function() {
            assert(html.indexOf('if (!q) return;') !== -1,
                'El chat debe ignorar mensajes vacíos');
        });
        it('limita la longitud del mensaje', function() {
            assert(html.indexOf('if (q.length > 400)') !== -1,
                'El chat debe limitar la longitud del mensaje a 400 caracteres');
        });
    });
};