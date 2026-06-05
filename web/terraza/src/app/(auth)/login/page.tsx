'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

type AuthState = 'idle' | 'loading' | 'error';

function base64UrlToString(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

export default function LoginPage(): React.ReactElement {
  const [state, setState] = useState<AuthState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasskey = async () => {
    setState('loading');
    setErrorMsg(null);

    try {
      // 1. Get WebAuthn options from server
      const optionsRes = await fetch('/api/auth/authenticate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!optionsRes.ok) {
        const d = await optionsRes.json() as { error?: string };
        throw new Error(d.error ?? 'No se pudo iniciar la autenticación');
      }
      const options = await optionsRes.json() as Record<string, unknown> & { challengeId: string };

      // 2. Browser performs passkey gesture
      const assertion = await startAuthentication(options as never);

      // 3. Extract userId from userHandle (resident key)
      const userHandle = assertion.response.userHandle;
      if (!userHandle) {
        throw new Error('Passkey no contiene identificador de usuario. Vuelve a registrarte.');
      }
      const userId = base64UrlToString(userHandle);

      // 4. Verify on server
      const verifyRes = await fetch('/api/auth/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assertion, challengeId: options.challengeId, userId }),
      });
      if (!verifyRes.ok) {
        const d = await verifyRes.json() as { error?: string };
        throw new Error(d.error ?? 'Verificación fallida');
      }

      // 5. Redirect to admin
      window.location.href = '/corpus';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de autenticación';
      // User cancelled the passkey dialog — don't show as error
      if (msg.includes('cancelled') || msg.includes('not allowed') || msg.includes('AbortError')) {
        setState('idle');
      } else {
        setErrorMsg(msg);
        setState('error');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="text-center max-w-sm w-full px-6">
        <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white font-serif">
          Contra-archivo
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm leading-relaxed">
          Admin privada para análisis etnográfico<br />de corrupción institucional
        </p>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={state === 'loading'}
          onClick={() => void handlePasskey()}
          aria-describedby={errorMsg ? 'login-error' : undefined}
        >
          {state === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Autenticando…
            </span>
          ) : (
            'Entrar con passkey'
          )}
        </Button>

        {errorMsg && (
          <p
            id="login-error"
            role="alert"
            className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
          >
            {errorMsg}
          </p>
        )}

        <p className="mt-8 text-xs text-gray-400">
          ¿Primera vez?{' '}
          <a href="/register" className="text-accent-700 hover:underline">
            Registrar passkey
          </a>
        </p>
      </div>
    </div>
  );
}
