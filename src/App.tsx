import { Routes, Route, NavLink } from 'react-router-dom';
import ContraArchivo from './pages/ContraArchivo';
import Buscador from './pages/Buscador';
import Login from './pages/Login';

function Nav() {
  return (
    <nav className="ca-nav" aria-label="Navegación principal">
      <NavLink className="ca-nav__brand" to="/" aria-label="Contra-Archivo — Inicio">
        <span className="ca-nav__logo" aria-hidden="true">Ω</span>
        <span className="ca-nav__title">Contra-Archivo</span>
        <span className="ca-nav__badge">Tesis Doctoral</span>
      </NavLink>
      <div className="ca-nav__links">
        <NavLink
          className={({ isActive }) => `ca-nav__link${isActive ? ' active' : ''}`}
          to="/grafo"
        >
          Grafo ⊕
        </NavLink>
        <NavLink
          className={({ isActive }) => `ca-nav__link${isActive ? ' active' : ''}`}
          to="/buscador"
        >
          Buscador
        </NavLink>
        <NavLink
          className={({ isActive }) => `ca-nav__link ca-nav__link--login${isActive ? ' active' : ''}`}
          to="/login"
        >
          Acceso
        </NavLink>
      </div>
    </nav>
  );
}

function NotFound() {
  return (
    <main className="ca-loading" id="main" tabIndex={-1}>
      <div className="ca-empty-state">
        <span className="ca-empty-state__icon" aria-hidden="true">∅</span>
        <p>Página no encontrada.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <a href="#main" className="vn-skip-link">Saltar al contenido principal</a>
      <Nav />
      <Routes>
        <Route path="/" element={<ContraArchivo />} />
        <Route path="/grafo" element={<ContraArchivo />} />
        <Route path="/buscador" element={<Buscador />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
