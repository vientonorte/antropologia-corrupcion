/**
 * runner.js — Minimal test runner for Contra-Archivo
 * No dependencies. Runs with: node tests/runner.js
 *
 * Provides a minimal window/document mock so that vanilla JS modules
 * can attach their exports to `window.*` as they do in the browser.
 */

'use strict';

/* ─── MINIMAL DOM MOCK ─── */

global.window = global;
global.document = {
    createElement: function () {
        return {
            setAttribute: function () {},
            style: {},
            classList: { add: function () {}, remove: function () {}, toggle: function () {} },
            appendChild: function () {},
            innerHTML: '',
            textContent: '',
        };
    },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    body: {
        appendChild: function () {},
    },
};
global.CustomEvent = function (name, opts) { this.type = name; this.detail = (opts || {}).detail; };
global.setTimeout = setTimeout;
global.requestAnimationFrame = function (cb) { setTimeout(cb, 16); };
global.URL = { createObjectURL: function () { return ''; }, revokeObjectURL: function () {} };
global.Blob = function () {};

/* ─── TEST FRAMEWORK ─── */

var passed = 0;
var failed = 0;
var errors = [];
var currentSuite = '';

function describe(name, fn) {
    currentSuite = name;
    console.log('\n\x1b[1m▸ ' + name + '\x1b[0m');
    fn();
}

function it(name, fn) {
    try {
        fn();
        passed++;
        console.log('  \x1b[32m✓\x1b[0m ' + name);
    } catch (e) {
        failed++;
        var msg = '  \x1b[31m✗\x1b[0m ' + name + ' — ' + e.message;
        console.log(msg);
        errors.push({ suite: currentSuite, test: name, error: e.message });
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)
        );
    }
}

function assertDeepEqual(actual, expected, message) {
    var a = JSON.stringify(actual);
    var b = JSON.stringify(expected);
    if (a !== b) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected ' + b + ', got ' + a
        );
    }
}

function assertApprox(actual, expected, tolerance, message) {
    tolerance = tolerance || 0.01;
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected ~' + expected + ' (±' + tolerance + '), got ' + actual
        );
    }
}

function assertThrows(fn, message) {
    try {
        fn();
        throw new Error((message || 'Expected function to throw') + ' — but it did not');
    } catch (e) {
        if (e.message && e.message.indexOf('Expected function to throw') === 0) throw e;
    }
}

function assertArrayIncludes(arr, item, message) {
    if (!Array.isArray(arr) || arr.indexOf(item) === -1) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected array to include ' + JSON.stringify(item)
        );
    }
}

function assertGreaterThan(actual, threshold, message) {
    if (actual <= threshold) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected ' + actual + ' > ' + threshold
        );
    }
}

function assertLessThan(actual, threshold, message) {
    if (actual >= threshold) {
        throw new Error(
            (message ? message + ': ' : '') +
            'Expected ' + actual + ' < ' + threshold
        );
    }
}

/* ─── LOAD MODULES ─── */

// frictionEngine.js exposes via window.frictionEngine
require('../src/frictionEngine.js');

// searchEngine.js exposes via window.FrictionSearchEngine, window.normalizeBcnDataset
require('../src/searchEngine.js');

/* ─── LOAD DATA ─── */

var fs = require('fs');
var path = require('path');

var casosData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'casos.json'), 'utf8'));
var fuentesData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'fuentes-oficiales.json'), 'utf8'));
var bcnData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bcn-legislativo.json'), 'utf8'));

/* ─── RUN TEST SUITES ─── */

require('./frictionEngine.test.js')(describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData);
require('./searchEngine.test.js')(describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes, casosData, fuentesData, bcnData);
require('./dataValidation.test.js')(describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertArrayIncludes, casosData, fuentesData, bcnData);

/* ─── SUMMARY ─── */

console.log('\n' + '─'.repeat(60));
if (failed === 0) {
    console.log('\x1b[32m✓ All ' + passed + ' tests passed\x1b[0m');
} else {
    console.log('\x1b[31m✗ ' + failed + ' of ' + (passed + failed) + ' tests failed\x1b[0m');
    for (var i = 0; i < errors.length; i++) {
        console.log('  \x1b[31m• [' + errors[i].suite + '] ' + errors[i].test + '\x1b[0m');
        console.log('    ' + errors[i].error);
    }
}
console.log('─'.repeat(60));
process.exit(failed > 0 ? 1 : 0);
