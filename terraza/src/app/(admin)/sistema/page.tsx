'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbStats {
  usuarios: number;
  credentials: Array<{ id: string; userId: string; userName: string; createdAt: number; updatedAt: number }>;
  uploads: {
    total: number;
    byCaso: Record<string, number>;
    byEstado: Record<string, number>;
    byFuente: Record<string, number>;
  };
  commitQueue: { pending: number; committed: number; synced: number; error: number };
}

interface ApiHealthEntry {
  endpoint: string;
  status: number | null;
  ok: boolean;
  latencyMs: number | null;
  error?: string;
}

interface ApiHealth {
  endpoints: ApiHealthEntry[];
  externalSources?: SourceHealthEntry[];
}

interface QAHallazgo {
  tipo: 'info' | 'advertencia' | 'error';
  area: 'base_datos' | 'api' | 'corpus' | 'seguridad';
  mensaje: string;
  recomendacion?: string;
}

interface QAResult {
  score: number;
  nivel: 'OK' | 'ADVERTENCIA' | 'CRÍTICO';
  resumen: string;
  provider?: 'openrouter' | 'openclaw';
  hallazgos: QAHallazgo[];
  timestamp: string;
}

interface SourceHealthEntry {
  sourceId: string;
  label: string;
  tipo: 'oficial' | 'academica' | 'periodistica';
  criticidad: 'alta' | 'media' | 'baja';
  estado: 'mvp' | 'fase-2' | 'deprecated';
  active: boolean;
  endpoint: string;
  method: 'web' | 'rss' | 'api' | 'scraping' | 'manual' | 'discovery';
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  error?: string;
  checkedAt: string;
  lastSuccessAt?: string | null;
  failureCount: number;
  circuitOpen: boolean;
}

interface SourcesResponse {
  health: SourceHealthEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CASO_LABELS: Record<string, string> = {
  '1': 'SURA',
  '2': 'La Negra',
  '3': 'Periodismo',
  '4': 'OIT 169',
};

function nivelColor(nivel: QAResult['nivel']): string {
  if (nivel === 'OK') return 'text-green-700 dark:text-green-400';
  if (nivel === 'ADVERTENCIA') return 'text-yellow-700 dark:text-yellow-400';
  return 'text-red-700 dark:text-red-400';
}

function scoreBar(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-400';
  return 'bg-red-500';
}

function hallazgoIcon(tipo: QAHallazgo['tipo']): string {
  if (tipo === 'error') return '✗';
  if (tipo === 'advertencia') return '⚠';
  return 'ℹ';
}

function hallazgoClass(tipo: QAHallazgo['tipo']): string {
  if (tipo === 'error') return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30';
  if (tipo === 'advertencia') return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30';
  return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30';
}

// ─── Section components ───────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
      {children}
    </h2>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function DBSection({ stats }: { stats: DbStats }) {
  return (
    <section aria-labelledby="db-heading">
      <SectionHeading>
        <span id="db-heading">Base de datos SQLite</span>
      </SectionHeading>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label="Usuarios" value={stats.usuarios} sub="Solo admin" />
        <StatCard label="Capturas" value={stats.uploads.total} />
        <StatCard label="Pendientes commit" value={stats.commitQueue.pending} />
        <StatCard label="Errores queue" value={stats.commitQueue.error} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Usuarios */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Credenciales registradas</p>
          {stats.credentials.length === 0 ? (
            <p className="text-sm text-gray-400">Sin usuarios</p>
          ) : (
            <ul className="space-y-1">
              {stats.credentials.map((c) => (
                <li key={c.id} className="text-sm flex justify-between gap-2">
                  <span className="font-mono text-gray-800 dark:text-gray-200">{c.userName}</span>
                  <span className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('es-CL')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Por caso */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Capturas por caso</p>
          {Object.entries(stats.uploads.byCaso).length === 0 ? (
            <p className="text-sm text-gray-400">Sin capturas</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(stats.uploads.byCaso).map(([caso, count]) => (
                <li key={caso} className="text-sm flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{CASO_LABELS[caso] ?? `Caso ${caso}`}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Por estado */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Por estado GT</p>
          {Object.entries(stats.uploads.byEstado).length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(stats.uploads.byEstado).map(([estado, count]) => (
                <li key={estado} className="text-sm flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{estado}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cola de commits */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Cola de commits</p>
          <ul className="space-y-1">
            {(Object.entries(stats.commitQueue) as [string, number][]).map(([k, v]) => (
              <li key={k} className="text-sm flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{k}</span>
                <span className={`font-medium ${k === 'error' && v > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function APIHealthSection({ health }: { health: ApiHealth }) {
  return (
    <section aria-labelledby="api-heading">
      <SectionHeading>
        <span id="api-heading">Estado de APIs</span>
      </SectionHeading>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Endpoint</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Latencia</th>
            </tr>
          </thead>
          <tbody>
            {health.endpoints.map((ep) => (
              <tr key={ep.endpoint} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                <td className="px-4 py-2 font-mono text-gray-700 dark:text-gray-300">{ep.endpoint}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`inline-flex items-center gap-1 font-medium ${ep.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {ep.ok ? '✓' : '✗'} {ep.status ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-gray-500">{ep.latencyMs != null ? `${ep.latencyMs}ms` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SourcesSection({
  sources,
  loading,
  onRefresh,
  onAction,
}: {
  sources: SourceHealthEntry[] | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onAction: (action: 'test' | 'retry' | 'toggle', sourceId: string, active?: boolean) => Promise<void>;
}) {
  return (
    <section aria-labelledby="sources-heading">
      <div className="flex items-center justify-between mb-3">
        <SectionHeading>
          <span id="sources-heading">Fuentes públicas (Administrador de APIs)</span>
        </SectionHeading>
        <Button type="button" variant="secondary" disabled={loading} onClick={onRefresh}>
          {loading ? <span className="flex items-center gap-2"><Spinner size="sm" /> Actualizando…</span> : 'Actualizar fuentes'}
        </Button>
      </div>
      {!sources ? (
        <p className="text-sm text-gray-400">Presiona &ldquo;Actualizar fuentes&rdquo; para ver conectividad externa.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Fuente</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Estado</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Latencia</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.sourceId} className="border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{source.label}</p>
                    <p className="text-xs text-gray-500">{source.sourceId} · {source.tipo} · {source.estado}</p>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`inline-flex items-center gap-1 font-medium ${source.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {source.ok ? '✓' : '✗'} {source.status ?? '—'}
                    </span>
                    {source.circuitOpen && (
                      <p role="status" aria-live="polite" className="text-[11px] text-red-500">circuito abierto</p>
                    )}
                    {!!source.error && source.error !== 'desactivada' && (
                      <p className="text-[11px] text-gray-500">{source.error}</p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">{source.latencyMs != null ? `${source.latencyMs}ms` : '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        className="text-xs underline text-gray-600 hover:text-gray-900 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                        aria-label={`Probar conexión de ${source.label}`}
                        onClick={() => void onAction('test', source.sourceId)}
                      >
                        test
                      </button>
                      <button
                        type="button"
                        className="text-xs underline text-gray-600 hover:text-gray-900 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                        aria-label={`Reintentar conexión de ${source.label}`}
                        onClick={() => void onAction('retry', source.sourceId)}
                      >
                        reintentar
                      </button>
                      <button
                        type="button"
                        className="text-xs underline text-gray-600 hover:text-gray-900 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
                        aria-label={`${source.active ? 'Desactivar' : 'Activar'} ${source.label}`}
                        onClick={() => void onAction('toggle', source.sourceId, !source.active)}
                      >
                        {source.active ? 'desactivar' : 'activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function QASection({ result, loading, onRun }: { result: QAResult | null; loading: boolean; onRun: () => Promise<void> }) {
  return (
    <section aria-labelledby="qa-heading">
      <div className="flex items-center justify-between mb-3">
        <SectionHeading>
          <span id="qa-heading">QA Nivel 1 — Claude via OpenRouter</span>
        </SectionHeading>
        <Button
          type="button"
          variant="primary"
          disabled={loading}
          onClick={onRun}
          aria-describedby={result ? 'qa-result-summary' : undefined}
        >
          {loading ? (
            <span className="flex items-center gap-2"><Spinner size="sm" /> Analizando…</span>
          ) : (
            'Ejecutar QA'
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score bar */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <p id="qa-result-summary" className={`text-lg font-bold ${nivelColor(result.nivel)}`}>
                {result.nivel} — {result.score}/100
              </p>
              <time className="text-xs text-gray-400">{new Date(result.timestamp).toLocaleString('es-CL')}</time>
            </div>
            {result.provider && (
              <p className="text-xs text-gray-500 mb-2">Proveedor IA: {result.provider}</p>
            )}
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreBar(result.score)}`}
                style={{ width: `${result.score}%` }}
                role="progressbar"
                aria-valuenow={result.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Score QA: ${result.score} de 100`}
              />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{result.resumen}</p>
          </div>

          {/* Hallazgos */}
          {result.hallazgos.length > 0 && (
            <ul className="space-y-2" aria-label="Hallazgos QA">
              {result.hallazgos.map((h, i) => (
                <li key={i} className={`rounded-lg border p-3 ${hallazgoClass(h.tipo)}`}>
                  <div className="flex gap-2">
                    <span aria-hidden="true" className="shrink-0 text-sm">{hallazgoIcon(h.tipo)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase mr-2">[{h.area}]</span>
                        {h.mensaje}
                      </p>
                      {h.recomendacion && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{h.recomendacion}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!result && !loading && (
        <p className="text-sm text-gray-400">
          Ejecuta el QA para recibir un análisis automático del estado del sistema via Claude (OpenRouter).
        </p>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SistemaPage(): React.ReactElement {
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [sources, setSources] = useState<SourceHealthEntry[] | null>(null);

  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [loadingQa, setLoadingQa] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);

  const [dbError, setDbError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  const fetchDb = useCallback(async () => {
    setLoadingDb(true);
    setDbError(null);
    try {
      const res = await fetch('/api/admin/db-stats');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDbStats((await res.json()) as DbStats);
    } catch (e) {
      setDbError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingDb(false);
    }
  }, []);

  const fetchApi = useCallback(async () => {
    setLoadingApi(true);
    setApiError(null);
    try {
      const res = await fetch('/api/admin/api-health');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setApiHealth((await res.json()) as ApiHealth);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingApi(false);
    }
  }, []);

  const runQa = useCallback(async () => {
    setLoadingQa(true);
    setQaError(null);
    try {
      const res = await fetch('/api/admin/qa-run', { method: 'POST' });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? `Error ${res.status}`);
      }
      setQaResult((await res.json()) as QAResult);
    } catch (e) {
      setQaError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingQa(false);
    }
  }, []);

  const fetchSources = useCallback(async () => {
    setLoadingSources(true);
    setSourcesError(null);
    try {
      const res = await fetch('/api/admin/sources');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const payload = (await res.json()) as SourcesResponse;
      setSources(payload.health);
    } catch (e) {
      setSourcesError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingSources(false);
    }
  }, []);

  const sourceAction = useCallback(
    async (action: 'test' | 'retry' | 'toggle', sourceId: string, active?: boolean) => {
      setLoadingSources(true);
      setSourcesError(null);
      try {
        const res = await fetch('/api/admin/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, sourceId, active }),
        });
        if (!res.ok) {
          const d = (await res.json()) as { error?: string };
          throw new Error(d.error ?? `Error ${res.status}`);
        }
        await fetchSources();
      } catch (e) {
        setSourcesError(e instanceof Error ? e.message : 'Error');
      } finally {
        setLoadingSources(false);
      }
    },
    [fetchSources],
  );

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualización de la BD, estado de APIs y QA automatizado Nivel 1.
        </p>
        <p className="mt-2">
          <a
            href="/sistema/agregar-dispositivo"
            className="text-sm text-accent-700 hover:underline"
          >
            Agregar dispositivo administrativo →
          </a>
        </p>
      </header>

      {/* DB Stats */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeading>Base de datos</SectionHeading>
          <Button
            type="button"
            variant="secondary"
            disabled={loadingDb}
            onClick={fetchDb}
          >
            {loadingDb ? <span className="flex items-center gap-2"><Spinner size="sm" /> Cargando…</span> : 'Actualizar BD'}
          </Button>
        </div>
        {dbError && (
          <p role="alert" className="text-sm text-red-600 mb-3">{dbError}</p>
        )}
        {dbStats ? (
          <DBSection stats={dbStats} />
        ) : (
          <p className="text-sm text-gray-400">Presiona &ldquo;Actualizar BD&rdquo; para cargar las estadísticas.</p>
        )}
      </section>

      {/* API Health */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <SectionHeading>APIs</SectionHeading>
          <Button
            type="button"
            variant="secondary"
            disabled={loadingApi}
            onClick={fetchApi}
          >
            {loadingApi ? <span className="flex items-center gap-2"><Spinner size="sm" /> Verificando…</span> : 'Verificar APIs'}
          </Button>
        </div>
        {apiError && (
          <p role="alert" className="text-sm text-red-600 mb-3">{apiError}</p>
        )}
        {apiHealth ? (
          <APIHealthSection health={apiHealth} />
        ) : (
          <p className="text-sm text-gray-400">Presiona &ldquo;Verificar APIs&rdquo; para ver el estado de los endpoints.</p>
        )}
      </section>

      {/* QA */}
      {qaError && (
        <p role="alert" className="text-sm text-red-600">{qaError}</p>
      )}
      <QASection result={qaResult} loading={loadingQa} onRun={runQa} />

      {/* Sources admin */}
      {sourcesError && (
        <p role="alert" className="text-sm text-red-600">{sourcesError}</p>
      )}
      <SourcesSection
        sources={sources}
        loading={loadingSources}
        onRefresh={fetchSources}
        onAction={sourceAction}
      />
    </div>
  );
}
