'use client';

import { useState, useEffect, useCallback } from 'react';
import { CaptureCard } from '@/components/organisms/CaptureCard';
import { AnalysisPanel } from '@/components/organisms/AnalysisPanel';
import { Spinner } from '@/components/atoms/Spinner';
import type { UploadRecord } from '@/lib/db/uploads';

export default function CorpusPage(): React.ReactElement {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    try {
      const response = await fetch('/api/corpus/list');
      if (!response.ok) throw new Error('Failed to load corpus');
      const data = await response.json() as { uploads: UploadRecord[] };
      setUploads(data.uploads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load corpus');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUploads();
  }, [fetchUploads]);

  const selectedUpload = uploads.find((u) => u.id === selectedId) ?? null;

  const handleAnalyzed = (uploadId: string) => {
    setSelectedId(uploadId);
    void fetchUploads();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" aria-busy="true">
        <Spinner size="lg" />
        <span className="sr-only">Cargando corpus…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left: capture list */}
      <aside className="w-80 shrink-0 overflow-y-auto" aria-label="Lista de capturas">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Corpus</h1>
          <span className="text-sm text-gray-500">{uploads.length} capturas</span>
        </div>

        {uploads.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aún no hay capturas. Sube la primera desde{' '}
            <a href="/upload" className="text-blue-600 hover:underline">Subir captura</a>.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Capturas del corpus">
            {uploads.map((upload) => (
              <li key={upload.id}>
                <CaptureCard
                  upload={upload}
                  isSelected={selectedId === upload.id}
                  onSelect={setSelectedId}
                  onAnalyzed={handleAnalyzed}
                />
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Right: analysis panel */}
      <main className="flex-1 min-w-0 overflow-hidden" aria-label="Panel de análisis">
        {selectedUpload ? (
          <div className="h-full bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
            <AnalysisPanel
              upload={selectedUpload}
              onSaved={() => void fetchUploads()}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">
              Selecciona una captura para ver y editar su análisis
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
