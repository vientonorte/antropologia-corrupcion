/**
 * corpusCitasEditorial.test.js — Clave A D6 + stub Salazar (sin inventar citas)
 */
'use strict';

var fs = require('fs');
var path = require('path');

function readJson(rel) {
    var p = path.join(__dirname, '..', rel);
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

module.exports = function (describe, it, assert, assertEqual) {
    describe('data/salazar-citas.json — stub pendiente', function () {
        var data = readJson('data/salazar-citas.json');

        it('exists as JSON array', function () {
            assert(Array.isArray(data), 'salazar-citas.json must be an array');
        });

        it('is empty (no invented Salazar quotes)', function () {
            assertEqual(data.length, 0, 'Salazar stays pending until captures exist');
        });
    });

    describe('data/clave-a-citas.json — editorial D6', function () {
        var data = readJson('data/clave-a-citas.json');

        it('is a non-empty array', function () {
            assert(Array.isArray(data) && data.length > 0, 'clave-a-citas.json should list D6 items');
        });

        it('every item is clave A with required fields', function () {
            data.forEach(function (c, i) {
                assertEqual(c.clave, 'A', 'item[' + i + '] clave');
                assert(c.id >= 4000, 'item[' + i + '] id in 4000+');
                assert(String(c.bookTitle || '').trim(), 'item[' + i + '] bookTitle');
                assert(String(c.author || '').trim(), 'item[' + i + '] author');
                assert(String(c.text || '').trim(), 'item[' + i + '] text');
                assert(String(c.color || '').trim(), 'item[' + i + '] color');
                assert(String(c.category || '').trim(), 'item[' + i + '] category');
                assert(Number.isFinite(Number(c.pageNo)), 'item[' + i + '] pageNo');
                assertEqual(c.source_session, '2026-09-06', 'item[' + i + '] source_session');
                assertEqual(c.source_type, 'bujo', 'item[' + i + '] source_type');
            });
        });

        it('ids are unique', function () {
            var seen = {};
            data.forEach(function (c) {
                assert(!seen[c.id], 'duplicate id ' + c.id);
                seen[c.id] = true;
            });
        });

        it('does not publish Kit TLP clinical fragments', function () {
            var blob = JSON.stringify(data).toLowerCase();
            ['paranoia', 'disociación', 'disociacion', 'kit tlp', 'anakaren'].forEach(function (w) {
                assert(blob.indexOf(w) === -1, 'public corpus must not include ' + w);
            });
        });
    });

    describe('web/corpus-citas.html — loader', function () {
        var html = fs.readFileSync(path.join(__dirname, '..', 'web/corpus-citas.html'), 'utf8');

        it('loads salazar-citas.json and clave-a-citas.json', function () {
            assert(/data\/salazar-citas\.json/.test(html), 'loader lists Salazar stub');
            assert(/data\/clave-a-citas\.json/.test(html), 'loader lists Clave A editorial');
        });
    });
};
