import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { injectCSPMeta, vientonorteCSP } from '@vientonorte/security';
import '@vientonorte/tokens/css';
import './styles/app.css';
import App from './App';

// CSP — contra-archivo: fetch a /data/*.json (mismo origen), WebAuthn
injectCSPMeta({
  ...vientonorteCSP,
  scriptSrc: [...(vientonorteCSP.scriptSrc ?? []), "'self'"],
  connectSrc: [...(vientonorteCSP.connectSrc ?? []), "'self'"],
});

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró #root en el DOM');

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
