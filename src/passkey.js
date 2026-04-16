'use strict';
(function () {

  var CRED_KEY = 'ca_passkey_cred';
  var SESSION_KEY = 'ca_passkey_session';
  var RP_NAME = 'Contra-Archivo';
  var USER_EMAIL = 'investigador@vientonorte.cl';
  var USER_DISPLAY = 'Investigador Contra-Archivo';
  var UNSUPPORTED_MSG = 'Este navegador no soporta autenticación por passkey (WebAuthn). ' +
    'Usa una versión reciente de Chrome, Firefox, Safari o Edge.';

  // Fixed 32-byte challenge for MVP (no server)
  var MVP_CHALLENGE = new Uint8Array([
    0x4e, 0x2c, 0x7a, 0xb1, 0x93, 0xd5, 0x08, 0xf6,
    0x1d, 0xa3, 0x47, 0xc9, 0x5b, 0xe2, 0x6f, 0x80,
    0xa1, 0x3c, 0x58, 0x74, 0x0d, 0xbb, 0x62, 0xe9,
    0xf4, 0x15, 0x8a, 0xd0, 0x37, 0xc6, 0x9e, 0x23
  ]);

  // Fixed 16-byte user ID
  var USER_ID = new Uint8Array([
    0xc0, 0xa7, 0x12, 0xe5, 0x3b, 0x89, 0x4f, 0xd6,
    0x91, 0x0e, 0x7c, 0xf3, 0x5a, 0x28, 0xb4, 0x67
  ]);

  /* ── Helpers: ArrayBuffer ↔ base64 ─────────────────────── */

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToArrayBuffer(b64) {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /* ── Feature detection ─────────────────────────────────── */

  function isSupported() {
    return !!window.PublicKeyCredential;
  }

  /* ── Session management ────────────────────────────────── */

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'active';
    } catch (e) {
      return false;
    }
  }

  function setSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'active');
    } catch (e) {
      console.error('PasskeyAuth: no se pudo escribir en sessionStorage');
    }
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('PasskeyAuth: no se pudo limpiar sessionStorage');
    }
  }

  /* ── Credential storage ────────────────────────────────── */

  function storeCredentialId(rawId) {
    try {
      localStorage.setItem(CRED_KEY, arrayBufferToBase64(rawId));
    } catch (e) {
      console.error('PasskeyAuth: no se pudo guardar credencial en localStorage');
    }
  }

  function getStoredCredentialId() {
    try {
      var b64 = localStorage.getItem(CRED_KEY);
      if (!b64) return null;
      return base64ToArrayBuffer(b64);
    } catch (e) {
      return null;
    }
  }

  /* ── Registration flow ─────────────────────────────────── */

  function register() {
    if (!isSupported()) {
      return Promise.reject(new Error(UNSUPPORTED_MSG));
    }

    var createOptions = {
      publicKey: {
        rp: {
          name: RP_NAME,
          id: window.location.hostname
        },
        user: {
          id: USER_ID,
          name: USER_EMAIL,
          displayName: USER_DISPLAY
        },
        challenge: MVP_CHALLENGE,
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    };

    return navigator.credentials.create(createOptions)
      .then(function (credential) {
        storeCredentialId(credential.rawId);
        setSession();
        return credential;
      })
      .catch(function (err) {
        console.error('PasskeyAuth: registro fallido');
        throw err;
      });
  }

  /* ── Login flow ────────────────────────────────────────── */

  function login() {
    if (!isSupported()) {
      return Promise.reject(new Error(UNSUPPORTED_MSG));
    }

    var storedId = getStoredCredentialId();
    if (!storedId) {
      return Promise.reject(new Error(
        'No hay credencial registrada. Usa register() primero.'
      ));
    }

    var getOptions = {
      publicKey: {
        challenge: MVP_CHALLENGE,
        rpId: window.location.hostname,
        allowCredentials: [{
          type: 'public-key',
          id: storedId,
          transports: ['internal']
        }],
        userVerification: 'preferred',
        timeout: 60000
      }
    };

    return navigator.credentials.get(getOptions)
      .then(function (assertion) {
        setSession();
        return assertion;
      })
      .catch(function (err) {
        console.error('PasskeyAuth: autenticación fallida');
        throw err;
      });
  }

  /* ── Public API ────────────────────────────────────────── */

  window.PasskeyAuth = {
    isSupported: isSupported,
    register: register,
    login: login,
    logout: logout,
    isAuthenticated: isAuthenticated,
    UNSUPPORTED_MSG: UNSUPPORTED_MSG
  };

})();
