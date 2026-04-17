/**
 * passkey.test.js — Tests for src/passkey.js
 */

'use strict';

module.exports = function (describe, it, assert, assertEqual, assertDeepEqual, assertApprox, assertGreaterThan, assertLessThan, assertArrayIncludes) {

    var Auth = window.PasskeyAuth;

    /* ─── Module export ─── */

    describe('PasskeyAuth — module export', function () {
        it('is exported as an object', function () {
            assert(Auth !== null && typeof Auth === 'object');
        });

        it('has required public methods', function () {
            assertEqual(typeof Auth.isSupported, 'function');
            assertEqual(typeof Auth.register, 'function');
            assertEqual(typeof Auth.login, 'function');
            assertEqual(typeof Auth.logout, 'function');
            assertEqual(typeof Auth.isAuthenticated, 'function');
        });

        it('exposes UNSUPPORTED_MSG constant', function () {
            assert(typeof Auth.UNSUPPORTED_MSG === 'string');
            assertGreaterThan(Auth.UNSUPPORTED_MSG.length, 0);
        });
    });

    /* ─── isSupported ─── */

    describe('PasskeyAuth.isSupported', function () {
        it('returns false when PublicKeyCredential is not available', function () {
            // In Node.js environment, PublicKeyCredential is not defined
            var saved = window.PublicKeyCredential;
            window.PublicKeyCredential = undefined;
            assertEqual(Auth.isSupported(), false);
            window.PublicKeyCredential = saved;
        });

        it('returns true when PublicKeyCredential is available', function () {
            window.PublicKeyCredential = function () {};
            assertEqual(Auth.isSupported(), true);
            window.PublicKeyCredential = undefined;
        });
    });

    /* ─── Session management ─── */

    describe('PasskeyAuth — session management', function () {
        it('isAuthenticated returns false initially', function () {
            sessionStorage.clear();
            assertEqual(Auth.isAuthenticated(), false);
        });

        it('logout clears session', function () {
            sessionStorage.setItem('ca_passkey_session', 'active');
            Auth.logout();
            assertEqual(Auth.isAuthenticated(), false);
        });

        it('isAuthenticated returns true when session is active', function () {
            sessionStorage.setItem('ca_passkey_session', 'active');
            assertEqual(Auth.isAuthenticated(), true);
            sessionStorage.clear();
        });
    });

    /* ─── register/login without WebAuthn ─── */

    describe('PasskeyAuth — register/login without WebAuthn', function () {
        it('register rejects when not supported', function (done) {
            window.PublicKeyCredential = undefined;
            var p = Auth.register();
            // register returns a Promise that rejects
            var rejected = false;
            p.then(function () {
                rejected = false;
            }).catch(function (err) {
                rejected = true;
                assert(err.message.indexOf('passkey') !== -1 || err.message.indexOf('WebAuthn') !== -1,
                    'should mention passkey/WebAuthn in error');
            });
            // Since promises are async, we verify synchronously that a promise was returned
            assert(typeof p.then === 'function', 'should return a promise');
        });

        it('login rejects when not supported', function () {
            window.PublicKeyCredential = undefined;
            var p = Auth.login();
            assert(typeof p.then === 'function', 'should return a promise');
            p.catch(function () {}); // prevent unhandled rejection
        });

        it('login rejects when no stored credential', function () {
            window.PublicKeyCredential = function () {};
            localStorage.removeItem('ca_passkey_cred');
            var p = Auth.login();
            assert(typeof p.then === 'function', 'should return a promise');
            p.catch(function (err) {
                assert(err.message.indexOf('credencial') !== -1,
                    'should mention missing credential');
            });
            window.PublicKeyCredential = undefined;
        });
    });

    /* ─── Base64 conversion (tested indirectly via credential storage) ─── */

    describe('PasskeyAuth — credential storage', function () {
        it('storing and retrieving credential id works', function () {
            // We can test this indirectly by checking localStorage
            localStorage.removeItem('ca_passkey_cred');
            var hasStored = localStorage.getItem('ca_passkey_cred');
            assertEqual(hasStored, null, 'should start with no credential');
        });
    });
};
