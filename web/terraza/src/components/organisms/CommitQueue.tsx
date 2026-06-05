'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

interface CommitEntry {
  id: string;
  uploadId: string;
  commitHash: string | null;
  status: 'pending' | 'committed' | 'synced' | 'error';
  errorMessage: string | null;
  createdAt: number;
}

interface RemoteStatus {
  ahead: number;
  behind: number;
}

interface SyncStatusResponse {
  pending: CommitEntry[];
  remoteStatus: RemoteStatus;
}

const STATUS_LABELS: Record<CommitEntry['status'], string> = {
  pending: 'Pendiente',
  committed: 'Commiteado — esperando push',
  synced: 'Sincronizado',
  error: 'Error',
};

const STATUS_COLORS: Record<CommitEntry['status'], string> = {
  pending: 'bg-gray-100 text-gray-700',
  committed: 'bg-amber-100 text-amber-800',
  synced: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
};

export function CommitQueue() {
  const [entries, setEntries] = useState<CommitEntry[]>([]);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>({ ahead: 0, behind: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/corpus/sync-status');
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setFetchError(d.error ?? 'Error al verificar sync');
        return;
      }
      const data = await res.json() as SyncStatusResponse;
      setEntries(data.pending);
      setRemoteStatus(data.remoteStatus);
      setFetchError(null);
    } catch {
      setFetchError('Error de red al verificar sincronización');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    // Poll every 30s to detect GitHub Desktop push
    const interval = setInterval(() => void fetchStatus(), 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500" aria-busy="true">
        <Spinner size="sm" />
        <span>Comprobando sincronización…</span>
      </div>
    );
  }

  if (entries.length === 0 && !fetchError) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        No hay commits pendientes.
      </p>
    );
  }

  const committedCount = entries.filter((e) => e.status === 'committed').length;

  return (
    <div className="space-y-4">
      {committedCount > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
        >
          <span className="text-amber-600 mt-0.5" aria-hidden="true">⚠</span>
          <div>
            <p className="font-medium text-amber-800">
              {committedCount} commit{committedCount > 1 ? 's' : ''} pendiente{committedCount > 1 ? 's' : ''} de push
            </p>
            <p className="text-amber-700 mt-0.5">
              Abre GitHub Desktop para hacer push al repo privado.
            </p>
          </div>
        </div>
      )}

      {remoteStatus.behind > 0 && (
        <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-200">
          El repo local está {remoteStatus.behind} commit{remoteStatus.behind > 1 ? 's' : ''} detrás del remoto.
        </p>
      )}

      {entries.length > 0 && (
        <ul className="space-y-2" aria-label="Cola de commits">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg bg-white"
            >
              <div className="min-w-0">
                <p className="text-xs font-mono text-gray-600 truncate">
                  {entry.commitHash ? entry.commitHash.slice(0, 8) : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {entry.errorMessage && (
                  <p className="text-xs text-red-700 mt-1">{entry.errorMessage}</p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status]}`}
              >
                {STATUS_LABELS[entry.status]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() => void fetchStatus()}
        className="w-full text-sm"
        aria-label="Verificar estado de sincronización con el repositorio remoto"
      >
        Verificar sync
      </Button>

      {fetchError && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          {fetchError}
        </p>
      )}
    </div>
  );
}
