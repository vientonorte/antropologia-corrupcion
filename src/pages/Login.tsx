import { useNavigate } from 'react-router-dom';
import { usePasskey } from '../hooks/usePasskey';
import { useEffect } from 'react';

export default function Login() {
  const { status, error, register, login, isSupported } = usePasskey();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'authenticated') navigate('/grafo');
  }, [status, navigate]);

  return (
    <main className="ca-login-main" id="main" tabIndex={-1}>
      <div className="ca-login-card">
        <div className="ca-login-logo" aria-hidden="true">Ω</div>
        <h1 className="ca-login-title">Contra-Archivo</h1>
        <p className="ca-login-sub">
          Instrumento cualitativo de análisis multi-situado.<br />
          Acceso mediante passkey (WebAuthn).
        </p>

        {!isSupported ? (
          <div className="ca-login-error" role="alert">
            Este navegador no soporta passkey (WebAuthn).<br />
            Usa Chrome, Firefox, Safari o Edge reciente.
          </div>
        ) : (
          <div className="ca-login-actions">
            <button
              className="ca-btn-primary"
              onClick={login}
              disabled={status === 'pending'}
              type="button"
              aria-busy={status === 'pending'}
            >
              {status === 'pending' ? 'Verificando…' : '🔑 Acceder con passkey'}
            </button>
            <button
              className="ca-btn-ghost"
              onClick={register}
              disabled={status === 'pending'}
              type="button"
            >
              Registrar nueva passkey
            </button>
          </div>
        )}

        {error && (
          <div className="ca-login-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <p className="ca-login-hint">
          La autenticación es local (MVP). No se envían credenciales a ningún servidor.
        </p>
      </div>
    </main>
  );
}
