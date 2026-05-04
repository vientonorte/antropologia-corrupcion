'use client';

import { useState, useEffect } from 'react';
import { ForceGraph } from '@/components/organisms/ForceGraph';
import { Spinner } from '@/components/atoms/Spinner';
import type { GraphData } from '@/app/api/corpus/graph-data/route';

export default function GrafoPage(): React.ReactElement {
  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/corpus/graph-data');
        if (!res.ok) throw new Error('No se pudo cargar el grafo');
        const json = await res.json() as GraphData;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de carga');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleExport = () => {
    const a = document.createElement('a');
    a.href = '/api/corpus/export';
    a.download = `corpus-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grafo de correlaciones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Nodos = capturas · aristas = tags compartidos · tamaño = estado GT
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data.nodes.length} nodos · {data.edges.length} aristas
            </span>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Exportar corpus completo como JSON"
          >
            Exportar corpus
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center flex-1 gap-3" aria-busy="true">
          <Spinner size="md" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Construyendo grafo…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm"
        >
          {error}
        </div>
      )}

      {data && !isLoading && data.nodes.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">No hay capturas con tags para mostrar en el grafo.</p>
            <a href="/corpus" className="text-accent-700 hover:underline">
              Añadir tags en el corpus →
            </a>
          </div>
        </div>
      )}

      {data && !isLoading && data.nodes.length > 0 && (
        <div className="flex-1 min-h-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-950">
          <ForceGraph nodes={data.nodes} edges={data.edges} />
        </div>
      )}
    </div>
  );
}
