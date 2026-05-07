'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

type AddDeviceState = 'idle' | 'loading' | 'success' | 'error';

export default function AddDevicePage(): React.ReactElement {
  const [state, setState] = useState<AddDeviceState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddDevice = async () => {
    setState('loading');
    setErrorMsg(null);

    try {
      const optionsRes = await fetch('/api/auth/register/add-device/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!optionsRes.ok) {
        const data = (await optionsRes.json()) as { error?: string };
        throw new Error(data.error ?? 'No se pudo iniciar el registro de dispositivo');
      }

      const options = (await optionsRes.json()) as Record<string, unknown> & {
        challengeId: string;
      };

      const credential = await startRegistration(options as never);

      const verifyRes = await fetch('/api/auth/register/add-device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credential, challengeId: options.challengeId }),
      });

      if (!verifyRes.ok) {
        const data = (await verifyRes.json()) as { error?: string };
        throw new Error(data.error ?? 'No se pudo verificar el dispositivo');
      }

      setState('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar dispositivo';
      if (
        message.includes('cancelled') ||
        message.includes('not allowed') ||
        message.includes('AbortError')
      ) {
        setState('idle');
      } else {
        setErrorMsg(message);
        setState('error');
      }
    }
  };

  return (
    <section className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Agregar dispositivo administrativo
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Registra un nuevo passkey para tu sesión autenticada. Esto reemplaza la
          credencial actual del usuario administrador.
        </p>
      </header>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <Button
          type="button"
          variant="primary"
          disabled={state === 'loading'}
          onClick={() => void handleAddDevice()}
          aria-describedby={errorMsg ? 'add-device-error' : undefined}
        >
          {state === 'loading' ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" /> Registrando passkey…
            </span>
          ) : (
            'Registrar nuevo dispositivo'
          )}
        </Button>

        {state === 'success' && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2"
          >
            ✓ Dispositivo administrativo registrado correctamente.
          </p>
        )}

        {errorMsg && (
          <p
            id="add-device-error"
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2"
          >
            {errorMsg}
          </p>
        )}

        <a href="/sistema" className="text-sm text-accent-700 hover:underline">
          ← Volver a Sistema
        </a>
      </div>
    </section>
  );
}
