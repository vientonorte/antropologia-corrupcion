'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

type RegisterState = 'idle' | 'loading' | 'success' | 'error';

export default function RegisterPage(): React.ReactElement {
  const [state, setState] = useState<RegisterState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    setState('loading');
    setErrorMsg(null);

    try {
      // 1. Get registration options from server
      const optionsRes = await fetch('/api/auth/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!optionsRes.ok) {
        const d = await optionsRes.json() as { error?: string };
        throw new Error(d.error ?? 'No se pudo iniciar el registro');
      }
      const options = await optionsRes.json() as Record<string, unknown> & { challengeId: string };

      // 2. Browser performs passkey gesture
      const credential = await startRegistration(options as never);

      // 3. Verify on server
      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credential, challengeId: options.challengeId }),
      });
      if (!verifyRes.ok) {
        const d = await verifyRes.json() as { error?: string };
        throw new Error(d.error ?? 'Verificación de registro fallida');
      }

      setState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de registro';
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
          Registrar passkey
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm leading-relaxed">
          Registra este dispositivo para acceder al contra-archivo
        </p>

        {state === 'success' ? (
          <div
            role="status"
            aria-live="polite"
            className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-6"
          >
            ✓ Passkey registrada correctamente.{' '}
            <a href="/login" className="font-medium underline hover:no-underline">
              Acceder ahora
            </a>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={state === 'loading'}
            onClick={() => void handleRegister()}
            aria-describedby={errorMsg ? 'register-error' : undefined}
          >
            {state === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Registrando…
              </span>
            ) : (
              'Registrar este dispositivo'
            )}
          </Button>
        )}

        {errorMsg && (
          <p
            id="register-error"
            role="alert"
            className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
          >
            {errorMsg}
          </p>
        )}

        <p className="mt-8 text-xs text-gray-400">
          ¿Ya tienes passkey?{' '}
          <a href="/login" className="text-accent-700 hover:underline">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}
