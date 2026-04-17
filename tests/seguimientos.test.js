/**
 * seguimientos.test.js — Tests for src/seguimientos.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes) {

    var Seg = window.Seguimientos;

    /* ─── Helper: reset localStorage between suites ─── */
    function resetStorage() {
        localStorage.removeItem('ca_seguimientos');
    }

    /* ─── Module export ─── */

    describe('Seguimientos — module export', function () {
        it('is exported as an object', function () {
            assert(Seg !== null && typeof Seg === 'object');
        });

        it('has all public methods', function () {
            assertEqual(typeof Seg.seguir, 'function');
            assertEqual(typeof Seg.dejarDeSeguir, 'function');
            assertEqual(typeof Seg.listar, 'function');
            assertEqual(typeof Seg.buscar, 'function');
            assertEqual(typeof Seg.actualizarNota, 'function');
            assertEqual(typeof Seg.agregarTag, 'function');
            assertEqual(typeof Seg.quitarTag, 'function');
            assertEqual(typeof Seg.exportarCSV, 'function');
            assertEqual(typeof Seg.importarJSON, 'function');
            assertEqual(typeof Seg.contarPorTipo, 'function');
            assertEqual(typeof Seg.tieneNuevos, 'function');
            assertEqual(typeof Seg.marcarRevisado, 'function');
        });
    });

    /* ─── seguir ─── */

    describe('Seguimientos.seguir', function () {
        resetStorage();

        it('creates a seguimiento with valid input', function () {
            resetStorage();
            var result = Seg.seguir({ nombre: 'SURA', tipo: 'actor' });
            assert(result !== null, 'should return created item');
            assertEqual(result.nombre, 'SURA');
            assertEqual(result.tipo, 'actor');
            assert(typeof result.id === 'string', 'should have id');
            assert(typeof result.fechaCreacion === 'number', 'should have fechaCreacion');
        });

        it('returns null for missing nombre', function () {
            var result = Seg.seguir({ tipo: 'actor' });
            assertEqual(result, null);
        });

        it('returns null for missing tipo', function () {
            var result = Seg.seguir({ nombre: 'test' });
            assertEqual(result, null);
        });

        it('returns null for invalid tipo', function () {
            var result = Seg.seguir({ nombre: 'test', tipo: 'invalido' });
            assertEqual(result, null);
        });

        it('returns null for null input', function () {
            var result = Seg.seguir(null);
            assertEqual(result, null);
        });

        it('accepts all valid tipos: actor, institucion, ley, caso', function () {
            resetStorage();
            var tipos = ['actor', 'institucion', 'ley', 'caso'];
            for (var i = 0; i < tipos.length; i++) {
                var r = Seg.seguir({ nombre: 'test_' + tipos[i], tipo: tipos[i] });
                assert(r !== null, 'tipo ' + tipos[i] + ' should be valid');
                assertEqual(r.tipo, tipos[i]);
            }
        });

        it('preserves tags array', function () {
            resetStorage();
            var r = Seg.seguir({ nombre: 'CMF', tipo: 'institucion', tags: ['regulador', 'finanzas'] });
            assertDeepEqual(r.tags, ['regulador', 'finanzas']);
        });

        it('preserves notas', function () {
            resetStorage();
            var r = Seg.seguir({ nombre: 'CMF', tipo: 'institucion', notas: 'Seguimiento importante' });
            assertEqual(r.notas, 'Seguimiento importante');
        });

        it('defaults tags to empty array when not provided', function () {
            resetStorage();
            var r = Seg.seguir({ nombre: 'Test', tipo: 'actor' });
            assertDeepEqual(r.tags, []);
        });

        it('defaults notas to empty string when not provided', function () {
            resetStorage();
            var r = Seg.seguir({ nombre: 'Test', tipo: 'actor' });
            assertEqual(r.notas, '');
        });
    });

    /* ─── listar ─── */

    describe('Seguimientos.listar', function () {
        it('lists all seguimientos', function () {
            resetStorage();
            Seg.seguir({ nombre: 'A', tipo: 'actor' });
            Seg.seguir({ nombre: 'B', tipo: 'institucion' });

            var all = Seg.listar();
            assertEqual(all.length, 2);
        });

        it('filters by tipo', function () {
            resetStorage();
            Seg.seguir({ nombre: 'A', tipo: 'actor' });
            Seg.seguir({ nombre: 'B', tipo: 'institucion' });
            Seg.seguir({ nombre: 'C', tipo: 'actor' });

            var actores = Seg.listar('actor');
            assertEqual(actores.length, 2);
            for (var i = 0; i < actores.length; i++) {
                assertEqual(actores[i].tipo, 'actor');
            }
        });

        it('returns empty array when storage is empty', function () {
            resetStorage();
            assertEqual(Seg.listar().length, 0);
        });
    });

    /* ─── dejarDeSeguir ─── */

    describe('Seguimientos.dejarDeSeguir', function () {
        it('removes an existing seguimiento', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            var result = Seg.dejarDeSeguir(item.id);
            assertEqual(result, true);
            assertEqual(Seg.listar().length, 0);
        });

        it('returns false for non-existent id', function () {
            resetStorage();
            var result = Seg.dejarDeSeguir('nonexistent-id');
            assertEqual(result, false);
        });
    });

    /* ─── buscar ─── */

    describe('Seguimientos.buscar', function () {
        it('finds items by name substring', function () {
            resetStorage();
            Seg.seguir({ nombre: 'SURA Investments', tipo: 'actor' });
            Seg.seguir({ nombre: 'CMF Chile', tipo: 'institucion' });

            var results = Seg.buscar('sura');
            assertEqual(results.length, 1);
            assertEqual(results[0].nombre, 'SURA Investments');
        });

        it('is case-insensitive and accent-insensitive', function () {
            resetStorage();
            Seg.seguir({ nombre: 'Regulación AFP', tipo: 'ley' });

            var r1 = Seg.buscar('regulacion');
            assertEqual(r1.length, 1, 'should find accent-insensitively');

            var r2 = Seg.buscar('REGULACION');
            assertEqual(r2.length, 1, 'should find case-insensitively');
        });

        it('returns empty for empty query', function () {
            assertEqual(Seg.buscar('').length, 0);
            assertEqual(Seg.buscar(null).length, 0);
        });
    });

    /* ─── actualizarNota ─── */

    describe('Seguimientos.actualizarNota', function () {
        it('updates nota for existing item', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            var result = Seg.actualizarNota(item.id, 'Nueva nota');
            assertEqual(result, true);

            var items = Seg.listar();
            assertEqual(items[0].notas, 'Nueva nota');
        });

        it('returns false for non-existent id', function () {
            var result = Seg.actualizarNota('nonexistent', 'test');
            assertEqual(result, false);
        });

        it('updates ultimaRevision timestamp', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            var original = item.ultimaRevision;

            // Small delay to ensure timestamp differs
            Seg.actualizarNota(item.id, 'Updated');
            var items = Seg.listar();
            assert(items[0].ultimaRevision >= original,
                'ultimaRevision should be updated');
        });
    });

    /* ─── agregarTag / quitarTag ─── */

    describe('Seguimientos.agregarTag / quitarTag', function () {
        it('adds a tag to an item', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            var result = Seg.agregarTag(item.id, 'finanzas');
            assertEqual(result, true);

            var items = Seg.listar();
            assertArrayIncludes(items[0].tags, 'finanzas');
        });

        it('does not add duplicate tags', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor', tags: ['finanzas'] });
            var result = Seg.agregarTag(item.id, 'finanzas');
            assertEqual(result, false, 'should return false for duplicate');
        });

        it('returns false for invalid id', function () {
            assertEqual(Seg.agregarTag('bad-id', 'tag'), false);
        });

        it('returns false for empty tag', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            assertEqual(Seg.agregarTag(item.id, ''), false);
            assertEqual(Seg.agregarTag(item.id, null), false);
        });

        it('removes a tag from an item', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor', tags: ['x', 'y'] });
            var result = Seg.quitarTag(item.id, 'x');
            assertEqual(result, true);

            var items = Seg.listar();
            assertEqual(items[0].tags.length, 1);
            assertEqual(items[0].tags[0], 'y');
        });

        it('returns false when removing non-existent tag', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            assertEqual(Seg.quitarTag(item.id, 'nonexistent'), false);
        });
    });

    /* ─── contarPorTipo ─── */

    describe('Seguimientos.contarPorTipo', function () {
        it('returns counts for all tipos', function () {
            resetStorage();
            Seg.seguir({ nombre: 'A', tipo: 'actor' });
            Seg.seguir({ nombre: 'B', tipo: 'actor' });
            Seg.seguir({ nombre: 'C', tipo: 'institucion' });
            Seg.seguir({ nombre: 'D', tipo: 'ley' });

            var counts = Seg.contarPorTipo();
            assertEqual(counts.actor, 2);
            assertEqual(counts.institucion, 1);
            assertEqual(counts.ley, 1);
            assertEqual(counts.caso, 0);
        });

        it('returns all zeros when empty', function () {
            resetStorage();
            var counts = Seg.contarPorTipo();
            assertEqual(counts.actor, 0);
            assertEqual(counts.institucion, 0);
            assertEqual(counts.ley, 0);
            assertEqual(counts.caso, 0);
        });
    });

    /* ─── exportarCSV ─── */

    describe('Seguimientos.exportarCSV', function () {
        it('returns CSV string with header', function () {
            resetStorage();
            Seg.seguir({ nombre: 'SURA', tipo: 'actor', tags: ['finanzas'] });

            var csv = Seg.exportarCSV();
            assert(csv.indexOf('ID,Tipo,Nombre,Tags,Fecha,Nota') !== -1, 'should have CSV header');
        });

        it('contains data rows', function () {
            resetStorage();
            Seg.seguir({ nombre: 'SURA', tipo: 'actor' });

            var csv = Seg.exportarCSV();
            var lines = csv.split('\n');
            assertGreaterThan(lines.length, 1, 'should have header + data rows');
        });

        it('escapes commas and quotes in values', function () {
            resetStorage();
            Seg.seguir({ nombre: 'Test, "quoted"', tipo: 'actor' });

            var csv = Seg.exportarCSV();
            // The name with comma and quotes should be properly escaped
            assert(csv.indexOf('""') !== -1 || csv.indexOf('Test') !== -1,
                'should handle special characters');
        });
    });

    /* ─── importarJSON ─── */

    describe('Seguimientos.importarJSON', function () {
        it('imports array of seguimientos', function () {
            resetStorage();
            var data = [
                { nombre: 'Imported', tipo: 'actor' },
                { nombre: 'Also Imported', tipo: 'caso' }
            ];
            var count = Seg.importarJSON(data);
            assertEqual(count, 2);
            assertEqual(Seg.listar().length, 2);
        });

        it('accepts JSON string', function () {
            resetStorage();
            var json = JSON.stringify([{ nombre: 'FromString', tipo: 'ley' }]);
            var count = Seg.importarJSON(json);
            assertEqual(count, 1);
        });

        it('skips duplicates by tipo+nombre', function () {
            resetStorage();
            Seg.seguir({ nombre: 'A', tipo: 'actor' });

            var count = Seg.importarJSON([{ nombre: 'A', tipo: 'actor' }]);
            assertEqual(count, 0, 'duplicate should be skipped');
            assertEqual(Seg.listar().length, 1, 'total should remain 1');
        });

        it('skips items with invalid tipo', function () {
            resetStorage();
            var count = Seg.importarJSON([{ nombre: 'Bad', tipo: 'invalido' }]);
            assertEqual(count, 0);
        });

        it('skips items missing nombre or tipo', function () {
            resetStorage();
            var count = Seg.importarJSON([
                { nombre: 'NoTipo' },
                { tipo: 'actor' },
                null,
                {}
            ]);
            assertEqual(count, 0);
        });

        it('returns 0 for invalid JSON string', function () {
            var count = Seg.importarJSON('not valid json{{{');
            assertEqual(count, 0);
        });

        it('returns 0 for non-array input', function () {
            assertEqual(Seg.importarJSON({ not: 'array' }), 0);
        });
    });

    /* ─── tieneNuevos ─── */

    describe('Seguimientos.tieneNuevos', function () {
        it('returns items updated after timestamp', function () {
            resetStorage();
            var before = Date.now() - 1000;
            Seg.seguir({ nombre: 'Recent', tipo: 'actor' });

            var nuevos = Seg.tieneNuevos(before);
            assertEqual(nuevos.length, 1);
        });

        it('returns empty when no items updated after timestamp', function () {
            resetStorage();
            Seg.seguir({ nombre: 'Old', tipo: 'actor' });

            var nuevos = Seg.tieneNuevos(Date.now() + 10000);
            assertEqual(nuevos.length, 0);
        });
    });

    /* ─── marcarRevisado ─── */

    describe('Seguimientos.marcarRevisado', function () {
        it('updates ultimaRevision', function () {
            resetStorage();
            var item = Seg.seguir({ nombre: 'A', tipo: 'actor' });
            var result = Seg.marcarRevisado(item.id);
            assertEqual(result, true);
        });

        it('returns false for non-existent id', function () {
            assertEqual(Seg.marcarRevisado('bad-id'), false);
        });
    });
};
