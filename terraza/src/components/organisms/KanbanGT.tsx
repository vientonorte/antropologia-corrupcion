'use client';

import { useState, useCallback } from 'react';
import { CASOS } from '@/lib/corpus/cases';

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

type GTEstado = 'open' | 'axial' | 'selective' | 'verificado';

const COLUMNS: { id: GTEstado; label: string; description: string; color: string }[] = [
  { id: 'open',      label: 'Open',      description: 'Códigos descriptivos del dato',     color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30' },
  { id: 'axial',     label: 'Axial',     description: 'Categorías y relaciones causales',  color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30' },
  { id: 'selective', label: 'Selective', description: 'Integración hacia categoría central', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' },
  { id: 'verificado',label: 'Verificado', description: 'Codificación revisada y aprobada', color: 'border-green-400 bg-green-50 dark:bg-green-950/30' },
];

function casoLabel(casoId: 1 | 2 | 3 | 4): string {
  return Object.values(CASOS).find((c) => c.id === casoId)?.label ?? `Caso ${casoId}`;
}

interface KanbanGTProps {
  initialData: GroupedUploads;
  onMoved?: (uploadId: string, newEstado: GTEstado) => void;
}

export function KanbanGT({ initialData, onMoved }: KanbanGTProps) {
  const [columns, setColumns] = useState<GroupedUploads>(initialData);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<GTEstado | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const moveCard = useCallback(async (cardId: string, from: GTEstado, to: GTEstado) => {
    if (from === to) return;

    // Optimistic update
    setColumns((prev) => {
      const card = prev[from].find((c) => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        [from]: prev[from].filter((c) => c.id !== cardId),
        [to]: [{ ...card, estadoCodificacion: to }, ...prev[to]],
      };
    });

    setMovingId(cardId);
    setError(null);

    try {
      const res = await fetch('/api/corpus/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: cardId, estadoCodificacion: to }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Update failed');
      }
      if (onMoved) onMoved(cardId, to);
    } catch (err) {
      // Rollback
      setColumns((prev) => {
        const card = prev[to].find((c) => c.id === cardId);
        if (!card) return prev;
        return {
          ...prev,
          [to]: prev[to].filter((c) => c.id !== cardId),
          [from]: [{ ...card, estadoCodificacion: from }, ...prev[from]],
        };
      });
      setError(err instanceof Error ? err.message : 'Error al mover la tarjeta');
    } finally {
      setMovingId(null);
    }
  }, [onMoved]);

  const handleDragStart = (e: React.DragEvent, cardId: string, from: GTEstado) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('from', from);
    setDraggingId(cardId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, col: GTEstado) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const handleDrop = (e: React.DragEvent, to: GTEstado) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const from = e.dataTransfer.getData('from') as GTEstado;
    setDragOverCol(null);
    if (cardId && from) void moveCard(cardId, from, to);
  };

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map((col) => {
          const cards = columns[col.id];
          const isOver = dragOverCol === col.id;

          return (
            <section
              key={col.id}
              aria-label={`Columna ${col.label} — ${cards.length} capturas`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`
                flex flex-col rounded-lg border-2 transition-colors
                ${col.color}
                ${isOver ? 'ring-2 ring-offset-1 ring-blue-400' : ''}
              `}
            >
              {/* Column header */}
              <div className="p-3 border-b border-black/10 dark:border-white/10">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{col.label}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{col.description}</p>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1 inline-block">
                  {cards.length} {cards.length === 1 ? 'captura' : 'capturas'}
                </span>
              </div>

              {/* Cards */}
              <ul
                className="flex-1 overflow-y-auto p-2 space-y-2"
                aria-label={`Capturas en ${col.label}`}
              >
                {cards.map((card) => (
                  <li key={card.id}>
                    <article
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                      onDragEnd={handleDragEnd}
                      aria-label={`${card.fileName} — arrastrar para cambiar estado`}
                      className={`
                        p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700
                        cursor-grab active:cursor-grabbing select-none
                        transition-opacity shadow-sm
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
                        ${draggingId === card.id ? 'opacity-40' : 'hover:shadow-md'}
                        ${movingId === card.id ? 'opacity-60' : ''}
                      `}
                    >
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {card.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {casoLabel(card.casoId)}
                      </p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                          {card.regimenVerdad}
                        </span>
                      </div>
                      {card.transcription && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 italic">
                          {card.transcription.slice(0, 80)}…
                        </p>
                      )}
                    </article>
                  </li>
                ))}
                {cards.length === 0 && (
                  <li className="text-xs text-gray-400 dark:text-gray-600 text-center py-4 italic">
                    Vacío — arrastra capturas aquí
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
