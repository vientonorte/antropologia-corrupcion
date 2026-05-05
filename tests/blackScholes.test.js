/**
 * blackScholes.test.js — Tests for src/blackScholes.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData) {

    var BS = window.BlackScholes;

    /* ─── normCDF ─── */

    describe('blackScholes.normCDF', function () {
        it('returns 0.5 at x=0', function () {
            assertApprox(BS.normCDF(0), 0.5, 0.001);
        });

        it('returns ~0 for very negative x', function () {
            assertApprox(BS.normCDF(-8), 0, 1e-10);
        });

        it('returns ~1 for very positive x', function () {
            assertApprox(BS.normCDF(8), 1, 1e-10);
        });

        it('returns ~0.975 at x=1.96 (95% CI upper bound)', function () {
            assertApprox(BS.normCDF(1.96), 0.975, 0.001);
        });

        it('returns ~0.841 at x=1.0 (one sigma)', function () {
            assertApprox(BS.normCDF(1), 0.841, 0.001);
        });

        it('is symmetric: normCDF(-x) = 1 - normCDF(x)', function () {
            assertApprox(BS.normCDF(-1), 1 - BS.normCDF(1), 0.0001);
            assertApprox(BS.normCDF(-2), 1 - BS.normCDF(2), 0.0001);
        });

        it('is monotonically increasing', function () {
            assert(BS.normCDF(1) > BS.normCDF(0), 'CDF(1) > CDF(0)');
            assert(BS.normCDF(0) > BS.normCDF(-1), 'CDF(0) > CDF(-1)');
        });
    });

    /* ─── normPDF ─── */

    describe('blackScholes.normPDF', function () {
        it('returns 1/sqrt(2π) at x=0', function () {
            assertApprox(BS.normPDF(0), 1 / Math.sqrt(2 * Math.PI), 0.0001);
        });

        it('is symmetric: normPDF(x) = normPDF(-x)', function () {
            assertApprox(BS.normPDF(1), BS.normPDF(-1), 0.0001);
            assertApprox(BS.normPDF(2), BS.normPDF(-2), 0.0001);
        });

        it('decreases as |x| increases', function () {
            assert(BS.normPDF(0) > BS.normPDF(1), 'PDF(0) > PDF(1)');
            assert(BS.normPDF(1) > BS.normPDF(2), 'PDF(1) > PDF(2)');
        });

        it('is always positive', function () {
            assert(BS.normPDF(-5) > 0, 'PDF(-5) > 0');
            assert(BS.normPDF(5) > 0, 'PDF(5) > 0');
        });
    });

    /* ─── frictionToSigma ─── */

    describe('blackScholes.frictionToSigma', function () {
        var cfg = BS.BS_CONFIG;

        it('maps 0 to SIGMA_MIN', function () {
            assertApprox(BS.frictionToSigma(0), cfg.SIGMA_MIN, 0.0001);
        });

        it('maps 1 to SIGMA_MAX', function () {
            assertApprox(BS.frictionToSigma(1), cfg.SIGMA_MAX, 0.0001);
        });

        it('maps 0.5 to midpoint', function () {
            var expected = cfg.SIGMA_MIN + 0.5 * (cfg.SIGMA_MAX - cfg.SIGMA_MIN);
            assertApprox(BS.frictionToSigma(0.5), expected, 0.0001);
        });

        it('clamps values below 0 to SIGMA_MIN', function () {
            assertApprox(BS.frictionToSigma(-1), cfg.SIGMA_MIN, 0.0001);
        });

        it('clamps values above 1 to SIGMA_MAX', function () {
            assertApprox(BS.frictionToSigma(2), cfg.SIGMA_MAX, 0.0001);
        });

        it('returns a value within [SIGMA_MIN, SIGMA_MAX] for any input', function () {
            [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
                var s = BS.frictionToSigma(v);
                assert(s >= cfg.SIGMA_MIN && s <= cfg.SIGMA_MAX, 'sigma out of bounds for input ' + v);
            });
        });
    });

    /* ─── computeStrike ─── */

    describe('blackScholes.computeStrike', function () {
        it('returns correct K for estado abierta', function () {
            assertEqual(BS.computeStrike({ friccion: { estado: 'abierta' } }), BS.BS_CONFIG.STRIKE.abierta);
        });

        it('returns correct K for estado archivada', function () {
            assertEqual(BS.computeStrike({ friccion: { estado: 'archivada' } }), BS.BS_CONFIG.STRIKE.archivada);
        });

        it('returns correct K for estado resuelta', function () {
            assertEqual(BS.computeStrike({ friccion: { estado: 'resuelta' } }), BS.BS_CONFIG.STRIKE.resuelta);
        });

        it('returns STRIKE_DEFAULT for unknown estado', function () {
            assertEqual(BS.computeStrike({ friccion: { estado: 'unknown' } }), BS.BS_CONFIG.STRIKE_DEFAULT);
        });

        it('returns STRIKE_DEFAULT when friccion field is absent', function () {
            assertEqual(BS.computeStrike({}), BS.BS_CONFIG.STRIKE_DEFAULT);
        });

        it('is case insensitive for estado', function () {
            assertEqual(BS.computeStrike({ friccion: { estado: 'ABIERTA' } }), BS.BS_CONFIG.STRIKE.abierta);
        });
    });

    /* ─── computePressure ─── */

    describe('blackScholes.computePressure', function () {
        it('returns minimum pressure for empty caso', function () {
            assertApprox(BS.computePressure({}), 0.10, 0.001);
        });

        it('increases with more actores', function () {
            var p1 = BS.computePressure({ actores: ['A'] });
            var p2 = BS.computePressure({ actores: ['A', 'B', 'C'] });
            assert(p2 > p1, 'more actors → higher pressure');
        });

        it('increases with more conexiones', function () {
            var p1 = BS.computePressure({ conexiones: ['x'] });
            var p2 = BS.computePressure({ conexiones: ['x', 'y', 'z'] });
            assert(p2 > p1, 'more connections → higher pressure');
        });

        it('clamps to maximum of 2.5', function () {
            var bigCaso = {
                actores: new Array(50).fill('a'),
                instituciones: new Array(50).fill('i'),
                conexiones: new Array(50).fill('c'),
                tags: new Array(50).fill('t'),
            };
            var p = BS.computePressure(bigCaso);
            assertLessThan(p, 2.501);
        });

        it('clamps to minimum of 0.1', function () {
            var p = BS.computePressure({});
            assert(p >= 0.10, 'pressure should not go below 0.1');
        });

        it('weights conexiones at 0.40 (highest)', function () {
            var p_actores = BS.computePressure({ actores: ['a', 'b', 'c', 'd', 'e'] });
            var p_conexiones = BS.computePressure({ conexiones: ['a', 'b', 'c', 'd', 'e'] });
            assert(p_conexiones > p_actores, 'conexiones contribute more than actores');
        });
    });

    /* ─── priceCall ─── */

    describe('blackScholes.priceCall', function () {
        it('returns intrinsic value when T=0 (deep in the money)', function () {
            var S = 1.5, K = 1.0;
            assertApprox(BS.priceCall(S, K, 0.06, 0.3, 0), S - K, 0.0001);
        });

        it('returns 0 when T=0 and out of the money', function () {
            assertApprox(BS.priceCall(0.5, 1.0, 0.06, 0.3, 0), 0, 0.0001);
        });

        it('is always non-negative', function () {
            [[1, 1, 0.06, 0.3, 1], [0.5, 1.5, 0.06, 0.8, 3], [2, 1, 0.06, 0.1, 0.5]].forEach(function (p) {
                assert(BS.priceCall(p[0], p[1], p[2], p[3], p[4]) >= 0, 'call value must be non-negative');
            });
        });

        it('increases with higher S (more pressure → more likely to exercise)', function () {
            var call1 = BS.priceCall(0.8, 1.0, 0.06, 0.3, 2);
            var call2 = BS.priceCall(1.2, 1.0, 0.06, 0.3, 2);
            assert(call2 > call1, 'call increases with S');
        });

        it('increases with higher sigma (volatility amplifies call value)', function () {
            var call_lo = BS.priceCall(1.0, 1.0, 0.06, 0.1, 1);
            var call_hi = BS.priceCall(1.0, 1.0, 0.06, 0.8, 1);
            assert(call_hi > call_lo, 'call increases with sigma');
        });
    });

    /* ─── pricePut ─── */

    describe('blackScholes.pricePut', function () {
        it('returns intrinsic value when T=0 (deep out of the money = put in the money)', function () {
            var S = 0.5, K = 1.0;
            assertApprox(BS.pricePut(S, K, 0.06, 0.3, 0), K - S, 0.0001);
        });

        it('returns 0 when T=0 and S > K', function () {
            assertApprox(BS.pricePut(1.5, 1.0, 0.06, 0.3, 0), 0, 0.0001);
        });

        it('is always non-negative', function () {
            [[1, 1, 0.06, 0.3, 1], [0.5, 1.5, 0.06, 0.8, 3], [2, 1, 0.06, 0.1, 0.5]].forEach(function (p) {
                assert(BS.pricePut(p[0], p[1], p[2], p[3], p[4]) >= 0, 'put value must be non-negative');
            });
        });

        it('satisfies put-call parity: C - P ≈ S - K·e^(-rT)', function () {
            var S = 1.0, K = 1.0, r = 0.06, sigma = 0.3, T = 1;
            var call = BS.priceCall(S, K, r, sigma, T);
            var put  = BS.pricePut(S, K, r, sigma, T);
            var parity = S - K * Math.exp(-r * T);
            assertApprox(call - put, parity, 0.001, 'put-call parity violation');
        });
    });

    /* ─── greeks ─── */

    describe('blackScholes.greeks', function () {
        var g = BS.greeks(1.0, 1.0, 0.06, 0.3, 1);

        it('returns all required greek fields', function () {
            assert(typeof g.delta === 'number', 'delta missing');
            assert(typeof g.gamma === 'number', 'gamma missing');
            assert(typeof g.theta === 'number', 'theta missing');
            assert(typeof g.vega === 'number', 'vega missing');
            assert(typeof g.rho === 'number', 'rho missing');
        });

        it('delta is between 0 and 1 for a call', function () {
            assert(g.delta >= 0 && g.delta <= 1, 'delta out of [0,1]');
        });

        it('gamma is non-negative', function () {
            assert(g.gamma >= 0, 'gamma must be >= 0');
        });

        it('theta is negative (time erodes value)', function () {
            assert(g.theta < 0, 'theta must be negative');
        });

        it('vega is positive (volatility increases option value)', function () {
            assert(g.vega > 0, 'vega must be positive');
        });

        it('rho is non-negative', function () {
            assert(g.rho >= 0, 'rho must be >= 0');
        });

        it('deep in the money: delta approaches 1', function () {
            var g_itm = BS.greeks(5.0, 1.0, 0.06, 0.3, 1);
            assertGreaterThan(g_itm.delta, 0.95);
        });

        it('deep out of the money: delta approaches 0', function () {
            var g_otm = BS.greeks(0.1, 5.0, 0.06, 0.3, 1);
            assertLessThan(g_otm.delta, 0.05);
        });

        it('returns edge values when T=0 and S > K', function () {
            var g0 = BS.greeks(1.5, 1.0, 0.06, 0.3, 0);
            assertEqual(g0.delta, 1);
            assertEqual(g0.gamma, 0);
            assertEqual(g0.theta, 0);
        });

        it('returns edge values when T=0 and S < K', function () {
            var g0 = BS.greeks(0.5, 1.0, 0.06, 0.3, 0);
            assertEqual(g0.delta, 0);
        });

        it('at-the-money delta is approximately 0.5 for short T', function () {
            var g_atm = BS.greeks(1.0, 1.0, 0.0, 0.3, 0.1);
            assertApprox(g_atm.delta, 0.5, 0.06);
        });
    });

    /* ─── priceCaso ─── */

    describe('blackScholes.priceCaso', function () {
        var caso = casosData.casos[0];

        it('returns an object with all required fields', function () {
            var result = BS.priceCaso(caso, 0.5);
            assert(typeof result.callValue === 'number', 'callValue missing');
            assert(typeof result.putValue === 'number', 'putValue missing');
            assert(typeof result.riskNeutralProb === 'number', 'riskNeutralProb missing');
            assert(typeof result.moneyness === 'number', 'moneyness missing');
            assert(typeof result.intrinsicValue === 'number', 'intrinsicValue missing');
            assert(typeof result.timeValue === 'number', 'timeValue missing');
            assert(result.greeks && typeof result.greeks === 'object', 'greeks missing');
            assert(result.params && typeof result.params === 'object', 'params missing');
        });

        it('riskNeutralProb is between 0 and 1', function () {
            var result = BS.priceCaso(caso, 0.5);
            assert(result.riskNeutralProb >= 0 && result.riskNeutralProb <= 1, 'prob out of [0,1]');
        });

        it('callValue and putValue are non-negative', function () {
            var result = BS.priceCaso(caso, 0.5);
            assert(result.callValue >= 0, 'callValue must be >= 0');
            assert(result.putValue >= 0, 'putValue must be >= 0');
        });

        it('moneyness = S / K', function () {
            var result = BS.priceCaso(caso, 0.5);
            assertApprox(result.moneyness, result.params.S / result.params.K, 0.001);
        });

        it('intrinsicValue is max(S - K, 0)', function () {
            var result = BS.priceCaso(caso, 0.5);
            var expected = Math.max(result.params.S - result.params.K, 0);
            assertApprox(result.intrinsicValue, expected, 0.001);
        });

        it('timeValue = max(callValue - intrinsicValue, 0)', function () {
            var result = BS.priceCaso(caso, 0.5);
            var expected = Math.max(result.callValue - result.intrinsicValue, 0);
            assertApprox(result.timeValue, expected, 0.001);
        });

        it('higher frictionIntensity maps to higher sigma', function () {
            var r_lo = BS.priceCaso(caso, 0.1);
            var r_hi = BS.priceCaso(caso, 0.9);
            assert(r_hi.params.sigma > r_lo.params.sigma, 'higher friction → higher sigma');
        });

        it('uses MIN_T when caso.anio equals or exceeds current year', function () {
            var futureCaso = Object.assign({}, caso, { anio: new Date().getFullYear() + 5 });
            var result = BS.priceCaso(futureCaso, 0.5);
            assertApprox(result.params.T, BS.BS_CONFIG.MIN_T, 0.0001);
        });

        it('all casos in dataset produce valid results', function () {
            casosData.casos.forEach(function (c) {
                var result = BS.priceCaso(c, c.friccion ? (c.friccion.intensidad || 0.5) : 0.5);
                assert(typeof result.callValue === 'number', 'callValue not a number for ' + c.id);
                assert(!isNaN(result.callValue), 'callValue is NaN for ' + c.id);
            });
        });
    });

    /* ─── enrichNodes ─── */

    describe('blackScholes.enrichNodes', function () {
        var fe = window.frictionEngine;
        var graphData = fe.buildGraph(casosData.casos);

        it('adds .bs field to each node that has a matching caso', function () {
            var nodes = JSON.parse(JSON.stringify(graphData.nodes));
            nodes.forEach(function (n) { n.intensidad = 0.5; });
            BS.enrichNodes(nodes, casosData.casos);
            var enriched = nodes.filter(function (n) { return n.bs !== null && n.bs !== undefined; });
            assertGreaterThan(enriched.length, 0, 'at least one node should be enriched');
        });

        it('does not crash for nodes without a matching caso', function () {
            var nodes = [{ id: 'NONEXISTENT', intensidad: 0.5 }];
            BS.enrichNodes(nodes, casosData.casos);
            assert(nodes[0].bs === undefined, 'no bs field for unmatched node');
        });

        it('sets bs to null when priceCaso throws', function () {
            // Provide a deliberately broken caso to trigger error path
            var brokenCaso = { id: 'broken', anio: NaN };
            var nodes = [{ id: 'broken', intensidad: 0.5 }];
            // Should not throw
            BS.enrichNodes(nodes, [brokenCaso]);
        });

        it('handles empty nodes array gracefully', function () {
            BS.enrichNodes([], casosData.casos); // should not throw
        });

        it('handles empty casos array gracefully', function () {
            var nodes = [{ id: casosData.casos[0].id, intensidad: 0.5 }];
            BS.enrichNodes(nodes, []);
            assert(nodes[0].bs === undefined, 'no bs when casos is empty');
        });
    });
};
