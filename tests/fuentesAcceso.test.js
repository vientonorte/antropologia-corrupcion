/**
 * fuentesAcceso.test.js — inventario de acceso MVP (no conectores)
 */
'use strict';

module.exports = function (describe, it, assert, assertEqual, assertGreaterThan, assertArrayIncludes, fuentesConfig) {
    var fs = require('fs');
    var path = require('path');
    var acceso = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'data', 'fuentes-acceso.json'), 'utf8')
    );

    describe('data/fuentes-acceso.json — inventario MVP', function () {
        it('has schema and 11 sources', function () {
            assertEqual(acceso._meta.schema, 'contra-archivo/source-access-inventory');
            assert(Array.isArray(acceso.sources), 'sources array');
            assertEqual(acceso.sources.length, 11);
        });

        it('covers every mvp+activa id from fuentes-config', function () {
            var mvp = (fuentesConfig.sources || []).filter(function (s) {
                return s.estado === 'mvp' && s.activa !== false;
            }).map(function (s) { return s.id; });
            var ids = acceso.sources.map(function (s) { return s.id; });
            assertEqual(mvp.length, 11, 'config still has 11 mvp activas');
            mvp.forEach(function (id) {
                assertArrayIncludes(ids, id, 'missing ' + id);
            });
        });

        it('does not claim live search for any source', function () {
            acceso.sources.forEach(function (s) {
                assertEqual(s.live_in_search, false, s.id + ' must not claim live search');
                assert(Array.isArray(s.probes) && s.probes.length > 0, s.id + ' needs probes');
            });
        });

        it('records CIPER RSS as observed access and two curated live rows', function () {
            var ciper = acceso.sources.filter(function (s) { return s.id === 'ciper'; })[0];
            assert(ciper, 'ciper entry');
            assertEqual(ciper.corpus_records, 2);
            assertArrayIncludes(ciper.observed_access, 'rss');
        });

        it('records BCN machine access without claiming a connector', function () {
            var bcn = acceso.sources.filter(function (s) { return s.id === 'bcn'; })[0];
            assertArrayIncludes(bcn.observed_access, 'api-sparql');
            assertEqual(bcn.requires_credential, false);
        });
    });
};
