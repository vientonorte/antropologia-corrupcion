'use client';

import { useState, useEffect } from 'react';
import { KanbanGT } from '@/components/organisms/KanbanGT';
import { Spinner } from '@/components/atoms/Spinner';

interface KanbanCard {
  id: string;
  fileName: string;
  casoId: 1 | 2 | 3 | 4;
  regimenVerdad: string;
  fuenteTipo: string;
  transcription: string | null;
  estadoCodificacion: string;
  createdAt: number;
}

interface GroupedUploads {
  open: KanbanCard[];
  axial: KanbanCard[];
  selective: KanbanCard[];
  verificado: KanbanCard[];
}

export default function CodificacionPage(): React.ReactElement {
  const [data, setData] = useState<GroupedUploads | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/corpus/by-estado');
        if (!res.ok) throw new Error('No se pudo cargar el corpus');
        const json = await res.json() as { grouped: GroupedUploads };
        setData(json.grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de carga');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const total = data
    ? data.open.length + data.axial.length + data.selective.length + data.verificado.length
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Codificación Grounded Theory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Arrastra capturas entre columnas para avanzar en la codificación
          </p>
        </div>
        {!isLoading && data && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {total} captura{total !== 1 ? 's' : ''} en proceso
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center flex-1 gap-3" aria-busy="true">
          <Spinner size="md" />
          <span className="text-sm text-gray-500">Cargando corpus…</span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && !isLoading && total === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Aún no hay capturas con análisis.</p>
            <a href="/corpus" className="text-accent-700 hover:underline">
              Analizar capturas en el corpus →
            </a>
          </div>
        </div>
      )}

      {data && !isLoading && total > 0 && (
        <div className="flex-1 min-h-0">
          <KanbanGT initialData={data} />
        </div>
      )}
    </div>
  );
}
