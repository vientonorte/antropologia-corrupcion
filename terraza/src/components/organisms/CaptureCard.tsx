'use client';

import { useState } from 'react';
import { CASOS } from '@/lib/corpus/cases';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';

interface CaptureCardProps {
  upload: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    casoId: 1 | 2 | 3 | 4;
    fuenteTipo: string;
    regimenVerdad: string;
    estadoCodificacion: string;
    fechaEvento: string | null;
    tags: string | null;
    transcription: string | null;
    createdAt: number;
  };
  onAnalyzed?: (uploadId: string) => void;
  onCommitted?: (uploadId: string) => void;
  onSelect?: (uploadId: string) => void;
  isSelected?: boolean;
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  open: 'Open',
  axial: 'Axial',
  selective: 'Selective',
  verificado: 'Verificado',
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-700',
  open: 'bg-blue-100 text-blue-700',
  axial: 'bg-purple-100 text-purple-700',
  selective: 'bg-amber-100 text-amber-700',
  verificado: 'bg-green-100 text-green-700',
};

const ANALYSIS_TAGS = [
  { value: 'semantico', label: 'Semántico' },
  { value: 'gt', label: 'Grounded Theory' },
  { value: 'mistranslation', label: 'Mistranslation' },
  { value: 'todo', label: 'Completo (3 análisis)' },
] as const;

function casoLabel(casoId: 1 | 2 | 3 | 4): string {
  const caso = Object.values(CASOS).find((c) => c.id === casoId);
  return caso?.label ?? `Caso ${casoId}`;
}

export function CaptureCard({ upload, onAnalyzed, onCommitted, onSelect, isSelected = false }: CaptureCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [analysisTag, setAnalysisTag] = useState<string>('semantico');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/corpus/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: upload.id, analysisTag }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? 'Analysis failed');
      }
      if (onAnalyzed) onAnalyzed(upload.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCommitting(true);
    setError(null);
    try {
      const response = await fetch('/api/corpus/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: upload.id }),
      });
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? 'Commit failed');
      }
      if (onCommitted) onCommitted(upload.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commit failed');
    } finally {
      setIsCommitting(false);
    }
  };

  const tags = upload.tags ? (JSON.parse(upload.tags) as string[]) : [];
  const sizeMB = (upload.fileSize / 1024 / 1024).toFixed(2);
  const estado = upload.estadoCodificacion;

  return (
    <article
      className={`
        rounded-lg border p-4 transition-colors cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={() => onSelect?.(upload.id)}
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{upload.fileName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{casoLabel(upload.casoId)}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_COLORS[estado] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {ESTADO_LABELS[estado] ?? estado}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3 text-xs text-gray-600">
        <span className="bg-gray-100 px-2 py-0.5 rounded">{upload.regimenVerdad}</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded">{upload.fuenteTipo}</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded">{sizeMB} MB</span>
        {upload.fechaEvento && (
          <span className="bg-gray-100 px-2 py-0.5 rounded">{upload.fechaEvento}</span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {upload.transcription && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 italic">
          {upload.transcription.slice(0, 120)}…
        </p>
      )}

      {estado === 'pendiente' && (
        <div
          className="flex gap-2 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={analysisTag}
            onChange={(e) => setAnalysisTag(e.target.value)}
            disabled={isAnalyzing}
            aria-label="Tipo de análisis"
            className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          >
            {ANALYSIS_TAGS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="text-xs px-3 py-1.5"
          >
            {isAnalyzing ? <Spinner size="sm" /> : 'Analizar'}
          </Button>
        </div>
      )}

      {/* Commit button for analyzed captures */}
      {estado !== 'pendiente' && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="outline"
            disabled={isCommitting}
            onClick={handleCommit}
            className="w-full text-xs py-1.5"
            aria-label={`Commitear captura ${upload.fileName} al repo privado`}
          >
            {isCommitting ? (
              <span className="flex items-center justify-center gap-1.5">
                <Spinner size="sm" />
                Commiteando…
              </span>
            ) : (
              'Commitear al repo'
            )}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">{error}</p>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {new Date(upload.createdAt).toLocaleDateString('es-CL')}
      </p>
    </article>
  );
}
