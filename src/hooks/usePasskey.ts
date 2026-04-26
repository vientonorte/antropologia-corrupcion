/**
 * usePasskey.ts
 * Wrapper React para la API WebAuthn/Passkey.
 * Port de passkey.js — sin dependencias externas.
 */

import { useState, useCallback } from 'react';

const CRED_KEY = 'ca_passkey_cred';
const SESSION_KEY = 'ca_passkey_session';
const RP_NAME = 'Contra-Archivo';
const USER_EMAIL = 'investigador@vientonorte.cl';
const USER_DISPLAY = 'Investigador Contra-Archivo';

const MVP_CHALLENGE = new Uint8Array([
  0x4e, 0x2c, 0x7a, 0xb1, 0x93, 0xd5, 0x08, 0xf6,
  0x1d, 0xa3, 0x47, 0xc9, 0x5b, 0xe2, 0x6f, 0x80,
  0xa1, 0x3c, 0x58, 0x74, 0x0d, 0xbb, 0x62, 0xe9,
  0xf4, 0x15, 0x8a, 0xd0, 0x37, 0xc6, 0x9e, 0x23,
]);

const USER_ID = new Uint8Array([
  0xc0, 0xa7, 0x12, 0xe5, 0x3b, 0x89, 0x4f, 0xd6,
  0x91, 0x0e, 0x7c, 0xf3, 0x5a, 0x28, 0xb4, 0x67,
]);

function ab2b64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b642ab(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function isSupported(): boolean {
  return !!window.PublicKeyCredential;
}

function getSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

function setSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, 'active');
  } catch { /* ignore */ }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

function storeCredId(rawId: ArrayBuffer): void {
  try {
    localStorage.setItem(CRED_KEY, ab2b64(rawId));
  } catch { /* ignore */ }
}

function getStoredCredId(): ArrayBuffer | null {
  try {
    const b64 = localStorage.getItem(CRED_KEY);
    return b64 ? b642ab(b64) : null;
  } catch {
    return null;
  }
}

export type PasskeyStatus = 'idle' | 'pending' | 'authenticated' | 'error' | 'unsupported';

export function usePasskey() {
  const [status, setStatus] = useState<PasskeyStatus>(() =>
    !isSupported() ? 'unsupported' : getSession() ? 'authenticated' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (!isSupported()) { setStatus('unsupported'); return; }
    setStatus('pending');
    setError(null);
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          rp: { name: RP_NAME, id: window.location.hostname === '127.0.0.1' ? 'localhost' : window.location.hostname },
          user: { id: USER_ID, name: USER_EMAIL, displayName: USER_DISPLAY },
          challenge: MVP_CHALLENGE,
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential;
      storeCredId(cred.rawId);
      setSession();
      setStatus('authenticated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registro cancelado');
      setStatus('error');
    }
  }, []);

  const login = useCallback(async () => {
    if (!isSupported()) { setStatus('unsupported'); return; }
    const storedId = getStoredCredId();
    if (!storedId) {
      setError('No hay credencial registrada. Usa "Registrar passkey" primero.');
      setStatus('error');
      return;
    }
    setStatus('pending');
    setError(null);
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: MVP_CHALLENGE,
          rpId: window.location.hostname === '127.0.0.1' ? 'localhost' : window.location.hostname,
          allowCredentials: [{ type: 'public-key', id: storedId, transports: ['internal'] }],
          userVerification: 'preferred',
          timeout: 60000,
        },
      });
      setSession();
      setStatus('authenticated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autenticación cancelada');
      setStatus('error');
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, register, login, logout, isSupported: isSupported() };
}
