/**
 * Buscador.tsx
 * Buscador de fricción institucional — React port de searchEngine.js (UI).
 * La lógica de scoring se mantiene como función pura importada.
 */

import { useState, useEffect, useMemo } from 'react';
import { normalizeStr, FRICTION_MARKERS } from '../engines/frictionEngine';
import type { CasosJSON, Caso } from '../types/casos';

const FUENTE_ICONS: Record<string, string> = {
  bcn: '🏛', infolobby: '🏛', sii: '🧾', transparencia: '🔍',
  leychile: '⚖', seia: '🌿', compraspublicas: '📋', cmf: '💹',
};

const FUENTE_LABELS: Record<string, string> = {
  bcn: 'BCN Tramitación', infolobby: 'InfoLobby', sii: 'SII',
  transparencia: 'Transparencia', leychile: 'LeyChile',
  seia: 'SEIA', compraspublicas: 'ComprasPúblicas', cmf: 'CMF',
};

interface FuenteRecord {
  id: string;
  titulo: string;
  fuente: string;
  fecha?: string;
  resumen?: string;
  keywords: string[];
  tipo_friccion?: string;
  url?: string;
}

interface FuentesJSON {
  registros?: FuenteRecord[];
  [key: string]: unknown;
}

function scoreRecord(record: FuenteRecord, casos: Caso[]): number {
  const regKw = record.keywords.flatMap((s) => normalizeStr(s).split(/\s+/)).filter(Boolean);
  const casoKw = casos.flatMap((c) => [
    ...(c.etica?.keywords ?? []),
    ...(c.institucional?.keywords ?? []),
    ...(c.material?.keywords ?? []),
  ]).flatMap((s) => normalizeStr(s).split(/\s+/)).filter(Boolean);

  const setB = new Set(casoKw);
  const overlap = regKw.filter((k) => setB.has(k)).length / Math.max(regKw.length, casoKw.length, 1);
  const overlapScore = 1 - Math.min(overlap * 6, 1);

  let maxPeso = 0;
  for (const m of FRICTION_MARKERS) {
    const hasA = regKw.some((k) => k.includes(normalizeStr(m.a)));
    const hasB = casoKw.some((k) => k.includes(normalizeStr(m.b)));
    if (hasA && hasB && m.peso > maxPeso) maxPeso = m.peso;
  }

  return Math.min(Math.max(overlapScore * 0.5 + maxPeso * 0.3, 0.05), 1.0);
}

function frictionTip(score: number): string {
  if (score >= 0.85) return `Fricción ${score.toFixed(2)} — Crítica: traducción imposible sin violencia epistemológica`;
  if (score >= 0.65) return `Fricción ${score.toFixed(2)} — Alta: los marcos no se tocan`;
  if (score >= 0.45) return `Fricción ${score.toFixed(2)} — Media: coexisten con tensión`;
  return `Fricción ${score.toFixed(2)} — Baja: lenguajes compatibles`;
}

export default function Buscador() {
  const [query, setQuery] = useState('');
  const [fuentes, setFuentes] = useState<FuenteRecord[]>([]);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? '/';
    Promise.all([
      fetch(`${base}data/fuentes-oficiales.json`).then((r) => r.ok ? r.json() as Promise<FuentesJSON> : { registros: [] }),
      fetch(`${base}data/casos.json`).then((r) => r.ok ? r.json() as Promise<CasosJSON> : { casos: [] }),
    ]).then(([fuentesData, casosData]) => {
      setFuentes(fuentesData.registros ?? []);
      setCasos(casosData.casos ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || !fuentes.length) return fuentes;
    const q = normalizeStr(query);
    return fuentes
      .filter((r) => {
        const text = normalizeStr([r.titulo, r.resumen ?? '', ...r.keywords].join(' '));
        return text.includes(q);
      })
      .sort((a, b) => scoreRecord(b, casos) - scoreRecord(a, casos));
  }, [query, fuentes, casos]);

  return (
    <main className="ca-buscador-main" id="main" tabIndex={-1}>
      <div className="ca-buscador-header">
        <h1 className="ca-buscador-title">Buscador de Fricción Institucional</h1>
        <p className="ca-buscador-sub">
          Cruza fuentes oficiales chilenas con el modelo de fricción epistemológica del contra-archivo.
        </p>
      </div>

      <div className="ca-buscador-search" role="search" aria-label="Buscar en fuentes oficiales">
        <input
          type="search"
          className="ca-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en BCN, CMF, SEIA, Transparencia…"
          aria-label="Término de búsqueda"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="ca-empty-state">
          <span aria-hidden="true">⊕</span>
          <p>Cargando fuentes…</p>
        </div>
      ) : results.length === 0 ? (
        <div className="ca-empty-state" aria-live="polite">
          <span aria-hidden="true">∅</span>
          <p>{query ? `Sin resultados para "${query}"` : 'Escribe para buscar.'}</p>
        </div>
      ) : (
        <ol className="ca-search-results" aria-label={`${results.length} resultados`} aria-live="polite">
          {results.map((r) => {
            const score = scoreRecord(r, casos);
            const tip = frictionTip(score);
            const icon = FUENTE_ICONS[r.fuente] ?? '📄';
            const label = FUENTE_LABELS[r.fuente] ?? r.fuente;

            return (
              <li key={r.id} className="ca-result-item">
                <div className="ca-result-header">
                  <span className="ca-result-fuente">
                    <span aria-hidden="true">{icon}</span> {label}
                  </span>
                  <span
                    className="ca-result-score"
                    title={tip}
                    aria-label={tip}
                    style={{ color: score >= 0.65 ? '#cc4444' : score >= 0.45 ? '#d09000' : '#7a9e6e' }}
                  >
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
                <h2 className="ca-result-titulo">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">{r.titulo}</a>
                  ) : r.titulo}
                </h2>
                {r.resumen && <p className="ca-result-resumen">{r.resumen}</p>}
                {r.keywords.length > 0 && (
                  <div className="ca-result-keywords" aria-label="Palabras clave">
                    {r.keywords.map((kw) => (
                      <span key={kw} className="ca-result-kw">{kw}</span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
